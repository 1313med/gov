const mongoose = require("mongoose");

/** Customer’s post-trip review of the rental / owner (one per booking). */
const bookingCustomerReviewSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rentalId: { type: mongoose.Schema.Types.ObjectId, ref: "RentalListing", required: true },
    overall: { type: String, enum: ["good", "bad"], required: true },
    note: { type: String, maxlength: 1500, default: "" },
  },
  { timestamps: true }
);

bookingCustomerReviewSchema.index({ ownerId: 1 });

module.exports = mongoose.model("BookingCustomerReview", bookingCustomerReviewSchema);
