const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/intelligenceController");

router.get("/search-demand", ctrl.getSearchDemand);
router.get("/reliability", ctrl.getReliability);
router.get("/reputation/:userId", ctrl.getReputation);
router.get("/tco", ctrl.getTco);
router.get("/market", ctrl.getMarketIntel);

module.exports = router;
