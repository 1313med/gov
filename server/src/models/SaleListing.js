const mongoose = require("mongoose");

const saleListingSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title:       { type: String, required: true },
    description: { type: String },

    price: { type: Number, required: true },
    city:  { type: String, required: true },

    // Car details
    brand:   { type: String, required: true },
    model:   { type: String, required: true },
    year:    { type: Number, required: true },
    mileage: { type: Number },
    fuel:    { type: String },     // diesel / petrol / hybrid / electric
    gearbox: { type: String },     // manual / automatic
    color:   { type: String },
    doors:   { type: Number },
    seats:   { type: Number },
    features: [{ type: String }],  // AC, GPS, Bluetooth, etc.

    images: [{ type: String }],

    viewCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold"],
      default: "pending",
    },

    // Soft delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

saleListingSchema.index({ title: "text", brand: "text", model: "text", city: "text", description: "text" });
saleListingSchema.index({ status: 1, deletedAt: 1 });
saleListingSchema.index({ sellerId: 1, deletedAt: 1 });
saleListingSchema.index({ city: 1 });
saleListingSchema.index({ brand: 1 });
saleListingSchema.index({ price: 1 });

module.exports = mongoose.model("SaleListing", saleListingSchema);
