import { useTheme } from "../context/ThemeContext";

/** Homepage app download — same layout both themes; dark uses gradient + screen blend. */
export default function AppPhoneShowcase({ className = "" }) {
  const { dark } = useTheme();

  return (
    <div
      className={`hx-app-phones ${dark ? "hx-app-phones--dark" : "hx-app-phones--light"} ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="hx-app-phones-float">
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
  );
}
