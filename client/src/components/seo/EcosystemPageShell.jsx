import SeoBreadcrumbs from "./SeoBreadcrumbs";

export default function EcosystemPageShell({
  kicker,
  title,
  description,
  breadcrumbs,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#f6f8ff] dark:bg-[#05060f] text-[#0b163d] dark:text-[#f5f7ff] transition-colors duration-300">
      <header className="relative overflow-hidden border-b border-[rgba(12,26,86,0.09)] dark:border-white/10 bg-gradient-to-br from-[#f6f8ff] via-[#eef2ff] to-white dark:from-[#05060f] dark:via-[#080c1a] dark:to-[#101426]">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 90% 10%, rgba(124,107,255,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(56,189,248,0.1), transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-12 md:px-10 md:py-14">
          {kicker ? (
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7c6bff]">
              {kicker}
            </p>
          ) : null}
          <h1 className="font-[Poppins] text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#53608f] dark:text-[#8a95bf]">
              {description}
            </p>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-10">
        {breadcrumbs?.length ? <SeoBreadcrumbs items={breadcrumbs} /> : null}
        {children}
      </div>
    </div>
  );
}
