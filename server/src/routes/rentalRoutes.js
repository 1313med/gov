const express = require("express");
const router = express.Router();

const {
  createRental,
  getRentals,
  getRentalById,
  createBooking,
  getOwnerBookings,
  getAdminRentals,
  updateRentalStatus,
} = require("../controllers/rentalController");

const { protect, role } = require("../middlewares/authMiddleware");

// Public
router.get("/", getRentals);
router.get("/:id", getRentalById);

// Booking (customer)
router.post("/:id/book", protect, role("customer"), createBooking);

// Rental owner
router.post("/", protect, role("rental_owner"), createRental);
router.get("/owner/bookings", protect, role("rental_owner"), getOwnerBookings);

// Admin
router.get("/admin", protect, role("admin"), getAdminRentals);
router.put("/admin/:id/status", protect, role("admin"), updateRentalStatus);

module.exports = router;
