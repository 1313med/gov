const ListingReport = require("../models/ListingReport");
const SaleListing   = require("../models/SaleListing");
const RentalListing = require("../models/RentalListing");

// ── POST /api/reports ─────────────────────────────────────────────────────────
exports.reportListing = async (req, res, next) => {
  try {
    const { listingId, listingModel, reason, note } = req.body;
    if (!listingId || !listingModel || !reason) {
      return res.status(400).json({ message: "listingId, listingModel, and reason are required" });
    }
    if (!["SaleListing", "RentalListing"].includes(listingModel)) {
      return res.status(400).json({ message: "listingModel must be SaleListing or RentalListing" });
    }

    const report = await ListingReport.create({
      reporterId:   req.user._id,
      listingId,
      listingModel,
      reason,
      note: String(note || "").slice(0, 1000),
    });

    // Increment reportCount on the listing
    if (listingModel === "SaleListing") {
      await SaleListing.findByIdAndUpdate(listingId, { $inc: { reportCount: 1 } });
    } else {
      await RentalListing.findByIdAndUpdate(listingId, { $inc: { reportCount: 1 } }).catch(() => {});
    }

    res.status(201).json({ message: "Report submitted. Our team will review it shortly.", reportId: report._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already reported this listing" });
    }
    next(err);
  }
};

// ── GET /api/reports (ADMIN) ──────────────────────────────────────────────────
exports.adminGetReports = async (req, res, next) => {
  try {
    const { status, model } = req.query;
    const filter = {};
    if (status) filter.adminStatus = status;
    if (model)  filter.listingModel = model;

    const reports = await ListingReport.find(filter)
      .populate("reporterId", "name phone email")
      .sort({ createdAt: -1 })
      .lean();

    res.json(reports);
  } catch (err) { next(err); }
};

// ── PUT /api/reports/:id (ADMIN) ──────────────────────────────────────────────
exports.adminUpdateReport = async (req, res, next) => {
  try {
    const { adminStatus, adminNote } = req.body;
    const validStatuses = ["pending", "reviewed", "dismissed", "actioned"];
    if (!validStatuses.includes(adminStatus)) {
      return res.status(400).json({ message: "Invalid adminStatus" });
    }

    const report = await ListingReport.findByIdAndUpdate(
      req.params.id,
      { adminStatus, adminNote: adminNote || "" },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (err) { next(err); }
};
