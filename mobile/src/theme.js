export const C = {
  primary: "#7c6bff",
  accent:  "#38bdf8",
  bg:      "#05060f",
  surface: "#0f1123",
  card:    "#141528",
  muted:   "#64748b",
  border:  "#1e2140",
  white:   "#f1f5f9",
  slate:   "#cbd5e1",
  red:     "#ef4444",
  green:   "#34d399",
  amber:   "#f59e0b",
  blue:    "#60a5fa",
};

export const alpha = (hex, opacity) => {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${opacity})`;
};
