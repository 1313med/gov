/** Compact elite marketing header — mobile home sections (all user types). */
export default function HomeMobilePitch({ badge, title1, titleEm, tagline, className = "" }) {
  return (
    <div className={`hx-mobile-pitch ${className}`.trim()}>
      <div className="hx-mobile-pitch-badge">{badge}</div>
      <h2 className="hx-mobile-pitch-title">
        {title1} <em>{titleEm}</em>
      </h2>
      <p className="hx-mobile-pitch-sub">{tagline}</p>
    </div>
  );
}
