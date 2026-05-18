const express = require("express");
const router = express.Router();
const {
  createRental, updateRental, deleteRental,
  getRentals, getRentalById,
  createBooking, getOwnerBookings,
  getAdminRentals, updateRentalStatus,
  getBookingsForRental, getMyRentals,
  getOwnerListingViews,
  getOwnerListingViewAttentionCount,
  markOwnerListingViewsSeen,
  recordRentalView,
} = require("../controllers/rentalController");
const { protect, role } = require("../middlewares/authMiddleware");

// PUBLIC
router.get("/", getRentals);

// OWNER ROUTES (must come before :id)
router.get("/owner/bookings", protect, role("rental_owner"), getOwnerBookings);
router.get("/owner/listing-views", protect, role("rental_owner"), getOwnerListingViews);
router.get("/owner/listing-views-attention-count", protect, role("rental_owner"), getOwnerListingViewAttentionCount);
router.post("/owner/listing-views-seen", protect, role("rental_owner"), markOwnerListingViewsSeen);
router.get("/owner/mine", protect, role("rental_owner"), getMyRentals);

// ADMIN
router.get("/admin", protect, role("admin"), getAdminRentals);
router.put("/admin/:id/status", protect, role("admin"), updateRentalStatus);

// BOOKING (any logged-in role can book another owner’s car; self-book blocked in controller)
router.post(
  "/:id/book",
  protect,
  role("customer", "car_owner", "rental_owner", "admin"),
  createBooking
);

// RENTAL DETAILS
router.get("/:id/bookings", getBookingsForRental);
router.post("/:id/record-view", recordRentalView);
router.get("/:id", getRentalById);

// CRUD (owner)
router.post("/", protect, role("rental_owner"), createRental);
router.put("/:id", protect, role("rental_owner"), updateRental);
router.delete("/:id", protect, role("rental_owner", "admin"), deleteRental);

module.exports = router;
