export default function PremiumCTA({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: string;
  description?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="gv-cta relative">
      <div className="relative z-[1]">
        <h2 className="font-[family-name:var(--gv-disp)] text-2xl font-bold mb-2">{title}</h2>
        {description ? <p className="text-white/75 max-w-lg mx-auto mb-6 text-sm">{description}</p> : null}
        <div className="flex flex-wrap justify-center gap-3">
          <a href={primaryHref} className="gv-btn gv-btn-primary bg-white text-[var(--gv-ink)] border-white hover:text-white hover:bg-[var(--gv-brand)] hover:border-[var(--gv-brand)]">
            {primaryLabel}
          </a>
          {secondaryHref && secondaryLabel ? (
            <a href={secondaryHref} className="gv-btn gv-btn-outline border-white/30 text-white hover:border-white hover:text-white">
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description, actionHref, actionLabel }: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="gv-empty">
      <p className="font-semibold text-[var(--gv-ink)] mb-1">{title}</p>
      {description ? <p className="text-sm mb-4">{description}</p> : null}
      {actionHref && actionLabel ? (
        <a href={actionHref} className="gv-btn gv-btn-primary">{actionLabel}</a>
      ) : null}
    </div>
  );
}

export function ChartContainer({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="gv-card gv-card-static p-5 md:p-6">
      {title ? <h3 className="font-semibold mb-4 text-[var(--gv-ink)]">{title}</h3> : null}
      {children}
    </div>
  );
}

export function Skeleton({ className = "h-48" }: { className?: string }) {
  return <div className={`gv-skel ${className}`} aria-hidden="true" />;
}

export function RelatedLinksSection({
  title = "Liens utiles",
  links,
}: {
  title?: string;
  links: Array<{ label: string; href: string }>;
}) {
  if (!links.length) return null;
  return (
    <section className="gv-sec-sm">
      <div className="gv-ey">Explorer</div>
      <h2 className="gv-h2 mb-4">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="gv-chip">
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}

export function EntityGrid({ children, cols = 3 }: { children: React.ReactNode; cols?: 2 | 3 | 4 }) {
  const cls = cols === 4 ? "gv-grid-4" : cols === 2 ? "gv-grid-2" : "gv-grid-3";
  return <div className={cls}>{children}</div>;
}
