const Booking = require("../models/Booking");
const RentalListing = require("../models/RentalListing");

/*
|--------------------------------------------------------------------------
| CUSTOMER – My bookings
|--------------------------------------------------------------------------
*/
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      customerId: req.user._id,
    })
      .populate("rentalId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| RENTAL OWNER – Bookings for my rentals
|--------------------------------------------------------------------------
*/
exports.getBookingsForOwner = async (req, res, next) => {
  try {
    const rentals = await RentalListing.find({
      rentalOwnerId: req.user._id,
    }).select("_id");

    const rentalIds = rentals.map((r) => r._id);

    const bookings = await Booking.find({
      rentalId: { $in: rentalIds },
    })
      .populate("rentalId")
      .populate("customerId", "name phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| RENTAL OWNER – Update booking status
|--------------------------------------------------------------------------
*/
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate("rentalId");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.rentalId.rentalOwnerId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    if (status === "confirmed") {
      const conflictingBooking = await Booking.findOne({
        rentalId: booking.rentalId._id,
        status: "confirmed",
        _id: { $ne: booking._id },
        startDate: { $lt: booking.endDate },
        endDate: { $gt: booking.startDate },
      });

      if (conflictingBooking) {
        return res.status(400).json({
          message:
            "This car is already booked for these dates",
        });
      }
    }

    booking.status = status;

    await booking.save();

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

/*
|--------------------------------------------------------------------------
| RENTAL OWNER – Update booking dates (Drag & Resize)
|--------------------------------------------------------------------------
*/
exports.updateBookingDates = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate("rentalId");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.rentalId.rentalOwnerId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return res.status(400).json({
        message: "Invalid dates",
      });
    }

    const conflict = await Booking.findOne({
      rentalId: booking.rentalId._id,
      status: "confirmed",
      _id: { $ne: booking._id },
      startDate: { $lt: end },
      endDate: { $gt: start },
    });

    if (conflict) {
      return res.status(400).json({
        message: "Dates conflict with another booking",
      });
    }

    booking.startDate = start;
    booking.endDate = end;

    await booking.save();

    res.json(booking);
  } catch (error) {
    next(error);
  }
};