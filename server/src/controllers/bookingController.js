const Booking = require("../models/Booking");
const BookingCustomerReview = require("../models/BookingCustomerReview");
const RentalListing = require("../models/RentalListing");
const Notification = require("../models/Notification");
const User = require("../models/User");
const emailService = require("../utils/emailService");
const { processEndedConfirmedBookings } = require("../utils/bookingLifecycle");
const { computeBookingTotalForRental } = require("../utils/bookingPricing");
const { emitNotification } = require("../utils/socketManager");

/** Customer may cancel with refund info only this many hours before pickup. */
const CUSTOMER_CANCEL_REFUND_MIN_HOURS = 48;
/** Also allow refund cancel if pickup is at least this many local calendar days after today (covers e.g. “day after tomorrow” when wall-clock is just under 48h). */
const CUSTOMER_CANCEL_REFUND_MIN_CALENDAR_DAYS = 2;
/** Processing fee deducted from refunded amount (percent of what they paid). */
const CUSTOMER_CANCEL_FEE_PERCENT = 4;

function hoursUntilPickup(startDate) {
  return (new Date(startDate).getTime() - Date.now()) / 3600000;
}

/** Local calendar days from today to pickup day (0 = today, 1 = tomorrow). */
function calendarDaysUntilPickupDay(startDate) {
  const s = new Date(startDate);
  const startDay = new Date(s.getFullYear(), s.getMonth(), s.getDate());
  const n = new Date();
  const today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.round((startDay.getTime() - today.getTime()) / 86400000);
}

function vehiclePhase(booking) {
  return booking.vehicleResolutionPhase || "none";
}

const notify = async (userId, message, type, bookingId = null) => {
  const n = await Notification.create({ user: userId, message, type, bookingId });
  emitNotification(userId.toString(), n);
};

// ── CUSTOMER – Confirm car return ─────────────────────────────────────────────
exports.confirmReturn = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user._id,
      deletedAt: null,
    }).populate("rentalId", "title rentalOwnerId");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!["confirmed", "expired"].includes(booking.status)) {
      return res.status(400).json({ message: "Only active or ended bookings can be marked as returned" });
    }
    if (booking.customerConfirmedReturn) {
      return res.status(400).json({ message: "You already confirmed the return" });
    }

    booking.customerConfirmedReturn = true;
    await booking.save();

    // Notify the owner
    const carTitle  = booking.rentalId?.title || "the car";
    const ownerId   = booking.rentalId?.rentalOwnerId;
    if (ownerId) {
      await notify(
        ownerId,
        `${req.user.name} confirmed they returned "${carTitle}". Don't forget to rate this customer!`,
        "feedback_request",
        booking._id,
      );
    }

    res.json({ message: "Return confirmed", booking });
  } catch (err) { next(err); }
};

// ── State machine ─────────────────────────────────────────────────────────────
// Defines which status transitions the OWNER is allowed to trigger.
const OWNER_VALID_TRANSITIONS = {
  pending:   ["confirmed", "rejected"],
  confirmed: ["completed"],
  expired:   ["completed"],
  rejected:  [],
  cancelled: [],
  completed: [],
};

// ── CUSTOMER – My bookings ────────────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    await processEndedConfirmedBookings({ customerId: req.user._id });
    const bookings = await Booking.find({ customerId: req.user._id, deletedAt: null })
      .populate("rentalId")
      .sort({ createdAt: -1 })
      .lean();
    const ids = bookings.map((b) => b._id);
    if (ids.length) {
      const reviews = await BookingCustomerReview.find({ bookingId: { $in: ids } })
        .select("bookingId")
        .lean();
      const has = new Set(reviews.map((r) => String(r.bookingId)));
      bookings.forEach((b) => {
        b.hasCustomerBookingReview = has.has(String(b._id));
      });
    }
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
        stats: {
          total: 0,
          pending: 0,
          confirmed: 0,
          expired: 0,
          completed: 0,
          rejected: 0,
          cancelled: 0,
          revenue: 0,
          newPending: 0,
        },
      });
    }

    await processEndedConfirmedBookings({ rentalIdIn: rentalIds });

    // 2. Aggregated stats over ALL bookings (not paginated — needed for header cards)
    const [statsResult] = await Booking.aggregate([
      { $match: { rentalId: { $in: rentalIds }, deletedAt: null } },
      {
        $group: {
          _id: null,
          total:     { $sum: 1 },
          pending:   { $sum: { $cond: [{ $eq: ["$status", "pending"] },   1, 0] } },
          confirmed: { $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] } },
          expired:   { $sum: { $cond: [{ $eq: ["$status", "expired"] },   1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
          rejected:  { $sum: { $cond: [{ $eq: ["$status", "rejected"] },  1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] } },
          revenue:   { $sum: { $cond: ["$isPaid", "$totalAmount", 0] } },
        },
      },
    ]);
    const newPending = await Booking.countDocuments({
      rentalId: { $in: rentalIds },
      deletedAt: null,
      status: "pending",
      isNewForOwner: true,
    });
    const stats = statsResult
      ? {
          total:     statsResult.total,
          pending:   statsResult.pending,
          confirmed: statsResult.confirmed,
          expired:   statsResult.expired,
          completed: statsResult.completed,
          rejected:  statsResult.rejected,
          cancelled: statsResult.cancelled,
          revenue:   statsResult.revenue,
          newPending,
        }
      : {
          total: 0,
          pending: 0,
          confirmed: 0,
          expired: 0,
          completed: 0,
          rejected: 0,
          cancelled: 0,
          revenue: 0,
          newPending: 0,
        };

    // 3. Build paginated query filter
    // archive=exclude (default): hide owner-archived completed rows from the active list
    // archive=only: archived completed only
    // archive=include: legacy — all rows (no archive filter)
    const archiveMode = String(req.query.archive || "exclude").toLowerCase();
    const filter = { rentalId: { $in: rentalIds }, deletedAt: null };

    if (archiveMode === "only") {
      filter.status = "completed";
      filter.ownerArchivedAt = { $ne: null };
    } else if (archiveMode === "include") {
      if (status) filter.status = status;
    } else {
      if (status === "completed") {
        filter.status = "completed";
        filter.ownerArchivedAt = null;
      } else if (status) {
        filter.status = status;
      } else {
        filter.$or = [
          { status: { $ne: "completed" } },
          { ownerArchivedAt: null },
        ];
      }
    }

    const total = await Booking.countDocuments(filter);
    const pages = Math.ceil(total / limit) || 0;

    const bookings = await Booking.find(filter)
      .populate(
        "rentalId",
        "title pricePerDay city images airportDeliveryOffered airportDeliveryFeeMad"
      )
      .populate(
        "customerId",
        "name phone email city avatar driverLicense nationalId"
      )
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
    if (status === "confirmed" || status === "rejected") {
      booking.isNewForOwner = false;
    }
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
// Pending: always allowed. Confirmed: refund cancel if pickup is ≥48h away OR
// pickup date is at least CUSTOMER_CANCEL_REFUND_MIN_CALENDAR_DAYS after today
// (local). Otherwise one-time reschedule may apply on the calendar day before pickup.
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

    if (booking.status === "confirmed") {
      if (new Date(booking.startDate).getTime() <= Date.now()) {
        return res.status(400).json({
          message: "Pickup has already started or passed; cancellation here is not available.",
        });
      }
      const hBlock = hoursUntilPickup(booking.startDate);
      if (booking.customerDateChangeUsed && hBlock > 0 && hBlock <= 24) {
        return res.status(400).json({
          code: "BOOKING_NO_FURTHER_CHANGES",
          message:
            "You already used your one-time date change close to pickup. Online cancellation is no longer available for this booking.",
        });
      }
      const cal = calendarDaysUntilPickupDay(booking.startDate);
      if (booking.customerDateChangeUsed && cal >= 0 && cal <= 1) {
        return res.status(400).json({
          code: "BOOKING_NO_FURTHER_CHANGES",
          message:
            "You already used your one-time date change. No further changes or online cancellation — your booking is set for pickup today or tomorrow.",
        });
      }
      const h = hoursUntilPickup(booking.startDate);
      const canRefundCancelOnline =
        h >= CUSTOMER_CANCEL_REFUND_MIN_HOURS || cal >= CUSTOMER_CANCEL_REFUND_MIN_CALENDAR_DAYS;
      if (!canRefundCancelOnline) {
        const dayBeforePickup =
          cal === 1 && !booking.customerDateChangeUsed && h > 0;
        return res.status(400).json({
          code: "CANCEL_TOO_CLOSE",
          message:
            h <= 24
              ? dayBeforePickup
                ? "Within 24 hours of pickup, cancellation is not refundable. You may use \"Change dates\" once if the car is available on your new dates."
                : "Within 24 hours of pickup, cancellation is not refundable."
              : dayBeforePickup
                ? "Less than 48 hours before pickup, online cancellation is not available. You may use \"Change dates\" once if the car is available."
                : "Less than 48 hours before pickup, online cancellation is not available.",
          canRescheduleOnce: dayBeforePickup,
        });
      }
    }

    const wasPending = booking.status === "pending";
    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    const title = booking.rentalId?.title || "your rental";
    const paid = Math.max(0, Number(booking.totalAmount) || 0);
    const feePct = wasPending ? 0 : CUSTOMER_CANCEL_FEE_PERCENT;
    const estimatedRefund = wasPending
      ? 0
      : Math.max(0, Math.round(paid * (1 - feePct / 100) * 100) / 100);

    const ownerMsg = wasPending
      ? `A pending booking for "${title}" was withdrawn by the customer.`
      : `A booking for "${title}" was cancelled by the customer. If payment applies, estimated refund after ${feePct}% processing fee: about ${estimatedRefund} MAD (${paid} MAD paid).`;

    await notify(booking.rentalId.rentalOwnerId, ownerMsg, "pending", booking._id);

    res.json({
      booking,
      cancellation: {
        transactionFeePercent: feePct,
        paidAmountMad: paid,
        estimatedRefundMad: estimatedRefund,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── CUSTOMER – One-time date change before pickup ───────────────────────────
exports.customerRescheduleBooking = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null }).populate(
      "rentalId",
      "title rentalOwnerId pricePerDay availability offers deletedAt status"
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({ message: "This booking cannot be rescheduled" });
    }
    if (booking.customerDateChangeUsed) {
      return res.status(400).json({
        code: "RESCHEDULE_ALREADY_USED",
        message: "You have already used your one-time date change for this booking.",
      });
    }
    if (new Date(booking.startDate).getTime() <= Date.now()) {
      return res.status(400).json({ message: "Pickup has already started; dates cannot be changed here." });
    }

    if (calendarDaysUntilPickupDay(booking.startDate) !== 1) {
      return res.status(400).json({
        code: "RESCHEDULE_NOT_IN_WINDOW",
        message:
          "Date changes are only allowed on the calendar day before pickup. Earlier, you can cancel (if eligible) and book again.",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (!startDate || !endDate || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const rental = booking.rentalId;
    if (!rental || rental.deletedAt != null) {
      return res.status(400).json({ message: "Rental is no longer available" });
    }
    if (rental.status !== "approved") {
      return res.status(400).json({ message: "This listing is not bookable" });
    }

    const conflict = await Booking.findOne({
      rentalId: rental._id,
      status: "confirmed",
      _id: { $ne: booking._id },
      startDate: { $lt: end },
      endDate: { $gt: start },
      deletedAt: null,
    });
    if (conflict) {
      return res.status(400).json({ message: "Another booking already holds these dates. Try other dates." });
    }

    const isBlocked = rental.availability?.some((r) => {
      const bStart = new Date(r.startDate);
      const bEnd = new Date(r.endDate);
      return start < bEnd && end > bStart;
    });
    if (isBlocked) {
      return res.status(400).json({
        message: "The owner has blocked these dates. Pick different dates.",
      });
    }

    const { totalAmount, appliedOffer } = computeBookingTotalForRental(rental, start, end);

    const fmt = (d) => new Date(d).toISOString().slice(0, 10);
    const prevStart = fmt(booking.startDate);
    const prevEnd = fmt(booking.endDate);
    const nextStart = fmt(start);
    const nextEnd = fmt(end);

    booking.startDate = start;
    booking.endDate = end;
    booking.totalAmount = totalAmount;
    booking.appliedOfferTitle = appliedOffer?.title || null;
    booking.customerDateChangeUsed = true;
    await booking.save();

    const customer = await User.findById(booking.customerId).select("name");
    const firstName = customer?.name?.trim()?.split(/\s+/)[0] || "A customer";
    await notify(
      rental.rentalOwnerId,
      `${firstName} changed dates for "${rental.title}" (one-time): ${prevStart}→${prevEnd} became ${nextStart}→${nextEnd}. New total about ${totalAmount} MAD.`,
      "pending",
      booking._id
    );

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// ── RENTAL OWNER – Archive / restore completed booking in list ───────────────
exports.setOwnerBookingArchive = async (req, res, next) => {
  try {
    const wantArchive = !!req.body?.archived;
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null }).populate("rentalId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Only completed bookings can be archived" });
    }
    booking.ownerArchivedAt = wantArchive ? new Date() : null;
    await booking.save();
    res.json(booking);
  } catch (error) {
    next(error);
  }
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

// ── RENTAL OWNER – Vehicle unavailable: notify customer (any time before pickup) ─
exports.declareOwnerVehicleIssue = async (req, res, next) => {
  try {
    const note = String(req.body?.note || "").trim().slice(0, 500);
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null }).populate(
      "rentalId",
      "title rentalOwnerId"
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({ message: "This booking cannot be flagged for a vehicle issue" });
    }
    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (vehiclePhase(booking) !== "none") {
      return res.status(400).json({ message: "A resolution flow is already active for this booking" });
    }
    const h = hoursUntilPickup(booking.startDate);
    if (h <= 0) {
      return res.status(400).json({
        message: "Pickup has already started or passed; use another channel with the customer.",
      });
    }

    booking.ownerVehicleIssueAt = new Date();
    booking.ownerVehicleIssueNote = note;
    booking.vehicleResolutionPhase = "awaiting_customer";
    await booking.save();

    const title = booking.rentalId?.title || "a vehicle";
    await notify(
      booking.customerId,
      `The owner reported "${title}" may not be available for your dates (damage / not ready). Open My bookings to choose a refund or another car from the same owner.`,
      "vehicle_issue",
      booking._id
    );

    const populated = await Booking.findById(booking._id)
      .populate("rentalId")
      .populate("customerId", "name phone email");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// ── CUSTOMER – List same-owner alternatives for same dates ───────────────────
exports.getAlternativeRentalsForBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null }).populate(
      "rentalId",
      "rentalOwnerId title"
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (vehiclePhase(booking) !== "awaiting_customer") {
      return res.status(400).json({ message: "Alternative cars are not available for selection on this booking" });
    }

    const ownerId = booking.rentalId.rentalOwnerId;
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);

    const rentals = await RentalListing.find({
      rentalOwnerId: ownerId,
      deletedAt: null,
      status: "approved",
      _id: { $ne: booking.rentalId._id },
    }).select("title brand model city images pricePerDay availability offers");

    const alternatives = [];
    for (const rental of rentals) {
      const conflict = await Booking.findOne({
        rentalId: rental._id,
        status: "confirmed",
        startDate: { $lt: end },
        endDate: { $gt: start },
        deletedAt: null,
      });
      if (conflict) continue;

      const isBlocked = rental.availability?.some((r) => {
        const bStart = new Date(r.startDate);
        const bEnd = new Date(r.endDate);
        return start < bEnd && end > bStart;
      });
      if (isBlocked) continue;

      const { totalAmount, appliedOffer } = computeBookingTotalForRental(rental, start, end);
      alternatives.push({
        rental,
        totalAmount,
        appliedOfferTitle: appliedOffer?.title || null,
      });
    }

    res.json({ alternatives });
  } catch (error) {
    next(error);
  }
};

// ── CUSTOMER – Choose refund or swap to another listing ─────────────────────
exports.chooseCustomerVehicleResolution = async (req, res, next) => {
  try {
    const { choice, replacementRentalId } = req.body;
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null }).populate(
      "rentalId",
      "title rentalOwnerId pricePerDay availability offers status deletedAt"
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (vehiclePhase(booking) !== "awaiting_customer") {
      return res.status(400).json({ message: "You cannot change this decision now" });
    }

    if (choice === "refund") {
      const refundMad = Math.max(0, Number(booking.totalAmount) || 0);
      booking.vehicleResolutionPhase = "awaiting_owner_refund";
      booking.vehicleResolutionRefundMad = refundMad;
      await booking.save();

      const ownerId = booking.rentalId.rentalOwnerId;
      await notify(
        ownerId,
        `Customer chose a refund (${refundMad} MAD) after your vehicle issue report. Open Bookings and confirm once you have refunded them.`,
        "refund_pending",
        booking._id
      );

      const populated = await Booking.findById(booking._id).populate("rentalId").populate("customerId", "name phone email");
      return res.json(populated);
    }

    if (choice !== "swap") {
      return res.status(400).json({ message: "Invalid choice" });
    }
    if (!replacementRentalId) {
      return res.status(400).json({ message: "replacementRentalId is required for swap" });
    }

    const newRental = await RentalListing.findOne({
      _id: replacementRentalId,
      deletedAt: null,
      status: "approved",
    });
    if (!newRental) return res.status(404).json({ message: "Replacement listing not found" });
    if (newRental.rentalOwnerId.toString() !== booking.rentalId.rentalOwnerId.toString()) {
      return res.status(400).json({ message: "Replacement must be from the same owner" });
    }
    if (String(newRental._id) === String(booking.rentalId._id || booking.rentalId)) {
      return res.status(400).json({ message: "Pick a different vehicle" });
    }

    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);

    const conflict = await Booking.findOne({
      rentalId: newRental._id,
      status: "confirmed",
      _id: { $ne: booking._id },
      startDate: { $lt: end },
      endDate: { $gt: start },
      deletedAt: null,
    });
    if (conflict) {
      return res.status(400).json({ message: "That car is already booked for these dates" });
    }
    const isBlocked = newRental.availability?.some((r) => {
      const bStart = new Date(r.startDate);
      const bEnd = new Date(r.endDate);
      return start < bEnd && end > bStart;
    });
    if (isBlocked) {
      return res.status(400).json({ message: "That car is blocked on these dates" });
    }

    const preTotal = Math.max(0, Number(booking.totalAmount) || 0);
    const oldRentalId = booking.rentalId._id;
    const { totalAmount, appliedOffer } = computeBookingTotalForRental(newRental, start, end);

    booking.vehicleResolutionPreSwapRentalId = oldRentalId;
    booking.vehicleResolutionPreSwapTotalMad = preTotal;
    booking.rentalId = newRental._id;
    booking.totalAmount = totalAmount;
    booking.appliedOfferTitle = appliedOffer?.title || null;

    const diff = Math.max(0, preTotal - totalAmount);
    if (diff > 0) {
      booking.vehicleResolutionPhase = "awaiting_owner_diff_refund";
      booking.vehicleResolutionRefundMad = diff;
      await booking.save();
      await notify(
        newRental.rentalOwnerId,
        `Customer moved booking to "${newRental.title}". Refund the price difference (${diff} MAD) from Bookings when done.`,
        "refund_pending",
        booking._id
      );
    } else {
      booking.vehicleResolutionPhase = "resolved_swap";
      booking.vehicleResolutionRefundMad = null;
      await booking.save();
    }

    await notify(
      booking.customerId,
      `Your booking was moved to "${newRental.title}" for the same dates.${diff > 0 ? ` The owner owes you ${diff} MAD (difference).` : ""}`,
      "approved",
      booking._id
    );

    const populated = await Booking.findById(booking._id).populate("rentalId").populate("customerId", "name phone email");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// ── RENTAL OWNER – Mark refund (full or difference) as processed ─────────────
exports.ownerConfirmVehicleRefund = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null }).populate(
      "rentalId",
      "title rentalOwnerId"
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const phase = vehiclePhase(booking);
    if (!["awaiting_owner_refund", "awaiting_owner_diff_refund"].includes(phase)) {
      return res.status(400).json({ message: "No pending refund action on this booking" });
    }

    const amt = Math.max(0, Number(booking.vehicleResolutionRefundMad) || 0);
    booking.ownerVehicleRefundConfirmedAt = new Date();
    booking.vehicleResolutionRefundMad = null;

    if (phase === "awaiting_owner_refund") {
      booking.status = "cancelled";
      booking.cancelledAt = new Date();
      booking.vehicleResolutionPhase = "resolved_refund";
      booking.isPaid = false;
      booking.paidAt = null;
      await booking.save();
      await notify(
        booking.customerId,
        `The owner confirmed your refund (${amt} MAD) after the vehicle issue. If you do not see the funds, contact them with your booking reference.`,
        "refund_done",
        booking._id
      );
    } else {
      booking.vehicleResolutionPhase = "resolved_swap";
      await booking.save();
      await notify(
        booking.customerId,
        `The owner confirmed the price difference refund (${amt} MAD) for your updated booking.`,
        "refund_done",
        booking._id
      );
    }

    const populated = await Booking.findById(booking._id).populate("rentalId").populate("customerId", "name phone email");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// ── RENTAL OWNER – Dismiss “new request” highlight on a pending booking ─────
exports.ownerClearBookingNewFlag = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null }).populate(
      "rentalId",
      "rentalOwnerId"
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    booking.isNewForOwner = false;
    await booking.save();
    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// ── CUSTOMER – Post-trip review of rental / owner (one per booking) ──────────
exports.submitBookingCustomerReview = async (req, res, next) => {
  try {
    const { overall, note } = req.body;
    if (!["good", "bad"].includes(overall)) {
      return res.status(400).json({ message: "overall must be \"good\" or \"bad\"" });
    }

    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null }).populate(
      "rentalId",
      "title rentalOwnerId"
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!["expired", "completed"].includes(booking.status)) {
      return res.status(400).json({
        message: "Feedback is only available after the rental period has ended.",
      });
    }

    const existing = await BookingCustomerReview.findOne({ bookingId: booking._id });
    if (existing) {
      return res.status(400).json({ message: "You already submitted feedback for this booking" });
    }

    const rental = booking.rentalId;
    const ownerId = rental.rentalOwnerId;
    const review = await BookingCustomerReview.create({
      bookingId: booking._id,
      customerId: booking.customerId,
      ownerId,
      rentalId: rental._id,
      overall,
      note: typeof note === "string" ? note.slice(0, 1500) : "",
    });

    const cust = await User.findById(booking.customerId).select("name");
    const first = cust?.name?.trim()?.split(/\s+/)[0] || "A customer";
    const title = rental?.title || "a rental";
    await notify(
      ownerId,
      `${first} left feedback for "${title}". Open Bookings to see details.`,
      "customer_rental_review",
      booking._id
    );

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

exports.getBookingCustomerReview = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, deletedAt: null }).populate(
      "rentalId",
      "rentalOwnerId"
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const isOwner =
      booking.rentalId?.rentalOwnerId &&
      booking.rentalId.rentalOwnerId.toString() === req.user._id.toString();

    if (!isCustomer && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const feedback = await BookingCustomerReview.findOne({ bookingId: booking._id }).lean();
    res.json({ feedback: feedback || null });
  } catch (error) {
    next(error);
  }
};
