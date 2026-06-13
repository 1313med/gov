import type { BadgeVariant } from "./tokens";

const variantClass: Record<BadgeVariant, string> = {
  brand: "gv-badge-brand",
  accent: "gv-badge-accent",
  success: "gv-badge-success",
  warning: "gv-badge-warning",
  neutral: "gv-badge-neutral",
  glass: "gv-badge-brand",
};

export default function BadgePill({
  children,
  variant = "brand",
  className = "",
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return <span className={`gv-badge ${variantClass[variant]} ${className}`}>{children}</span>;
}
