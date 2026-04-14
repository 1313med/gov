const express = require("express");
const router = express.Router();
const { protect, role } = require("../middlewares/authMiddleware");
const {
  createMaintenance,
  getMaintenanceForRental,
  getAllMaintenance,
  deleteMaintenance,
  updateMaintenance,
} = require("../controllers/maintenanceController");

// All routes require rental_owner role
router.use(protect, role("rental_owner"));

router.post("/",                       createMaintenance);
router.get("/",                        getAllMaintenance);
router.get("/rental/:rentalId",        getMaintenanceForRental);
router.put("/:id",                     updateMaintenance);
router.delete("/:id",                  deleteMaintenance);

module.exports = router;
