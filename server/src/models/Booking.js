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

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected"],
      default: "pending", // 🔥 IMPORTANT
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
