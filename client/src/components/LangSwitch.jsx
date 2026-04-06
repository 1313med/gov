import { useAppLang } from "../context/AppLangContext";

/** Compact FR | EN toggle — reuse Home2 `.hx-lang` when inside `.hx`, else `.ls` */
export default function LangSwitch({ className = "" }) {
  const { lang, setLang } = useAppLang();
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
          padding: 7px 11px;
          font-family: ui-monospace, monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: .1em;
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
  );
}
