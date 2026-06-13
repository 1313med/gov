export default function GlassCard({
  children,
  className = "",
  href,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  href?: string;
  hover?: boolean;
}) {
  const cls = `gv-card p-5 ${hover ? "" : "gv-card-static"} ${className}`;
  if (href) {
    return (
      <a href={href} className={`block no-underline text-inherit ${cls}`}>
        {children}
      </a>
    );
  }
  return <div className={cls}>{children}</div>;
}

export function InsightCard({
  title,
  body,
  badge,
  href,
  footer,
}: {
  title: string;
  body?: string;
  badge?: React.ReactNode;
  href?: string;
  footer?: React.ReactNode;
}) {
  return (
    <GlassCard href={href}>
      {badge ? <div className="mb-2">{badge}</div> : null}
      <h3 className="font-semibold text-[var(--gv-ink)] mb-1">{title}</h3>
      {body ? <p className="text-sm text-[var(--gv-mut)] leading-relaxed">{body}</p> : null}
      {footer ? <div className="mt-3 pt-3 border-t border-[var(--gv-bdr)]">{footer}</div> : null}
    </GlassCard>
  );
}

export function DatasetCard({ title, description, href }: { title: string; description?: string; href?: string }) {
  return (
    <GlassCard href={href} className="gv-card-glass">
      <div className="gv-ey mb-2">Dataset</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      {description ? <p className="text-sm text-[var(--gv-mut)]">{description}</p> : null}
    </GlassCard>
  );
}

export function CalculatorCard({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="gv-card gv-card-static p-6 md:p-8">
      {title ? <h2 className="gv-h2 mb-6">{title}</h2> : null}
      {children}
    </div>
  );
}
