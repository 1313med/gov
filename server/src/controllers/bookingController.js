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
    // 1️⃣ Find rentals owned by this owner
    const rentals = await RentalListing.find({
      rentalOwnerId: req.user._id,
    }).select("_id");

    const rentalIds = rentals.map((r) => r._id);

    // 2️⃣ Find bookings for those rentals
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

    // Make sure this booking belongs to this rental owner
    if (
      booking.rentalId.rentalOwnerId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    booking.status = status;
    await booking.save();

    res.json(booking);
  } catch (error) {
    next(error);
  }
};
