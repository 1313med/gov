import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2af5c0", "#f5a623", "#fc6c6c", "#7c6cfc"];
const LABELS = ["Confirmed", "Pending", "Cancelled", "Other"];

/* ─── Custom Tooltip ───────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: "#16161f",
      border: "1px solid rgba(255,255,255,.13)",
      borderRadius: 10,
      padding: "10px 14px",
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      color: "#e8e8f0",
    }}>
      <div style={{ color: "#5a5a72", marginBottom: 4 }}>{d.name}</div>
      <div style={{ color: d.payload.color }}>
        Count: <strong>{d.value}</strong>
      </div>
    </div>
  );
};

/* ─── Custom active shape label in center ──────────────────────────────── */
const CenterLabel = ({ cx, cy, label, value, color }) => {
  if (!label) return null;
  return (
    <>
      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: "'DM Mono',monospace", fontSize: 28, fontWeight: 700, fill: color }}>
        {value}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, fill: "#5a5a72", letterSpacing: ".06em" }}>
        {label.toUpperCase()}
      </text>
    </>
  );
};

export default function BookingStatusChart({ data }) {

  if (!data?.length) {
    return (
      <div style={{
        height: 260, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#5a5a72",
      }}>
        No status data available
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  /* Attach colors to data entries for tooltip access */
  const enriched = data.map((d, i) => ({
    ...d,
    name:  d.name || LABELS[i] || `Status ${i+1}`,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 36, flexWrap: "wrap" }}>

      {/* ── Donut chart ── */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <ResponsiveContainer width={240} height={240}>
          <PieChart>
            <defs>
              {enriched.map((d, i) => (
                <filter key={i} id={`glow${i}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              ))}
            </defs>

            <Pie
              data={enriched}
              dataKey="value"
              nameKey="name"
              innerRadius={72}
              outerRadius={104}
              paddingAngle={3}
              strokeWidth={0}
            >
              {enriched.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.color}
                  opacity={0.9}
                  style={{ filter: `drop-shadow(0 0 6px ${d.color}60)`, cursor: "pointer" }}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

            {/* Center total */}
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: "'DM Mono',monospace", fontSize: 30, fontWeight: 700, fill: "#e8e8f0" }}>
              {total}
            </text>
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle"
              style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, fill: "#5a5a72", letterSpacing: ".1em" }}>
              TOTAL
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend + stats ── */}
      <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 14 }}>

        {enriched.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <div key={i}>

              {/* Label row */}
              <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: 7,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: d.color,
                    boxShadow: `0 0 7px ${d.color}`,
                    flexShrink: 0,
                    display: "inline-block",
                  }}/>
                  <span style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 12, color: "#a0a0b8",
                  }}>
                    {d.name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 13, fontWeight: 600, color: d.color,
                  }}>
                    {d.value}
                  </span>
                  <span style={{
                    fontFamily: "'DM Mono',monospace",
                    fontSize: 11, color: "#5a5a72",
                    background: "rgba(255,255,255,.05)",
                    border: "1px solid rgba(255,255,255,.07)",
                    borderRadius: 6,
                    padding: "1px 7px",
                  }}>
                    {pct}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 4,
                background: "rgba(255,255,255,.06)",
                borderRadius: 99,
                overflow: "hidden",
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: d.color,
                  borderRadius: 99,
                  boxShadow: `0 0 8px ${d.color}50`,
                  transition: "width .6s ease",
                }}/>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
