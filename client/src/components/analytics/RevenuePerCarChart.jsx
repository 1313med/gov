import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

/* ─── Custom Tooltip ───────────────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
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
      <div style={{ color: "#5a5a72", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#7c6cfc" }}>
        Revenue: <strong>${payload[0].value?.toLocaleString()}</strong>
      </div>
    </div>
  );
};

/* ─── Custom Bar Label ─────────────────────────────────────────────────── */
const CustomLabel = ({ x, y, width, value }) => {
  if (!value) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        fill: "#5a5a72",
        fontWeight: 500,
      }}
    >
      ${value?.toLocaleString()}
    </text>
  );
};

/* ─── Bar colors cycling through accent palette ────────────────────────── */
const COLORS = ["#7c6cfc", "#2af5c0", "#f5a623", "#60a5fa", "#fc6c6c", "#a78bfa", "#34d399"];

export default function RevenuePerCarChart({ data }) {

  if (!data?.length) {
    return (
      <div style={{
        height: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
        color: "#5a5a72",
      }}>
        No revenue data available
      </div>
    );
  }

  /* Sort descending so highest earner is leftmost */
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  const max    = sorted[0]?.revenue || 1;

  return (
    <div>

      {/* ── Mini legend / rank strip ── */}
      <div style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        marginBottom: 20,
      }}>
        {sorted.map((car, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,255,255,.04)",
            border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 8,
            padding: "5px 10px",
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: COLORS[i % COLORS.length],
              boxShadow: `0 0 6px ${COLORS[i % COLORS.length]}`,
              flexShrink: 0,
            }}/>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#a0a0b8",
            }}>
              {car.title}
            </span>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              color: COLORS[i % COLORS.length],
            }}>
              ${car.revenue?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* ── Bar chart ── */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={sorted}
          margin={{ top: 28, right: 8, bottom: 8, left: 0 }}
          barCategoryGap="32%"
        >
          <defs>
            {sorted.map((_, i) => (
              <linearGradient
                key={i}
                id={`barGrad${i}`}
                x1="0" y1="0" x2="0" y2="1"
              >
                <stop offset="0%"   stopColor={COLORS[i % COLORS.length]} stopOpacity={1}  />
                <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.35}/>
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="rgba(255,255,255,.04)"
            strokeDasharray="4 4"
          />

          <XAxis
            dataKey="title"
            tick={{ fill: "#5a5a72", fontSize: 11, fontFamily: "'DM Mono'" }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{ fill: "#5a5a72", fontSize: 11, fontFamily: "'DM Mono'" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,.03)", radius: 8 }}
          />

          <Bar
            dataKey="revenue"
            radius={[6, 6, 0, 0]}
            maxBarSize={72}
            label={<CustomLabel />}
          >
            {sorted.map((_, i) => (
              <Cell
                key={i}
                fill={`url(#barGrad${i})`}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={1}
                strokeOpacity={0.4}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ── Share of total strip ── */}
      <div style={{ marginTop: 20 }}>
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: "#5a5a72",
          letterSpacing: ".1em",
          textTransform: "uppercase",
          marginBottom: 10,
        }}>
          Share of total revenue
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((car, i) => {
            const pct = Math.round((car.revenue / sorted.reduce((s,c) => s+c.revenue, 0)) * 100);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: "#a0a0b8",
                  width: 90,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {car.title}
                </span>
                <div style={{
                  flex: 1,
                  height: 5,
                  background: "rgba(255,255,255,.06)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: COLORS[i % COLORS.length],
                    borderRadius: 99,
                    boxShadow: `0 0 8px ${COLORS[i % COLORS.length]}60`,
                    transition: "width .6s ease",
                  }}/>
                </div>
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: COLORS[i % COLORS.length],
                  width: 34,
                  textAlign: "right",
                  flexShrink: 0,
                }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
