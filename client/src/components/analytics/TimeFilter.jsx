const FILTERS = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "3 Months", value: "3m" },
  { label: "1 Year", value: "1y" },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

  .tf-scroll {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }
  .tf-scroll::-webkit-scrollbar { height: 4px; }
  .tf-scroll::-webkit-scrollbar-thumb {
    background: rgba(124,108,252,.35);
    border-radius: 4px;
  }

  .tf-wrap {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    background: #111118;
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 12px;
    padding: 4px;
    min-width: min-content;
  }

  .tf-btn {
    position: relative;
    padding: 8px 12px;
    border-radius: 9px;
    border: 1px solid transparent;
    background: transparent;
    color: #5a5a72;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .06em;
    cursor: pointer;
    transition: color .18s, background .18s, border-color .18s;
    white-space: nowrap;
    flex-shrink: 0;
  }

  @media (min-width: 480px) {
    .tf-btn { font-size: 11px; padding: 7px 13px; }
  }

  .tf-btn:hover:not(.tf-active) {
    color: #a0a0b8;
    background: rgba(255,255,255,.05);
  }

  .tf-btn.tf-active {
    color: #e8e8f0;
    background: rgba(124,108,252,.2);
    border-color: rgba(124,108,252,.38);
    box-shadow: 0 0 14px rgba(124,108,252,.18);
  }
`;

export default function TimeFilter({ period, setPeriod }) {
  return (
    <>
      <style>{STYLES}</style>
      <div className="tf-scroll">
        <div className="tf-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setPeriod(f.value)}
              className={`tf-btn${period === f.value ? " tf-active" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
