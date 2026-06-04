const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { mechanicChat } = require("../controllers/mechanicController");

// Any authenticated user can use the mechanic chat
router.post("/chat", protect, mechanicChat);

module.exports = router;
