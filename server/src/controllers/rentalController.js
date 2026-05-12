const RentalListing = require("../models/RentalListing");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");
const emailService = require("../utils/emailService");
const { emitNotification } = require("../utils/socketManager");
const { safeRegex, safeNumber } = require("../utils/sanitize");

const notify = async (userId, message, type) => {
  const n = await Notification.create({ user: userId, message, type });
  emitNotification(userId.toString(), n);
};

// Create rental listing
exports.createRental = async (req, res, next) => {
  try {
    const {
      title, description, pricePerDay, city, brand, model, year, mileage,
      fuel, gearbox, color, doors, seats, features, fuelPolicy, cancelPolicy,
      minRentalDays, images, availability,
      airportDeliveryOffered,
      airportDeliveryFeeMad,
    } = req.body;

    if (!title || !pricePerDay || !city || !brand || !model || !year) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const adOffered = !!airportDeliveryOffered;
    const adFee = Math.max(0, Number(airportDeliveryFeeMad) || 0);
    if (adOffered && adFee <= 0) {
      return res.status(400).json({
        message: "Airport delivery fee (MAD) must be greater than 0 when airport service is enabled",
      });
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
      airportDeliveryOffered: adOffered,
      airportDeliveryFeeMad: adOffered ? adFee : 0,
      status: "pending",
    });

    await notify(req.user._id, `Your rental "${rental.title}" is pending approval.`, "pending");
    res.status(201).json(rental);
  } catch (error) { next(error); }
};

// Update rental listing (owner)
exports.updateRental = async (req, res, next) => {
  try {
    const rental = await RentalListing.findOne({ _id: req.params.id, deletedAt: null });
    if (!rental) return res.status(404).json({ message: "Rental not found" });
    if (rental.rentalOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const ALLOWED_UPDATE_FIELDS = [
      "title",
      "description",
      "pricePerDay",
      "city",
      "brand",
      "model",
      "year",
      "mileage",
      "fuel",
      "gearbox",
      "color",
      "doors",
      "seats",
      "features",
      "fuelPolicy",
      "cancelPolicy",
      "minRentalDays",
      "images",
      "availability",
      "conditionPhotos",
      "documents",
      "offers",
      "airportDeliveryOffered",
      "airportDeliveryFeeMad",
    ];
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        rental[field] = req.body[field];
      }
    }
    if (rental.airportDeliveryOffered && (!Number(rental.airportDeliveryFeeMad) || rental.airportDeliveryFeeMad <= 0)) {
      return res.status(400).json({
        message: "Airport delivery fee (MAD) must be greater than 0 when airport service is enabled",
      });
    }
    if (!rental.airportDeliveryOffered) {
      rental.airportDeliveryFeeMad = 0;
    }
    await rental.save();
    res.json(rental);
  } catch (error) { next(error); }
};

// Delete rental listing (soft delete)
exports.deleteRental = async (req, res, next) => {
  try {
    const rental = await RentalListing.findOne({ _id: req.params.id, deletedAt: null });
    if (!rental) return res.status(404).json({ message: "Rental not found" });
    if (rental.rentalOwnerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    rental.deletedAt = new Date();
    await rental.save();
    res.json({ message: "Rental deleted" });
  } catch (error) { next(error); }
};

// Public rentals with full filtering + sanitized inputs
exports.getRentals = async (req, res, next) => {
  try {
    const { city, brand, fuel, gearbox, search, startDate, endDate } = req.query;
    const minPrice = safeNumber(req.query.minPrice);
    const maxPrice = safeNumber(req.query.maxPrice);

    const query = { status: "approved", deletedAt: null };

    if (search) {
      const rx = safeRegex(search);
      if (rx) {
        query.$or = [
          { title: rx },
          { brand: rx },
          { model: rx },
          { city: rx },
        ];
      }
    }

    if (city)    { const rx = safeRegex(city);    if (rx) query.city    = rx; }
    if (brand)   { const rx = safeRegex(brand);   if (rx) query.brand   = rx; }
    if (fuel)    { const rx = safeRegex(fuel);    if (rx) query.fuel    = rx; }
    if (gearbox) { const rx = safeRegex(gearbox); if (rx) query.gearbox = rx; }

    const airportFlag = String(req.query.airport || "").toLowerCase();
    if (["1", "true", "yes"].includes(airportFlag)) {
      query.airportDeliveryOffered = true;
      query.airportDeliveryFeeMad = { $gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.pricePerDay = {};
      if (minPrice !== undefined) query.pricePerDay.$gte = minPrice;
      if (maxPrice !== undefined) query.pricePerDay.$lte = maxPrice;
    }

    let rentals = await RentalListing.find(query).sort({ createdAt: -1 });

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start) && !isNaN(end) && end > start) {
        const conflicts = await Booking.find({
          status: "confirmed",
          startDate: { $lt: end },
          endDate: { $gt: start },
        }).select("rentalId");
        const blockedIds = new Set(conflicts.map((b) => b.rentalId.toString()));
        rentals = rentals.filter((r) => !blockedIds.has(r._id.toString()));
      }
    }

    res.json(rentals);
  } catch (error) { next(error); }
};

// Rental details (public)
exports.getRentalById = async (req, res, next) => {
  try {
    const rental = await RentalListing.findOne({
      _id: req.params.id,
      status: "approved",
      deletedAt: null,
    }).populate("rentalOwnerId", "name phone city avatar");
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

    if (!startDate || !endDate || isNaN(start) || isNaN(end) || end <= start) {
      return res.status(400).json({ message: "Invalid dates" });
    }

    const rental = await RentalListing.findOne({ _id: rentalId, deletedAt: null });
    if (!rental) return res.status(404).json({ message: "Rental not found" });
    if (rental.status !== "approved") {
      return res.status(400).json({ message: "This rental is not available" });
    }

    // Prevent customer from booking their own rental
    if (rental.rentalOwnerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot book your own rental" });
    }

    // Require driving license + national ID (CIN) on file before booking
    const customer = await User.findById(req.user._id).select("driverLicense nationalId");
    const dl = customer?.driverLicense;
    const nid = customer?.nationalId;
    const missingLicense = !dl?.number?.trim() || !dl?.imageUrl;
    const missingCin = !nid?.number?.trim() || !nid?.imageUrl;
    if (missingLicense || missingCin) {
      return res.status(400).json({
        message: missingLicense && missingCin
          ? "Please upload your driving license and national ID (CIN) in your profile before booking a car."
          : missingLicense
            ? "Please upload your driving license in your profile before booking a car."
            : "Please upload your national ID (CIN) in your profile before booking a car.",
        code: "BOOKING_DOCUMENTS_REQUIRED",
      });
    }

    // Check confirmed booking conflicts
    const conflict = await Booking.findOne({
      rentalId,
      status: "confirmed",
      startDate: { $lt: end },
      endDate: { $gt: start },
      deletedAt: null,
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

    // UTC calendar days, inclusive of start and end (e.g. May 7–May 11 = 5 days)
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const endUTC   = Date.UTC(end.getUTCFullYear(),   end.getUTCMonth(),   end.getUTCDate());
    const days = Math.max(1, Math.floor((endUTC - startUTC) / MS_PER_DAY) + 1);

    // Apply best active offer
    let totalAmount = days * rental.pricePerDay;
    let appliedOffer = null;
    const now = new Date();
    const activeOffers = (rental.offers || []).filter(
      (o) => o.isActive && days >= o.minDays && (!o.expiresAt || new Date(o.expiresAt) > now)
    );

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
      startDate: start, endDate: end,
      status: "pending", totalAmount,
      appliedOfferTitle: appliedOffer?.title || null,
    });

    // Notify owner
    await notify(rental.rentalOwnerId, `New booking request for "${rental.title}"`, "pending");

    const owner = await User.findById(rental.rentalOwnerId);
    if (owner?.email) emailService.sendBookingRequest(booking, rental, owner).catch(() => {});

    // Notify customer by email that request was submitted
    const customerUser = await User.findById(req.user._id).select("name email");
    if (customerUser?.email) {
      emailService.sendBookingSubmitted(booking, rental, customerUser).catch(() => {});
    }

    res.status(201).json(booking);
  } catch (error) { next(error); }
};

// Rental owner bookings (used by the calendar view — returns all bookings as a flat array)
exports.getOwnerBookings = async (req, res, next) => {
  try {
    const rentals = await RentalListing.find({ rentalOwnerId: req.user._id, deletedAt: null }).select("_id");
    const rentalIds = rentals.map((r) => r._id);

    const bookings = await Booking.find({ rentalId: { $in: rentalIds }, deletedAt: null })
      .populate("rentalId", "title pricePerDay city images")
      .populate("customerId", "name email phone")
      .sort({ startDate: -1 });

    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

// Admin
exports.getAdminRentals = async (req, res, next) => {
  try {
    const rentals = await RentalListing.find({ deletedAt: null })
      .populate("rentalOwnerId", "name email")
      .sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) { next(error); }
};

exports.updateRentalStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const rental = await RentalListing.findOne({ _id: req.params.id, deletedAt: null });
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
    const rentals = await RentalListing.find({
      rentalOwnerId: req.user._id,
      deletedAt: null,
    }).sort({ createdAt: -1 });
    res.json(rentals);
  } catch (error) { next(error); }
};

// Get confirmed bookings for a rental (for availability display)
exports.getBookingsForRental = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      rentalId: req.params.id,
      status: "confirmed",
      deletedAt: null,
    });
    res.json(bookings);
  } catch (error) { next(error); }
};
