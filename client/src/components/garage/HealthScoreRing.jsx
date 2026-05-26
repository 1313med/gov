export default function HealthScoreRing({ score = 0, color = "#3ee8d6", size = 120, fr = true }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const id = `ge-grad-${size}`;

  return (
    <div
      className="ge-health-ring-wrap"
      style={{ width: size, height: size, "--ge-health-glow": `${color}44` }}
    >
      <svg width={size} height={size} className="ge-health-svg">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="9"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="ge-health-progress"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="ge-health-center" style={{ color }}>
        <span className="ge-health-num">{score}</span>
        <span className="ge-health-max">/100</span>
        <span className="ge-health-label">{fr ? "Santé" : "Health"}</span>
      </div>
      <div className="ge-health-pulse" style={{ borderColor: color, boxShadow: `0 0 48px ${color}66` }} />
    </div>
  );
}
