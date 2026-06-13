/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gv: {
          brand: "#7c6bff",
          accent: "#38bdf8",
          ink: "var(--gv-ink)",
          mut: "var(--gv-mut)",
          sur: "var(--gv-sur)",
          bg: "var(--gv-bg)",
        },
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        body: ["Outfit", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderRadius: {
        gv: "20px",
      },
    },
  },
  plugins: [],
};
