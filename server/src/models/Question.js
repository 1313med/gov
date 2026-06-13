const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 3000 },
    verifiedExpert: { type: Boolean, default: false },
    accepted: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, required: true },
    question: { type: String, required: true, maxlength: 300 },
    body: { type: String, maxlength: 2000 },
    brand: { type: String, index: true },
    model: { type: String, index: true },
    topic: {
      type: String,
      enum: ["achat", "location", "assurance", "financement", "demarches", "general"],
      default: "general",
      index: true,
    },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["published", "pending", "hidden"], default: "published" },
    answers: [answerSchema],
    viewCount: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

questionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Question", questionSchema);
