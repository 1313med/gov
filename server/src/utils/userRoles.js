/** @typedef {"customer"|"car_owner"|"rental_owner"|"admin"|"seller"} RoleSlug */

const ROLE_ENUM = ["customer", "car_owner", "rental_owner", "admin"];

/** Legacy DB value → canonical slug */
function normalizeRoleSlug(role) {
  const r = String(role || "").toLowerCase();
  if (r === "seller") return "car_owner";
  if (ROLE_ENUM.includes(r)) return r;
  return "customer";
}

/**
 * Effective roles for a user document (always includes `customer` except pure legacy edge cases).
 * @param {import("../models/User")|{ role?: string, roles?: string[] }} user
 * @returns {string[]}
 */
function getUserRoles(user) {
  if (!user) return ["customer"];

  const fromArray = Array.isArray(user.roles)
    ? user.roles.map(normalizeRoleSlug).filter(Boolean)
    : [];

  if (fromArray.length) {
    const set = new Set(fromArray);
    set.add("customer");
    return [...set];
  }

  const legacy = normalizeRoleSlug(user.role);
  if (legacy === "admin") return ["admin", "customer"];
  if (legacy === "customer") return ["customer"];
  return ["customer", legacy];
}

function hasUserRole(user, ...allowed) {
  const set = new Set(getUserRoles(user));
  return allowed.some((a) => {
    const slug = normalizeRoleSlug(a);
    return set.has(slug);
  });
}

/** Primary role for JWT / legacy clients — operational roles beat admin. */
function getPrimaryRole(user) {
  const roles = getUserRoles(user);
  if (roles.includes("car_owner")) return "car_owner";
  if (roles.includes("rental_owner")) return "rental_owner";
  if (roles.includes("admin")) return "admin";
  return "customer";
}

function isAdminOnlyUser(user) {
  const roles = getUserRoles(user);
  return (
    roles.includes("admin") &&
    !roles.includes("car_owner") &&
    !roles.includes("rental_owner")
  );
}

/**
 * Map registration intent → roles array.
 * @param {string} intent customer | car_owner | rental_owner | seller (legacy)
 */
function rolesFromRegistrationIntent(intent) {
  const key = normalizeRoleSlug(intent);
  if (key === "car_owner") return ["customer", "car_owner"];
  if (key === "rental_owner") return ["customer", "rental_owner"];
  if (key === "admin") return ["admin", "customer"];
  return ["customer"];
}

function userHasCinOnFile(user) {
  const nid = user?.nationalId;
  return !!(nid?.imageUrl || nid?.number);
}

function userHasLicenseOnFile(user) {
  const dl = user?.driverLicense;
  return !!(dl?.imageUrl || dl?.number);
}

function userCanBookRentals(user) {
  return userHasLicenseOnFile(user) && userHasCinOnFile(user);
}

function userCanListForSale(user) {
  return userHasCinOnFile(user);
}

module.exports = {
  ROLE_ENUM,
  normalizeRoleSlug,
  getUserRoles,
  hasUserRole,
  getPrimaryRole,
  isAdminOnlyUser,
  rolesFromRegistrationIntent,
  userHasCinOnFile,
  userHasLicenseOnFile,
  userCanBookRentals,
  userCanListForSale,
};
