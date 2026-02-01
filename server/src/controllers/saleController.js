const asyncHandler = require("express-async-handler");
const SaleListing = require("../models/SaleListing");
const Notification = require("../models/Notification");

// ===================== CREATE SALE =====================
// POST /api/sale
exports.createSaleListing = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    city,
    brand,
    model,
    year,
    mileage,
    fuel,
    gearbox,
    images,
  } = req.body;

  if (!title || !price || !city || !brand || !model || !year) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  const listing = await SaleListing.create({
    sellerId: req.user._id,
    title,
    description,
    price,
    city,
    brand,
    model,
    year,
    mileage,
    fuel,
    gearbox,
    images: Array.isArray(images) ? images : [],
    status: "pending",
  });

  // 🔔 Pending notification
  await Notification.create({
    user: req.user._id,
    message: `Your listing "${listing.title}" is pending approval.`,
    type: "pending",
  });

  res.status(201).json(listing);
});

// ===================== GET MY SALES =====================
exports.getMySaleListings = asyncHandler(async (req, res) => {
  const listings = await SaleListing.find({
    sellerId: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(listings);
});

// ===================== GET APPROVED (PUBLIC) =====================
exports.getApprovedSaleListings = asyncHandler(async (req, res) => {
  const listings = await SaleListing.find({ status: "approved" }).sort({
    createdAt: -1,
  });

  res.json(listings);
});

// ===================== DELETE SALE =====================
exports.deleteSaleListing = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);

  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  if (
    sale.sellerId.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  await sale.deleteOne();
  res.json({ message: "Sale deleted successfully" });
});

// ===================== GET SALE BY ID (PUBLIC) =====================
exports.getSaleById = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);

  if (!sale) {
    return res.status(404).json({ message: "Listing not found" });
  }

  if (sale.status !== "approved") {
    return res.status(403).json({ message: "This listing is not public" });
  }

  res.json(sale);
});

// ===================== SELLER UPDATE (NO STATUS) =====================
exports.updateSaleListing = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);

  if (!sale) {
    return res.status(404).json({ message: "Listing not found" });
  }

  if (sale.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Seller cannot approve himself
  delete req.body.status;

  Object.assign(sale, req.body);
  const updatedSale = await sale.save();

  res.json(updatedSale);
});

// ===================== ADMIN: GET ALL SALES =====================
exports.getAllSaleListingsAdmin = asyncHandler(async (req, res) => {
  const listings = await SaleListing.find()
    .populate("sellerId", "name phone")
    .sort({ createdAt: -1 });

  res.json(listings);
});

// ===================== ADMIN: UPDATE STATUS =====================
exports.updateSaleStatusAdmin = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    res.status(400);
    throw new Error("Invalid status");
  }

  const sale = await SaleListing.findById(req.params.id);

  if (!sale) {
    res.status(404);
    throw new Error("Listing not found");
  }

  const previousStatus = sale.status;
  sale.status = status;
  await sale.save();

  // 🔔 Notify seller ONLY if status changed
  if (previousStatus !== status) {
    await Notification.create({
      user: sale.sellerId,
      message:
        status === "approved"
          ? `Your listing "${sale.title}" has been approved and is now live.`
          : `Your listing "${sale.title}" was rejected by the admin.`,
      type: status,
    });
  }

  res.json(sale);
});
