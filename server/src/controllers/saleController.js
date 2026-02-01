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

  res.status(201).json(listing);
});

// ===================== GET MY SALES =====================
// GET /api/sale/mine
exports.getMySaleListings = asyncHandler(async (req, res) => {
  const listings = await SaleListing.find({
    sellerId: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(listings);
});

// ===================== GET APPROVED (PUBLIC) =====================
exports.getApprovedSaleListings = asyncHandler(async (req, res) => {
  const listings = await SaleListing.find({
    status: "approved",
  }).sort({ createdAt: -1 });

  res.json(listings);
});

// ===================== DELETE SALE =====================
// DELETE /api/sale/:id
exports.deleteSaleListing = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);

  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  if (sale.sellerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
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

// ===================== UPDATE SALE =====================
// PUT /api/sale/:id
exports.updateSaleListing = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);

  if (!sale) {
    return res.status(404).json({ message: "Listing not found" });
  }

  if (sale.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const previousStatus = sale.status;

  // Update fields
  Object.assign(sale, req.body);

  const updatedSale = await sale.save();

  // ===================== NOTIFICATIONS =====================
  if (
    req.body.status &&
    req.body.status !== previousStatus
  ) {
    let message = "";

    if (req.body.status === "approved") {
      message = `Your listing "${sale.title}" was approved`;
    }

    if (req.body.status === "rejected") {
      message = `Your listing "${sale.title}" was rejected`;
    }

    if (req.body.status === "sold") {
      message = `Your listing "${sale.title}" was marked as sold`;
    }

    if (message) {
      await Notification.create({
        user: sale.sellerId,
        message,
        type: req.body.status,
      });
    }
  }

  res.json(updatedSale);
});
