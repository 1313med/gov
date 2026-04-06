const STYLES = `
  .dh-wrap {
    width: 100%;
  }

  /* Legend row */
  .dh-legend {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 10px;
    margin-bottom: 16px;
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    color: #5a5a72;
    letter-spacing: .08em;
  }
  @media (min-width: 480px) {
    .dh-legend { font-size: 10px; margin-bottom: 20px; flex-wrap: nowrap; }
  }
  .dh-legend-track {
    display: flex;
    gap: 3px;
    align-items: center;
  }
  .dh-peak {
    width: 100%;
    text-align: center;
    color: #3a3a52;
    margin-top: 4px;
  }
  @media (min-width: 640px) {
    .dh-peak {
      width: auto;
      margin-left: auto;
      margin-top: 0;
      text-align: right;
    }
  }
  .dh-legend-cell {
    width: 14px;
    height: 14px;
    border-radius: 4px;
  }

  /* Grid */
  .dh-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
  }
  @media (min-width: 400px) { .dh-grid { gap: 6px; } }
  @media (min-width: 640px) { .dh-grid { gap: 8px; } }

  /* Cell */
  .dh-cell-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .dh-cell {
    width: 100%;
    aspect-ratio: 1;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 600;
    cursor: default;
    position: relative;
    border: 1px solid transparent;
    transition: transform .15s, box-shadow .15s;
  }
  @media (min-width: 480px) {
    .dh-cell { font-size: 12px; border-radius: 10px; }
  }
  @media (min-width: 768px) {
    .dh-cell { font-size: 13px; }
  }

  @media (hover: hover) and (min-width: 768px) {
    .dh-cell:hover {
      transform: scale(1.08);
      z-index: 2;
    }
  }

  .dh-day {
    font-family: 'DM Mono', monospace;
    font-size: 8px;
    letter-spacing: .06em;
    text-transform: uppercase;
    color: #5a5a72;
    text-align: center;
    line-height: 1.2;
  }
  @media (min-width: 480px) {
    .dh-day { font-size: 10px; letter-spacing: .08em; }
  }

  /* Tooltip */
  .dh-cell .dh-tip {
    display: none;
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: #16161f;
    border: 1px solid rgba(255,255,255,.13);
    border-radius: 8px;
    padding: 6px 10px;
    white-space: nowrap;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #e8e8f0;
    pointer-events: none;
    z-index: 10;
  }
  .dh-cell:hover .dh-tip {
    display: block;
  }
`;

/* ─── Color scale — maps demand → dark theme accent shades ───────────── */
function getCellStyle(value) {
  if (value >= 6) return {
    background: "rgba(42,245,192,.22)",
    border:     "1px solid rgba(42,245,192,.4)",
    color:      "#2af5c0",
    shadow:     "0 0 14px rgba(42,245,192,.25)",
  };
  if (value >= 4) return {
    background: "rgba(42,245,192,.13)",
    border:     "1px solid rgba(42,245,192,.22)",
    color:      "#2af5c0",
    shadow:     "0 0 8px rgba(42,245,192,.12)",
  };
  if (value >= 2) return {
    background: "rgba(124,108,252,.16)",
    border:     "1px solid rgba(124,108,252,.28)",
    color:      "#a89cfd",
    shadow:     "0 0 8px rgba(124,108,252,.12)",
  };
  if (value >= 1) return {
    background: "rgba(124,108,252,.08)",
    border:     "1px solid rgba(124,108,252,.15)",
    color:      "#7c6cfc",
    shadow:     "none",
  };
  return {
    background: "rgba(255,255,255,.03)",
    border:     "1px solid rgba(255,255,255,.06)",
    color:      "#3a3a52",
    shadow:     "none",
  };
}

/* ─── Legend swatches ─────────────────────────────────────────────────── */
const LEGEND = [
  { label: "0",   style: getCellStyle(0) },
  { label: "1-2", style: getCellStyle(1) },
  { label: "2-4", style: getCellStyle(2) },
  { label: "4-6", style: getCellStyle(4) },
  { label: "6+",  style: getCellStyle(6) },
];

export default function DemandHeatmap({ data }) {

  if (!data?.length) {
    return (
      <div style={{
        padding: "40px 0", textAlign: "center",
        fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#5a5a72",
      }}>
        No demand data available
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.demand), 1);

  return (
    <>
      <style>{STYLES}</style>

      <div className="dh-wrap">

        {/* ── Legend ── */}
        <div className="dh-legend">
          <span>Less</span>
          <div className="dh-legend-track">
            {LEGEND.map((l, i) => (
              <div
                key={i}
                title={l.label}
                className="dh-legend-cell"
                style={{
                  background: l.style.background,
                  border:     l.style.border,
                  boxShadow:  l.style.shadow,
                }}
              />
            ))}
          </div>
          <span>More</span>

          {/* Max indicator */}
          <span className="dh-peak">
            peak: <span style={{ color: "#2af5c0" }}>{max}</span> bookings
          </span>
        </div>

        {/* ── Cells ── */}
        <div className="dh-grid">
          {data.map((d, i) => {
            const cs  = getCellStyle(d.demand);
            const pct = max > 0 ? Math.round((d.demand / max) * 100) : 0;
            return (
              <div key={i} className="dh-cell-wrap">

                <div
                  className="dh-cell"
                  style={{
                    background: cs.background,
                    border:     cs.border,
                    color:      cs.color,
                    boxShadow:  cs.shadow,
                  }}
                >
                  {/* Value */}
                  <span>{d.demand > 0 ? d.demand : ""}</span>

                  {/* Hover tooltip */}
                  <div className="dh-tip">
                    {d.day} · <strong style={{ color: cs.color }}>{d.demand}</strong> booking{d.demand !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Bar indicator at bottom of cell */}
                <div style={{
                  width: "100%",
                  height: 3,
                  background: "rgba(255,255,255,.05)",
                  borderRadius: 99,
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: cs.color,
                    borderRadius: 99,
                    boxShadow: `0 0 6px ${cs.color}60`,
                    transition: "width .5s ease",
                  }}/>
                </div>

                <span className="dh-day">{d.day?.slice(0, 3)}</span>

              </div>
            );
          })}
        </div>

      </div>
    </>
  );
}
