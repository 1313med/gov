const express = require("express");
const router  = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/staffController");

router.post("/invite",               protect, role("rental_owner"), ctrl.inviteStaff);
router.post("/accept",               protect,                       ctrl.acceptInvite);
router.get("/my-team",               protect, role("rental_owner"), ctrl.getMyStaff);
router.delete("/:userId",            protect, role("rental_owner"), ctrl.removeStaff);
router.put("/:userId/permissions",   protect, role("rental_owner"), ctrl.updateStaffPermissions);

module.exports = router;
