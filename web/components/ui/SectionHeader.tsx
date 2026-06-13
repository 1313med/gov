export default function SectionHeader({
  eyebrow,
  title,
  titleHighlight,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        {eyebrow ? <div className="gv-ey">{eyebrow}</div> : null}
        <h2 className="gv-h2">
          {titleHighlight && title.includes(titleHighlight) ? (
            <>
              {title.split(titleHighlight)[0]}
              <em>{titleHighlight}</em>
              {title.split(titleHighlight)[1]}
            </>
          ) : (
            title
          )}
        </h2>
        {description ? <p className="text-[var(--gv-mut)] text-sm max-w-2xl">{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
