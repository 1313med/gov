const asyncHandler = require("express-async-handler");
const { estimate }  = require("../utils/priceEngine");
const PriceAlert    = require("../models/PriceAlert");

// POST /api/price/estimate  — public, no auth required
exports.estimatePrice = asyncHandler(async (req, res) => {
  const { brand, year, model, mileage, fuel, gearbox } = req.body;
  if (!brand || !year) {
    res.status(400);
    throw new Error("brand and year are required");
  }
  const result = estimate({ brand, model, year, mileage, fuel, gearbox });
  res.json(result);
});

// GET /api/price/alerts
exports.getAlerts = asyncHandler(async (req, res) => {
  const alerts = await PriceAlert.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(alerts);
});

// POST /api/price/alerts
exports.createAlert = asyncHandler(async (req, res) => {
  const { brand, model, maxPrice, minYear, fuelType, city } = req.body;
  if (!brand || !maxPrice) {
    res.status(400);
    throw new Error("brand and maxPrice are required");
  }
  const count = await PriceAlert.countDocuments({ userId: req.user._id, active: true });
  if (count >= 10) {
    res.status(400);
    throw new Error("Maximum 10 alertes actives autorisées");
  }
  const alert = await PriceAlert.create({
    userId:   req.user._id,
    brand:    brand.trim(),
    model:    model?.trim() || null,
    maxPrice: Number(maxPrice),
    minYear:  minYear ? Number(minYear) : null,
    fuelType: fuelType?.trim() || null,
    city:     city?.trim() || null,
  });
  res.status(201).json(alert);
});

// DELETE /api/price/alerts/:id
exports.deleteAlert = asyncHandler(async (req, res) => {
  const alert = await PriceAlert.findOne({ _id: req.params.id, userId: req.user._id });
  if (!alert) { res.status(404); throw new Error("Alert not found"); }
  await alert.deleteOne();
  res.json({ message: "Alert deleted" });
});

// PATCH /api/price/alerts/:id/toggle
exports.toggleAlert = asyncHandler(async (req, res) => {
  const alert = await PriceAlert.findOne({ _id: req.params.id, userId: req.user._id });
  if (!alert) { res.status(404); throw new Error("Alert not found"); }
  alert.active = !alert.active;
  await alert.save();
  res.json(alert);
});
