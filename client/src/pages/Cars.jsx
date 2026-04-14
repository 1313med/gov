import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getApprovedSales } from "../api/sale";
import { addFavorite, removeFavorite, getFavorites } from "../api/user";
import { loadAuth } from "../utils/authStorage";
import { useAppLang } from "../context/AppLangContext";

/* ─────────────────────────────────────────────────────────────────────────
   STYLES — light default, dark via .cp.dark
───────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

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
    --violet:    #7c6bff;
    --violet-bg: rgba(124,107,255,0.10);
    --violet-bd: rgba(124,107,255,0.28);
    --teal:      #0bb87a;
    --amber:     #d97706;
    --danger:    #e0413a;
    --hero-grad: linear-gradient(to bottom, rgba(245,245,247,.3) 0%, rgba(245,245,247,0) 30%, rgba(245,245,247,.98) 100%);
    --hero-glow: rgba(97,85,232,.12);
    --card-shadow: 0 2px 16px rgba(0,0,0,.07), 0 0 0 1px rgba(0,0,0,.05);
    --card-hover-shadow: 0 16px 48px rgba(0,0,0,.14), 0 0 0 1px rgba(97,85,232,.18);
    --filter-shadow: 0 8px 40px rgba(0,0,0,.1);
    --head: 'Poppins', sans-serif;
    --body: 'Outfit', sans-serif;
    --mono: 'DM Mono', monospace;

    min-height: 100vh;
    background: var(--bg);
    color: var(--txt);
    font-family: var(--body);
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
  .cp-theme-icon { width:14px;height:14px;display:flex;line-height:1; }
  .cp-theme-icon svg { width:100%;height:100%; }

  /* ═══════════ HERO ═══════════ */
  .cp-hero {
    position: relative;
    min-height: 68vh;
    overflow: hidden;
    display: flex; align-items: center;
    padding: 54px 0;
    background:
      radial-gradient(70% 55% at 12% 10%, rgba(124,107,255,.18) 0%, transparent 70%),
      radial-gradient(55% 50% at 90% 80%, rgba(56,189,248,.14) 0%, transparent 72%),
      var(--bg);
  }
  .cp-hero-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    transition: opacity .4s, filter .4s;
  }
  .cp { }
  .cp:not(.dark) .cp-hero-img { opacity: .96; filter: saturate(.9) brightness(.9); }
  .cp.dark       .cp-hero-img { opacity: .96; filter: saturate(.95) brightness(.85); }

  .cp-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(120deg, rgba(7,12,34,.06) 0%, rgba(7,12,34,.55) 60%, rgba(7,12,34,.88) 100%);
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
    display:grid; grid-template-columns: 1fr 1fr; gap:24px; align-items:center;
  }
  .cp-hero-copy { max-width: 560px; }
  .cp-hero-visual {
    justify-self:end; width:min(520px,100%); height:360px; border-radius:22px;
    border:1px solid rgba(255,255,255,.14); overflow:hidden; position:relative;
    box-shadow:0 24px 60px rgba(0,0,0,.28);
  }
  .cp-hero-visual img {
    width:100%;height:100%;object-fit:cover;display:block;
    transform:scale(1.02);transition:transform .7s ease;
  }
  .cp-hero-visual::after{
    content:'';position:absolute;inset:0;
    background:linear-gradient(to top, rgba(10,14,36,.72), rgba(10,14,36,.1));
  }
  .cp-hero-visual:hover img{transform:scale(1.06);}
  .cp-hero-pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;}
  .cp-pill{
    padding:6px 11px;border-radius:999px;
    font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;
    border:1px solid var(--violet-bd);background:var(--violet-bg);color:var(--violet);
  }
  .cp-hero-btns{display:flex;gap:10px;margin-top:22px;flex-wrap:wrap;}
  .cp-btn{
    display:inline-flex;align-items:center;justify-content:center;
    padding:12px 18px;border-radius:10px;border:1px solid transparent;
    font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;
    transition:all .25s;cursor:pointer;text-decoration:none;
  }
  .cp-btn.pri{background:var(--violet);border-color:var(--violet);color:#fff;}
  .cp-btn.pri:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(124,107,255,.35);}
  .cp-btn.out{background:transparent;border-color:var(--violet-bd);color:var(--violet);}
  .cp-btn.out:hover{background:var(--violet-bg);
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
    color: var(--violet);
    transition: background .35s, border-color .35s;
  }
  .cp-ftb-icon svg { width:14px;height:14px; }
  .cp-filter-chevron { width:12px;height:12px; color: var(--muted); transition: transform .3s, color .35s; display:flex; }
  .cp-filter-chevron svg { width:100%;height:100%; }
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
    padding: 24px 20px 84px;
  }
  .cp-top{max-width:1200px;margin:22px auto 0;padding:0 20px 6px;}
  .cp-top-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px;}
  .cp-top-kicker{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--violet);margin-bottom:8px;}
  .cp-top-title{font-family:var(--head);font-size:clamp(28px,4vw,44px);letter-spacing:-.04em;line-height:1.02;color:var(--txt);margin:0 0 8px;}
  .cp-top-sub{font-size:14px;color:var(--muted);font-family:var(--body);}
  /* ── Filter panel (unified) ── */
  .cp-filter-panel {
    max-width: 1200px;
    margin: 24px auto 0;
    padding: 0 20px;
    position: relative; z-index: 10;
  }
  .cp-filter-card {
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: var(--filter-shadow);
    overflow: hidden;
    transition: background .35s, border-color .35s, box-shadow .35s;
  }

  /* Section label row */
  .cp-filter-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border);
    gap: 10px;
    flex-wrap: wrap;
  }
  .cp-filter-label {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .cp-filter-label::before {
    content: '';
    width: 14px; height: 1px;
    background: var(--violet);
    display: inline-block;
  }

  /* Category + quick-filter row */
  .cp-tabs-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
    background: var(--s2);
    transition: background .35s, border-color .35s;
  }
  .cp-tab {
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--s1);
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--muted);
    cursor: pointer;
    transition: all .2s ease;
    flex-shrink: 0;
  }
  .cp-tab:hover { border-color: var(--violet-bd); color: var(--violet); }
  .cp-tab.active { background: var(--violet-bg); color: var(--violet); border-color: var(--violet-bd); }

  .cp-tabs-spacer { flex: 1; min-width: 8px; }
  .cp-select {
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 8px 12px;
    font-family: var(--mono);
    font-size: 10px;
    color: var(--txt);
    outline: none;
    cursor: pointer;
    transition: border-color .2s, color .35s, background .35s;
    flex-shrink: 0;
  }
  .cp-select:focus { border-color: var(--violet); }

  /* Search inputs row */
  .cp-inputs-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
    gap: 12px;
    padding: 16px 20px;
    transition: background .35s;
  }

  /* Active filters badge */
  .cp-active-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--violet-bg);
    border: 1px solid var(--violet-bd);
    font-family: var(--mono);
    font-size: 9px;
    color: var(--violet);
  }

  /* Legacy cp-tabs kept for mobile panel compat */
  .cp-tabs{display:none;}
  .cp-benefits{
    max-width:1200px;margin:22px auto 0;padding:0 20px;
    display:grid;grid-template-columns:repeat(4,1fr);gap:10px;
  }
  .cp-ben{
    border:1px solid var(--border);border-radius:12px;background:var(--s1);
    padding:14px;display:flex;gap:10px;align-items:flex-start;
    transition:all .25s;
  }
  .cp-ben:hover{transform:translateY(-2px);border-color:var(--violet-bd);}
  .cp-ben-ico{width:20px;height:20px;color:var(--violet);flex-shrink:0;}
  .cp-ben-ico svg{width:100%;height:100%;}
  .cp-ben p{font-family:var(--mono);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);}
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 22px;
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
    transform: translateY(-6px) scale(1.015);
    box-shadow: var(--card-hover-shadow);
  }
  @media (hover:none) {
    .car-card:hover { transform: none; box-shadow: var(--card-shadow); }
    .car-card:active { background: var(--s2); }
  }

  .car-img-wrap {
    position: relative; height: 210px;
    overflow: hidden; background: var(--s2);
  }
  .car-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: transform .6s ease, filter .3s;
    filter: saturate(.9);
  }
  .car-card:hover .car-img { transform: scale(1.08); filter: saturate(1.05); }
  .car-img-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,.58) 0%, rgba(0,0,0,.08) 56%, transparent);
    opacity:.72;
    transition:opacity .3s ease;
  }
  .car-card:hover .car-img-overlay{opacity:.95;}
  .car-qv-btn{
    position:absolute;left:50%;top:50%;transform:translate(-50%,-36%);
    opacity:0;pointer-events:none;z-index:2;
    background:rgba(12,13,19,.78);border:1px solid rgba(255,255,255,.22);color:#fff;
    border-radius:999px;padding:9px 14px;font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;
    transition:all .3s ease;
  }
  .car-card:hover .car-qv-btn{opacity:1;pointer-events:auto;transform:translate(-50%,-50%);}
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
  .car-meta-ico{width:13px;height:13px;color:var(--violet);display:inline-flex;}
  .car-meta-ico svg{width:100%;height:100%;}
  .car-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding-top: 12px; border-top: 1px solid var(--border);
    transition: border-color .35s;
  }
  .car-footer-year { font-family: var(--mono); font-size: 11px; color: var(--muted); transition: color .35s; display:flex;align-items:center;gap:5px; }
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

  .cp-modal-backdrop{
    position:fixed;inset:0;background:rgba(10,11,16,.5);backdrop-filter:blur(6px);
    z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;
    animation:cp-up .25s ease;
  }
  .cp-modal{
    width:min(760px,100%);background:var(--s1);border:1px solid var(--border);border-radius:22px;
    padding:18px;box-shadow:0 24px 60px rgba(0,0,0,.25);position:relative;
  }
  .cp-modal-close{
    position:absolute;right:12px;top:12px;width:34px;height:34px;border-radius:50%;
    border:1px solid var(--border);background:var(--s2);color:var(--txt);display:flex;align-items:center;justify-content:center;cursor:pointer;
  }
  .cp-modal-close svg{width:14px;height:14px;}
  .cp-modal-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:16px;align-items:start;}
  .cp-modal-img{width:100%;height:300px;object-fit:cover;border-radius:16px;}
  .cp-modal-title{font-family:var(--head);font-size:28px;letter-spacing:-.03em;color:var(--txt);margin:6px 0 8px;}
  .cp-modal-price{font-family:var(--mono);font-size:20px;color:var(--violet);margin-bottom:14px;}
  .cp-modal-info{display:flex;align-items:center;gap:7px;color:var(--muted);font-family:var(--mono);font-size:11px;margin-bottom:8px;}

  /* ═══════════ FADE-UP ═══════════ */
  @keyframes cp-up {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .cp-fade { opacity:0; animation: cp-up .5s ease forwards; }

  /* ═══════════ RESPONSIVE ═══════════ */
  @media (max-width: 1024px) {
    .cp-grid { grid-template-columns: repeat(2,1fr); }
    .cp-inputs-row { grid-template-columns: 1fr 1fr 1fr; }
    .cp-inputs-row .cars-input-wrap:first-child { grid-column: 1/-1; }
    .cp-modal-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 767px) {
    .cp-filter-bar { display: none; }
    .cp-filter-toggle-bar { display: block; }
    .cp-inputs-row { grid-template-columns: 1fr 1fr; padding: 12px 14px; gap: 8px; }
    .cp-inputs-row .cars-input-wrap:first-child { grid-column: 1/-1; }
    .cp-tabs-row { padding: 12px 14px; gap: 6px; }
    .cp-filter-panel { padding: 0 12px; }
    .cp-main { padding: 28px 16px 80px; }
    .cp-top { padding: 0 16px 6px; }
    .cp-grid { grid-template-columns: 1fr; gap: 14px; }
    .car-img-wrap { height: 210px; }
    .car-fav-btn { width: 40px; height: 40px; font-size: 16px; }
  }
  @media (max-width: 480px) {
    .cp-inputs-row { grid-template-columns: 1fr; }
    .cp-inputs-row .cars-input-wrap:first-child { grid-column: 1; }
    .cp-load-btn { width: 100%; text-align: center; padding: 14px; }
    .cp-load-wrap { padding: 0 16px; }
    .cp-modal-title { font-size: 24px; }
    .cp-modal-img { height: 240px; }
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

const ICONS = {
  moon: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3.8a8.7 8.7 0 1 0 5.7 13.9 9 9 0 0 1-5.7-13.9Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M12 2.8v2.1M12 19.1v2.1M21.2 12h-2.1M4.9 12H2.8M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
  ),
  filter: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 5.5 6v5.6c0 4.2 2.7 7.7 6.5 9 3.8-1.3 6.5-4.8 6.5-9V6L12 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="m9.2 12.2 2 2 3.7-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 10h17" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2.8-7 10h4l-1 8.4 9-12h-4l1-6.4Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 13.5v-2a5.5 5.5 0 1 1 11 0v2" fill="none" stroke="currentColor" strokeWidth="1.6"/><rect x="4.5" y="12.5" width="3" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6"/><rect x="16.5" y="12.5" width="3" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
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

const TAB_KEYS = ["all", "sedan", "suv", "luxury", "budget"];
const PRICE_KEYS = ["any", "under200k", "mid", "p500"];
const ALL_LOC = "__all__";

/* ═══════════════════════════════════════════════════════════════════════ */
export default function Cars() {
  const { copy } = useAppLang();
  const [cars,      setCars     ] = useState([]);
  const [page,      setPage     ] = useState(1);
  const [hasMore,   setHasMore  ] = useState(true);
  const [dark,      setDark     ] = useState(() => {
    // Sync with global theme set by Navbar
    const saved = localStorage.getItem("goo-theme") || localStorage.getItem("cars-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  });
  const [filterOpen,setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "", brand: "", city: "", minPrice: "", maxPrice: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const isFirstRender = useRef(true);

  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading  ] = useState(true);
  const [error,     setError    ] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [quickView, setQuickView] = useState(null);
  const [priceKey, setPriceKey] = useState("any");
  const [locationKey, setLocationKey] = useState(ALL_LOC);

  const auth = loadAuth();
  const activeFilters = Object.values(filters).filter(Boolean).length;
  const displayedCars = cars.filter((c) => {
    if (locationKey !== ALL_LOC && (c.city || "").toLowerCase() !== locationKey.toLowerCase()) return false;
    if (priceKey === "under200k" && Number(c.price) >= 200000) return false;
    if (priceKey === "mid" && (Number(c.price) < 200000 || Number(c.price) > 500000)) return false;
    if (priceKey === "p500" && Number(c.price) < 500000) return false;
    if (activeTab === "all") return true;
    if (activeTab === "budget") return Number(c.price) < 200000;
    const hay = `${c.title || ""} ${c.brand || ""} ${c.model || ""}`.toLowerCase();
    if (activeTab === "luxury") return Number(c.price) >= 500000 || /(mercedes|bmw|audi|porsche|lexus|range rover|tesla)/i.test(hay);
    if (activeTab === "suv") return /(suv|crossover|range rover|q[3578]|x[3567])/i.test(hay);
    if (activeTab === "sedan") return /(sedan|series|classe|class|a4|a6|c-?class|e-?class|s-?class)/i.test(hay);
    return true;
  });

  useEffect(() => {
    localStorage.setItem("goo-theme",  dark ? "dark" : "light");
    localStorage.setItem("cars-theme", dark ? "dark" : "light");
  }, [dark]);

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
      } catch { setError(copy.cars.loadFail); }
      finally  { setLoading(false); }
    };
    fetchCars();
  }, [debouncedFilters, page]);

  /* ── Favorites ── */
  useEffect(() => {
    if (!auth?._id) return;
    getFavorites().then((res) => setFavorites(res.data.map((x) => x._id)));
  }, []);

  const toggleFavorite = async (carId, e) => {
    e.preventDefault();
    if (!auth?._id) return alert(copy.cars.favLogin);
    const isFav = favorites.includes(carId);
    try {
      if (isFav) { await removeFavorite(carId); setFavorites((p) => p.filter((id) => id !== carId)); }
      else        { await addFavorite(carId);    setFavorites((p) => [...p, carId]); }
    } catch { alert(copy.cars.favFail); }
  };

  const filterInputs = (
    <>
      <FloatInput placeholder={copy.cars.searchPh} value={filters.search}   onChange={(v) => setFilters((f) => ({ ...f, search:   v }))} />
      <FloatInput placeholder={copy.cars.brandPh}                value={filters.brand}    onChange={(v) => setFilters((f) => ({ ...f, brand:    v }))} />
      <FloatInput placeholder={copy.cars.cityPh}                 value={filters.city}     onChange={(v) => setFilters((f) => ({ ...f, city:     v }))} />
      <FloatInput placeholder={copy.cars.minPricePh} type="number" value={filters.minPrice} onChange={(v) => setFilters((f) => ({ ...f, minPrice: v }))} />
      <FloatInput placeholder={copy.cars.maxPricePh} type="number" value={filters.maxPrice} onChange={(v) => setFilters((f) => ({ ...f, maxPrice: v }))} />
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

      <section className="cp-top cp-fade">
        <div className="cp-top-head">
          <div>
            <p className="cp-top-kicker">{copy.cars.kicker}</p>
            <h1 className="cp-top-title">{copy.cars.title}</h1>
            <p className="cp-top-sub">{copy.cars.sub}</p>
          </div>
          <Link to="/my-sales/new" className="cp-btn out">{copy.cars.sellYourCar}</Link>
        </div>
      </section>

      {/* ══ UNIFIED FILTER PANEL ══════════════════════════════════════════ */}
      <div className="cp-filter-panel cp-fade" style={{ animationDelay: "80ms" }}>
        <div className="cp-filter-card">

          {/* Row 1 — section label + active badge */}
          <div className="cp-filter-section">
            <span className="cp-filter-label">
              {copy.cars.filters || "Filtres"}
              {activeFilters > 0 && (
                <span className="cp-active-badge">{activeFilters} {copy.cars.active || "actifs"}</span>
              )}
            </span>
            {activeFilters > 0 && (
              <button
                onClick={() => setFilters({ search: "", brand: "", city: "", minPrice: "", maxPrice: "" })}
                style={{ fontFamily:"var(--mono)", fontSize:10, color:"var(--muted)", background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}
              >
                {copy.cars.clearFilters || "Effacer"}
              </button>
            )}
          </div>

          {/* Row 2 — category tabs + quick selects */}
          <div className="cp-tabs-row">
            {TAB_KEYS.map((key) => (
              <button key={key} type="button" className={`cp-tab${activeTab === key ? " active" : ""}`} onClick={() => setActiveTab(key)}>
                {copy.cars.tabs[key]}
              </button>
            ))}
            <div className="cp-tabs-spacer" />
            <select className="cp-select" value={priceKey} onChange={(e) => setPriceKey(e.target.value)}>
              {PRICE_KEYS.map((k) => (
                <option key={k} value={k}>{copy.cars.prices[k]}</option>
              ))}
            </select>
            <select className="cp-select" value={locationKey} onChange={(e) => setLocationKey(e.target.value)}>
              <option value={ALL_LOC}>{copy.cars.allCities}</option>
              {[...new Set(cars.map((c) => c.city).filter(Boolean))].slice(0, 8).map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Row 3 — text search inputs */}
          <div className="cp-inputs-row">
            {filterInputs}
          </div>

        </div>
      </div>

      {/* ══ MAIN ══════════════════════════════════════════════════════════ */}
      <div className="cp-main">

        {!loading && cars.length > 0 && (
          <div className="cp-results-head cp-fade" style={{ animationDelay:"160ms" }}>
            <p className="cp-results-count">
              <strong>{displayedCars.length}</strong> {copy.cars.results}
            </p>
            <span style={{
              fontFamily:"'DM Mono',monospace", fontSize:10,
              letterSpacing:".1em", textTransform:"uppercase", color:"var(--dim)",
            }}>
              {copy.cars.sortedBy}
            </span>
          </div>
        )}

        <div className="cp-grid">
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i}/>)}

          {!loading && displayedCars.map((c, idx) => {
            const isFav      = favorites.includes(c._id);
            const firstImage = c.images?.[0];
            return (
              <Link
                key={c._id}
                to={`/cars/${c._id}`}
                id={idx === 0 ? "cars-grid" : undefined}
                className="car-card cp-fade"
                style={{ animationDelay:`${160 + idx * 55}ms` }}
              >
                <div className="car-img-wrap">
                  {firstImage
                    ? <img src={firstImage} className="car-img" alt={c.title}/>
                    : <div className="car-no-img">{copy.cars.noImage}</div>
                  }
                  <div className="car-img-overlay"/>
                  <button
                    className="car-qv-btn"
                    onClick={(e) => { e.preventDefault(); setQuickView(c); }}
                  >
                    {copy.cars.quickView}
                  </button>
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
                  <div className="car-city"><span className="car-meta-ico">{ICONS.location}</span>{c.city}</div>
                  <div className="car-footer">
                    <span className="car-footer-year"><span className="car-meta-ico">{ICONS.year}</span>{c.year}</span>
                    <span className="car-cta">{copy.cars.viewArrow}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!loading && displayedCars.length === 0 && (
          <div className="cp-empty">
            <div className="cp-empty-icon">🚗</div>
            <h3>{copy.cars.emptyTitle}</h3>
            <p>{copy.cars.emptySub}</p>
          </div>
        )}

        {hasMore && !loading && cars.length > 0 && (
          <div className="cp-load-wrap">
            <button className="cp-load-btn" onClick={() => setPage((p) => p + 1)}>
              {copy.cars.loadMore}
            </button>
          </div>
        )}

      </div>

      {quickView && (
        <div className="cp-modal-backdrop" onClick={() => setQuickView(null)}>
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <button className="cp-modal-close" onClick={() => setQuickView(null)}>{ICONS.close}</button>
            <div className="cp-modal-grid">
              <img src={quickView.images?.[0]} alt={quickView.title} className="cp-modal-img" />
              <div>
                <h3 className="cp-modal-title">{quickView.title}</h3>
                <p className="cp-modal-price">{Number(quickView.price).toLocaleString()} MAD</p>
                <p className="cp-modal-info"><span className="car-meta-ico">{ICONS.location}</span>{quickView.city || copy.cars.unknownCity}</p>
                <p className="cp-modal-info"><span className="car-meta-ico">{ICONS.year}</span>{quickView.year || copy.cars.yearNA}</p>
                <div className="cp-hero-btns" style={{ marginTop: 22 }}>
                  <Link to={`/cars/${quickView._id}`} className="cp-btn pri">{copy.cars.viewDetails}</Link>
                  <Link to={`/cars/${quickView._id}`} className="cp-btn out">{copy.cars.contact}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
