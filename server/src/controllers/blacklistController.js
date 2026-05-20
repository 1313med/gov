const BlacklistedRenter = require("../models/BlacklistedRenter");
const Booking = require("../models/Booking");
const RentalListing = require("../models/RentalListing");

// ── POST /api/blacklist ───────────────────────────────────────────────────────
exports.flagRenter = async (req, res, next) => {
  try {
    const { renterId, bookingId, reason, note } = req.body;
    if (!renterId || !reason) {
      return res.status(400).json({ message: "renterId and reason are required" });
    }

    // Verify the renter actually rented from this owner
    if (bookingId) {
      const rentals = await RentalListing.find({ rentalOwnerId: req.user._id, deletedAt: null }).select("_id");
      const rentalIds = rentals.map((r) => r._id);
      const booking = await Booking.findOne({ _id: bookingId, customerId: renterId, rentalId: { $in: rentalIds }, deletedAt: null });
      if (!booking) {
        return res.status(403).json({ message: "Cannot flag a renter for a booking that is not yours" });
      }
    }

    const entry = await BlacklistedRenter.create({
      reportedByOwnerId: req.user._id,
      renterId,
      bookingId: bookingId || null,
      reason,
      note: String(note || "").slice(0, 1000),
    });
    res.status(201).json({ message: "Renter flagged successfully", entry });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "You have already flagged this renter for this booking" });
    }
    next(err);
  }
};

// ── GET /api/blacklist/renter/:renterId ───────────────────────────────────────
// Rental owner checks if a renter has flags before confirming their booking
exports.getRenterFlags = async (req, res, next) => {
  try {
    const flags = await BlacklistedRenter.find({ renterId: req.params.renterId })
      .select("reason note adminStatus createdAt")
      .lean();

    const platformConfirmed = flags.filter((f) => f.adminStatus === "confirmed").length;
    const ownerReports = flags.length;

    res.json({
      renterId: req.params.renterId,
      ownerReports,
      platformFlags: platformConfirmed,
      flags: flags.map((f) => ({
        reason:      f.reason,
        adminStatus: f.adminStatus,
        date:        f.createdAt,
      })),
      riskLevel:
        platformConfirmed >= 2 ? "high" :
        platformConfirmed >= 1 ? "medium" :
        ownerReports >= 3      ? "medium" : "none",
    });
  } catch (err) { next(err); }
};

// ── GET /api/blacklist/my-flags ───────────────────────────────────────────────
// Owner lists their own flagged renters
exports.getMyFlags = async (req, res, next) => {
  try {
    const flags = await BlacklistedRenter.find({ reportedByOwnerId: req.user._id })
      .populate("renterId", "name phone avatar")
      .populate("bookingId", "startDate endDate")
      .sort({ createdAt: -1 })
      .lean();
    res.json(flags);
  } catch (err) { next(err); }
};

// ── DELETE /api/blacklist/:id ─────────────────────────────────────────────────
exports.removeFlag = async (req, res, next) => {
  try {
    const flag = await BlacklistedRenter.findOne({ _id: req.params.id, reportedByOwnerId: req.user._id });
    if (!flag) return res.status(404).json({ message: "Flag not found" });
    await flag.deleteOne();
    res.json({ message: "Flag removed" });
  } catch (err) { next(err); }
};

// ── ADMIN: update flag status ─────────────────────────────────────────────────
exports.adminUpdateFlag = async (req, res, next) => {
  try {
    const { adminStatus } = req.body;
    if (!["pending_review", "confirmed", "dismissed"].includes(adminStatus)) {
      return res.status(400).json({ message: "Invalid adminStatus" });
    }
    const flag = await BlacklistedRenter.findByIdAndUpdate(
      req.params.id,
      { adminStatus },
      { new: true }
    );
    if (!flag) return res.status(404).json({ message: "Flag not found" });
    res.json(flag);
  } catch (err) { next(err); }
};
