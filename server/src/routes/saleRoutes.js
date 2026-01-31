const express = require("express");
const router = express.Router();

const { protect, role } = require("../middlewares/authMiddleware");

const {
  createSaleListing,
  getMySaleListings,
  deleteSaleListing,
  getApprovedSaleListings,
  getSaleById,
  updateSaleListing
} = require("../controllers/saleController");

// PUBLIC ROUTES
router.get("/", getApprovedSaleListings);

// SELLER ROUTES
router.get("/mine", protect, role("seller", "admin"), getMySaleListings);
router.post("/", protect, role("seller", "admin"), createSaleListing);
router.put("/:id", protect, role("seller", "admin"), updateSaleListing);
router.delete("/:id", protect, role("seller", "admin"), deleteSaleListing);

// DYNAMIC ROUTE (MUST ALWAYS BE LAST)
router.get("/:id", getSaleById);

module.exports = router;
