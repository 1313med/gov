const mongoose = require("mongoose");

const staffInviteSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    /** Phone number of the invited staff member */
    phone: { type: String, required: true, trim: true },
    name:  { type: String, required: true, trim: true },

    permissions: {
      manageBookings: { type: Boolean, default: true },
      manageMessages: { type: Boolean, default: true },
      viewAnalytics:  { type: Boolean, default: false },
      managePricing:  { type: Boolean, default: false },
    },

    /** Token sent to the staff member to accept the invite */
    token:     { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "accepted", "revoked"],
      default: "pending",
    },
    /** Set when the invite is accepted (links to the User who accepted) */
    acceptedByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

staffInviteSchema.index({ ownerId: 1 });
staffInviteSchema.index({ phone: 1 });
staffInviteSchema.index({ token: 1 });

module.exports = mongoose.model("StaffInvite", staffInviteSchema);
