const express = require("express");
const router = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const {
  createSaleListing, getMySaleListings, deleteSaleListing,
  getApprovedSaleListings, getSaleById, updateSaleListing,
  getAllSaleListingsAdmin, updateSaleStatusAdmin, markAsSold,
} = require("../controllers/saleController");

// PUBLIC
router.get("/", getApprovedSaleListings);

// SELLER
router.get("/mine", protect, role("seller", "admin"), getMySaleListings);
router.post("/", protect, role("seller", "admin"), createSaleListing);

// ADMIN (must come before :id)
router.get("/admin", protect, role("admin"), getAllSaleListingsAdmin);
router.put("/admin/:id/status", protect, role("admin"), updateSaleStatusAdmin);

// SELLER ACTIONS
router.put("/:id/sold", protect, role("seller", "admin"), markAsSold);
router.put("/:id", protect, role("seller", "admin"), updateSaleListing);
router.delete("/:id", protect, role("seller", "admin"), deleteSaleListing);

// PUBLIC (must be last)
router.get("/:id", getSaleById);

module.exports = router;
