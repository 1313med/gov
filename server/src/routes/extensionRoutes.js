const express = require("express");
const router  = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/extensionController");

router.post("/:bookingId",          protect, ctrl.requestExtension);
router.put("/:bookingId/respond",   protect, ctrl.respondExtension);

module.exports = router;
