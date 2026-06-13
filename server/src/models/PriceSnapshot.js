const mongoose = require("mongoose");

/** Historical price observations from marketplace listings — powers trends & datasets. */
const priceSnapshotSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, index: true },
    model: { type: String, required: true, index: true },
    year: { type: Number },
    city: { type: String },
    intent: { type: String, enum: ["sale", "rental"], required: true, index: true },
    price: { type: Number, required: true },
    mileage: { type: Number },
    listingId: { type: mongoose.Schema.Types.ObjectId, required: true },
    event: { type: String, enum: ["listed", "updated", "sold"], default: "listed" },
    recordedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

priceSnapshotSchema.index({ brand: 1, model: 1, intent: 1, recordedAt: -1 });

module.exports = mongoose.model("PriceSnapshot", priceSnapshotSchema);
