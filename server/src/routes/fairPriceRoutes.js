const express = require("express");
const router  = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/fairPriceController");

router.get("/sale",       protect, ctrl.getSaleFairPrice);
router.get("/rental",     protect, ctrl.getRentalFairPrice);
router.get("/competitor", protect, ctrl.getCompetitorPricing);

module.exports = router;
