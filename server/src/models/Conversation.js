const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    // The two participants
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    // The listing this conversation is about (optional context)
    listingId: { type: mongoose.Schema.Types.ObjectId },
    listingModel: { type: String, enum: ["SaleListing", "RentalListing"] },

    lastMessage: { type: String },
    lastMessageAt: { type: Date },
    // Unread count per user: { userId: count }
    unreadCount: { type: Map, of: Number, default: {} },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
