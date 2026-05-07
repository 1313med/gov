const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  addFavorite, removeFavorite, getFavorites,
  addRentalFavorite, removeRentalFavorite, getRentalFavorites,
  getSellerProfile,
  getMyProfile, updateMyProfile,
  updateDriverLicense, updateNationalId,
} = require("../controllers/userController");

// Profile
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);
router.put("/me/license", protect, updateDriverLicense);
router.put("/me/national-id", protect, updateNationalId);

// Sale favorites
router.get("/favorites", protect, getFavorites);
router.post("/favorites/:id", protect, addFavorite);
router.delete("/favorites/:id", protect, removeFavorite);

// Rental favorites
router.get("/rental-favorites", protect, getRentalFavorites);
router.post("/rental-favorites/:id", protect, addRentalFavorite);
router.delete("/rental-favorites/:id", protect, removeRentalFavorite);

// Public seller profile
router.get("/seller/:id", getSellerProfile);

module.exports = router;
