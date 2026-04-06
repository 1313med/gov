import { Link } from "react-router-dom";
import { loadAuth, clearAuth } from "../utils/authStorage";
import { useState, useEffect, useRef } from "react";

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

const ACTS = {
  "/rentals":        { icon: "🚗", label: "Rent a Car" },
  "/my-bookings":    { icon: "📅", label: "My Bookings" },
  "/cars":           { icon: "🔍", label: "Buy a Car" },
  "/owner-bookings": { icon: "📋", label: "Rental Bookings" },
  "/add-rental":     { icon: "➕", label: "Add Rental Car" },
  "/my-sales":       { icon: "💰", label: "My Sales" },
  "/my-sales/new":   { icon: "🚀", label: "Add Car for Sale" },
  "/admin":          { icon: "⚙️", label: "Admin Dashboard" },
};
function ActionCard({ to, isAdmin }) {
  const { icon, label } = ACTS[to] || { icon: "→", label: to };
  return (
    <Link to={to} className={`hx-act${isAdmin ? " hx-act-admin" : ""}`}>
      <div className="hx-act-ico">{icon}</div>
      <span className="hx-act-lbl">{label}</span>
      <span className="hx-act-arr">Open →</span>
    </Link>
  );
}

const STRIP = [
  "Verified Listings","Secure Payments","Premium Fleet",
  "Instant Booking","Trusted Sellers","Zero Hidden Fees",
  "Elite Service","Admin Moderated",
];

/* ──────────────────────────────────────────────
   CSS
────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300;1,600;1,700&family=Space+Grotesk:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
img{display:block;max-width:100%;}a{text-decoration:none;}

/* ════ TOKENS — Light ════ */
.hx {
  --bg:       #f8f6f1;
  --bg2:      #efede6;
  --sur:      #ffffff;
  --sur2:     #f3f0e9;
  --bdr:      rgba(0,0,0,0.08);
  --bdr2:     rgba(0,0,0,0.13);
  --ink:      #0e0d0a;
  --ink2:     #2a2925;
  --mut:      #7a7870;
  --fnt:      #b8b5ac;
  --gold:     #b8912a;
  --gold2:    #d4af50;
  --gbg:      rgba(184,145,42,0.08);
  --gbd:      rgba(184,145,42,0.22);
  --nav:      rgba(248,246,241,0.9);
  --disp:     'Cormorant Garamond',Georgia,serif;
  --body:     'Space Grotesk',system-ui,sans-serif;
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
  --bg:       #09090e;
  --bg2:      #0d0d16;
  --sur:      #111119;
  --sur2:     #16161f;
  --bdr:      rgba(255,255,255,0.07);
  --bdr2:     rgba(255,255,255,0.12);
  --ink:      #f0eff8;
  --ink2:     #c8c7d4;
  --mut:      #5a5968;
  --fnt:      #383748;
  --gold:     #d4a840;
  --gold2:    #f0c868;
  --gbg:      rgba(212,168,64,0.10);
  --gbd:      rgba(212,168,64,0.25);
  --nav:      rgba(9,9,14,0.92);
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
  position:relative;min-height:100vh;
  display:flex;align-items:center;
  padding-top:64px;overflow:hidden;
}
.hx-hero-img {
  position:absolute;inset:0;z-index:0;
  width:100%;height:100%;object-fit:cover;object-position:center 35%;
  opacity:0;transition:opacity 1.4s ease;
  will-change:opacity;
}
.hx-hero-img.ldd{opacity:1;}

.hx-hero-veil {
  position:absolute;inset:0;z-index:1;
  background:
    linear-gradient(to right,
      rgba(248,246,241,.97) 0%,
      rgba(248,246,241,.88) 38%,
      rgba(248,246,241,.35) 65%,
      transparent 100%
    ),
    linear-gradient(to top,
      rgba(248,246,241,.6) 0%,
      transparent 40%
    );
  transition:background .4s;
}
.hx.dark .hx-hero-veil {
  background:
    linear-gradient(to right,
      rgba(9,9,14,.97) 0%,
      rgba(9,9,14,.88) 38%,
      rgba(9,9,14,.35) 65%,
      transparent 100%
    ),
    linear-gradient(to top,
      rgba(9,9,14,.6) 0%,
      transparent 40%
    );
}

.hx-hero-inner {
  position:relative;z-index:2;
  padding:0 64px;max-width:680px;
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
  font-size:clamp(64px,9vw,120px);
  line-height:.88;letter-spacing:-.045em;
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
  font-size:16px;font-weight:300;line-height:1.8;
  color:var(--mut);max-width:360px;margin-bottom:36px;
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
  background:var(--gold);border-color:var(--gold);color:#000;
  transform:translateY(-2px);box-shadow:0 10px 28px rgba(184,145,42,.3);
}
.hx-hbtn.outl {
  background:transparent;color:var(--ink);border:1px solid var(--bdr2);
}
.hx-hbtn.outl:hover{border-color:var(--gold);color:var(--gold);transform:translateY(-2px);}

.hx-hero-stats {
  display:flex;gap:32px;
  margin-top:48px;padding-top:32px;border-top:1px solid var(--bdr);
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
  position:absolute;bottom:36px;left:50%;transform:translateX(-50%);
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
  background:linear-gradient(155deg,rgba(5,22,14,.35) 0%,rgba(5,22,14,.92) 100%);
}
.hx-svc.sell .hx-svc-veil{
  background:linear-gradient(155deg,rgba(18,12,35,.35) 0%,rgba(18,12,35,.92) 100%);
}

/* Hover glow */
.hx-svc::after {
  content:'';position:absolute;inset:0;z-index:1;border-radius:22px;
  opacity:0;transition:opacity .4s;pointer-events:none;
}
.hx-svc.rent::after{box-shadow:inset 0 0 0 1.5px rgba(78,203,139,.4);}
.hx-svc.sell::after{box-shadow:inset 0 0 0 1.5px rgba(184,145,42,.4);}
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
.hx-svc.rent .hx-svc-tag::before{background:#4ecb8b;box-shadow:0 0 8px #4ecb8b;}
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
.hx-svc.rent .hx-svc-feat::before{background:#4ecb8b;}
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
  background:rgba(78,203,139,.14);
  border:1px solid rgba(78,203,139,.3);
  color:#4ecb8b;
}
.hx-svc.rent .hx-svc-btn:hover{background:#4ecb8b;color:#000;transform:translateX(4px);}
.hx-svc.sell .hx-svc-btn{
  background:var(--gbg);border:1px solid var(--gbd);color:var(--gold2);
}
.hx-svc.sell .hx-svc-btn:hover{background:var(--gold);color:#000;transform:translateX(4px);}
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
  display:flex;align-items:center;justify-content:center;font-size:18px;
}
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

/* ════ RESPONSIVE ════ */
@media(max-width:1024px){
  .hx-sec{padding:80px 40px;}
  .hx-sec-sm{padding:64px 40px;}
  .hx-hero-inner{padding:0 40px;}
  .hx-svc-header{padding:64px 40px 0;}
  .hx-svc-grid{padding:40px 40px 64px;gap:16px;}
  .hx-svc{height:500px;}
  .hx-stats{padding:56px 40px;}
  .hx-stats-inner{grid-template-columns:repeat(2,1fr);}
  .hx-stat-n{font-size:44px;}
  .hx-dash-sec{padding:80px 40px;}
  .hx-ft{padding:56px 40px 24px;}
  .hx-ft-top{grid-template-columns:1fr 1fr;}
  .hx-ft-top>div:first-child{grid-column:1/-1;}
}
@media(max-width:768px){
  .hx-nav{padding:0 20px;}
  .hx-nav-links{display:none;}
  .hx-npill.gh{display:none;}
  .hx-burger{display:flex;}
  .hx-hero-inner{padding:0 24px;max-width:100%;}
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
  .hx-npill.sl{display:none;}
  .hx-hero-h1{font-size:56px;}
  .hx-svc{height:390px;}
  .hx-svc-title{font-size:52px;}
  .hx-svc-body{padding:28px;}
  .hx-stats-inner{grid-template-columns:1fr;}
  .hx-auth-btns{flex-direction:column;}
  .hx-auth-btns a,.hx-auth-btns button{justify-content:center;}
}
`;

/* ═══════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════ */
export default function Home() {
  const [auth, setAuth] = useState(() => loadAuth());
  const [dark, setDark] = useState(false);
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
          <Link to="/cars"    className="hx-nav-link">Buy</Link>
          <Link to="/rentals" className="hx-nav-link">Rent</Link>
        </div>

        <div className="hx-nav-end">
          {auth ? (
            <button onClick={logout} className="hx-npill gh">Logout</button>
          ) : (
            <>
              <Link to="/login"    className="hx-npill gh">Login</Link>
              <Link to="/register" className="hx-npill sl">Get Started</Link>
            </>
          )}
          <button className="hx-theme" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
            {dark ? "☀" : "☾"}
          </button>
          <button className="hx-burger" onClick={() => setMenu(m => !m)} aria-label="Menu">
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`hx-drawer${menu ? " open" : ""}`}>
        <Link to="/cars"    className="hx-dlink" onClick={() => setMenu(false)}>Buy Cars</Link>
        <Link to="/rentals" className="hx-dlink" onClick={() => setMenu(false)}>Rent a Car</Link>
        {auth
          ? <button onClick={() => { logout(); setMenu(false); }} className="hx-dlink">Logout</button>
          : <>
              <Link to="/login"    className="hx-dlink" onClick={() => setMenu(false)}>Login</Link>
              <Link to="/register" className="hx-dlink" onClick={() => setMenu(false)}>Get Started</Link>
            </>
        }
      </div>

      {/* ═══ HERO ═══ */}
      <section className="hx-hero">
        <img
          ref={heroImgRef}
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=80&auto=format&fit=crop"
          alt=""
          className="hx-hero-img"
          fetchpriority="high"
        />
        <div className="hx-hero-veil" />

        <div className="hx-hero-inner">
          <div className="hx-hero-kicker">Algeria's Elite Car Marketplace</div>

          <h1 className="hx-hero-h1">
            Drive<br/>
            Your<br/>
            <em>Dream.</em>
          </h1>

          <div className="hx-hero-rule" />

          <p className="hx-hero-p">
            Verified vehicles. Trusted sellers. Instant booking.
            Buy or rent your perfect car — all in one place.
          </p>

          <div className="hx-hero-btns">
            <Link to="/rentals" className="hx-hbtn prim">Rent a Car</Link>
            <Link to="/cars"    className="hx-hbtn outl">Browse for Sale</Link>
          </div>

          <div className="hx-hero-stats">
            {[
              { n: "12K", s: "+", l: "Vehicles Listed"  },
              { n: "5K",  s: "+", l: "Happy Users"      },
              { n: "99",  s: "%", l: "Secure Deals"     },
            ].map((st, i) => (
              <div key={i}>
                <div className="hx-hstat-n">{st.n}<em>{st.s}</em></div>
                <div className="hx-hstat-l">{st.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hx-scroll-ind" aria-hidden="true">
          <div className="hx-scroll-bar" />
          <span>Scroll</span>
        </div>
      </section>

      {/* ═══ MARQUEE ═══ */}
      <div className="hx-marquee" aria-hidden="true">
        <div className="hx-mtrack">
          {[...STRIP, ...STRIP].map((t, i) => (
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
            <div className="hx-ey">Our Services</div>
            <h2 className="hx-h2">Two ways to<br/><em>own the road.</em></h2>
          </div>
          <p className="hx-h2-sub" style={{ maxWidth: 280, textAlign: "right" }}>
            Book for a weekend or find your forever car —
            we've built the platform for both.
          </p>
        </div>

        <div className="hx-svc-grid">

          {/* ── RENT ── */}
          <div ref={rentRef} className="hx-svc rent rv rv-l">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=75&auto=format&fit=crop"
              alt="Rent a Car"
              className="hx-svc-img"
              loading="lazy"
            />
            <div className="hx-svc-veil" />
            <div className="hx-svc-num" aria-hidden="true">01</div>
            <div className="hx-svc-body">
              <div>
                <div className="hx-svc-tag">Available Now</div>
                <div className="hx-svc-title">RENT</div>
                <p className="hx-svc-desc">
                  Premium fleet at your fingertips. Book by day, week, or month
                  with instant confirmation and fully transparent pricing.
                </p>
              </div>
              <div>
                <div className="hx-svc-feats">
                  {["Instant online booking", "Verified rental owners", "Flexible date ranges"].map((f, i) => (
                    <div key={i} className="hx-svc-feat">{f}</div>
                  ))}
                </div>
                <Link to="/rentals" className="hx-svc-btn">
                  Browse Rentals <span className="hx-svc-arr">→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── SELL ── */}
          <div ref={sellRef} className="hx-svc sell rv rv-r">
            <img
              src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=900&q=75&auto=format&fit=crop"
              alt="Buy or Sell a Car"
              className="hx-svc-img"
              loading="lazy"
            />
            <div className="hx-svc-veil" />
            <div className="hx-svc-num" aria-hidden="true">02</div>
            <div className="hx-svc-body">
              <div>
                <div className="hx-svc-tag">Verified Listings</div>
                <div className="hx-svc-title">SELL</div>
                <p className="hx-svc-desc">
                  List your vehicle to thousands of verified buyers.
                  Get the best price through our secure, admin-moderated marketplace.
                </p>
              </div>
              <div>
                <div className="hx-svc-feats">
                  {["Admin-approved listings", "Direct buyer contact", "Secure transactions"].map((f, i) => (
                    <div key={i} className="hx-svc-feat">{f}</div>
                  ))}
                </div>
                <Link to="/cars" className="hx-svc-btn">
                  Browse Cars <span className="hx-svc-arr">→</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ═══ HOW IT WORKS ═══ */}
      <div className="hx-how-wrap">
        <div className="hx-wrap hx-sec hx-sec-sm">
          <div ref={howHdrRef} className="rv rv-u">
            <div className="hx-ey">Process</div>
            <h2 className="hx-h2">How it <em>works.</em></h2>
          </div>
          <div className="hx-how-grid">
            <HowItem n="01" icon="🔍" title="Search"
              desc="Browse thousands of verified listings. Filter by brand, city, and price range to find your perfect match."
              delay="0s" />
            <HowItem n="02" icon="📋" title="Book or Buy"
              desc="Reserve a rental instantly or contact a verified seller directly through our secure, moderated platform."
              delay="0.1s" />
            <HowItem n="03" icon="🚗" title="Drive Away"
              desc="Pick up your car, complete the secure transaction, and hit the road with complete confidence."
              delay="0.2s" />
          </div>
        </div>
      </div>

      {/* ═══ STATS ═══ */}
      <div className="hx-stats">
        <div className="hx-stats-inner" ref={statsRef}>
          <StatItem n="12" sup="K+" label="Active Listings"    delay="0s"    />
          <StatItem n="5"  sup="K+" label="Registered Users"   delay="0.08s" />
          <StatItem n="48" sup="h"  label="Avg. Listing Review" delay="0.16s" />
          <StatItem n="99" sup="%"  label="Satisfaction Rate"  delay="0.24s" />
        </div>
      </div>

      {/* ═══ DASHBOARD / AUTH CTA ═══ */}
      <div className="hx-dash-sec">
        <div ref={dashRef} className="hx-dash-card rv rv-s">
          {auth ? (
            <>
              <div className="hx-dash-top">
                <div>
                  <p className="hx-dash-gr">Welcome back</p>
                  <p className="hx-dash-name">{auth.name}</p>
                  <span className="hx-dash-badge">{role}</span>
                </div>
                <button onClick={logout} className="hx-logout">Logout</button>
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
                <h3 className="hx-auth-h3">Your journey<br/><em>starts here.</em></h3>
                <p className="hx-auth-p">
                  Create a free account to buy, rent, or list your vehicle.
                  Join thousands of users already on Goovoiture.
                </p>
                <div className="hx-auth-btns">
                  <Link to="/register" className="hx-npill sl">Create Account</Link>
                  <Link to="/login"    className="hx-npill gh">Sign In</Link>
                </div>
              </div>
              <div className="hx-auth-feats">
                {[
                  "Verified listings only",
                  "Secure payment processing",
                  "Instant booking confirmation",
                  "24/7 customer support",
                  "Transparent pricing — no hidden fees",
                ].map((f, i) => (
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

      {/* ═══ FOOTER ═══ */}
      <footer className="hx-ft">
        <div className="hx-ft-inner">
          <div className="hx-ft-top">
            <div>
              <div className="hx-ft-logo">Goo<em>voiture</em></div>
              <p className="hx-ft-tag">
                Algeria's premium marketplace for buying, selling, and renting cars
                with confidence and full transparency.
              </p>
            </div>
            <div>
              <p className="hx-ft-ch">Platform</p>
              <Link to="/cars"    className="hx-ft-link">Buy Cars</Link>
              <Link to="/rentals" className="hx-ft-link">Rent Cars</Link>
              <Link to="/login"   className="hx-ft-link">Sign In</Link>
            </div>
            <div>
              <p className="hx-ft-ch">Account</p>
              <Link to="/register" className="hx-ft-link">Register</Link>
              <Link to="/login"    className="hx-ft-link">Login</Link>
            </div>
            <div>
              <p className="hx-ft-ch">Legal</p>
              <span className="hx-ft-link" style={{cursor:"default"}}>Terms of Service</span>
              <span className="hx-ft-link" style={{cursor:"default"}}>Privacy Policy</span>
            </div>
          </div>
          <div className="hx-ft-bot">
            <span>© {new Date().getFullYear()} <em>Goovoiture</em> — Algeria's Elite Car Marketplace</span>
            <span>Built with care ♥</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
