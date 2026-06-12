import { useTheme } from "../context/ThemeContext";

/** My Garage — mobile banner only; transparent PNG (background removed per theme). */
export default function GarageFeatureShowcase({ className = "" }) {
  const { dark } = useTheme();

  return (
    <div
      className={`hx-gfeat-visual ${dark ? "hx-gfeat-visual--dark" : "hx-gfeat-visual--light"} ${className}`.trim()}
      aria-hidden="true"
    >
      <img
        src={dark ? "/images/garage-feature-dark-mobile.png" : "/images/garage-feature-light-mobile.png"}
        alt=""
        className="hx-gfeat-img"
        loading="lazy"
        decoding="async"
        width={1024}
        height={682}
      />
    </div>
  );
}
