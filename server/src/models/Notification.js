const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "sold",
        "return_confirm",
        "feedback_request",
        "vehicle_issue",
        "refund_pending",
        "refund_done",
        "rental_ended_feedback",
        "customer_rental_review",
        "garage_expiry",
        "garage_maintenance",
      ],
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    // Optional reference used by return/feedback notification actions
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
