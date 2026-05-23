const express = require("express");
const router = express.Router();
const { protect, optionalAuth } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/garageIntelController");

router.get("/mechanic-prices", ctrl.listMechanicPrices);
router.post("/mechanic-prices/evaluate", ctrl.evaluateMechanicQuote);
router.post("/mechanic-prices/submit", optionalAuth, ctrl.submitMechanicPrice);

router.get("/emergency-guide", ctrl.getEmergencyGuide);

router.post("/car-worth/preview", ctrl.previewCarWorth);
router.post("/afford", ctrl.affordCalculator);

router.get("/community", ctrl.getCommunityInsights);

router.use(protect);
router.get("/health-score", ctrl.getHealthScore);
router.get("/car-worth", ctrl.getMyCarWorth);
router.get("/fuel-compare/:carId", ctrl.getFuelCompare);
router.get("/travel-ready", ctrl.getTravelReady);
router.post("/community", ctrl.postCommunityInsight);

module.exports = router;
