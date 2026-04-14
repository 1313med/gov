const asyncHandler = require("express-async-handler");
const SaleListing = require("../models/SaleListing");
const Notification = require("../models/Notification");
const emailService = require("../utils/emailService");
const User = require("../models/User");
const { emitNotification } = require("../utils/socketManager");
const { safeRegex, safeNumber, safePage, safeLimit } = require("../utils/sanitize");
const { computeListingScore } = require("../utils/listingScore");

const notify = async (userId, message, type) => {
  const n = await Notification.create({ user: userId, message, type });
  emitNotification(userId.toString(), n);
};

// CREATE SALE
exports.createSaleListing = asyncHandler(async (req, res) => {
  const { title, description, price, city, brand, model, year, mileage, fuel, gearbox, color, doors, seats, features, images } = req.body;

  if (!title || !price || !city || !brand || !model || !year) {
    res.status(400); throw new Error("Missing required fields");
  }

  const listing = await SaleListing.create({
    sellerId: req.user._id,
    title, description, price, city, brand, model, year, mileage, fuel, gearbox,
    color, doors, seats,
    features: Array.isArray(features) ? features : [],
    images: Array.isArray(images) ? images : [],
    status: "pending",
  });

  await notify(req.user._id, `Your listing "${listing.title}" is pending approval.`, "pending");
  res.status(201).json(listing);
});

// GET MY SALES
exports.getMySaleListings = asyncHandler(async (req, res) => {
  const listings = await SaleListing.find({ sellerId: req.user._id, deletedAt: null }).sort({ createdAt: -1 });
  res.json(listings);
});

// GET APPROVED (PUBLIC) with full filtering + sanitized inputs
exports.getApprovedSaleListings = asyncHandler(async (req, res) => {
  const { brand, city, search, fuel, gearbox } = req.query;
  const minPrice = safeNumber(req.query.minPrice);
  const maxPrice = safeNumber(req.query.maxPrice);
  const minYear  = safeNumber(req.query.minYear);
  const maxYear  = safeNumber(req.query.maxYear);
  const page     = safePage(req.query.page);
  const limit    = safeLimit(req.query.limit);

  const filter = { status: "approved", deletedAt: null };

  if (search) {
    const rx = safeRegex(search);
    if (rx) {
      filter.$or = [
        { title: rx },
        { brand: rx },
        { model: rx },
        { city: rx },
      ];
    }
  }

  if (brand) { const rx = safeRegex(brand); if (rx) filter.brand = rx; }
  if (city)  { const rx = safeRegex(city);  if (rx) filter.city  = rx; }
  if (fuel)  { const rx = safeRegex(fuel);  if (rx) filter.fuel  = rx; }
  if (gearbox) { const rx = safeRegex(gearbox); if (rx) filter.gearbox = rx; }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (minYear !== undefined || maxYear !== undefined) {
    filter.year = {};
    if (minYear !== undefined) filter.year.$gte = minYear;
    if (maxYear !== undefined) filter.year.$lte = maxYear;
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    SaleListing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SaleListing.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

// GET SALE BY ID (PUBLIC) — increments viewCount, adds quality score
exports.getSaleById = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findOne({
    _id: req.params.id,
    deletedAt: null,
  }).populate("sellerId", "name phone city avatar");

  if (!sale) return res.status(404).json({ message: "Listing not found" });
  if (sale.status !== "approved") return res.status(403).json({ message: "This listing is not public" });

  // Increment view count without triggering other hooks
  await SaleListing.updateOne({ _id: sale._id }, { $inc: { viewCount: 1 } });

  const saleObj = sale.toObject();
  saleObj.qualityScore = computeListingScore(saleObj);

  res.json(saleObj);
});

// SELLER UPDATE
exports.updateSaleListing = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findOne({ _id: req.params.id, deletedAt: null });
  if (!sale) return res.status(404).json({ message: "Listing not found" });
  if (sale.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }
  delete req.body.status;
  Object.assign(sale, req.body);
  const updated = await sale.save();
  res.json(updated);
});

// SELLER — Mark as Sold
exports.markAsSold = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findOne({ _id: req.params.id, deletedAt: null });
  if (!sale) return res.status(404).json({ message: "Listing not found" });
  if (sale.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }
  sale.status = "sold";
  await sale.save();
  res.json(sale);
});

// DELETE SALE (soft)
exports.deleteSaleListing = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findOne({ _id: req.params.id, deletedAt: null });
  if (!sale) { res.status(404); throw new Error("Sale not found"); }
  if (sale.sellerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  sale.deletedAt = new Date();
  await sale.save();
  res.json({ message: "Sale deleted successfully" });
});

// ADMIN: GET ALL SALES
exports.getAllSaleListingsAdmin = asyncHandler(async (req, res) => {
  const listings = await SaleListing.find({ deletedAt: null })
    .populate("sellerId", "name phone")
    .sort({ createdAt: -1 });
  res.json(listings);
});

// ADMIN: UPDATE STATUS
exports.updateSaleStatusAdmin = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    res.status(400); throw new Error("Invalid status");
  }

  const sale = await SaleListing.findOne({ _id: req.params.id, deletedAt: null });
  if (!sale) { res.status(404); throw new Error("Listing not found"); }

  const previousStatus = sale.status;
  sale.status = status;
  await sale.save();

  if (previousStatus !== status) {
    const message = status === "approved"
      ? `Your listing "${sale.title}" has been approved and is now live.`
      : `Your listing "${sale.title}" was rejected by the admin.`;

    await notify(sale.sellerId, message, status);

    const seller = await User.findById(sale.sellerId);
    if (seller?.email) {
      const fn = status === "approved" ? emailService.sendListingApproved : emailService.sendListingRejected;
      fn(sale, seller).catch(() => {});
    }
  }

  res.json(sale);
});
