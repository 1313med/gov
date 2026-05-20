const Booking = require("../models/Booking");
const RentalListing = require("../models/RentalListing");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { emitNotification } = require("../utils/socketManager");
const { computeBookingTotalForRental } = require("../utils/bookingPricing");

const notify = async (userId, message, type, bookingId = null) => {
  const n = await Notification.create({ user: userId, message, type, bookingId });
  emitNotification(userId.toString(), n);
};

// ── POST /api/extensions/:bookingId ──────────────────────────────────────────
// Customer requests to extend an active/confirmed booking
exports.requestExtension = async (req, res, next) => {
  try {
    const { newEndDate } = req.body;
    if (!newEndDate) return res.status(400).json({ message: "newEndDate is required" });

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customerId: req.user._id,
      status: "confirmed",
      deletedAt: null,
    }).populate("rentalId");

    if (!booking) return res.status(404).json({ message: "Active booking not found" });
    if (booking.extensionRequest?.status === "pending") {
      return res.status(409).json({ message: "An extension request is already pending for this booking" });
    }

    const newEnd = new Date(newEndDate);
    if (newEnd <= new Date(booking.endDate)) {
      return res.status(400).json({ message: "New end date must be after the current end date" });
    }

    // Check for conflicts on the extended period
    const conflict = await Booking.findOne({
      rentalId: booking.rentalId._id,
      status: "confirmed",
      _id: { $ne: booking._id },
      startDate: { $lt: newEnd },
      endDate:   { $gt: booking.endDate },
      deletedAt: null,
    });
    if (conflict) {
      return res.status(409).json({ message: "The car is already booked during the requested extension period" });
    }

    // Check owner-blocked availability
    const isBlocked = booking.rentalId.availability?.some((r) => {
      const bStart = new Date(r.startDate);
      const bEnd   = new Date(r.endDate);
      return new Date(booking.endDate) < bEnd && newEnd > bStart;
    });
    if (isBlocked) {
      return res.status(409).json({ message: "The owner has blocked dates in your extension period" });
    }

    // Compute extra cost for the extension period only
    const rental = booking.rentalId;
    const extensionDays = Math.ceil((newEnd - new Date(booking.endDate)) / 86400000);
    const extraAmount   = rental.pricePerDay * extensionDays;

    booking.extensionRequest = {
      newEndDate:  newEnd,
      extraAmount,
      status:      "pending",
      requestedAt: new Date(),
    };
    await booking.save();

    await notify(
      rental.rentalOwnerId,
      `${req.user.name} requested a ${extensionDays}-day extension (until ${newEnd.toISOString().slice(0, 10)}) for "${rental.title}". Extra: ${extraAmount} MAD.`,
      "pending",
      booking._id
    );

    res.json({ message: "Extension request sent to owner", booking });
  } catch (err) { next(err); }
};

// ── PUT /api/extensions/:bookingId/respond ────────────────────────────────────
// Owner approves or rejects an extension request
exports.respondExtension = async (req, res, next) => {
  try {
    const { decision } = req.body;
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
    }

    const booking = await Booking.findOne({ _id: req.params.bookingId, deletedAt: null })
      .populate("rentalId", "title rentalOwnerId pricePerDay");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (booking.extensionRequest?.status !== "pending") {
      return res.status(400).json({ message: "No pending extension request on this booking" });
    }

    booking.extensionRequest.status = decision;

    if (decision === "approved") {
      booking.endDate      = booking.extensionRequest.newEndDate;
      booking.totalAmount  = (booking.totalAmount || 0) + (booking.extensionRequest.extraAmount || 0);
    }
    await booking.save();

    const msg = decision === "approved"
      ? `Your extension request for "${booking.rentalId.title}" was approved. New return: ${new Date(booking.endDate).toISOString().slice(0, 10)}.`
      : `Your extension request for "${booking.rentalId.title}" was declined by the owner.`;

    await notify(booking.customerId, msg, decision === "approved" ? "approved" : "rejected", booking._id);

    res.json({ message: `Extension ${decision}`, booking });
  } catch (err) { next(err); }
};
