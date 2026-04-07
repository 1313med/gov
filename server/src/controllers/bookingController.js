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

// CUSTOMER – My bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user._id })
      .populate("rentalId")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) { next(error); }
};

// RENTAL OWNER – Bookings for my rentals
exports.getBookingsForOwner = async (req, res, next) => {
  try {
    const rentals = await RentalListing.find({ rentalOwnerId: req.user._id }).select("_id");
    const rentalIds = rentals.map((r) => r._id);

    const bookings = await Booking.find({ rentalId: { $in: rentalIds } })
      .populate("rentalId")
      .populate("customerId", "name phone email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) { next(error); }
};

// RENTAL OWNER – Update booking status (confirm / reject / complete)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id).populate("rentalId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (status === "confirmed") {
      const conflict = await Booking.findOne({
        rentalId: booking.rentalId._id,
        status: "confirmed",
        _id: { $ne: booking._id },
        startDate: { $lt: booking.endDate },
        endDate: { $gt: booking.startDate },
      });
      if (conflict) {
        return res.status(400).json({ message: "This car is already booked for these dates" });
      }
    }

    booking.status = status;
    await booking.save();

    // Fetch customer for email
    const customer = await User.findById(booking.customerId);
    const rental = booking.rentalId;

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

// CUSTOMER – Cancel own booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("rentalId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!["pending", "confirmed"].includes(booking.status)) {
      return res.status(400).json({ message: "This booking cannot be cancelled" });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    // Notify owner
    const rental = booking.rentalId;
    await notify(
      rental.rentalOwnerId,
      `A booking for "${rental.title}" was cancelled by the customer.`,
      "pending"
    );

    res.json(booking);
  } catch (error) { next(error); }
};

// RENTAL OWNER – Update condition photos & documents
exports.updateBookingMedia = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("rentalId");
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

// RENTAL OWNER – Toggle payment status
exports.markBookingPaid = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("rentalId");
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

// RENTAL OWNER – Update booking dates (Drag & Resize)
exports.updateBookingDates = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const booking = await Booking.findById(req.params.id).populate("rentalId");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.rentalId.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return res.status(400).json({ message: "Invalid dates" });

    const conflict = await Booking.findOne({
      rentalId: booking.rentalId._id,
      status: "confirmed",
      _id: { $ne: booking._id },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });
    if (conflict) return res.status(400).json({ message: "Dates conflict with another booking" });

    booking.startDate = start;
    booking.endDate = end;
    await booking.save();

    res.json(booking);
  } catch (error) { next(error); }
};
