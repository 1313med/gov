import { useTheme } from "../context/ThemeContext";

/** Homepage app download visual — light / dark mockup images. */
export default function AppPhoneShowcase({ className = "" }) {
  const { dark } = useTheme();

  return (
    <div
      className={`hx-app-phones ${dark ? "hx-app-phones--dark" : "hx-app-phones--light"} ${className}`.trim()}
      aria-hidden="true"
    >
      <img
        src={dark ? "/images/app-phones.png" : "/images/app-phones-light.png"}
        alt=""
        className="hx-app-phones-img"
        loading="lazy"
        decoding="async"
        width={1024}
        height={1024}
      />
    </div>
  );
}
