const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const Notification = require("../models/Notification");

// GET my notifications (non-archived by default; ?scope=archived for archived only)
router.get("/", protect, async (req, res) => {
  const q = { user: req.user._id };
  if (String(req.query.scope || "").toLowerCase() === "archived") {
    q.archived = true;
  } else {
    q.archived = { $ne: true };
  }
  const notifications = await Notification.find(q).sort({ createdAt: -1 });

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

// ARCHIVE / RESTORE (inbox cleanup — hidden from default list when archived)
router.put("/:id/archive", protect, async (req, res) => {
  const archived = !!req.body?.archived;
  const result = await Notification.updateOne(
    { _id: req.params.id, user: req.user._id },
    { $set: { archived, archivedAt: archived ? new Date() : null } }
  );
  if (result.matchedCount === 0) {
    return res.status(404).json({ message: "Notification not found" });
  }
  res.json({ success: true, archived });
});

module.exports = router;
