import { useAppLang } from "../../context/AppLangContext";

const FILTER_KEYS = [
  { key: "today", value: "today" },
  { key: "d7",    value: "7d" },
  { key: "d30",   value: "30d" },
  { key: "m3",    value: "3m" },
  { key: "y1",    value: "1y" },
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
    background: #ffffff;
    border: 1px solid rgba(15,23,42,0.10);
    border-radius: 12px;
    padding: 4px;
    min-width: min-content;
    transition: background-color .3s ease, border-color .3s ease;
  }
  html.dark .tf-wrap {
    background: #111118;
    border-color: rgba(255,255,255,.08);
  }

  .tf-btn {
    position: relative;
    padding: 8px 12px;
    border-radius: 9px;
    border: 1px solid transparent;
    background: transparent;
    color: #64748b;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: .06em;
    cursor: pointer;
    transition: color .18s, background .18s, border-color .18s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  html.dark .tf-btn { color: #5a5a72; }

  @media (min-width: 480px) {
    .tf-btn { font-size: 11px; padding: 7px 13px; }
  }

  .tf-btn:hover:not(.tf-active) {
    color: #0f172a;
    background: rgba(15,23,42,.05);
  }
  html.dark .tf-btn:hover:not(.tf-active) {
    color: #a0a0b8;
    background: rgba(255,255,255,.05);
  }

  .tf-btn.tf-active {
    color: #4c1d95;
    background: rgba(124,108,252,.14);
    border-color: rgba(124,108,252,.38);
    box-shadow: 0 0 14px rgba(124,108,252,.18);
  }
  html.dark .tf-btn.tf-active {
    color: #e8e8f0;
    background: rgba(124,108,252,.2);
  }
`;

export default function TimeFilter({ period, setPeriod }) {
  const { copy } = useAppLang();
  const tf = copy.analyticsCommon.timeFilter;
  return (
    <>
      <style>{STYLES}</style>
      <div className="tf-scroll">
        <div className="tf-wrap">
          {FILTER_KEYS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setPeriod(f.value)}
              className={`tf-btn${period === f.value ? " tf-active" : ""}`}
            >
              {tf[f.key]}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
