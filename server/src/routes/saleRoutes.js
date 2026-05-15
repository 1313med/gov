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

// ANY authenticated user can list and manage their own sales
router.get("/mine",   protect, getMySaleListings);
router.post("/",      protect, createSaleListing);

// ADMIN (must come before :id)
router.get("/admin", protect, role("admin"), getAllSaleListingsAdmin);
router.put("/admin/:id/status", protect, role("admin"), updateSaleStatusAdmin);

// OWNER or ADMIN actions on a specific listing
router.put("/:id/sold", protect, markAsSold);
router.put("/:id",      protect, updateSaleListing);
router.delete("/:id",   protect, deleteSaleListing);

// PUBLIC (must be last)
router.get("/:id", getSaleById);

module.exports = router;
