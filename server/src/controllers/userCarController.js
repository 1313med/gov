const asyncHandler = require("express-async-handler");
const UserCar = require("../models/UserCar");

// GET /api/user-car/mine
exports.getMyCar = asyncHandler(async (req, res) => {
  const car = await UserCar.findOne({ userId: req.user._id, deletedAt: null });
  res.json(car || null);
});

// POST /api/user-car
exports.createCar = asyncHandler(async (req, res) => {
  const existing = await UserCar.findOne({ userId: req.user._id, deletedAt: null });
  if (existing) {
    res.status(400);
    throw new Error("You already have a car registered. Update it instead.");
  }

  const {
    brand, model, year, firstOwner, fuelType, gearbox, currentMileage, color, image,
    assurance, visiteTechnique, vignette, permis,
    vidange, pneus, batterie, chainDistribution, freins,
  } = req.body;

  if (!brand) {
    res.status(400);
    throw new Error("brand is required");
  }

  const car = await UserCar.create({
    userId: req.user._id,
    brand, model, year, firstOwner, fuelType, gearbox, currentMileage, color, image,
    assurance, visiteTechnique, vignette, permis,
    vidange, pneus, batterie, chainDistribution, freins,
  });

  res.status(201).json(car);
});

// PUT /api/user-car/:id
exports.updateCar = asyncHandler(async (req, res) => {
  const car = await UserCar.findOne({ _id: req.params.id, userId: req.user._id, deletedAt: null });
  if (!car) {
    res.status(404);
    throw new Error("Car not found");
  }

  const allowed = [
    "brand", "model", "year", "firstOwner", "fuelType", "gearbox", "currentMileage", "color", "image",
    "assurance", "visiteTechnique", "vignette", "permis",
    "vidange", "pneus", "batterie", "chainDistribution", "freins",
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) car[key] = req.body[key];
  });

  await car.save();
  res.json(car);
});

// DELETE /api/user-car/:id
exports.deleteCar = asyncHandler(async (req, res) => {
  const car = await UserCar.findOne({ _id: req.params.id, userId: req.user._id, deletedAt: null });
  if (!car) {
    res.status(404);
    throw new Error("Car not found");
  }
  car.deletedAt = new Date();
  await car.save();
  res.json({ message: "Car removed" });
});
