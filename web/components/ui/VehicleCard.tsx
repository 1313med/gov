import BadgePill from "./BadgePill";

export default function VehicleCard({
  title,
  subtitle,
  price,
  priceLabel,
  href,
  badge,
  image,
  intent = "sale",
}: {
  title: string;
  subtitle?: string;
  price?: string;
  priceLabel?: string;
  href: string;
  badge?: string;
  image?: string | null;
  intent?: "sale" | "rental";
}) {
  return (
    <a href={href} className="gv-vcard no-underline text-inherit">
      <div className="h-36 bg-[var(--gv-sur2)] flex items-center justify-center relative overflow-hidden">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <svg className="w-12 h-12 text-[var(--gv-mut)] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4.5 13.5h15l-1.2-4.1a2 2 0 0 0-1.9-1.4H7.6a2 2 0 0 0-1.9 1.4L4.5 13.5Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {badge ? (
          <span className="absolute top-2 left-2 gv-badge gv-badge-brand text-[0.55rem]">{badge}</span>
        ) : null}
      </div>
      <div className="gv-vcard-body">
        {subtitle ? (
          <span className="text-[0.65rem] uppercase tracking-wider text-[var(--gv-mut)] font-[family-name:var(--gv-mono)]">{subtitle}</span>
        ) : null}
        <div className="gv-vcard-title capitalize">{title}</div>
        <div className="mt-auto pt-3 border-t border-[var(--gv-bdr)] flex justify-between items-center">
          {price ? (
            <span className={`gv-vcard-price ${intent === "rental" ? "text-[var(--gv-accent)]" : ""}`}>
              {price}
              {priceLabel ? <span className="text-xs font-normal text-[var(--gv-mut)]"> {priceLabel}</span> : null}
            </span>
          ) : null}
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-[var(--gv-mut)]">Voir →</span>
        </div>
      </div>
    </a>
  );
}

export function ComparisonCard({
  name,
  strengths,
  weaknesses,
  href,
  side,
}: {
  name: string;
  strengths: string[];
  weaknesses: string[];
  href: string;
  side: "a" | "b";
}) {
  return (
    <div className="gv-card p-5 h-full flex flex-col">
      <BadgePill variant={side === "a" ? "brand" : "accent"}>{side === "a" ? "Modèle A" : "Modèle B"}</BadgePill>
      <h3 className="text-lg font-bold mt-3 mb-4 capitalize">{name}</h3>
      <div className="flex-1 space-y-4 text-sm">
        <div>
          <p className="font-semibold text-emerald-600 mb-1">Points forts</p>
          <ul className="list-disc pl-4 text-[var(--gv-mut)] space-y-1">
            {strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-amber-600 mb-1">Points de vigilance</p>
          <ul className="list-disc pl-4 text-[var(--gv-mut)] space-y-1">
            {weaknesses.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
      <a href={href} className="gv-btn gv-btn-outline mt-4 w-full text-center">
        Voir {name} →
      </a>
    </div>
  );
}

export function QuestionCard({
  question,
  topic,
  answerCount,
  href,
}: {
  question: string;
  topic?: string;
  answerCount?: number;
  href: string;
}) {
  return (
    <a href={href} className="gv-card block p-5 no-underline text-inherit">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-[var(--gv-ink)] leading-snug">{question}</h3>
        {topic ? <BadgePill variant="neutral">{topic}</BadgePill> : null}
      </div>
      {answerCount != null ? (
        <p className="text-sm text-[var(--gv-mut)] mt-2">{answerCount} réponse(s)</p>
      ) : null}
    </a>
  );
}

export function TimelineCard({
  index,
  title,
  body,
  when,
  checklist,
}: {
  index: number;
  title: string;
  body: string;
  when?: string;
  checklist?: string[];
}) {
  return (
    <div className="gv-timeline-step">
      <span className="gv-timeline-dot">{index}</span>
      <h3 className="font-semibold text-lg text-[var(--gv-ink)]">{title}</h3>
      {when ? <p className="text-xs text-[var(--gv-brand)] mt-0.5 mb-1">{when}</p> : null}
      <p className="text-sm text-[var(--gv-mut)] leading-relaxed mt-1">{body}</p>
      {checklist?.length ? (
        <ul className="mt-2 text-sm list-disc pl-4 text-[var(--gv-ink2)] space-y-0.5">
          {checklist.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
