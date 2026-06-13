export default function HeroSection({
  kicker,
  title,
  titleHighlight,
  description,
  meta,
  children,
}: {
  kicker?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  meta?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const parts = titleHighlight && title.includes(titleHighlight)
    ? title.split(titleHighlight)
    : null;

  return (
    <header className="gv-hero">
      <div className="gv-wrap relative z-[1]">
        {kicker ? <div className="gv-hero-kicker">{kicker}</div> : null}
        <h1 className="gv-hero-title">
          {parts ? (
            <>
              {parts[0]}
              <em>{titleHighlight}</em>
              {parts[1]}
            </>
          ) : (
            title
          )}
        </h1>
        <div className="gv-hero-rule" />
        {description ? <p className="gv-hero-desc">{description}</p> : null}
        {meta ? <div className="mt-4 flex flex-wrap gap-2">{meta}</div> : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
    </header>
  );
}
