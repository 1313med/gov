import { Link } from "react-router-dom";

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M4.5 3.2c-.7-.4-1.5.1-1.5.9v15.8c0 .8.8 1.3 1.5.9l13.4-7.9c.6-.4.6-1.4 0-1.8L4.5 3.2z" fill="#34A853" />
    <path d="M4.5 3.2 17.9 12 21.2 9.4c.5-.3.5-1.1 0-1.4L4.5 3.2z" fill="#FBBC04" />
    <path d="M4.5 20.8 17.9 12l3.3 2.6c.5.3.5 1.1 0 1.4L4.5 20.8z" fill="#EA4335" />
    <path d="M4.5 3.2v17.6L17.9 12 4.5 3.2z" fill="#4285F4" />
  </svg>
);

/** App Store + Google Play download cards — below app banner on home. */
export default function AppStoreBadges({
  appStoreSmall,
  appStoreBig,
  playStoreSmall,
  playStoreBig,
  className = "",
}) {
  return (
    <div className={`hx-store-badges ${className}`.trim()}>
      <Link to="/register" className="hx-store-badge hx-store-badge--apple">
        <span className="hx-store-badge-ico hx-store-badge-ico--apple">
          <AppleIcon />
        </span>
        <span className="hx-store-badge-txt">
          <small>{appStoreSmall}</small>
          <strong>{appStoreBig}</strong>
        </span>
      </Link>
      <Link to="/register" className="hx-store-badge hx-store-badge--play">
        <span className="hx-store-badge-ico hx-store-badge-ico--play">
          <PlayIcon />
        </span>
        <span className="hx-store-badge-txt">
          <small>{playStoreSmall}</small>
          <strong>{playStoreBig}</strong>
        </span>
      </Link>
    </div>
  );
}
