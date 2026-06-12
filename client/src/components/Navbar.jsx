import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadAuth, clearAuth } from "../utils/authStorage";
import { useAppLang } from "../context/AppLangContext";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";
import LangSwitch from "./LangSwitch";
import { hasUserRole } from "../utils/userRoles";

/* ─────────────────────────────────────────────────────────
   GooVoiture Global Navbar
   Design matches Home2 identity:
     fonts  → Poppins (display) + DM Mono
     accent → #7c6bff (purple) + #38bdf8 (sky)
     dark   → #05060f background, semi-transparent
     light  → rgba(255,255,255,.92) backdrop-blur
───────────────────────────────────────────────────────── */
const STYLES = `

  .gn {
    position: sticky;
    top: 0;
    z-index: 200;
    width: 100%;
    height: 60px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgba(12,26,86,.09);
    background: rgba(255,255,255,.92);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    transition: background .35s, border-color .35s;
  }
  .gn.dark {
    background: rgba(5,6,15,.88);
    border-color: rgba(255,255,255,.07);
  }

  .gn-inner {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 0;
  }

  /* ── Logo ── */
  .gn-logo {
    font-family: 'Poppins', sans-serif;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -.03em;
    color: #0b163d;
    text-decoration: none;
    line-height: 1;
    flex-shrink: 0;
    margin-right: 32px;
    transition: color .3s;
  }
  .gn.dark .gn-logo { color: #f5f7ff; }
  .gn-logo em {
    font-style: italic;
    color: #7c6bff;
  }

  /* ── Nav links ── */
  .gn-links {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: 1;
  }
  .gn-link {
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: #53608f;
    text-decoration: none;
    padding: 7px 12px;
    border-radius: 8px;
    transition: color .2s, background .2s;
    white-space: nowrap;
  }
  .gn-link:hover { color: #0b163d; background: rgba(12,26,86,.05); }
  .gn.dark .gn-link { color: #8a95bf; }
  .gn.dark .gn-link:hover { color: #f5f7ff; background: rgba(255,255,255,.06); }
  .gn-link.active { color: #7c6bff; }
  .gn.dark .gn-link.active { color: #7c6bff; }

  /* ── Right end ── */
  .gn-end {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    margin-left: auto;
  }

  /* ── Icon btn (messages, notif, profile) ── */
  .gn-icon-btn {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: 9px;
    border: 1px solid rgba(12,26,86,.1);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 15px;
    color: #53608f;
    transition: all .2s;
    cursor: pointer;
    flex-shrink: 0;
  }
  .gn-icon-btn:hover { border-color: #7c6bff; color: #7c6bff; background: rgba(124,107,255,.08); }
  .gn.dark .gn-icon-btn { border-color: rgba(255,255,255,.1); color: #8a95bf; }
  .gn.dark .gn-icon-btn:hover { border-color: rgba(124,107,255,.4); color: #7c6bff; background: rgba(124,107,255,.1); }

  .gn-badge {
    position: absolute;
    top: -3px; right: -3px;
    min-width: 16px; height: 16px;
    border-radius: 999px;
    font-family: 'DM Mono', monospace;
    font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    padding: 0 3px;
    border: 1.5px solid rgba(255,255,255,.9);
  }
  .gn.dark .gn-badge { border-color: rgba(5,6,15,.9); }
  .gn-badge.notif { background: #ef4444; color: #fff; }
  .gn-badge.msg   { background: #7c6bff; color: #fff; }

  /* ── Auth pills ── */
  .gn-pill {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    letter-spacing: .04em;
    padding: 8px 16px;
    border-radius: 9px;
    border: 1px solid transparent;
    cursor: pointer;
    text-decoration: none;
    transition: all .2s;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
  }
  .gn-pill.ghost {
    color: #0b163d;
    border-color: rgba(12,26,86,.18);
    background: transparent;
  }
  .gn-pill.ghost:hover { border-color: #7c6bff; color: #7c6bff; background: rgba(124,107,255,.06); }
  .gn.dark .gn-pill.ghost { color: #f5f7ff; border-color: rgba(255,255,255,.15); }
  .gn.dark .gn-pill.ghost:hover { border-color: rgba(124,107,255,.4); color: #7c6bff; background: rgba(124,107,255,.1); }

  .gn-pill.solid {
    color: #fff;
    background: #0b163d;
    border-color: #0b163d;
  }
  .gn-pill.solid:hover { background: #7c6bff; border-color: #7c6bff; box-shadow: 0 4px 16px rgba(124,107,255,.3); }
  .gn.dark .gn-pill.solid { background: #7c6bff; border-color: #7c6bff; }
  .gn.dark .gn-pill.solid:hover { background: #9b8cff; border-color: #9b8cff; box-shadow: 0 4px 16px rgba(124,107,255,.4); }

  /* ── Dark toggle ── */
  .gn-theme {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px 6px 8px;
    border-radius: 9px;
    border: 1px solid rgba(12,26,86,.12);
    background: transparent;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    color: #53608f;
    transition: all .2s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .gn-theme:hover { border-color: #7c6bff; color: #7c6bff; background: rgba(124,107,255,.06); }
  .gn.dark .gn-theme { border-color: rgba(255,255,255,.1); color: #8a95bf; }
  .gn.dark .gn-theme:hover { border-color: rgba(124,107,255,.35); color: #9b8cff; background: rgba(124,107,255,.08); }

  .gn-toggle-track {
    width: 32px; height: 18px;
    border-radius: 999px;
    background: rgba(12,26,86,.12);
    border: 1.5px solid rgba(12,26,86,.15);
    position: relative;
    transition: background .25s, border-color .25s;
    flex-shrink: 0;
  }
  .gn.dark .gn-toggle-track { background: #7c6bff; border-color: #7c6bff; }
  .gn-toggle-thumb {
    position: absolute;
    top: 2px; left: 2px;
    width: 12px; height: 12px;
    border-radius: 50%;
    background: #8a95bf;
    transition: transform .25s, background .25s;
  }
  .gn.dark .gn-toggle-thumb { transform: translateX(14px); background: #fff; }

  /* ── Divider ── */
  .gn-sep {
    width: 1px; height: 20px;
    background: rgba(12,26,86,.1);
    margin: 0 4px;
    flex-shrink: 0;
  }
  .gn.dark .gn-sep { background: rgba(255,255,255,.08); }

  /* ── Mobile burger ── */
  .gn-burger {
    display: none;
    flex-direction: column;
    gap: 5px;
    width: 36px; height: 36px;
    padding: 9px 7px;
    border: 1px solid rgba(12,26,86,.12);
    border-radius: 9px;
    background: transparent;
    cursor: pointer;
    flex-shrink: 0;
  }
  .gn-burger span {
    display: block; height: 1.5px;
    background: #53608f;
    border-radius: 2px;
    transition: all .25s;
  }
  .gn.dark .gn-burger { border-color: rgba(255,255,255,.1); }
  .gn.dark .gn-burger span { background: #8a95bf; }

  /* ── Mobile drawer ── */
  .gn-drawer {
    position: fixed;
    top: 60px; left: 0; right: 0;
    background: rgba(255,255,255,.97);
    border-bottom: 1px solid rgba(12,26,86,.08);
    backdrop-filter: blur(20px);
    z-index: 199;
    padding: 16px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transform: translateY(-110%);
    transition: transform .3s ease;
    box-shadow: 0 8px 32px rgba(12,26,86,.12);
  }
  .gn-drawer.open { transform: translateY(0); }
  .gn.dark ~ .gn-drawer,
  .gn-drawer.dark {
    background: rgba(5,6,15,.96);
    border-color: rgba(255,255,255,.07);
  }
  .gn-drawer-link {
    font-family: 'Poppins', sans-serif;
    font-size: 15px;
    font-weight: 500;
    color: #0b163d;
    text-decoration: none;
    padding: 10px 12px;
    border-radius: 10px;
    transition: background .2s, color .2s;
  }
  .gn-drawer-link:hover { background: rgba(124,107,255,.08); color: #7c6bff; }
  .gn-drawer.dark .gn-drawer-link { color: #f5f7ff; }
  .gn-drawer.dark .gn-drawer-link:hover { background: rgba(124,107,255,.1); color: #9b8cff; }
  .gn-drawer-sep {
    height: 1px;
    background: rgba(12,26,86,.07);
    margin: 4px 0;
  }
  .gn-drawer.dark .gn-drawer-sep { background: rgba(255,255,255,.07); }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .gn-links,
    .gn-sep,
    .gn-theme { display: none; }
    .gn-burger { display: flex; }
    .gn-end { gap: 8px; }
  }
  @media (max-width: 480px) {
    .gn-inner { padding: 0 16px; }
    .gn-logo { margin-right: auto; font-size: 18px; }
  }

  /* ── Profile avatar button ── */
  .gn-profile-wrap { position: relative; }

  .gn-av-btn {
    width: 36px; height: 36px; border-radius: 50%;
    border: 2px solid rgba(124,107,255,.3);
    background: rgba(124,107,255,.1);
    overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; padding: 0;
    font-family: 'Poppins', sans-serif;
    font-size: 13px; font-weight: 700; color: #7c6bff;
    transition: border-color .2s, box-shadow .2s;
    flex-shrink: 0;
  }
  .gn-av-btn:hover { border-color: #7c6bff; box-shadow: 0 0 0 3px rgba(124,107,255,.15); }
  .gn-av-btn img { width: 100%; height: 100%; object-fit: cover; }
  .gn.dark .gn-av-btn { border-color: rgba(124,107,255,.35); background: rgba(124,107,255,.12); }
  .gn.dark .gn-av-btn:hover { border-color: #7c6bff; box-shadow: 0 0 0 3px rgba(124,107,255,.18); }

  /* ── Dropdown panel ── */
  .gn-drop {
    position: absolute; top: calc(100% + 10px); right: 0;
    width: 230px;
    background: #fff;
    border: 1px solid rgba(12,26,86,.1);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(12,26,86,.14);
    overflow: hidden; z-index: 400;
    animation: gn-drop-in .15s ease;
  }
  @keyframes gn-drop-in {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .gn.dark .gn-drop {
    background: #0e0f1e;
    border-color: rgba(255,255,255,.1);
    box-shadow: 0 8px 32px rgba(0,0,0,.45);
  }

  .gn-drop-head {
    padding: 14px 16px 12px;
    display: flex; align-items: center; gap: 12px;
    border-bottom: 1px solid rgba(12,26,86,.07);
  }
  .gn.dark .gn-drop-head { border-color: rgba(255,255,255,.07); }

  .gn-drop-av {
    width: 40px; height: 40px; border-radius: 50%;
    border: 2px solid rgba(124,107,255,.25);
    background: rgba(124,107,255,.1);
    overflow: hidden; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Poppins', sans-serif;
    font-size: 16px; font-weight: 700; color: #7c6bff;
  }
  .gn-drop-av img { width: 100%; height: 100%; object-fit: cover; }

  .gn-drop-info { min-width: 0; }
  .gn-drop-name {
    font-family: 'Poppins', sans-serif;
    font-size: 13px; font-weight: 600; color: #0b163d;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .gn.dark .gn-drop-name { color: #f5f7ff; }
  .gn-drop-role {
    font-family: 'DM Mono', monospace;
    font-size: 10px; font-weight: 500;
    color: #7c6bff; text-transform: uppercase; letter-spacing: .06em;
    margin-top: 2px;
  }

  .gn-drop-body { padding: 6px 0; }

  .gn-drop-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 16px;
    font-family: 'Poppins', sans-serif;
    font-size: 13px; font-weight: 500; color: #374151;
    text-decoration: none; cursor: pointer;
    width: 100%; border: none; background: none; text-align: left;
    transition: background .15s, color .15s;
  }
  .gn-drop-item:hover { background: rgba(124,107,255,.07); color: #7c6bff; }
  .gn.dark .gn-drop-item { color: #bcc5e8; }
  .gn.dark .gn-drop-item:hover { background: rgba(124,107,255,.1); color: #9b8cff; }

  .gn-drop-item.red:hover { background: rgba(239,68,68,.07); color: #ef4444; }
  .gn.dark .gn-drop-item.red:hover { background: rgba(239,68,68,.08); color: #f87171; }

  .gn-drop-sep { height: 1px; background: rgba(12,26,86,.07); margin: 4px 12px; }
  .gn.dark .gn-drop-sep { background: rgba(255,255,255,.07); }
`;

const ROLE_LABELS = {
  customer:     "Customer",
  rental_owner: "Rental Owner",
  car_owner:    "Car owner",
  seller:       "Car owner",
  admin:        "Admin",
};

/* SVG icons */
const MOON     = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14.5 3.8a8.7 8.7 0 1 0 5.7 13.9 9 9 0 0 1-5.7-13.9Z"/></svg>;
const SUN      = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2M12 19.2v2M21.2 12h-2M4.8 12h-2M18.6 5.4l-1.4 1.4M6.8 17.2l-1.4 1.4M18.6 18.6l-1.4-1.4M6.8 6.8 5.4 5.4"/></svg>;
const MSG      = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const BELL     = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const ICO_USER  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const ICO_CAL   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const ICO_CAR   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>;
const ICO_DASH  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const ICO_OUT   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ICO_KYC   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const ICO_REF   = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const ICO_FUEL  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v13"/><path d="M3 14h10"/><path d="M15 9l3-3 3 3"/><path d="M18 6v13"/></svg>;
const ICO_TEAM  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ICO_GUIDE = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;

export default function Navbar() {
  const navigate = useNavigate();
  const auth = loadAuth();
  const { copy } = useAppLang();
  const { unreadNotifications, unreadMessages } = useSocket() || {};
  const { dark, toggle: toggleTheme } = useTheme();

  const [menuOpen,    setMenuOpen]    = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function logout() {
    clearAuth();
    navigate("/login");
  }

  const isLoggedIn = !!auth?._id;

  return (
    <>
      <style>{STYLES}</style>
      <header className={`gn${dark ? " dark" : ""}`}>
        <div className="gn-inner">

          {/* Logo */}
          <Link to="/" className="gn-logo">
            Goo<em>voiture</em>
          </Link>

          {/* Center nav links */}
          <nav className="gn-links">
            <Link to="/cars"           className="gn-link">{copy.common.browseCars}</Link>
            <Link to="/rentals"        className="gn-link">{copy.common.rentCars}</Link>
            <Link to="/buying-guide"   className="gn-link">Guide achat</Link>
            <Link to="/credit-check"   className="gn-link">Crédit vérif.</Link>
          </nav>

          {/* Right side */}
          <div className="gn-end">
            {/* Language */}
            <LangSwitch />

            {/* Theme */}
            <button className="gn-theme" onClick={toggleTheme} aria-label="Toggle theme">
              {dark ? SUN : MOON}
              <div className="gn-toggle-track">
                <div className="gn-toggle-thumb" />
              </div>
            </button>

            {isLoggedIn && (
              <>
                <div className="gn-sep" />

                {/* Messages */}
                <Link to="/messages" className="gn-icon-btn" title="Messages">
                  {MSG}
                  {unreadMessages > 0 && (
                    <span className="gn-badge msg">{unreadMessages > 9 ? "9+" : unreadMessages}</span>
                  )}
                </Link>

                {/* Notifications */}
                <Link to="/notifications" className="gn-icon-btn" title="Notifications">
                  {BELL}
                  {unreadNotifications > 0 && (
                    <span className="gn-badge notif">{unreadNotifications > 9 ? "9+" : unreadNotifications}</span>
                  )}
                </Link>

                {/* Profile avatar + dropdown */}
                <div className="gn-profile-wrap" ref={profileRef}>
                  <button
                    className="gn-av-btn"
                    onClick={() => setProfileOpen(o => !o)}
                    aria-label="Profile menu"
                  >
                    {auth.avatar
                      ? <img src={auth.avatar} alt={auth.name} />
                      : (auth.name?.[0]?.toUpperCase() || "?")}
                  </button>

                  {profileOpen && (
                    <div className="gn-drop">
                      {/* User info header */}
                      <div className="gn-drop-head">
                        <div className="gn-drop-av">
                          {auth.avatar
                            ? <img src={auth.avatar} alt={auth.name} />
                            : (auth.name?.[0]?.toUpperCase() || "?")}
                        </div>
                        <div className="gn-drop-info">
                          <div className="gn-drop-name">{auth.name}</div>
                          <div className="gn-drop-role">
                            {ROLE_LABELS[auth.role] || auth.role}
                          </div>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="gn-drop-body">
                        <Link
                          to="/profile"
                          className="gn-drop-item"
                          onClick={() => setProfileOpen(false)}
                        >
                          {ICO_USER} My Profile
                        </Link>

                        {hasUserRole(auth, "customer") && (
                          <Link
                            to="/my-bookings"
                            className="gn-drop-item"
                            onClick={() => setProfileOpen(false)}
                          >
                            {ICO_CAL} My Bookings
                          </Link>
                        )}

                        <Link
                          to="/saved"
                          className="gn-drop-item"
                          onClick={() => setProfileOpen(false)}
                        >
                          ♥ Saved
                        </Link>

                        {hasUserRole(auth, "rental_owner") && (
                          <Link
                            to="/my-fleet"
                            className="gn-drop-item"
                            onClick={() => setProfileOpen(false)}
                          >
                            {ICO_CAR} My Fleet
                          </Link>
                        )}

                        {hasUserRole(auth, "car_owner") && (
                          <Link
                            to="/garage"
                            className="gn-drop-item"
                            onClick={() => setProfileOpen(false)}
                          >
                            {ICO_CAR} My garage
                          </Link>
                        )}
                        {hasUserRole(auth, "customer", "car_owner", "rental_owner", "admin") && (
                          <Link
                            to="/my-sales"
                            className="gn-drop-item"
                            onClick={() => setProfileOpen(false)}
                          >
                            {ICO_DASH} My listings
                          </Link>
                        )}

                        {hasUserRole(auth, "admin") &&
                          !hasUserRole(auth, "car_owner", "rental_owner") && (
                          <Link
                            to="/admin"
                            className="gn-drop-item"
                            onClick={() => setProfileOpen(false)}
                          >
                            {ICO_DASH} Admin Panel
                          </Link>
                        )}

                        <div className="gn-drop-sep" />

                        {/* ── Tools section ── */}
                        <Link to="/kyc" className="gn-drop-item" onClick={() => setProfileOpen(false)}>
                          {ICO_KYC} Vérification identité
                        </Link>
                        <Link to="/referral" className="gn-drop-item" onClick={() => setProfileOpen(false)}>
                          {ICO_REF} Mon parrainage
                        </Link>

                        {hasUserRole(auth, "car_owner") && (
                          <Link to="/fuel-tracker" className="gn-drop-item" onClick={() => setProfileOpen(false)}>
                            {ICO_FUEL} Suivi carburant
                          </Link>
                        )}

                        <Link to="/estimate" className="gn-drop-item" onClick={() => setProfileOpen(false)}>
                          💰 Price estimate
                        </Link>
                        <Link to="/price-alerts" className="gn-drop-item" onClick={() => setProfileOpen(false)}>
                          🔔 Price alerts
                        </Link>

                        {hasUserRole(auth, "rental_owner") && (
                          <Link to="/owner/staff" className="gn-drop-item" onClick={() => setProfileOpen(false)}>
                            {ICO_TEAM} Mon équipe
                          </Link>
                        )}

                        <Link to="/emergency" className="gn-drop-item" onClick={() => setProfileOpen(false)}>
                          🆘 Urgence / Accident
                        </Link>

                        <div className="gn-drop-sep" />

                        <button
                          onClick={() => { logout(); setProfileOpen(false); }}
                          className="gn-drop-item red"
                        >
                          {ICO_OUT} Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!isLoggedIn && (
              <>
                <div className="gn-sep" />
                <Link to="/login"    className="gn-pill ghost">{copy.common.login}</Link>
                <Link to="/register" className="gn-pill solid">{copy.common.getStarted || "S'inscrire"}</Link>
              </>
            )}

            {/* Mobile burger */}
            <button
              type="button"
              className="gn-burger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="gn-mobile-drawer"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — sits outside header so it can overlay */}
      <div
        id="gn-mobile-drawer"
        className={`gn-drawer${menuOpen ? " open" : ""}${dark ? " dark" : ""}`}
        aria-hidden={!menuOpen}
      >
        <Link to="/cars"          className="gn-drawer-link" onClick={() => setMenuOpen(false)}>{copy.common.browseCars}</Link>
        <Link to="/rentals"       className="gn-drawer-link" onClick={() => setMenuOpen(false)}>{copy.common.rentCars}</Link>
        <Link to="/buying-guide"  className="gn-drawer-link" onClick={() => setMenuOpen(false)}>📖 Guide d'achat</Link>
        <Link to="/emergency"     className="gn-drawer-link" onClick={() => setMenuOpen(false)}>🆘 Urgence / Accident</Link>
        <div className="gn-drawer-sep" />
        {isLoggedIn ? (
          <>
            <Link to="/messages"      className="gn-drawer-link" onClick={() => setMenuOpen(false)}>Messages</Link>
            <Link to="/notifications" className="gn-drawer-link" onClick={() => setMenuOpen(false)}>Notifications</Link>
            <Link to="/saved"         className="gn-drawer-link" onClick={() => setMenuOpen(false)}>Saved</Link>
            <Link to="/my-bookings"   className="gn-drawer-link" onClick={() => setMenuOpen(false)}>My Bookings</Link>
            {hasUserRole(auth, "car_owner") && (
              <Link to="/garage" className="gn-drawer-link" onClick={() => setMenuOpen(false)}>My garage</Link>
            )}
            {hasUserRole(auth, "rental_owner") && (
              <Link to="/my-fleet" className="gn-drawer-link" onClick={() => setMenuOpen(false)}>My Fleet</Link>
            )}
            <Link to="/profile"       className="gn-drawer-link" onClick={() => setMenuOpen(false)}>Profile</Link>
            <Link to="/kyc"           className="gn-drawer-link" onClick={() => setMenuOpen(false)}>🛡 Vérification identité</Link>
            <Link to="/referral"      className="gn-drawer-link" onClick={() => setMenuOpen(false)}>🎁 Parrainage</Link>
            <Link to="/credit-check"  className="gn-drawer-link" onClick={() => setMenuOpen(false)}>🔍 Vérif. crédit</Link>
            {hasUserRole(auth, "car_owner") && (
              <Link to="/fuel-tracker" className="gn-drawer-link" onClick={() => setMenuOpen(false)}>⛽ Carburant</Link>
            )}
            {hasUserRole(auth, "rental_owner") && (
              <Link to="/owner/staff" className="gn-drawer-link" onClick={() => setMenuOpen(false)}>👥 Mon équipe</Link>
            )}
            <div className="gn-drawer-sep" />
            <button onClick={() => { logout(); setMenuOpen(false); }} className="gn-drawer-link" style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left", width:"100%" }}>
              {copy.common.logout}
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="gn-drawer-link" onClick={() => setMenuOpen(false)}>{copy.common.login}</Link>
            <Link to="/register" className="gn-drawer-link" onClick={() => setMenuOpen(false)}>{copy.common.getStarted || "S'inscrire"}</Link>
          </>
        )}
      </div>
    </>
  );
}
