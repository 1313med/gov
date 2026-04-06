import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2af5c0", "#f5a623", "#fc6c6c", "#7c6cfc"];
const LABELS = ["Confirmed", "Pending", "Cancelled", "Other"];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&display=swap');

  .bsc-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
  }
  @media (min-width: 768px) {
    .bsc-layout {
      flex-direction: row;
      align-items: center;
      gap: 40px;
    }
  }

  .bsc-chart-box {
    position: relative;
    width: 100%;
    max-width: 280px;
    height: min(72vw, 260px);
    max-height: 280px;
    flex-shrink: 0;
  }
  @media (min-width: 768px) {
    .bsc-chart-box { height: 260px; }
  }

  .bsc-legend {
    flex: 1;
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .bsc-row-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 7px;
    flex-wrap: wrap;
  }
  .bsc-row-left {
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
  }
  .bsc-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .bsc-name {
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    color: #a0a0b8;
  }
  .bsc-row-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .bsc-val {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 600;
  }
  .bsc-pct {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #5a5a72;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 6px;
    padding: 2px 8px;
  }
  .bsc-bar-track {
    height: 4px;
    background: rgba(255,255,255,.06);
    border-radius: 99px;
    overflow: hidden;
  }
  .bsc-bar-fill {
    height: 100%;
    border-radius: 99px;
    transition: width .6s ease;
  }

  .bsc-empty {
    height: 240px;
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

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
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
      <div style={{ color: "#5a5a72", marginBottom: 4 }}>{d.name}</div>
      <div style={{ color: d.payload.color }}>
        Count: <strong>{d.value}</strong>
      </div>
    </div>
  );
};

export default function BookingStatusChart({ data }) {
  const [pieSize, setPieSize] = useState(220);

  useEffect(() => {
    const q = () => setPieSize(window.innerWidth < 400 ? 200 : 240);
    q();
    window.addEventListener("resize", q);
    return () => window.removeEventListener("resize", q);
  }, []);

  if (!data?.length) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="bsc-empty">No status data available</div>
      </>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  const enriched = data.map((d, i) => ({
    ...d,
    name: d.name || LABELS[i] || `Status ${i + 1}`,
    color: COLORS[i % COLORS.length],
  }));

  const innerR = Math.round(pieSize * 0.3);
  const outerR = Math.round(pieSize * 0.42);

  return (
    <>
      <style>{STYLES}</style>
      <div className="bsc-layout">
        <div className="bsc-chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {enriched.map((d, i) => (
                  <filter key={i} id={`bsc-glow${i}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>

              <Pie
                data={enriched}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={innerR}
                outerRadius={outerR}
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

              <text
                x="50%"
                y="46%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: Math.min(28, pieSize * 0.12),
                  fontWeight: 700,
                  fill: "#e8e8f0",
                }}
              >
                {total}
              </text>
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 10,
                  fill: "#5a5a72",
                  letterSpacing: ".1em",
                }}
              >
                TOTAL
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bsc-legend">
          {enriched.map((d, i) => {
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <div key={i}>
                <div className="bsc-row-top">
                  <div className="bsc-row-left">
                    <span className="bsc-dot" style={{ background: d.color, boxShadow: `0 0 7px ${d.color}` }} />
                    <span className="bsc-name">{d.name}</span>
                  </div>
                  <div className="bsc-row-right">
                    <span className="bsc-val" style={{ color: d.color }}>
                      {d.value}
                    </span>
                    <span className="bsc-pct">{pct}%</span>
                  </div>
                </div>
                <div className="bsc-bar-track">
                  <div
                    className="bsc-bar-fill"
                    style={{
                      width: `${pct}%`,
                      background: d.color,
                      boxShadow: `0 0 8px ${d.color}50`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
