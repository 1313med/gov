const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, phone, password, role, city } = req.body;

  if (!name || !phone || !password) {
    res.status(400);
    throw new Error("name, phone and password are required");
  }

  const userExists = await User.findOne({ phone });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists with this phone");
  }

  const user = await User.create({
    name,
    phone,
    password,
    role: role || "customer",
    city,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    role: user.role,
    token: generateToken(user),
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    res.status(400);
    throw new Error("phone and password are required");
  }

  const user = await User.findOne({ phone });
  if (!user) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const ok = await user.matchPassword(password);
  if (!ok) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  res.json({
    _id: user._id,
    name: user.name,
    role: user.role,
    token: generateToken(user),
  });
});
