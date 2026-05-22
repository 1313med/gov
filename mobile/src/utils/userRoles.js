export function normalizeRoleSlug(role) {
  const r = String(role || "").toLowerCase();
  if (r === "seller") return "car_owner";
  if (["customer", "car_owner", "rental_owner", "admin"].includes(r)) return r;
  return "customer";
}

export function getUserRoles(user) {
  if (!user) return ["customer"];

  const set = new Set(["customer"]);

  // Always include legacy `role` field so accounts where `roles` only has
  // "customer" but `role` is "rental_owner" still get the right capabilities.
  const legacy = normalizeRoleSlug(user.role);
  if (legacy !== "customer") set.add(legacy);

  if (Array.isArray(user.roles)) {
    user.roles.map(normalizeRoleSlug).forEach((r) => set.add(r));
  }

  return [...set];
}

/** True only for accounts meant to moderate the platform (not car owners who also browse). */
export function isAdminOnlyUser(user) {
  const roles = getUserRoles(user);
  return (
    roles.includes("admin") &&
    !roles.includes("car_owner") &&
    !roles.includes("rental_owner")
  );
}

export function hasUserRole(user, ...allowed) {
  const set = new Set(getUserRoles(user));
  return allowed.some((a) => set.has(normalizeRoleSlug(a)));
}

/** JWT / legacy `role` field — operational role beats admin for multi-hat accounts. */
export function getPrimaryRole(user) {
  const roles = getUserRoles(user);
  if (roles.includes("car_owner")) return "car_owner";
  if (roles.includes("rental_owner")) return "rental_owner";
  if (roles.includes("admin")) return "admin";
  return "customer";
}

export function shellForMode(mode) {
  const m = normalizeRoleSlug(mode);
  if (m === "rental_owner") return "/(rental-owner)";
  if (m === "car_owner") return "/(car-owner)";
  if (m === "admin") return "/(admin)";
  return "/(customer)";
}

/** First screen after login — never send car owners to admin by mistake. */
export function homeShellForUser(user) {
  const roles = getUserRoles(user);
  if (roles.includes("car_owner")) return "/(car-owner)";
  if (roles.includes("rental_owner")) return "/(rental-owner)";
  if (isAdminOnlyUser(user)) return "/(admin)";
  if (isStaffUser(user)) return "/(rental-owner)"; // staff uses owner shell
  return "/(customer)";
}

export function isCarOwnerUser(user) {
  return getUserRoles(user).includes("car_owner");
}

export function isRentalOwnerUser(user) {
  return getUserRoles(user).includes("rental_owner");
}

export function isStaffUser(user) {
  return !!user?.staffForOwnerId;
}

/** Expo Router group name for a shell href, e.g. `/(rental-owner)` → `(rental-owner)`. */
export function shellGroupFromHref(href) {
  if (!href) return null;
  if (href.includes("rental-owner")) return "(rental-owner)";
  if (href.includes("car-owner")) return "(car-owner)";
  if (href.includes("admin")) return "(admin)";
  return "(customer)";
}

const ROLE_SHELL_GROUPS = ["(customer)", "(car-owner)", "(rental-owner)", "(admin)", "(tabs)"];

export function isRoleShellGroup(group) {
  return ROLE_SHELL_GROUPS.includes(group);
}

/** Resolved home route after login / reload — respects saved mode unless it wrongly says admin. */
export function resolveHomeHref(auth, activeMode, modeReady) {
  if (!auth) return null;
  const canonical = homeShellForUser(auth);
  if (!modeReady || !activeMode) return canonical;
  const mode = normalizeRoleSlug(activeMode);
  if (mode === "admin" && !isAdminOnlyUser(auth)) return canonical;
  if (getUserRoles(auth).includes(mode)) return shellForMode(mode);
  return canonical;
}
