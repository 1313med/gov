const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const SaleListing = require("../models/SaleListing");

// ===================== FAVORITES =====================

exports.addFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.favorites.includes(req.params.id)) {
    user.favorites.push(req.params.id);
  }

  await user.save();
  res.json({ favorites: user.favorites });
});

exports.removeFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.favorites = user.favorites.filter(
    (fav) => fav.toString() !== req.params.id
  );

  await user.save();
  res.json({ favorites: user.favorites });
});

exports.getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  res.json(user.favorites);
});

// ===================== GET SELLER PROFILE (PUBLIC) =====================

exports.getSellerProfile = asyncHandler(async (req, res) => {
  const seller = await User.findById(req.params.id).select(
    "name phone city role"
  );

  if (!seller) {
    return res.status(404).json({ message: "Seller not found" });
  }

  const listings = await SaleListing.find({
    sellerId: seller._id,
    status: "approved",
  }).sort({ createdAt: -1 });

  res.json({
    seller,
    listings,
  });
});

