const express = require("express");
const router  = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/listingReportController");

router.post("/",           protect,               ctrl.reportListing);
router.get("/admin",       protect, role("admin"), ctrl.adminGetReports);
router.put("/admin/:id",   protect, role("admin"), ctrl.adminUpdateReport);

module.exports = router;
