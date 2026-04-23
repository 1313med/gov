import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";
import { saveAuth } from "../utils/authStorage";
import { useAppLang } from "../context/AppLangContext";

/* ─────────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg0:    #05060f;
  --bg1:    #080c1a;
  --bg2:    #0e1228;
  --glass:  rgba(255,255,255,0.04);
  --glass2: rgba(255,255,255,0.07);
  --border: rgba(255,255,255,0.08);
  --border2:rgba(255,255,255,0.14);
  --p1:     #7c6bff;
  --p2:     #a78bfa;
  --p3:     #38bdf8;
  --p-glow: rgba(124,107,255,0.35);
  --ink:    #ffffff;
  --ink2:   rgba(255,255,255,0.7);
  --ink3:   rgba(255,255,255,0.4);
  --ink4:   rgba(255,255,255,0.2);
  --danger: #ff6b6b;
  --sans:   'Inter', sans-serif;
  --display:'Syne', sans-serif;
  --mono:   'Space Mono', monospace;
}

/* ── ROOT WRAP ── */
.lx-root {
  min-height: 100vh;
  background: var(--bg0);
  display: flex;
  align-items: stretch;
  font-family: var(--sans);
  position: relative;
  overflow: hidden;
}

/* ── ANIMATED GRADIENT BACKGROUND ── */
.lx-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(ellipse 80% 70% at 10% 20%, rgba(124,107,255,0.18) 0%, transparent 60%),
              radial-gradient(ellipse 60% 60% at 90% 80%, rgba(56,189,248,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 50% 50%, rgba(167,139,250,0.07) 0%, transparent 70%),
              var(--bg0);
  animation: bgPulse 8s ease-in-out infinite alternate;
}
@keyframes bgPulse {
  0%   { opacity: 1; }
  100% { opacity: 0.75; }
}

/* ── GRID OVERLAY ── */
.lx-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
}

/* ── FLOATING ORBS ── */
.lx-orb {
  position: fixed; z-index: 0; pointer-events: none; border-radius: 50%;
  filter: blur(80px); mix-blend-mode: screen;
}
.lx-orb1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(124,107,255,0.25), transparent 70%);
  top: -150px; left: -150px;
  animation: orbFloat1 12s ease-in-out infinite alternate;
}
.lx-orb2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(56,189,248,0.2), transparent 70%);
  bottom: -100px; right: -100px;
  animation: orbFloat2 10s ease-in-out infinite alternate;
}
.lx-orb3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(167,139,250,0.15), transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  animation: orbFloat3 15s ease-in-out infinite alternate;
}
@keyframes orbFloat1 {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(80px,60px) scale(1.15); }
}
@keyframes orbFloat2 {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(-60px,-80px) scale(1.1); }
}
@keyframes orbFloat3 {
  0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-48%,-52%) scale(1.2); opacity: 0.8; }
}

/* ── PARTICLES ── */
.lx-particle {
  position: fixed; z-index: 0; pointer-events: none;
  border-radius: 50%;
  background: var(--p1);
  opacity: 0;
  animation: particleFade linear infinite;
}
@keyframes particleFade {
  0%   { opacity: 0; transform: translateY(0) scale(0); }
  15%  { opacity: 0.6; transform: translateY(-20px) scale(1); }
  85%  { opacity: 0.3; transform: translateY(-120px) scale(0.6); }
  100% { opacity: 0; transform: translateY(-160px) scale(0); }
}

/* ── LEFT PANEL ── */
.lx-left {
  width: 52%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 56px 64px;
  z-index: 1;
}
.lx-left-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1.2s ease;
}
.lx-left-img.loaded { opacity: 1; }
.lx-left-veil {
  position: absolute; inset: 0; z-index: 1;
  background:
    linear-gradient(180deg, rgba(5,6,15,0.7) 0%, rgba(5,6,15,0.3) 40%, rgba(5,6,15,0.85) 100%),
    linear-gradient(90deg, rgba(5,6,15,0.9) 0%, transparent 100%);
}
.lx-left-noise {
  position: absolute; inset: 0; z-index: 2; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px;
}

.lx-left-inner { position: relative; z-index: 3; flex: 1; display: flex; flex-direction: column; }

/* Logo */
.lx-logo {
  display: inline-flex; align-items: center; gap: 10px;
  text-decoration: none;
  animation: slideDown 0.7s cubic-bezier(0.22,1,0.36,1) both;
}
.lx-logo-mark {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, var(--p1), var(--p3));
  display: flex; align-items: center; justify-content: center;
  font-family: var(--display); font-size: 16px; font-weight: 800; color: #fff;
  box-shadow: 0 0 20px rgba(124,107,255,0.5);
}
.lx-logo-text {
  font-family: var(--display); font-size: 17px; font-weight: 700;
  color: #fff; letter-spacing: -0.03em;
}
.lx-logo-text span { color: var(--p2); }

/* Hero copy */
.lx-hero {
  margin-top: auto;
  animation: slideUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both;
}
.lx-hero-tag {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--p2);
  margin-bottom: 20px;
}
.lx-hero-tag::before {
  content: ''; display: block; width: 28px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--p2));
}
.lx-hero h1 {
  font-family: var(--display);
  font-size: clamp(38px, 4vw, 64px);
  font-weight: 800; line-height: 0.92; letter-spacing: -0.04em;
  color: #fff; margin-bottom: 22px;
}
.lx-hero h1 em {
  font-style: italic;
  background: linear-gradient(90deg, var(--p1), var(--p3));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.lx-hero-sub {
  font-size: 14px; font-weight: 300; line-height: 1.75;
  color: var(--ink3); max-width: 320px; margin-bottom: 32px;
}

/* Pills */
.lx-pills { display: flex; flex-wrap: wrap; gap: 8px; }
.lx-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 999px;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(10px);
  font-family: var(--mono); font-size: 9px;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink3);
  transition: all 0.3s;
}
.lx-pill::before {
  content: ''; display: block; width: 5px; height: 5px; border-radius: 50%;
  background: var(--p2); opacity: 0.7;
}
.lx-pill:hover {
  border-color: rgba(124,107,255,0.4);
  background: rgba(124,107,255,0.1);
  color: var(--p2);
}

/* Stats row */
.lx-stats {
  display: flex; gap: 28px; margin-top: 36px; padding-top: 28px;
  border-top: 1px solid var(--border);
}
.lx-stat {}
.lx-stat-num {
  font-family: var(--display); font-size: 22px; font-weight: 800;
  color: #fff; letter-spacing: -0.03em; line-height: 1;
}
.lx-stat-num span {
  background: linear-gradient(90deg, var(--p1), var(--p2));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.lx-stat-label {
  font-size: 10px; font-weight: 400; color: var(--ink4);
  letter-spacing: 0.05em; margin-top: 4px;
}

/* ── RIGHT PANEL ── */
.lx-right {
  flex: 1;
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 48px 32px;
}

/* Card */
.lx-card {
  width: 100%; max-width: 420px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border2);
  border-radius: 24px;
  padding: 40px 36px;
  backdrop-filter: blur(24px);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.05) inset,
    0 32px 64px rgba(0,0,0,0.5),
    0 0 80px rgba(124,107,255,0.08);
  position: relative; overflow: hidden;
  animation: cardIn 0.9s cubic-bezier(0.22,1,0.36,1) both;
}
.lx-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124,107,255,0.5), transparent);
}
.lx-card-glow {
  position: absolute; inset: -1px; z-index: -1; border-radius: 25px;
  background: linear-gradient(135deg, rgba(124,107,255,0.15), transparent 60%);
  opacity: 0; transition: opacity 0.4s;
}
.lx-card:hover .lx-card-glow { opacity: 1; }

/* Back link */
.lx-back {
  position: absolute; top: 28px; right: 28px;
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink4);
  text-decoration: none;
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 999px;
  border: 1px solid var(--border);
  transition: all 0.25s;
  animation: fadeIn 0.6s 0.5s both;
}
.lx-back:hover {
  color: var(--ink2); border-color: var(--border2);
  background: var(--glass2);
}

/* Card header */
.lx-ch { margin-bottom: 32px; animation: slideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
.lx-ch-badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 4px 12px 4px 6px;
  background: rgba(124,107,255,0.12);
  border: 1px solid rgba(124,107,255,0.25);
  border-radius: 999px; margin-bottom: 18px;
}
.lx-ch-badge-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: linear-gradient(135deg, var(--p1), var(--p3));
  box-shadow: 0 0 8px var(--p-glow);
  animation: dotPulse 2s ease-in-out infinite;
}
@keyframes dotPulse {
  0%,100% { box-shadow: 0 0 8px var(--p-glow); }
  50%      { box-shadow: 0 0 16px var(--p-glow), 0 0 24px rgba(56,189,248,0.2); }
}
.lx-ch-badge span {
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--p2);
}
.lx-ch h2 {
  font-family: var(--display); font-size: 32px; font-weight: 800;
  letter-spacing: -0.04em; line-height: 1; color: #fff; margin-bottom: 8px;
}
.lx-ch h2 em {
  font-style: italic;
  background: linear-gradient(90deg, var(--p2), var(--p3));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.lx-ch-sub {
  font-size: 13px; color: var(--ink3); font-weight: 300; line-height: 1.6;
}

/* Error */
.lx-error {
  display: flex; align-items: flex-start; gap: 10px;
  background: rgba(255,107,107,0.08);
  border: 1px solid rgba(255,107,107,0.2);
  border-radius: 12px; padding: 12px 14px; margin-bottom: 20px;
  animation: slideUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
}
.lx-error-icon {
  flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
  background: rgba(255,107,107,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px;
}
.lx-error-text {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.02em;
  color: var(--danger); line-height: 1.5;
}

/* Form */
.lx-form { display: flex; flex-direction: column; gap: 14px; }
.lx-form-anim { animation: slideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both; }

/* Input fields */
.lx-field { position: relative; }
.lx-field-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--ink4); font-size: 14px; pointer-events: none; z-index: 2;
  transition: color 0.25s;
}
.lx-field:focus-within .lx-field-icon { color: var(--p2); }

.lx-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 16px 8px 44px;
  font-family: var(--mono); font-size: 13px;
  color: #fff; outline: none;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  caret-color: var(--p2);
}
.lx-input::placeholder { color: transparent; }
.lx-input:focus {
  border-color: rgba(124,107,255,0.5);
  background: rgba(124,107,255,0.08);
  box-shadow: 0 0 0 3px rgba(124,107,255,0.1), inset 0 0 20px rgba(124,107,255,0.05);
}
.lx-input.has-error {
  border-color: rgba(255,107,107,0.4);
  background: rgba(255,107,107,0.05);
}

.lx-label {
  position: absolute; left: 44px; top: 14px;
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.04em;
  color: var(--ink4); pointer-events: none;
  transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
}
.lx-input:focus + .lx-label,
.lx-input:not(:placeholder-shown) + .lx-label {
  top: 6px; font-size: 9px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--p2);
}

/* Password toggle */
.lx-pw-toggle {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--ink4); font-size: 12px; padding: 6px;
  border-radius: 6px; transition: color 0.2s, background 0.2s;
  font-family: var(--mono); letter-spacing: 0.05em;
}
.lx-pw-toggle:hover { color: var(--p2); background: rgba(124,107,255,0.1); }

/* Divider */
.lx-divider {
  display: flex; align-items: center; gap: 12px; margin: 4px 0;
}
.lx-divider::before, .lx-divider::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}
.lx-divider span {
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink4); white-space: nowrap;
}

/* Submit button */
.lx-submit {
  width: 100%; padding: 16px;
  background: linear-gradient(135deg, var(--p1) 0%, rgba(56,189,248,0.8) 100%);
  border: none; border-radius: 14px;
  font-family: var(--display); font-size: 14px; font-weight: 700;
  letter-spacing: 0.02em; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  box-shadow: 0 8px 32px rgba(124,107,255,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset;
  position: relative; overflow: hidden;
}
.lx-submit::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  opacity: 0; transition: opacity 0.25s;
}
.lx-submit:hover:not(:disabled)::before { opacity: 1; }
.lx-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(124,107,255,0.45), 0 0 0 1px rgba(255,255,255,0.15) inset;
}
.lx-submit:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(124,107,255,0.3);
}
.lx-submit:disabled { opacity: 0.55; cursor: not-allowed; }

/* Ripple effect */
.lx-ripple {
  position: absolute; border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}
@keyframes ripple {
  to { transform: scale(4); opacity: 0; }
}

/* Spinner */
.lx-spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Progress bar */
.lx-progress {
  position: absolute; bottom: 0; left: 0;
  height: 2px; width: 0%;
  background: linear-gradient(90deg, var(--p1), var(--p3));
  border-radius: 0 0 14px 14px;
  transition: width 1.5s ease;
}
.lx-submit.loading .lx-progress { width: 80%; }

/* Footer */
.lx-footer {
  margin-top: 22px; text-align: center;
  font-size: 13px; color: var(--ink3); font-weight: 300;
  animation: fadeIn 0.6s 0.4s both;
}
.lx-footer a {
  color: var(--p2); font-weight: 500; text-decoration: none;
  position: relative;
  transition: color 0.2s;
}
.lx-footer a::after {
  content: '';
  position: absolute; bottom: -1px; left: 0; right: 0;
  height: 1px; background: var(--p2); transform: scaleX(0);
  transform-origin: right; transition: transform 0.25s ease;
}
.lx-footer a:hover::after { transform: scaleX(1); transform-origin: left; }

/* Mobile logo on right panel */
.lx-mobile-logo {
  display: none; text-align: center;
  margin-bottom: 28px;
  animation: slideDown 0.6s cubic-bezier(0.22,1,0.36,1) both;
}
.lx-mobile-logo-inner {
  display: inline-flex; align-items: center; gap: 10px;
  text-decoration: none;
}

/* ── KEYFRAMES ── */
@keyframes cardIn {
  from { opacity: 0; transform: translateY(32px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .lx-left { display: none; }
  .lx-right { padding: 32px 20px; }
  .lx-mobile-logo { display: block; }
  .lx-card { padding: 32px 24px; }
}
@media (max-width: 480px) {
  .lx-right { padding: 24px 16px; align-items: flex-start; padding-top: 48px; }
  .lx-card { border-radius: 20px; padding: 28px 20px; }
  .lx-ch h2 { font-size: 26px; }
  .lx-back { top: 16px; right: 16px; }
}

/* ── SMOOTH SCROLL GLOW ON MOBILE ── */
@media (max-width: 900px) {
  .lx-root { background: var(--bg0); }
  .lx-orb1 { width: 300px; height: 300px; opacity: 0.6; }
  .lx-orb2 { width: 200px; height: 200px; opacity: 0.6; }
}
`;

/* ─────────────────────────────────────────────
   PARTICLES COMPONENT
───────────────────────────────────────────── */
function Particles() {
  const configs = [
    { w:3, h:3, l:"15%", t:"70%", delay:"0s",   dur:"6s",  color:"#7c6bff" },
    { w:2, h:2, l:"25%", t:"80%", delay:"1.5s",  dur:"7s",  color:"#a78bfa" },
    { w:4, h:4, l:"40%", t:"75%", delay:"3s",    dur:"8s",  color:"#38bdf8" },
    { w:2, h:2, l:"60%", t:"85%", delay:"0.8s",  dur:"5.5s",color:"#7c6bff" },
    { w:3, h:3, l:"75%", t:"78%", delay:"2.2s",  dur:"7.5s",color:"#a78bfa" },
    { w:2, h:2, l:"85%", t:"72%", delay:"4s",    dur:"6.5s",color:"#38bdf8" },
    { w:3, h:3, l:"55%", t:"88%", delay:"1s",    dur:"9s",  color:"#7c6bff" },
    { w:2, h:2, l:"35%", t:"82%", delay:"3.5s",  dur:"6s",  color:"#a78bfa" },
  ];
  return (
    <>
      {configs.map((p, i) => (
        <div key={i} className="lx-particle" style={{
          width: p.w, height: p.h,
          left: p.l, top: p.t,
          background: p.color,
          animationDelay: p.delay,
          animationDuration: p.dur,
        }}/>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   FLOAT LABEL FIELD
───────────────────────────────────────────── */
function Field({ icon, label, value, onChange, type = "text", hasError }) {
  const { copy } = useAppLang();
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPw ? "text" : "password") : type;

  return (
    <div className="lx-field">
      <span className="lx-field-icon">{icon}</span>
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder=" "
        required
        className={`lx-input${hasError ? " has-error" : ""}`}
      />
      <label className="lx-label">{label}</label>
      {isPassword && (
        <button
          type="button"
          className="lx-pw-toggle"
          onClick={() => setShowPw(v => !v)}
          tabIndex={-1}
        >
          {showPw ? copy.login.hide : copy.login.show}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN LOGIN COMPONENT
───────────────────────────────────────────── */
export default function Login() {
  const { copy } = useAppLang();
  const navigate  = useNavigate();
  const imgRef    = useRef(null);
  const btnRef    = useRef(null);

  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  // Lazy-load left panel image
  useEffect(() => {
    const img = new Image();
    img.src = "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1400&q=80";
    img.onload = () => {
      if (imgRef.current) imgRef.current.classList.add("loaded");
    };
  }, []);

  // Ripple effect on submit button
  function addRipple(e) {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;
    const ripple = document.createElement("span");
    ripple.className = "lx-ripple";
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    addRipple(e);
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", { phone, password });
      saveAuth(res.data);
      const role = res.data.role;
      if      (role === "admin")        navigate("/admin");
      else if (role === "seller")       navigate("/dashboard");
      else if (role === "rental_owner") navigate("/owner/analytics");
      else                              navigate("/");
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="lx-root">
      <style>{CSS}</style>

      {/* Background layers */}
      <div className="lx-bg" />
      <div className="lx-grid" />
      <div className="lx-orb lx-orb1" />
      <div className="lx-orb lx-orb2" />
      <div className="lx-orb lx-orb3" />
      <Particles />

      {/* ═══ LEFT PANEL ═══ */}
      <div className="lx-left">
        <img
          ref={imgRef}
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1400&q=80"
          alt=""
          className="lx-left-img"
        />
        <div className="lx-left-veil" />
        <div className="lx-left-noise" />

        <div className="lx-left-inner">
          {/* Logo */}
          <Link to="/" className="lx-logo">
            <div className="lx-logo-mark">G</div>
            <span className="lx-logo-text">Goo<span>voiture</span></span>
          </Link>

          {/* Hero */}
          <div className="lx-hero">
            <div className="lx-hero-tag">{copy.login.memberPortal}</div>
            <h1>
              {copy.login.heroL1}<br/>
              {copy.login.heroL2} <em>{copy.login.heroEm}</em><br/>
              {copy.login.heroL3}
            </h1>
            <p className="lx-hero-sub">
              {copy.login.heroSub}
            </p>
            <div className="lx-pills">
              {copy.login.pills.map((p, i) => (
                <span key={i} className="lx-pill">{p}</span>
              ))}
            </div>

            <div className="lx-stats">
              <div className="lx-stat">
                <div className="lx-stat-num"><span>12k</span>+</div>
                <div className="lx-stat-label">{copy.login.statListings}</div>
              </div>
              <div className="lx-stat">
                <div className="lx-stat-num"><span>4.8</span>★</div>
                <div className="lx-stat-label">{copy.login.statRating}</div>
              </div>
              <div className="lx-stat">
                <div className="lx-stat-num"><span>98</span>%</div>
                <div className="lx-stat-label">{copy.login.statSat}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="lx-right">

        <Link to="/" className="lx-back">{copy.login.back}</Link>

        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="lx-mobile-logo">
            <Link to="/" className="lx-mobile-logo-inner">
              <div className="lx-logo-mark">G</div>
              <span className="lx-logo-text">Goo<span>voiture</span></span>
            </Link>
          </div>

          {/* Glass card */}
          <div className="lx-card">
            <div className="lx-card-glow" />

            {/* Header */}
            <div className="lx-ch">
              <div className="lx-ch-badge">
                <div className="lx-ch-badge-dot" />
                <span>{copy.login.secureSignIn}</span>
              </div>
              <h2>{copy.login.welcomeTitle} <em>{copy.login.welcomeEm}</em></h2>
              <p className="lx-ch-sub">{copy.login.welcomeSub}</p>
            </div>

            {/* Error */}
            {error && (
              <div className="lx-error">
                <div className="lx-error-icon">⚠</div>
                <div className="lx-error-text">{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="lx-form lx-form-anim">

              <Field
                icon="📱"
                label={copy.login.phone}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                hasError={!!error}
              />

              <Field
                icon="🔒"
                label={copy.login.password}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                hasError={!!error}
              />

              <div style={{ textAlign: "right", marginTop: -4 }}>
                <Link
                  to="/forgot-password"
                  style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.06em", color: "var(--p2)", textDecoration: "none", opacity: 0.85 }}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                ref={btnRef}
                type="submit"
                className={`lx-submit${loading ? " loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="lx-spinner" />
                    {copy.login.authenticating}
                    <div className="lx-progress" />
                  </>
                ) : (
                  <>{copy.login.signInBtn}</>
                )}
              </button>

            </form>

            <div style={{ marginTop: 20 }}>
              <div className="lx-divider">
                <span>{copy.login.divider}</span>
              </div>
            </div>

            <p className="lx-footer">
              {copy.login.footerQ}{" "}
              <Link to="/register">{copy.login.footerLink}</Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
