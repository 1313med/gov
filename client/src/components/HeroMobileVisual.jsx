import { useEffect, useState } from "react";
import { useAppLang } from "../context/AppLangContext";

const STORY = {
  fr: [
    {
      title: "Ventes",
      desc: "Vendeurs vérifiés, prix du marché et toutes les informations avant d'acheter.",
      tag: "Acheter en confiance",
      headline: "Le prix juste.\nLe vendeur juste.",
      pills: ["Vendeur vérifié", "Prix marché", "Fiche complète"],
    },
    {
      title: "Location",
      desc: "Partout au Maroc — choisissez vos dates, réservez en un clic, récupération aéroport.",
      tag: "Louer sans friction",
      headline: "Le Maroc entier,\nà portée de clic.",
      pills: ["1 clic", "Aéroport", "Vos dates"],
    },
    {
      title: "Mon Garage",
      desc: "Suivi digital, alertes avant échéance, mécano professionnel gratuit.",
      tag: "Service d'élite",
      headline: "Votre voiture,\ntoujours maîtrisée.",
      pills: ["Zéro papier", "Alertes", "Mécano pro"],
    },
  ],
  en: [
    {
      title: "Sales",
      desc: "Verified sellers, market prices, and full details before you buy.",
      tag: "Buy with confidence",
      headline: "Fair price.\nTrusted seller.",
      pills: ["Verified seller", "Market price", "Full details"],
    },
    {
      title: "Rentals",
      desc: "All Morocco — pick your dates, book in one click, airport pickup.",
      tag: "Rent without friction",
      headline: "All Morocco,\none click away.",
      pills: ["1 click", "Airport", "Your dates"],
    },
    {
      title: "My Garage",
      desc: "Digital tracking, expiry alerts, free professional mechanic.",
      tag: "Elite service",
      headline: "Your car,\nalways managed.",
      pills: ["Paperless", "Alerts", "Pro mechanic"],
    },
  ],
  ar: [
    {
      title: "مبيعات",
      desc: "بائعون موثّقون، أسعار السوق، ومعلومات كاملة قبل الشراء.",
      tag: "اشترِ بثقة",
      headline: "السعر العادل.\nالبائع الموثوق.",
      pills: ["بائع موثّق", "سعر السوق", "بيانات كاملة"],
    },
    {
      title: "إيجار",
      desc: "في كل المغرب — تواريخك، حجز بضغطة، استلام من المطار.",
      tag: "إيجار بسلاسة",
      headline: "المغرب كله،\nبضغطة واحدة.",
      pills: ["ضغطة واحدة", "المطار", "تواريخك"],
    },
    {
      title: "كراجي",
      desc: "متابعة رقمية، تنبيهات قبل الانتهاء، ميكانيكي محترف مجاناً.",
      tag: "خدمة مميزة",
      headline: "سيارتك،\nدائماً تحت السيطرة.",
      pills: ["بدون أوراق", "تنبيهات", "ميكانيكي"],
    },
  ],
};

const ICONS = [
  /* shield */ (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  /* chart */ (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M4 20V10M10 20V4M16 20v-6M22 20V8" />
    </svg>
  ),
  /* doc */ (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M8 13h8M8 17h5" />
    </svg>
  ),
  /* click */ (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M9 9l10 2-4 4-2 6-4-12z" />
      <path d="M9 9v4" />
    </svg>
  ),
  /* plane */ (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 12h5l3 8 4-18 3 10h5" />
    </svg>
  ),
  /* calendar */ (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  /* digital */ (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  ),
  /* bell */ (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  ),
  /* wrench */ (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-3.3-3.3 2.1-2.1z" />
    </svg>
  ),
];

const ICON_MAP = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

const VIS_UI = {
  fr: {
    listing: "Annonce",
    market: "Marché",
    fair: "Juste prix",
    book: "Réserver",
    days: "12–18",
    alert: "12j",
    chat: "En direct",
  },
  en: {
    listing: "Listing",
    market: "Market",
    fair: "Fair price",
    book: "Book",
    days: "12–18",
    alert: "12d",
    chat: "Live",
  },
  ar: {
    listing: "إعلان",
    market: "السوق",
    fair: "سعر عادل",
    book: "احجز",
    days: "12–18",
    alert: "12ي",
    chat: "مباشر",
  },
};

/** Right panel — matches: verified seller · market price · full details */
function VisualBuy({ pills, ui }) {
  return (
    <div className="hx-vis-stack">
      <div className="hx-vis-row hx-vis-row-0">
        <div className="hx-vis-widget">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="hx-vis-ico">
            <path d="M12 3 4 7v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V7l-8-4z" />
          </svg>
          <span className="hx-vis-badge hx-vis-anim-check">✓</span>
        </div>
        <span className="hx-vis-cap">{pills[0]}</span>
      </div>
      <div className="hx-vis-row hx-vis-row-1">
        <div className="hx-vis-widget hx-vis-widget-wide">
          <div className="hx-vis-price-line">
            <span>{ui.listing}</span>
            <div className="hx-vis-bar"><i className="hx-vis-bar-fill hx-vis-bar-a" /></div>
          </div>
          <div className="hx-vis-price-line">
            <span>{ui.market}</span>
            <div className="hx-vis-bar"><i className="hx-vis-bar-fill hx-vis-bar-b" /></div>
          </div>
          <span className="hx-vis-fair hx-vis-anim-check">✓ {ui.fair}</span>
        </div>
        <span className="hx-vis-cap">{pills[1]}</span>
      </div>
      <div className="hx-vis-row hx-vis-row-2">
        <div className="hx-vis-widget hx-vis-widget-wide">
          <i className="hx-vis-doc-line hx-vis-doc-1" />
          <i className="hx-vis-doc-line hx-vis-doc-2" />
          <i className="hx-vis-doc-line hx-vis-doc-3" />
        </div>
        <span className="hx-vis-cap">{pills[2]}</span>
      </div>
    </div>
  );
}

/** Right panel — matches: 1 click · airport · your dates */
function VisualRent({ pills, ui }) {
  return (
    <div className="hx-vis-stack">
      <div className="hx-vis-row hx-vis-row-0">
        <div className="hx-vis-widget">
          <span className="hx-vis-tap-ring hx-vis-anim-tap" />
          <span className="hx-vis-tap-btn">{ui.book}</span>
        </div>
        <span className="hx-vis-cap">{pills[0]}</span>
      </div>
      <div className="hx-vis-row hx-vis-row-1">
        <div className="hx-vis-widget">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="hx-vis-ico hx-vis-anim-plane">
            <path d="M2 12h5l3 8 4-18 3 10h5" />
          </svg>
          <span className="hx-vis-runway" />
        </div>
        <span className="hx-vis-cap">{pills[1]}</span>
      </div>
      <div className="hx-vis-row hx-vis-row-2">
        <div className="hx-vis-widget hx-vis-widget-wide">
          <div className="hx-vis-cal">
            {[0, 1, 2, 3, 4, 5].map((d) => (
              <span key={d} className={`hx-vis-cal-d${d === 2 || d === 3 ? " is-sel" : ""}`} />
            ))}
          </div>
          <span className="hx-vis-cal-range">{ui.days}</span>
        </div>
        <span className="hx-vis-cap">{pills[2]}</span>
      </div>
    </div>
  );
}

/** Right panel — matches: paperless · alerts · pro mechanic */
function VisualGarage({ pills, ui }) {
  return (
    <div className="hx-vis-stack">
      <div className="hx-vis-row hx-vis-row-0">
        <div className="hx-vis-widget">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="hx-vis-ico">
            <rect x="7" y="2" width="10" height="20" rx="2" />
            <path d="M11 18h2" />
          </svg>
          <span className="hx-vis-paper-x">✕</span>
        </div>
        <span className="hx-vis-cap">{pills[0]}</span>
      </div>
      <div className="hx-vis-row hx-vis-row-1">
        <div className="hx-vis-widget">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="hx-vis-ico hx-vis-anim-bell">
            <path d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
          </svg>
          <span className="hx-vis-alert-tag hx-vis-anim-pulse">{ui.alert}</span>
        </div>
        <span className="hx-vis-cap">{pills[1]}</span>
      </div>
      <div className="hx-vis-row hx-vis-row-2">
        <div className="hx-vis-widget hx-vis-widget-wide hx-vis-chat">
          <span className="hx-vis-avatar">G</span>
          <div className="hx-vis-bubbles">
            <i className="hx-vis-bubble hx-vis-bubble-1" />
            <i className="hx-vis-bubble hx-vis-bubble-2" />
          </div>
          <span className="hx-vis-chat-live">{ui.chat}</span>
        </div>
        <span className="hx-vis-cap">{pills[2]}</span>
      </div>
    </div>
  );
}

const VISUALS = [VisualBuy, VisualRent, VisualGarage];

function EliteScene({ step, data, active, lang }) {
  const icons = ICON_MAP[step];
  const lines = data.headline.split("\n");
  const Visual = VISUALS[step];
  const ui = VIS_UI[lang] || VIS_UI.fr;

  return (
    <div className={`hx-elite-scene hx-elite-scene--${step}${active ? " is-active" : ""}`}>
      <div className="hx-elite-bg" aria-hidden="true" />
      <div className="hx-elite-noise" aria-hidden="true" />

      <div className="hx-elite-body">
        <div className="hx-elite-copy">
          <h3 className="hx-elite-headline">
            {lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h3>
          <ul className="hx-elite-pills">
            {data.pills.map((label, i) => (
              <li key={label} className={`hx-elite-pill hx-elite-pill-${i}`}>
                <span className="hx-elite-pill-ico">{ICONS[icons[i]]}</span>
                <span className="hx-elite-pill-txt">{label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="hx-elite-visual" aria-hidden="true">
          <Visual pills={data.pills} ui={ui} />
        </div>
      </div>
    </div>
  );
}

/** Mobile hero — elite editorial showcase. */
export default function HeroMobileVisual() {
  const { lang } = useAppLang();
  const [step, setStep] = useState(0);

  const steps = STORY[lang] || STORY.fr;

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 1800);
    return () => clearInterval(id);
  }, [steps.length]);

  const current = steps[step];

  return (
    <div className="hx-hero-graph" role="region" aria-label={current.title}>
      <div className="hx-hero-story">
        <div className="hx-hero-story-head" aria-live="polite">
          <span className="hx-hero-story-tag">{current.tag}</span>
          <strong className="hx-hero-story-title">{current.title}</strong>
          <span className="hx-hero-story-desc">{current.desc}</span>
        </div>

        <div className="hx-hero-story-stage hx-hero-story-stage--elite">
          {steps.map((s, i) => (
            <div key={i} className={`hx-hero-story-scene${i === step ? " is-active" : ""}`}>
              <EliteScene step={i} data={s} active={i === step} lang={lang} />
            </div>
          ))}
        </div>

        <div className="hx-hero-story-nav">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`hx-hero-story-tab${i === step ? " is-active" : ""}`}
              onClick={() => setStep(i)}
              aria-label={s.title}
              aria-current={i === step ? "step" : undefined}
            >
              {s.title}
            </button>
          ))}
          <div className="hx-hero-story-dots" aria-hidden="true">
            {steps.map((_, i) => (
              <span key={i} className={`hx-hero-story-dot${i === step ? " is-active" : ""}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
