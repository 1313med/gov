const CustomerFeedback = require("../models/CustomerFeedback");
const Booking         = require("../models/Booking");
const RentalListing   = require("../models/RentalListing");

// POST /api/customer-feedback
exports.submitFeedback = async (req, res) => {
  try {
    const {
      bookingId, overall, hadDamage, returnedOnTime,
      carReturnedClean, wasRespectful, wouldRentAgain, note,
    } = req.body;

    if (!bookingId || overall === undefined) {
      return res.status(400).json({ message: "bookingId and overall are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Feedback can only be added to completed bookings" });
    }

    // Verify the rental belongs to the requesting owner
    const rental = await RentalListing.findById(booking.rentalId);
    if (!rental || rental.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const feedback = await CustomerFeedback.findOneAndUpdate(
      { bookingId },
      {
        bookingId,
        customerId: booking.customerId,
        ownerId:    req.user._id,
        rentalId:   booking.rentalId,
        overall,
        hadDamage:        Boolean(hadDamage),
        returnedOnTime:   Boolean(returnedOnTime),
        carReturnedClean: Boolean(carReturnedClean),
        wasRespectful:    Boolean(wasRespectful),
        wouldRentAgain:   Boolean(wouldRentAgain),
        note: note || "",
      },
      { upsert: true, new: true }
    );

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/customer-feedback/booking/:bookingId
exports.getFeedbackForBooking = async (req, res) => {
  try {
    const feedback = await CustomerFeedback.findOne({ bookingId: req.params.bookingId });
    res.json(feedback || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/customer-feedback/customer/:customerId
// Returns all feedback + summary stats for a customer (only if they booked one of your cars)
exports.getFeedbackForCustomer = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    const rentals = await RentalListing.find({
      rentalOwnerId: req.user._id,
      deletedAt: null,
    }).select("_id");
    const rentalIds = rentals.map((r) => r._id);
    if (!rentalIds.length) {
      return res.status(403).json({ message: "No rentals found for your account." });
    }

    const linked = await Booking.exists({
      customerId,
      rentalId: { $in: rentalIds },
      deletedAt: null,
    });
    if (!linked) {
      return res.status(403).json({
        message: "You can only view this history for customers who have booked your vehicles.",
      });
    }

    const feedbacks = await CustomerFeedback.find({ customerId })
      .populate("ownerId",  "name")
      .populate("rentalId", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    const total              = feedbacks.length;
    const goodCount          = feedbacks.filter((f) => f.overall === "good").length;
    const damageCount        = feedbacks.filter((f) => f.hadDamage).length;
    const lateCount          = feedbacks.filter((f) => !f.returnedOnTime).length;
    const wouldRentAgainCount = feedbacks.filter((f) => f.wouldRentAgain).length;

    res.json({
      feedbacks,
      summary: { total, goodCount, badCount: total - goodCount, damageCount, lateCount, wouldRentAgainCount },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
