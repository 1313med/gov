const mongoose = require("mongoose");

const rentalListingSchema = new mongoose.Schema(
  {
    rentalOwnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title:       { type: String, required: true },
    description: { type: String },

    pricePerDay: { type: Number, required: true },
    city:        { type: String, required: true },

    // Car details
    brand:   { type: String, required: true },
    model:   { type: String, required: true },
    year:    { type: Number, required: true },
    mileage: { type: Number },
    fuel:    { type: String },
    gearbox: { type: String },
    color:   { type: String },
    doors:   { type: Number },
    seats:   { type: Number },
    features: [{ type: String }],

    // Rental-specific
    fuelPolicy: { type: String },
    // flexible = free up to 24h before | moderate = 50% refund up to 48h | strict = no refund within 72h
    cancelPolicy: {
      type: String,
      enum: ["flexible", "moderate", "strict"],
      default: "flexible",
    },
    minRentalDays: { type: Number, default: 1 },

    images: [{ type: String }],

    // Manually blocked periods (maintenance, personal use, etc.)
    availability: [
      {
        startDate: { type: Date, required: true },
        endDate:   { type: Date, required: true },
      },
    ],

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

    offers: [
      {
        type:            { type: String, enum: ["free_days", "percent_discount", "custom"], required: true },
        title:           { type: String, required: true },
        description:     { type: String },
        minDays:         { type: Number, default: 1 },
        freeExtraDays:   { type: Number, default: 0 },
        discountPercent: { type: Number, default: 0 },
        isActive:        { type: Boolean, default: true },
        expiresAt:       { type: Date, default: null },  // null = never expires
      },
    ],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "unavailable"],
      default: "pending",
    },

    // Soft delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

rentalListingSchema.index({
  title: "text", brand: "text", model: "text", city: "text", description: "text",
});
rentalListingSchema.index({ status: 1, deletedAt: 1 });
rentalListingSchema.index({ rentalOwnerId: 1, deletedAt: 1 });
rentalListingSchema.index({ city: 1 });
rentalListingSchema.index({ brand: 1 });
rentalListingSchema.index({ pricePerDay: 1 });

module.exports = mongoose.model("RentalListing", rentalListingSchema);
