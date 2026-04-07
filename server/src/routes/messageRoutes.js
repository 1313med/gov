const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
} = require("../controllers/messageController");

router.get("/conversations", protect, getConversations);
router.post("/conversations", protect, startConversation);
router.get("/:conversationId", protect, getMessages);
router.post("/:conversationId", protect, sendMessage);

module.exports = router;
