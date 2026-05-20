const mongoose = require("mongoose");

const fuelLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userCarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserCar",
      required: true,
    },
    date:         { type: Date, required: true, default: Date.now },
    liters:       { type: Number, required: true, min: 0.1 },
    pricePerLiter:{ type: Number, required: true, min: 0 },
    totalCost:    { type: Number },
    kmAtFillup:   { type: Number, required: true, min: 0 },
    fuelType:     { type: String, enum: ["essence", "diesel", "hybride", "electrique"], default: "essence" },
    note:         { type: String, maxlength: 300, default: "" },
  },
  { timestamps: true }
);

fuelLogSchema.pre("save", function () {
  if (this.liters && this.pricePerLiter) {
    this.totalCost = Math.round(this.liters * this.pricePerLiter * 100) / 100;
  }
});

fuelLogSchema.index({ userCarId: 1, date: -1 });
fuelLogSchema.index({ userId: 1 });

module.exports = mongoose.model("FuelLog", fuelLogSchema);
