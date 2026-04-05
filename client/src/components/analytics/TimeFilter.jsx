import React from "react";

const FILTERS = [
  { label: "Today",    value: "today" },
  { label: "7 Days",   value: "7d"    },
  { label: "30 Days",  value: "30d"   },
  { label: "3 Months", value: "3m"    },
  { label: "1 Year",   value: "1y"    },
];

const STYLES = `
  .tf-wrap {
    display: flex;
    align-items: center;
    gap: 3px;
    background: #111118;
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 11px;
    padding: 4px;
  }

  .tf-btn {
    position: relative;
    padding: 6px 13px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: #5a5a72;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .04em;
    cursor: pointer;
    transition: color .18s, background .18s, border-color .18s;
    white-space: nowrap;
  }

  .tf-btn:hover:not(.tf-active) {
    color: #a0a0b8;
    background: rgba(255,255,255,.05);
  }

  .tf-btn.tf-active {
    color: #e8e8f0;
    background: rgba(124,108,252,.18);
    border-color: rgba(124,108,252,.35);
    box-shadow: 0 0 12px rgba(124,108,252,.15);
  }
`;

export default function TimeFilter({ period, setPeriod }) {
  return (
    <>
      <style>{STYLES}</style>
      <div className="tf-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setPeriod(f.value)}
            className={`tf-btn${period === f.value ? " tf-active" : ""}`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </>
  );
}
