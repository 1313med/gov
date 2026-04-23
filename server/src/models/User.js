const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["customer", "seller", "rental_owner", "admin"],
      default: "customer",
    },

    city: { type: String },
    bio: { type: String },
    avatar: { type: String },

    // Account status
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },

    // Soft delete (null = active, Date = deleted)
    deletedAt: { type: Date, default: null },

    // Email verification
    isEmailVerified:          { type: Boolean, default: false },
    emailVerificationToken:   { type: String, select: false },
    emailVerificationExpires: { type: Date,   select: false },

    // Password reset
    passwordResetToken:   { type: String, select: false },
    passwordResetExpires: { type: Date,   select: false },

    // Driver license (required before renting)
    driverLicense: {
      number:     { type: String, default: null },
      expiryDate: { type: Date,   default: null },
      imageUrl:   { type: String, default: null },
      verified:   { type: Boolean, default: false }, // admin can mark verified
    },

    // Favorites
    favorites:       [{ type: mongoose.Schema.Types.ObjectId, ref: "SaleListing" }],
    rentalFavorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "RentalListing" }],
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ email: 1 });
userSchema.index({ deletedAt: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
