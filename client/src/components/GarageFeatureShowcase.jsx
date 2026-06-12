import { useTheme } from "../context/ThemeContext";

/** My Garage feature — transparent PNG, theme-matched background shows through. */
export default function GarageFeatureShowcase({ className = "" }) {
  const { dark } = useTheme();

  return (
    <div className={`hx-gfeat-visual ${className}`.trim()} aria-hidden="true">
      <img
        src={dark ? "/images/garage-feature-dark.png" : "/images/garage-feature-light.png"}
        alt=""
        className="hx-gfeat-img"
        loading="lazy"
        decoding="async"
        width={1536}
        height={1024}
      />
    </div>
  );
}
