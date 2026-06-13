import { Link } from "react-router-dom";
import { loadAuth, clearAuth } from "../utils/authStorage";
import { useState, useEffect, useRef } from "react";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";
import SeoContentBlock from "../components/SeoContentBlock";
import SeoFooter from "../components/seo/SeoFooter";
import HomeFaqSection from "../components/seo/HomeFaqSection";
import AppPhoneShowcase from "../components/AppPhoneShowcase";
import AppStoreBadges from "../components/AppStoreBadges";
import GarageFeatureShowcase from "../components/GarageFeatureShowcase";
import HomeMobilePitch from "../components/HomeMobilePitch";
import HeroMobileVisual from "../components/HeroMobileVisual";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { buildSeoPath } from "../seo/seoPaths";

const HERO_IMG =
  "https://images.unsplash.com/photo-1549924231-f129b911e442?w=960&q=75&auto=format&fit=crop&fm=webp";
import { getApprovedSales } from "../api/sale";
import { getApprovedRentals } from "../api/rental";
import { hasUserRole, isAdminOnlyUser } from "../utils/userRoles";

/* ──────────────────────────────────────────────
   Scroll reveal — IntersectionObserver, no lib
   Adds "vis" class once element enters viewport
────────────────────────────────────────────── */
function normalizeSalesPayload(data) {
  if (!data) return [];
  const raw = data.items ?? data.cars ?? data;
  return Array.isArray(raw) ? raw : [];
}

function normalizeRentalsPayload(data) {
  if (!data) return [];
  return Array.isArray(data) ? data : data.rentals ?? [];
}

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("vis"); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function useCountUp(target = 100, duration = 1200, threshold = 0.2) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.floor(target * eased));
          if (progress < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        obs.disconnect();
      },
      { threshold }
    );
    obs.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [target, duration, threshold]);

  return [ref, value];
}

/* Sub-components that need their own reveal hook */
function HowItem({ n, icon, title, desc, delay = "0s" }) {
  const ref = useReveal(0.08);
  return (
    <div ref={ref} className="hx-how-cell rv rv-u" style={{ transitionDelay: delay }}>
      <div className="hx-how-n">{n}</div>
      <span className="hx-how-icon">{icon}</span>
      <h3 className="hx-how-title">{title}</h3>
      <p className="hx-how-desc">{desc}</p>
    </div>
  );
}

function StatItem({ n, sup, label, delay = "0s" }) {
  const ref = useReveal(0.1);
  return (
    <div ref={ref} className="hx-stat rv rv-u" style={{ transitionDelay: delay }}>
      <div className="hx-stat-n">{n}<em>{sup}</em></div>
      <div className="hx-stat-l">{label}</div>
      <div className="hx-stat-line" />
    </div>
  );
}

function CounterItem({ to, suffix = "", label, delay = "0s" }) {
  const [ref, value] = useCountUp(to, 1300, 0.22);
  return (
    <div ref={ref} className="hx-stat rv rv-u vis" style={{ transitionDelay: delay }}>
      <div className="hx-stat-n">{value}<em>{suffix}</em></div>
      <div className="hx-stat-l">{label}</div>
      <div className="hx-stat-line" />
    </div>
  );
}

function BenefitItem({ icon, title, desc, delay = "0s" }) {
  const ref = useReveal(0.08);
  return (
    <div ref={ref} className="hx-ben rv rv-u" style={{ transitionDelay: delay }}>
      <div className="hx-ben-ico">{icon}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
    </div>
  );
}

function TestimonialCard({ item, delay = "0s" }) {
  const ref = useReveal(0.08);
  return (
    <article ref={ref} className="hx-tm rv rv-u" style={{ transitionDelay: delay }}>
      <div className="hx-tm-stars">★★★★★</div>
      <p className="hx-tm-txt">"{item.text}"</p>
      <div className="hx-tm-ft">
        <strong>{item.name}</strong>
        <span>{item.role}</span>
      </div>
    </article>
  );
}

const ICON = {
  car: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 13.5h15l-1.2-4.1a2 2 0 0 0-1.9-1.4H7.6a2 2 0 0 0-1.9 1.4L4.5 13.5Zm0 0v3a1 1 0 0 0 1 1H7m-2.5-4h15M17 17.5h1.5a1 1 0 0 0 1-1v-3M8 17.5h8M7.5 13.5a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Zm9 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3.5V6M17 3.5V6M4.5 9h15M6 5h12a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 18 19H6a1.5 1.5 0 0 1-1.5-1.5v-11A1.5 1.5 0 0 1 6 5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="m16 16 4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4.5h6m-5-2h4a1 1 0 0 1 1 1v1h2.5A1.5 1.5 0 0 1 19 6v13.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5V6a1.5 1.5 0 0 1 1.5-1.5H9v-1a1 1 0 0 1 1-1Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5h15M7 16V9m5 7V6m5 10v-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
  ),
  rocket: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 4.5c2.2 1 4.1 2.9 5 5L14 15l-5-5 5.5-5.5ZM9 10l-3 1-1 3 3-1m6 6-1 3 3-1 1-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5 5.5 6v5.6c0 4.2 2.7 7.7 6.5 9 3.8-1.3 6.5-4.8 6.5-9V6L12 3.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="m9.2 12.2 2 2 3.7-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5.5" width="17" height="13" rx="2.2" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M3.5 10h17" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
  ),
  support: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 13.5v-2a5.5 5.5 0 1 1 11 0v2" fill="none" stroke="currentColor" strokeWidth="1.6"/><rect x="4.5" y="12.5" width="3" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6"/><rect x="16.5" y="12.5" width="3" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="M9 19h6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" fill="none" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="11" r="2" fill="none" stroke="currentColor" strokeWidth="1.6"/></svg>
  ),
};

const ACTION_ICONS = {
  "/rentals": ICON.car,
  "/my-bookings": ICON.calendar,
  "/cars": ICON.search,
  "/owner-bookings": ICON.clipboard,
  "/add-rental": ICON.plus,
  "/my-sales": ICON.chart,
  "/my-sales/new": ICON.rocket,
  "/admin": ICON.shield,
};

function ActionCard({ to, isAdmin }) {
  const { copy } = useAppLang();
  const icon = ACTION_ICONS[to] || "→";
  const label = copy.home.actions[to] || to;
  return (
    <Link to={to} className={`hx-act${isAdmin ? " hx-act-admin" : ""}`}>
      <div className="hx-act-ico">{icon}</div>
      <span className="hx-act-lbl">{label}</span>
      <span className="hx-act-arr">{copy.home.actions.open}</span>
    </Link>
  );
}

/* ──────────────────────────────────────────────
   CSS
────────────────────────────────────────────── */
const CSS = `

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
img{display:block;max-width:100%;}a{text-decoration:none;}

/* ════ TOKENS — Light ════ */
.hx {
  --bg:       #f6f8ff;
  --bg2:      #eef2ff;
  --sur:      #ffffff;
  --sur2:     #f1f4ff;
  --bdr:      rgba(12, 26, 86, 0.09);
  --bdr2:     rgba(12, 26, 86, 0.18);
  --ink:      #0b163d;
  --ink2:     #1b2f66;
  --mut:      #53608f;
  --fnt:      #b8c2df;
  --gold:     #7c6bff;
  --gold2:    #38bdf8;
  --gbg:      rgba(124,107,255,0.10);
  --gbd:      rgba(124,107,255,0.30);
  --nav:      rgba(246,248,255,0.9);
  --disp:     'Poppins',system-ui,sans-serif;
  --body:     'Outfit',system-ui,sans-serif;
  --mono:     'DM Mono',monospace;
  min-height:100vh;
  background:var(--bg);
  color:var(--ink);
  font-family:var(--body);
  overflow-x:hidden;
  transition:background .4s,color .4s;
}

/* ════ TOKENS — Dark ════ */
.hx.dark {
  --bg:       #05060f;
  --bg2:      #080c1a;
  --sur:      #101426;
  --sur2:     #141b34;
  --bdr:      rgba(255,255,255,0.07);
  --bdr2:     rgba(255,255,255,0.12);
  --ink:      #f5f7ff;
  --ink2:     #c6d3ff;
  --mut:      #8a95bf;
  --fnt:      #404a70;
  --gold:     #7c6bff;
  --gold2:    #38bdf8;
  --gbg:      rgba(124,107,255,0.16);
  --gbd:      rgba(124,107,255,0.34);
  --nav:      rgba(5,6,15,0.92);
}

/* ════ SCROLL REVEAL ════ */
.rv {
  opacity:0;
  transition:opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1);
}
.rv.vis  { opacity:1; transform:none !important; }
.rv-u    { transform:translateY(32px); }
.rv-l    { transform:translateX(-32px); }
.rv-r    { transform:translateX(32px); }
.rv-s    { transform:scale(.97); }

/* ════ NAV ════ */
.hx-nav {
  position:fixed;top:0;left:0;right:0;z-index:100;
  height:64px;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 40px;
  background:var(--nav);
  backdrop-filter:blur(20px) saturate(180%);
  border-bottom:1px solid var(--bdr);
  transition:background .4s,border-color .4s;
}
.hx-logo {
  font-family:var(--disp);font-size:21px;font-weight:700;
  color:var(--ink);letter-spacing:-.03em;
  transition:color .4s;
}
.hx-logo em{font-style:italic;color:var(--gold);}

.hx-nav-links{display:flex;align-items:center;gap:32px;}
.hx-nav-link {
  font-size:14px;font-weight:500;
  color:var(--mut);letter-spacing:.01em;
  transition:color .2s;
}
.hx-nav-link:hover{color:var(--ink);}

.hx-nav-end{display:flex;align-items:center;gap:10px;}

.hx-lang {
  display:inline-flex;
  align-items:center;
  border-radius:10px;
  border:1px solid var(--bdr2);
  overflow:hidden;
  background:var(--sur);
  flex-shrink:0;
}
.hx-lang button{
  padding:7px 11px;
  font-family:var(--mono);
  font-size:10px;
  font-weight:600;
  letter-spacing:.1em;
  text-transform:uppercase;
  border:none;
  background:transparent;
  color:var(--mut);
  cursor:pointer;
  transition:background .2s,color .2s;
}
.hx-lang button:hover{color:var(--ink);}
.hx-lang button.on{
  background:var(--gbg);
  color:var(--gold);
  box-shadow:inset 0 0 0 1px var(--gbd);
}

.hx-theme {
  width:36px;height:36px;border-radius:10px;
  border:1px solid var(--bdr2);background:var(--sur);
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:15px;
  transition:background .2s,transform .25s;
}
.hx-theme:hover{transform:rotate(18deg) scale(1.08);background:var(--sur2);}

.hx-npill {
  display:inline-flex;align-items:center;
  padding:8px 18px;border-radius:8px;
  font-size:13px;font-weight:500;cursor:pointer;
  transition:all .2s;
}
.hx-npill.gh {
  background:transparent;border:1px solid var(--bdr2);color:var(--ink);
}
.hx-npill.gh:hover{background:var(--sur);border-color:var(--gold);color:var(--gold);}
.hx-npill.sl {
  background:var(--ink);color:var(--bg);border:1px solid var(--ink);
}
.hx-npill.sl:hover{background:var(--gold);border-color:var(--gold);color:#000;}

/* ── Profile avatar button ── */
.hx-profile-wrap { position:relative; }
.hx-av-btn {
  width:36px;height:36px;border-radius:50%;
  border:2px solid rgba(124,107,255,.35);
  background:rgba(124,107,255,.12);
  overflow:hidden;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;padding:0;
  font-family:var(--sans);font-size:13px;font-weight:700;color:#7c6bff;
  transition:border-color .2s,box-shadow .2s;flex-shrink:0;
}
.hx-av-btn:hover{border-color:#7c6bff;box-shadow:0 0 0 3px rgba(124,107,255,.16);}
.hx-av-btn img{width:100%;height:100%;object-fit:cover;}

/* ── Dropdown ── */
.hx-drop {
  position:absolute;top:calc(100% + 10px);right:0;
  width:230px;
  background:#fff;
  border:1px solid rgba(12,26,86,.1);
  border-radius:16px;
  box-shadow:0 8px 32px rgba(12,26,86,.15);
  overflow:hidden;z-index:400;
  animation:hx-drop-in .15s ease;
}
@keyframes hx-drop-in{
  from{opacity:0;transform:translateY(-6px);}
  to{opacity:1;transform:translateY(0);}
}
.dark .hx-drop{
  background:#0e0f1e;
  border-color:rgba(255,255,255,.1);
  box-shadow:0 8px 32px rgba(0,0,0,.45);
}
.hx-drop-head {
  padding:14px 16px 12px;
  display:flex;align-items:center;gap:12px;
  border-bottom:1px solid rgba(12,26,86,.07);
}
.dark .hx-drop-head{border-color:rgba(255,255,255,.07);}
.hx-drop-av {
  width:40px;height:40px;border-radius:50%;
  border:2px solid rgba(124,107,255,.25);
  background:rgba(124,107,255,.1);
  overflow:hidden;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
  font-family:var(--sans);font-size:16px;font-weight:700;color:#7c6bff;
}
.hx-drop-av img{width:100%;height:100%;object-fit:cover;}
.hx-drop-name {
  font-family:var(--sans);font-size:13px;font-weight:600;color:#0b163d;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.dark .hx-drop-name{color:#f5f7ff;}
.hx-drop-role {
  font-family:var(--mono);font-size:10px;font-weight:500;
  color:#7c6bff;text-transform:uppercase;letter-spacing:.06em;margin-top:2px;
}
.hx-drop-body{padding:6px 0;}
.hx-drop-item {
  display:flex;align-items:center;gap:10px;
  padding:9px 16px;
  font-family:var(--sans);font-size:13px;font-weight:500;color:#374151;
  text-decoration:none;cursor:pointer;
  width:100%;border:none;background:none;text-align:left;
  transition:background .15s,color .15s;
}
.hx-drop-item:hover{background:rgba(124,107,255,.07);color:#7c6bff;}
.dark .hx-drop-item{color:#bcc5e8;}
.dark .hx-drop-item:hover{background:rgba(124,107,255,.1);color:#9b8cff;}
.hx-drop-item.red:hover{background:rgba(239,68,68,.07);color:#ef4444;}
.dark .hx-drop-item.red:hover{background:rgba(239,68,68,.08);color:#f87171;}
.hx-drop-sep{height:1px;background:rgba(12,26,86,.07);margin:4px 12px;}
.dark .hx-drop-sep{background:rgba(255,255,255,.07);}

.hx-burger {
  display:none;flex-direction:column;gap:5px;
  width:36px;height:36px;padding:8px;
  background:none;border:1px solid var(--bdr2);
  border-radius:8px;cursor:pointer;justify-content:center;
  transition:background .2s;
}
.hx-burger:hover{background:var(--sur);}
.hx-burger span{
  display:block;height:1.5px;width:100%;
  background:var(--ink);border-radius:2px;transition:background .4s;
}

/* Mobile drawer */
.hx-drawer {
  position:fixed;top:64px;left:0;right:0;z-index:99;
  background:var(--sur);
  border-bottom:1px solid var(--bdr);
  padding:16px 24px;
  display:flex;flex-direction:column;gap:0;
  transform:translateY(-8px);opacity:0;pointer-events:none;
  transition:transform .3s cubic-bezier(.22,1,.36,1),opacity .3s;
}
.hx-drawer.open{transform:translateY(0);opacity:1;pointer-events:all;}
.hx-dlink {
  display:block;padding:14px 0;
  font-size:15px;font-weight:500;color:var(--ink);
  border-bottom:1px solid var(--bdr);
  background:none;border-left:none;border-right:none;border-top:none;
  text-align:left;cursor:pointer;
  transition:color .2s;
}
.hx-dlink:last-child{border-bottom:none;}
.hx-dlink:hover{color:var(--gold);}

/* ════ HERO ════ */
.hx-hero {
  position:relative;
  min-height:100vh;
  display:flex;
  align-items:center;
  padding:108px 64px 48px;
  overflow:hidden;
  background:
    radial-gradient(65% 55% at 10% 5%, rgba(124,107,255,.18) 0%, transparent 70%),
    radial-gradient(50% 45% at 90% 85%, rgba(56,189,248,.12) 0%, transparent 72%),
    var(--bg);
}
.hx-hero-inner {
  position:relative;z-index:2;
  width:min(1280px,100%);
  margin:0 auto;
  display:grid;
  grid-template-columns:1.05fr .95fr;
  gap:28px;
  align-items:center;
}
.hx-hero-left{max-width:620px;}
.hx-hero-right{
  position:relative;
  border-radius:24px;
  overflow:hidden;
  border:1px solid var(--bdr2);
  min-height:520px;
  box-shadow:0 32px 80px rgba(6,12,36,.28);
}
.hx-hero-img {
  position:absolute;inset:0;z-index:0;
  width:100%;height:100%;object-fit:cover;object-position:center 42%;
}

.hx-hero-veil {
  position:absolute;inset:0;z-index:1;
  background:
    linear-gradient(160deg, rgba(8,16,52,.3) 0%, rgba(7,12,36,.78) 100%),
    linear-gradient(to top, rgba(8,16,52,.62) 0%, transparent 44%);
}
.hx.dark .hx-hero{
  background:
    radial-gradient(65% 55% at 10% 5%, rgba(124,107,255,.14) 0%, transparent 70%),
    radial-gradient(50% 45% at 90% 85%, rgba(56,189,248,.10) 0%, transparent 72%),
    var(--bg);
}
.hx-hero-kicker {
  display:inline-flex;align-items:center;gap:10px;
  font-family:var(--mono);font-size:10px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--gold);
  margin-bottom:24px;
  opacity:0;animation:hUp .6s cubic-bezier(.22,1,.36,1) .1s forwards;
}
.hx-hero-kicker::before{content:'';width:28px;height:1px;background:var(--gold);}

.hx-hero-h1 {
  font-family:var(--disp);font-weight:700;
  font-size:clamp(48px,6vw,86px);
  line-height:.95;letter-spacing:-.04em;
  color:var(--ink);
  margin-bottom:28px;
  opacity:0;animation:hUp .75s cubic-bezier(.22,1,.36,1) .2s forwards;
  transition:color .4s;
}
.hx-hero-h1 em{font-style:italic;font-weight:300;color:var(--gold);}

.hx-hero-rule {
  width:48px;height:2px;background:var(--gold);margin-bottom:22px;
  opacity:0;animation:hUp .5s ease .35s forwards;
}
.hx-hero-p {
  font-size:17px;font-weight:300;line-height:1.85;
  color:var(--mut);max-width:520px;margin-bottom:36px;
  opacity:0;animation:hUp .6s ease .42s forwards;
  transition:color .4s;
}
.hx-hero-mobile-visual{display:none;}
.hx-hero-graph{
  display:none;
  width:100%;margin:0 0 18px;
}
/* ── Mobile hero: typographic campaign (no graphics) ── */
.hx-type-divider{
  width:100%;padding:18px 0 14px;
}
.hx-type-divider-line{
  position:relative;display:block;width:100%;height:1px;overflow:hidden;
  background:linear-gradient(90deg, transparent 0%, rgba(124,107,255,0.15) 18%, rgba(122,92,255,0.35) 50%, rgba(56,189,248,0.2) 82%, transparent 100%);
}
.hx-type-divider-sweep{
  position:absolute;inset:0;
  background:linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
  transform:translateX(-100%);
  animation:hxTypeLineSweep 3.2s ease-in-out infinite;
}
.hx-type{width:100%;padding:0;}
.hx-type-stage{
  position:relative;
  min-height:clamp(92px,27vw,112px);
}
.hx-type-msg{
  position:absolute;inset:0;
  display:flex;flex-direction:column;justify-content:flex-start;gap:0;
  padding:2px 2px 0;
  visibility:hidden;pointer-events:none;
}
.hx-type-msg.is-active,
.hx-type-msg.is-exit{
  visibility:visible;pointer-events:auto;
}
.hx-type-msg.is-active .hx-type-main,
.hx-type-msg.is-exit .hx-type-main{
  opacity:1;transform:none;filter:none;
}
.hx-type-msg.is-active .hx-type-sign,
.hx-type-msg.is-exit .hx-type-sign{
  opacity:1;clip-path:none;transform:none;filter:none;
}

.hx-type-main{
  display:block;
  font-family:Allura,cursive;
  font-size:clamp(52px,15vw,68px);
  font-weight:400;line-height:0.92;
  letter-spacing:.04em;
  color:var(--ink);
  transform-origin:left center;
  transition:color .4s;
}
.hx.dark .hx-type-main{
  text-shadow:0 0 48px rgba(124,107,255,0.12);
}
.hx-type-sign{
  display:block;
  margin-top:-2px;
  font-family:Allura,cursive;
  font-size:clamp(40px,11.5vw,52px);
  font-weight:400;line-height:1;
  letter-spacing:.05em;
  color:#7A5CFF;
  text-shadow:0 0 40px rgba(122,92,255,0.28);
  transform-origin:left center;
}
.hx-type--rtl .hx-type-main,
.hx-type--rtl .hx-type-sign,
.hx-type-sign--ar{
  font-family:"Cormorant Garamond",Georgia,serif;
  font-style:italic;font-weight:300;
  letter-spacing:.02em;
}
.hx-type--rtl .hx-type-main{
  font-size:clamp(34px,9.5vw,44px);
  line-height:1.05;
  color:var(--ink);
  text-shadow:none;
}
.hx-type-sign--ar,
.hx-type--rtl .hx-type-sign{
  font-size:clamp(28px,8vw,36px);
  color:#7A5CFF;
}
.hx-type--rtl .hx-type-sign{transform-origin:right center;}

@media (prefers-reduced-motion: no-preference){
  .hx-type-msg.is-active .hx-type-main{
    opacity:0;
    animation:hxTypeMainIn 1s cubic-bezier(.22,1,.36,1) forwards;
  }
  .hx-type-msg.is-active .hx-type-sign{
    clip-path:inset(0 100% 0 0);
    opacity:0;
    animation:hxTypeSignIn 1.35s cubic-bezier(.22,1,.36,1) .45s forwards;
  }
  .hx-type-msg.is-exit .hx-type-main{
    animation:hxTypeOut .72s cubic-bezier(.4,0,.2,1) forwards;
  }
  .hx-type-msg.is-exit .hx-type-sign{
    animation:hxTypeSignOut .72s cubic-bezier(.4,0,.2,1) forwards;
  }
}

@keyframes hxTypeMainIn{
  0%{opacity:0;filter:blur(10px);transform:translateY(14px);}
  100%{opacity:1;filter:blur(0);transform:none;}
}
@keyframes hxTypeSignIn{
  0%{opacity:0;clip-path:inset(0 100% 0 0);filter:blur(6px);transform:translateX(-6px);}
  35%{opacity:1;filter:blur(2px);}
  100%{opacity:1;clip-path:inset(0 0 0 0);filter:blur(0);transform:none;}
}
@keyframes hxTypeOut{
  0%{opacity:1;filter:blur(0);transform:none;}
  100%{opacity:0;filter:blur(8px);transform:translateY(-10px);}
}
@keyframes hxTypeSignOut{
  0%{opacity:1;filter:blur(0);}
  100%{opacity:0;filter:blur(6px);transform:translateX(8px);}
}
@keyframes hxTypeLineSweep{
  0%{transform:translateX(-100%);}
  100%{transform:translateX(100%);}
}
.hx-hero-btns {
  display:flex;gap:12px;flex-wrap:wrap;
  opacity:0;animation:hUp .6s ease .52s forwards;
}
.hx-hbtn {
  display:inline-flex;align-items:center;gap:8px;
  padding:14px 28px;border-radius:10px;
  font-size:14px;font-weight:600;
  transition:all .25s;cursor:pointer;
}
.hx-hbtn.prim {
  background:var(--ink);color:var(--bg);border:1px solid var(--ink);
}
.hx-hbtn.prim:hover {
  background:var(--gold);border-color:var(--gold);color:#fff;
  transform:translateY(-2px);box-shadow:0 10px 28px rgba(124,107,255,.35);
}
.hx-hbtn.outl {
  background:transparent;color:var(--ink);border:1px solid var(--bdr2);
}
.hx-hbtn.outl:hover{border-color:var(--gold);color:var(--gold);transform:translateY(-2px);}

.hx-hero-stats {
  display:flex;gap:32px;
  margin-top:34px;padding-top:26px;border-top:1px solid var(--bdr);
  opacity:0;animation:hUp .6s ease .62s forwards;
  transition:border-color .4s;
}
.hx-hstat-n {
  font-family:var(--disp);font-size:30px;font-weight:700;
  letter-spacing:-.04em;line-height:1;color:var(--ink);
  transition:color .4s;
}
.hx-hstat-n em{font-style:normal;color:var(--gold);font-size:17px;}
.hx-hstat-l {
  font-family:var(--mono);font-size:9px;letter-spacing:.12em;
  text-transform:uppercase;color:var(--mut);margin-top:5px;
  transition:color .4s;
}

/* Scroll indicator */
.hx-scroll-ind {
  position:absolute;bottom:24px;left:50%;transform:translateX(-50%);
  z-index:2;display:flex;flex-direction:column;align-items:center;gap:6px;
  font-family:var(--mono);font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--mut);
  opacity:0;animation:hUp .5s ease .9s forwards;
}
.hx-scroll-bar {
  width:1px;height:44px;
  background:linear-gradient(to bottom,var(--gold),transparent);
  animation:sPulse 2s ease-in-out infinite;
}
@keyframes sPulse{0%,100%{opacity:1}50%{opacity:.35}}

/* ════ HERO — motion mesh & traffic line ════ */
.hx-hero{position:relative;}
.hx-hero-bgmotion{
  position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;
  background:
    radial-gradient(ellipse 80% 50% at 20% 0%, rgba(124,107,255,.28) 0%, transparent 55%),
    radial-gradient(ellipse 70% 45% at 85% 90%, rgba(56,189,248,.22) 0%, transparent 55%),
    radial-gradient(ellipse 50% 40% at 50% 50%, rgba(124,107,255,.08) 0%, transparent 70%);
  animation:hxMeshDrift 18s ease-in-out infinite alternate;
}
@keyframes hxMeshDrift{
  0%{transform:scale(1) translate(0,0);opacity:1;}
  100%{transform:scale(1.06) translate(-2%,1%);opacity:.92;}
}
.hx-hero-traffic{
  position:absolute;left:0;right:0;bottom:0;height:120px;z-index:1;
  pointer-events:none;opacity:.45;
}
.hx-hero-traffic-line{
  display:block;width:100%;height:100%;
  background:repeating-linear-gradient(
    90deg,
    transparent 0,
    transparent 48px,
    rgba(56,189,248,.35) 48px,
    rgba(56,189,248,.35) 52px,
    transparent 52px,
    transparent 120px,
    rgba(124,107,255,.25) 120px,
    rgba(124,107,255,.25) 124px
  );
  mask-image:linear-gradient(to top, rgba(0,0,0,.9), transparent);
  animation:hxTrafficFlow 22s linear infinite;
}
@keyframes hxTrafficFlow{to{transform:translateX(-120px);}}
.hx-hero-pillrow{margin-top:-8px;margin-bottom:8px;opacity:0;animation:hUp .55s ease .48s forwards;}
.hx-hero-pill{
  display:inline-flex;align-items:center;gap:8px;
  padding:8px 16px;border-radius:999px;
  font-family:var(--mono);font-size:9px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--gold2);
  border:1px solid rgba(56,189,248,.35);
  background:linear-gradient(135deg,rgba(124,107,255,.12),rgba(56,189,248,.08));
  box-shadow:0 0 24px rgba(56,189,248,.12);
}

/* ════ LIVE SHOWCASE (sales + rentals rails) ════ */
.hx-vault{
  position:relative;
  padding:88px 0 72px;
  background:
    linear-gradient(180deg, var(--bg) 0%, var(--bg2) 45%, var(--bg) 100%);
  border-top:1px solid var(--bdr);
  border-bottom:1px solid var(--bdr);
  overflow:hidden;
}
.hx-vault::before{
  content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:min(900px,90%);height:1px;
  background:linear-gradient(90deg,transparent,var(--gold),var(--gold2),transparent);
  opacity:.5;
}
.hx-vault-head{padding:0 64px 36px;max-width:1280px;margin:0 auto;}
.hx-vault-sub{max-width:640px;}
.hx-vault-band{padding:0 0 28px;}
.hx-vault--rent{border-top:1px solid var(--bdr);padding-top:12px;}
.hx-vault-band-rent{padding-top:8px;}
.hx-app-btns{margin-top:24px;}
.hx-vault-band-h{
  max-width:1280px;margin:0 auto 16px;padding:0 64px;
  display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
}
.hx-vtag{
  font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;
  padding:6px 14px;border-radius:999px;font-weight:600;
}
.hx-vtag-sale{
  color:var(--gold);
  border:1px solid var(--gbd);
  background:var(--gbg);
  box-shadow:0 0 20px rgba(124,107,255,.15);
}
.hx-vtag-rent{
  color:#0ea5e9;
  border:1px solid rgba(14,165,233,.35);
  background:rgba(56,189,248,.1);
  box-shadow:0 0 20px rgba(56,189,248,.12);
}
.dark .hx-vtag-rent{color:#38bdf8;}
.hx-vault-all{
  font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--mut);transition:color .2s;
}
.hx-vault-all:hover{color:var(--gold);}
.hx-vrail-wrap{
  position:relative;
  mask-image:linear-gradient(90deg, transparent 0, #000 48px, #000 calc(100% - 48px), transparent 100%);
}
.hx-vrail{
  display:flex;gap:16px;overflow-x:auto;padding:8px 64px 20px;
  scroll-snap-type:x mandatory;
  scrollbar-width:thin;
  scrollbar-color:var(--gold) transparent;
}
.hx-vrail::-webkit-scrollbar{height:6px;}
.hx-vrail::-webkit-scrollbar-thumb{background:linear-gradient(90deg,var(--gold),var(--gold2));border-radius:99px;}
.hx-vcard{
  flex:0 0 min(300px,82vw);
  scroll-snap-align:start;
  position:relative;display:flex;flex-direction:column;
  border-radius:20px;overflow:hidden;
  border:1px solid var(--bdr2);
  background:var(--sur);
  transition:transform .35s,box-shadow .35s,border-color .35s;
}
.hx-vcard:hover{
  transform:translateY(-6px);
  box-shadow:0 28px 56px rgba(7,14,45,.2);
}
.hx-vcard-sale:hover{border-color:rgba(124,107,255,.45);}
.hx-vcard-rent:hover{border-color:rgba(56,189,248,.45);}
.hx-vcard-img-wrap{position:relative;height:188px;overflow:hidden;}
.hx-vcard-badge{
  position:absolute;top:10px;left:10px;z-index:2;
  font-family:var(--mono);font-size:9px;letter-spacing:.1em;text-transform:uppercase;
  padding:5px 10px;border-radius:8px;font-weight:600;
  background:rgba(6,14,43,.78);color:#fff;backdrop-filter:blur(8px);
  border:1px solid rgba(255,255,255,.12);
}
.hx-vcard-badge-rent{background:rgba(2,132,199,.82);border-color:rgba(255,255,255,.15);}
.hx-vcard-img{width:100%;height:100%;object-fit:cover;transition:transform .65s cubic-bezier(.22,1,.36,1);}
.hx-vcard:hover .hx-vcard-img{transform:scale(1.07);}
.hx-vcard-ph{
  width:100%;height:100%;display:flex;align-items:center;justify-content:center;
  background:var(--sur2);color:var(--mut);
}
.hx-vcard-ph svg{width:48px;height:48px;}
.hx-vcard-shade{
  position:absolute;inset:0;
  background:linear-gradient(to top,rgba(6,14,43,.75),transparent 55%);
  pointer-events:none;
}
.hx-vcard-body{padding:16px 18px 18px;display:flex;flex-direction:column;flex:1;}
.hx-vcard-city{
  font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);
  display:flex;align-items:center;gap:4px;
}
.hx-vcard-city svg{width:11px;height:11px;opacity:.7;}
.hx-vcard-title{
  font-family:var(--disp);font-size:19px;font-weight:700;letter-spacing:-.03em;
  color:var(--ink);margin:6px 0 8px;line-height:1.2;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.hx-vcard-sub{
  font-size:12px;color:var(--mut);margin:-4px 0 10px;line-height:1.35;
}
.hx-vcard-meta{
  display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;
}
.hx-vcard-tag{
  font-family:var(--mono);font-size:9px;letter-spacing:.05em;
  padding:4px 8px;border-radius:6px;
  background:var(--sur2);color:var(--mut);border:1px solid var(--bdr);
}
.hx-vcard-foot{
  display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;
  padding-top:10px;border-top:1px solid var(--bdr);
}
.hx-vcard-price{font-size:17px;font-weight:700;color:var(--gold);line-height:1;}
.hx-vcard-price-rent{color:#0284c7;}
.dark .hx-vcard-price-rent{color:var(--gold2);}
.hx-vcard-cta{
  font-size:10px;font-weight:700;letter-spacing:.1em;
  text-transform:uppercase;color:var(--mut);transition:color .2s,transform .2s;
  white-space:nowrap;
}
.hx-vcard:hover .hx-vcard-cta{color:var(--gold);transform:translateX(3px);}
.hx-vault-empty{padding:24px 64px;font-size:14px;color:var(--mut);max-width:1280px;margin:0 auto;}
.hx-vskel-wrap{display:flex;gap:16px;padding:8px 64px;}
.hx-vskel{
  flex:0 0 min(300px,82vw);height:300px;border-radius:20px;
  background:linear-gradient(110deg,var(--sur2) 25%,var(--sur) 50%,var(--sur2) 75%);
  background-size:200% 100%;animation:hxShine 1.4s ease infinite;
}
.hx-vskel-rent{opacity:.85;}
@keyframes hxShine{0%{background-position:100% 0}100%{background-position:-100% 0}}

/* ════ MARQUEE ════ */
.hx-marquee {
  overflow:hidden;
  background:linear-gradient(90deg,var(--ink) 0%,#121a3d 50%,var(--ink) 100%);
  padding:15px 0;
  transition:background .4s;
}
.hx.dark .hx-marquee{
  background:linear-gradient(90deg,#0a0c18 0%,#121528 45%,#0c1024 100%);
}
.hx-mtrack {
  display:flex;width:max-content;
  animation:marquee 32s linear infinite;
}
.hx-mitem {
  display:inline-flex;align-items:center;gap:20px;
  padding:0 28px;
  font-family:var(--mono);font-size:10px;letter-spacing:.16em;
  text-transform:uppercase;color:rgba(255,255,255,.38);white-space:nowrap;
}
.hx.dark .hx-mitem{color:var(--mut);}
.hx-mdot{width:4px;height:4px;border-radius:50%;background:var(--gold);opacity:.7;}
@keyframes marquee{to{transform:translateX(-50%);}}

/* ════ SECTION WRAPPER ════ */
.hx-wrap{max-width:1280px;margin:0 auto;}
.hx-sec{padding:100px 64px;}
.hx-sec-sm{padding:80px 64px;}

.hx-ey {
  display:flex;align-items:center;gap:10px;
  font-family:var(--mono);font-size:10px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--gold);margin-bottom:14px;
}
.hx-ey::before{content:'';width:24px;height:1px;background:var(--gold);}

.hx-h2 {
  font-family:var(--disp);
  font-size:clamp(36px,4.5vw,60px);
  font-weight:700;letter-spacing:-.045em;line-height:.92;
  color:var(--ink);margin-bottom:14px;
  transition:color .4s;
}
.hx-h2 em{font-style:italic;color:var(--gold);}

.hx-h2-sub {
  font-size:15px;font-weight:300;line-height:1.75;
  color:var(--mut);transition:color .4s;
}

/* ════ SERVICES ════ */
.hx-svc-wrap{background:var(--bg2);transition:background .4s;}

.hx-svc-header {
  padding:80px 64px 0;max-width:1280px;margin:0 auto;
  display:flex;align-items:flex-end;justify-content:space-between;gap:40px;
  flex-wrap:wrap;
}

.hx-svc-grid {
  max-width:1280px;margin:0 auto;
  display:grid;grid-template-columns:1fr 1fr;
  gap:20px;padding:48px 64px 80px;
}

/* Service card */
.hx-svc {
  position:relative;height:580px;
  border-radius:22px;overflow:hidden;cursor:pointer;
  transition:transform .5s cubic-bezier(.22,1,.36,1),
             box-shadow .5s cubic-bezier(.22,1,.36,1);
}
.hx-svc:hover{transform:translateY(-8px);}
.hx-svc:hover .hx-svc-img{transform:scale(1.06);}

.hx-svc-img {
  position:absolute;inset:0;
  width:100%;height:100%;object-fit:cover;
  transition:transform .8s cubic-bezier(.22,1,.36,1);
  will-change:transform;
}
.hx-svc-veil{position:absolute;inset:0;z-index:1;}
.hx-svc.rent .hx-svc-veil{
  background:linear-gradient(155deg,rgba(12,27,88,.32) 0%,rgba(9,17,56,.93) 100%);
}
.hx-svc.sell .hx-svc-veil{
  background:linear-gradient(155deg,rgba(20,11,58,.32) 0%,rgba(13,8,36,.93) 100%);
}

/* Hover glow */
.hx-svc::after {
  content:'';position:absolute;inset:0;z-index:1;border-radius:22px;
  opacity:0;transition:opacity .4s;pointer-events:none;
}
.hx-svc.rent::after{box-shadow:inset 0 0 0 1.5px rgba(56,189,248,.45);}
.hx-svc.sell::after{box-shadow:inset 0 0 0 1.5px rgba(124,107,255,.45);}
.hx-svc:hover::after{opacity:1;}

/* Big ghost number */
.hx-svc-num {
  position:absolute;top:-10px;right:16px;z-index:2;
  font-family:var(--disp);font-size:180px;font-weight:700;
  line-height:1;letter-spacing:-.05em;
  color:#fff;opacity:.05;pointer-events:none;
  transition:opacity .4s;
}
.hx-svc:hover .hx-svc-num{opacity:.09;}

.hx-svc-body {
  position:relative;z-index:3;
  height:100%;padding:40px;
  display:flex;flex-direction:column;justify-content:space-between;
}

/* Tag pill */
.hx-svc-tag {
  display:inline-flex;align-items:center;gap:7px;
  padding:6px 14px;border-radius:999px;
  border:1px solid rgba(255,255,255,.18);
  font-family:var(--mono);font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;color:rgba(255,255,255,.65);
  margin-bottom:20px;width:fit-content;
}
.hx-svc-tag::before{
  content:'';display:block;width:6px;height:6px;border-radius:50%;
}
.hx-svc.rent .hx-svc-tag::before{background:#38bdf8;box-shadow:0 0 8px #38bdf8;}
.hx-svc.sell .hx-svc-tag::before{background:var(--gold);box-shadow:0 0 8px var(--gold);}

.hx-svc-title {
  font-family:var(--disp);
  font-size:clamp(56px,5.5vw,88px);
  font-weight:700;letter-spacing:-.045em;line-height:.88;
  color:#fff;margin-bottom:18px;
}
.hx-svc-desc {
  font-size:14px;font-weight:300;line-height:1.8;
  color:rgba(255,255,255,.55);max-width:300px;
}

/* Feature list */
.hx-svc-feats{display:flex;flex-direction:column;gap:10px;margin-bottom:28px;}
.hx-svc-feat {
  display:flex;align-items:center;gap:10px;
  font-size:13px;font-weight:300;color:rgba(255,255,255,.5);
}
.hx-svc-feat::before{
  content:'';display:block;
  width:18px;height:1px;flex-shrink:0;
}
.hx-svc.rent .hx-svc-feat::before{background:#38bdf8;}
.hx-svc.sell .hx-svc-feat::before{background:var(--gold);}

/* CTA button */
.hx-svc-btn {
  display:inline-flex;align-items:center;gap:10px;
  padding:13px 22px;border-radius:10px;
  font-family:var(--body);font-size:13px;font-weight:600;
  transition:all .25s;cursor:pointer;
  width:fit-content;
}
.hx-svc.rent .hx-svc-btn{
  background:rgba(56,189,248,.14);
  border:1px solid rgba(56,189,248,.3);
  color:#38bdf8;
}
.hx-svc.rent .hx-svc-btn:hover{background:#38bdf8;color:#041028;transform:translateX(4px);}
.hx-svc.sell .hx-svc-btn{
  background:var(--gbg);border:1px solid var(--gbd);color:var(--gold2);
}
.hx-svc.sell .hx-svc-btn:hover{background:var(--gold);color:#fff;transform:translateX(4px);}
.hx-svc-arr{transition:transform .25s;}
.hx-svc-btn:hover .hx-svc-arr{transform:translateX(4px);}

/* ════ HOW IT WORKS ════ */
.hx-how-wrap{background:var(--bg2);transition:background .4s;}
.hx-how-grid {
  display:grid;grid-template-columns:repeat(3,1fr);
  border:1px solid var(--bdr);border-radius:18px;overflow:hidden;
  margin-top:48px;transition:border-color .4s;
}
.hx-how-cell {
  padding:48px 40px;border-right:1px solid var(--bdr);
  transition:border-color .4s,background .3s;
}
.hx-how-cell:last-child{border-right:none;}
.hx-how-cell:hover{background:var(--sur);}
.hx-how-n{
  font-family:var(--mono);font-size:10px;letter-spacing:.14em;
  color:var(--gold);margin-bottom:22px;
}
.hx-how-icon{font-size:32px;display:block;margin-bottom:18px;}
.hx-how-icon{
  width:38px;height:38px;display:flex;align-items:center;justify-content:center;
  color:var(--gold);
  margin-bottom:16px;
}
.hx-how-icon svg{width:100%;height:100%;}
.hx-how-title {
  font-family:var(--disp);font-size:26px;font-weight:700;
  letter-spacing:-.03em;color:var(--ink);margin-bottom:12px;
  transition:color .4s;
}
.hx-how-desc{
  font-size:14px;font-weight:300;line-height:1.75;
  color:var(--mut);transition:color .4s;
}

/* ════ STATS BAR ════ */
.hx-stats{
  background:var(--ink);padding:64px;
  transition:background .4s;
}
.hx.dark .hx-stats{background:var(--sur);}
.hx-stats-inner{
  max-width:1280px;margin:0 auto;
  display:grid;grid-template-columns:repeat(4,1fr);gap:40px;
}
.hx-stat{}
.hx-stat-n{
  font-family:var(--disp);font-size:56px;font-weight:700;
  letter-spacing:-.05em;line-height:1;
  color:#fff;transition:color .4s;
}
.hx.dark .hx-stat-n{color:var(--ink);}
.hx-stat-n em{color:var(--gold);font-style:normal;font-size:32px;}
.hx-stat-l{
  font-family:var(--mono);font-size:9px;letter-spacing:.14em;
  text-transform:uppercase;color:rgba(255,255,255,.32);margin-top:10px;
  transition:color .4s;
}
.hx.dark .hx-stat-l{color:var(--mut);}
.hx-stat-line{width:28px;height:1px;background:var(--gold);margin-top:14px;}

/* ════ DASHBOARD / CTA ════ */
.hx-dash-sec{padding:100px 64px;max-width:1280px;margin:0 auto;}

.hx-dash-card {
  background:var(--sur);border:1px solid var(--bdr2);
  border-radius:22px;padding:52px;
  position:relative;overflow:hidden;
  transition:background .4s,border-color .4s;
}
.hx-dash-card::before{
  content:'';
  position:absolute;top:0;left:0;right:0;height:2px;
  background:linear-gradient(90deg,var(--gold),transparent 60%);
}

.hx-dash-top{
  display:flex;align-items:flex-start;justify-content:space-between;
  margin-bottom:40px;gap:20px;
}
.hx-dash-gr{
  font-family:var(--mono);font-size:10px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--mut);margin-bottom:6px;
}
.hx-dash-name{
  font-family:var(--disp);font-size:38px;font-weight:700;
  letter-spacing:-.04em;color:var(--ink);transition:color .4s;
}
.hx-dash-badge {
  display:inline-block;margin-top:10px;
  padding:4px 12px;border-radius:999px;
  background:var(--gbg);border:1px solid var(--gbd);
  font-family:var(--mono);font-size:9px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--gold);
}
.hx-logout {
  display:inline-flex;align-items:center;
  padding:10px 20px;border-radius:8px;
  background:transparent;border:1px solid var(--bdr2);
  font-size:13px;font-weight:500;color:var(--mut);
  cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;
}
.hx-logout:hover{border-color:#ff6b6b;color:#ff6b6b;background:rgba(255,107,107,.06);}

.hx-acts{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.hx-act {
  display:flex;flex-direction:column;gap:14px;
  padding:24px;border-radius:14px;
  background:var(--sur2);border:1px solid var(--bdr);
  transition:all .25s;
}
.hx-act:hover{
  border-color:var(--gbd);background:var(--gbg);
  transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.08);
}
.hx-act-admin{background:var(--ink);border-color:var(--ink);}
.hx-act-admin .hx-act-lbl{color:var(--bg);}
.hx-act-admin .hx-act-arr{color:rgba(255,255,255,.4);}
.hx-act-admin:hover{opacity:.9;background:var(--gold);border-color:var(--gold);}
.hx-act-ico{
  width:40px;height:40px;border-radius:12px;
  background:var(--gbg);border:1px solid var(--gbd);
  display:flex;align-items:center;justify-content:center;
}
.hx-act-ico svg{width:20px;height:20px;}
.hx-act-lbl{
  font-family:var(--disp);font-size:18px;font-weight:700;
  letter-spacing:-.02em;color:var(--ink);flex:1;
  transition:color .4s;
}
.hx-act-arr{font-family:var(--mono);font-size:10px;color:var(--gold);letter-spacing:.06em;}

/* Auth CTA */
.hx-auth{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;}
.hx-auth-h3{
  font-family:var(--disp);
  font-size:clamp(30px,3.5vw,48px);
  font-weight:700;letter-spacing:-.045em;line-height:1.05;
  color:var(--ink);margin-bottom:14px;transition:color .4s;
}
.hx-auth-h3 em{font-style:italic;color:var(--gold);}
.hx-auth-p{
  font-size:14px;font-weight:300;line-height:1.8;
  color:var(--mut);margin-bottom:28px;transition:color .4s;
}
.hx-auth-btns{display:flex;gap:10px;flex-wrap:wrap;}
.hx-auth-feats{
  background:var(--sur2);border:1px solid var(--bdr);
  border-radius:14px;padding:28px;
  display:flex;flex-direction:column;gap:14px;
  transition:background .4s,border-color .4s;
}
.hx-auth-feat{display:flex;align-items:center;gap:12px;font-size:13px;font-weight:300;color:var(--mut);}
.hx-auth-fdot{
  width:6px;height:6px;border-radius:50%;flex-shrink:0;
  background:var(--gold);box-shadow:0 0 8px var(--gold);
}

/* ════ FEATURED CARS ════ */
.hx-fsec{padding:92px 64px;background:var(--bg);transition:background .4s;}
.hx-fhead{max-width:1280px;margin:0 auto 28px;}
.hx-frail{
  max-width:1280px;margin:0 auto;display:grid;
  grid-template-columns:repeat(4,minmax(220px,1fr));gap:18px;
}
.hx-fc{
  position:relative;overflow:hidden;border-radius:18px;
  border:1px solid var(--bdr2);background:var(--sur);
  min-height:330px;display:flex;flex-direction:column;justify-content:flex-end;
  transition:transform .35s,box-shadow .35s,border-color .35s;
}
.hx-fc:hover{transform:translateY(-6px);box-shadow:0 24px 45px rgba(7,14,45,.18);border-color:var(--gbd);}
.hx-fc-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;transition:transform .7s;}
.hx-fc:hover .hx-fc-img{transform:scale(1.06);}
.hx-fc::after{
  content:'';position:absolute;inset:0;z-index:1;
  background:linear-gradient(to top,rgba(6,14,43,.92),rgba(6,14,43,.18) 58%,transparent);
}
.hx-fc-top,.hx-fc-body{position:relative;z-index:2;padding:16px 16px 0;}
.hx-fc-top{display:flex;justify-content:space-between;align-items:center;}
.hx-fc-badge{
  padding:5px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.26);
  background:rgba(124,107,255,.2);color:#d8d7ff;font-size:10px;letter-spacing:.08em;text-transform:uppercase;
}
.hx-fc-loc{display:flex;align-items:center;gap:6px;color:rgba(255,255,255,.76);font-size:11px;}
.hx-fc-loc::before{content:'';width:6px;height:6px;border-radius:50%;background:#38bdf8;}
.hx-fc-body{padding-bottom:16px;}
.hx-fc-body h3{font-family:var(--disp);font-size:24px;line-height:1.1;color:#fff;margin:0 0 6px;}
.hx-fc-body p{color:rgba(255,255,255,.78);font-size:13px;margin-bottom:14px;}
.hx-fc-btn{
  display:inline-flex;padding:9px 14px;border-radius:9px;
  background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.26);
  color:#fff;font-size:12px;font-weight:600;transition:all .25s;
}
.hx-fc-btn:hover{background:var(--gold);border-color:var(--gold);transform:translateX(3px);}

/* ════ ELITE BENEFITS ════ */
.hx-ben-sec{padding:80px 64px;background:var(--bg2);}
.hx-ben-grid{
  max-width:1280px;margin:26px auto 0;display:grid;
  grid-template-columns:repeat(5,1fr);gap:14px;
}
.hx-ben{
  background:var(--sur);border:1px solid var(--bdr);border-radius:14px;
  padding:22px;transition:all .3s;
}
.hx-ben:hover{transform:translateY(-4px);border-color:var(--gbd);box-shadow:0 14px 28px rgba(0,0,0,.08);}
.hx-ben-ico{
  width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;
  background:var(--gbg);border:1px solid var(--gbd);color:var(--gold);margin-bottom:12px;
}
.hx-ben-ico svg{width:20px;height:20px;}
.hx-ben h4{font-size:16px;color:var(--ink);margin-bottom:8px;}
.hx-ben p{font-size:13px;line-height:1.65;color:var(--mut);}

/* ════ EXPERIENCE ════ */
.hx-exp{
  position:relative;min-height:500px;display:flex;align-items:flex-end;
  margin:84px 64px;border-radius:24px;overflow:hidden;border:1px solid var(--bdr2);
}
.hx-exp-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;}
.hx-exp::after{
  content:'';position:absolute;inset:0;z-index:1;
  background:linear-gradient(160deg,rgba(7,11,32,.28) 0%,rgba(7,11,32,.88) 75%);
}
.hx-exp-body{position:relative;z-index:2;max-width:780px;padding:52px;}
.hx-exp-body h3{
  font-family:var(--disp);font-size:clamp(34px,4.4vw,58px);line-height:.98;color:#fff;
  margin-bottom:14px;letter-spacing:-.04em;
}
.hx-exp-body p{color:rgba(255,255,255,.74);font-size:16px;line-height:1.8;max-width:620px;}

/* ════ TESTIMONIALS ════ */
.hx-tsec{padding:92px 64px;background:var(--bg);}
.hx-tgrid{
  max-width:1280px;margin:22px auto 0;display:grid;
  grid-template-columns:repeat(3,1fr);gap:16px;
}
.hx-tm{
  background:var(--sur);border:1px solid var(--bdr);border-radius:14px;padding:24px;
  transition:transform .3s,border-color .3s,box-shadow .3s;
}
.hx-tm:hover{transform:translateY(-4px);border-color:var(--gbd);box-shadow:0 18px 32px rgba(0,0,0,.08);}
.hx-tm-stars{letter-spacing:.08em;color:#f5c56b;margin-bottom:10px;}
.hx-tm-txt{font-size:14px;line-height:1.8;color:var(--ink2);margin-bottom:16px;}
.hx-tm-ft{display:flex;flex-direction:column;gap:4px;}
.hx-tm-ft strong{font-size:14px;color:var(--ink);}
.hx-tm-ft span{font-size:12px;color:var(--mut);}

/* ════ TRUST / SECURITY ════ */
.hx-trust{padding:82px 64px;background:var(--bg2);}
.hx-tr-grid{
  max-width:1280px;margin:20px auto 0;display:grid;
  grid-template-columns:repeat(3,1fr);gap:16px;
}
.hx-tr{
  background:var(--sur);border:1px solid var(--bdr);border-radius:14px;
  padding:24px;transition:all .3s;
}
.hx-tr:hover{border-color:var(--gbd);transform:translateY(-3px);}
.hx-tr h4{font-size:18px;color:var(--ink);margin:10px 0 8px;}
.hx-tr p{font-size:13px;line-height:1.75;color:var(--mut);}

/* ════ MY GARAGE FEATURE ════ */
.hx-gfeat{
  padding:72px 64px 64px;
  background:var(--bg);
  transition:background .4s;
}
.hx-gfeat-copy{
  max-width:720px;margin:0 auto;text-align:center;
}
.hx-gfeat-badge{
  display:inline-flex;align-items:center;gap:8px;
  font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--mut);padding:8px 14px;border-radius:99px;
  background:var(--gbg);border:1px solid var(--gbd);margin-bottom:20px;
}
.hx-gfeat-title{
  font-family:var(--disp);font-size:clamp(32px,5vw,52px);
  line-height:1.05;letter-spacing:-.03em;color:var(--ink);margin-bottom:8px;
}
.hx-gfeat-title em{font-style:italic;font-weight:300;color:var(--gold);}
.hx-gfeat-tagline{
  font-family:var(--disp);font-size:clamp(22px,3.5vw,32px);
  font-style:italic;font-weight:300;color:var(--gold2);margin-bottom:18px;
}
.hx-gfeat-sub{
  font-size:16px;line-height:1.75;color:var(--mut);margin-bottom:28px;
}
.hx-gfeat-feats{
  display:grid;grid-template-columns:repeat(2,1fr);gap:14px 20px;
  text-align:left;margin-bottom:8px;
}
.hx-gfeat-feat strong{
  display:block;font-size:13px;letter-spacing:.04em;color:var(--ink);margin-bottom:2px;
}
.hx-gfeat-feat span{font-size:12px;line-height:1.5;color:var(--mut);}
.hx-gfeat-visual{
  display:none;max-width:100%;margin:0 auto;
}
.hx-gfeat-img{
  display:block;width:100%;height:auto;
  pointer-events:none;user-select:none;
}
.hx-gfeat-actions{
  display:flex;justify-content:center;
  margin-top:28px;
}

/* Mobile marketing pitch — all users (above section banners) */
.hx-mobile-pitch{display:none;}
.hx-mobile-pitch-badge{
  display:inline-flex;align-items:center;gap:8px;
  font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--teal,#2af5c0);padding:7px 13px;border-radius:99px;
  background:rgba(42,245,192,.1);border:1px solid rgba(42,245,192,.22);
  margin-bottom:14px;
}
.hx-mobile-pitch-badge::before{
  content:'';width:6px;height:6px;border-radius:50%;
  background:var(--teal,#2af5c0);box-shadow:0 0 10px var(--teal,#2af5c0);
}
.hx-mobile-pitch-title{
  font-family:var(--disp);font-size:clamp(26px,6.5vw,34px);
  font-weight:800;letter-spacing:-.04em;line-height:1.08;
  color:var(--ink);margin:0 0 10px;
}
.hx-mobile-pitch-title em{
  font-style:italic;font-weight:700;
  background:linear-gradient(90deg,var(--gold),var(--gold2));
  -webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;
}
.hx-mobile-pitch-sub{
  font-size:clamp(13px,3.2vw,15px);line-height:1.65;
  color:var(--mut);margin:0 0 20px;max-width:52ch;
}

/* ════ APP & FINAL CTA ════ */
/* App download — light: mockup image only; dark: ring card on black */
.hx-app{padding:92px 64px;background:var(--bg);}
.hx-app-grid{
  max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.1fr .9fr;
  gap:32px;align-items:center;
}
.hx-app-phones{
  position:relative;justify-self:end;
  width:min(400px,44vw);max-width:100%;
}
.hx-app-phones-float{
  width:100%;aspect-ratio:1/1;overflow:hidden;
  animation:hxAppFloat 7s ease-in-out infinite;
  border-radius:26px;
  box-shadow:0 22px 48px rgba(7,14,45,.12);
}
.hx-app-phones-img{
  display:block;width:100%;height:100%;
  object-fit:contain;object-position:center center;
  pointer-events:none;user-select:none;
  transition:filter .4s;
}
.hx.dark .hx-app-phones-float{
  background:var(--bg);
  border:1px solid rgba(124,107,255,.16);
  box-shadow:0 28px 56px rgba(0,0,0,.48),0 0 48px rgba(124,107,255,.07);
  isolation:isolate;
}
.hx.dark .hx-app-phones-img{
  mix-blend-mode:screen;
}
.hx-app-phones-banner{display:none;}
.hx-app-visual{
  display:flex;flex-direction:column;align-items:center;
  justify-self:end;width:min(400px,44vw);max-width:100%;
}
.hx-store-badges{
  display:flex;flex-wrap:wrap;gap:10px;
  margin-top:20px;width:100%;
}
.hx-store-badge{
  display:inline-flex;align-items:center;gap:10px;
  min-width:min(168px,48vw);flex:1 1 168px;
  padding:10px 14px 10px 12px;border-radius:14px;
  background:var(--sur);
  border:1px solid var(--gbd);
  box-shadow:0 8px 24px rgba(7,14,45,.06);
  transition:transform .22s ease,border-color .22s ease,box-shadow .22s ease,background .22s ease;
}
.hx.dark .hx-store-badge{
  background:rgba(255,255,255,.04);
  border-color:rgba(124,107,255,.18);
  box-shadow:0 10px 28px rgba(0,0,0,.28);
}
.hx-store-badge:hover{
  transform:translateY(-2px);
  border-color:rgba(124,107,255,.42);
  box-shadow:0 14px 32px rgba(124,107,255,.14);
}
.hx-store-badge--apple:hover{border-color:rgba(255,255,255,.22);}
.hx-store-badge-ico{
  width:28px;height:28px;flex-shrink:0;
  display:flex;align-items:center;justify-content:center;
}
.hx-store-badge-ico svg{width:100%;height:100%;}
.hx-store-badge-ico--apple svg{fill:var(--ink);}
.hx.dark .hx-store-badge-ico--apple svg{fill:#f5f7ff;}
.hx-store-badge-txt{
  display:flex;flex-direction:column;gap:1px;min-width:0;
}
.hx-store-badge-txt small{
  font-family:var(--mono);font-size:9px;letter-spacing:.04em;
  text-transform:uppercase;color:var(--mut);line-height:1.2;
}
.hx-store-badge-txt strong{
  font-size:14px;font-weight:700;letter-spacing:-.02em;
  color:var(--ink);line-height:1.15;
}
.hx.dark .hx-store-badge-txt strong{color:#fafafa;}
@keyframes hxAppFloat{
  0%,100%{transform:translateY(0);}
  50%{transform:translateY(-8px);}
}
@media (prefers-reduced-motion:reduce){
  .hx-app-phones-float,
  .hx-app-phones-banner{animation:none !important;}
}

.hx-final{
  margin:0 64px 92px;border:1px solid var(--bdr2);border-radius:24px;padding:48px;
  background:linear-gradient(130deg,rgba(124,107,255,.18),rgba(56,189,248,.11) 58%,transparent);
  display:flex;justify-content:space-between;align-items:center;gap:18px;flex-wrap:wrap;
}
.hx-final h3{
  font-family:var(--disp);font-size:clamp(32px,4.2vw,56px);
  line-height:.95;letter-spacing:-.04em;color:var(--ink);
}
.hx-final p{font-size:14px;color:var(--mut);margin-top:10px;}
.hx-final-btns{display:flex;gap:10px;flex-wrap:wrap;}

/* ════ FOOTER ════ */
/* Light: --ink is dark blue (correct). Dark: --ink is light — use --bg so footer stays dark. */
.hx-ft{background:var(--ink);padding:72px 64px 32px;transition:background .4s,border-color .4s;}
.hx.dark .hx-ft{
  background:var(--bg);
  border-top:1px solid var(--bdr);
}
.hx-ft-inner{max-width:1280px;margin:0 auto;}
.hx-ft-top{
  display:grid;grid-template-columns:2fr 1fr 1fr 1fr;
  gap:48px;padding-bottom:48px;
  border-bottom:1px solid rgba(255,255,255,.07);margin-bottom:28px;
}
.hx-ft-logo{
  font-family:var(--disp);font-size:22px;font-weight:700;
  color:#fff;letter-spacing:-.03em;margin-bottom:12px;
}
.hx-ft-logo em{font-style:italic;color:var(--gold);}
.hx-ft-tag{
  font-size:13px;font-weight:300;line-height:1.8;
  color:rgba(255,255,255,.28);max-width:240px;
}
.hx-ft-ch{
  font-family:var(--mono);font-size:9px;letter-spacing:.16em;
  text-transform:uppercase;color:rgba(255,255,255,.32);margin-bottom:18px;
}
.hx-ft-link{
  display:block;font-size:13px;font-weight:300;
  color:rgba(255,255,255,.32);margin-bottom:10px;
  transition:color .2s;
}
.hx-ft-link:hover{color:var(--gold);}
.hx-ft-bot{
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;
  font-family:var(--mono);font-size:9px;letter-spacing:.08em;
  color:rgba(255,255,255,.18);
}
.hx-ft-bot em{color:var(--gold);font-style:normal;}

/* ════ KEYFRAMES ════ */
@keyframes hUp{
  from{opacity:0;transform:translateY(24px);}
  to{opacity:1;transform:translateY(0);}
}

@media (prefers-reduced-motion: reduce) {
  .hx *, .hx *::before, .hx *::after {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
  .hx-hero-graph{opacity:1 !important;}
  .hx-type-divider-sweep{animation:none !important;opacity:0.35;}
  .hx-type-msg.is-active .hx-type-main,
  .hx-type-msg.is-active .hx-type-sign{opacity:1 !important;clip-path:none !important;filter:none !important;}
}

/* ════ RESPONSIVE ════ */
@media(max-width:1024px){
  .hx-sec{padding:80px 40px;}
  .hx-sec-sm{padding:64px 40px;}
  .hx-hero{padding:100px 40px 42px;}
  .hx-hero-inner{grid-template-columns:1fr;gap:20px;}
  .hx-hero-left{max-width:100%;}
  .hx-hero-right{min-height:420px;}
  .hx-svc-header{padding:64px 40px 0;}
  .hx-svc-grid{padding:40px 40px 64px;gap:16px;}
  .hx-svc{height:500px;}
  .hx-stats{padding:56px 40px;}
  .hx-stats-inner{grid-template-columns:repeat(2,1fr);}
  .hx-stat-n{font-size:44px;}
  .hx-dash-sec{padding:80px 40px;}
  .hx-fsec,.hx-ben-sec,.hx-tsec,.hx-trust,.hx-app,.hx-gfeat{padding-left:40px;padding-right:40px;}
  .hx-frail{grid-template-columns:repeat(2,1fr);}
  .hx-ben-grid{grid-template-columns:repeat(3,1fr);}
  .hx-tgrid,.hx-tr-grid{grid-template-columns:repeat(2,1fr);}
  .hx-exp{margin:70px 40px;min-height:440px;}
  .hx-app{padding:64px 40px;}
  .hx-app-grid{grid-template-columns:1fr;}
  .hx-app-phones{justify-self:center;margin-top:16px;width:min(340px,86vw);}
  .hx-final{margin:0 40px 80px;}
  .hx-ft{padding:56px 40px 24px;}
  .hx-ft-top{grid-template-columns:1fr 1fr;}
  .hx-ft-top>div:first-child{grid-column:1/-1;}
}
@media(max-width:768px){
  .hx-nav{padding:0 20px;}
  .hx-nav-links{display:none;}
  .hx-npill.gh{display:none;}
  .hx-burger{display:flex;}
  .hx-hero{
    min-height:auto;
    padding:76px 24px 16px;
    display:flex;
    align-items:flex-start;
    justify-content:center;
  }
  .hx-hero-inner{width:100%;max-width:100%;display:block;}
  .hx-hero-left{
    max-width:100%;
    display:flex;
    flex-direction:column;
    align-items:center;
    text-align:center;
    padding-top:clamp(4px,2vw,16px);
  }
  .hx-hero-kicker{justify-content:center;margin-bottom:14px;}
  .hx-hero-h1{margin-bottom:0;text-align:center;}
  .hx-hero-h1--caps{text-transform:uppercase;}
  .hx-hero-h1--caps em{text-transform:none;}
  .hx.dark .hx-hero-h1{color:#fafafa;}
  .hx-type-divider{padding:10px 0 8px;}
  .hx-hero-rule{display:none;}
  .hx-hero-right,
  .hx-hero-stats,
  .hx-scroll-ind{display:none !important;}
  .hx-hero-pillrow,
  .hx-hero-btns{display:none !important;}
  .hx-hero-p{display:none;}
  .hx-hero-graph{
    display:block;
    width:100%;
    margin:0;
    opacity:1;
    text-align:center;
  }
  .hx-type-msg{align-items:center;text-align:center;}
  .hx-type-main,
  .hx-type-sign{transform-origin:center center;}
  .hx-type--rtl .hx-type-sign{transform-origin:center center;}
  @media (prefers-reduced-motion: no-preference){
    .hx-hero-graph{
      opacity:0;animation:hUp .6s ease .42s forwards;
    }
  }
  .hx-hbtn{justify-content:center;flex:1;min-width:140px;}
  .hx-vault{
    padding:28px 0 32px;
    border-top:none;
    border-bottom:none;
  }
  .hx-vault--rent{
    padding:20px 0 28px;
    border-top:1px solid var(--bdr);
    border-bottom:none;
  }
  .hx-vault::before{display:none;}
  .hx-vault-head{display:none;}
  .hx-vault-band:first-of-type{padding-top:0;}
  .hx-app{padding:36px 24px 40px;}
  .hx-app-btns{display:none;}
  .hx-mobile-pitch--app{margin-bottom:14px;}
  .hx-mobile-pitch--garage{margin-bottom:12px;}
  .hx-gfeat{padding:40px 24px 44px;}
  .hx-svc-wrap{border-top:none;}
  .hx-svc-header{padding:48px 24px 0;flex-direction:column;align-items:flex-start;}
  .hx-svc-header .hx-h2-sub{text-align:left !important;max-width:100% !important;}
  .hx-svc-grid{grid-template-columns:1fr;padding:32px 24px 48px;}
  .hx-svc{height:440px;}
  .hx-svc-num{font-size:130px;}
  .hx-sec{padding:64px 24px;}
  .hx-sec-sm{padding:48px 24px;}
  .hx-how-grid{
    display:flex;overflow-x:auto;gap:14px;
    scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;
    border:none;border-radius:0;margin-top:28px;
    padding:4px 2px 12px;
    scrollbar-width:none;
  }
  .hx-how-grid::-webkit-scrollbar{display:none;}
  .hx-how-cell{
    flex:0 0 min(272px,78vw);scroll-snap-align:start;
    border:1px solid var(--bdr);border-radius:16px;
    padding:22px 18px;border-right:1px solid var(--bdr);
  }
  .hx-how-cell:last-child{border-bottom:1px solid var(--bdr);}
  .hx-how-icon{width:32px;height:32px;margin-bottom:12px;}
  .hx-how-title{font-size:20px;margin-bottom:8px;}
  .hx-how-desc{font-size:13px;line-height:1.6;}
  .hx-stats{padding:36px 20px;}
  .hx-stats-inner{grid-template-columns:repeat(2,1fr);gap:20px 14px;}
  .hx-stat-n{font-size:34px;}
  .hx-stat-n em{font-size:24px;}
  .hx-stat-l{font-size:9px;letter-spacing:.1em;}
  .hx-stat-line{width:22px;margin-top:8px;}
  .hx-ben-grid{
    display:flex;overflow-x:auto;gap:12px;
    scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;
    padding:0 24px 8px;margin-top:20px;
    scrollbar-width:none;
  }
  .hx-ben-grid::-webkit-scrollbar{display:none;}
  .hx-ben{flex:0 0 min(240px,72vw);scroll-snap-align:start;padding:18px;}
  .hx-tgrid{
    display:flex;overflow-x:auto;gap:14px;
    scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;
    padding:0 24px 8px;
    scrollbar-width:none;
  }
  .hx-tgrid::-webkit-scrollbar{display:none;}
  .hx-tgrid>.hx-tm{flex:0 0 min(280px,80vw);scroll-snap-align:start;}
  .hx-dash-sec{padding:64px 24px;}
  .hx-gfeat-copy{display:none;}
  .hx-mobile-pitch{display:block;}
  .hx-gfeat-visual{display:block;width:100%;margin-top:4px;}
  .hx-app-copy-desktop{display:none;}
  .hx-gfeat-feats{grid-template-columns:1fr;}
  .hx-fsec,.hx-ben-sec,.hx-tsec,.hx-trust,.hx-app{padding-left:24px;padding-right:24px;}
  .hx-vault-head,.hx-vault-band-h{padding-left:24px;padding-right:24px;}
  .hx-vrail,.hx-vskel-wrap{padding-left:24px;padding-right:24px;}
  .hx-vault-empty{padding-left:24px;padding-right:24px;}
  .hx-frail,.hx-tr-grid{grid-template-columns:1fr;}
  .hx-vcard{flex:0 0 min(320px,88vw);}
  .hx-vcard-img-wrap{height:210px;}
  .hx-vcard-body{padding:18px 20px 20px;}
  .hx-vcard-title{font-size:20px;}
  .hx-vcard-price{font-size:18px;}
  .hx-vskel{flex:0 0 min(320px,88vw);height:310px;}
  .hx-exp{margin:56px 24px;min-height:380px;border-radius:18px;}
  .hx-exp-body{padding:26px;}
  .hx-final{margin:0 24px 64px;padding:28px;border-radius:18px;}
  .hx-dash-card{padding:28px 20px;}
  .hx-dash-top{flex-direction:column;}
  .hx-acts{grid-template-columns:1fr;}
  .hx-auth{grid-template-columns:1fr;}
  .hx-auth-feats{display:none;}
  .hx-ft{padding:48px 24px 24px;}
  .hx-ft-top{grid-template-columns:1fr;gap:24px;}
  .hx-ft-top>div:first-child{grid-column:1;}
  .hx-app-visual{width:100%;max-width:none;}
  .hx-app-phones-float{display:none;}
  .hx-app-phones{width:100%;max-width:none;margin-top:12px;}
  .hx-app-phones-banner{
    display:block;width:100%;height:auto;
    animation:hxAppFloat 7s ease-in-out infinite;
    pointer-events:none;user-select:none;
  }
  .hx-store-badges{justify-content:center;margin-top:16px;}
  .hx-store-badge{min-width:0;flex:1 1 calc(50% - 5px);max-width:none;padding:9px 12px 9px 10px;}
  .hx-store-badge-ico{width:24px;height:24px;}
  .hx-store-badge-txt strong{font-size:12px;}
  .hx-app-phones--dark .hx-app-phones-banner{mix-blend-mode:screen;}
  .hx-app-phones--light .hx-app-phones-banner{mix-blend-mode:normal;}
}
@media(max-width:480px){
  .hx-lang button{padding:6px 8px;font-size:9px;}
  .hx-npill.sl{display:none;}
  .hx-hero-h1{font-size:38px;}
  .hx-hero-p{font-size:15px;line-height:1.75;margin-bottom:20px;}
  .hx-svc{height:390px;}
  .hx-svc-title{font-size:52px;}
  .hx-svc-body{padding:28px;}
  .hx-app{padding:52px 24px;}
  .hx-app-phones{width:100%;}
  .hx-gfeat-actions{margin-top:20px;}
  .hx-stats-inner{grid-template-columns:repeat(2,1fr);gap:16px 12px;}
  .hx-stat-n{font-size:30px;}
  .hx-how-cell{flex:0 0 min(260px,84vw);}
  .hx-auth-btns{flex-direction:column;}
  .hx-auth-btns a,.hx-auth-btns button{justify-content:center;}
}
`;

/* ═══════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════ */
function HomeInner() {
  const { lang, setLang, copy } = useAppLang();
  const [auth, setAuth] = useState(() => loadAuth());
  const { dark, toggle: toggleTheme } = useTheme();
  const [menu,        setMenu]        = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [liveSales, setLiveSales] = useState([]);
  const [liveRentals, setLiveRentals] = useState([]);
  const [liveLoading, setLiveLoading] = useState(true);

  const isDesktopHero = useMediaQuery("(min-width: 769px)");
  const svcHdrRef    = useReveal(0.08);
  const rentRef      = useReveal(0.08);
  const sellRef      = useReveal(0.08);
  const howHdrRef    = useReveal(0.08);
  const statsRef     = useReveal(0.1);
  const dashRef      = useReveal(0.08);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLiveLoading(true);
      try {
        const [sRes, rRes] = await Promise.all([
          getApprovedSales({ page: 1, limit: 10 }),
          getApprovedRentals(),
        ]);
        if (cancelled) return;
        setLiveSales(normalizeSalesPayload(sRes?.data).slice(0, 10));
        setLiveRentals(normalizeRentalsPayload(rRes?.data).slice(0, 10));
      } catch {
        if (!cancelled) {
          setLiveSales([]);
          setLiveRentals([]);
        }
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function logout() { clearAuth(); setAuth(null); }

  const role    = (auth?.role || "").toLowerCase();
  const isCust  = role === "customer";
  const isOwner = role === "rental_owner";
  const isSell  = hasUserRole(auth, "car_owner", "seller");
  const isAdmin = auth && isAdminOnlyUser(auth);

  return (
    <div className={`hx${dark ? " dark" : ""}`}>
      <style>{CSS}</style>

      {/* ═══ NAV ═══ */}
      <nav className="hx-nav">
        <Link to="/" className="hx-logo">Goo<em>voiture</em></Link>

        <div className="hx-nav-links">
          <Link to="/cars"    className="hx-nav-link">{copy.home.nav.buy}</Link>
          <Link to="/rentals" className="hx-nav-link">{copy.home.nav.rent}</Link>
        </div>

        <div className="hx-nav-end">
          <div className="hx-lang" role="radiogroup" aria-label="Language">
            <button
              type="button"
              role="radio"
              className={lang === "fr" ? "on" : ""}
              onClick={() => setLang("fr")}
              aria-checked={lang === "fr"}
            >
              FR
            </button>
            <button
              type="button"
              role="radio"
              className={lang === "en" ? "on" : ""}
              onClick={() => setLang("en")}
              aria-checked={lang === "en"}
            >
              EN
            </button>
            <button
              type="button"
              role="radio"
              className={lang === "ar" ? "on" : ""}
              onClick={() => setLang("ar")}
              aria-checked={lang === "ar"}
            >
              AR
            </button>
          </div>
          {auth ? (
            <div className="hx-profile-wrap" ref={profileRef}>
              <button
                type="button"
                className="hx-av-btn"
                onClick={() => setProfileOpen(o => !o)}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                {auth.avatar
                  ? <img src={auth.avatar} alt={auth.name} />
                  : (auth.name?.[0]?.toUpperCase() || "?")}
              </button>

              {profileOpen && (
                <div className="hx-drop" role="menu">
                  <div className="hx-drop-head">
                    <div className="hx-drop-av">
                      {auth.avatar
                        ? <img src={auth.avatar} alt={auth.name} />
                        : (auth.name?.[0]?.toUpperCase() || "?")}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="hx-drop-name">{auth.name}</div>
                      <div className="hx-drop-role">
                        {{ customer: "Customer", rental_owner: "Rental Owner", car_owner: "Car owner", seller: "Car owner", admin: "Admin" }[auth.role] || auth.role}
                      </div>
                    </div>
                  </div>

                  <div className="hx-drop-body">
                    <Link to="/profile" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      My Profile
                    </Link>

                    {auth.role === "customer" && (
                      <Link to="/my-bookings" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        My Bookings
                      </Link>
                    )}

                    {auth.role === "rental_owner" && (
                      <Link to="/my-fleet" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                        My Fleet
                      </Link>
                    )}

                    {hasUserRole(auth, "car_owner") && (
                      <Link to="/garage" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                        My garage
                      </Link>
                    )}
                    {hasUserRole(auth, "customer", "car_owner", "rental_owner", "admin") && (
                      <Link to="/my-sales" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                        My listings
                      </Link>
                    )}

                    {hasUserRole(auth, "admin") &&
                      !hasUserRole(auth, "car_owner", "rental_owner") && (
                      <Link to="/admin" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                        Admin Panel
                      </Link>
                    )}

                    <div className="hx-drop-sep" />

                    <button onClick={() => { logout(); setProfileOpen(false); }} className="hx-drop-item red">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    className="hx-npill gh">{copy.home.nav.login}</Link>
              <Link to="/register" className="hx-npill sl">{copy.home.nav.getStarted}</Link>
            </>
          )}
          <button
            className="hx-theme"
            onClick={toggleTheme}
            aria-label={dark ? copy.home.nav.themeLight : copy.home.nav.themeDark}
          >
            {dark ? "☀" : "☾"}
          </button>
          <button
            type="button"
            className="hx-burger"
            onClick={() => setMenu(m => !m)}
            aria-label={copy.home.nav.menu}
            aria-expanded={menu}
            aria-controls="hx-mobile-drawer"
          >
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        id="hx-mobile-drawer"
        className={`hx-drawer${menu ? " open" : ""}`}
        aria-hidden={!menu}
      >
        <Link to="/cars"    className="hx-dlink" onClick={() => setMenu(false)}>{copy.home.drawer.buyCars}</Link>
        <Link to="/rentals" className="hx-dlink" onClick={() => setMenu(false)}>{copy.home.drawer.rentCar}</Link>
        {auth ? (
          <>
            <Link to="/profile"    className="hx-dlink" onClick={() => setMenu(false)}>My Profile</Link>
            {hasUserRole(auth, "customer") && <Link to="/my-bookings" className="hx-dlink" onClick={() => setMenu(false)}>My Bookings</Link>}
            {hasUserRole(auth, "rental_owner") && <Link to="/my-fleet" className="hx-dlink" onClick={() => setMenu(false)}>My Fleet</Link>}
            {hasUserRole(auth, "car_owner") && <Link to="/garage" className="hx-dlink" onClick={() => setMenu(false)}>My garage</Link>}
            {hasUserRole(auth, "customer", "car_owner", "rental_owner", "admin") && <Link to="/my-sales" className="hx-dlink" onClick={() => setMenu(false)}>My listings</Link>}
            {hasUserRole(auth, "admin") &&
              !hasUserRole(auth, "car_owner", "rental_owner") && (
                <Link to="/admin" className="hx-dlink" onClick={() => setMenu(false)}>
                  Admin Panel
                </Link>
              )}
            <button onClick={() => { logout(); setMenu(false); }} className="hx-dlink" style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left", width:"100%", color:"#ef4444" }}>
              {copy.home.drawer.logout}
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="hx-dlink" onClick={() => setMenu(false)}>{copy.home.drawer.login}</Link>
            <Link to="/register" className="hx-dlink" onClick={() => setMenu(false)}>{copy.home.drawer.getStarted}</Link>
          </>
        )}
      </div>

      {/* ═══ HERO ═══ */}
      <section className="hx-hero">
        <div className="hx-hero-bgmotion" aria-hidden="true" />
        <div className="hx-hero-traffic" aria-hidden="true">
          <span className="hx-hero-traffic-line" />
        </div>
        <div className="hx-hero-inner">
          <div className="hx-hero-left">
          <div className="hx-hero-kicker">{copy.home.hero.kicker}</div>

          <h1 className={`hx-hero-h1${lang !== "ar" ? " hx-hero-h1--caps" : ""}`}>
            {copy.home.hero.line1}<br/>
            {copy.home.hero.line2}<br/>
            <em>{copy.home.hero.line3}</em>
          </h1>

          <HeroMobileVisual />

          <div className="hx-hero-rule" />

          <p className="hx-hero-p">
            {copy.home.hero.body}
          </p>
          <div className="hx-hero-pillrow">
            <span className="hx-hero-pill">{copy.home.hero.intent}</span>
          </div>

          <div className="hx-hero-btns">
            <Link to="/rentals" className="hx-hbtn prim">{copy.home.hero.rent}</Link>
            <Link to="/cars"    className="hx-hbtn outl">{copy.home.hero.browseSale}</Link>
          </div>

          <div className="hx-hero-stats">
            {[
              { n: "12K", s: "+", l: copy.home.hero.statVehicles },
              { n: "5K",  s: "+", l: copy.home.hero.statUsers },
              { n: "99",  s: "%", l: copy.home.hero.statDeals },
            ].map((st, i) => (
              <div key={i}>
                <div className="hx-hstat-n">{st.n}<em>{st.s}</em></div>
                <div className="hx-hstat-l">{st.l}</div>
              </div>
            ))}
          </div>
          </div>

          {isDesktopHero && (
            <div className="hx-hero-right rv rv-r vis">
              <img
                src={HERO_IMG}
                alt={copy.home.hero.heroAlt}
                className="hx-hero-img"
                fetchPriority="high"
                loading="eager"
                decoding="async"
                width={960}
                height={640}
              />
              <div className="hx-hero-veil" />
            </div>
          )}
        </div>

        <div className="hx-scroll-ind" aria-hidden="true">
          <div className="hx-scroll-bar" />
          <span>{copy.home.hero.scroll}</span>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div className="hx-marquee" aria-hidden="true">
        <div className="hx-mtrack">
          {[...copy.home.marquee, ...copy.home.marquee].map((t, i) => (
            <span key={i} className="hx-mitem">
              <span className="hx-mdot" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ LIVE SHOWCASE — SALES ═══ */}
      <section className="hx-vault">
        <div className="hx-vault-head rv rv-u vis">
          <div className="hx-ey">{copy.home.showcase.eyebrow}</div>
          <h2 className="hx-h2">
            {copy.home.showcase.title1} <em>{copy.home.showcase.title2}</em>
          </h2>
          <p className="hx-h2-sub hx-vault-sub">{copy.home.showcase.sub}</p>
        </div>

        <div className="hx-vault-band">
          <div className="hx-vault-band-h">
            <span className="hx-vtag hx-vtag-sale">{copy.home.showcase.forSale}</span>
            <Link to="/cars" className="hx-vault-all">{copy.home.showcase.viewAllSale} →</Link>
          </div>
          <div className="hx-vrail-wrap">
            <div className="hx-vrail">
              {liveLoading && (
                <div className="hx-vskel-wrap">
                  {[1, 2, 3, 4].map((k) => (
                    <div key={k} className="hx-vskel" />
                  ))}
                </div>
              )}
              {!liveLoading &&
                liveSales.map((c) => {
                  const img = c.images?.[0];
                  const title = c.title || `${c.brand || ""} ${c.model || ""}`.trim() || "—";
                  const subtitle = [c.brand, c.model].filter(Boolean).join(" · ");
                  const price = c.price != null ? `${Number(c.price).toLocaleString()} ${copy.home.showcase.mad}` : "—";
                  return (
                    <Link key={c._id} to={`/cars/${c._id}`} className="hx-vcard hx-vcard-sale">
                      <div className="hx-vcard-img-wrap">
                        {c.year && <span className="hx-vcard-badge">{c.year}</span>}
                        {img ? (
                          <img src={img} alt="" className="hx-vcard-img" loading="lazy" decoding="async" />
                        ) : (
                          <div className="hx-vcard-ph">{ICON.car}</div>
                        )}
                        <span className="hx-vcard-shade" />
                      </div>
                      <div className="hx-vcard-body">
                        <div className="hx-vcard-city">{ICON.pin}{c.city || "—"}</div>
                        <h3 className="hx-vcard-title">{title}</h3>
                        {subtitle && title !== subtitle && <p className="hx-vcard-sub">{subtitle}</p>}
                        <div className="hx-vcard-meta">
                          {c.year && <span className="hx-vcard-tag">{c.year}</span>}
                          {c.fuel && <span className="hx-vcard-tag">{c.fuel}</span>}
                          {c.gearbox && <span className="hx-vcard-tag">{c.gearbox}</span>}
                          {c.mileage != null && (
                            <span className="hx-vcard-tag">{Number(c.mileage).toLocaleString()} km</span>
                          )}
                        </div>
                        <div className="hx-vcard-foot">
                          <div className="hx-vcard-price">{price}</div>
                          <span className="hx-vcard-cta">{copy.home.showcase.view} →</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              {!liveLoading && liveSales.length === 0 && (
                <p className="hx-vault-empty">{copy.home.showcase.emptySale}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ RENTALS SHOWCASE ═══ */}
      <section className="hx-vault hx-vault--rent">
        <div className="hx-vault-band hx-vault-band-rent">
          <div className="hx-vault-band-h">
            <span className="hx-vtag hx-vtag-rent">{copy.home.showcase.forRent}</span>
            <Link to="/rentals" className="hx-vault-all">{copy.home.showcase.viewAllRent} →</Link>
          </div>
          <div className="hx-vrail-wrap">
            <div className="hx-vrail">
              {liveLoading && (
                <div className="hx-vskel-wrap">
                  {[1, 2, 3, 4].map((k) => (
                    <div key={`r-${k}`} className="hx-vskel hx-vskel-rent" />
                  ))}
                </div>
              )}
              {!liveLoading &&
                liveRentals.map((r) => {
                  const img = r.images?.[0];
                  const title = r.title || `${r.brand || ""} ${r.model || ""}`.trim() || "—";
                  const subtitle = [r.brand, r.model].filter(Boolean).join(" · ");
                  const ppd = r.pricePerDay != null ? `${Number(r.pricePerDay).toLocaleString()} ${copy.home.showcase.mad}${copy.home.showcase.perDay}` : "—";
                  return (
                    <Link key={r._id} to={`/rentals/${r._id}`} className="hx-vcard hx-vcard-rent">
                      <div className="hx-vcard-img-wrap">
                        {r.year && <span className="hx-vcard-badge hx-vcard-badge-rent">{r.year}</span>}
                        {img ? (
                          <img src={img} alt="" className="hx-vcard-img" loading="lazy" decoding="async" />
                        ) : (
                          <div className="hx-vcard-ph">{ICON.car}</div>
                        )}
                        <span className="hx-vcard-shade" />
                      </div>
                      <div className="hx-vcard-body">
                        <div className="hx-vcard-city">{ICON.pin}{r.city || "—"}</div>
                        <h3 className="hx-vcard-title">{title}</h3>
                        {subtitle && title !== subtitle && <p className="hx-vcard-sub">{subtitle}</p>}
                        <div className="hx-vcard-meta">
                          {r.year && <span className="hx-vcard-tag">{r.year}</span>}
                          {r.fuel && <span className="hx-vcard-tag">{r.fuel}</span>}
                          {r.gearbox && <span className="hx-vcard-tag">{r.gearbox}</span>}
                        </div>
                        <div className="hx-vcard-foot">
                          <div className="hx-vcard-price hx-vcard-price-rent">{ppd}</div>
                          <span className="hx-vcard-cta">{copy.home.showcase.view} →</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              {!liveLoading && liveRentals.length === 0 && (
                <p className="hx-vault-empty">{copy.home.showcase.emptyRent}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ APP — title + banner + store badges ═══ */}
      <section className="hx-app">
        <div className="hx-app-grid">
          <div className="rv rv-l vis">
            <HomeMobilePitch
              className="hx-mobile-pitch--app"
              badge={copy.home.app.eyebrow}
              title1={copy.home.app.title1}
              titleEm={copy.home.app.title2}
              tagline={copy.home.app.sub}
            />
            <div className="hx-app-copy-desktop">
              <div className="hx-ey">{copy.home.app.eyebrow}</div>
              <h2 className="hx-h2">{copy.home.app.title1} <em>{copy.home.app.title2}</em></h2>
              <p className="hx-h2-sub" style={{ maxWidth: 560 }}>
                {copy.home.app.sub}
              </p>
            </div>
            <div className="hx-hero-btns hx-app-btns">
              <button className="hx-hbtn prim" type="button">{copy.home.app.download}</button>
              <Link to="/register" className="hx-hbtn outl">{copy.home.app.waitlist}</Link>
            </div>
          </div>
          <div className="hx-app-visual rv rv-r vis">
            <AppPhoneShowcase />
            <AppStoreBadges
              appStoreSmall={copy.home.app.appStoreSmall}
              appStoreBig={copy.home.app.appStoreBig}
              playStoreSmall={copy.home.app.playStoreSmall}
              playStoreBig={copy.home.app.playStoreBig}
            />
          </div>
        </div>
      </section>

      {/* ═══ MON GARAGE — title + banner ═══ */}
      <section className="hx-gfeat" aria-label={copy.home.garage.aria}>
        <HomeMobilePitch
          className="hx-mobile-pitch--garage"
          badge={copy.home.garage.badge}
          title1={copy.home.garage.title1}
          titleEm={copy.home.garage.title2}
          tagline={copy.home.garage.title3}
        />
        <div className="hx-gfeat-copy rv rv-u vis">
          <div className="hx-gfeat-badge">{copy.home.garage.badge}</div>
          <h2 className="hx-gfeat-title">
            {copy.home.garage.title1} <em>{copy.home.garage.title2}</em>
          </h2>
          <p className="hx-gfeat-tagline">{copy.home.garage.title3}</p>
          <p className="hx-gfeat-sub">{copy.home.garage.sub}</p>
          <div className="hx-gfeat-feats">
            {copy.home.garage.feats.map((f, i) => (
              <div key={i} className="hx-gfeat-feat">
                <strong>{f.label}</strong>
                <span>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
        <GarageFeatureShowcase className="rv rv-u vis" />
        <div className="hx-gfeat-actions rv rv-u vis" style={{ transitionDelay: "0.08s" }}>
          {auth ? (
            <Link to="/garage" className="hx-hbtn prim">{copy.home.garage.cta}</Link>
          ) : (
            <Link to="/register" className="hx-hbtn prim">{copy.home.garage.ctaGuest}</Link>
          )}
        </div>
      </section>

      {/* ═══════════════════════
          SERVICES — MAIN FOCUS
      ═══════════════════════ */}
      <div className="hx-svc-wrap">
        <div className="hx-svc-header">
          <div ref={svcHdrRef} className="rv rv-u">
            <div className="hx-ey">{copy.home.services.eyebrow}</div>
            <h2 className="hx-h2">{copy.home.services.title1}<br/><em>{copy.home.services.title2}</em></h2>
          </div>
          <p className="hx-h2-sub" style={{ maxWidth: 280, textAlign: "right" }}>
            {copy.home.services.sub}
          </p>
        </div>

        <div className="hx-svc-grid">

          {/* ── RENT ── */}
          <div ref={rentRef} className="hx-svc rent rv rv-l">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=70&auto=format&fit=crop&fm=webp"
              alt={copy.home.services.rentAlt}
              className="hx-svc-img"
              loading="lazy"
            />
            <div className="hx-svc-veil" />
            <div className="hx-svc-num" aria-hidden="true">01</div>
            <div className="hx-svc-body">
              <div>
                <div className="hx-svc-tag">{copy.home.services.rentTag}</div>
                <div className="hx-svc-title">{copy.home.services.rentTitle}</div>
                <p className="hx-svc-desc">
                  {copy.home.services.rentDesc}
                </p>
              </div>
              <div>
                <div className="hx-svc-feats">
                  {copy.home.services.rentFeats.map((f, i) => (
                    <div key={i} className="hx-svc-feat">{f}</div>
                  ))}
                </div>
                <Link to="/rentals" className="hx-svc-btn">
                  {copy.home.services.rentCta} <span className="hx-svc-arr">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── SELL ── */}
          <div ref={sellRef} className="hx-svc sell rv rv-r">
            <img
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=70&auto=format&fit=crop&fm=webp"
              alt={copy.home.services.sellAlt}
              className="hx-svc-img"
              loading="lazy"
            />
            <div className="hx-svc-veil" />
            <div className="hx-svc-num" aria-hidden="true">02</div>
            <div className="hx-svc-body">
              <div>
                <div className="hx-svc-tag">{copy.home.services.sellTag}</div>
                <div className="hx-svc-title">{copy.home.services.sellTitle}</div>
                <p className="hx-svc-desc">
                  {copy.home.services.sellDesc}
                </p>
              </div>
              <div>
                <div className="hx-svc-feats">
                  {copy.home.services.sellFeats.map((f, i) => (
                    <div key={i} className="hx-svc-feat">{f}</div>
                  ))}
                </div>
                <Link to="/cars" className="hx-svc-btn">
                  {copy.home.services.sellCta} <span className="hx-svc-arr">→</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ ELITE BENEFITS ═══ */}
      <section className="hx-ben-sec">
        <div className="hx-wrap">
          <div className="rv rv-u vis">
            <div className="hx-ey">{copy.home.benefits.eyebrow}</div>
            <h2 className="hx-h2">{copy.home.benefits.title1} <em>{copy.home.benefits.title2}</em></h2>
          </div>
        </div>
        <div className="hx-ben-grid">
          {copy.home.benefits.items.map((b, i) => (
            <BenefitItem
              key={b.title}
              icon={[ICON.shield, ICON.card, ICON.calendar, ICON.search, ICON.support][i]}
              title={b.title}
              desc={b.desc}
              delay={`${i * 0.06}s`}
            />
          ))}
        </div>
      </section>

      {/* ═══ EXPERIENCE STORY ═══ */}
      <section className="hx-exp rv rv-s vis">
        <img
          src="https://images.unsplash.com/photo-1494905998402-395d579af36f?w=1200&q=70&auto=format&fit=crop&fm=webp"
          alt={copy.home.experience.alt}
          className="hx-exp-img"
          loading="lazy"
          decoding="async"
        />
        <div className="hx-exp-body">
          <div className="hx-ey" style={{ color: "#b7c5ff" }}>{copy.home.experience.eyebrow}</div>
          <h3>{copy.home.experience.title}</h3>
          <p>
            {copy.home.experience.body}
          </p>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <div className="hx-how-wrap">
        <div className="hx-wrap hx-sec hx-sec-sm">
          <div ref={howHdrRef} className="rv rv-u">
            <div className="hx-ey">{copy.home.how.eyebrow}</div>
            <h2 className="hx-h2">{copy.home.how.title1} <em>{copy.home.how.title2}</em></h2>
          </div>
          <div className="hx-how-grid">
            <HowItem n={copy.home.how.steps[0].n} icon={ICON.search} title={copy.home.how.steps[0].title}
              desc={copy.home.how.steps[0].desc}
              delay="0s" />
            <HowItem n={copy.home.how.steps[1].n} icon={ICON.clipboard} title={copy.home.how.steps[1].title}
              desc={copy.home.how.steps[1].desc}
              delay="0.1s" />
            <HowItem n={copy.home.how.steps[2].n} icon={ICON.car} title={copy.home.how.steps[2].title}
              desc={copy.home.how.steps[2].desc}
              delay="0.2s" />
          </div>
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <div className="hx-stats">
        <div className="hx-stats-inner" ref={statsRef}>
          <CounterItem to={12} suffix="K+" label={copy.home.stats.cars} delay="0s" />
          <CounterItem to={8} suffix="K+" label={copy.home.stats.clients} delay="0.08s" />
          <CounterItem to={24} suffix="+" label={copy.home.stats.cities} delay="0.16s" />
          <CounterItem to={99} suffix="%" label={copy.home.stats.satisfaction} delay="0.24s" />
        </div>
      </div>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="hx-tsec">
        <div className="hx-wrap">
          <div className="rv rv-u vis">
            <div className="hx-ey">{copy.home.testimonials.eyebrow}</div>
            <h2 className="hx-h2">{copy.home.testimonials.title1} <em>{copy.home.testimonials.title2}</em></h2>
          </div>
        </div>
        <div className="hx-tgrid">
          {copy.home.testimonials.items.map((item, i) => (
            <TestimonialCard key={item.name} item={item} delay={`${i * 0.08}s`} />
          ))}
        </div>
      </section>

      {/* ═══ SECURITY & TRUST ═══ */}
      <section className="hx-trust">
        <div className="hx-wrap">
          <div className="rv rv-u vis">
            <div className="hx-ey">{copy.home.trust.eyebrow}</div>
            <h2 className="hx-h2">{copy.home.trust.title1} <em>{copy.home.trust.title2}</em></h2>
            <p className="hx-h2-sub">{copy.home.trust.sub}</p>
          </div>
        </div>
        <div className="hx-tr-grid">
          <article className="hx-tr rv rv-u vis">
            <div className="hx-ben-ico">{ICON.shield}</div>
            <h4>{copy.home.trust.cards[0].title}</h4>
            <p>{copy.home.trust.cards[0].desc}</p>
          </article>
          <article className="hx-tr rv rv-u vis">
            <div className="hx-ben-ico">{ICON.search}</div>
            <h4>{copy.home.trust.cards[1].title}</h4>
            <p>{copy.home.trust.cards[1].desc}</p>
          </article>
          <article className="hx-tr rv rv-u vis">
            <div className="hx-ben-ico">{ICON.card}</div>
            <h4>{copy.home.trust.cards[2].title}</h4>
            <p>{copy.home.trust.cards[2].desc}</p>
          </article>
        </div>
      </section>

      {/* ═══ DASHBOARD / AUTH CTA ═══ */}
      <div className="hx-dash-sec">
        <div ref={dashRef} className="hx-dash-card rv rv-s">
          {auth ? (
            <>
              <div className="hx-dash-top">
                <div>
                  <p className="hx-dash-gr">{copy.home.dash.welcome}</p>
                  <p className="hx-dash-name">{auth.name}</p>
                  <span className="hx-dash-badge">{role}</span>
                </div>
                <button onClick={logout} className="hx-logout">{copy.home.dash.logout}</button>
              </div>
              <div className="hx-acts">
                {isCust  && <><ActionCard to="/rentals"/><ActionCard to="/my-bookings"/><ActionCard to="/cars"/></>}
                {isOwner && <><ActionCard to="/rentals"/><ActionCard to="/owner-bookings"/><ActionCard to="/add-rental"/></>}
                {isSell  && <><ActionCard to="/my-sales"/><ActionCard to="/my-sales/new"/></>}
                {isAdmin && <ActionCard to="/admin" isAdmin />}
              </div>
            </>
          ) : (
            <div className="hx-auth">
              <div>
                <h3 className="hx-auth-h3">{copy.home.auth.title1}<br/><em>{copy.home.auth.title2}</em></h3>
                <p className="hx-auth-p">
                  {copy.home.auth.body}
                </p>
                <div className="hx-auth-btns">
                  <Link to="/register" className="hx-npill sl">{copy.home.auth.create}</Link>
                  <Link to="/login"    className="hx-npill gh">{copy.home.auth.signIn}</Link>
                </div>
              </div>
              <div className="hx-auth-feats">
                {copy.home.auth.feats.map((f, i) => (
                  <div key={i} className="hx-auth-feat">
                    <span className="hx-auth-fdot" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ FINAL CONVERSION CTA ═══ */}
      <section className="hx-final rv rv-s vis">
        <div>
          <h3>
            {copy.home.final.title.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </h3>
          <p>{copy.home.final.sub}</p>
        </div>
        <div className="hx-final-btns">
          <Link to="/rentals" className="hx-hbtn prim">{copy.home.final.rent}</Link>
          <Link to="/my-sales/new" className="hx-hbtn outl">{copy.home.final.sell}</Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      {/* ═══ SEO: FAQ + city links ═══ */}
      <HomeFaqSection />
      <SeoContentBlock />
      <SeoFooter />
      <footer className="hx-ft">
        <div className="hx-ft-inner">
          <div className="hx-ft-top">
            <div>
              <div className="hx-ft-logo">Goo<em>voiture</em></div>
              <p className="hx-ft-tag">
                {copy.home.footer.tag}
              </p>
            </div>
            <div>
              <p className="hx-ft-ch">{copy.home.footer.platform}</p>
              <Link to="/cars"    className="hx-ft-link">{copy.home.footer.buyCars}</Link>
              <Link to="/rentals" className="hx-ft-link">{copy.home.footer.rentCars}</Link>
              <Link to="/vendre-ma-voiture" className="hx-ft-link">{lang === "fr" ? "Vendre ma voiture" : lang === "ar" ? "بيع سيارتي" : "Sell my car"}</Link>
              <Link to="/login"   className="hx-ft-link">{copy.home.footer.signIn}</Link>
            </div>
            <div>
              <p className="hx-ft-ch">{copy.home.footer.account}</p>
              <Link to="/register" className="hx-ft-link">{copy.home.footer.register}</Link>
              <Link to="/login"    className="hx-ft-link">{copy.home.footer.login}</Link>
            </div>
            <div>
              <p className="hx-ft-ch">{copy.home.footer.legal}</p>
              <Link to={buildSeoPath(lang, "/conditions-utilisation")} className="hx-ft-link">{copy.home.footer.terms}</Link>
              <Link to={buildSeoPath(lang, "/politique-confidentialite")} className="hx-ft-link">{copy.home.footer.privacy}</Link>
            </div>
          </div>
          <div className="hx-ft-bot">
            <span>© {new Date().getFullYear()} <em>Goovoiture</em> — {copy.home.footer.copy}</span>
            <span>{copy.home.footer.built}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomeInner;
