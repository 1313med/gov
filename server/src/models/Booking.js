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

    // Soft delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1, deletedAt: 1 });
bookingSchema.index({ rentalId: 1, deletedAt: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
