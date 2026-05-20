const crypto = require("crypto");
const User = require("../models/User");

const REFERRER_CREDIT_MAD   = 100;
const REFEREE_CREDIT_MAD    = 50;
const MIN_COMPLETED_BOOKINGS = 1; // referee must complete 1 booking for referrer to receive credit

// ── GET /api/referral/me ──────────────────────────────────────────────────────
exports.getMyReferral = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("referralCode referralCredits referredBy").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    let code = user.referralCode;
    if (!code) {
      // Generate on first access
      code = crypto.randomBytes(4).toString("hex").toUpperCase();
      await User.findByIdAndUpdate(req.user._id, { referralCode: code });
    }

    const referredUsers = await User.countDocuments({ referredBy: req.user._id, deletedAt: null });

    res.json({
      referralCode:    code,
      referralCredits: user.referralCredits || 0,
      referredUsersCount: referredUsers,
      rewards: {
        referrerCreditMad: REFERRER_CREDIT_MAD,
        refereeCreditMad:  REFEREE_CREDIT_MAD,
      },
    });
  } catch (err) { next(err); }
};

// ── POST /api/referral/apply ──────────────────────────────────────────────────
// New user applies a referral code during or after registration
exports.applyReferralCode = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "code is required" });

    const me = await User.findById(req.user._id);
    if (me.referredBy) {
      return res.status(409).json({ message: "You have already applied a referral code" });
    }

    const referrer = await User.findOne({ referralCode: code.toUpperCase().trim(), deletedAt: null });
    if (!referrer) return res.status(404).json({ message: "Invalid referral code" });
    if (referrer._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot use your own referral code" });
    }

    me.referredBy      = referrer._id;
    me.referralCredits = (me.referralCredits || 0) + REFEREE_CREDIT_MAD;
    await me.save();

    res.json({
      message: `Referral applied! You received ${REFEREE_CREDIT_MAD} MAD in credits.`,
      credits: me.referralCredits,
    });
  } catch (err) { next(err); }
};

// ── POST /api/referral/credit-referrer ────────────────────────────────────────
// Internal: called after a referred user completes their first booking
exports.creditReferrer = async (userId) => {
  try {
    const user = await User.findById(userId).select("referredBy");
    if (!user?.referredBy) return;

    const Booking = require("../models/Booking");
    const completedCount = await Booking.countDocuments({
      customerId: userId,
      status: "completed",
      deletedAt: null,
    });
    if (completedCount < MIN_COMPLETED_BOOKINGS) return;

    // Only credit once — check if referrer already received credit for this user
    const referrer = await User.findById(user.referredBy);
    if (!referrer) return;

    referrer.referralCredits = (referrer.referralCredits || 0) + REFERRER_CREDIT_MAD;
    await referrer.save();
  } catch (_) {}
};
