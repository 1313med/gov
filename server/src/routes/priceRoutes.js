const express = require("express");
const router  = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/priceController");

router.post("/estimate", ctrl.estimatePrice); // public — no auth

router.use(protect);
router.get("/alerts",              ctrl.getAlerts);
router.post("/alerts",             ctrl.createAlert);
router.delete("/alerts/:id",       ctrl.deleteAlert);
router.patch("/alerts/:id/toggle", ctrl.toggleAlert);

module.exports = router;
