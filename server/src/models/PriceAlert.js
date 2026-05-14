const mongoose = require("mongoose");

const priceAlertSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    brand:    { type: String, required: true },
    model:    { type: String, default: null },
    maxPrice: { type: Number, required: true },
    minYear:  { type: Number, default: null },
    fuelType: { type: String, default: null },
    city:     { type: String, default: null },
    active:   { type: Boolean, default: true },
    lastNotifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

priceAlertSchema.index({ userId: 1, active: 1 });
priceAlertSchema.index({ brand: 1, active: 1 });

module.exports = mongoose.model("PriceAlert", priceAlertSchema);
