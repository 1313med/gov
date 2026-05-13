const RentalListing = require("../models/RentalListing");
const RentalViewEvent = require("../models/RentalViewEvent");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const User = require("../models/User");
const emailService = require("../utils/emailService");
const { computeBookingTotalForRental } = require("../utils/bookingPricing");
const { emitNotification } = require("../utils/socketManager");
const { safeRegex, safeNumber } = require("../utils/sanitize");

/** Dedupe POST /record-view for same listing + visitor (double fetch / React Strict Mode). */
const rentalViewDedupe = new Map();
const RENTAL_VIEW_DEDUPE_MS = 3 * 60 * 1000;

function pruneRentalViewDedupe() {
  const now = Date.now();
  if (rentalViewDedupe.size < 400) return;
  for (const [k, exp] of rentalViewDedupe) {
    if (exp < now) rentalViewDedupe.delete(k);
  }
}

function viewerKeyForRentalView(req) {
  const fwd = (req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  const ip = fwd || req.ip || req.socket?.remoteAddress || "";
  return String(ip || "unknown").slice(0, 64);
}

const LISTING_VIEW_PERIOD_KEYS = new Set([
  "all",
  "today",
  "yesterday",
  "last_week",
  "last_month",
  "year",
]);

const MAX_LISTING_VIEW_WINDOW_MS = 400 * 24 * 60 * 60 * 1000;
const LISTING_VIEW_END_FUTURE_SLACK_MS = 24 * 60 * 60 * 1000;

/** Optional `from` / `to` (ISO) from the client so periods use the device calendar, not UTC-only. */
function parseListingViewWindow(req) {
  const fromRaw = req.query.from;
  const toRaw = req.query.to;
  if (fromRaw == null || toRaw == null || String(fromRaw) === "" || String(toRaw) === "") {
    return null;
  }
  const start = new Date(String(fromRaw));
  const end = new Date(String(toRaw));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (start.getTime() > end.getTime()) return null;
  if (end.getTime() - start.getTime() > MAX_LISTING_VIEW_WINDOW_MS) return null;
  if (end.getTime() > Date.now() + LISTING_VIEW_END_FUTURE_SLACK_MS) return null;
  return { start, end };
}

/** UTC bounds fallback when the client does not send `from` / `to` (events table). */
function listingViewPeriodBounds(period) {
  const now = new Date();
  if (period === "today") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    return { start, end: now };
  }
  if (period === "yesterday") {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    day.setUTCDate(day.getUTCDate() - 1);
    const start = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);
    end.setUTCMilliseconds(-1);
    return { start, end };
  }
  if (period === "last_week") {
    const end = now;
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { start, end };
  }
  if (period === "last_month") {
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth();
    const py = m === 0 ? y - 1 : y;
    const pm = m === 0 ? 11 : m - 1;
    const start = new Date(Date.UTC(py, pm, 1));
    const end = new Date(Date.UTC(py, pm + 1, 0, 23, 59, 59, 999));
    return { start, end };
  }
  if (period === "year") {
    const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    return { start, end: now };
  }
  return null;
}

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

// Rental details (public) — does not increment views (see POST :id/record-view)
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

/** POST /api/rental/:id/record-view — count one listing view (deduped per visitor + listing). */
exports.recordRentalView = async (req, res, next) => {
  try {
    const rentalId = req.params.id;
    const rental = await RentalListing.findOne({
      _id: rentalId,
      status: "approved",
      deletedAt: null,
    }).select("_id");
    if (!rental) return res.status(404).json({ message: "Rental not found" });

    const visitor = viewerKeyForRentalView(req);
    const key = `${rentalId}:${visitor}`;
    pruneRentalViewDedupe();
    const now = Date.now();
    const until = rentalViewDedupe.get(key);
    if (until && until > now) {
      return res.json({ recorded: false, deduped: true });
    }
    rentalViewDedupe.set(key, now + RENTAL_VIEW_DEDUPE_MS);

    await RentalListing.updateOne({ _id: rentalId }, { $inc: { viewCount: 1 } });
    await RentalViewEvent.create({ rentalId, at: new Date() });
    res.json({ recorded: true });
  } catch (error) {
    next(error);
  }
};

/** GET /api/rental/owner/listing-views — per-vehicle view counts for dashboard */
exports.getOwnerListingViews = async (req, res, next) => {
  try {
    const raw = String(req.query.period || "all").toLowerCase();
    const period = LISTING_VIEW_PERIOD_KEYS.has(raw) ? raw : "all";

    const rentals = await RentalListing.find({ rentalOwnerId: req.user._id, deletedAt: null })
      .select("_id title brand model year city images viewCount status")
      .sort({ viewCount: -1, updatedAt: -1 })
      .lean();

    let viewsByRentalId = null;
    if (period !== "all") {
      const bounds = parseListingViewWindow(req) || listingViewPeriodBounds(period);
      if (bounds) {
        const ids = rentals.map((r) => r._id);
        if (ids.length) {
          const agg = await RentalViewEvent.aggregate([
            {
              $match: {
                rentalId: { $in: ids },
                at: { $gte: bounds.start, $lte: bounds.end },
              },
            },
            { $group: { _id: "$rentalId", views: { $sum: 1 } } },
          ]);
          viewsByRentalId = new Map(agg.map((x) => [String(x._id), x.views]));
        } else {
          viewsByRentalId = new Map();
        }
      }
    }

    let vehicles = rentals.map((r) => ({
      rentalId: r._id,
      title: r.title,
      subtitle: [r.brand, r.model, r.year].filter(Boolean).join(" "),
      city: r.city,
      image: Array.isArray(r.images) && r.images[0] ? r.images[0] : null,
      views: viewsByRentalId ? viewsByRentalId.get(String(r._id)) || 0 : r.viewCount || 0,
      status: r.status,
    }));

    if (viewsByRentalId) {
      vehicles = vehicles.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    const totalViews = vehicles.reduce((s, v) => s + (v.views || 0), 0);

    res.json({
      period,
      totalViews,
      listingCount: rentals.length,
      avgViewsPerListing: rentals.length ? Math.round((totalViews / rentals.length) * 10) / 10 : 0,
      vehicles,
    });
  } catch (error) {
    next(error);
  }
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

    const { totalAmount, appliedOffer } = computeBookingTotalForRental(rental, start, end);

    const booking = await Booking.create({
      rentalId, customerId: req.user._id,
      startDate: start, endDate: end,
      status: "pending", totalAmount,
      appliedOfferTitle: appliedOffer?.title || null,
      isNewForOwner: true,
      ownerBookingAlertAt: new Date(),
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
