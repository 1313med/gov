const express = require("express");
const router  = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/customerFeedbackController");

router.post(   "/",                      protect, role("rental_owner"),         ctrl.submitFeedback);
router.get(    "/booking/:bookingId",    protect, role("rental_owner", "admin"), ctrl.getFeedbackForBooking);
router.get(    "/customer/:customerId",  protect, role("rental_owner", "admin"), ctrl.getFeedbackForCustomer);

module.exports = router;
