const express = require("express");
const router = express.Router();
const {
  createRental, updateRental, deleteRental,
  getRentals, getRentalById,
  createBooking, getOwnerBookings,
  getAdminRentals, updateRentalStatus,
  getBookingsForRental, getMyRentals,
} = require("../controllers/rentalController");
const { protect, role } = require("../middlewares/authMiddleware");

// PUBLIC
router.get("/", getRentals);

// OWNER ROUTES (must come before :id)
router.get("/owner/bookings", protect, role("rental_owner"), getOwnerBookings);
router.get("/owner/mine", protect, role("rental_owner"), getMyRentals);

// ADMIN
router.get("/admin", protect, role("admin"), getAdminRentals);
router.put("/admin/:id/status", protect, role("admin"), updateRentalStatus);

// BOOKING
router.post("/:id/book", protect, role("customer"), createBooking);

// RENTAL DETAILS
router.get("/:id/bookings", getBookingsForRental);
router.get("/:id", getRentalById);

// CRUD (owner)
router.post("/", protect, role("rental_owner"), createRental);
router.put("/:id", protect, role("rental_owner"), updateRental);
router.delete("/:id", protect, role("rental_owner", "admin"), deleteRental);

module.exports = router;
