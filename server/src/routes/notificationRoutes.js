const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const Notification = require("../models/Notification");

// GET my notifications
router.get("/", protect, async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.json(notifications);
});

// MARK AS READ
router.put("/:id/read", protect, async (req, res) => {
  const result = await Notification.updateOne(
    { _id: req.params.id, user: req.user._id },
    { $set: { read: true } }
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ message: "Notification not found" });
  }
  res.json({ success: true });
});

module.exports = router;
