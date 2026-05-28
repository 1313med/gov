/** Shared accent / gradient tokens for auth onboarding by role. */
export const ROLE_THEMES = {
  customer: {
    key: "customer",
    icon: "search",
    colorLight: "#6248e8",
    colorDark: "#a78bfa",
    gradLight: ["#6248e8", "#4f46e5", "#4338ca"],
    gradDark: ["#a78bfa", "#7c6bff", "#5b4ddb"],
    heroGradLight: ["#faf5ff", "#ede9fe", "#e8e4ff", "#f8fafc"],
    heroGradDark: ["#020108", "#120a28", "#0c0820", "#03040a"],
    orbPrimaryLight: ["rgba(98,72,232,0.38)", "rgba(98,72,232,0)"],
    orbPrimaryDark: ["rgba(167,139,250,0.52)", "rgba(167,139,250,0)"],
    orbSecondaryLight: ["rgba(98,72,232,0.2)", "rgba(98,72,232,0)"],
    orbSecondaryDark: ["rgba(167,139,250,0.28)", "rgba(167,139,250,0)"],
    chipBgLight: "rgba(98,72,232,0.08)",
    chipBgDark: "rgba(167,139,250,0.1)",
    chipBorderLight: "rgba(98,72,232,0.22)",
    chipBorderDark: "rgba(167,139,250,0.28)",
    en: { label: "Explorer", desc: "Rent or buy cars" },
    fr: { label: "Explorer", desc: "Louer ou acheter" },
  },
  car_owner: {
    key: "car_owner",
    icon: "car-sport",
    colorLight: "#0284c7",
    colorDark: "#38bdf8",
    gradLight: ["#0ea5e9", "#0284c7", "#0369a1"],
    gradDark: ["#38bdf8", "#0ea5e9", "#0284c7"],
    heroGradLight: ["#f0f9ff", "#e0f2fe", "#dbeafe", "#f8fafc"],
    heroGradDark: ["#020108", "#061828", "#0a1e32", "#03040a"],
    orbPrimaryLight: ["rgba(14,165,233,0.38)", "rgba(14,165,233,0)"],
    orbPrimaryDark: ["rgba(56,189,248,0.5)", "rgba(56,189,248,0)"],
    orbSecondaryLight: ["rgba(2,132,199,0.22)", "rgba(2,132,199,0)"],
    orbSecondaryDark: ["rgba(56,189,248,0.3)", "rgba(56,189,248,0)"],
    chipBgLight: "rgba(14,165,233,0.08)",
    chipBgDark: "rgba(56,189,248,0.1)",
    chipBorderLight: "rgba(2,132,199,0.22)",
    chipBorderDark: "rgba(56,189,248,0.28)",
    en: { label: "My garage", desc: "Track my car" },
    fr: { label: "Mon garage", desc: "Suivre ma voiture" },
  },
  rental_owner: {
    key: "rental_owner",
    icon: "business",
    colorLight: "#059669",
    colorDark: "#34d399",
    gradLight: ["#10b981", "#059669", "#047857"],
    gradDark: ["#34d399", "#10b981", "#059669"],
    heroGradLight: ["#ecfdf5", "#d1fae5", "#ccfbf1", "#f8fafc"],
    heroGradDark: ["#020108", "#061810", "#082418", "#03040a"],
    orbPrimaryLight: ["rgba(16,185,129,0.36)", "rgba(16,185,129,0)"],
    orbPrimaryDark: ["rgba(52,211,153,0.48)", "rgba(52,211,153,0)"],
    orbSecondaryLight: ["rgba(5,150,105,0.2)", "rgba(5,150,105,0)"],
    orbSecondaryDark: ["rgba(52,211,153,0.26)", "rgba(52,211,153,0)"],
    chipBgLight: "rgba(16,185,129,0.08)",
    chipBgDark: "rgba(52,211,153,0.1)",
    chipBorderLight: "rgba(5,150,105,0.22)",
    chipBorderDark: "rgba(52,211,153,0.28)",
    en: { label: "My fleet", desc: "Rent out my fleet" },
    fr: { label: "Ma flotte", desc: "Louer ma flotte" },
  },
};

export function normalizeRoleKey(role) {
  const r = String(role || "customer")
    .trim()
    .toLowerCase();
  if (r === "car_owner" || r === "rental_owner" || r === "customer") return r;
  return "customer";
}

export function getRoleTheme(roleKey, isDark) {
  const key = normalizeRoleKey(roleKey);
  const theme = ROLE_THEMES[key] || ROLE_THEMES.customer;
  return {
    ...theme,
    accent: isDark ? theme.colorDark : theme.colorLight,
    gradient: isDark ? theme.gradDark : theme.gradLight,
    heroGradient: isDark ? theme.heroGradDark : theme.heroGradLight,
    orbPrimary: isDark ? theme.orbPrimaryDark : theme.orbPrimaryLight,
    orbSecondary: isDark ? theme.orbSecondaryDark : theme.orbSecondaryLight,
    chipBg: isDark ? theme.chipBgDark : theme.chipBgLight,
    chipBorder: isDark ? theme.chipBorderDark : theme.chipBorderLight,
  };
}
