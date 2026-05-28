/** Pick localized role marketing copy (role-select cards). */
export function getRoleCopy(role, lang) {
  if (!role) return null;
  if (lang === "ar" && role.ar) return role.ar;
  if (lang === "fr") return role.fr;
  return role.en;
}
