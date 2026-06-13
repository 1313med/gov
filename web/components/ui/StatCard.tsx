export default function StatCard({
  value,
  suffix,
  label,
  accent,
  className = "",
}: {
  value: string | number;
  suffix?: string;
  label: string;
  accent?: "brand" | "accent" | "success";
  className?: string;
}) {
  const accentColor =
    accent === "success" ? "#10b981" : accent === "accent" ? "var(--gv-accent)" : "var(--gv-brand)";
  return (
    <div className={`gv-stat ${className}`}>
      <div className="gv-stat-n">
        {value}
        {suffix ? <em>{suffix}</em> : null}
      </div>
      <div className="gv-stat-l">{label}</div>
      <div className="gv-stat-line" style={{ background: accentColor }} />
    </div>
  );
}
