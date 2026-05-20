const express = require("express");
const router  = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/creditCheckController");

router.post("/",                        protect, ctrl.requestCreditCheck);
router.get("/my",                       protect, ctrl.getMyCreditChecks);
router.get("/listing/:listingId",       protect, ctrl.getListingCreditStatus);
router.get("/:id",                      protect, ctrl.getCreditCheckById);
router.put("/admin/:id",                protect, role("admin"), ctrl.adminUpdateCreditCheck);

module.exports = router;
