const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalListing",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate:   { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled", "completed"],
      default: "pending",
    },

    totalAmount:       { type: Number },
    appliedOfferTitle: { type: String },
    isPaid:            { type: Boolean, default: false },
    paidAt:            { type: Date },
    cancelledAt:       { type: Date },

    customerDateChangeUsed: { type: Boolean, default: false },

    conditionPhotos: {
      before: [{ type: String }],
      after:  [{ type: String }],
    },

    documents: [
      {
        name:       { type: String, required: true },
        url:        { type: String, required: true },
        fileType:   { type: String },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Return flow
    customerConfirmedReturn:  { type: Boolean, default: false },
    returnNotificationSent:   { type: Boolean, default: false },

    /** Owner hid this row from the default list after rental ended (mobile / owner UX). */
    ownerArchivedAt: { type: Date, default: null },

    /** Owner reported original vehicle unavailable (far-future booking); customer picks refund or another car. */
    ownerVehicleIssueAt: { type: Date, default: null },
    ownerVehicleIssueNote: { type: String, default: "" },
    vehicleResolutionPhase: {
      type: String,
      enum: [
        "none",
        "awaiting_customer",
        "awaiting_owner_refund",
        "awaiting_owner_diff_refund",
        "resolved_refund",
        "resolved_swap",
      ],
      default: "none",
    },
    /** MAD amount the owner must refund (full booking or price difference after swap). */
    vehicleResolutionRefundMad: { type: Number, default: null },
    vehicleResolutionPreSwapRentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalListing",
      default: null,
    },
    vehicleResolutionPreSwapTotalMad: { type: Number, default: null },
    ownerVehicleRefundConfirmedAt: { type: Date, default: null },

    // Soft delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1, deletedAt: 1 });
bookingSchema.index({ rentalId: 1, deletedAt: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
