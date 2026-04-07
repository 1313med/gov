const asyncHandler = require("express-async-handler");
const SaleListing = require("../models/SaleListing");
const Notification = require("../models/Notification");
const emailService = require("../utils/emailService");
const User = require("../models/User");
const { emitNotification } = require("../utils/socketManager");

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
  const listings = await SaleListing.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
  res.json(listings);
});

// GET APPROVED (PUBLIC) with full filtering
exports.getApprovedSaleListings = asyncHandler(async (req, res) => {
  const { brand, city, minPrice, maxPrice, search, fuel, gearbox, minYear, maxYear, page = 1, limit = 9 } = req.query;

  const filter = { status: "approved" };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { model: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
    ];
  }

  if (brand) filter.brand = { $regex: brand, $options: "i" };
  if (city) filter.city = { $regex: city, $options: "i" };
  if (fuel) filter.fuel = { $regex: fuel, $options: "i" };
  if (gearbox) filter.gearbox = { $regex: gearbox, $options: "i" };

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (minYear || maxYear) {
    filter.year = {};
    if (minYear) filter.year.$gte = Number(minYear);
    if (maxYear) filter.year.$lte = Number(maxYear);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    SaleListing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    SaleListing.countDocuments(filter),
  ]);

  res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// GET SALE BY ID (PUBLIC) – increments viewCount
exports.getSaleById = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id).populate("sellerId", "name phone city avatar");
  if (!sale) return res.status(404).json({ message: "Listing not found" });
  if (sale.status !== "approved") return res.status(403).json({ message: "This listing is not public" });

  // Increment view count without triggering other hooks
  await SaleListing.updateOne({ _id: sale._id }, { $inc: { viewCount: 1 } });

  res.json(sale);
});

// SELLER UPDATE
exports.updateSaleListing = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);
  if (!sale) return res.status(404).json({ message: "Listing not found" });
  if (sale.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }
  delete req.body.status;
  Object.assign(sale, req.body);
  const updated = await sale.save();
  res.json(updated);
});

// SELLER – Mark as Sold
exports.markAsSold = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);
  if (!sale) return res.status(404).json({ message: "Listing not found" });
  if (sale.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }
  sale.status = "sold";
  await sale.save();
  res.json(sale);
});

// DELETE SALE
exports.deleteSaleListing = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);
  if (!sale) { res.status(404); throw new Error("Sale not found"); }
  if (sale.sellerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
  }
  await sale.deleteOne();
  res.json({ message: "Sale deleted successfully" });
});

// ADMIN: GET ALL SALES
exports.getAllSaleListingsAdmin = asyncHandler(async (req, res) => {
  const listings = await SaleListing.find().populate("sellerId", "name phone").sort({ createdAt: -1 });
  res.json(listings);
});

// ADMIN: UPDATE STATUS
exports.updateSaleStatusAdmin = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    res.status(400); throw new Error("Invalid status");
  }

  const sale = await SaleListing.findById(req.params.id);
  if (!sale) { res.status(404); throw new Error("Listing not found"); }

  const previousStatus = sale.status;
  sale.status = status;
  await sale.save();

  if (previousStatus !== status) {
    const message = status === "approved"
      ? `Your listing "${sale.title}" has been approved and is now live.`
      : `Your listing "${sale.title}" was rejected by the admin.`;

    await notify(sale.sellerId, message, status);

    // Email seller
    const seller = await User.findById(sale.sellerId);
    if (seller?.email) {
      const fn = status === "approved" ? emailService.sendListingApproved : emailService.sendListingRejected;
      fn(sale, seller).catch(() => {});
    }
  }

  res.json(sale);
});
