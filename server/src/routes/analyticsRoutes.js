const express = require("express");
const router = express.Router();

const {
  getOwnerAnalytics,
} = require("../controllers/analyticsController");

const { protect, role } = require("../middlewares/authMiddleware");

/*
|--------------------------------------------------------------------------
| OWNER ANALYTICS
|--------------------------------------------------------------------------
*/
router.get(
  "/owner",
  protect,
  role("rental_owner"),
  getOwnerAnalytics
);

module.exports = router;