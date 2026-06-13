const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/marketController");

router.get("/prices", ctrl.getMarketPrices);
router.get("/trends", ctrl.getMarketTrends);
router.get("/dataset", ctrl.getMarketDataset);

module.exports = router;
