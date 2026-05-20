const FuelLog = require("../models/FuelLog");
const UserCar = require("../models/UserCar");
const UserCarServiceLog = require("../models/UserCarServiceLog");

// ── POST /api/fuel-logs ───────────────────────────────────────────────────────
exports.addFuelLog = async (req, res, next) => {
  try {
    const { userCarId, date, liters, pricePerLiter, kmAtFillup, fuelType, note } = req.body;
    if (!userCarId || !liters || !pricePerLiter || !kmAtFillup) {
      return res.status(400).json({ message: "userCarId, liters, pricePerLiter, kmAtFillup are required" });
    }

    // Verify ownership
    const car = await UserCar.findOne({ _id: userCarId, userId: req.user._id, deletedAt: null });
    if (!car) return res.status(404).json({ message: "Car not found" });

    const log = await FuelLog.create({
      userId:       req.user._id,
      userCarId,
      date:         date || new Date(),
      liters:       parseFloat(liters),
      pricePerLiter:parseFloat(pricePerLiter),
      kmAtFillup:   parseInt(kmAtFillup),
      fuelType:     fuelType || car.fuelType || "essence",
      note:         String(note || "").slice(0, 300),
    });

    // Update car's current mileage if this is newer
    if (parseInt(kmAtFillup) > (car.currentMileage || 0)) {
      car.currentMileage = parseInt(kmAtFillup);
      car.lastMileageAt  = log.date;
      await car.save();
    }

    res.status(201).json(log);
  } catch (err) { next(err); }
};

// ── GET /api/fuel-logs/:carId ─────────────────────────────────────────────────
exports.getFuelLogs = async (req, res, next) => {
  try {
    const car = await UserCar.findOne({ _id: req.params.carId, userId: req.user._id, deletedAt: null });
    if (!car) return res.status(404).json({ message: "Car not found" });

    const logs = await FuelLog.find({ userCarId: req.params.carId })
      .sort({ date: -1 })
      .lean();

    // Compute consumption stats
    const stats = computeFuelStats(logs);

    res.json({ logs, stats });
  } catch (err) { next(err); }
};

// ── DELETE /api/fuel-logs/:id ─────────────────────────────────────────────────
exports.deleteFuelLog = async (req, res, next) => {
  try {
    const log = await FuelLog.findOne({ _id: req.params.id, userId: req.user._id });
    if (!log) return res.status(404).json({ message: "Log not found" });
    await log.deleteOne();
    res.json({ message: "Fuel log deleted" });
  } catch (err) { next(err); }
};

// ── GET /api/fuel-logs/:carId/cost-of-ownership ───────────────────────────────
exports.getCostOfOwnership = async (req, res, next) => {
  try {
    const car = await UserCar.findOne({ _id: req.params.carId, userId: req.user._id, deletedAt: null });
    if (!car) return res.status(404).json({ message: "Car not found" });

    const [fuelLogs, serviceLogs] = await Promise.all([
      FuelLog.find({ userCarId: car._id }).lean(),
      UserCarServiceLog ? UserCarServiceLog.find({ userCarId: car._id }).lean() : Promise.resolve([]),
    ]);

    // Group by month (last 12 months)
    const now      = new Date();
    const months   = {};
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = { fuel: 0, maintenance: 0, total: 0 };
    }

    for (const log of fuelLogs) {
      const d   = new Date(log.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (months[key]) months[key].fuel += log.totalCost || 0;
    }
    for (const log of serviceLogs) {
      const d   = new Date(log.date || log.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (months[key]) months[key].maintenance += log.cost || 0;
    }

    // Annual insurance estimate from assurance data
    const assuranceMonthly = car.assurance?.expiryDate && car.assurance?.startDate
      ? 0  // Can't easily compute without price stored — placeholder
      : 0;

    // Compute totals
    let totalFuel = 0, totalMaintenance = 0;
    for (const k of Object.keys(months)) {
      months[k].total = months[k].fuel + months[k].maintenance;
      totalFuel        += months[k].fuel;
      totalMaintenance += months[k].maintenance;
    }

    const timeline = Object.entries(months)
      .map(([month, costs]) => ({ month, ...costs }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      carId: car._id,
      period: "last_12_months",
      totals: {
        fuel:        Math.round(totalFuel),
        maintenance: Math.round(totalMaintenance),
        total:       Math.round(totalFuel + totalMaintenance),
        monthlyAvg:  Math.round((totalFuel + totalMaintenance) / 12),
      },
      timeline,
      fuelStats: computeFuelStats(fuelLogs),
    });
  } catch (err) { next(err); }
};

function computeFuelStats(logs) {
  if (logs.length < 2) return null;
  const sorted = [...logs].sort((a, b) => a.kmAtFillup - b.kmAtFillup);
  const consumptions = [];
  for (let i = 1; i < sorted.length; i++) {
    const kmDiff     = sorted[i].kmAtFillup - sorted[i - 1].kmAtFillup;
    const liters     = sorted[i].liters;
    if (kmDiff > 0 && liters > 0) {
      consumptions.push((liters / kmDiff) * 100);
    }
  }
  if (!consumptions.length) return null;
  const avg = consumptions.reduce((s, v) => s + v, 0) / consumptions.length;
  const totalSpent = logs.reduce((s, l) => s + (l.totalCost || 0), 0);
  return {
    avgConsumptionL100km: Math.round(avg * 10) / 10,
    totalFuelSpentMad:    Math.round(totalSpent),
    totalFillups:         logs.length,
  };
}
