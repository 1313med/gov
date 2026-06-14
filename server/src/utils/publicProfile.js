/**
 * Strip PII from user objects before public API responses.
 * Never expose: phone, email, nationalId, driverLicense, password.
 */

function isVerifiedIdentity(user) {
  const nid = user?.nationalId;
  const dl = user?.driverLicense;
  return Boolean(nid?.verified || dl?.verified);
}

function cinVerified(user) {
  return Boolean(user?.nationalId?.verified);
}

function licenseVerified(user) {
  return Boolean(user?.driverLicense?.verified);
}

/** Minimal public seller/owner preview for listing detail pages. */
function toPublicOwnerPreview(user) {
  if (!user) return null;
  const id = user._id?.toString?.() || String(user._id || "");
  const bp = user.businessProfile || {};
  return {
    _id: id,
    name: bp.businessName || user.name || "Pro Goovoiture",
    city: user.city || null,
    avatar: bp.logo || user.avatar || null,
    bio: user.bio || null,
    cinVerified: cinVerified(user),
    licenseVerified: licenseVerified(user),
    identityVerified: isVerifiedIdentity(user),
  };
}

/** Public professional card (agencies / dealers directory). */
function toPublicProfessionalCard(user, extras = {}) {
  const preview = toPublicOwnerPreview(user);
  if (!preview) return null;
  return {
    ...preview,
    fleetSize: extras.fleetSize ?? 0,
    path: extras.path,
    citySlug: extras.citySlug,
    avgRating: extras.avgRating ?? 0,
    reviewCount: extras.reviewCount ?? 0,
    verified: isVerifiedIdentity(user),
  };
}

/** Public seller profile block (seller profile page). */
function toPublicSellerProfile(user) {
  const preview = toPublicOwnerPreview(user);
  if (!preview) return null;
  const bp = user.businessProfile || {};
  return {
    ...preview,
    openingHours: bp.openingHours || null,
    address: bp.address || (user.city ? `${user.city}, Maroc` : null),
  };
}

module.exports = {
  toPublicOwnerPreview,
  toPublicProfessionalCard,
  toPublicSellerProfile,
  isVerifiedIdentity,
};
