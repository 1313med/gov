export default function HealthScoreRing({ score = 0, color = "#22c55e", size = 120, fr = true }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className="ge-health-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="ge-health-svg">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ge-health-progress"
        />
      </svg>
      <div className="ge-health-center" style={{ color }}>
        <span className="ge-health-num">{score}</span>
        <span className="ge-health-max">/100</span>
        <span className="ge-health-label">{fr ? "Santé" : "Health"}</span>
      </div>
      <div className="ge-health-pulse" style={{ borderColor: color, boxShadow: `0 0 40px ${color}55` }} />
    </div>
  );
}
