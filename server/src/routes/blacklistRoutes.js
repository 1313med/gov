const express = require("express");
const router  = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/blacklistController");

router.post("/",                     protect, role("rental_owner"), ctrl.flagRenter);
router.get("/my-flags",              protect, role("rental_owner"), ctrl.getMyFlags);
router.get("/renter/:renterId",      protect, role("rental_owner"), ctrl.getRenterFlags);
router.delete("/:id",                protect, role("rental_owner"), ctrl.removeFlag);
router.put("/admin/:id",             protect, role("admin"),        ctrl.adminUpdateFlag);

module.exports = router;
