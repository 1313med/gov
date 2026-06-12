import { useTheme } from "../context/ThemeContext";

/** Homepage app download — light: image-only; dark: animated ring card. */
export default function AppPhoneShowcase({ className = "" }) {
  const { dark } = useTheme();

  if (!dark) {
    return (
      <div className={`hx-app-phones hx-app-phones--light ${className}`.trim()} aria-hidden="true">
        <div className="hx-app-phones-float">
          <img
            src="/images/app-phones-light.png"
            alt=""
            className="hx-app-phones-img"
            loading="lazy"
            decoding="async"
            width={1024}
            height={1024}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`hx-app-phones hx-app-phones--dark ${className}`.trim()} aria-hidden="true">
      <div className="hx-app-phones-card">
        <div className="hx-app-phones-card-ring" />
        <div className="hx-app-phones-card-inner">
          <div className="hx-app-phones-card-glow hx-app-phones-card-glow--teal" />
          <div className="hx-app-phones-card-glow hx-app-phones-card-glow--purple" />
          <div className="hx-app-phones-card-shine" />
          <img
            src="/images/app-phones.png"
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
  );
}
