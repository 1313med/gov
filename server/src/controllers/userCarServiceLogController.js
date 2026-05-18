const asyncHandler = require("express-async-handler");
const UserCar = require("../models/UserCar");
const UserCarServiceLog = require("../models/UserCarServiceLog");

async function getOwnedCar(userId) {
  return UserCar.findOne({ userId, deletedAt: null });
}

// GET /api/user-car/mine/services
exports.listServiceLogs = asyncHandler(async (req, res) => {
  const car = await getOwnedCar(req.user._id);
  if (!car) {
    res.json([]);
    return;
  }
  const logs = await UserCarServiceLog.find({ userCarId: car._id })
    .sort({ date: -1 })
    .limit(100)
    .lean();
  res.json(logs);
});

// POST /api/user-car/mine/services
exports.createServiceLog = asyncHandler(async (req, res) => {
  const car = await getOwnedCar(req.user._id);
  if (!car) {
    res.status(404);
    throw new Error("No car registered");
  }

  const { type, title, date, cost, mileage, provider, notes, receiptUrl } = req.body;
  if (!title?.trim() || !date) {
    res.status(400);
    throw new Error("title and date are required");
  }

  const log = await UserCarServiceLog.create({
    userCarId: car._id,
    userId: req.user._id,
    type: type || "other",
    title: title.trim(),
    date: new Date(date),
    cost: Number(cost) || 0,
    mileage: mileage != null ? Number(mileage) : null,
    provider: provider?.trim() || "",
    notes: notes?.trim() || "",
    receiptUrl: receiptUrl || null,
  });

  if (mileage != null && Number(mileage) > (car.currentMileage || 0)) {
    car.currentMileage = Number(mileage);
    car.lastMileageAt = new Date();
    await car.save();
  }

  res.status(201).json(log);
});

// DELETE /api/user-car/services/:logId
exports.deleteServiceLog = asyncHandler(async (req, res) => {
  const log = await UserCarServiceLog.findOne({
    _id: req.params.logId,
    userId: req.user._id,
  });
  if (!log) {
    res.status(404);
    throw new Error("Log not found");
  }
  await log.deleteOne();
  res.json({ message: "Deleted" });
});
