/** Goovoiture design tokens — aligned with Home2.jsx marketplace theme. */
export const gvTokens = {
  colors: {
    brand: "#7c6bff",
    brandLight: "#9b8cff",
    accent: "#38bdf8",
    ink: "#0b163d",
    inkMuted: "#53608f",
    surface: "#ffffff",
    surface2: "#f1f4ff",
    bg: "#f6f8ff",
    bgDark: "#05060f",
    border: "rgba(12, 26, 86, 0.09)",
    borderStrong: "rgba(12, 26, 86, 0.18)",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
  },
  fonts: {
    display: "'Poppins', system-ui, sans-serif",
    body: "'Outfit', system-ui, sans-serif",
    mono: "'DM Mono', monospace",
  },
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    pill: "999px",
  },
  shadow: {
    card: "0 4px 24px rgba(7, 14, 45, 0.08)",
    cardHover: "0 28px 56px rgba(7, 14, 45, 0.2)",
    glass: "0 8px 32px rgba(12, 26, 86, 0.12)",
  },
  container: {
    max: "1280px",
    narrow: "720px",
    content: "960px",
  },
} as const;

export type BadgeVariant = "brand" | "accent" | "success" | "warning" | "neutral" | "glass";
export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
