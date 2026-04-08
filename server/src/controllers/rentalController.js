const RentalListing = require("../models/RentalListing");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");
const emailService = require("../utils/emailService");
const { emitNotification } = require("../utils/socketManager");

const notify = async (userId, message, type) => {
  const n = await Notification.create({ user: userId, message, type });
  emitNotification(userId.toString(), n);
};

// Create rental listing
exports.createRental = async (req, res, next) => {
  try {
    const { title, description, pricePerDay, city, brand, model, year, mileage, fuel, gearbox, color, doors, seats, features, fuelPolicy, cancelPolicy, minRentalDays, images, availability } = req.body;

    if (!title || !pricePerDay || !city || !brand || !model || !year) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const rental = await RentalListing.create({
      rentalOwnerId: req.user._id,
      title, description, pricePerDay, city, brand, model, year, mileage, fuel, gearbox,
      color, doors, seats,
      features: features || [],
      fuelPolicy, cancelPolicy,
      minRentalDays: minRentalDays || 1,
      images: images || [],
      availability: availability || [],
      status: "pending",
    });

    await notify(req.user._id, `Your rental "${rental.title}" is pending approval.`, "pending");
    res.status(201).json(rental);
  } catch (error) { next(error); }
};

// Update rental listing (owner)
exports.updateRental = async (req, res, next) => {
  try {
    const rental = await RentalListing.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: "Rental not found" });
    if (rental.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    delete req.body.status;
    Object.assign(rental, req.body);
    await rental.save();
    res.json(rental);
  } catch (error) { next(error); }
};

// Delete rental listing (owner)
exports.deleteRental = async (req, res, next) => {
  try {
    const rental = await RentalListing.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: "Rental not found" });
    if (rental.rentalOwnerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    await rental.deleteOne();
    res.json({ message: "Rental deleted" });
  } catch (error) { next(error); }
};

// Public rentals with full filtering
exports.getRentals = async (req, res, next) => {
  try {
    const { city, minPrice, maxPrice, startDate, endDate, brand, fuel, gearbox, search } = req.query;

    const query = { status: "approved" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    if (city) query.city = { $regex: city, $options: "i" };
    if (brand) query.brand = { $regex: brand, $options: "i" };
    if (fuel) query.fuel = { $regex: fuel, $options: "i" };
    if (gearbox) query.gearbox = { $regex: gearbox, $options: "i" };

    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }

    let rentals = await RentalListing.find(query).sort({ createdAt: -1 });

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const conflicts = await Booking.find({
        status: "confirmed",
        $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }],
      }).select("rentalId");
      const blockedIds = conflicts.map((b) => b.rentalId.toString());
      rentals = rentals.filter((r) => !blockedIds.includes(r._id.toString()));
    }

    res.json(rentals);
  } catch (error) { next(error); }
};

// Rental details (public)
exports.getRentalById = async (req, res, next) => {
  try {
    const rental = await RentalListing.findOne({ _id: req.params.id, status: "approved" })
      .populate("rentalOwnerId", "name phone city avatar");
    if (!rental) return res.status(404).json({ message: "Rental not found" });
    res.json(rental);
  } catch (error) { next(error); }
};

// Create booking (customer)
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
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    const conflict = await Booking.findOne({
      rentalId,
      status: "confirmed",
      $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }],
    });
    if (conflict) return res.status(400).json({ message: "Already booked for these dates" });

    // Check owner-blocked periods
    const isBlocked = rental.availability?.some((r) => {
      const bStart = new Date(r.startDate);
      const bEnd = new Date(r.endDate);
      return start < bEnd && end > bStart;
    });
    if (isBlocked) {
      return res.status(400).json({
        message: "This car is not available on the selected dates. Please choose other dates.",
      });
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Apply best active offer
    let totalAmount = days * rental.pricePerDay;
    let appliedOffer = null;
    const activeOffers = (rental.offers || []).filter((o) => o.isActive && days >= o.minDays);

    // Pick the offer that gives the biggest saving
    let bestSaving = 0;
    for (const offer of activeOffers) {
      let saving = 0;
      if (offer.type === "free_days") {
        saving = offer.freeExtraDays * rental.pricePerDay;
      } else if (offer.type === "percent_discount") {
        saving = totalAmount * (offer.discountPercent / 100);
      }
      if (saving > bestSaving) {
        bestSaving = saving;
        appliedOffer = offer;
      }
    }
    if (appliedOffer) totalAmount = Math.max(0, totalAmount - bestSaving);

    const booking = await Booking.create({
      rentalId, customerId: req.user._id,
      startDate, endDate, status: "pending", totalAmount,
      appliedOfferTitle: appliedOffer?.title || null,
    });

    // Notify owner
    await notify(rental.rentalOwnerId, `New booking request for "${rental.title}"`, "pending");

    // Email owner
    const owner = await User.findById(rental.rentalOwnerId);
    if (owner?.email) emailService.sendBookingRequest(booking, rental, owner).catch(() => {});

    res.status(201).json(booking);
  } catch (error) { next(error); }
};

// Rental owner bookings
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const rentals = await RentalListing.find({ rentalOwnerId: req.user._id }).select("_id");
    const rentalIds = rentals.map((r) => r._id);
    const bookings = await Booking.find({ rentalId: { $in: rentalIds } })
      .populate("rentalId", "title pricePerDay city images")
      .populate("customerId", "name email phone")
      .sort({ startDate: -1 });
    res.json(bookings);
  } catch (error) {
    console.error("GET OWNER BOOKINGS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// Admin
exports.getAdminRentals = async (req, res, next) => {
  try {
    const rentals = await RentalListing.find().populate("rentalOwnerId", "name email").sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) { next(error); }
};

exports.updateRentalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const rental = await RentalListing.findById(req.params.id);
    if (!rental) return res.status(404).json({ message: "Not found" });

    const previousStatus = rental.status;
    rental.status = status;
    await rental.save();

    if (previousStatus !== status) {
      const message = status === "approved"
        ? `Your rental listing "${rental.title}" has been approved and is now live.`
        : `Your rental listing "${rental.title}" was rejected by the admin.`;
      await notify(rental.rentalOwnerId, message, status);

      const owner = await User.findById(rental.rentalOwnerId);
      if (owner?.email) {
        const fn = status === "approved" ? emailService.sendListingApproved : emailService.sendListingRejected;
        fn(rental, owner).catch(() => {});
      }
    }

    res.json(rental);
  } catch (error) { next(error); }
};

// Owner's own listings (all statuses)
exports.getMyRentals = async (req, res, next) => {
  try {
    const rentals = await RentalListing.find({ rentalOwnerId: req.user._id }).sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) { next(error); }
};

// Get bookings for a rental (availability)
exports.getBookingsForRental = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ rentalId: req.params.id, status: "confirmed" });
    res.json(bookings);
  } catch (error) { next(error); }
};
