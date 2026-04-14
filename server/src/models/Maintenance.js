const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RentalListing",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["oil_change", "tire_rotation", "inspection", "repair", "cleaning", "other"],
      required: true,
    },

    cost: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },

    mileageAtService: { type: Number },
    notes:            { type: String },
    provider:         { type: String },   // garage or mechanic name

    // Next service schedule
    nextServiceDate:    { type: Date },
    nextServiceMileage: { type: Number },

    // Soft delete
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

maintenanceSchema.index({ rentalId: 1, deletedAt: 1 });
maintenanceSchema.index({ ownerId:  1, deletedAt: 1 });
maintenanceSchema.index({ nextServiceDate: 1 });

module.exports = mongoose.model("Maintenance", maintenanceSchema);
