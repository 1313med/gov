const mongoose = require("mongoose");

const saleListingSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    description: { type: String },

    price: { type: Number, required: true },
    city: { type: String, required: true },

    // car details
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    mileage: { type: Number },
    fuel: { type: String },     // diesel / petrol / hybrid / electric
    gearbox: { type: String },  // manual / automatic

    images: [{ type: String }], // image URLs (later we use Cloudinary)

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SaleListing", saleListingSchema);
