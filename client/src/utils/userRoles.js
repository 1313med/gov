export function normalizeRoleSlug(role) {
  const r = String(role || "").toLowerCase();
  if (r === "seller") return "car_owner";
  if (["customer", "car_owner", "rental_owner", "admin"].includes(r)) return r;
  return "customer";
}

export function getUserRoles(user) {
  if (!user) return ["customer"];

  const set = new Set(["customer"]);
  const legacy = normalizeRoleSlug(user.role);
  if (legacy !== "customer") set.add(legacy);

  if (Array.isArray(user.roles)) {
    user.roles.map(normalizeRoleSlug).forEach((r) => set.add(r));
  }

  return [...set];
}

export function isStaffUser(user) {
  return !!user?.staffForOwnerId;
}

export function isCarOwnerUser(user) {
  return getUserRoles(user).includes("car_owner");
}

export function isRentalOwnerUser(user) {
  return getUserRoles(user).includes("rental_owner");
}

/** Web home route after login (respects multi-role priority). */
export function homePathForUser(user) {
  const roles = getUserRoles(user);
  if (roles.includes("car_owner")) return "/garage";
  if (roles.includes("rental_owner") || isStaffUser(user)) return "/owner/analytics";
  if (isAdminOnlyUser(user)) return "/admin";
  return "/rentals";
}

/** Target path when switching role mode on web. */
export function shellPathForMode(mode) {
  const m = normalizeRoleSlug(mode);
  if (m === "rental_owner") return "/owner/analytics";
  if (m === "car_owner") return "/garage";
  if (m === "admin") return "/admin";
  return "/rentals";
}

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
  if (
    isStaffUser(user) &&
    allowed.some((a) => normalizeRoleSlug(a) === "rental_owner")
  ) {
    return true;
  }
  return allowed.some((a) => set.has(normalizeRoleSlug(a)));
}

export function getPrimaryRole(user) {
  const roles = getUserRoles(user);
  if (roles.includes("car_owner")) return "car_owner";
  if (roles.includes("rental_owner")) return "rental_owner";
  if (roles.includes("admin")) return "admin";
  return "customer";
}

export function roleLabel(role, fr = false) {
  const r = normalizeRoleSlug(role);
  const map = {
    customer: fr ? "Client" : "Customer",
    car_owner: fr ? "Propriétaire" : "Car owner",
    rental_owner: fr ? "Loueur" : "Rental owner",
    admin: fr ? "Admin" : "Admin",
  };
  return map[r] || r;
}
