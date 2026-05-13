const mongoose = require("mongoose");

const rentalViewEventSchema = new mongoose.Schema(
  {
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalListing",
      required: true,
      index: true,
    },
    at: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

rentalViewEventSchema.index({ rentalId: 1, at: -1 });

module.exports = mongoose.model("RentalViewEvent", rentalViewEventSchema);
