import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&display=swap');

  .rpc-legend {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .rpc-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 10px;
    padding: 6px 10px;
    max-width: 100%;
  }
  .rpc-chip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .rpc-chip-title {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #a0a0b8;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    max-width: 120px;
  }
  @media (min-width: 480px) {
    .rpc-chip-title { max-width: 160px; font-size: 11px; }
  }
  .rpc-chip-val {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    flex-shrink: 0;
  }
  @media (min-width: 480px) {
    .rpc-chip-val { font-size: 11px; }
  }

  .rpc-chart-wrap {
    width: 100%;
    margin-left: -6px;
    margin-right: -6px;
    padding-left: 6px;
    padding-right: 6px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .rpc-chart-inner {
    min-width: min(100%, 320px);
    height: 260px;
  }
  @media (min-width: 640px) {
    .rpc-chart-inner { min-width: 100%; height: 280px; }
  }

  .rpc-share-h {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #5a5a72;
    letter-spacing: .1em;
    text-transform: uppercase;
    margin: 20px 0 10px;
  }
  .rpc-share-list { display: flex; flex-direction: column; gap: 8px; }
  .rpc-share-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .rpc-share-name {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #a0a0b8;
    width: min(100px, 28vw);
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  @media (min-width: 480px) {
    .rpc-share-name { width: 120px; }
  }
  .rpc-share-track {
    flex: 1;
    min-width: 0;
    height: 5px;
    background: rgba(255,255,255,.06);
    border-radius: 99px;
    overflow: hidden;
  }
  .rpc-share-fill {
    height: 100%;
    border-radius: 99px;
    transition: width .6s ease;
  }
  .rpc-share-pct {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    width: 32px;
    text-align: right;
    flex-shrink: 0;
  }

  .rpc-empty {
    height: 260px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #5a5a72;
    border: 1px dashed rgba(255,255,255,.1);
    border-radius: 14px;
  }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#16161f",
        border: "1px solid rgba(255,255,255,.13)",
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
        color: "#e8e8f0",
      }}
    >
      <div style={{ color: "#5a5a72", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#7c6cfc" }}>
        Revenue: <strong>${payload[0].value?.toLocaleString()}</strong>
      </div>
    </div>
  );
};

const CustomLabel = ({ x, y, width, value, narrow }) => {
  if (!value || narrow) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        fill: "#5a5a72",
        fontWeight: 500,
      }}
    >
      ${value?.toLocaleString()}
    </text>
  );
};

const COLORS = ["#7c6cfc", "#2af5c0", "#f5a623", "#60a5fa", "#fc6c6c", "#a78bfa", "#34d399"];

export default function RevenuePerCarChart({ data }) {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const q = () => setNarrow(window.innerWidth < 640);
    q();
    window.addEventListener("resize", q);
    return () => window.removeEventListener("resize", q);
  }, []);

  if (!data?.length) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="rpc-empty">No revenue data available</div>
      </>
    );
  }

  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  const totalRev = sorted.reduce((s, c) => s + c.revenue, 0);

  const tickFormatter = (title) => {
    if (!title) return "";
    const max = narrow ? 10 : 14;
    return title.length > max ? `${title.slice(0, max)}…` : title;
  };

  return (
    <>
      <style>{STYLES}</style>

      <div className="rpc-legend">
        {sorted.map((car, i) => (
          <div key={i} className="rpc-chip">
            <span
              className="rpc-chip-dot"
              style={{
                background: COLORS[i % COLORS.length],
                boxShadow: `0 0 6px ${COLORS[i % COLORS.length]}`,
              }}
            />
            <span className="rpc-chip-title" title={car.title}>
              {car.title}
            </span>
            <span className="rpc-chip-val" style={{ color: COLORS[i % COLORS.length] }}>
              ${car.revenue?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="rpc-chart-wrap">
        <div className="rpc-chart-inner">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sorted}
              margin={{ top: narrow ? 12 : 28, right: 4, bottom: narrow ? 28 : 8, left: narrow ? -4 : 0 }}
              barCategoryGap={narrow ? "24%" : "32%"}
            >
              <defs>
                {sorted.map((_, i) => (
                  <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={1} />
                    <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.35} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid vertical={false} stroke="rgba(255,255,255,.04)" strokeDasharray="4 4" />

              <XAxis
                dataKey="title"
                tick={{ fill: "#5a5a72", fontSize: narrow ? 9 : 11, fontFamily: "'DM Mono'" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={narrow ? -35 : 0}
                textAnchor={narrow ? "end" : "middle"}
                height={narrow ? 56 : 32}
                tickFormatter={tickFormatter}
              />

              <YAxis
                width={narrow ? 36 : 44}
                tick={{ fill: "#5a5a72", fontSize: narrow ? 9 : 11, fontFamily: "'DM Mono'" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,.03)", radius: 8 }} />

              <Bar
                dataKey="revenue"
                radius={[6, 6, 0, 0]}
                maxBarSize={narrow ? 48 : 72}
                label={<CustomLabel narrow={narrow} />}
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
        </div>
      </div>

      <div>
        <div className="rpc-share-h">Share of total revenue</div>
        <div className="rpc-share-list">
          {sorted.map((car, i) => {
            const pct = Math.round((car.revenue / totalRev) * 100);
            const c = COLORS[i % COLORS.length];
            return (
              <div key={i} className="rpc-share-row">
                <span className="rpc-share-name" title={car.title}>
                  {car.title}
                </span>
                <div className="rpc-share-track">
                  <div
                    className="rpc-share-fill"
                    style={{
                      width: `${pct}%`,
                      background: c,
                      boxShadow: `0 0 8px ${c}60`,
                    }}
                  />
                </div>
                <span className="rpc-share-pct" style={{ color: c }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
