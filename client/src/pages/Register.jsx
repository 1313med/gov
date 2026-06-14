import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAppLang } from "../context/AppLangContext";
import AuthTopBar from "../components/AuthTopBar";

/* ─────────────────────────────────────────────
   GLOBAL STYLES  (mirrors Login's lx-* system)
───────────────────────────────────────────── */
const CSS = `

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.rx-root {
  min-height: 100vh;
  background: var(--bg0);
  display: flex;
  align-items: stretch;
  font-family: var(--sans);
  position: relative;
  overflow: hidden;
}

/* ── ANIMATED GRADIENT BACKGROUND ── */
.rx-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(ellipse 80% 70% at 10% 20%, rgba(124,107,255,0.18) 0%, transparent 60%),
              radial-gradient(ellipse 60% 60% at 90% 80%, rgba(56,189,248,0.12) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 50% 50%, rgba(167,139,250,0.07) 0%, transparent 70%),
              var(--bg0);
  animation: rxBgPulse 8s ease-in-out infinite alternate;
}
@keyframes rxBgPulse {
  0%   { opacity: 1; }
  100% { opacity: 0.75; }
}

/* ── GRID OVERLAY ── */
.rx-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
}

/* ── FLOATING ORBS ── */
.rx-orb {
  position: fixed; z-index: 0; pointer-events: none; border-radius: 50%;
  filter: blur(80px); mix-blend-mode: screen;
}
.rx-orb1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(124,107,255,0.25), transparent 70%);
  top: -150px; left: -150px;
  animation: rxOrbFloat1 12s ease-in-out infinite alternate;
}
.rx-orb2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(56,189,248,0.2), transparent 70%);
  bottom: -100px; right: -100px;
  animation: rxOrbFloat2 10s ease-in-out infinite alternate;
}
.rx-orb3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(167,139,250,0.15), transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  animation: rxOrbFloat3 15s ease-in-out infinite alternate;
}
@keyframes rxOrbFloat1 {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(80px,60px) scale(1.15); }
}
@keyframes rxOrbFloat2 {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(-60px,-80px) scale(1.1); }
}
@keyframes rxOrbFloat3 {
  0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.5; }
  100% { transform: translate(-48%,-52%) scale(1.2); opacity: 0.8; }
}

/* ── PARTICLES ── */
.rx-particle {
  position: fixed; z-index: 0; pointer-events: none;
  border-radius: 50%;
  opacity: 0;
  animation: rxParticleFade linear infinite;
}
@keyframes rxParticleFade {
  0%   { opacity: 0; transform: translateY(0) scale(0); }
  15%  { opacity: 0.6; transform: translateY(-20px) scale(1); }
  85%  { opacity: 0.3; transform: translateY(-120px) scale(0.6); }
  100% { opacity: 0; transform: translateY(-160px) scale(0); }
}

/* ── LEFT PANEL ── */
.rx-left {
  width: 52%;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 56px 64px;
  z-index: 1;
}
.rx-left-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 1.2s ease;
}
.rx-left-img.loaded { opacity: 1; }
.rx-left-veil {
  position: absolute; inset: 0; z-index: 1;
  background:
    linear-gradient(180deg, rgba(5,6,15,0.7) 0%, rgba(5,6,15,0.3) 40%, rgba(5,6,15,0.85) 100%),
    linear-gradient(90deg, rgba(5,6,15,0.9) 0%, transparent 100%);
}
.rx-left-noise {
  position: absolute; inset: 0; z-index: 2; opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 200px;
}
.rx-left-inner { position: relative; z-index: 3; flex: 1; display: flex; flex-direction: column; }

/* Logo */
.rx-logo {
  display: inline-flex; align-items: center; gap: 10px;
  text-decoration: none;
  animation: rxSlideDown 0.7s cubic-bezier(0.22,1,0.36,1) both;
}
.rx-logo-mark {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, var(--p1), var(--p3));
  display: flex; align-items: center; justify-content: center;
  font-family: var(--display); font-size: 16px; font-weight: 800; color: #fff;
  box-shadow: 0 0 20px rgba(124,107,255,0.5);
}
.rx-logo-text {
  font-family: var(--display); font-size: 17px; font-weight: 700;
  color: var(--ink); letter-spacing: -0.03em;
}
.rx-logo-text span { color: var(--p2); }

/* Hero copy */
.rx-hero {
  margin-top: auto;
  animation: rxSlideUp 0.8s cubic-bezier(0.22,1,0.36,1) 0.2s both;
}
.rx-hero-tag {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--p2);
  margin-bottom: 20px;
}
.rx-hero-tag::before {
  content: ''; display: block; width: 28px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--p2));
}
.rx-hero h1 {
  font-family: var(--display);
  font-size: clamp(36px, 3.8vw, 60px);
  font-weight: 800; line-height: 0.95; letter-spacing: -0.04em;
  color: var(--ink); margin-bottom: 22px;
}
.rx-hero h1 em {
  font-style: italic;
  background: linear-gradient(90deg, var(--p1), var(--p3));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.rx-hero-sub {
  font-size: 14px; font-weight: 300; line-height: 1.75;
  color: var(--ink3); max-width: 320px; margin-bottom: 32px;
}

/* Role cards on left */
.rx-role-grid {
  display: flex; flex-direction: column; gap: 10px;
}
.rx-role-card {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 16px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}
.rx-role-card:hover {
  border-color: rgba(124,107,255,0.3);
  background: rgba(124,107,255,0.08);
}
.rx-role-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
}
.rx-role-icon.buyer  { background: rgba(124,107,255,0.15); }
.rx-role-icon.seller { background: rgba(56,189,248,0.15); }
.rx-role-icon.rental { background: rgba(167,139,250,0.15); }
.rx-role-info {}
.rx-role-name {
  font-family: var(--display); font-size: 12px; font-weight: 700;
  color: var(--ink); letter-spacing: -0.01em;
}
.rx-role-desc {
  font-size: 10px; color: var(--ink4); margin-top: 2px; line-height: 1.4;
}

/* Stats row */
.rx-stats {
  display: flex; gap: 28px; margin-top: 28px; padding-top: 24px;
  border-top: 1px solid var(--border);
}
.rx-stat-num {
  font-family: var(--display); font-size: 22px; font-weight: 800;
  color: var(--ink); letter-spacing: -0.03em; line-height: 1;
}
.rx-stat-num span {
  background: linear-gradient(90deg, var(--p1), var(--p2));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.rx-stat-label {
  font-size: 10px; font-weight: 400; color: var(--ink4);
  letter-spacing: 0.05em; margin-top: 4px;
}

/* ── RIGHT PANEL ── */
.rx-right {
  flex: 1;
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center;
  padding: 48px 32px;
  overflow-y: auto;
}

/* Card */
.rx-card {
  width: 100%; max-width: 440px;
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
  animation: rxCardIn 0.9s cubic-bezier(0.22,1,0.36,1) both;
}
.rx-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(124,107,255,0.5), transparent);
}
.rx-card-glow {
  position: absolute; inset: -1px; z-index: -1; border-radius: 25px;
  background: linear-gradient(135deg, rgba(124,107,255,0.15), transparent 60%);
  opacity: 0; transition: opacity 0.4s;
}
.rx-card:hover .rx-card-glow { opacity: 1; }

/* Back link */
.rx-back {
  position: absolute; top: 28px; right: 28px;
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink4);
  text-decoration: none;
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 999px;
  border: 1px solid var(--border);
  transition: all 0.25s;
  animation: rxFadeIn 0.6s 0.5s both;
}
.rx-back:hover {
  color: var(--ink2); border-color: var(--border2);
  background: var(--glass2);
}

/* Card header */
.rx-ch { margin-bottom: 28px; animation: rxSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
.rx-ch-badge {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 4px 12px 4px 6px;
  background: rgba(124,107,255,0.12);
  border: 1px solid rgba(124,107,255,0.25);
  border-radius: 999px; margin-bottom: 16px;
}
.rx-ch-badge-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: linear-gradient(135deg, var(--p1), var(--p3));
  box-shadow: 0 0 8px var(--p-glow);
  animation: rxDotPulse 2s ease-in-out infinite;
}
@keyframes rxDotPulse {
  0%,100% { box-shadow: 0 0 8px var(--p-glow); }
  50%      { box-shadow: 0 0 16px var(--p-glow), 0 0 24px rgba(56,189,248,0.2); }
}
.rx-ch-badge span {
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.14em;
  text-transform: uppercase; color: var(--p2);
}
.rx-ch h2 {
  font-family: var(--display); font-size: 30px; font-weight: 800;
  letter-spacing: -0.04em; line-height: 1; color: var(--ink); margin-bottom: 8px;
}
.rx-ch h2 em {
  font-style: italic;
  background: linear-gradient(90deg, var(--p2), var(--p3));
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
}
.rx-ch-sub {
  font-size: 13px; color: var(--ink3); font-weight: 300; line-height: 1.6;
}

/* Error */
.rx-error {
  display: flex; align-items: flex-start; gap: 10px;
  background: rgba(255,107,107,0.08);
  border: 1px solid rgba(255,107,107,0.2);
  border-radius: 12px; padding: 12px 14px; margin-bottom: 16px;
  animation: rxSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
}
.rx-error-icon {
  flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%;
  background: rgba(255,107,107,0.2);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px;
}
.rx-error-text {
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.02em;
  color: var(--danger); line-height: 1.5;
}

/* Form */
.rx-form { display: flex; flex-direction: column; gap: 12px; }
.rx-form-anim { animation: rxSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.2s both; }

/* Float-label input */
.rx-field { position: relative; }
.rx-field-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--ink4); font-size: 14px; pointer-events: none; z-index: 2;
  transition: color 0.25s;
}
.rx-field:focus-within .rx-field-icon { color: var(--p2); }
.rx-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px 16px 8px 44px;
  font-family: var(--mono); font-size: 13px;
  color: var(--ink); outline: none;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
  caret-color: var(--p2);
}
.rx-input::placeholder { color: transparent; }
.rx-input:focus {
  border-color: rgba(124,107,255,0.5);
  background: rgba(124,107,255,0.08);
  box-shadow: 0 0 0 3px rgba(124,107,255,0.1), inset 0 0 20px rgba(124,107,255,0.05);
}
.rx-input.has-error {
  border-color: rgba(255,107,107,0.4);
  background: rgba(255,107,107,0.05);
}
.rx-label {
  position: absolute; left: 44px; top: 14px;
  font-family: var(--mono); font-size: 11px; letter-spacing: 0.04em;
  color: var(--ink4); pointer-events: none;
  transition: all 0.2s cubic-bezier(0.22,1,0.36,1);
}
.rx-input:focus + .rx-label,
.rx-input:not(:placeholder-shown) + .rx-label {
  top: 6px; font-size: 9px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--p2);
}

/* Password toggle */
.rx-pw-toggle {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--ink4); font-size: 12px; padding: 6px;
  border-radius: 6px; transition: color 0.2s, background 0.2s;
  font-family: var(--mono); letter-spacing: 0.05em;
}
.rx-pw-toggle:hover { color: var(--p2); background: rgba(124,107,255,0.1); }

/* Role select */
.rx-select-wrap { position: relative; }
.rx-select-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--ink4); font-size: 14px; pointer-events: none; z-index: 2;
  transition: color 0.25s;
}
.rx-select-wrap:focus-within .rx-select-icon { color: var(--p2); }
.rx-select {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px 14px 44px;
  font-family: var(--mono); font-size: 12px; letter-spacing: 0.02em;
  color: var(--ink); outline: none;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
}
.rx-select:focus {
  border-color: rgba(124,107,255,0.5);
  background: rgba(124,107,255,0.08);
  box-shadow: 0 0 0 3px rgba(124,107,255,0.1);
}
.rx-select option { background: #0d0e1a; color: var(--ink); }
.rx-select-arrow {
  position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
  pointer-events: none; color: var(--ink4); font-size: 10px;
}
.rx-select-label {
  position: absolute; left: 44px; top: 6px;
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--p2); pointer-events: none;
}

/* Role chips */
.rx-role-chips {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}
.rx-role-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 72px;
  padding: 12px 8px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: rgba(255,255,255,0.03);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s;
  font-family: var(--mono);
  text-align: center;
}
.rx-role-chip:hover {
  border-color: rgba(124,107,255,0.35);
  background: rgba(124,107,255,0.07);
  transform: translateY(-1px);
}
.rx-role-chip.active {
  border-color: rgba(124,107,255,0.55);
  background: linear-gradient(145deg, rgba(124,107,255,0.16), rgba(56,189,248,0.08));
  box-shadow: 0 0 0 1px rgba(124,107,255,0.2) inset, 0 8px 20px rgba(124,107,255,0.12);
}
.rx-role-chip-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.06);
  color: var(--ink3);
  transition: background 0.2s, color 0.2s;
}
.rx-role-chip.active .rx-role-chip-icon {
  background: rgba(124,107,255,0.2);
  color: var(--p2);
}
.rx-role-chip-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--ink3);
  line-height: 1.35;
}
.rx-role-chip.active .rx-role-chip-label { color: var(--p2); }
.rx-role-section-label {
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink4);
  margin-bottom: 8px;
}

/* Divider */
.rx-divider {
  display: flex; align-items: center; gap: 12px; margin: 4px 0;
}
.rx-divider::before, .rx-divider::after {
  content: ''; flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, var(--border), transparent);
}
.rx-divider span {
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--ink4); white-space: nowrap;
}

/* Submit button */
.rx-submit {
  width: 100%; padding: 16px;
  background: linear-gradient(135deg, var(--p1) 0%, rgba(56,189,248,0.8) 100%);
  border: none; border-radius: 14px;
  font-family: var(--display); font-size: 14px; font-weight: 700;
  letter-spacing: 0.02em; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
  box-shadow: 0 8px 32px rgba(124,107,255,0.35), 0 0 0 1px rgba(255,255,255,0.1) inset;
  position: relative; overflow: hidden;
  margin-top: 4px;
}
.rx-submit::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
  opacity: 0; transition: opacity 0.25s;
}
.rx-submit:hover:not(:disabled)::before { opacity: 1; }
.rx-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(124,107,255,0.45), 0 0 0 1px rgba(255,255,255,0.15) inset;
}
.rx-submit:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 16px rgba(124,107,255,0.3);
}
.rx-submit:disabled { opacity: 0.55; cursor: not-allowed; }

/* Ripple */
.rx-ripple {
  position: absolute; border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transform: scale(0);
  animation: rxRipple 0.6s linear;
  pointer-events: none;
}
@keyframes rxRipple { to { transform: scale(4); opacity: 0; } }

/* Spinner */
.rx-spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: var(--ink);
  animation: rxSpin 0.7s linear infinite;
}
@keyframes rxSpin { to { transform: rotate(360deg); } }

/* Progress */
.rx-progress {
  position: absolute; bottom: 0; left: 0;
  height: 2px; width: 0%;
  background: linear-gradient(90deg, var(--p1), var(--p3));
  border-radius: 0 0 14px 14px;
  transition: width 1.5s ease;
}
.rx-submit.loading .rx-progress { width: 80%; }

/* Footer */
.rx-footer {
  margin-top: 20px; text-align: center;
  font-size: 13px; color: var(--ink3); font-weight: 300;
  animation: rxFadeIn 0.6s 0.4s both;
}
.rx-footer a {
  color: var(--p2); font-weight: 500; text-decoration: none;
  position: relative; transition: color 0.2s;
}
.rx-footer a::after {
  content: '';
  position: absolute; bottom: -1px; left: 0; right: 0;
  height: 1px; background: var(--p2); transform: scaleX(0);
  transform-origin: right; transition: transform 0.25s ease;
}
.rx-footer a:hover::after { transform: scaleX(1); transform-origin: left; }

/* Mobile logo (replaced by AuthTopBar on small screens) */
.rx-mobile-logo { display: none; }

/* ── KEYFRAMES ── */
@keyframes rxCardIn {
  from { opacity: 0; transform: translateY(32px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes rxSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rxSlideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rxFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .rx-root { flex-direction: column; min-height: 100dvh; }
  .rx-left { display: none; }
  .rx-grid { opacity: 0.35; }
  .rx-particle { display: none; }
  .rx-orb3 { display: none; }
  .rx-back { display: none; }
  .rx-right {
    flex: 1;
    padding: 20px 16px 32px;
    align-items: flex-start;
    overflow-y: auto;
  }
  .rx-card {
    padding: 26px 20px 22px;
    border-radius: 20px;
    background: rgba(10, 12, 22, 0.88);
    border-color: rgba(124,107,255,0.28);
    backdrop-filter: blur(20px);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.04) inset,
      0 24px 48px rgba(0,0,0,0.4);
  }
  html.light .rx-root.gv-auth .rx-card {
    background: rgba(255, 255, 255, 0.92);
    border-color: rgba(124, 107, 255, 0.2);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.8) inset,
      0 20px 40px rgba(12, 26, 86, 0.1);
  }
  .rx-ch { margin-bottom: 20px; }
  .rx-ch-badge { margin-bottom: 12px; }
  .rx-ch h2 { font-size: 26px; margin-bottom: 6px; }
  .rx-ch-sub { font-size: 14px; line-height: 1.5; color: var(--ink3); }
  .rx-form { gap: 12px; }
  .rx-input {
    border-radius: 13px;
    padding: 20px 14px 9px 42px;
    font-size: 15px;
  }
  .rx-label { left: 42px; }
  .rx-field-icon { left: 15px; font-size: 15px; }
  .rx-role-chips {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .rx-role-chip {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 14px;
    min-height: 0;
    padding: 14px 16px;
    text-align: left;
  }
  .rx-role-chip-icon { flex-shrink: 0; }
  .rx-role-chip-label {
    font-size: 13px;
    letter-spacing: 0.01em;
    text-transform: none;
    font-family: var(--sans);
    font-weight: 500;
    line-height: 1.3;
  }
  .rx-submit {
    border-radius: 13px;
    padding: 15px;
    font-size: 15px;
    box-shadow: 0 12px 28px rgba(124,107,255,0.35);
  }
  .rx-divider { display: none; }
  .rx-footer { margin-top: 18px; font-size: 13px; }
}
@media (max-width: 480px) {
  .rx-right { padding: 16px 14px 28px; }
  .rx-card { border-radius: 18px; padding: 22px 16px 18px; }
  .rx-ch h2 { font-size: 24px; }
  .rx-ch-sub { font-size: 13px; }
}
@media (max-width: 900px) {
  .rx-root { background: var(--bg0); }
  .rx-orb1 { width: 220px; height: 220px; opacity: 0.45; top: -80px; left: -80px; }
  .rx-orb2 { width: 180px; height: 180px; opacity: 0.42; bottom: -60px; right: -50px; }
  .rx-bg {
    background: radial-gradient(ellipse 70% 60% at 15% 18%, rgba(124,107,255,0.2) 0%, transparent 65%),
                radial-gradient(ellipse 55% 55% at 88% 85%, rgba(56,189,248,0.14) 0%, transparent 62%),
                var(--bg0);
  }
}
`;

/* ─────────────────────────────────────────────
   PARTICLES
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
        <div key={i} className="rx-particle" style={{
          width: p.w, height: p.h,
          left: p.l, top: p.t,
          background: p.color,
          animationDelay: p.delay,
          animationDuration: p.dur,
        }} />
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
    <div className="rx-field">
      <span className="rx-field-icon">{icon}</span>
      <input
        type={inputType}
        value={value}
        onChange={onChange}
        placeholder=" "
        required
        className={`rx-input${hasError ? " has-error" : ""}`}
      />
      <label className="rx-label">{label}</label>
      {isPassword && (
        <button
          type="button"
          className="rx-pw-toggle"
          onClick={() => setShowPw(v => !v)}
          tabIndex={-1}
        >
          {showPw ? copy.login?.hide || "HIDE" : copy.login?.show || "SHOW"}
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   ROLE CHIP SELECTOR
───────────────────────────────────────────── */
const ROLE_ICONS = {
  customer: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  ),
  car_owner: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2" />
      <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
    </svg>
  ),
  rental_owner: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
      <path d="M9 9v.01" /><path d="M9 12v.01" /><path d="M9 15v.01" /><path d="M9 18v.01" />
    </svg>
  ),
};

const ROLES = [
  { value: "customer",     iconKey: "customer",     labelKey: "roleCustomer" },
  { value: "car_owner",    iconKey: "car_owner",    labelKey: "roleCarOwner" },
  { value: "rental_owner", iconKey: "rental_owner", labelKey: "roleRental"   },
];

function RoleChips({ value, onChange, copy }) {
  return (
    <div>
      <div className="rx-role-section-label">{copy.accountType}</div>
      <div className="rx-role-chips" role="radiogroup" aria-label={copy.accountType}>
        {ROLES.map(r => (
          <button
            key={r.value}
            type="button"
            role="radio"
            aria-checked={value === r.value}
            className={`rx-role-chip${value === r.value ? " active" : ""}`}
            onClick={() => onChange(r.value)}
          >
            <span className="rx-role-chip-icon">{ROLE_ICONS[r.iconKey]}</span>
            <span className="rx-role-chip-label">{copy[r.labelKey]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN REGISTER COMPONENT
───────────────────────────────────────────── */
export default function Register() {
  const { copy } = useAppLang();
  const navigate  = useNavigate();
  const imgRef    = useRef(null);
  const btnRef    = useRef(null);

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [city,     setCity]     = useState("");
  const [role,     setRole]     = useState("customer");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const img = new Image();
    img.src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80";
    img.onload = () => {
      if (imgRef.current) imgRef.current.classList.add("loaded");
    };
  }, []);

  function addRipple(e) {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top  - size / 2;
    const ripple = document.createElement("span");
    ripple.className = "rx-ripple";
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    addRipple(e);
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, phone, password, city, role });
      const registeredEmail = email.trim().toLowerCase();
      navigate(`/register/verify-pending?email=${encodeURIComponent(registeredEmail)}`, {
        state: { message: res.data?.message },
      });
    } catch (err) {
      setError(err?.response?.data?.message || copy.register.regFail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rx-root gv-auth">
      <style>{CSS}</style>
      <AuthTopBar backLabel="← Accueil" />

      {/* Background layers */}
      <div className="rx-bg" />
      <div className="rx-grid" />
      <div className="rx-orb rx-orb1" />
      <div className="rx-orb rx-orb2" />
      <div className="rx-orb rx-orb3" />
      <Particles />

      {/* ═══ LEFT PANEL ═══ */}
      <div className="rx-left">
        <img
          ref={imgRef}
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=80"
          alt=""
          className="rx-left-img"
        />
        <div className="rx-left-veil" />
        <div className="rx-left-noise" />

        <div className="rx-left-inner">
          <Link to="/" className="rx-logo">
            <div className="rx-logo-mark">G</div>
            <span className="rx-logo-text">Goo<span>voiture</span></span>
          </Link>

          <div className="rx-hero">
            <div className="rx-hero-tag">Nouvelle inscription</div>
            <h1>
              Rejoignez<br />
              la <em>communauté</em><br />
              Goovoiture
            </h1>
            <p className="rx-hero-sub">
              {copy.register.joinSub}
            </p>

            <div className="rx-role-grid">
              <div className="rx-role-card">
                <div className="rx-role-icon buyer">🛒</div>
                <div className="rx-role-info">
                  <div className="rx-role-name">{copy.register.roleCustomer}</div>
                  <div className="rx-role-desc">Parcourez et achetez des véhicules vérifiés</div>
                </div>
              </div>
              <div className="rx-role-card">
                <div className="rx-role-icon seller">🚗</div>
                <div className="rx-role-info">
                  <div className="rx-role-name">{copy.register.roleCarOwner}</div>
                  <div className="rx-role-desc">Publiez vos annonces et gérez vos ventes</div>
                </div>
              </div>
              <div className="rx-role-card">
                <div className="rx-role-icon rental">🏢</div>
                <div className="rx-role-info">
                  <div className="rx-role-name">{copy.register.roleRental}</div>
                  <div className="rx-role-desc">Gérez votre flotte et vos réservations</div>
                </div>
              </div>
            </div>

            <div className="rx-stats">
              <div>
                <div className="rx-stat-num"><span>12k</span>+</div>
                <div className="rx-stat-label">Annonces actives</div>
              </div>
              <div>
                <div className="rx-stat-num"><span>4.8</span>★</div>
                <div className="rx-stat-label">Note moyenne</div>
              </div>
              <div>
                <div className="rx-stat-num"><span>98</span>%</div>
                <div className="rx-stat-label">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <div className="rx-right">
        <Link to="/" className="rx-back">← Accueil</Link>

        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Glass card */}
          <div className="rx-card">
            <div className="rx-card-glow" />

            <div className="rx-ch">
              <div className="rx-ch-badge">
                <div className="rx-ch-badge-dot" />
                <span>Inscription gratuite</span>
              </div>
              <h2>{copy.register.createTitle} <em>→</em></h2>
              <p className="rx-ch-sub">{copy.register.createSub}</p>
            </div>

            {error && (
              <div className="rx-error">
                <div className="rx-error-icon">⚠</div>
                <div className="rx-error-text">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="rx-form rx-form-anim">

              <Field
                icon="👤"
                label={copy.register.fullName}
                value={name}
                onChange={e => setName(e.target.value)}
                hasError={!!error}
              />

              <Field
                icon="✉"
                label={copy.register.email}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                hasError={!!error}
              />

              <Field
                icon="📱"
                label={copy.register.phone}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                hasError={!!error}
              />

              <Field
                icon="📍"
                label={copy.register.city}
                value={city}
                onChange={e => setCity(e.target.value)}
                hasError={!!error}
              />

              <RoleChips
                value={role}
                onChange={setRole}
                copy={copy.register}
              />

              <Field
                icon="🔒"
                label={copy.register.password}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                hasError={!!error}
              />

              <button
                ref={btnRef}
                type="submit"
                className={`rx-submit${loading ? " loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="rx-spinner" />
                    {copy.register.creating}
                    <div className="rx-progress" />
                  </>
                ) : (
                  <>{copy.register.createBtn}</>
                )}
              </button>

            </form>

            <div style={{ marginTop: 18 }}>
              <div className="rx-divider">
                <span>ou</span>
              </div>
            </div>

            <p className="rx-footer">
              {copy.register.footerQ}{" "}
              <Link to="/login">{copy.register.footerLogin}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
