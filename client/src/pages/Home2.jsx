import { Link } from "react-router-dom";
import { loadAuth, clearAuth } from "../utils/authStorage";
import { useState, useEffect, useRef } from "react";
import { useAppLang } from "../context/AppLangContext";

/* ──────────────────────────────────────────────
   Scroll reveal — IntersectionObserver, no lib
   Adds "vis" class once element enters viewport
────────────────────────────────────────────── */
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

function FeaturedCard({ item, delay = "0s" }) {
  const ref = useReveal(0.08);
  const { copy } = useAppLang();
  return (
    <article ref={ref} className="hx-fc rv rv-u" style={{ transitionDelay: delay }}>
      <img src={item.img} alt={item.name} className="hx-fc-img" loading="lazy" decoding="async" />
      <div className="hx-fc-top">
        <span className="hx-fc-badge">{item.badge}</span>
        <span className="hx-fc-loc">{item.city}</span>
      </div>
      <div className="hx-fc-body">
        <h3>{item.name}</h3>
        <p>{item.price}</p>
        <Link to="/cars" className="hx-fc-btn">{copy.home.featured.viewDetails}</Link>
      </div>
    </article>
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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

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
  opacity:0;transition:opacity 1.2s ease, transform 1.4s ease;
  will-change:opacity,transform;
  transform:scale(1.03);
}
.hx-hero-img.ldd{opacity:1;transform:scale(1);}

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

/* ════ MARQUEE ════ */
.hx-marquee {
  overflow:hidden;
  background:var(--ink);
  padding:15px 0;
  transition:background .4s;
}
.hx.dark .hx-marquee{background:var(--sur);}
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

/* ════ APP & FINAL CTA ════ */
.hx-app{padding:92px 64px;background:var(--bg);}
.hx-app-grid{
  max-width:1280px;margin:0 auto;display:grid;grid-template-columns:1.1fr .9fr;
  gap:26px;align-items:center;
}
.hx-phone{
  justify-self:end;width:min(320px,100%);height:560px;border-radius:34px;
  border:1px solid var(--bdr2);background:linear-gradient(180deg,var(--sur2),var(--sur));
  padding:12px;box-shadow:0 22px 54px rgba(7,14,45,.14);
}
.hx-phone-in{
  width:100%;height:100%;border-radius:24px;padding:18px;
  background:linear-gradient(155deg,#121a3f,#1b2a63 55%,#2e3f86);color:#dce4ff;
  display:flex;flex-direction:column;gap:14px;
}
.hx-phone-top{font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.8;}
.hx-phone-card{padding:14px;border-radius:12px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);}
.hx-phone-card strong{display:block;font-size:14px;margin-bottom:6px;}
.hx-phone-card span{font-size:12px;opacity:.85;}

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
.hx-ft{background:var(--ink);padding:72px 64px 32px;transition:background .4s;}
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
  .hx-fsec,.hx-ben-sec,.hx-tsec,.hx-trust,.hx-app{padding-left:40px;padding-right:40px;}
  .hx-frail{grid-template-columns:repeat(2,1fr);}
  .hx-ben-grid{grid-template-columns:repeat(3,1fr);}
  .hx-tgrid,.hx-tr-grid{grid-template-columns:repeat(2,1fr);}
  .hx-exp{margin:70px 40px;min-height:440px;}
  .hx-app-grid{grid-template-columns:1fr;}
  .hx-phone{justify-self:start;}
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
  .hx-hero{padding:92px 24px 36px;min-height:auto;}
  .hx-hero-inner{max-width:100%;}
  .hx-hero-right{min-height:340px;border-radius:18px;}
  .hx-hero-stats{gap:20px;flex-wrap:wrap;}
  .hx-hero-btns{flex-direction:column;}
  .hx-hbtn{justify-content:center;}
  .hx-svc-header{padding:48px 24px 0;flex-direction:column;align-items:flex-start;}
  .hx-svc-header .hx-h2-sub{text-align:left !important;max-width:100% !important;}
  .hx-svc-grid{grid-template-columns:1fr;padding:32px 24px 48px;}
  .hx-svc{height:440px;}
  .hx-svc-num{font-size:130px;}
  .hx-sec{padding:64px 24px;}
  .hx-sec-sm{padding:48px 24px;}
  .hx-how-grid{grid-template-columns:1fr;}
  .hx-how-cell{border-right:none;border-bottom:1px solid var(--bdr);}
  .hx-how-cell:last-child{border-bottom:none;}
  .hx-stats{padding:48px 24px;}
  .hx-stats-inner{grid-template-columns:1fr 1fr;gap:28px;}
  .hx-stat-n{font-size:40px;}
  .hx-dash-sec{padding:64px 24px;}
  .hx-fsec,.hx-ben-sec,.hx-tsec,.hx-trust,.hx-app{padding-left:24px;padding-right:24px;}
  .hx-frail,.hx-ben-grid,.hx-tgrid,.hx-tr-grid{grid-template-columns:1fr;}
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
}
@media(max-width:480px){
  .hx-lang button{padding:6px 8px;font-size:9px;}
  .hx-npill.sl{display:none;}
  .hx-hero-h1{font-size:42px;}
  .hx-hero-p{font-size:15px;line-height:1.75;}
  .hx-hero-right{min-height:300px;}
  .hx-svc{height:390px;}
  .hx-svc-title{font-size:52px;}
  .hx-svc-body{padding:28px;}
  .hx-phone{height:500px;}
  .hx-stats-inner{grid-template-columns:1fr;}
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
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("home2-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  });
  const [menu, setMenu] = useState(false);

  const heroImgRef   = useRef(null);
  const svcHdrRef    = useReveal(0.08);
  const rentRef      = useReveal(0.08);
  const sellRef      = useReveal(0.08);
  const howHdrRef    = useReveal(0.08);
  const statsRef     = useReveal(0.1);
  const dashRef      = useReveal(0.08);

  // Lazy-load hero image with fade-in
  useEffect(() => {
    const img = new Image();
    img.src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=80&auto=format&fit=crop";
    img.onload = () => { if (heroImgRef.current) heroImgRef.current.classList.add("ldd"); };
  }, []);
  useEffect(() => {
    localStorage.setItem("home2-theme", dark ? "dark" : "light");
  }, [dark]);

  function logout() { clearAuth(); setAuth(null); }

  const role    = (auth?.role || "").toLowerCase();
  const isCust  = role === "customer";
  const isOwner = role === "rental_owner";
  const isSell  = role === "seller";
  const isAdmin = role === "admin";

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
          <div className="hx-lang" role="group" aria-label="Language">
            <button
              type="button"
              className={lang === "fr" ? "on" : ""}
              onClick={() => setLang("fr")}
              aria-pressed={lang === "fr"}
            >
              FR
            </button>
            <button
              type="button"
              className={lang === "en" ? "on" : ""}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
          {auth ? (
            <button onClick={logout} className="hx-npill gh">{copy.home.nav.logout}</button>
          ) : (
            <>
              <Link to="/login"    className="hx-npill gh">{copy.home.nav.login}</Link>
              <Link to="/register" className="hx-npill sl">{copy.home.nav.getStarted}</Link>
            </>
          )}
          <button
            className="hx-theme"
            onClick={() => setDark(d => !d)}
            aria-label={dark ? copy.home.nav.themeLight : copy.home.nav.themeDark}
          >
            {dark ? "☀" : "☾"}
          </button>
          <button className="hx-burger" onClick={() => setMenu(m => !m)} aria-label={copy.home.nav.menu}>
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`hx-drawer${menu ? " open" : ""}`}>
        <Link to="/cars"    className="hx-dlink" onClick={() => setMenu(false)}>{copy.home.drawer.buyCars}</Link>
        <Link to="/rentals" className="hx-dlink" onClick={() => setMenu(false)}>{copy.home.drawer.rentCar}</Link>
        {auth
          ? <button onClick={() => { logout(); setMenu(false); }} className="hx-dlink">{copy.home.drawer.logout}</button>
          : <>
              <Link to="/login"    className="hx-dlink" onClick={() => setMenu(false)}>{copy.home.drawer.login}</Link>
              <Link to="/register" className="hx-dlink" onClick={() => setMenu(false)}>{copy.home.drawer.getStarted}</Link>
            </>
        }
      </div>

      {/* ═══ HERO ═══ */}
      <section className="hx-hero">
        <div className="hx-hero-inner">
          <div className="hx-hero-left">
          <div className="hx-hero-kicker">{copy.home.hero.kicker}</div>

          <h1 className="hx-hero-h1">
            {copy.home.hero.line1}<br/>
            {copy.home.hero.line2}<br/>
            <em>{copy.home.hero.line3}</em>
          </h1>

          <div className="hx-hero-rule" />

          <p className="hx-hero-p">
            {copy.home.hero.body}
          </p>

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

          <div className="hx-hero-right rv rv-r vis">
            <img
              ref={heroImgRef}
              src="https://images.unsplash.com/photo-1549924231-f129b911e442?w=1400&q=82&auto=format&fit=crop"
              alt={copy.home.hero.heroAlt}
              className="hx-hero-img"
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
            <div className="hx-hero-veil" />
          </div>
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
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=75&auto=format&fit=crop"
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
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=75&auto=format&fit=crop"
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

      {/* ═══ FEATURED LUXURY CARS ═══ */}
      <section className="hx-fsec">
        <div className="hx-fhead rv rv-u vis">
          <div className="hx-ey">{copy.home.featured.eyebrow}</div>
          <h2 className="hx-h2">{copy.home.featured.title1} <em>{copy.home.featured.title2}</em></h2>
          <p className="hx-h2-sub">{copy.home.featured.sub}</p>
        </div>
        <div className="hx-frail">
          {copy.home.featuredCars.map((item, i) => (
            <FeaturedCard key={item.name} item={item} delay={`${i * 0.08}s`} />
          ))}
        </div>
      </section>

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
          src="https://images.unsplash.com/photo-1494905998402-395d579af36f?w=1800&q=75&auto=format&fit=crop"
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

      {/* ═══ APP / COMING SOON ═══ */}
      <section className="hx-app">
        <div className="hx-app-grid">
          <div className="rv rv-l vis">
            <div className="hx-ey">{copy.home.app.eyebrow}</div>
            <h2 className="hx-h2">{copy.home.app.title1} <em>{copy.home.app.title2}</em></h2>
            <p className="hx-h2-sub" style={{ maxWidth: 560 }}>
              {copy.home.app.sub}
            </p>
            <div className="hx-hero-btns" style={{ marginTop: 24 }}>
              <button className="hx-hbtn prim" type="button">{copy.home.app.download}</button>
              <Link to="/register" className="hx-hbtn outl">{copy.home.app.waitlist}</Link>
            </div>
          </div>
          <div className="hx-phone rv rv-r vis">
            <div className="hx-phone-in">
              <div className="hx-phone-top">{copy.home.app.phoneTitle}</div>
              {copy.home.app.phoneCards.map((c, i) => (
                <div key={i} className="hx-phone-card"><strong>{c.strong}</strong><span>{c.span}</span></div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
              <Link to="/login"   className="hx-ft-link">{copy.home.footer.signIn}</Link>
            </div>
            <div>
              <p className="hx-ft-ch">{copy.home.footer.account}</p>
              <Link to="/register" className="hx-ft-link">{copy.home.footer.register}</Link>
              <Link to="/login"    className="hx-ft-link">{copy.home.footer.login}</Link>
            </div>
            <div>
              <p className="hx-ft-ch">{copy.home.footer.legal}</p>
              <span className="hx-ft-link" style={{cursor:"default"}}>{copy.home.footer.terms}</span>
              <span className="hx-ft-link" style={{cursor:"default"}}>{copy.home.footer.privacy}</span>
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
