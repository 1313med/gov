const express = require("express");
const router = express.Router();
const { getOwnerAnalytics, getOwnerInsights, getOwnerPricing } = require("../controllers/analyticsController");
const { protect, ownerOrStaff } = require("../middlewares/authMiddleware");

// GET /api/analytics/owner?period=30d|7d|today|3m|1y
router.get("/owner", protect, ownerOrStaff, getOwnerAnalytics);

// GET /api/analytics/owner/insights?period=30d|7d|today|3m|1y
router.get("/owner/insights", protect, ownerOrStaff, getOwnerInsights);

// GET /api/analytics/owner/pricing
router.get("/owner/pricing", protect, ownerOrStaff, getOwnerPricing);

module.exports = router;
