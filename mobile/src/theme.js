/** Dark palette (default) — `white` = primary light text on dark surfaces */
export const darkPalette = {
  primary: "#7c6bff",
  accent: "#38bdf8",
  bg: "#05060f",
  surface: "#0f1123",
  card: "#141528",
  muted: "#64748b",
  border: "#1e2140",
  white: "#f1f5f9",
  slate: "#cbd5e1",
  red: "#ef4444",
  green: "#34d399",
  amber: "#f59e0b",
  blue: "#60a5fa",
  /** Inputs / chrome on elevated surfaces */
  inputBg: "#141528",
  /** Hero / overlay badges */
  pillBg: "rgba(124,107,255,0.1)",
  pillBorder: "rgba(124,107,255,0.3)",
  favScrim: "rgba(5,6,15,0.7)",
  /** Uppercase field labels */
  label: "#94a3b8",
};

/** Light palette — same keys; `white` = primary dark text on light surfaces */
export const lightPalette = {
  primary: "#6248e8",
  accent: "#0284c7",
  bg: "#f1f5f9",
  surface: "#ffffff",
  card: "#ffffff",
  muted: "#64748b",
  border: "#e2e8f0",
  white: "#0f172a",
  slate: "#475569",
  red: "#dc2626",
  green: "#059669",
  amber: "#d97706",
  blue: "#2563eb",
  inputBg: "#f8fafc",
  pillBg: "rgba(98,72,232,0.08)",
  pillBorder: "rgba(98,72,232,0.25)",
  favScrim: "rgba(15,23,42,0.55)",
  label: "#64748b",
};

/** @deprecated Use useTheme().colors */
export const C = darkPalette;

export const alpha = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};
