import { useNavigate, useLocation } from "react-router-dom";
import { useAppLang } from "../context/AppLangContext";
import { buildSeoPath, parseSeoPath, isPublicSeoPath } from "../seo/seoPaths";

/** Compact FR | EN | AR toggle */
export default function LangSwitch({ className = "" }) {
  const { lang, setLang } = useAppLang();
  const navigate = useNavigate();
  const location = useLocation();

  const pick = (next) => {
    if (isPublicSeoPath(location.pathname)) {
      setLang(next);
    } else {
      setLang(next);
      const { basePath } = parseSeoPath(location.pathname);
      if (basePath !== location.pathname) {
        navigate(buildSeoPath(next, basePath));
      }
    }
  };

  return (
    <div
      className={`ls-lang ${className}`.trim()}
      role="group"
      aria-label="Language"
    >
      <style>{`
        .ls-lang {
          display: inline-flex;
          align-items: center;
          border-radius: 10px;
          border: 1px solid rgba(0,0,0,.12);
          overflow: hidden;
          background: #fff;
          flex-shrink: 0;
        }
        .ls-lang button {
          padding: 7px 9px;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          border: none;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transition: background .2s, color .2s;
        }
        .ls-lang button:hover { color: #0f172a; }
        .ls-lang button.on {
          background: rgba(124,107,255,.12);
          color: #5b4fd6;
          box-shadow: inset 0 0 0 1px rgba(124,107,255,.25);
        }
      `}</style>
      {["fr", "en", "ar"].map((code) => (
        <button
          key={code}
          type="button"
          className={lang === code ? "on" : ""}
          onClick={() => pick(code)}
          aria-pressed={lang === code}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
