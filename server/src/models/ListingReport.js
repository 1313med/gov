const mongoose = require("mongoose");

const listingReportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    listingId:   { type: mongoose.Schema.Types.ObjectId, required: true },
    listingModel:{
      type: String,
      enum: ["SaleListing", "RentalListing"],
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "fake_listing",
        "wrong_price",
        "car_under_credit",
        "duplicate",
        "inappropriate_content",
        "scam",
        "other",
      ],
      required: true,
    },
    note:       { type: String, maxlength: 1000, default: "" },
    adminStatus:{
      type: String,
      enum: ["pending", "reviewed", "dismissed", "actioned"],
      default: "pending",
    },
    adminNote:  { type: String, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

listingReportSchema.index({ listingId: 1 });
listingReportSchema.index({ adminStatus: 1 });
// One report per user per listing
listingReportSchema.index({ reporterId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model("ListingReport", listingReportSchema);
