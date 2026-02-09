const mongoose = require("mongoose");

const rentalListingSchema = new mongoose.Schema(
  {
    // Who owns this rental car
    rentalOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String },

    // 💰 Rental pricing
    pricePerDay: { type: Number, required: true },

    city: { type: String, required: true },

    // 🚗 Car details (similar to SaleListing, but independent)
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    mileage: { type: Number },
    fuel: { type: String },     // diesel / petrol / hybrid / electric
    gearbox: { type: String },  // manual / automatic

    images: [{ type: String }],

    // 📅 Availability ranges
    availability: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],

    // 📌 Admin moderation status
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "unavailable"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RentalListing", rentalListingSchema);
