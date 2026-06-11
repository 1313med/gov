const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const {
  rolesFromRegistrationIntent,
  getUserRoles,
  getPrimaryRole,
  normalizeRoleSlug,
} = require("../utils/userRoles");
const emailService    = require("../utils/emailService");
const whatsappService = require("../utils/whatsappService");

// "none" (not "strict") in production: the web client and the API may live on
// different domains (e.g. vercel.app + onrender.com), and "strict"/"lax" cookies
// are never sent cross-site. Requires secure: true. CORS still restricts origins.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── helpers ──────────────────────────────────────────────────────────────────

function makeToken() {
  const raw    = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
}

async function scheduleVerification(user) {
  if (!user.email || user.isEmailVerified) return;
  const { raw, hashed } = makeToken();
  user.emailVerificationToken   = hashed;
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 h
  await user.save({ validateBeforeSave: false });
  const appBase = (process.env.APP_URL || "goovoiture://").replace(/\/+$/, "");
  const url = `${appBase}/verify-email/${raw}`;
  emailService.sendEmailVerification(user, url).catch(() => {});
}

// ── POST /api/auth/register ──────────────────────────────────────────────────
exports.register = asyncHandler(async (req, res) => {
  const { name, phone, password, role, city, email } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!name || !phone || !password || !normalizedEmail) {
    res.status(400);
    throw new Error("name, phone, email and password are required");
  }

  const userExists = await User.findOne({ phone, deletedAt: null });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this phone");
  }

  const emailExists = await User.findOne({ email: normalizedEmail, deletedAt: null });
  if (emailExists) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const intent = normalizeRoleSlug(role || "customer");
  const roles = rolesFromRegistrationIntent(intent);
  const user = await User.create({
    name,
    phone,
    password,
    email: normalizedEmail,
    roles,
    city,
  });

  // Non-blocking side effects
  if (user.email) {
    emailService.sendWelcome(user).catch(() => {});
    scheduleVerification(user).catch(() => {});
  }
  if (user.phone) whatsappService.sendWelcome(user).catch(() => {});

  res.status(201).json({
    message: "Account created. Please verify your email before logging in.",
    requiresEmailVerification: true,
  });
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = asyncHandler(async (req, res) => {
  const identifier = String(req.body.identifier || req.body.phone || "").trim();
  const password = req.body.password;

  if (!identifier || !password) {
    res.status(400);
    throw new Error("identifier and password are required");
  }

  const user = await User.findOne({
    deletedAt: null,
    $or: [
      { phone: identifier },
      { email: identifier.toLowerCase() },
    ],
  });
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error("Your account has been suspended. Please contact support.");
  }

  const ok = await user.matchPassword(password);
  if (!ok) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  if (user.email && !user.isEmailVerified) {
    res.status(403);
    throw new Error("Please verify your email before logging in.");
  }

  const token = generateToken(user);
  res.cookie("token", token, COOKIE_OPTIONS);

  const roles = getUserRoles(user);
  const primaryRole = getPrimaryRole(user);
  res.json({
    _id: user._id,
    name: user.name,
    role: primaryRole,
    roles,
    token,
    staffForOwnerId:  user.staffForOwnerId  || null,
    staffPermissions: user.staffPermissions || null,
  });
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
});

// ── POST /api/auth/forgot-password ──────────────────────────────────────────
exports.forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email, deletedAt: null });

  if (user) {
    const { raw, hashed } = makeToken();
    user.passwordResetToken   = hashed;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 h
    await user.save({ validateBeforeSave: false });

    const appBase = (process.env.APP_URL || "goovoiture://").replace(/\/+$/, "");
    const resetUrl = `${appBase}/reset-password/${raw}`;
    emailService.sendPasswordReset(user, resetUrl).catch(() => {});
  }

  // Always return 200 — prevents email enumeration
  res.json({ message: "If an account with that email exists, a password reset link has been sent." });
});

// ── POST /api/auth/reset-password/:token ────────────────────────────────────
exports.resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const rawToken = req.params.token;

  if (!password || password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

  const user = await User.findOne({
    passwordResetToken:   hashed,
    passwordResetExpires: { $gt: Date.now() },
    deletedAt: null,
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired reset link. Please request a new one.");
  }

  user.password             = password;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({ message: "Password reset successfully. You can now log in." });
});

// ── POST /api/auth/send-verification  (protected) ───────────────────────────
exports.sendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.email) {
    res.status(400);
    throw new Error("No email address on your account");
  }
  if (user.isEmailVerified) {
    return res.json({ message: "Email is already verified" });
  }

  await scheduleVerification(user);
  res.json({ message: "Verification email sent" });
});

// ── GET /api/auth/verify-email/:token ───────────────────────────────────────
exports.verifyEmail = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken:   hashed,
    emailVerificationExpires: { $gt: Date.now() },
    deletedAt: null,
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification link. Please request a new one.");
  }

  user.isEmailVerified          = true;
  user.emailVerificationToken   = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ message: "Email verified successfully!" });
});
