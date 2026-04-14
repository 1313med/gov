const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const emailService = require("../utils/emailService");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, phone, password, role, city, email } = req.body;

  if (!name || !phone || !password) {
    res.status(400);
    throw new Error("name, phone and password are required");
  }

  const userExists = await User.findOne({ phone, deletedAt: null });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this phone");
  }

  const user = await User.create({
    name, phone, password, email,
    role: role || "customer",
    city,
  });

  const token = generateToken(user);

  // Set httpOnly cookie
  res.cookie("token", token, COOKIE_OPTIONS);

  // Send welcome email (non-blocking)
  if (user.email) emailService.sendWelcome(user).catch(() => {});

  // Return user info + token (token included so mobile apps can still use it)
  res.status(201).json({
    _id: user._id,
    name: user.name,
    role: user.role,
    token,
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    res.status(400);
    throw new Error("phone and password are required");
  }

  const user = await User.findOne({ phone, deletedAt: null });
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

  const token = generateToken(user);

  // Set httpOnly cookie
  res.cookie("token", token, COOKIE_OPTIONS);

  res.json({
    _id: user._id,
    name: user.name,
    role: user.role,
    token,
  });
});

// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
  res.json({ message: "Logged out successfully" });
});
