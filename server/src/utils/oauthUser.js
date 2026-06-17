const crypto = require("crypto");
const User = require("../models/User");
const {
  rolesFromRegistrationIntent,
  normalizeRoleSlug,
} = require("./userRoles");

const PROVIDER_FIELDS = {
  google: "googleId",
  facebook: "facebookId",
  apple: "appleId",
};

function syntheticPhone(provider, providerId) {
  const digest = crypto
    .createHash("sha256")
    .update(`${provider}:${providerId}`)
    .digest("hex");
  return `+2129${digest.slice(0, 8)}`;
}

function oauthError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function findOrCreateOAuthUser(provider, profile, options = {}) {
  const field = PROVIDER_FIELDS[provider];
  if (!field) throw oauthError("Unsupported OAuth provider");

  const providerId = String(profile.providerId || "").trim();
  if (!providerId) throw oauthError("Invalid OAuth profile");

  const email = profile.email
    ? String(profile.email).trim().toLowerCase()
    : null;
  const name =
    profile.name || (email ? email.split("@")[0] : null) || "Goovoiture User";
  const emailVerified = profile.emailVerified !== false;
  const roleIntent = normalizeRoleSlug(options.role || "customer");
  const safeIntent = roleIntent === "admin" ? "customer" : roleIntent;
  const roles = rolesFromRegistrationIntent(safeIntent);

  let user = await User.findOne({ [field]: providerId, deletedAt: null });
  if (user) {
    if (user.isBanned) {
      throw oauthError(
        "Your account has been suspended. Please contact support.",
        403
      );
    }
    return user;
  }

  if (email) {
    user = await User.findOne({ email, deletedAt: null });
    if (user) {
      if (user.isBanned) {
        throw oauthError(
          "Your account has been suspended. Please contact support.",
          403
        );
      }
      if (!user[field]) user[field] = providerId;
      if (emailVerified && !user.isEmailVerified) user.isEmailVerified = true;
      if (profile.avatar && !user.avatar) user.avatar = profile.avatar;
      const providers = new Set(user.authProviders || []);
      providers.add(provider);
      user.authProviders = [...providers];
      await user.save();
      return user;
    }
  }

  user = await User.create({
    name,
    email: email || undefined,
    phone: syntheticPhone(provider, providerId),
    password: crypto.randomBytes(32).toString("hex"),
    [field]: providerId,
    roles,
    isEmailVerified: emailVerified || !email,
    avatar: profile.avatar || null,
    authProviders: [provider],
  });

  return user;
}

module.exports = { findOrCreateOAuthUser, PROVIDER_FIELDS };
