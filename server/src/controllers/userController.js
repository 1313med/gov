const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const SaleListing = require("../models/SaleListing");
const RentalListing = require("../models/RentalListing");
const {
  getUserRoles,
  getPrimaryRole,
  normalizeRoleSlug,
} = require("../utils/userRoles");

// ── SALE FAVORITES ─────────────────────────────────────────────────────────

exports.addFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.favorites.includes(req.params.id)) user.favorites.push(req.params.id);
  await user.save();
  res.json({ favorites: user.favorites });
});

exports.removeFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.favorites = user.favorites.filter((fav) => fav.toString() !== req.params.id);
  await user.save();
  res.json({ favorites: user.favorites });
});

exports.getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  res.json(user.favorites);
});

// ── RENTAL FAVORITES ───────────────────────────────────────────────────────

exports.addRentalFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.rentalFavorites.includes(req.params.id)) user.rentalFavorites.push(req.params.id);
  await user.save();
  res.json({ rentalFavorites: user.rentalFavorites });
});

exports.removeRentalFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.rentalFavorites = user.rentalFavorites.filter((f) => f.toString() !== req.params.id);
  await user.save();
  res.json({ rentalFavorites: user.rentalFavorites });
});

exports.getRentalFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("rentalFavorites");
  res.json(user.rentalFavorites);
});

// ── PROFILE ────────────────────────────────────────────────────────────────

exports.getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  const json = user.toObject();
  json.roles = getUserRoles(user);
  json.role = getPrimaryRole(user);
  res.json(json);
});

/** Add a capability role (customer is always present). Body: { role: "car_owner" | "rental_owner" } */
exports.addMyRole = asyncHandler(async (req, res) => {
  const slug = normalizeRoleSlug(req.body.role);
  if (!["car_owner", "rental_owner"].includes(slug)) {
    res.status(400);
    throw new Error("Only car_owner or rental_owner can be added");
  }
  const user = await User.findById(req.user._id);
  const next = new Set(getUserRoles(user));
  next.add(slug);
  user.roles = [...next];
  user.role = getPrimaryRole(user);
  await user.save();
  const updated = await User.findById(user._id).select("-password");
  const json = updated.toObject();
  json.roles = getUserRoles(updated);
  json.role = getPrimaryRole(updated);
  res.json(json);
});

exports.updateMyProfile = asyncHandler(async (req, res) => {
  const { name, city, bio, avatar, email } = req.body;
  const user = await User.findById(req.user._id);

  if (name)   user.name   = name;
  if (city)   user.city   = city;
  if (bio !== undefined)    user.bio    = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (email !== undefined)  user.email  = email;

  await user.save();
  const updated = await User.findById(user._id).select("-password");
  res.json(updated);
});

// ── DRIVER LICENSE ─────────────────────────────────────────────────────────

exports.updateDriverLicense = asyncHandler(async (req, res) => {
  const { number, expiryDate, imageUrl } = req.body;
  const user = await User.findById(req.user._id);

  if (!number || !imageUrl) {
    res.status(400);
    throw new Error("License number and image are required");
  }

  user.driverLicense = {
    number:     number.trim(),
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    imageUrl,
    verified:   false, // reset verification when re-uploaded
  };
  await user.save();
  const updated = await User.findById(user._id).select("-password");
  res.json(updated);
});

exports.updateNationalId = asyncHandler(async (req, res) => {
  const { number, imageUrl } = req.body;
  const user = await User.findById(req.user._id);

  if (!number || !imageUrl) {
    res.status(400);
    throw new Error("National ID number and image are required");
  }

  user.nationalId = {
    number:   number.trim(),
    imageUrl,
    verified: false,
  };
  await user.save();
  const updated = await User.findById(user._id).select("-password");
  res.json(updated);
});

// ── SELLER PROFILE (PUBLIC) ────────────────────────────────────────────────

exports.getSellerProfile = asyncHandler(async (req, res) => {
  const seller = await User.findById(req.params.id).select("name phone city role bio avatar");
  if (!seller) return res.status(404).json({ message: "Seller not found" });

  const [listings, rentalListings] = await Promise.all([
    SaleListing.find({ sellerId: seller._id, status: "approved" }).sort({ createdAt: -1 }),
    RentalListing.find({ rentalOwnerId: seller._id, status: "approved" }).sort({ createdAt: -1 }),
  ]);

  res.json({ seller, listings, rentalListings });
});
