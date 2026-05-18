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
