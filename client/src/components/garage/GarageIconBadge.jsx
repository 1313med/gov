/**
 * Premium icon tile — replaces emoji heroes across garage pages.
 */
export default function GarageIconBadge({
  icon: Icon,
  size = "lg",
  variant = "teal",
  pulse = false,
  className = "",
}) {
  if (!Icon) return null;
  const dim = size === "sm" ? 40 : size === "md" ? 52 : 64;
  const iconSize = size === "sm" ? 20 : size === "md" ? 26 : 32;

  return (
    <div
      className={`ge-icon-badge ge-icon-${variant}${pulse ? " ge-icon-pulse" : ""} ${className}`.trim()}
      style={{ width: dim, height: dim }}
      aria-hidden
    >
      <div className="ge-icon-badge-ring" />
      <Icon size={iconSize} strokeWidth={1.75} className="ge-icon-badge-svg" />
    </div>
  );
}
