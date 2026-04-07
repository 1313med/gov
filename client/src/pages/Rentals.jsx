import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApprovedRentals } from "../api/rental";
import { useAppLang } from "../context/AppLangContext";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .rp {
    --bg: #f5f5f7; --s1: #ffffff; --s2: #f0f0f5;
    --border: rgba(0,0,0,0.08); --bhi: rgba(0,0,0,0.14);
    --txt: #0f0f14; --muted: #888899;
    --violet: #7c6bff; --violet-bg: rgba(124,107,255,0.10); --violet-bd: rgba(124,107,255,0.28);
    --card-shadow: 0 2px 16px rgba(0,0,0,.07), 0 0 0 1px rgba(0,0,0,.05);
    --card-hover-shadow: 0 16px 48px rgba(0,0,0,.14), 0 0 0 1px rgba(124,107,255,.18);
    --filter-shadow: 0 8px 40px rgba(0,0,0,.1);
    --head: 'Poppins', sans-serif; --body: 'Outfit', sans-serif; --mono: 'DM Mono', monospace;
    min-height: 100vh; background: var(--bg); color: var(--txt);
    font-family: var(--body); overflow-x: hidden;
    transition: background .35s, color .35s;
  }
  .rp.dark {
    --bg: #09090f; --s1: #111118; --s2: #16161f;
    --border: rgba(255,255,255,0.07); --bhi: rgba(255,255,255,0.14);
    --txt: #e8e8f0; --muted: #5a5a72;
    --violet: #7c6cfc; --violet-bg: rgba(124,108,252,.14); --violet-bd: rgba(124,108,252,.32);
    --card-shadow: none;
    --card-hover-shadow: 0 20px 50px rgba(0,0,0,.5), 0 0 0 1px rgba(124,108,252,.14);
    --filter-shadow: 0 20px 60px rgba(0,0,0,.5);
  }
  .rp-theme-bar {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: flex-end;
    padding: 10px 20px; background: var(--s1); border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
  }
  .rp-theme-btn {
    display: flex; align-items: center; gap: 8px;
    background: var(--s2); border: 1px solid var(--border); border-radius: 999px;
    padding: 6px 14px 6px 8px; cursor: pointer;
    font-family: var(--mono); font-size: 11px; letter-spacing: .06em; color: var(--muted);
    transition: all .2s;
  }
  .rp-theme-btn:hover { border-color: var(--violet); color: var(--violet); background: var(--violet-bg); }
  .rp-toggle-track { width: 36px; height: 20px; border-radius: 999px; background: var(--s2); border: 1.5px solid var(--border); position: relative; flex-shrink: 0; }
  .rp.dark .rp-toggle-track { background: var(--violet); border-color: var(--violet); }
  .rp-toggle-thumb { position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; border-radius: 50%; background: var(--muted); transition: transform .25s, background .25s; }
  .rp.dark .rp-toggle-thumb { transform: translateX(16px); background: #fff; }
  .rp-theme-icon { width: 14px; height: 14px; display: flex; }
  .rp-theme-icon svg { width: 100%; height: 100%; }

  .rp-main { max-width: 1200px; margin: 0 auto; padding: 24px 20px 84px; }
  .rp-top { max-width: 1200px; margin: 22px auto 0; padding: 0 20px 6px; }
  .rp-top-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
  .rp-top-kicker { font-family: var(--mono); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--violet); margin-bottom: 8px; }
  .rp-top-title { font-family: var(--head); font-size: clamp(28px, 4vw, 44px); letter-spacing: -.04em; line-height: 1.02; color: var(--txt); margin: 0 0 8px; }
  .rp-top-sub { font-size: 14px; color: var(--muted); max-width: 520px; line-height: 1.6; }
  .rp-tabs { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; padding: 14px; border: 1px solid var(--border); border-radius: 18px; background: var(--s1); margin-bottom: 20px; }
  .rp-tab { padding: 9px 14px; border-radius: 999px; border: 1px solid var(--border); background: var(--s2); font-family: var(--mono); font-size: 10px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); cursor: pointer; transition: all .3s ease; }
  .rp-tab.active { background: var(--violet-bg); color: var(--violet); border-color: var(--violet-bd); }
  .rp-select { margin-left: auto; background: var(--s2); border: 1px solid var(--border); border-radius: 999px; padding: 9px 12px; font-family: var(--mono); font-size: 10px; color: var(--txt); outline: none; }
  @media (max-width: 800px) { .rp-select { margin-left: 0; } }

  .rp-filter-panel {
    background: var(--s1); border: 1px solid var(--border); border-radius: 18px;
    padding: 20px; box-shadow: var(--filter-shadow);
    display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px;
    margin-bottom: 28px;
  }
  .rp-filter-panel .rp-apply { grid-column: 1 / -1; }
  .rp-input-wrap { position: relative; }
  .rp-input {
    width: 100%; background: var(--s2); border: 1px solid var(--border); border-radius: 11px;
    padding: 20px 14px 8px; font-family: var(--mono); font-size: 13px; color: var(--txt); outline: none;
    transition: border-color .2s, background .2s;
  }
  .rp-input:focus { border-color: var(--violet); background: var(--violet-bg); }
  .rp-input::placeholder { color: transparent; }
  .rp-label {
    position: absolute; left: 14px; top: 14px; font-family: var(--mono); font-size: 12px; color: var(--muted);
    pointer-events: none; transition: all .2s;
  }
  .rp-input:focus + .rp-label,
  .rp-input:not(:placeholder-shown) + .rp-label {
    top: 7px; font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: var(--violet);
  }
  .rp-date-wrap { position: relative; }
  .rp-date {
    width: 100%; background: var(--s2); border: 1px solid var(--border); border-radius: 11px;
    padding: 14px; font-family: var(--mono); font-size: 13px; color: var(--txt); outline: none;
  }
  .rp-date:focus { border-color: var(--violet); }
  .rp-date-lbl {
    position: absolute; left: 12px; top: -7px; background: var(--s1); padding: 0 6px;
    font-family: var(--mono); font-size: 9px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted);
  }
  .rp-apply {
    margin-top: 4px; padding: 14px; border-radius: 12px; border: none; cursor: pointer;
    background: var(--violet); color: #fff; font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
    transition: transform .2s, box-shadow .2s;
  }
  .rp-apply:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(124,107,255,.35); }

  .rp-results-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 8px; }
  .rp-results-count { font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
  .rp-results-count strong { color: var(--txt); font-size: 14px; }

  .rp-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; }
  .rent-card {
    display: block; background: var(--s1); border: 1px solid var(--border); border-radius: 18px;
    overflow: hidden; text-decoration: none; color: var(--txt); box-shadow: var(--card-shadow);
    transition: border-color .3s ease, transform .3s ease, box-shadow .3s ease;
    position: relative;
  }
  .rent-card:hover { border-color: var(--bhi); transform: translateY(-6px) scale(1.015); box-shadow: var(--card-hover-shadow); }
  .rent-img-wrap { position: relative; height: 210px; overflow: hidden; background: var(--s2); }
  .rent-img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s ease; }
  .rent-card:hover .rent-img { transform: scale(1.08); }
  .rent-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,.58) 0%, rgba(0,0,0,.08) 56%, transparent);
    opacity: .72; transition: opacity .3s ease;
  }
  .rent-card:hover .rent-img-overlay { opacity: .95; }
  .rent-qv-btn {
    position: absolute; left: 50%; top: 50%; transform: translate(-50%, -36%);
    opacity: 0; pointer-events: none; z-index: 2;
    background: rgba(12,13,19,.78); border: 1px solid rgba(255,255,255,.22); color: #fff;
    border-radius: 999px; padding: 9px 14px; font-family: var(--mono); font-size: 10px; letter-spacing: .08em; text-transform: uppercase;
    transition: all .3s ease;
  }
  .rent-card:hover .rent-qv-btn { opacity: 1; pointer-events: auto; transform: translate(-50%, -50%); }
  .rent-no-img { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 12px; color: var(--muted); }
  .rent-price-tag {
    position: absolute; bottom: 12px; left: 12px; z-index: 2;
    background: rgba(255,255,255,.92); backdrop-filter: blur(8px); border: 1px solid rgba(0,0,0,.08);
    border-radius: 8px; padding: 6px 10px; font-family: var(--mono); font-size: 13px; font-weight: 600; color: #0f0f14;
  }
  .rent-price-tag span { font-size: 10px; color: #888; margin-left: 4px; font-weight: 500; }
  .rp.dark .rent-price-tag { background: rgba(9,9,15,.85); border-color: rgba(255,255,255,.1); color: #e8e8f0; }
  .rp.dark .rent-price-tag span { color: #5a5a72; }

  .rent-body { padding: 16px 18px 18px; }
  .rent-title { font-family: var(--head); font-size: 15px; font-weight: 700; letter-spacing: -.025em; margin: 0 0 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rent-meta { font-family: var(--mono); font-size: 11px; color: var(--muted); margin-bottom: 10px; }
  .rent-row { display: flex; align-items: center; gap: 6px; font-family: var(--mono); font-size: 11px; color: var(--muted); margin-bottom: 12px; }
  .rent-ico { width: 13px; height: 13px; color: var(--violet); flex-shrink: 0; }
  .rent-ico svg { width: 100%; height: 100%; }
  .rent-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid var(--border); }
  .rent-cta { font-family: var(--mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: var(--violet); transition: gap .2s; display: flex; align-items: center; gap: 5px; }
  .rent-card:hover .rent-cta { gap: 9px; }

  @keyframes sk-sh { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
  .rp:not(.dark) .sk-shimmer {
    background: linear-gradient(90deg, #f0f0f5 25%, #e4e4ec 50%, #f0f0f5 75%); background-size: 600px 100%; animation: sk-sh 1.4s infinite;
  }
  .rp.dark .sk-shimmer {
    background: linear-gradient(90deg, #111118 25%, rgba(255,255,255,.05) 50%, #111118 75%); background-size: 600px 100%; animation: sk-sh 1.4s infinite;
  }
  .sk-card { border-radius: 18px; overflow: hidden; border: 1px solid var(--border); background: var(--s1); }
  .sk-img { height: 210px; }
  .sk-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
  .sk-line { border-radius: 6px; height: 11px; }

  .rp-empty { text-align: center; padding: 80px 20px; }
  .rp-empty h3 { font-family: var(--head); font-size: 22px; font-weight: 700; letter-spacing: -.03em; margin: 0 0 8px; }
  .rp-empty p { font-family: var(--mono); font-size: 12px; color: var(--muted); }

  @keyframes rp-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
  .rp-fade { opacity: 0; animation: rp-up .45s ease forwards; }

  .rp-modal-backdrop {
    position: fixed; inset: 0; background: rgba(10,11,16,.5); backdrop-filter: blur(6px);
    z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: rp-up .25s ease;
  }
  .rp-modal { width: min(760px, 100%); background: var(--s1); border: 1px solid var(--border); border-radius: 22px; padding: 18px; box-shadow: 0 24px 60px rgba(0,0,0,.25); position: relative; }
  .rp-modal-close {
    position: absolute; right: 12px; top: 12px; width: 34px; height: 34px; border-radius: 50%;
    border: 1px solid var(--border); background: var(--s2); display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--txt);
  }
  .rp-modal-close svg { width: 14px; height: 14px; }
  .rp-modal-grid { display: grid; grid-template-columns: 1.1fr .9fr; gap: 16px; align-items: start; }
  .rp-modal-img { width: 100%; height: 300px; object-fit: cover; border-radius: 16px; }
  .rp-modal-title { font-family: var(--head); font-size: 28px; letter-spacing: -.03em; margin: 6px 0 8px; }
  .rp-modal-price { font-family: var(--mono); font-size: 20px; color: var(--violet); margin-bottom: 6px; }
  .rp-modal-price small { font-size: 12px; color: var(--muted); font-weight: 400; }
  .rp-modal-info { display: flex; align-items: center; gap: 7px; color: var(--muted); font-family: var(--mono); font-size: 11px; margin-bottom: 8px; }
  .rp-modal-btns { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 18px; }
  .rp-btn {
    display: inline-flex; align-items: center; justify-content: center; padding: 12px 18px; border-radius: 10px;
    font-family: var(--mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase; text-decoration: none;
    transition: all .25s; border: 1px solid transparent; cursor: pointer;
  }
  .rp-btn.pri { background: var(--violet); border-color: var(--violet); color: #fff; }
  .rp-btn.pri:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(124,107,255,.35); }
  .rp-btn.out { background: transparent; border-color: var(--violet-bd); color: var(--violet); }
  .rp-btn.out:hover { background: var(--violet-bg); }

  @media (max-width: 1024px) {
    .rp-filter-panel { grid-template-columns: repeat(3, 1fr); }
    .rp-grid { grid-template-columns: repeat(2, 1fr); }
    .rp-modal-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 767px) {
    .rp-filter-panel { grid-template-columns: 1fr; }
    .rp-main { padding: 20px 16px 72px; }
    .rp-top { padding: 0 16px 6px; }
    .rp-tabs { border-radius: 14px; }
    .rp-grid { grid-template-columns: 1fr; gap: 14px; }
    .rent-img-wrap { height: 200px; }
  }
  @media (max-width: 480px) {
    .rp-modal-title { font-size: 24px; }
    .rp-modal-img { height: 240px; }
  }
`;

const ICONS = {
  moon: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3.8a8.7 8.7 0 1 0 5.7 13.9 9 9 0 0 1-5.7-13.9Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M12 2.8v2.1M12 19.1v2.1M21.2 12h-2.1M4.9 12H2.8M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
  ),
  location: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="11" r="2" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
  ),
  year: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5V6M17 3.5V6M4.5 9h15M6 5h12a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 18 19H6a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 6 5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
  ),
};

function FloatInput({ placeholder, value, onChange, type = "text" }) {
  return (
    <div className="rp-input-wrap">
      <input type={type} placeholder=" " value={value} onChange={(e) => onChange(e.target.value)} className="rp-input" />
      <label className="rp-label">{placeholder}</label>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div className="rp-date-wrap">
      <span className="rp-date-lbl">{label}</span>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="rp-date" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk-img sk-shimmer" />
      <div className="sk-body">
        <div className="sk-line sk-shimmer" style={{ width: "68%" }} />
        <div className="sk-line sk-shimmer" style={{ width: "44%" }} />
        <div className="sk-line sk-shimmer" style={{ width: "36%" }} />
      </div>
    </div>
  );
}

const TAB_KEYS = ["all", "sedan", "suv", "luxury", "budget"];
const RENT_PRICE_KEYS = ["any", "u500", "mid", "p1000"];
const ALL_LOC = "__all__";

function matchesTab(r, tab) {
  if (tab === "all") return true;
  const p = Number(r.pricePerDay) || 0;
  const hay = `${r.title || ""} ${r.brand || ""} ${r.model || ""}`.toLowerCase();
  if (tab === "budget") return p < 500;
  if (tab === "luxury") return p >= 1200 || /(mercedes|bmw|audi|porsche|lexus|range rover|tesla)/i.test(hay);
  if (tab === "suv") return /(suv|crossover|range rover|q[3578]|x[3567])/i.test(hay);
  if (tab === "sedan") return /(sedan|series|classe|class|a4|a6|c-?class|e-?class|s-?class)/i.test(hay);
  return true;
}

function matchesPriceKey(r, priceKey) {
  const p = Number(r.pricePerDay) || 0;
  if (priceKey === "any") return true;
  if (priceKey === "u500") return p < 500;
  if (priceKey === "mid") return p >= 500 && p <= 1000;
  if (priceKey === "p1000") return p > 1000;
  return true;
}

export default function Rentals() {
  const { copy } = useAppLang();
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("rentals-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  });
  const [activeTab, setActiveTab] = useState("all");
  const [priceKey, setPriceKey] = useState("any");
  const [locationKey, setLocationKey] = useState(ALL_LOC);
  const [quickView, setQuickView] = useState(null);

  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
    brand: "",
    fuel: "",
    gearbox: "",
  });

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await getApprovedRentals(filters);
      setRentals(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  useEffect(() => {
    localStorage.setItem("rentals-theme", dark ? "dark" : "light");
  }, [dark]);

  const displayed = rentals.filter((r) => {
    if (locationKey !== ALL_LOC && (r.city || "").toLowerCase() !== locationKey.toLowerCase()) return false;
    if (!matchesPriceKey(r, priceKey)) return false;
    if (!matchesTab(r, activeTab)) return false;
    return true;
  });

  const cities = [...new Set(rentals.map((r) => r.city).filter(Boolean))].slice(0, 12);

  return (
    <div className={`rp${dark ? " dark" : ""}`}>
      <style>{STYLES}</style>

      <div className="rp-theme-bar">
        <button type="button" className="rp-theme-btn" onClick={() => setDark((d) => !d)}>
          <span className="rp-theme-icon">{dark ? ICONS.sun : ICONS.moon}</span>
          <span>{dark ? copy.rentals.themeLight : copy.rentals.themeDark}</span>
          <div className="rp-toggle-track">
            <div className="rp-toggle-thumb" />
          </div>
        </button>
      </div>

      <section className="rp-top rp-fade">
        <div className="rp-top-head">
          <div>
            <p className="rp-top-kicker">{copy.rentals.kicker}</p>
            <h1 className="rp-top-title">{copy.rentals.title}</h1>
            <p className="rp-top-sub">{copy.rentals.sub}</p>
          </div>
        </div>
        <div className="rp-tabs">
          {TAB_KEYS.map((key) => (
            <button key={key} type="button" className={`rp-tab${activeTab === key ? " active" : ""}`} onClick={() => setActiveTab(key)}>
              {copy.rentals.tabs[key]}
            </button>
          ))}
          <select className="rp-select" value={priceKey} onChange={(e) => setPriceKey(e.target.value)}>
            {RENT_PRICE_KEYS.map((k) => (
              <option key={k} value={k}>{copy.rentals.prices[k]}</option>
            ))}
          </select>
          <select className="rp-select" value={locationKey} onChange={(e) => setLocationKey(e.target.value)}>
            <option value={ALL_LOC}>{copy.rentals.allCities}</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="rp-main">
        <div className="rp-filter-panel rp-fade" style={{ animationDelay: "60ms", gridTemplateColumns: "repeat(4,1fr)" }}>
          <FloatInput placeholder={copy.rentals.cityPh} value={filters.city} onChange={(v) => setFilters({ ...filters, city: v })} />
          <FloatInput placeholder="Brand (e.g. BMW)" value={filters.brand} onChange={(v) => setFilters({ ...filters, brand: v })} />
          <FloatInput type="number" placeholder={copy.rentals.minPh} value={filters.minPrice} onChange={(v) => setFilters({ ...filters, minPrice: v })} />
          <FloatInput type="number" placeholder={copy.rentals.maxPh} value={filters.maxPrice} onChange={(v) => setFilters({ ...filters, maxPrice: v })} />
          <DateField label={copy.rentals.start} value={filters.startDate} onChange={(v) => setFilters({ ...filters, startDate: v })} />
          <DateField label={copy.rentals.end} value={filters.endDate} onChange={(v) => setFilters({ ...filters, endDate: v })} />
          <div className="rp-input-wrap">
            <select value={filters.fuel} onChange={(e) => setFilters({ ...filters, fuel: e.target.value })} className="rp-input" style={{ paddingTop: 13 }}>
              <option value="">Any fuel</option>
              {["Diesel","Petrol","Hybrid","Electric"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="rp-input-wrap">
            <select value={filters.gearbox} onChange={(e) => setFilters({ ...filters, gearbox: e.target.value })} className="rp-input" style={{ paddingTop: 13 }}>
              <option value="">Any gearbox</option>
              {["Manual","Automatic"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <button type="button" className="rp-apply rp-filter-panel" style={{ gridColumn: "1 / -1" }} onClick={fetchRentals}>
            {copy.rentals.apply}
          </button>
        </div>

        {!loading && rentals.length > 0 && (
          <div className="rp-results-head rp-fade" style={{ animationDelay: "100ms" }}>
            <p className="rp-results-count">
              <strong>{displayed.length}</strong> {copy.rentals.shown}
            </p>
          </div>
        )}

        <div className="rp-grid">
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading &&
            displayed.map((r, idx) => {
              const img = r.images?.[0];
              return (
                <div
                  key={r._id}
                  role="link"
                  tabIndex={0}
                  className={`rent-card rp-fade`}
                  style={{ animationDelay: `${120 + idx * 40}ms`, cursor: "pointer" }}
                  onClick={() => navigate(`/rentals/${r._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/rentals/${r._id}`);
                    }
                  }}
                >
                  <div className="rent-img-wrap">
                    {img ? <img src={img} alt="" className="rent-img" /> : <div className="rent-no-img">{copy.rentals.noImg}</div>}
                    <div className="rent-img-overlay" />
                    <button
                      type="button"
                      className="rent-qv-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickView(r);
                      }}
                    >
                      {copy.rentals.quickView}
                    </button>
                    <div className="rent-price-tag">
                      {Number(r.pricePerDay).toLocaleString()}
                      <span>{copy.rentals.madDay}</span>
                    </div>
                  </div>
                  <div className="rent-body">
                    <h3 className="rent-title">{r.title}</h3>
                    <p className="rent-meta">
                      {[r.brand, r.model].filter(Boolean).join(" ")} {r.year ? `· ${r.year}` : ""}
                    </p>
                    <div className="rent-row">
                      <span className="rent-ico">{ICONS.location}</span>
                      {r.city || "—"}
                    </div>
                    <div className="rent-footer">
                      <span className="rent-row" style={{ marginBottom: 0 }}>
                        <span className="rent-ico">{ICONS.year}</span>
                        {r.year ?? "—"}
                      </span>
                      <span className="rent-cta">{copy.rentals.viewArrow}</span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {!loading && displayed.length === 0 && (
          <div className="rp-empty">
            <h3>{copy.rentals.emptyTitle}</h3>
            <p>{copy.rentals.emptySub}</p>
          </div>
        )}
      </div>

      {quickView && (
        <div className="rp-modal-backdrop" onClick={() => setQuickView(null)} role="presentation">
          <div className="rp-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="qv-title">
            <button type="button" className="rp-modal-close" onClick={() => setQuickView(null)} aria-label={copy.rentals.close}>
              {ICONS.close}
            </button>
            <div className="rp-modal-grid">
              {quickView.images?.[0] ? (
                <img src={quickView.images[0]} alt="" className="rp-modal-img" />
              ) : (
                <div className="rp-modal-img sk-shimmer" style={{ minHeight: 300 }} />
              )}
              <div>
                <h2 id="qv-title" className="rp-modal-title">
                  {quickView.title}
                </h2>
                <p className="rp-modal-price">
                  {Number(quickView.pricePerDay).toLocaleString()} MAD <small>{copy.rentals.perDay}</small>
                </p>
                <p className="rp-modal-info">
                  <span className="rent-ico">{ICONS.location}</span>
                  {quickView.city || "—"}
                </p>
                <p className="rp-modal-info">
                  <span className="rent-ico">{ICONS.year}</span>
                  {[quickView.brand, quickView.model].filter(Boolean).join(" ")} · {quickView.year ?? "—"}
                </p>
                <div className="rp-modal-btns">
                  <Link to={`/rentals/${quickView._id}`} className="rp-btn pri">
                    View details
                  </Link>
                  <Link to={`/rentals/${quickView._id}`} className="rp-btn out">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
