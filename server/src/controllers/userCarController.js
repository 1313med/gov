const asyncHandler = require("express-async-handler");
const UserCar = require("../models/UserCar");
const UserCarServiceLog = require("../models/UserCarServiceLog");

function clearAlertOnNestedUpdate(car, key, incoming) {
  if (!incoming || typeof incoming !== "object") return;
  const block = car[key];
  if (!block) return;
  if (incoming.expiryDate !== undefined && block.expiryDate) {
    const old = block.expiryDate?.toISOString?.() || String(block.expiryDate);
    const neu = new Date(incoming.expiryDate).toISOString();
    if (old !== neu) block.alertSentAt = null;
  }
  if (incoming.lastChangeDate !== undefined && block.lastChangeDate) {
    const old = block.lastChangeDate?.toISOString?.() || String(block.lastChangeDate);
    const neu = new Date(incoming.lastChangeDate).toISOString();
    if (old !== neu) block.alertSentAt = null;
  }
  if (key === "vidange" && (incoming.lastKm !== undefined || incoming.intervalKm !== undefined)) {
    block.alertSentAt = null;
  }
}

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
    garageSettings,
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
    garageSettings,
    lastMileageAt: currentMileage != null ? new Date() : null,
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

  const nestedKeys = ["assurance", "visiteTechnique", "vignette", "permis", "vidange", "pneus", "batterie", "chainDistribution", "freins"];
  nestedKeys.forEach((key) => {
    if (req.body[key] !== undefined) {
      clearAlertOnNestedUpdate(car, key, req.body[key]);
      if (!car[key]) car[key] = {};
      Object.assign(car[key], req.body[key]);
      car.markModified(key);
    }
  });

  const allowed = [
    "brand", "model", "year", "firstOwner", "fuelType", "gearbox", "currentMileage", "color", "image",
    "garageSettings",
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) {
      if (key === "currentMileage") {
        car.currentMileage = req.body[key];
        car.lastMileageAt = new Date();
      } else {
        car[key] = req.body[key];
      }
    }
  });

  await car.save();
  res.json(car);
});

// PATCH /api/user-car/:id/mileage — quick bump from Mon Garage
exports.patchMileage = asyncHandler(async (req, res) => {
  const car = await UserCar.findOne({ _id: req.params.id, userId: req.user._id, deletedAt: null });
  if (!car) {
    res.status(404);
    throw new Error("Car not found");
  }

  const { currentMileage, addKm } = req.body;
  let next = car.currentMileage || 0;
  if (addKm != null) next += Number(addKm) || 0;
  if (currentMileage != null) next = Number(currentMileage);
  if (next < 0) {
    res.status(400);
    throw new Error("Invalid mileage");
  }

  car.currentMileage = next;
  car.lastMileageAt = new Date();
  if (car.vidange) car.vidange.alertSentAt = null;
  await car.save();
  res.json(car);
});

// PATCH /api/user-car/:id/reminders
exports.patchGarageSettings = asyncHandler(async (req, res) => {
  const car = await UserCar.findOne({ _id: req.params.id, userId: req.user._id, deletedAt: null });
  if (!car) {
    res.status(404);
    throw new Error("Car not found");
  }
  if (req.body.remindersEnabled !== undefined) {
    car.garageSettings = car.garageSettings || {};
    car.garageSettings.remindersEnabled = !!req.body.remindersEnabled;
  }
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
  await UserCarServiceLog.deleteMany({ userCarId: car._id });
  res.json({ message: "Car removed" });
});
