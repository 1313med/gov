const mongoose = require("mongoose");

const customerFeedbackSchema = new mongoose.Schema(
  {
    bookingId:  { type: mongoose.Schema.Types.ObjectId, ref: "Booking",       required: true, unique: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User",          required: true },
    ownerId:    { type: mongoose.Schema.Types.ObjectId, ref: "User",          required: true },
    rentalId:   { type: mongoose.Schema.Types.ObjectId, ref: "RentalListing", required: true },

    // Overall impression
    overall: { type: String, enum: ["good", "bad"], required: true },

    // Yes / No questions
    hadDamage:        { type: Boolean, required: true }, // true = damage found
    returnedOnTime:   { type: Boolean, required: true }, // true = on time
    carReturnedClean: { type: Boolean, required: true }, // true = clean
    wasRespectful:    { type: Boolean, required: true }, // true = respectful
    wouldRentAgain:   { type: Boolean, required: true }, // true = yes

    note: { type: String, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

customerFeedbackSchema.index({ customerId: 1 });
customerFeedbackSchema.index({ ownerId: 1 });

module.exports = mongoose.model("CustomerFeedback", customerFeedbackSchema);
