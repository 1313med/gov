const Booking = require("../models/Booking");
const RentalListing = require("../models/RentalListing");
const Notification = require("../models/Notification");
const User = require("../models/User");
const emailService = require("../utils/emailService");
const { emitNotification } = require("../utils/socketManager");

const notify = async (userId, message, type) => {
  const n = await Notification.create({ user: userId, message, type });
  emitNotification(userId.toString(), n);
};

// ── State machine ─────────────────────────────────────────────────────────────
// Defines which status transitions the OWNER is allowed to trigger.
const OWNER_VALID_TRANSITIONS = {
  pending:   ["confirmed", "rejected"],
  confirmed: ["completed"],
  rejected:  [],
  cancelled: [],
  completed: [],
};

// ── CUSTOMER – My bookings ────────────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id, deletedAt: null })
      .populate("rentalId")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) { next(error); }
};

// ── RENTAL OWNER – Paginated bookings for my rentals ─────────────────────────
exports.getBookingsForOwner = async (req, res, next) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const status = req.query.status && req.query.status !== "all"
      ? req.query.status
      : null;

    // 1. Resolve this owner's rental IDs
    const rentals = await RentalListing.find({
      rentalOwnerId: req.user._id,
      deletedAt: null,
    }).select("_id");
    const rentalIds = rentals.map((r) => r._id);

    if (!rentalIds.length) {
      return res.json({
        bookings: [],
        total: 0,
        pages: 0,
        page: 1,
        stats: { total: 0, pending: 0, confirmed: 0, completed: 0, revenue: 0 },
      });
    }

    // 2. Aggregated stats over ALL bookings (not paginated — needed for header cards)
    const [statsResult] = await Booking.aggregate([
      { $match: { rentalId: { $in: rentalIds }, deletedAt: null } },
      {
        $group: {
          _id: null,
          total:     { $sum: 1 },
          pending:   { $sum: { $cond: [{ $eq: ["$status", "pending"] },   1, 0] } },
          confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          revenue:   { $sum: { $cond: ["$isPaid", "$totalAmount", 0] } },
        },
      },
    ]);
    const stats = statsResult
      ? {
          total:     statsResult.total,
          pending:   statsResult.pending,
          confirmed: statsResult.confirmed,
          completed: statsResult.completed,
          revenue:   statsResult.revenue,
        }
      : { total: 0, pending: 0, confirmed: 0, completed: 0, revenue: 0 };

    // 3. Build paginated query filter
    const filter = { rentalId: { $in: rentalIds }, deletedAt: null };
    if (status) filter.status = status;

    const total = await Booking.countDocuments(filter);
    const pages = Math.ceil(total / limit) || 0;

    const bookings = await Booking.find(filter)
      .populate("rentalId", "title pricePerDay city images")
      .populate("customerId", "name phone email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ bookings, total, pages, page, stats });
  } catch (error) { next(error); }
};

// ── RENTAL OWNER – Update booking status (confirm / reject / complete) ────────
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null })
      .populate("rentalId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ── State machine check ─────────────────────────────────────────────────
    const allowed = OWNER_VALID_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot change a "${booking.status}" booking to "${status}"`,
      });
    }

    if (status === "confirmed") {
      // Prevent double-booking
      const conflict = await Booking.findOne({
        rentalId: booking.rentalId._id,
        status: "confirmed",
        _id: { $ne: booking._id },
        startDate: { $lt: booking.endDate },
        endDate:   { $gt: booking.startDate },
        deletedAt: null,
      });
      if (conflict) {
        return res.status(400).json({ message: "This car is already booked for these dates" });
      }

      // Auto-reject overlapping pending bookings
      const overlappingPending = await Booking.find({
        rentalId: booking.rentalId._id,
        status: "pending",
        _id: { $ne: booking._id },
        startDate: { $lt: booking.endDate },
        endDate:   { $gt: booking.startDate },
        deletedAt: null,
      });

      if (overlappingPending.length > 0) {
        await Promise.all(
          overlappingPending.map(async (overlap) => {
            overlap.status = "rejected";
            await overlap.save();
            await notify(
              overlap.customerId,
              `Your booking request for "${booking.rentalId.title}" was not available — the owner confirmed another booking for those dates.`,
              "rejected"
            );
          })
        );
      }
    }

    booking.status = status;
    await booking.save();

    const customer = await User.findById(booking.customerId);
    const rental   = booking.rentalId;

    if (status === "confirmed") {
      await notify(booking.customerId, `Your booking for "${rental.title}" has been confirmed.`, "approved");
      if (customer?.email) emailService.sendBookingConfirmed(booking, rental, customer).catch(() => {});
    } else if (status === "rejected") {
      await notify(booking.customerId, `Your booking for "${rental.title}" was rejected.`, "rejected");
      if (customer?.email) emailService.sendBookingRejected(booking, rental, customer).catch(() => {});
    } else if (status === "completed") {
      await notify(booking.customerId, `Your rental of "${rental.title}" is now marked as completed. Thank you!`, "approved");
    }

    res.json(booking);
  } catch (error) { next(error); }
};

// ── CUSTOMER – Cancel own booking ─────────────────────────────────────────────
// Cancel-policy rules (applied only to CONFIRMED bookings — pending = always free):
//   flexible : free cancellation if startDate > 24 h away
//   moderate : 50 % penalty if startDate ≤ 48 h away
//   strict   : no refund if startDate ≤ 72 h away
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null })
      .populate("rentalId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({ message: "This booking cannot be cancelled" });
    }

    // Evaluate cancel policy for confirmed bookings only
    let penaltyMessage = null;
    if (booking.status === "confirmed" && booking.rentalId?.cancelPolicy) {
      const hoursUntilStart = (new Date(booking.startDate) - new Date()) / 3600000;
      const policy = booking.rentalId.cancelPolicy;

      if (policy === "flexible" && hoursUntilStart <= 24) {
        return res.status(400).json({
          message: "Cancellation not allowed — this rental requires cancellation at least 24 hours before pickup.",
        });
      }
      if (policy === "moderate" && hoursUntilStart <= 48) {
        penaltyMessage = "A 50% penalty applies per the moderate cancellation policy.";
      }
      if (policy === "strict" && hoursUntilStart <= 72) {
        return res.status(400).json({
          message: "Cancellation not allowed — this rental's strict policy requires 72+ hours notice.",
        });
      }
    }

    booking.status      = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    const ownerMsg = penaltyMessage
      ? `A booking for "${booking.rentalId.title}" was cancelled by the customer. ${penaltyMessage}`
      : `A booking for "${booking.rentalId.title}" was cancelled by the customer.`;

    await notify(booking.rentalId.rentalOwnerId, ownerMsg, "pending");

    res.json({ booking, penaltyMessage });
  } catch (error) { next(error); }
};

// ── RENTAL OWNER – Update condition photos & documents ───────────────────────
exports.updateBookingMedia = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null })
      .populate("rentalId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const { conditionPhotos, documents } = req.body;
    if (conditionPhotos) booking.conditionPhotos = conditionPhotos;
    if (documents)       booking.documents       = documents;
    await booking.save();
    res.json(booking);
  } catch (error) { next(error); }
};

// ── RENTAL OWNER – Toggle payment status ─────────────────────────────────────
exports.markBookingPaid = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null })
      .populate("rentalId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    booking.isPaid = !booking.isPaid;
    booking.paidAt = booking.isPaid ? new Date() : null;
    await booking.save();
    res.json(booking);
  } catch (error) { next(error); }
};

// ── RENTAL OWNER – Update booking dates (Drag & Resize in calendar) ──────────
exports.updateBookingDates = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null })
      .populate("rentalId");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const start = new Date(startDate);
    const end   = new Date(endDate);
    if (isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const conflict = await Booking.findOne({
      rentalId: booking.rentalId._id,
      status: "confirmed",
      _id: { $ne: booking._id },
      startDate: { $lt: end },
      endDate:   { $gt: start },
      deletedAt: null,
    });
    if (conflict) return res.status(400).json({ message: "Dates conflict with another confirmed booking" });

    booking.startDate = start;
    booking.endDate   = end;
    await booking.save();

    res.json(booking);
  } catch (error) { next(error); }
};
