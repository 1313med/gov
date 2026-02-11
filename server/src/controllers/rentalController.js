const RentalListing = require("../models/RentalListing");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");

// =======================
// Create rental listing
// =======================
exports.createRental = async (req, res, next) => {
  try {
    const {
      title,
      description,
      pricePerDay,
      city,
      brand,
      model,
      year,
      mileage,
      fuel,
      gearbox,
      images,
      availability,
    } = req.body;

    if (!title || !pricePerDay || !city || !brand || !model || !year) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const rental = await RentalListing.create({
      rentalOwnerId: req.user._id,
      title,
      description,
      pricePerDay,
      city,
      brand,
      model,
      year,
      mileage,
      fuel,
      gearbox,
      images: images || [],
      availability: availability || [],
      status: "pending",
    });

    res.status(201).json(rental);
  } catch (error) {
    next(error);
  }
};

// =======================
// Public rentals
// =======================
exports.getRentals = async (req, res, next) => {
  try {
    const { city, minPrice, maxPrice, startDate, endDate } = req.query;

    const query = { status: "approved" };

    if (city) query.city = city;

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    let rentals = await RentalListing.find(query);

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const conflicts = await Booking.find({
        status: "confirmed",
        $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }],
      }).select("rentalId");

      const blockedIds = conflicts.map((b) =>
        b.rentalId.toString()
      );

      rentals = rentals.filter(
        (r) => !blockedIds.includes(r._id.toString())
      );
    }

    res.json(rentals);
  } catch (error) {
    next(error);
  }
};

// =======================
// Rental details
// =======================
exports.getRentalById = async (req, res, next) => {
  try {
    const rental = await RentalListing.findOne({
      _id: req.params.id,
      status: "approved",
    });

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    res.json(rental);
  } catch (error) {
    next(error);
  }
};

// =======================
// Create booking (customer)
// =======================
exports.createBooking = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const rentalId = req.params.id;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!startDate || !endDate || end <= start) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const rental = await RentalListing.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    const conflict = await Booking.findOne({
      rentalId,
      status: "confirmed",
      $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }],
    });

    if (conflict) {
      return res
        .status(400)
        .json({ message: "Already booked for these dates" });
    }

    const booking = await Booking.create({
      rentalId,
      customerId: req.user._id,
      startDate,
      endDate,
      status: "pending",
    });

    // 🔔 Notify owner (pending request)
    await Notification.create({
      user: rental.rentalOwnerId,
      message: `New booking request for "${rental.title}"`,
      type: "pending",
    });

    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

// =======================
// Update booking status (owner)
// =======================
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    await booking.save();

    const rental = await RentalListing.findById(booking.rentalId);

    // 🔔 Notify customer
    await Notification.create({
      user: booking.customerId,
      message: `Your booking for "${rental.title}" was ${status}`,
      type: status === "confirmed" ? "approved" : "pending",
    });

    res.json(booking);
  } catch (error) {
    next(error);
  }
};

// =======================
// Rental owner bookings
// =======================
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const rentals = await RentalListing.find({
      rentalOwnerId: req.user._id,
    }).select("_id");

    const rentalIds = rentals.map((r) => r._id);

    const bookings = await Booking.find({
      rentalId: { $in: rentalIds },
    })
      .populate("rentalId", "title pricePerDay city")
      .populate("customerId", "name phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// =======================
// Admin
// =======================
exports.getAdminRentals = async (req, res, next) => {
  try {
    const rentals = await RentalListing.find();
    res.json(rentals);
  } catch (error) {
    next(error);
  }
};

exports.updateRentalStatus = async (req, res, next) => {
  try {
    const rental = await RentalListing.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: "Not found" });

    rental.status = req.body.status;
    await rental.save();

    res.json(rental);
  } catch (error) {
    next(error);
  }
};
