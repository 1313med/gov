import { useEffect, useState } from "react";
import { useAppLang } from "../context/AppLangContext";

const PILLARS = {
  fr: [
    { tab: "Ventes", main: "Acheter.", sign: "vendre." },
    { tab: "Location", main: "Explorer.", sign: "le Maroc." },
    { tab: "Mon Garage", main: "Gérer", sign: "votre voiture." },
  ],
  en: [
    { tab: "Sales", main: "Buy.", sign: "sell." },
    { tab: "Rentals", main: "Explore.", sign: "Morocco." },
    { tab: "My Garage", main: "Manage", sign: "your car." },
  ],
  ar: [
    { tab: "مبيعات", main: "اشترِ.", sign: "بِع." },
    { tab: "إيجار", main: "استكشف.", sign: "المغرب." },
    { tab: "كراجي", main: "أدِر", sign: "سيارتك." },
  ],
};

const HOLD_MS = 4800;
const EXIT_MS = 720;

/** Mobile-only typographic campaign — desktop unchanged in Home2. */
export default function HeroMobileVisual() {
  const { lang } = useAppLang();
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const pillars = PILLARS[lang] || PILLARS.fr;
  const current = pillars[step];
  const isRtl = lang === "ar";

  useEffect(() => {
    const id = window.setInterval(() => {
      setExiting(true);
      window.setTimeout(() => {
        setStep((s) => (s + 1) % pillars.length);
        setExiting(false);
      }, EXIT_MS);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [pillars.length]);

  return (
    <div
      className="hx-hero-graph"
      role="region"
      aria-label={current.tab}
      aria-live="polite"
    >
      <div className="hx-type-divider" aria-hidden="true">
        <span className="hx-type-divider-line">
          <span className="hx-type-divider-sweep" />
        </span>
      </div>

      <div className={`hx-type${isRtl ? " hx-type--rtl" : ""}`}>
        <div className="hx-type-stage">
          {pillars.map((p, i) => {
            const active = i === step;
            const state = active ? (exiting ? "is-exit" : "is-active") : "";
            return (
              <div
                key={p.tab}
                className={`hx-type-msg hx-type-msg--${i} ${state}`}
                aria-hidden={!active}
              >
                <span className="hx-type-main">{p.main}</span>
                <span className={`hx-type-sign${isRtl ? " hx-type-sign--ar" : ""}`}>
                  {p.sign}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
