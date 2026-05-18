export function normalizeRoleSlug(role) {
  const r = String(role || "").toLowerCase();
  if (r === "seller") return "car_owner";
  if (["customer", "car_owner", "rental_owner", "admin"].includes(r)) return r;
  return "customer";
}

export function getUserRoles(user) {
  if (!user) return ["customer"];
  if (Array.isArray(user.roles) && user.roles.length) {
    const set = new Set(user.roles.map(normalizeRoleSlug));
    set.add("customer");
    return [...set];
  }
  const legacy = normalizeRoleSlug(user.role);
  if (legacy === "admin") return ["admin", "customer"];
  if (legacy === "customer") return ["customer"];
  return ["customer", legacy];
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
  return "/(customer)";
}

export function isCarOwnerUser(user) {
  return getUserRoles(user).includes("car_owner");
}
