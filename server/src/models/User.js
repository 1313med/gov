const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
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

    // Account status (admin can ban)
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },

    // Favorites
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "SaleListing" }],
    rentalFavorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "RentalListing" }],
  },
  { timestamps: true }
);

// Performance index
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password
userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
