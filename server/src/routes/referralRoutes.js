const express = require("express");
const router  = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/referralController");

router.get("/me",      protect, ctrl.getMyReferral);
router.post("/apply",  protect, ctrl.applyReferralCode);

module.exports = router;
