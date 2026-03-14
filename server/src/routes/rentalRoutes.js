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
  getBookingsForRental,
} = require("../controllers/rentalController");

const { protect, role } = require("../middlewares/authMiddleware");

// PUBLIC
router.get("/", getRentals);

// OWNER ROUTES (must come before :id)
router.get("/owner/bookings", protect, role("rental_owner"), getOwnerBookings);

// ADMIN
router.get("/admin", protect, role("admin"), getAdminRentals);
router.put("/admin/:id/status", protect, role("admin"), updateRentalStatus);

// BOOKING
router.post("/:id/book", protect, role("customer"), createBooking);

// RENTAL DETAILS
router.get("/:id/bookings", getBookingsForRental);
router.get("/:id", getRentalById);

// CREATE RENTAL
router.post("/", protect, role("rental_owner"), createRental);

module.exports = router;
