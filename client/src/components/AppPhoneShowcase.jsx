import { useTheme } from "../context/ThemeContext";

/** Homepage app download — premium card + animated phone mockup. */
export default function AppPhoneShowcase({ className = "" }) {
  const { dark } = useTheme();

  return (
    <div
      className={`hx-app-phones ${dark ? "hx-app-phones--dark" : "hx-app-phones--light"} ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="hx-app-phones-card">
        <div className="hx-app-phones-card-ring" />
        <div className="hx-app-phones-card-inner">
          <div className="hx-app-phones-card-shine" />
          <div className="hx-app-phones-card-glow hx-app-phones-card-glow--teal" />
          <div className="hx-app-phones-card-glow hx-app-phones-card-glow--purple" />
          <div className="hx-app-phones-card-grid" />
          <div className="hx-app-phones-badge">
            <span className="hx-app-phones-badge-dot" />
            Mobile
          </div>
          <div className="hx-app-phones-stage">
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
        </div>
      </div>
    </div>
  );
}
