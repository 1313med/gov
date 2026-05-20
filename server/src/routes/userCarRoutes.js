const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getMyCar,
  createCar,
  updateCar,
  deleteCar,
  patchMileage,
  patchGarageSettings,
  patchDocuments,
} = require("../controllers/userCarController");
const {
  listServiceLogs,
  createServiceLog,
  deleteServiceLog,
} = require("../controllers/userCarServiceLogController");

router.use(protect);

router.get("/mine", getMyCar);
router.get("/mine/services", listServiceLogs);
router.post("/mine/services", createServiceLog);
router.post("/", createCar);
router.patch("/:id/mileage", patchMileage);
router.patch("/:id/reminders", patchGarageSettings);
router.patch("/:id/documents", patchDocuments);
router.put("/:id", updateCar);
router.delete("/services/:logId", deleteServiceLog);
router.delete("/:id", deleteCar);

module.exports = router;
