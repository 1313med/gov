const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const SaleListing = require("../models/SaleListing");
const RentalListing = require("../models/RentalListing");

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
  res.json(user);
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
