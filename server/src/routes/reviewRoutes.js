const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getReviews, createReview, deleteReview } = require("../controllers/reviewController");

// GET /api/reviews/:targetModel/:targetId  (public)
router.get("/:targetModel/:targetId", getReviews);

// POST /api/reviews/:targetModel/:targetId (authenticated)
router.post("/:targetModel/:targetId", protect, createReview);

// DELETE /api/reviews/:id (author or admin)
router.delete("/:id", protect, deleteReview);

module.exports = router;
