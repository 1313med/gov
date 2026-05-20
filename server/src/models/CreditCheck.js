const mongoose = require("mongoose");

const creditCheckSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SaleListing",
      default: null,
    },
    /** Car identification — immatriculation or CIN of registered owner */
    immatriculation: { type: String, trim: true, default: "" },
    ownerCin:        { type: String, trim: true, default: "" },
    brand:           { type: String, trim: true, default: "" },
    model:           { type: String, trim: true, default: "" },
    year:            { type: Number, default: null },

    status: {
      type: String,
      enum: ["pending", "clear", "flagged", "unverifiable"],
      default: "pending",
    },
    /** Admin / operator fills this after manual verification */
    adminNote:    { type: String, maxlength: 1000, default: "" },
    reviewedAt:   { type: Date, default: null },
    reviewedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    /** Fee paid by requester (MAD) — 0 if free tier */
    feePaid: { type: Number, default: 0 },
  },
  { timestamps: true }
);

creditCheckSchema.index({ requesterId: 1 });
creditCheckSchema.index({ listingId: 1 });
creditCheckSchema.index({ status: 1 });

module.exports = mongoose.model("CreditCheck", creditCheckSchema);
