const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const SaleListing = require("../models/SaleListing");

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
