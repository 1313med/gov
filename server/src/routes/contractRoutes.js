const express = require("express");
const router  = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/contractController");

router.get("/:bookingId", protect, ctrl.getContractData);

module.exports = router;
