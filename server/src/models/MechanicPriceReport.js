const mongoose = require("mongoose");

const mechanicPriceReportSchema = new mongoose.Schema(
  {
    serviceKey: {
      type: String,
      required: true,
      enum: [
        "oil_change",
        "brake_pads",
        "brake_discs",
        "labour_hour",
        "timing_belt",
        "battery",
        "tyres_set",
        "injector_clean",
        "clutch",
      ],
    },
    priceMad: { type: Number, required: true, min: 0 },
    city: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: "" },
    model: { type: String, trim: true, default: "" },
    year: { type: Number },
    garageName: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, maxlength: 300 },
    /** Never expose userId in API responses */
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mechanicPriceReportSchema.index({ serviceKey: 1, city: 1, approved: 1 });
mechanicPriceReportSchema.index({ brand: 1, model: 1, serviceKey: 1 });

module.exports = mongoose.model("MechanicPriceReport", mechanicPriceReportSchema);
