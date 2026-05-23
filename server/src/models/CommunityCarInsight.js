const mongoose = require("mongoose");

const communityCarInsightSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true, lowercase: true },
    model: { type: String, trim: true, default: "", lowercase: true },
    type: {
      type: String,
      enum: ["common_issue", "maintenance_tip", "fuel_average", "reliability", "cost_tip"],
      default: "maintenance_tip",
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    body: { type: String, required: true, trim: true, maxlength: 800 },
    kmMention: { type: Number },
    city: { type: String, trim: true, default: "" },
    upvotes: { type: Number, default: 1 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approved: { type: Boolean, default: true },
  },
  { timestamps: true }
);

communityCarInsightSchema.index({ brand: 1, model: 1, approved: 1 });

module.exports = mongoose.model("CommunityCarInsight", communityCarInsightSchema);
