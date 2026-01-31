const asyncHandler = require("express-async-handler");

// IMPORTANT: match the file name in /models
// Your file is: saleListing.js
const SaleListing = require("../models/SaleListing");

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

// GET /api/sale/mine
exports.getMySaleListings = asyncHandler(async (req, res) => {
  const listings = await SaleListing.find({ sellerId: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(listings);
});
exports.getApprovedSaleListings = asyncHandler(async (req, res) => {
  const listings = await SaleListing.find({ status: "approved" }).sort({ createdAt: -1 });
  res.json(listings);
});


// DELETE /api/sale/:id
exports.deleteSaleListing = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);

  if (!sale) {
    res.status(404);
    throw new Error("Sale not found");
  }

  // Owner check (your schema uses sellerId)
  if (sale.sellerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await sale.deleteOne();
  res.json({ message: "Sale deleted successfully" });
});

exports.getSaleById = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);

  if (!sale) {
    return res.status(404).json({ message: "Listing not found" });
  }

  // Only show approved listings to public
  if (sale.status !== "approved") {
    return res.status(403).json({ message: "This listing is not public" });
  }

  res.json(sale);
});
exports.updateSaleListing = asyncHandler(async (req, res) => {
  const sale = await SaleListing.findById(req.params.id);

  if (!sale) {
    return res.status(404).json({ message: "Listing not found" });
  }

  // Only seller can edit their own listing
  if (sale.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Update fields
  const updates = req.body;
  Object.assign(sale, updates);

  const updatedSale = await sale.save();

  res.json(updatedSale);
});

