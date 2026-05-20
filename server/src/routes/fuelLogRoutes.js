const express = require("express");
const router  = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/fuelLogController");

router.post("/",                           protect, ctrl.addFuelLog);
router.get("/:carId",                      protect, ctrl.getFuelLogs);
router.get("/:carId/cost-of-ownership",    protect, ctrl.getCostOfOwnership);
router.delete("/:id",                      protect, ctrl.deleteFuelLog);

module.exports = router;
