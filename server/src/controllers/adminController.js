const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const SaleListing = require("../models/SaleListing");
const RentalListing = require("../models/RentalListing");
const Booking = require("../models/Booking");

// GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) filter.role = role;

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
});

// GET /api/admin/users/:id
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

// PUT /api/admin/users/:id/ban
exports.banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot ban an admin");
  }
  user.isBanned = true;
  await user.save();
  res.json({ message: `User ${user.name} has been banned.` });
});

// PUT /api/admin/users/:id/unban
exports.unbanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  user.isBanned = false;
  await user.save();
  res.json({ message: `User ${user.name} has been unbanned.` });
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete an admin account");
  }
  await user.deleteOne();
  res.json({ message: "User deleted" });
});

// GET /api/admin/stats
exports.getStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalSales, totalRentals, totalBookings] = await Promise.all([
    User.countDocuments(),
    SaleListing.countDocuments(),
    RentalListing.countDocuments(),
    Booking.countDocuments(),
  ]);

  const [pendingSales, pendingRentals, bannedUsers] = await Promise.all([
    SaleListing.countDocuments({ status: "pending" }),
    RentalListing.countDocuments({ status: "pending" }),
    User.countDocuments({ isBanned: true }),
  ]);

  res.json({
    totalUsers,
    totalSales,
    totalRentals,
    totalBookings,
    pendingSales,
    pendingRentals,
    bannedUsers,
  });
});
