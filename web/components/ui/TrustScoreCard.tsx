import BadgePill from "./BadgePill";

export default function TrustScoreCard({
  score,
  max = 100,
  grade,
  label = "Score confiance GoVoiture",
  badges,
}: {
  score: number;
  max?: number;
  grade?: string;
  label?: string;
  badges?: Array<{ id: string; label: string }>;
}) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  return (
    <div className="gv-card gv-card-static p-6 text-center">
      <p className="text-sm text-[var(--gv-mut)] mb-2">{label}</p>
      <div className="relative inline-flex items-center justify-center w-32 h-32 mb-3">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--gv-bdr)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="var(--gv-brand)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${pct * 2.64} 264`}
          />
        </svg>
        <span className="absolute text-3xl font-bold text-[var(--gv-brand)]">{score}</span>
      </div>
      {grade ? <p className="text-lg font-semibold text-[var(--gv-ink)]">{grade}</p> : null}
      {badges?.length ? (
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {badges.map((b) => (
            <BadgePill key={b.id} variant="success">
              {b.label}
            </BadgePill>
          ))}
        </div>
      ) : null}
    </div>
  );
}
