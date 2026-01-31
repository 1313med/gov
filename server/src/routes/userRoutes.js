const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { addFavorite, removeFavorite, getFavorites } = require("../controllers/userController");

router.get("/favorites", protect, getFavorites);
router.post("/favorites/:id", protect, addFavorite);
router.delete("/favorites/:id", protect, removeFavorite);

module.exports = router;
