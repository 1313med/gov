const express = require("express");
const router = express.Router();
const { protect, role, ownerOrStaff } = require("../middlewares/authMiddleware");
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
  ownerClearBookingNewFlag,
  submitBookingCustomerReview,
  getBookingCustomerReview,
  getOwnerBookingAttentionCount,
  clearOwnerBookingAlerts,
  ownerAckBookingAlert,
  getOwnerBookingOne,
} = require("../controllers/bookingController");

// Customer
router.get("/mine",           protect, role("customer"), getMyBookings);
router.get("/:id/customer-booking-review", protect, getBookingCustomerReview);
router.post("/:id/customer-booking-review", protect, role("customer"), submitBookingCustomerReview);
router.put("/:id/cancel",     protect, role("customer"), cancelBooking);
router.put("/:id/customer-dates", protect, role("customer"), customerRescheduleBooking);
router.put("/:id/confirm-return", protect, role("customer"), confirmReturn);
router.get("/:id/alternative-rentals", protect, role("customer"), getAlternativeRentalsForBooking);
router.put("/:id/vehicle-resolution", protect, role("customer"), chooseCustomerVehicleResolution);

// Rental owner
router.get("/owner/attention-count", protect, ownerOrStaff, getOwnerBookingAttentionCount);
router.post("/owner/clear-booking-alerts", protect, ownerOrStaff, clearOwnerBookingAlerts);
router.get("/owner/booking/:id", protect, ownerOrStaff, getOwnerBookingOne);
router.get("/owner", protect, ownerOrStaff, getBookingsForOwner);
router.put("/:id/owner-clear-booking-new", protect, ownerOrStaff, ownerClearBookingNewFlag);
router.put("/:id/owner-ack-booking-alert", protect, ownerOrStaff, ownerAckBookingAlert);
router.put("/:id/owner-archive", protect, ownerOrStaff, setOwnerBookingArchive);
router.post("/:id/owner-vehicle-issue", protect, ownerOrStaff, declareOwnerVehicleIssue);
router.put("/:id/owner-confirm-vehicle-refund", protect, ownerOrStaff, ownerConfirmVehicleRefund);
router.put("/:id/status", protect, ownerOrStaff, updateBookingStatus);
router.put("/:id/dates", protect, ownerOrStaff, updateBookingDates);
router.put("/:id/paid",  protect, ownerOrStaff, markBookingPaid);
router.put("/:id/media", protect, ownerOrStaff, updateBookingMedia);

module.exports = router;
