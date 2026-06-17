const express = require("express");
const router  = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/kycController");

router.get("/me",                    protect, ctrl.getMyKyc);
router.put("/me",                    protect, ctrl.submitKyc);
router.get("/trust/:userId",         protect, ctrl.getRenterTrustPassport);
router.get("/trust-passport/:userId", protect, ctrl.getRenterTrustPassport);
router.put("/admin/:userId/verify",  protect, role("admin"), ctrl.adminVerifyKyc);

module.exports = router;
