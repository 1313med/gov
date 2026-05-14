const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { getMyCar, createCar, updateCar, deleteCar } = require("../controllers/userCarController");

router.use(protect);

router.get("/mine",  getMyCar);
router.post("/",     createCar);
router.put("/:id",   updateCar);
router.delete("/:id", deleteCar);

module.exports = router;
