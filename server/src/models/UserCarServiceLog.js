const mongoose = require("mongoose");

const userCarServiceLogSchema = new mongoose.Schema(
  {
    userCarId: { type: mongoose.Schema.Types.ObjectId, ref: "UserCar", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "oil_change",
        "tires",
        "brakes",
        "battery",
        "inspection",
        "insurance",
        "repair",
        "cleaning",
        "other",
      ],
      default: "other",
    },
    title: { type: String, trim: true, required: true },
    date: { type: Date, required: true },
    cost: { type: Number, default: 0, min: 0 },
    mileage: { type: Number, default: null },
    provider: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    receiptUrl: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

userCarServiceLogSchema.index({ userCarId: 1, date: -1 });
userCarServiceLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model("UserCarServiceLog", userCarServiceLogSchema);
