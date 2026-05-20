const mongoose = require("mongoose");

const blacklistedRenterSchema = new mongoose.Schema(
  {
    /** The rental owner who flagged this renter */
    reportedByOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /** The customer being flagged */
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /** The booking associated with the incident (optional) */
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    reason: {
      type: String,
      enum: ["damage", "late_return", "no_show", "fraud", "abusive_behavior", "other"],
      required: true,
    },
    note: { type: String, maxlength: 1000, default: "" },

    /** Admin-reviewed: confirmed = platform-wide warning shown to all owners */
    adminStatus: {
      type: String,
      enum: ["pending_review", "confirmed", "dismissed"],
      default: "pending_review",
    },
  },
  { timestamps: true }
);

blacklistedRenterSchema.index({ renterId: 1 });
blacklistedRenterSchema.index({ reportedByOwnerId: 1 });
blacklistedRenterSchema.index({ adminStatus: 1 });
// Prevent same owner from flagging same renter twice for the same booking
blacklistedRenterSchema.index(
  { reportedByOwnerId: 1, renterId: 1, bookingId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("BlacklistedRenter", blacklistedRenterSchema);
