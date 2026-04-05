import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getApprovedSales } from "../api/sale";
import { addFavorite, removeFavorite, getFavorites } from "../api/user";
import { loadAuth } from "../utils/authStorage";

/* ─────────────────────────────────────────────────────────────────────────
   STYLES — light default, dark via .cp.dark
───────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  /* ═══════════ LIGHT THEME (default) ═══════════ */
  .cp {
    --bg:        #f5f5f7;
    --bg2:       #ffffff;
    --s1:        #ffffff;
    --s2:        #f0f0f5;
    --border:    rgba(0,0,0,0.08);
    --bhi:       rgba(0,0,0,0.16);
    --txt:       #0f0f14;
    --txt2:      #2a2a35;
    --muted:     #888899;
    --dim:       #bbbbc8;
    --violet:    #6155e8;
    --violet-bg: rgba(97,85,232,0.08);
    --violet-bd: rgba(97,85,232,0.22);
    --teal:      #0bb87a;
    --amber:     #d97706;
    --danger:    #e0413a;
    --hero-grad: linear-gradient(to bottom, rgba(245,245,247,.3) 0%, rgba(245,245,247,0) 30%, rgba(245,245,247,.98) 100%);
    --hero-glow: rgba(97,85,232,.12);
    --card-shadow: 0 2px 16px rgba(0,0,0,.07), 0 0 0 1px rgba(0,0,0,.05);
    --card-hover-shadow: 0 16px 48px rgba(0,0,0,.14), 0 0 0 1px rgba(97,85,232,.18);
    --filter-shadow: 0 8px 40px rgba(0,0,0,.1);
    --head: 'Syne', sans-serif;
    --mono: 'DM Mono', monospace;

    min-height: 100vh;
    background: var(--bg);
    color: var(--txt);
    font-family: var(--head);
    overflow-x: hidden;
    transition: background .35s, color .35s;
  }

  /* ═══════════ DARK THEME ═══════════ */
  .cp.dark {
    --bg:        #09090f;
    --bg2:       #0d0d14;
    --s1:        #111118;
    --s2:        #16161f;
    --border:    rgba(255,255,255,0.07);
    --bhi:       rgba(255,255,255,0.14);
    --txt:       #e8e8f0;
    --txt2:      #c0c0d0;
    --muted:     #5a5a72;
    --dim:       #3a3a52;
    --violet:    #7c6cfc;
    --violet-bg: rgba(124,108,252,.14);
    --violet-bd: rgba(124,108,252,.32);
    --teal:      #2af5c0;
    --amber:     #f5a623;
    --danger:    #fc6c6c;
    --hero-grad: linear-gradient(to bottom, rgba(9,9,15,.5) 0%, rgba(9,9,15,0) 35%, rgba(9,9,15,.97) 100%);
    --hero-glow: rgba(124,108,252,.16);
    --card-shadow: none;
    --card-hover-shadow: 0 20px 50px rgba(0,0,0,.5), 0 0 0 1px rgba(124,108,252,.14);
    --filter-shadow: 0 20px 60px rgba(0,0,0,.5);
  }

  /* ═══════════ THEME TOGGLE BAR ═══════════ */
  .cp-theme-bar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 20px;
    background: var(--s1);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
    transition: background .35s, border-color .35s;
  }
  .cp-theme-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 6px 14px 6px 8px;
    cursor: pointer;
    transition: all .2s;
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: .06em;
    color: var(--muted);
  }
  .cp-theme-btn:hover {
    border-color: var(--violet);
    color: var(--violet);
    background: var(--violet-bg);
  }
  /* Toggle track */
  .cp-toggle-track {
    width: 36px; height: 20px;
    border-radius: 999px;
    background: var(--s2);
    border: 1.5px solid var(--border);
    position: relative;
    transition: background .25s, border-color .25s;
    flex-shrink: 0;
  }
  .cp.dark .cp-toggle-track {
    background: var(--violet);
    border-color: var(--violet);
  }
  .cp-toggle-thumb {
    position: absolute;
    top: 2px; left: 2px;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: var(--muted);
    transition: transform .25s, background .25s;
  }
  .cp.dark .cp-toggle-thumb {
    transform: translateX(16px);
    background: #fff;
  }
  /* Icon */
  .cp-theme-icon { font-size: 14px; line-height: 1; }

  /* ═══════════ HERO ═══════════ */
  .cp-hero {
    position: relative;
    height: 56vh; min-height: 320px;
    overflow: hidden;
    display: flex; align-items: flex-end;
    padding-bottom: 56px;
  }
  .cp-hero-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    transition: opacity .4s, filter .4s;
  }
  .cp { }
  .cp:not(.dark) .cp-hero-img { opacity: .18; filter: saturate(.5) brightness(1.1); }
  .cp.dark       .cp-hero-img { opacity: .25; filter: saturate(.55); }

  .cp-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: var(--hero-grad);
    z-index: 1;
    transition: background .35s;
  }
  .cp-hero::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -80px;
    width: 420px; height: 420px;
    background: radial-gradient(circle, var(--hero-glow) 0%, transparent 70%);
    z-index: 1;
    pointer-events: none;
    transition: background .35s;
  }
  .cp-hero-content {
    position: relative; z-index: 2;
    width: 100%; max-width: 1200px;
    margin: 0 auto; padding: 0 20px;
  }
  .cp-eyebrow {
    font-family: var(--mono);
    font-size: 10px; letter-spacing: .18em; text-transform: uppercase;
    color: var(--violet); margin-bottom: 10px;
    display: flex; align-items: center; gap: 8px;
    transition: color .35s;
  }
  .cp-eyebrow::before {
    content: ''; width: 20px; height: 1px;
    background: var(--violet); transition: background .35s;
  }
  .cp-hero h1 {
    font-family: var(--head);
    font-size: clamp(30px, 8vw, 64px);
    font-weight: 800; letter-spacing: -.04em; line-height: 1.05;
    margin: 0 0 12px;
    color: var(--txt);
    transition: color .35s;
  }
  .cp-hero h1 em { font-style: normal; color: var(--violet); transition: color .35s; }
  .cp-hero-sub {
    font-family: var(--mono); font-size: 12px;
    color: var(--muted); line-height: 1.7; max-width: 340px;
    transition: color .35s;
  }
  .cp-stats { display: flex; gap: 24px; margin-top: 20px; flex-wrap: wrap; }
  .cp-stat { display: flex; flex-direction: column; gap: 2px; }
  .cp-stat-num {
    font-family: var(--mono); font-size: 18px; font-weight: 600;
    letter-spacing: -.02em; color: var(--txt); transition: color .35s;
  }
  .cp-stat-lbl {
    font-family: var(--mono); font-size: 9px; letter-spacing: .1em;
    text-transform: uppercase; color: var(--muted); transition: color .35s;
  }

  /* ═══════════ FILTER BAR (desktop) ═══════════ */
  .cp-filter-bar {
    max-width: 1200px;
    margin: -36px auto 0;
    padding: 0 20px;
    position: relative; z-index: 10;
  }
  .cp-filter-inner {
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 16px 20px;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    gap: 10px;
    box-shadow: var(--filter-shadow);
    transition: background .35s, border-color .35s, box-shadow .35s;
  }

  /* ═══════════ MOBILE FILTER TOGGLE ═══════════ */
  .cp-filter-toggle-bar { display: none; margin: 16px 16px 0; position: relative; z-index: 10; }
  .cp-filter-toggle-btn {
    width: 100%; padding: 14px 20px;
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 14px; color: var(--txt);
    font-family: var(--mono); font-size: 12px; letter-spacing: .06em;
    display: flex; align-items: center; justify-content: space-between;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,.06);
    transition: background .35s, border-color .35s, color .35s;
  }
  .cp-ftb-left { display: flex; align-items: center; gap: 10px; }
  .cp-ftb-icon {
    width: 28px; height: 28px;
    background: var(--violet-bg); border: 1px solid var(--violet-bd);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    transition: background .35s, border-color .35s;
  }
  .cp-filter-chevron { font-size: 10px; color: var(--muted); transition: transform .3s, color .35s; }
  .cp-filter-chevron.open { transform: rotate(180deg); }

  .cp-filter-mobile-panel {
    max-height: 0; overflow: hidden;
    transition: max-height .35s ease;
    margin: 0 16px; position: relative; z-index: 9;
  }
  .cp-filter-mobile-panel.open { max-height: 600px; }
  .cp-filter-mobile-inner {
    background: var(--s1); border: 1px solid var(--border);
    border-top: none; border-radius: 0 0 16px 16px;
    padding: 16px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
    transition: background .35s, border-color .35s;
  }
  .cp-filter-mobile-inner .cars-input-wrap:first-child { grid-column: 1 / -1; }

  /* ═══════════ FLOAT LABEL INPUT ═══════════ */
  .cars-input-wrap { position: relative; }
  .cars-input {
    width: 100%;
    background: var(--s2);
    border: 1px solid var(--border);
    border-radius: 11px;
    padding: 20px 14px 8px;
    font-family: var(--mono); font-size: 13px;
    color: var(--txt); outline: none;
    transition: border-color .2s, background .2s, color .35s;
    -moz-appearance: textfield;
  }
  .cars-input::-webkit-outer-spin-button,
  .cars-input::-webkit-inner-spin-button { -webkit-appearance: none; }
  .cars-input:focus {
    border-color: var(--violet);
    background: var(--violet-bg);
  }
  .cars-input::placeholder { color: transparent; }
  .cars-label {
    position: absolute; left: 14px; top: 14px;
    font-family: var(--mono); font-size: 12px;
    color: var(--muted); pointer-events: none;
    transition: all .2s; letter-spacing: .04em;
  }
  .cars-input:focus + .cars-label,
  .cars-input:not(:placeholder-shown) + .cars-label {
    top: 7px; font-size: 9px; letter-spacing: .1em;
    text-transform: uppercase; color: var(--violet);
  }

  /* ═══════════ MAIN ═══════════ */
  .cp-main {
    max-width: 1200px; margin: 0 auto;
    padding: 48px 20px 80px;
  }
  .cp-results-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px; flex-wrap: wrap; gap: 8px;
  }
  .cp-results-count {
    font-family: var(--mono); font-size: 11px;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--muted); transition: color .35s;
  }
  .cp-results-count strong { color: var(--txt); font-size: 14px; transition: color .35s; }

  /* ═══════════ GRID ═══════════ */
  .cp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  /* ═══════════ CAR CARD ═══════════ */
  .car-card {
    display: block;
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 18px;
    overflow: hidden;
    text-decoration: none;
    color: var(--txt);
    box-shadow: var(--card-shadow);
    transition: border-color .25s, transform .3s, box-shadow .3s, background .35s;
    position: relative;
    -webkit-tap-highlight-color: transparent;
  }
  .car-card:hover {
    border-color: var(--bhi);
    transform: translateY(-5px);
    box-shadow: var(--card-hover-shadow);
  }
  @media (hover:none) {
    .car-card:hover { transform: none; box-shadow: var(--card-shadow); }
    .car-card:active { background: var(--s2); }
  }

  .car-img-wrap {
    position: relative; height: 200px;
    overflow: hidden; background: var(--s2);
  }
  .car-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .6s ease, filter .3s;
    filter: saturate(.9);
  }
  .car-card:hover .car-img { transform: scale(1.06); filter: saturate(1.05); }
  .car-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 55%);
  }
  .cp:not(.dark) .car-img-overlay {
    background: linear-gradient(to top, rgba(0,0,0,.35) 0%, transparent 60%);
  }
  .car-no-img {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 12px; color: var(--muted);
  }

  .car-fav-btn {
    position: absolute; top: 12px; right: 12px;
    width: 34px; height: 34px; border-radius: 50%;
    border: 1px solid rgba(255,255,255,.25);
    background: rgba(255,255,255,.85);
    backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 14px; z-index: 2;
    transition: background .2s, border-color .2s, transform .15s;
    color: #888;
  }
  .car-fav-btn:hover { transform: scale(1.15); }
  .car-fav-btn.fav { color: #e0413a; background: rgba(255,255,255,.95); }
  .cp.dark .car-fav-btn {
    background: rgba(9,9,15,.75);
    border-color: rgba(255,255,255,.12);
    color: #5a5a72;
  }
  .cp.dark .car-fav-btn.fav { color: #fc6c6c; }

  .car-price-tag {
    position: absolute; bottom: 12px; left: 12px;
    background: rgba(255,255,255,.9);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(0,0,0,.08);
    border-radius: 8px; padding: 4px 10px;
    font-family: var(--mono); font-size: 13px;
    font-weight: 600; color: #0f0f14; z-index: 2;
    transition: background .35s, color .35s;
  }
  .car-price-tag span { font-size: 10px; color: #888; margin-left: 3px; }
  .cp.dark .car-price-tag {
    background: rgba(9,9,15,.82);
    border-color: rgba(255,255,255,.1);
    color: #e8e8f0;
  }
  .cp.dark .car-price-tag span { color: #5a5a72; }

  .car-body { padding: 16px 18px 18px; }
  .car-title {
    font-family: var(--head); font-size: 15px; font-weight: 700;
    letter-spacing: -.025em; margin: 0 0 8px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    color: var(--txt); transition: color .35s;
  }
  .car-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
  .car-tag {
    font-family: var(--mono); font-size: 10px;
    letter-spacing: .06em; text-transform: uppercase;
    color: var(--muted);
    background: var(--s2); border: 1px solid var(--border);
    border-radius: 5px; padding: 2px 7px;
    transition: background .35s, color .35s, border-color .35s;
  }
  .car-city {
    font-family: var(--mono); font-size: 11px;
    color: var(--muted); display: flex; align-items: center; gap: 5px;
    margin-bottom: 12px; transition: color .35s;
  }
  .car-city::before { content: '◎'; font-size: 9px; color: var(--violet); transition: color .35s; }
  .car-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid var(--border);
    transition: border-color .35s;
  }
  .car-footer-year { font-family: var(--mono); font-size: 11px; color: var(--muted); transition: color .35s; }
  .car-cta {
    font-family: var(--mono); font-size: 11px;
    letter-spacing: .06em; text-transform: uppercase;
    color: var(--violet); display: flex; align-items: center; gap: 5px;
    transition: gap .2s, color .35s;
  }
  .car-card:hover .car-cta { gap: 9px; }

  /* ═══════════ SKELETON ═══════════ */
  @keyframes sk-sh {
    0%   { background-position: -600px 0; }
    100% { background-position:  600px 0; }
  }
  .cp:not(.dark) .sk-shimmer {
    background: linear-gradient(90deg, #f0f0f5 25%, #e4e4ec 50%, #f0f0f5 75%);
    background-size: 600px 100%;
    animation: sk-sh 1.4s infinite;
  }
  .cp.dark .sk-shimmer {
    background: linear-gradient(90deg, #111118 25%, rgba(255,255,255,.05) 50%, #111118 75%);
    background-size: 600px 100%;
    animation: sk-sh 1.4s infinite;
  }
  .sk-card { border-radius: 18px; overflow: hidden; border: 1px solid var(--border); background: var(--s1); }
  .sk-img  { height: 200px; }
  .sk-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 10px; }
  .sk-line { border-radius: 6px; height: 11px; }

  /* ═══════════ EMPTY ═══════════ */
  .cp-empty { text-align: center; padding: 80px 20px; }
  .cp-empty-icon { font-size: 44px; margin-bottom: 14px; }
  .cp-empty h3 {
    font-family: var(--head); font-size: 22px; font-weight: 700;
    letter-spacing: -.03em; margin: 0 0 8px; color: var(--txt);
    transition: color .35s;
  }
  .cp-empty p { font-family: var(--mono); font-size: 12px; color: var(--muted); transition: color .35s; }

  /* ═══════════ LOAD MORE ═══════════ */
  .cp-load-wrap { display: flex; justify-content: center; margin-top: 48px; }
  .cp-load-btn {
    padding: 13px 44px;
    background: transparent;
    border: 1px solid var(--violet-bd);
    border-radius: 999px;
    color: var(--violet);
    font-family: var(--mono); font-size: 11px;
    letter-spacing: .1em; text-transform: uppercase;
    cursor: pointer;
    transition: all .25s;
  }
  .cp-load-btn:hover {
    background: var(--violet-bg);
    border-color: var(--violet);
    box-shadow: 0 0 20px rgba(97,85,232,.18);
    transform: scale(1.03);
  }
  .cp.dark .cp-load-btn:hover { box-shadow: 0 0 24px rgba(124,108,252,.22); }
  .cp-load-btn:active { transform: scale(.97); }

  /* ═══════════ FADE-UP ═══════════ */
  @keyframes cp-up {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .cp-fade { opacity:0; animation: cp-up .5s ease forwards; }

  /* ═══════════ RESPONSIVE ═══════════ */
  @media (max-width: 1024px) {
    .cp-grid { grid-template-columns: repeat(2,1fr); }
    .cp-filter-inner { grid-template-columns: 1fr 1fr 1fr; }
    .cp-filter-inner .cars-input-wrap:first-child { grid-column: 1/-1; }
  }
  @media (max-width: 767px) {
    .cp-hero { height: 60vh; min-height: 360px; padding-bottom: 68px; }
    .cp-hero-content { padding: 0 16px; }
    .cp-hero-sub { display: none; }
    .cp-stats { gap: 20px; margin-top: 16px; }
    .cp-stat-num { font-size: 16px; }
    .cp-filter-bar { display: none; }
    .cp-filter-toggle-bar { display: block; }
    .cp-main { padding: 28px 16px 80px; }
    .cp-grid { grid-template-columns: 1fr; gap: 14px; }
    .car-img-wrap { height: 210px; }
    .car-fav-btn { width: 40px; height: 40px; font-size: 16px; }
    .cp-theme-bar { padding: 10px 16px; }
  }
  @media (max-width: 480px) {
    .cp-hero { height: 55vh; }
    .cp-hero h1 { font-size: 30px; }
    .cp-filter-mobile-inner { grid-template-columns: 1fr; }
    .cp-filter-mobile-inner .cars-input-wrap:first-child { grid-column: 1; }
    .cp-load-btn { width: 100%; text-align: center; padding: 14px; }
    .cp-load-wrap { padding: 0 16px; }
  }
`;

/* ─── Float Label Input ────────────────────────────────────────────────── */
function FloatInput({ placeholder, value, onChange, type = "text" }) {
  return (
    <div className="cars-input-wrap">
      <input
        type={type}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cars-input"
      />
      <label className="cars-label">{placeholder}</label>
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk-img sk-shimmer" />
      <div className="sk-body">
        <div className="sk-line sk-shimmer" style={{ width:"68%" }} />
        <div className="sk-line sk-shimmer" style={{ width:"44%" }} />
        <div className="sk-line sk-shimmer" style={{ width:"30%" }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function Cars() {
  const [cars,      setCars     ] = useState([]);
  const [page,      setPage     ] = useState(1);
  const [hasMore,   setHasMore  ] = useState(true);
  const [dark,      setDark     ] = useState(false);   // ← light is default
  const [filterOpen,setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "", brand: "", city: "", minPrice: "", maxPrice: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const isFirstRender = useRef(true);

  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading  ] = useState(true);
  const [error,     setError    ] = useState("");

  const auth = loadAuth();
  const activeFilters = Object.values(filters).filter(Boolean).length;

  /* ── Debounce ── */
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const t = setTimeout(() => { setDebouncedFilters(filters); setPage(1); }, 800);
    return () => clearTimeout(t);
  }, [filters]);

  /* ── Fetch ── */
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const res = await getApprovedSales({ ...debouncedFilters, page, limit: 9 });
        const newCars = res.data.items || [];
        setCars((prev) => page === 1 ? newCars : [...prev, ...newCars]);
        setHasMore(page < res.data.pages);
      } catch { setError("Failed to load cars"); }
      finally  { setLoading(false); }
    };
    fetchCars();
  }, [debouncedFilters, page]);

  /* ── Favorites ── */
  useEffect(() => {
    if (!auth?.token) return;
    getFavorites().then((res) => setFavorites(res.data.map((x) => x._id)));
  }, []);

  const toggleFavorite = async (carId, e) => {
    e.preventDefault();
    if (!auth?.token) return alert("Please login to save favorites");
    const isFav = favorites.includes(carId);
    try {
      if (isFav) { await removeFavorite(carId); setFavorites((p) => p.filter((id) => id !== carId)); }
      else        { await addFavorite(carId);    setFavorites((p) => [...p, carId]); }
    } catch { alert("Failed to update favorites"); }
  };

  const filterInputs = (
    <>
      <FloatInput placeholder="Search brand, model…" value={filters.search}   onChange={(v) => setFilters((f) => ({ ...f, search:   v }))} />
      <FloatInput placeholder="Brand"                value={filters.brand}    onChange={(v) => setFilters((f) => ({ ...f, brand:    v }))} />
      <FloatInput placeholder="City"                 value={filters.city}     onChange={(v) => setFilters((f) => ({ ...f, city:     v }))} />
      <FloatInput placeholder="Min price" type="number" value={filters.minPrice} onChange={(v) => setFilters((f) => ({ ...f, minPrice: v }))} />
      <FloatInput placeholder="Max price" type="number" value={filters.maxPrice} onChange={(v) => setFilters((f) => ({ ...f, maxPrice: v }))} />
    </>
  );

  if (error) return (
    <div className={`cp${dark ? " dark" : ""}`} style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <style>{STYLES}</style>
      <p style={{ fontFamily:"'DM Mono',monospace", color:"var(--danger)", fontSize:13 }}>{error}</p>
    </div>
  );

  return (
    <div className={`cp${dark ? " dark" : ""}`}>
      <style>{STYLES}</style>

      {/* ══ THEME TOGGLE BAR ══════════════════════════════════════════════ */}
      <div className="cp-theme-bar">
        <button className="cp-theme-btn" onClick={() => setDark(d => !d)}>
          <span className="cp-theme-icon">{dark ? "☀️" : "🌙"}</span>
          <span>{dark ? "Light mode" : "Dark mode"}</span>
          <div className="cp-toggle-track">
            <div className="cp-toggle-thumb"/>
          </div>
        </button>
      </div>

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <div className="cp-hero">
        <img
          src="https://images.unsplash.com/photo-1502877338535-766e1452684a"
          className="cp-hero-img"
          alt=""
        />
        <div className="cp-hero-content">
          <div className="cp-eyebrow">Premium Marketplace</div>
          <h1>Find Your<br/><em>Perfect</em> Car</h1>
          <p className="cp-hero-sub">
            Verified listings. Transparent pricing.<br/>
            Every car inspected and approved.
          </p>
          <div className="cp-stats">
            <div className="cp-stat">
              <span className="cp-stat-num">{cars.length > 0 ? `${cars.length}+` : "—"}</span>
              <span className="cp-stat-lbl">Listed Cars</span>
            </div>
            <div className="cp-stat">
              <span className="cp-stat-num" style={{ color:"var(--teal)" }}>100%</span>
              <span className="cp-stat-lbl">Verified</span>
            </div>
            <div className="cp-stat">
              <span className="cp-stat-num" style={{ color:"var(--amber)" }}>0</span>
              <span className="cp-stat-lbl">Hidden Fees</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ DESKTOP FILTERS ═══════════════════════════════════════════════ */}
      <div className="cp-filter-bar cp-fade" style={{ animationDelay:"80ms" }}>
        <div className="cp-filter-inner">{filterInputs}</div>
      </div>

      {/* ══ MOBILE FILTER TOGGLE ══════════════════════════════════════════ */}
      <div className="cp-filter-toggle-bar cp-fade" style={{ animationDelay:"80ms" }}>
        <button className="cp-filter-toggle-btn" onClick={() => setFilterOpen(o => !o)}>
          <span className="cp-ftb-left">
            <span className="cp-ftb-icon">⚙</span>
            <span>Filters</span>
            {activeFilters > 0 && (
              <span style={{
                background:"var(--violet-bg)", border:"1px solid var(--violet-bd)",
                borderRadius:"99px", padding:"1px 8px",
                fontFamily:"'DM Mono',monospace", fontSize:10, color:"var(--violet)",
              }}>
                {activeFilters} active
              </span>
            )}
          </span>
          <span className={`cp-filter-chevron${filterOpen ? " open" : ""}`}>▼</span>
        </button>
      </div>
      <div className={`cp-filter-mobile-panel${filterOpen ? " open" : ""}`}>
        <div className="cp-filter-mobile-inner">{filterInputs}</div>
      </div>

      {/* ══ MAIN ══════════════════════════════════════════════════════════ */}
      <div className="cp-main">

        {!loading && cars.length > 0 && (
          <div className="cp-results-head cp-fade" style={{ animationDelay:"160ms" }}>
            <p className="cp-results-count">
              <strong>{cars.length}</strong> cars available
            </p>
            <span style={{
              fontFamily:"'DM Mono',monospace", fontSize:10,
              letterSpacing:".1em", textTransform:"uppercase", color:"var(--dim)",
            }}>
              Sorted by latest
            </span>
          </div>
        )}

        <div className="cp-grid">
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i}/>)}

          {!loading && cars.map((c, idx) => {
            const isFav      = favorites.includes(c._id);
            const firstImage = c.images?.[0];
            return (
              <Link
                key={c._id}
                to={`/cars/${c._id}`}
                className="car-card cp-fade"
                style={{ animationDelay:`${160 + idx * 55}ms` }}
              >
                <div className="car-img-wrap">
                  {firstImage
                    ? <img src={firstImage} className="car-img" alt={c.title}/>
                    : <div className="car-no-img">No Image</div>
                  }
                  <div className="car-img-overlay"/>
                  <button onClick={(e) => toggleFavorite(c._id, e)} className={`car-fav-btn${isFav ? " fav" : ""}`}>
                    {isFav ? "♥" : "♡"}
                  </button>
                  <div className="car-price-tag">
                    {Number(c.price).toLocaleString()}<span>MAD</span>
                  </div>
                </div>
                <div className="car-body">
                  <h3 className="car-title">{c.title}</h3>
                  <div className="car-meta">
                    {c.brand && <span className="car-tag">{c.brand}</span>}
                    {c.model && <span className="car-tag">{c.model}</span>}
                  </div>
                  <div className="car-city">{c.city}</div>
                  <div className="car-footer">
                    <span className="car-footer-year">{c.year}</span>
                    <span className="car-cta">View →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!loading && cars.length === 0 && (
          <div className="cp-empty">
            <div className="cp-empty-icon">🚗</div>
            <h3>No cars found</h3>
            <p>Try adjusting your filters to see more results.</p>
          </div>
        )}

        {hasMore && !loading && cars.length > 0 && (
          <div className="cp-load-wrap">
            <button className="cp-load-btn" onClick={() => setPage((p) => p + 1)}>
              Load more cars
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
