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
  },
  { timestamps: true }
);

// One review per user per target
reviewSchema.index({ authorId: 1, targetId: 1 }, { unique: true });
reviewSchema.index({ targetId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
