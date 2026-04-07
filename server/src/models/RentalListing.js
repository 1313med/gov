const mongoose = require("mongoose");

const rentalListingSchema = new mongoose.Schema(
  {
    rentalOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String },

    pricePerDay: { type: Number, required: true },
    city: { type: String, required: true },

    // Car details
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    mileage: { type: Number },
    fuel: { type: String },     // diesel / petrol / hybrid / electric
    gearbox: { type: String },  // manual / automatic
    color: { type: String },
    doors: { type: Number },
    seats: { type: Number },
    features: [{ type: String }],

    // Rental-specific
    fuelPolicy: { type: String },       // e.g. "Full-to-Full"
    cancelPolicy: { type: String },     // e.g. "Free cancellation 24h before"
    minRentalDays: { type: Number, default: 1 },

    images: [{ type: String }],

    availability: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    ],

    conditionPhotos: {
      before: [{ type: String }],
      after:  [{ type: String }],
    },

    documents: [
      {
        name:     { type: String, required: true },
        url:      { type: String, required: true },
        fileType: { type: String },           // pdf / image
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    offers: [
      {
        type:            { type: String, enum: ["free_days", "percent_discount", "custom"], required: true },
        title:           { type: String, required: true },
        description:     { type: String },
        minDays:         { type: Number, default: 1 },   // min days to qualify
        freeExtraDays:   { type: Number, default: 0 },   // for free_days
        discountPercent: { type: Number, default: 0 },   // for percent_discount
        isActive:        { type: Boolean, default: true },
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "unavailable"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Full-text search index
rentalListingSchema.index({
  title: "text",
  brand: "text",
  model: "text",
  city: "text",
  description: "text",
});

// Performance indexes
rentalListingSchema.index({ status: 1 });
rentalListingSchema.index({ rentalOwnerId: 1 });
rentalListingSchema.index({ city: 1 });
rentalListingSchema.index({ brand: 1 });
rentalListingSchema.index({ pricePerDay: 1 });

module.exports = mongoose.model("RentalListing", rentalListingSchema);
