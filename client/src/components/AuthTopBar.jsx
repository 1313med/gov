import { Link } from "react-router-dom";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";
import LangSwitch from "./LangSwitch";

const CSS = `
.auth-topbar {
  display: none;
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  padding: 12px 16px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: rgba(5, 6, 15, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
html.light .auth-topbar {
  background: rgba(255, 255, 255, 0.88);
  border-bottom-color: rgba(11, 22, 61, 0.08);
}

.auth-topbar-start {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.auth-topbar-back {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  font-family: "DM Mono", monospace;
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
html.light .auth-topbar-back {
  border-color: rgba(11, 22, 61, 0.12);
  background: rgba(11, 22, 61, 0.03);
  color: rgba(11, 22, 61, 0.5);
}
.auth-topbar-back:hover {
  border-color: rgba(124, 107, 255, 0.4);
  color: #a78bfa;
  background: rgba(124, 107, 255, 0.08);
}
html.light .auth-topbar-back:hover {
  color: #6d5ce8;
}

.auth-topbar-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  min-width: 0;
}
.auth-topbar-mark {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: linear-gradient(135deg, #7c6bff, #38bdf8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Poppins", sans-serif;
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  box-shadow: 0 0 16px rgba(124, 107, 255, 0.35);
}
.auth-topbar-name {
  font-family: "Poppins", sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
html.light .auth-topbar-name { color: #0b163d; }
.auth-topbar-name span { color: #a78bfa; }
html.light .auth-topbar-name span { color: #6d5ce8; }

.auth-topbar-end {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.auth-topbar-theme {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  flex-shrink: 0;
}
html.light .auth-topbar-theme {
  border-color: rgba(11, 22, 61, 0.12);
  background: #fff;
  color: #64748b;
}
.auth-topbar-theme:hover {
  border-color: rgba(124, 107, 255, 0.4);
  color: #a78bfa;
  background: rgba(124, 107, 255, 0.08);
}

/* Lang switch dark/light on auth bar */
.auth-topbar .ls-lang {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}
html.light .auth-topbar .ls-lang {
  border-color: rgba(11, 22, 61, 0.12);
  background: #fff;
}
.auth-topbar .ls-lang button { color: rgba(255, 255, 255, 0.45); }
html.light .auth-topbar .ls-lang button { color: #64748b; }
.auth-topbar .ls-lang button.on {
  background: rgba(124, 107, 255, 0.18);
  color: #c4b5fd;
}
html.light .auth-topbar .ls-lang button.on {
  background: rgba(124, 107, 255, 0.12);
  color: #5b4fd6;
}

@media (max-width: 900px) {
  .auth-topbar { display: flex; }
}
@media (max-width: 380px) {
  .auth-topbar { padding: 10px 12px; gap: 8px; }
  .auth-topbar-name { display: none; }
  .auth-topbar-back span { display: none; }
  .auth-topbar-back { padding: 7px 10px; }
}
`;

const MOON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M14.5 3.8a8.7 8.7 0 1 0 5.7 13.9 9 9 0 0 1-5.7-13.9Z" />
  </svg>
);
const SUN = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.8v2M12 19.2v2M21.2 12h-2M4.8 12h-2M18.6 5.4l-1.4 1.4M6.8 17.2l-1.4 1.4M18.6 18.6l-1.4-1.4M6.8 6.8 5.4 5.4" />
  </svg>
);

export default function AuthTopBar({ backLabel }) {
  const { copy } = useAppLang();
  const { dark, toggle } = useTheme();
  const label = backLabel || copy.login?.back || "← Accueil";

  return (
    <>
      <style>{CSS}</style>
      <header className="auth-topbar">
        <div className="auth-topbar-start">
          <Link to="/" className="auth-topbar-back">
            ← <span>{label.replace(/^←\s*/, "")}</span>
          </Link>
          <Link to="/" className="auth-topbar-logo">
            <div className="auth-topbar-mark">G</div>
            <span className="auth-topbar-name">
              Goo<span>voiture</span>
            </span>
          </Link>
        </div>
        <div className="auth-topbar-end">
          <LangSwitch />
          <button type="button" className="auth-topbar-theme" onClick={toggle} aria-label="Toggle theme">
            {dark ? SUN : MOON}
          </button>
        </div>
      </header>
    </>
  );
}
