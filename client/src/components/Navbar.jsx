import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadAuth, clearAuth } from "../utils/authStorage";
import { useAppLang } from "../context/AppLangContext";
import { useSocket } from "../context/SocketContext";
import LangSwitch from "./LangSwitch";

/* ─────────────────────────────────────────────────────────
   GooVoiture Global Navbar
   Design matches Home2 identity:
     fonts  → Poppins (display) + DM Mono
     accent → #7c6bff (purple) + #38bdf8 (sky)
     dark   → #05060f background, semi-transparent
     light  → rgba(255,255,255,.92) backdrop-blur
───────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

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
`;

/* SVG icons */
const MOON = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14.5 3.8a8.7 8.7 0 1 0 5.7 13.9 9 9 0 0 1-5.7-13.9Z"/></svg>;
const SUN  = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2M12 19.2v2M21.2 12h-2M4.8 12h-2M18.6 5.4l-1.4 1.4M6.8 17.2l-1.4 1.4M18.6 18.6l-1.4-1.4M6.8 6.8 5.4 5.4"/></svg>;
const MSG  = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const BELL = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const USER = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

export default function Navbar() {
  const navigate = useNavigate();
  const auth = loadAuth();
  const { copy } = useAppLang();
  const { unreadNotifications, unreadMessages } = useSocket() || {};

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("goo-theme");
    if (saved) return saved === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("goo-theme", dark ? "dark" : "light");
    // Keep Cars page in sync
    localStorage.setItem("cars-theme", dark ? "dark" : "light");
  }, [dark]);

  function logout() {
    clearAuth();
    navigate("/login");
  }

  const isLoggedIn = !!auth?.token;

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
            <Link to="/cars"    className="gn-link">{copy.common.browseCars}</Link>
            <Link to="/rentals" className="gn-link">{copy.common.rentCars}</Link>
          </nav>

          {/* Right side */}
          <div className="gn-end">
            {/* Language */}
            <LangSwitch />

            {/* Theme */}
            <button className="gn-theme" onClick={() => setDark(d => !d)} aria-label="Toggle theme">
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

                {/* Profile */}
                <Link to="/profile" className="gn-icon-btn" title="Profile">
                  {USER}
                </Link>

                <div className="gn-sep" />

                {/* Logout */}
                <button onClick={logout} className="gn-pill solid">
                  {copy.common.logout}
                </button>
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
            <button className="gn-burger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer — sits outside header so it can overlay */}
      <div className={`gn-drawer${menuOpen ? " open" : ""}${dark ? " dark" : ""}`}>
        <Link to="/cars"    className="gn-drawer-link" onClick={() => setMenuOpen(false)}>{copy.common.browseCars}</Link>
        <Link to="/rentals" className="gn-drawer-link" onClick={() => setMenuOpen(false)}>{copy.common.rentCars}</Link>
        <div className="gn-drawer-sep" />
        {isLoggedIn ? (
          <>
            <Link to="/messages"      className="gn-drawer-link" onClick={() => setMenuOpen(false)}>Messages</Link>
            <Link to="/notifications" className="gn-drawer-link" onClick={() => setMenuOpen(false)}>Notifications</Link>
            <Link to="/profile"       className="gn-drawer-link" onClick={() => setMenuOpen(false)}>Profile</Link>
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
