const asyncHandler = require("express-async-handler");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const { emitMessage } = require("../utils/socketManager");
const emailService = require("../utils/emailService");

// GET /api/messages/conversations  – list all conversations for current user
exports.getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .populate("participants", "name avatar role")
    .sort({ lastMessageAt: -1 });

  res.json(conversations);
});

// POST /api/messages/conversations  – start or get existing conversation
exports.startConversation = asyncHandler(async (req, res) => {
  const { recipientId, listingId, listingModel } = req.body;

  if (!recipientId) {
    res.status(400);
    throw new Error("recipientId is required");
  }

  if (recipientId.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error("Cannot message yourself");
  }

  // Find existing conversation between the two users about the same listing
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, recipientId] },
    ...(listingId ? { listingId } : {}),
  }).populate("participants", "name avatar role");

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
      listingId: listingId || null,
      listingModel: listingModel || null,
    });
    conversation = await conversation.populate("participants", "name avatar role");
  }

  res.json(conversation);
});

// GET /api/messages/:conversationId  – get messages in a conversation
exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }
  if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error("Forbidden");
  }

  const messages = await Message.find({ conversationId })
    .populate("senderId", "name avatar")
    .sort({ createdAt: 1 });

  // Mark all messages not sent by current user as read
  await Message.updateMany(
    { conversationId, senderId: { $ne: req.user._id }, read: false },
    { read: true }
  );

  // Reset unread count for current user
  conversation.unreadCount.set(req.user._id.toString(), 0);
  await conversation.save();

  res.json(messages);
});

// POST /api/messages/:conversationId  – send a message
exports.sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    res.status(400);
    throw new Error("Message text is required");
  }

  const conversation = await Conversation.findById(conversationId).populate(
    "participants",
    "name email avatar"
  );
  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }
  if (!conversation.participants.some((p) => p._id.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error("Forbidden");
  }

  const message = await Message.create({
    conversationId,
    senderId: req.user._id,
    text: text.trim(),
  });

  const populated = await message.populate("senderId", "name avatar");

  // Update conversation metadata
  conversation.lastMessage = text.trim().substring(0, 100);
  conversation.lastMessageAt = new Date();

  // Increment unread for recipient(s)
  conversation.participants.forEach((p) => {
    if (p._id.toString() !== req.user._id.toString()) {
      const current = conversation.unreadCount.get(p._id.toString()) || 0;
      conversation.unreadCount.set(p._id.toString(), current + 1);
    }
  });

  await conversation.save();

  // Real-time emit to recipient(s)
  conversation.participants.forEach((p) => {
    if (p._id.toString() !== req.user._id.toString()) {
      emitMessage(p._id.toString(), populated);
      // Send email notification (don't await to avoid blocking)
      if (p.email) {
        emailService.sendNewMessage(req.user, p, text.trim().substring(0, 200)).catch(() => {});
      }
    }
  });

  res.status(201).json(populated);
});
