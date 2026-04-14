import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getApprovedRentals } from "../api/rental";
import { useAppLang } from "../context/AppLangContext";

const FAV_STORAGE_KEY = "goovoiture-rental-favorites";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  STYLES                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }

  /* ── Tokens — aligned with Home2 (.hx) ── */
  .rp {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    overflow-x: clip;
    --s1: #ffffff; --s2: #f1f4ff; --s3: #e8ecff;
    --border: rgba(12, 26, 86, 0.09); --bhi: rgba(12, 26, 86, 0.18);
    --txt: #0b163d; --sub: #1b2f66; --muted: #53608f;
    --violet: #7c6bff; --violet-d: #6d5ce8;
    --violet-bg: rgba(124,107,255,0.10); --violet-bd: rgba(124,107,255,0.30);
    --accent: #38bdf8;
    --accent-bg: rgba(56,189,248,0.12); --accent-bd: rgba(56,189,248,0.28);
    --teal: #0ed2a3; --amber: #f59e0b; --rose: #f43f5e; --sky: #38bdf8;
    --card-shadow: 0 4px 24px rgba(7, 14, 45, 0.06), 0 0 0 1px rgba(12, 26, 86, 0.06);
    --card-hover: 0 24px 56px rgba(7, 14, 45, 0.14), 0 0 0 1.5px rgba(124,107,255,0.22);
    --panel-shadow: 0 16px 48px rgba(7, 14, 45, 0.12);
    --head: 'Poppins', sans-serif; --body: 'Outfit', sans-serif; --mono: 'DM Mono', monospace;
    --bg: #f6f8ff; --bg2: #eef2ff;
    min-height: 100vh; background: var(--bg); color: var(--txt);
    font-family: var(--body);
    transition: background .35s, color .35s;
  }
  .rp.dark {
    --bg: #05060f; --bg2: #080c1a;
    --s1: #101426; --s2: #141b34; --s3: #1a2140;
    --border: rgba(255,255,255,0.07); --bhi: rgba(255,255,255,0.12);
    --txt: #f5f7ff; --sub: #c6d3ff; --muted: #8a95bf;
    --violet: #8474ff; --violet-d: #7c6bff;
    --violet-bg: rgba(124,107,255,0.16); --violet-bd: rgba(124,107,255,0.34);
    --accent-bg: rgba(56,189,248,0.14); --accent-bd: rgba(56,189,248,0.32);
    --card-shadow: 0 4px 28px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,0.05);
    --card-hover: 0 28px 64px rgba(0,0,0,.5), 0 0 0 1.5px rgba(132,116,255,.25);
    --panel-shadow: 0 24px 64px rgba(0,0,0,.55);
  }

  /* ── Top band — same rhythm as /cars (.cp-top): compact, no marquee, no scroll-jank ── */
  .rp-top {
    max-width: 1280px;
    margin: 18px auto 0;
    padding: 0 24px 6px;
  }
  .rp-top-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 6px;
  }
  .rp-top-kicker {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: .14em;
    text-transform: uppercase;
    color: var(--violet);
    margin-bottom: 8px;
  }
  .rp-top-title {
    font-family: var(--head);
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 700;
    letter-spacing: -.04em;
    line-height: 1.02;
    color: var(--txt);
    margin: 0 0 8px;
  }
  .rp-top-title em { font-style: italic; font-weight: 300; color: var(--violet); }
  .rp-top-sub {
    font-size: 14px;
    color: var(--muted);
    font-family: var(--body);
    line-height: 1.65;
    max-width: 560px;
    margin: 0;
  }
  .rp-top-stats {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }
  .rp-top-stat {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 999px;
    box-shadow: var(--card-shadow);
  }
  .rp-top-stat-num {
    font-family: var(--head);
    font-size: 17px;
    font-weight: 700;
    color: var(--txt);
    letter-spacing: -.02em;
  }
  .rp-top-stat-lbl {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  /* ── Controls wrapper ── */
  .rp-controls { max-width: 1280px; margin: 0 auto; padding: clamp(28px, 4vw, 48px) 24px 12px; }

  /* ── Category tabs ── */
  .rp-tabs-wrap {
    display: flex; align-items: center; gap: 8px;
    margin: clamp(20px, 3vw, 32px) 0 16px;
    flex-wrap: wrap;
  }
  .rp-tab {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 999px;
    border: 1.5px solid var(--border); background: var(--s1);
    font-family: var(--mono); font-size: 10.5px; letter-spacing: .07em; text-transform: uppercase;
    color: var(--muted); cursor: pointer;
    transition: all .22s ease; white-space: nowrap;
    box-shadow: var(--card-shadow);
  }
  .rp-tab:hover { border-color: var(--violet-bd); color: var(--violet); background: var(--violet-bg); }
  .rp-tab.active { background: var(--violet); border-color: var(--violet); color: #fff; box-shadow: 0 4px 18px rgba(124,107,255,.35); }
  .rp-tab-count {
    display: inline-flex; align-items: center; justify-content: center;
    min-width: 18px; height: 18px; border-radius: 999px; padding: 0 5px;
    font-size: 9px; background: rgba(0,0,0,.12); color: inherit;
  }
  .rp-tab.active .rp-tab-count { background: rgba(255,255,255,.22); }

  /* ── Filter bar ── */
  .rp-filter-bar {
    display: flex; align-items: center; gap: 10px;
    background: var(--s1); border: 1.5px solid var(--border);
    border-radius: 16px; padding: 12px 14px;
    box-shadow: var(--card-shadow), inset 0 2px 0 0 var(--violet);
    margin-bottom: 12px; flex-wrap: wrap;
    transition: border-color .2s, box-shadow .2s;
  }
  .rp-filter-bar:focus-within { border-color: var(--violet-bd); box-shadow: var(--card-hover), inset 0 2px 0 0 var(--accent); }
  .rp-fi {
    flex: 1; min-width: 130px; position: relative;
  }
  .rp-fi-icon {
    position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
    width: 14px; height: 14px; color: var(--muted); pointer-events: none; flex-shrink: 0;
  }
  .rp-fi-icon svg { width: 100%; height: 100%; }
  .rp-fi-input {
    width: 100%; background: var(--s2); border: 1.5px solid transparent;
    border-radius: 10px; padding: 10px 12px 10px 32px;
    font-family: var(--mono); font-size: 11.5px; color: var(--txt); outline: none;
    transition: border-color .2s, background .2s;
  }
  .rp-fi-input::placeholder { color: var(--muted); }
  .rp-fi-input:focus { border-color: var(--violet-bd); background: var(--violet-bg); }
  .rp-fi-sep { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; }
  .rp-sort-select {
    background: var(--s2); border: 1.5px solid transparent; border-radius: 10px;
    padding: 10px 12px; font-family: var(--mono); font-size: 11px;
    color: var(--txt); outline: none; cursor: pointer;
    transition: border-color .2s;
  }
  .rp-sort-select:focus { border-color: var(--violet-bd); }
  .rp-filter-toggle {
    display: flex; align-items: center; gap: 7px;
    padding: 10px 14px; border-radius: 10px; border: 1.5px solid var(--border);
    background: var(--s2); cursor: pointer;
    font-family: var(--mono); font-size: 10.5px; letter-spacing: .06em;
    color: var(--muted); white-space: nowrap; transition: all .2s; flex-shrink: 0;
  }
  .rp-filter-toggle:hover { border-color: var(--violet-bd); color: var(--violet); background: var(--violet-bg); }
  .rp-filter-toggle.has-active { border-color: var(--violet); background: var(--violet-bg); color: var(--violet); }
  .rp-filter-toggle-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 17px; height: 17px; border-radius: 50%;
    background: var(--violet); color: #fff; font-size: 9px;
  }
  .rp-filter-icon { width: 13px; height: 13px; flex-shrink: 0; }
  .rp-filter-icon svg { width: 100%; height: 100%; }
  .rp-search-btn {
    flex-shrink: 0; display: flex; align-items: center; gap: 7px;
    padding: 10px 20px; border-radius: 10px; border: none;
    background: var(--violet); color: #fff; cursor: pointer;
    font-family: var(--mono); font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase;
    transition: transform .18s, box-shadow .18s;
    white-space: nowrap;
  }
  .rp-search-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(124,107,255,.38); }
  .rp-search-btn svg { width: 13px; height: 13px; }

  /* ── Advanced filter panel ── */
  .rp-adv-wrap {
    overflow: hidden; transition: max-height .35s ease, opacity .3s ease;
    max-height: 0; opacity: 0;
  }
  .rp-adv-wrap.open { max-height: 320px; opacity: 1; }
  .rp-adv {
    background: var(--s1); border: 1.5px solid var(--border);
    border-radius: 16px; padding: 18px;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
    margin-bottom: 12px; box-shadow: var(--card-shadow);
  }
  @media (max-width: 900px) { .rp-adv { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 540px) { .rp-adv { grid-template-columns: 1fr; } }
  .rp-adv-input {
    width: 100%; background: var(--s2); border: 1.5px solid transparent;
    border-radius: 10px; padding: 10px 12px;
    font-family: var(--mono); font-size: 11.5px; color: var(--txt); outline: none;
    transition: border-color .2s, background .2s;
  }
  .rp-adv-input:focus { border-color: var(--violet-bd); background: var(--violet-bg); }
  .rp-adv-input::placeholder { color: var(--muted); }
  .rp-adv-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: .1em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 5px; display: block;
  }
  .rp-adv-field { display: flex; flex-direction: column; }

  /* ── Active filter chips ── */
  .rp-chips { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; margin-bottom: 16px; }
  .rp-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 5px 10px 5px 12px; border-radius: 999px;
    background: var(--violet-bg); border: 1px solid var(--violet-bd);
    font-family: var(--mono); font-size: 10px; letter-spacing: .05em; color: var(--violet);
  }
  .rp-chip-x {
    width: 15px; height: 15px; border-radius: 50%; border: none;
    background: var(--violet-bd); color: var(--violet);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    font-size: 9px; padding: 0; transition: background .15s;
  }
  .rp-chip-x:hover { background: var(--violet); color: #fff; }
  .rp-clear-all {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    background: none; border: none; cursor: pointer; padding: 0; letter-spacing: .05em;
    transition: color .15s;
  }
  .rp-clear-all:hover { color: var(--rose); }

  /* ── Results header ── */
  .rp-results-bar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px; flex-wrap: wrap; gap: 14px;
  }
  .rp-results-left { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .rp-results-count { font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: .06em; }
  .rp-results-count strong { color: var(--txt); font-size: 17px; margin-right: 4px; font-family: var(--head); font-weight: 700; }
  .rp-view-toggles {
    display: inline-flex; align-items: center; gap: 4px; padding: 4px;
    background: var(--s2); border: 1px solid var(--border); border-radius: 12px;
  }
  .rp-view-btn {
    width: 40px; height: 36px; border: none; border-radius: 9px;
    background: transparent; color: var(--muted); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s;
  }
  .rp-view-btn:hover { color: var(--violet); background: var(--violet-bg); }
  .rp-view-btn.on {
    background: var(--s1); color: var(--violet);
    box-shadow: 0 2px 10px rgba(7,14,45,.08); border: 1px solid var(--violet-bd);
  }
  .rp-view-btn svg { width: 18px; height: 18px; }

  /* ── Card grid ── */
  .rp-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 22px;
  }
  .rp-grid.list { grid-template-columns: 1fr; gap: 16px; }
  @media (max-width: 1050px) { .rp-grid:not(.list) { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 620px) { .rp-grid:not(.list) { grid-template-columns: 1fr; gap: 14px; } }

  /* ── Rental card ── */
  .rent-card {
    background: var(--s1); border: 1.5px solid var(--border);
    border-radius: 18px; overflow: hidden; cursor: pointer;
    box-shadow: var(--card-shadow);
    transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease;
    display: flex; flex-direction: column;
    position: relative;
  }
  .rent-card:hover { transform: translateY(-6px); box-shadow: var(--card-hover); border-color: var(--violet-bd); }
  .rent-card.is-list {
    flex-direction: row; align-items: stretch;
  }
  .rent-card.is-list .rent-img-wrap {
    width: min(100%, 300px); height: auto; min-height: 200px; flex-shrink: 0;
  }
  .rent-card.is-list .rent-body {
    flex: 1; justify-content: center; padding: 20px 22px;
  }
  .rent-card.is-list .rent-qv-btn { transform: translate(-50%, -50%); }
  @media (max-width: 720px) {
    .rent-card.is-list { flex-direction: column; }
    .rent-card.is-list .rent-img-wrap { width: 100%; height: 220px; min-height: 0; }
  }

  .rent-img-wrap { position: relative; height: 225px; overflow: hidden; background: var(--s2); flex-shrink: 0; }
  .rent-img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s ease; display: block; }
  .rent-card:hover .rent-img { transform: scale(1.07); }
  .rent-img-gradient {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(5,5,14,.72) 0%, rgba(5,5,14,.18) 45%, transparent 70%);
    transition: opacity .3s;
  }
  .rent-card:hover .rent-img-gradient { opacity: .9; }
  .rent-no-img {
    width: 100%; height: 100%; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
    color: var(--muted); font-family: var(--mono); font-size: 11px;
  }
  .rent-no-img svg { width: 36px; height: 36px; opacity: .35; }

  /* Price tag */
  .rent-price-tag {
    position: absolute; bottom: 12px; left: 12px; z-index: 3;
    background: rgba(255,255,255,.96);
    border-radius: 10px; padding: 6px 11px;
    font-family: var(--mono); font-weight: 600; color: #0d0d14;
    display: flex; align-items: baseline; gap: 3px;
    box-shadow: 0 2px 10px rgba(0,0,0,.15);
  }
  .rent-price-num { font-size: 14px; }
  .rent-price-unit { font-size: 9.5px; color: #666; letter-spacing: .06em; }
  .rp.dark .rent-price-tag { background: rgba(10,10,20,.9); color: #eeeef6; }
  .rp.dark .rent-price-unit { color: #666; }

  /* City tag on image */
  .rent-city-tag {
    position: absolute; top: 12px; left: 12px; z-index: 3;
    background: rgba(15,15,25,.78);
    border-radius: 7px; padding: 4px 9px;
    font-family: var(--mono); font-size: 10px; color: rgba(255,255,255,.9);
    display: flex; align-items: center; gap: 5px;
  }
  .rent-city-tag svg { width: 10px; height: 10px; flex-shrink: 0; }

  /* Quick view button */
  .rent-qv-btn {
    position: absolute; left: 50%; top: 50%; z-index: 4;
    transform: translate(-50%, -42%);
    opacity: 0; pointer-events: none;
    background: rgba(255,255,255,.95); color: #0d0d14;
    border: none; border-radius: 999px;
    padding: 9px 18px; font-family: var(--mono); font-size: 10.5px; letter-spacing: .08em; text-transform: uppercase;
    transition: all .28s ease; cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,.25); white-space: nowrap;
    display: flex; align-items: center; gap: 7px;
  }
  .rent-qv-btn svg { width: 12px; height: 12px; }
  .rent-card:hover .rent-qv-btn { opacity: 1; pointer-events: auto; transform: translate(-50%, -50%); }

  /* Heart */
  .rent-heart {
    position: absolute; top: 12px; right: 12px; z-index: 4;
    width: 36px; height: 36px; border-radius: 50%;
    background: rgba(15,15,25,.72);
    border: 1px solid rgba(255,255,255,.15); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: rgba(255,255,255,.85); transition: all .2s;
    opacity: 0;
  }
  .rent-heart svg { width: 15px; height: 15px; }
  .rent-heart:hover { background: var(--rose); color: #fff; border-color: transparent; transform: scale(1.08); }
  @media (hover: hover) {
    .rent-card:hover .rent-heart { opacity: 1; }
  }
  @media (hover: none) {
    .rent-heart { opacity: .65; }
  }
  .rent-heart.on {
    opacity: 1 !important;
    background: rgba(244,63,94,.35); color: #fff;
    border-color: rgba(244,63,94,.5);
  }

  /* Card body */
  .rent-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 0; flex: 1; }
  .rent-title {
    font-family: var(--head); font-size: 15.5px; font-weight: 700;
    letter-spacing: -.025em; margin: 0 0 5px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    color: var(--txt);
  }
  .rent-meta { font-family: var(--mono); font-size: 11px; color: var(--muted); margin-bottom: 12px; }

  /* Badges */
  .rent-badges { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
  .rent-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 9px; border-radius: 6px;
    font-family: var(--mono); font-size: 10px; letter-spacing: .04em;
    border: 1px solid transparent;
  }
  .rent-badge svg { width: 10px; height: 10px; flex-shrink: 0; }
  .rent-badge.fuel-petrol   { background: rgba(56,189,248,.1);  color: #0ea5e9; border-color: rgba(56,189,248,.2); }
  .rent-badge.fuel-diesel   { background: rgba(245,158,11,.1);  color: #d97706; border-color: rgba(245,158,11,.2); }
  .rent-badge.fuel-electric { background: rgba(14,210,163,.1);  color: #0db789; border-color: rgba(14,210,163,.2); }
  .rent-badge.fuel-hybrid   { background: rgba(132,204,22,.1);  color: #65a30d; border-color: rgba(132,204,22,.2); }
  .rent-badge.gear-auto     { background: rgba(124,107,255,.09); color: var(--violet); border-color: var(--violet-bd); }
  .rent-badge.gear-manual   { background: rgba(100,100,120,.09); color: var(--muted); border-color: var(--border); }

  /* Card footer */
  .rent-footer {
    margin-top: auto; padding-top: 12px;
    border-top: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .rent-loc { display: flex; align-items: center; gap: 5px; font-family: var(--mono); font-size: 10.5px; color: var(--muted); }
  .rent-loc svg { width: 11px; height: 11px; color: var(--violet); flex-shrink: 0; }
  .rent-cta {
    display: flex; align-items: center; gap: 5px;
    font-family: var(--mono); font-size: 10.5px; letter-spacing: .07em; text-transform: uppercase;
    color: var(--violet); padding: 7px 13px; border-radius: 8px;
    background: var(--violet-bg); border: 1px solid var(--violet-bd);
    transition: all .2s; cursor: pointer;
  }
  .rent-cta svg { width: 11px; height: 11px; transition: transform .2s; }
  .rent-card:hover .rent-cta { background: var(--violet); color: #fff; border-color: var(--violet); }
  .rent-card:hover .rent-cta svg { transform: translateX(3px); }

  /* ── Skeleton ── */
  @keyframes sk-sh { 0% { background-position: -700px 0; } 100% { background-position: 700px 0; } }
  .rp:not(.dark) .sk-shimmer {
    background: linear-gradient(90deg, #ededf3 25%, #e2e2ec 50%, #ededf3 75%);
    background-size: 700px 100%; animation: sk-sh 1.5s infinite;
  }
  .rp.dark .sk-shimmer {
    background: linear-gradient(90deg, #151520 25%, rgba(255,255,255,.06) 50%, #151520 75%);
    background-size: 700px 100%; animation: sk-sh 1.5s infinite;
  }
  .sk-card { border-radius: 20px; overflow: hidden; border: 1.5px solid var(--border); background: var(--s1); }
  .sk-img { height: 225px; }
  .sk-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 10px; }
  .sk-line { border-radius: 6px; height: 11px; }
  .sk-badges { display: flex; gap: 7px; }
  .sk-badge { border-radius: 6px; height: 22px; width: 58px; }

  /* ── Empty state ── */
  .rp-empty {
    text-align: center; padding: clamp(60px, 10vw, 100px) 20px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .rp-empty-icon {
    width: 72px; height: 72px; border-radius: 22px;
    background: var(--violet-bg); border: 1.5px solid var(--violet-bd);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 4px;
  }
  .rp-empty-icon svg { width: 34px; height: 34px; color: var(--violet); }
  .rp-empty h3 {
    font-family: var(--head); font-size: clamp(20px, 3.5vw, 26px);
    font-weight: 700; letter-spacing: -.03em; margin: 0; color: var(--txt);
  }
  .rp-empty p { font-family: var(--mono); font-size: 12px; color: var(--muted); margin: 0; max-width: 300px; line-height: 1.7; }
  .rp-empty-btn {
    padding: 11px 22px; border-radius: 10px;
    background: var(--violet); color: #fff; border: none; cursor: pointer;
    font-family: var(--mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
    transition: transform .18s, box-shadow .18s; margin-top: 6px;
  }
  .rp-empty-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(124,107,255,.35); }

  /* ── Main content ── */
  .rp-main { max-width: 1280px; margin: 0 auto; padding: 0 24px clamp(60px, 8vw, 100px); }

  /* ── Animations ── */
  @keyframes rp-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .rp-fade { opacity: 0; animation: rp-up .42s ease forwards; }

  /* ── Quick-view Modal ── */
  .rp-backdrop {
    position: fixed; inset: 0; z-index: 300;
    background: rgba(4,4,12,.72);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: rp-up .22s ease;
  }
  .rp-modal {
    width: min(780px, 100%); max-height: 90vh; overflow-y: auto;
    background: var(--s1); border: 1.5px solid var(--border);
    border-radius: 24px; position: relative;
    box-shadow: 0 28px 80px rgba(0,0,0,.3);
    animation: rp-up .28s ease;
  }
  .rp-modal::-webkit-scrollbar { width: 4px; }
  .rp-modal::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  .rp-modal-close {
    position: absolute; right: 14px; top: 14px; z-index: 10;
    width: 36px; height: 36px; border-radius: 50%;
    border: 1.5px solid var(--border); background: var(--s1);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: var(--muted); transition: all .2s;
  }
  .rp-modal-close:hover { background: var(--rose); color: #fff; border-color: var(--rose); }
  .rp-modal-close svg { width: 14px; height: 14px; }
  .rp-modal-img-wrap { position: relative; height: 280px; overflow: hidden; border-radius: 22px 22px 0 0; background: var(--s2); }
  .rp-modal-img { width: 100%; height: 100%; object-fit: cover; }
  .rp-modal-img-grad {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(4,4,12,.6) 0%, transparent 55%);
  }
  .rp-modal-img-price {
    position: absolute; bottom: 16px; left: 16px;
    background: rgba(255,255,255,.97);
    border-radius: 12px; padding: 8px 14px;
    font-family: var(--mono); font-weight: 700; color: #0d0d14;
    display: flex; align-items: baseline; gap: 4px;
  }
  .rp.dark .rp-modal-img-price { background: rgba(10,10,20,.92); color: #eeeef6; }
  .rp-modal-img-price .big { font-size: 18px; }
  .rp-modal-img-price .sm { font-size: 10.5px; color: #888; }
  .rp-modal-body { padding: 22px 24px 26px; }
  .rp-modal-kicker { font-family: var(--mono); font-size: 9.5px; letter-spacing: .16em; text-transform: uppercase; color: var(--violet); margin-bottom: 6px; }
  .rp-modal-title { font-family: var(--head); font-size: clamp(22px, 3.5vw, 30px); font-weight: 700; letter-spacing: -.03em; margin: 0 0 14px; color: var(--txt); }
  .rp-modal-badges { display: flex; gap: 7px; flex-wrap: wrap; margin-bottom: 18px; }
  .rp-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 22px; }
  @media (max-width: 480px) { .rp-modal-grid { grid-template-columns: 1fr; } }
  .rp-modal-info-item {
    display: flex; align-items: center; gap: 9px;
    padding: 11px 14px; border-radius: 11px;
    background: var(--s2); border: 1px solid var(--border);
  }
  .rp-modal-info-icon { width: 14px; height: 14px; color: var(--violet); flex-shrink: 0; }
  .rp-modal-info-icon svg { width: 100%; height: 100%; }
  .rp-modal-info-label { font-family: var(--mono); font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
  .rp-modal-info-val { font-family: var(--mono); font-size: 12.5px; color: var(--txt); font-weight: 500; }
  .rp-modal-btns { display: flex; gap: 10px; }
  .rp-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 13px 22px; border-radius: 11px; flex: 1;
    font-family: var(--mono); font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
    text-decoration: none; transition: all .22s; border: 1.5px solid transparent; cursor: pointer;
  }
  .rp-btn svg { width: 12px; height: 12px; }
  .rp-btn.pri { background: var(--violet); border-color: var(--violet); color: #fff; }
  .rp-btn.pri:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(124,107,255,.4); }
  .rp-btn.out { background: transparent; border-color: var(--violet-bd); color: var(--violet); }
  .rp-btn.out:hover { background: var(--violet-bg); }

  /* ── Responsive ── */
  @media (prefers-reduced-motion: reduce) {
    .rp *, .rp *::before, .rp *::after {
      animation: none !important;
      transition-duration: 0.01ms !important;
    }
    .rp-fade { animation: none !important; opacity: 1 !important; }
  }

  @media (max-width: 767px) {
    .rp-filter-bar { border-radius: 14px; }
    .rp-main { padding-bottom: 72px; padding-left: 16px; padding-right: 16px; }
    .rp-top { padding: 0 16px 6px; }
    .rp-controls { padding-left: 16px; padding-right: 16px; }
    .rp-fi-sep { display: none; }
  }
  @media (max-width: 480px) {
    .rp-modal-btns { flex-direction: column; }
  }
`;

/* ─────────────────────────────────────────────────────────────────────────── */
/*  ICONS                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */
const IC = {
  location: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="11" r="2" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>,
  calendar: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5V6M17 3.5V6M4.5 9h15M6 5h12a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 18 19H6a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 6 5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  close:    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  search:   <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="m20 20-3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  filter:   <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>,
  arrow:    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye:      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>,
  fuel:     <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 22V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15M4 22h10M7 11h4M15 10l2.5 2.5a1.5 1.5 0 0 1 0 2.1V18a1 1 0 0 0 2 0v-5.5L17 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 5h6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  gear:     <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  car:      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0M17 17m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0M5 17H3v-4l2-5h14l2 5v4h-2M5 17h12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 9h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  heart:    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  heartFill:<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.4-5.6-8.4-9.2C3 10.8 2.2 8.1 3.5 5.8 4.6 3.8 6.7 3 8.8 3c1.5 0 3 .6 3.2 2.1C12.1 3.6 13.6 3 15.1 3c2.1 0 4.2.8 5.3 2.8 1.3 2.3.5 5-1 6-2 3.6-8.4 9.2-8.4 9.2Z" fill="currentColor"/></svg>,
  grid:     <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" fill="currentColor"/></svg>,
  list:     <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  brand:    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M9 9h6M9 12h4M9 15h5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  price:    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M12 7v10M9.5 9.5A2.5 2.5 0 0 1 12 8h1a2 2 0 0 1 0 4h-2a2 2 0 0 0 0 4h1.5a2.5 2.5 0 0 0 2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CONSTANTS & HELPERS                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
const TAB_KEYS = ["all", "sedan", "suv", "luxury", "budget"];
const ALL_LOC  = "__all__";

function matchesTab(r, tab) {
  if (tab === "all") return true;
  const p   = Number(r.pricePerDay) || 0;
  const hay = `${r.title || ""} ${r.brand || ""} ${r.model || ""}`.toLowerCase();
  if (tab === "budget")  return p < 500;
  if (tab === "luxury")  return p >= 1200 || /(mercedes|bmw|audi|porsche|lexus|range.?rover|tesla)/i.test(hay);
  if (tab === "suv")     return /(suv|crossover|range.?rover|q[3578]|x[3567])/i.test(hay);
  if (tab === "sedan")   return /(sedan|series|classe|class|a4|a6|c-?class|e-?class|s-?class)/i.test(hay);
  return true;
}

function fuelClass(fuel = "") {
  const f = fuel.toLowerCase();
  if (f.includes("electric")) return "fuel-electric";
  if (f.includes("hybrid"))   return "fuel-hybrid";
  if (f.includes("diesel"))   return "fuel-diesel";
  return "fuel-petrol";
}

function sortRentals(list, key) {
  if (key === "price-asc")  return [...list].sort((a, b) => (Number(a.pricePerDay) || 0) - (Number(b.pricePerDay) || 0));
  if (key === "price-desc") return [...list].sort((a, b) => (Number(b.pricePerDay) || 0) - (Number(a.pricePerDay) || 0));
  if (key === "name")       return [...list].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  return list;
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SUB-COMPONENTS                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk-img sk-shimmer" />
      <div className="sk-body">
        <div className="sk-line sk-shimmer" style={{ width: "70%" }} />
        <div className="sk-line sk-shimmer" style={{ width: "46%" }} />
        <div className="sk-badges">
          <div className="sk-badge sk-shimmer" />
          <div className="sk-badge sk-shimmer" />
        </div>
        <div className="sk-line sk-shimmer" style={{ width: "38%", marginTop: 8 }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function Rentals() {
  const { copy } = useAppLang();
  const navigate = useNavigate();

  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("goo-theme") || localStorage.getItem("rentals-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  });
  const [activeTab, setActiveTab] = useState("all");
  const [locationKey, setLocationKey] = useState(ALL_LOC);
  const [sortKey, setSortKey] = useState("default");
  const [quickView, setQuickView] = useState(null);
  const [showAdv, setShowAdv] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [favIds, setFavIds] = useState(() => {
    try {
      const raw = localStorage.getItem(FAV_STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch {
      /* ignore */
    }
    return new Set();
  });

  const [filters, setFilters] = useState({
    brand: "", minPrice: "", maxPrice: "",
    startDate: "", endDate: "", fuel: "", gearbox: "",
  });

  const titleParts = useMemo(() => {
    const bits = copy.rentals.title.trim().split(/\s+/);
    if (!bits.length) return { lead: "", last: "" };
    const last = bits.pop() || "";
    return { lead: bits.join(" "), last };
  }, [copy.rentals.title]);

  /* ── fetch ── */
  const fetchRentals = async () => {
    setLoading(true);
    try {
      const res = await getApprovedRentals({});
      setRentals(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRentals(); }, []);

  useEffect(() => {
    const syncDarkFromNav = () => {
      const s = localStorage.getItem("goo-theme");
      if (s === "dark" || s === "light") setDark(s === "dark");
    };
    window.addEventListener("goovoiture-theme", syncDarkFromNav);
    syncDarkFromNav();
    return () => window.removeEventListener("goovoiture-theme", syncDarkFromNav);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify([...favIds]));
    } catch {
      /* ignore */
    }
  }, [favIds]);

  const toggleFav = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cities = useMemo(
    () => [...new Set(rentals.map((r) => r.city).filter(Boolean))].sort(),
    [rentals]
  );

  const displayed = useMemo(
    () =>
      sortRentals(
        rentals.filter((r) => {
          if (!matchesTab(r, activeTab)) return false;
          const city = (r.city || "").toLowerCase();
          if (locationKey !== ALL_LOC && city !== locationKey.toLowerCase()) return false;
          if (citySearch && !city.includes(citySearch.toLowerCase())) return false;
          const p = Number(r.pricePerDay) || 0;
          if (filters.minPrice && p < Number(filters.minPrice)) return false;
          if (filters.maxPrice && p > Number(filters.maxPrice)) return false;
          if (filters.brand && !(r.brand || "").toLowerCase().includes(filters.brand.toLowerCase())) return false;
          if (filters.fuel && (r.fuel || "").toLowerCase() !== filters.fuel.toLowerCase()) return false;
          if (filters.gearbox && (r.gearbox || "").toLowerCase() !== filters.gearbox.toLowerCase()) return false;
          return true;
        }),
        sortKey
      ),
    [rentals, activeTab, locationKey, citySearch, filters, sortKey]
  );

  const tabCounts = useMemo(
    () =>
      TAB_KEYS.reduce((acc, k) => {
        acc[k] = rentals.filter((r) => matchesTab(r, k)).length;
        return acc;
      }, {}),
    [rentals]
  );

  /* ── active chips ── */
  const CHIP_DEFS = [
    { key: "brand", label: `${copy.cars.brandPh}: ${filters.brand}`, cond: !!filters.brand },
    { key: "minPrice", label: `${copy.rentals.minPh}: ${filters.minPrice}`, cond: !!filters.minPrice },
    { key: "maxPrice", label: `${copy.rentals.maxPh}: ${filters.maxPrice}`, cond: !!filters.maxPrice },
    { key: "fuel", label: `${copy.rentals.fuelType}: ${filters.fuel}`, cond: !!filters.fuel },
    { key: "gearbox", label: `${copy.rentals.gearbox}: ${filters.gearbox}`, cond: !!filters.gearbox },
    { key: "startDate", label: `${copy.rentals.start}: ${filters.startDate}`, cond: !!filters.startDate },
    { key: "endDate", label: `${copy.rentals.end}: ${filters.endDate}`, cond: !!filters.endDate },
  ].filter((c) => c.cond);

  const advCount = CHIP_DEFS.length;

  const removeChip = (key) => setFilters(f => ({ ...f, [key]: "" }));
  const clearAll   = () => {
    setFilters({ brand: "", minPrice: "", maxPrice: "", startDate: "", endDate: "", fuel: "", gearbox: "" });
    setCitySearch(""); setLocationKey(ALL_LOC); setActiveTab("all");
  };

  /* ── stats ── */
  const minPrice = rentals.length ? Math.min(...rentals.map(r => Number(r.pricePerDay) || 0).filter(Boolean)) : 0;

  return (
    <div className={`rp${dark ? " dark" : ""}`}>
      <style>{STYLES}</style>

      <section className="rp-top rp-fade">
        <div className="rp-top-head">
          <div>
            <p className="rp-top-kicker">{copy.rentals.kicker}</p>
            <h1 className="rp-top-title">
              {titleParts.lead ? <>{titleParts.lead} </> : null}
              <em>{titleParts.last}</em>
            </h1>
            <p className="rp-top-sub">{copy.rentals.sub}</p>
            {!loading && rentals.length > 0 && (
              <div className="rp-top-stats">
                <div className="rp-top-stat">
                  <span className="rp-top-stat-num">{rentals.length}</span>
                  <span className="rp-top-stat-lbl">{copy.rentals.statCars}</span>
                </div>
                <div className="rp-top-stat">
                  <span className="rp-top-stat-num">{cities.length}</span>
                  <span className="rp-top-stat-lbl">{copy.rentals.statCities}</span>
                </div>
                <div className="rp-top-stat">
                  <span className="rp-top-stat-num">{minPrice > 0 ? `${minPrice}` : "—"}</span>
                  <span className="rp-top-stat-lbl">{copy.rentals.statFrom}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="rp-controls">

        {/* Category tabs */}
        <div className="rp-tabs-wrap rp-fade" style={{ animationDelay: "40ms" }}>
          {TAB_KEYS.map(k => (
            <button key={k} type="button"
              className={`rp-tab${activeTab === k ? " active" : ""}`}
              onClick={() => setActiveTab(k)}
            >
              {copy.rentals.tabs[k]}
              {!loading && <span className="rp-tab-count">{tabCounts[k]}</span>}
            </button>
          ))}
        </div>

        {/* Quick filter bar */}
        <div className="rp-filter-bar rp-fade" style={{ animationDelay: "80ms" }}>
          {/* City search */}
          <div className="rp-fi" style={{ minWidth: 160 }}>
            <span className="rp-fi-icon">{IC.location}</span>
            <input
              className="rp-fi-input"
              placeholder={copy.rentals.cityPh}
              value={citySearch}
              onChange={e => { setCitySearch(e.target.value); setLocationKey(ALL_LOC); }}
            />
          </div>

          <div className="rp-fi-sep" />

          {/* City select */}
          <div className="rp-fi" style={{ minWidth: 140 }}>
            <span className="rp-fi-icon">{IC.filter}</span>
            <select
              className="rp-fi-input"
              style={{ paddingLeft: 32, cursor: "pointer" }}
              value={locationKey}
              onChange={e => { setLocationKey(e.target.value); setCitySearch(""); }}
            >
              <option value={ALL_LOC}>{copy.rentals.allCities}</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="rp-fi-sep" />

          {/* Sort */}
          <select className="rp-sort-select" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
            <option value="default">{copy.rentals.sortDefault}</option>
            <option value="price-asc">{copy.rentals.sortPriceAsc}</option>
            <option value="price-desc">{copy.rentals.sortPriceDesc}</option>
            <option value="name">{copy.rentals.sortName}</option>
          </select>

          <div className="rp-fi-sep" />

          {/* Advanced toggle */}
          <button type="button"
            className={`rp-filter-toggle${advCount > 0 ? " has-active" : ""}`}
            onClick={() => setShowAdv(v => !v)}
          >
            <span className="rp-filter-icon">{IC.filter}</span>
            {copy.rentals.moreFilters}
            {advCount > 0 && <span className="rp-filter-toggle-badge">{advCount}</span>}
          </button>

          {/* Search */}
          <button type="button" className="rp-search-btn" onClick={fetchRentals}>
            {IC.search}
            {copy.rentals.apply}
          </button>
        </div>

        {/* Advanced filters */}
        <div className={`rp-adv-wrap${showAdv ? " open" : ""}`}>
          <div className="rp-adv">
            <div className="rp-adv-field">
              <span className="rp-adv-label">{copy.cars.brandPh}</span>
              <input
                className="rp-adv-input"
                placeholder={copy.rentals.brandPhAdv}
                value={filters.brand}
                onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
              />
            </div>
            <div className="rp-adv-field">
              <span className="rp-adv-label">{copy.rentals.minPh}</span>
              <input className="rp-adv-input" type="number" placeholder="0"
                value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
            </div>
            <div className="rp-adv-field">
              <span className="rp-adv-label">{copy.rentals.maxPh}</span>
              <input className="rp-adv-input" type="number" placeholder="∞"
                value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
            </div>
            <div className="rp-adv-field">
              <span className="rp-adv-label">{copy.rentals.fuelType}</span>
              <select className="rp-adv-input" value={filters.fuel} onChange={(e) => setFilters((f) => ({ ...f, fuel: e.target.value }))}>
                <option value="">{copy.rentals.any}</option>
                {["Petrol", "Diesel", "Hybrid", "Electric"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="rp-adv-field">
              <span className="rp-adv-label">{copy.rentals.gearbox}</span>
              <select className="rp-adv-input" value={filters.gearbox} onChange={(e) => setFilters((f) => ({ ...f, gearbox: e.target.value }))}>
                <option value="">{copy.rentals.any}</option>
                {["Manual", "Automatic"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="rp-adv-field">
              <span className="rp-adv-label">{copy.rentals.start}</span>
              <input className="rp-adv-input" type="date"
                value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="rp-adv-field">
              <span className="rp-adv-label">{copy.rentals.end}</span>
              <input className="rp-adv-input" type="date"
                value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
            </div>
          </div>
        </div>

        {/* Active filter chips */}
        {CHIP_DEFS.length > 0 && (
          <div className="rp-chips rp-fade">
            {CHIP_DEFS.map(c => (
              <span key={c.key} className="rp-chip">
                {c.label}
                <button className="rp-chip-x" onClick={() => removeChip(c.key)} aria-label="Remove filter">✕</button>
              </span>
            ))}
            <button type="button" className="rp-clear-all" onClick={clearAll}>{copy.rentals.clearAll}</button>
          </div>
        )}
      </div>

      <div className="rp-main">

        {!loading && rentals.length > 0 && (
          <div className="rp-results-bar rp-fade" style={{ animationDelay: "100ms" }}>
            <div className="rp-results-left">
              <p className="rp-results-count">
                <strong>{displayed.length}</strong> {copy.rentals.shown}
              </p>
            </div>
            <div className="rp-view-toggles" role="group" aria-label={copy.rentals.viewLayout}>
              <button
                type="button"
                className={`rp-view-btn${viewMode === "grid" ? " on" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                aria-label={copy.rentals.viewGrid}
                title={copy.rentals.viewGrid}
              >
                {IC.grid}
              </button>
              <button
                type="button"
                className={`rp-view-btn${viewMode === "list" ? " on" : ""}`}
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                aria-label={copy.rentals.viewList}
                title={copy.rentals.viewList}
              >
                {IC.list}
              </button>
            </div>
          </div>
        )}

        <div className={`rp-grid${viewMode === "list" ? " list" : ""}`}>
          {/* Skeleton */}
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {/* Cards */}
          {!loading && displayed.map((r, idx) => {
            const img  = r.images?.[0];
            const fuel = r.fuel || "";
            const gear = r.gearbox || "";
            return (
              <div
                key={r._id}
                className={`rent-card rp-fade${viewMode === "list" ? " is-list" : ""}`}
                style={{ animationDelay: `${100 + idx * 45}ms` }}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/rentals/${r._id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/rentals/${r._id}`);
                  }
                }}
              >
                {/* Image */}
                <div className="rent-img-wrap">
                  {img
                    ? <img src={img} alt={r.title} className="rent-img" loading="lazy" />
                    : (
                      <div className="rent-no-img">
                        {IC.car}
                        <span>{copy.rentals.noImg}</span>
                      </div>
                    )
                  }
                  <div className="rent-img-gradient" />

                  {/* City tag */}
                  {r.city && (
                    <div className="rent-city-tag">
                      {IC.location}
                      {r.city}
                    </div>
                  )}

                  {/* Price */}
                  <div className="rent-price-tag">
                    <span className="rent-price-num">{Number(r.pricePerDay).toLocaleString()}</span>
                    <span className="rent-price-unit">{copy.rentals.madDay}</span>
                  </div>

                  {/* Quick view */}
                  <button type="button" className="rent-qv-btn"
                    onClick={e => { e.stopPropagation(); setQuickView(r); }}
                  >
                    {IC.eye} {copy.rentals.quickView}
                  </button>

                  <button
                    type="button"
                    className={`rent-heart${favIds.has(r._id) ? " on" : ""}`}
                    onClick={(e) => toggleFav(r._id, e)}
                    aria-label={favIds.has(r._id) ? copy.rentals.savedListing : copy.rentals.saveListing}
                    aria-pressed={favIds.has(r._id)}
                  >
                    {favIds.has(r._id) ? IC.heartFill : IC.heart}
                  </button>
                </div>

                {/* Body */}
                <div className="rent-body">
                  <h3 className="rent-title">{r.title}</h3>
                  <p className="rent-meta">
                    {[r.brand, r.model].filter(Boolean).join(" ")}{r.year ? ` · ${r.year}` : ""}
                  </p>

                  {/* Badges */}
                  {(fuel || gear) && (
                    <div className="rent-badges">
                      {fuel && (
                        <span className={`rent-badge ${fuelClass(fuel)}`}>
                          {IC.fuel} {fuel}
                        </span>
                      )}
                      {gear && (
                        <span className={`rent-badge ${gear.toLowerCase() === "automatic" ? "gear-auto" : "gear-manual"}`}>
                          {IC.gear} {gear}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="rent-footer">
                    <span className="rent-loc">
                      {IC.location}
                      {r.city || "—"}
                    </span>
                    <span className="rent-cta">
                      {copy.rentals.viewArrow} {IC.arrow}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {!loading && displayed.length === 0 && (
          <div className="rp-empty rp-fade">
            <div className="rp-empty-icon">{IC.car}</div>
            <h3>{copy.rentals.emptyTitle}</h3>
            <p>{copy.rentals.emptySub}</p>
            {(CHIP_DEFS.length > 0 || activeTab !== "all" || locationKey !== ALL_LOC) && (
              <button type="button" className="rp-empty-btn" onClick={clearAll}>
                {copy.rentals.clearFilters}
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Quick-view modal ── */}
      {quickView && (
        <div className="rp-backdrop" onClick={() => setQuickView(null)} role="presentation">
          <div className="rp-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="qv-title">
            <button type="button" className="rp-modal-close" onClick={() => setQuickView(null)} aria-label={copy.rentals.close}>
              {IC.close}
            </button>

            {/* Image */}
            <div className="rp-modal-img-wrap">
              {quickView.images?.[0]
                ? <img src={quickView.images[0]} alt={quickView.title} className="rp-modal-img" />
                : <div className="rp-modal-img-wrap sk-shimmer" />
              }
              <div className="rp-modal-img-grad" />
              <div className="rp-modal-img-price">
                <span className="big">{Number(quickView.pricePerDay).toLocaleString()}</span>
                <span className="sm">MAD{copy.rentals.perDay}</span>
              </div>
            </div>

            {/* Details */}
            <div className="rp-modal-body">
              <p className="rp-modal-kicker">Rental listing</p>
              <h2 id="qv-title" className="rp-modal-title">{quickView.title}</h2>

              {/* Badges */}
              <div className="rp-modal-badges">
                {quickView.fuel && (
                  <span className={`rent-badge ${fuelClass(quickView.fuel)}`} style={{ fontSize: 11, padding: "5px 11px" }}>
                    {IC.fuel} {quickView.fuel}
                  </span>
                )}
                {quickView.gearbox && (
                  <span className={`rent-badge ${quickView.gearbox?.toLowerCase() === "automatic" ? "gear-auto" : "gear-manual"}`} style={{ fontSize: 11, padding: "5px 11px" }}>
                    {IC.gear} {quickView.gearbox}
                  </span>
                )}
              </div>

              {/* Info grid */}
              <div className="rp-modal-grid">
                <div className="rp-modal-info-item">
                  <span className="rp-modal-info-icon">{IC.location}</span>
                  <div>
                    <p className="rp-modal-info-label">City</p>
                    <p className="rp-modal-info-val">{quickView.city || "—"}</p>
                  </div>
                </div>
                <div className="rp-modal-info-item">
                  <span className="rp-modal-info-icon">{IC.calendar}</span>
                  <div>
                    <p className="rp-modal-info-label">Year</p>
                    <p className="rp-modal-info-val">{quickView.year ?? "—"}</p>
                  </div>
                </div>
                <div className="rp-modal-info-item">
                  <span className="rp-modal-info-icon">{IC.brand}</span>
                  <div>
                    <p className="rp-modal-info-label">Brand · Model</p>
                    <p className="rp-modal-info-val">{[quickView.brand, quickView.model].filter(Boolean).join(" ") || "—"}</p>
                  </div>
                </div>
                <div className="rp-modal-info-item">
                  <span className="rp-modal-info-icon">{IC.price}</span>
                  <div>
                    <p className="rp-modal-info-label">Daily rate</p>
                    <p className="rp-modal-info-val" style={{ color: "var(--violet)" }}>{Number(quickView.pricePerDay).toLocaleString()} MAD</p>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="rp-modal-btns">
                <Link to={`/rentals/${quickView._id}`} className="rp-btn pri">
                  {IC.eye} {copy.rentals.viewDetails}
                </Link>
                <Link to={`/rentals/${quickView._id}`} className="rp-btn out">
                  {copy.rentals.contact}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
