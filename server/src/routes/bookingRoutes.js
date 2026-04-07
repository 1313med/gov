const express = require("express");
const router = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const {
  getMyBookings,
  getBookingsForOwner,
  updateBookingStatus,
  cancelBooking,
  updateBookingDates,
  markBookingPaid,
  updateBookingMedia,
} = require("../controllers/bookingController");

// Customer
router.get("/mine", protect, role("customer"), getMyBookings);
router.put("/:id/cancel", protect, role("customer"), cancelBooking);

// Rental owner
router.get("/owner", protect, role("rental_owner"), getBookingsForOwner);
router.put("/:id/status", protect, role("rental_owner"), updateBookingStatus);
router.put("/:id/dates", protect, role("rental_owner"), updateBookingDates);
router.put("/:id/paid",  protect, role("rental_owner"), markBookingPaid);
router.put("/:id/media", protect, role("rental_owner"), updateBookingMedia);

module.exports = router;
