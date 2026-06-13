const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    password: { type: String, required: true },

    /** @deprecated Legacy single role — kept in sync with `roles` for older clients */
    role: {
      type: String,
      enum: ["customer", "seller", "car_owner", "rental_owner", "admin"],
      default: "customer",
    },

    /** Account capabilities — users can hold multiple roles */
    roles: {
      type: [String],
      enum: ["customer", "car_owner", "rental_owner", "admin"],
      default: undefined,
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

    // National ID / CIN (required before renting)
    nationalId: {
      number:   { type: String, default: null },
      imageUrl: { type: String, default: null },
      verified: { type: Boolean, default: false },
    },

    // Favorites
    favorites:       [{ type: mongoose.Schema.Types.ObjectId, ref: "SaleListing" }],
    rentalFavorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "RentalListing" }],

    /** Rental owner: last time they opened listing-views; used to badge "new" views on home. */
    rentalListingViewsSeenAt: { type: Date, default: null },

    /** Referral system */
    referralCode:    { type: String, unique: true, sparse: true },
    referredBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    referralCredits: { type: Number, default: 0 },  // MAD credits earned

    /** Business entity profile (agencies, dealers) */
    businessProfile: {
      businessName: { type: String, default: null },
      logo: { type: String, default: null },
      address: { type: String, default: null },
      whatsapp: { type: String, default: null },
      openingHours: { type: String, default: null },
      website: { type: String, default: null },
      yearsInBusiness: { type: Number, default: null },
    },
    staffPermissions: {
      manageBookings:  { type: Boolean, default: true },
      manageMessages:  { type: Boolean, default: true },
      viewAnalytics:   { type: Boolean, default: false },
      managePricing:   { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ email: 1 });
userSchema.index({ deletedAt: 1 });

const {
  getUserRoles,
  getPrimaryRole,
  normalizeRoleSlug,
  rolesFromRegistrationIntent,
} = require("../utils/userRoles");

userSchema.pre("save", async function () {
  if (this.isModified("role") && !this.isModified("roles")) {
    const intent = normalizeRoleSlug(this.role);
    this.roles = rolesFromRegistrationIntent(intent === "customer" ? "customer" : intent);
  }
  if (!this.roles?.length) {
    this.roles = getUserRoles(this);
  } else {
    this.roles = getUserRoles({ roles: this.roles, role: this.role });
  }
  this.role = getPrimaryRole(this);

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.matchPassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
