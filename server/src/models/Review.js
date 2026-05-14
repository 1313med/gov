const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Target can be a SaleListing, RentalListing, or User (seller/owner)
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetModel",
    },
    targetModel: {
      type: String,
      required: true,
      enum: ["SaleListing", "RentalListing", "User"],
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    /** When set, this row was created from post-trip booking feedback (one public review per booking). */
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
  },
  { timestamps: true }
);

// Trip-feedback reviews: at most one listing review document per booking
reviewSchema.index({ bookingId: 1 }, { unique: true, sparse: true });
// Manual “write a review” on a listing: one per author per target when not tied to a booking
reviewSchema.index(
  { authorId: 1, targetId: 1, targetModel: 1 },
  {
    unique: true,
    partialFilterExpression: {
      $or: [{ bookingId: { $exists: false } }, { bookingId: null }],
    },
  }
);
reviewSchema.index({ targetId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
