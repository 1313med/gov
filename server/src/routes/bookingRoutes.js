const express = require("express");
const router = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const {
  getMyBookings,
  getBookingsForOwner,
  updateBookingStatus,
  cancelBooking,
  customerRescheduleBooking,
  updateBookingDates,
  markBookingPaid,
  updateBookingMedia,
  confirmReturn,
  setOwnerBookingArchive,
  declareOwnerVehicleIssue,
  getAlternativeRentalsForBooking,
  chooseCustomerVehicleResolution,
  ownerConfirmVehicleRefund,
} = require("../controllers/bookingController");

// Customer
router.get("/mine",           protect, role("customer"), getMyBookings);
router.put("/:id/cancel",     protect, role("customer"), cancelBooking);
router.put("/:id/customer-dates", protect, role("customer"), customerRescheduleBooking);
router.put("/:id/confirm-return", protect, role("customer"), confirmReturn);
router.get("/:id/alternative-rentals", protect, role("customer"), getAlternativeRentalsForBooking);
router.put("/:id/vehicle-resolution", protect, role("customer"), chooseCustomerVehicleResolution);

// Rental owner
router.get("/owner", protect, role("rental_owner"), getBookingsForOwner);
router.put("/:id/owner-archive", protect, role("rental_owner"), setOwnerBookingArchive);
router.post("/:id/owner-vehicle-issue", protect, role("rental_owner"), declareOwnerVehicleIssue);
router.put("/:id/owner-confirm-vehicle-refund", protect, role("rental_owner"), ownerConfirmVehicleRefund);
router.put("/:id/status", protect, role("rental_owner"), updateBookingStatus);
router.put("/:id/dates", protect, role("rental_owner"), updateBookingDates);
router.put("/:id/paid",  protect, role("rental_owner"), markBookingPaid);
router.put("/:id/media", protect, role("rental_owner"), updateBookingMedia);

module.exports = router;
