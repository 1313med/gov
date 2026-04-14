const asyncHandler = require("express-async-handler");
const Maintenance = require("../models/Maintenance");
const RentalListing = require("../models/RentalListing");

// POST /api/maintenance — create record
exports.createMaintenance = asyncHandler(async (req, res) => {
  const { rentalId, type, cost, date, mileageAtService, notes, provider, nextServiceDate, nextServiceMileage } = req.body;

  if (!rentalId || !type || cost === undefined || !date) {
    res.status(400);
    throw new Error("rentalId, type, cost and date are required");
  }

  // Verify the rental belongs to this owner
  const rental = await RentalListing.findOne({
    _id: rentalId,
    rentalOwnerId: req.user._id,
    deletedAt: null,
  });
  if (!rental) {
    res.status(404);
    throw new Error("Rental not found or does not belong to you");
  }

  const record = await Maintenance.create({
    rentalId,
    ownerId: req.user._id,
    type,
    cost: Number(cost),
    date: new Date(date),
    mileageAtService,
    notes,
    provider,
    nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : undefined,
    nextServiceMileage,
  });

  res.status(201).json(record);
});

// GET /api/maintenance/rental/:rentalId — all records for one car
exports.getMaintenanceForRental = asyncHandler(async (req, res) => {
  const rental = await RentalListing.findOne({
    _id: req.params.rentalId,
    rentalOwnerId: req.user._id,
    deletedAt: null,
  });
  if (!rental) {
    res.status(404);
    throw new Error("Rental not found or does not belong to you");
  }

  const records = await Maintenance.find({
    rentalId: req.params.rentalId,
    deletedAt: null,
  }).sort({ date: -1 });

  // Compute totals
  const totalCost = records.reduce((acc, r) => acc + r.cost, 0);

  res.json({ records, totalCost });
});

// GET /api/maintenance — all records for owner (fleet-wide)
exports.getAllMaintenance = asyncHandler(async (req, res) => {
  const records = await Maintenance.find({ ownerId: req.user._id, deletedAt: null })
    .populate("rentalId", "title brand model")
    .sort({ date: -1 });

  const totalCost = records.reduce((acc, r) => acc + r.cost, 0);

  // Group by rentalId for per-car breakdown
  const byRental = {};
  records.forEach((r) => {
    const id = r.rentalId?._id?.toString();
    if (!id) return;
    if (!byRental[id]) {
      byRental[id] = {
        rental: r.rentalId,
        records: [],
        totalCost: 0,
      };
    }
    byRental[id].records.push(r);
    byRental[id].totalCost += r.cost;
  });

  res.json({ records, totalCost, byRental: Object.values(byRental) });
});

// DELETE /api/maintenance/:id — soft delete
exports.deleteMaintenance = asyncHandler(async (req, res) => {
  const record = await Maintenance.findOne({
    _id: req.params.id,
    ownerId: req.user._id,
    deletedAt: null,
  });
  if (!record) {
    res.status(404);
    throw new Error("Record not found");
  }
  record.deletedAt = new Date();
  await record.save();
  res.json({ message: "Record deleted" });
});

// PUT /api/maintenance/:id — update record
exports.updateMaintenance = asyncHandler(async (req, res) => {
  const record = await Maintenance.findOne({
    _id: req.params.id,
    ownerId: req.user._id,
    deletedAt: null,
  });
  if (!record) {
    res.status(404);
    throw new Error("Record not found");
  }
  const allowed = ["type", "cost", "date", "mileageAtService", "notes", "provider", "nextServiceDate", "nextServiceMileage"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) record[key] = req.body[key];
  });
  await record.save();
  res.json(record);
});
