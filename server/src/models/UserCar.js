const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema(
  {
    expiryDate: { type: Date, default: null },
    alertSentAt: { type: Date, default: null }, // last time we sent an expiry alert
  },
  { _id: false }
);

const userCarSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Identity ───────────────────────────────────────────────────────────────
    brand:          { type: String, required: true, trim: true },
    model:          { type: String, trim: true },
    year:           { type: Number },
    firstOwner:     { type: Boolean, default: true },
    fuelType:       { type: String, enum: ["essence", "diesel", "hybride", "electrique"] },
    gearbox:        { type: String, enum: ["manuelle", "automatique"] },
    currentMileage: { type: Number },
    lastMileageAt:  { type: Date, default: null },
    color:          { type: String, trim: true },
    image:          { type: String, trim: true },   // Cloudinary URL

    /** Reminder preferences for Mon Garage */
    garageSettings: {
      remindersEnabled: { type: Boolean, default: true },
    },

    // ── Administrative papers ──────────────────────────────────────────────────
    assurance: {
      startDate:  { type: Date, default: null },
      expiryDate: { type: Date, default: null },
      alertSentAt: { type: Date, default: null },
    },
    visiteTechnique: paperSchema,
    vignette:        paperSchema,
    permis: {
      expiryDate:  { type: Date, default: null },
      alertSentAt: { type: Date, default: null },
    },

    // ── Mechanical ─────────────────────────────────────────────────────────────
    vidange: {
      lastDate:        { type: Date, default: null },
      lastKm:          { type: Number, default: null },
      intervalKm:      { type: Number, default: 10000 },
      brand:           { type: String, trim: true },
      alertSentAt:     { type: Date, default: null },
    },
    pneus: {
      lastChangeDate:  { type: Date, default: null },
      brand:           { type: String, trim: true },
      alertSentAt:     { type: Date, default: null },
    },
    batterie: {
      lastChangeDate:  { type: Date, default: null },
      brand:           { type: String, trim: true },
      alertSentAt:     { type: Date, default: null },
    },
    chainDistribution: {
      lastChangeDate:  { type: Date, default: null },
      lastKm:          { type: Number, default: null },
      alertSentAt:     { type: Date, default: null },
    },
    freins: {
      lastChangeDate:  { type: Date, default: null },
      brand:           { type: String, trim: true },
      alertSentAt:     { type: Date, default: null },
    },

    // ── Soft delete ────────────────────────────────────────────────────────────
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userCarSchema.index({ userId: 1, deletedAt: 1 });

module.exports = mongoose.model("UserCar", userCarSchema);
