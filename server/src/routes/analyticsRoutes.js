const express = require("express");
const router = express.Router();
const { getOwnerAnalytics, getOwnerInsights } = require("../controllers/analyticsController");
const { protect, role } = require("../middlewares/authMiddleware");

// GET /api/analytics/owner?period=30d|7d|today|3m|1y
router.get("/owner", protect, role("rental_owner"), getOwnerAnalytics);

// GET /api/analytics/owner/insights?period=30d|7d|today|3m|1y
router.get("/owner/insights", protect, role("rental_owner"), getOwnerInsights);

module.exports = router;
