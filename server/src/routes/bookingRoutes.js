const express = require("express");
const router = express.Router();

const {
  getMyBookings,
  getBookingsForOwner,
  updateBookingStatus,
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

module.exports = router;
