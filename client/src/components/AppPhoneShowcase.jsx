import { useTheme } from "../context/ThemeContext";
import { useMediaQuery } from "../hooks/useMediaQuery";

const img = (name) => `${import.meta.env.BASE_URL}images/${name}`;

/** Homepage app download — desktop square mockup; mobile uses full-width banner. */
export default function AppPhoneShowcase({ className = "" }) {
  const { dark } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div
      className={`hx-app-phones ${dark ? "hx-app-phones--dark" : "hx-app-phones--light"} ${className}`.trim()}
      aria-hidden="true"
    >
      {!isMobile && (
        <div className="hx-app-phones-float">
          <img
            src={img(dark ? "app-phones.png" : "app-phones-light.png")}
            alt=""
            className="hx-app-phones-img"
            loading="lazy"
            decoding="async"
            width={1024}
            height={1024}
          />
        </div>
      )}
      {isMobile && (
        <img
          src={img(dark ? "app-mobile-dark-banner.png" : "app-mobile-light-banner.png")}
          alt=""
          className="hx-app-phones-banner"
          loading="lazy"
          decoding="async"
          width={800}
          height={533}
        />
      )}
    </div>
  );
}
