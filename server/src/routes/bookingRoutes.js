const express = require("express");
const router = express.Router();

const {
  getMyBookings,
  getBookingsForOwner,
  updateBookingStatus,
  updateBookingDates,
} = require("../controllers/bookingController");

const { protect, role } = require("../middlewares/authMiddleware");

/*
|--------------------------------------------------------------------------
| CUSTOMER
|--------------------------------------------------------------------------
*/
router.get(
  "/mine",
  protect,
  role("customer"),
  getMyBookings
);

/*
|--------------------------------------------------------------------------
| RENTAL OWNER
|--------------------------------------------------------------------------
*/
router.get(
  "/owner",
  protect,
  role("rental_owner"),
  getBookingsForOwner
);

router.put(
  "/:id/status",
  protect,
  role("rental_owner"),
  updateBookingStatus
);

/*
|--------------------------------------------------------------------------
| Update booking dates (Drag & Drop calendar)
|--------------------------------------------------------------------------
*/
router.put(
  "/:id/dates",
  protect,
  role("rental_owner"),
  updateBookingDates
);

module.exports = router;