const User = require("../models/User");
const Booking = require("../models/Booking");

// ── GET /api/kyc/me ───────────────────────────────────────────────────────────
exports.getMyKyc = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select("nationalId driverLicense name phone")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      nationalId:    user.nationalId    || {},
      driverLicense: user.driverLicense || {},
    });
  } catch (err) { next(err); }
};

// ── PUT /api/kyc/me ───────────────────────────────────────────────────────────
// Customer submits CIN + permis images/numbers for verification
exports.submitKyc = async (req, res, next) => {
  try {
    const { cinNumber, cinImageUrl, permisNumber, permisExpiryDate, permisImageUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (cinNumber || cinImageUrl) {
      user.nationalId = {
        number:   cinNumber   || user.nationalId?.number,
        imageUrl: cinImageUrl || user.nationalId?.imageUrl,
        verified: false, // reset: admin must re-verify on update
      };
    }
    if (permisNumber || permisImageUrl || permisExpiryDate) {
      user.driverLicense = {
        number:     permisNumber     || user.driverLicense?.number,
        expiryDate: permisExpiryDate || user.driverLicense?.expiryDate,
        imageUrl:   permisImageUrl   || user.driverLicense?.imageUrl,
        verified:   false,
      };
    }

    await user.save();
    res.json({
      message: "KYC documents submitted for review",
      nationalId:    user.nationalId,
      driverLicense: user.driverLicense,
    });
  } catch (err) { next(err); }
};

// ── GET /api/kyc/trust/:userId ────────────────────────────────────────────────
// Returns the trust passport for a renter (visible to rental owners before confirmation)
exports.getRenterTrustPassport = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("name avatar nationalId driverLicense createdAt")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const [completedCount, cancelledCount, blacklistCount] = await Promise.all([
      Booking.countDocuments({ customerId: req.params.userId, status: "completed", deletedAt: null }),
      Booking.countDocuments({ customerId: req.params.userId, status: "cancelled", deletedAt: null }),
      require("../models/BlacklistedRenter").countDocuments({
        renterId: req.params.userId,
        adminStatus: "confirmed",
      }),
    ]);

    // Score: base 50, +20 CIN verified, +20 permis verified, +5 per completed rental (max 20), -10 per blacklist
    let score = 50;
    if (user.nationalId?.verified)    score += 20;
    if (user.driverLicense?.verified) score += 20;
    score += Math.min(20, completedCount * 5);
    score -= blacklistCount * 10;
    score = Math.max(0, Math.min(100, score));

    res.json({
      userId:   user._id,
      name:     user.name,
      avatar:   user.avatar || null,
      memberSince: user.createdAt,
      verification: {
        cinVerified:    !!user.nationalId?.verified,
        permisVerified: !!user.driverLicense?.verified,
        cinSubmitted:   !!(user.nationalId?.number || user.nationalId?.imageUrl),
        permisSubmitted:!!(user.driverLicense?.number || user.driverLicense?.imageUrl),
      },
      stats: {
        completedRentals: completedCount,
        cancelledRentals: cancelledCount,
        platformFlags:    blacklistCount,
      },
      trustScore: score,
      trustLevel:
        score >= 80 ? "high" :
        score >= 50 ? "medium" : "low",
    });
  } catch (err) { next(err); }
};

// ── ADMIN: verify or reject a user's KYC ─────────────────────────────────────
exports.adminVerifyKyc = async (req, res, next) => {
  try {
    const { cinVerified, permisVerified } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (typeof cinVerified    === "boolean") user.nationalId.verified    = cinVerified;
    if (typeof permisVerified === "boolean") user.driverLicense.verified = permisVerified;
    await user.save();
    res.json({ message: "KYC status updated", nationalId: user.nationalId, driverLicense: user.driverLicense });
  } catch (err) { next(err); }
};
