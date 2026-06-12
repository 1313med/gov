import { useEffect, useState } from "react";
import { useAppLang } from "../context/AppLangContext";

const STORY = {
  fr: [
    {
      title: "Ventes",
      desc: "Vendeurs vérifiés · Prix marché · Infos complètes avant d'acheter",
      tag: "Acheter en confiance",
    },
    {
      title: "Location",
      desc: "Partout au Maroc · Dates au choix · Aéroport & options premium",
      tag: "Louer en 1 clic",
    },
    {
      title: "Mon Garage",
      desc: "Suivi sans papier · Alertes échéances · Mécano pro gratuit",
      tag: "Piloté pour vous",
    },
  ],
  en: [
    {
      title: "Sales",
      desc: "Verified sellers · Market prices · Full info before you buy",
      tag: "Buy with confidence",
    },
    {
      title: "Rentals",
      desc: "All Morocco · Pick your dates · Airport pickup & premium options",
      tag: "Book in 1 click",
    },
    {
      title: "My Garage",
      desc: "Paperless tracking · Expiry alerts · Free pro mechanic",
      tag: "Managed for you",
    },
  ],
  ar: [
    {
      title: "مبيعات",
      desc: "بائعون موثّقون · أسعار السوق · معلومات كاملة قبل الشراء",
      tag: "اشترِ بثقة",
    },
    {
      title: "إيجار",
      desc: "في كل المغرب · تواريخك · استلام المطار وخيارات مميزة",
      tag: "احجز بضغطة",
    },
    {
      title: "كراجي",
      desc: "متابعة رقمية · تنبيهات قبل الانتهاء · ميكانيكي مجاني",
      tag: "نُدير لك",
    },
  ],
};

const LABELS = {
  fr: {
    verified: "Vendeur vérifié",
    market: "Prix marché",
    listing: "Prix annonce",
    fair: "Juste prix",
    history: "Historique",
    admin: "Contrôle admin",
    info: "Fiche complète",
    morocco: "Maroc entier",
    dates: "12 – 18 juin",
    reserve: "Réserver",
    airport: "Aéroport",
    gps: "GPS",
    insurance: "Assurance",
    delivery: "Livraison",
    digital: "100% digital",
    insuranceDoc: "Assurance",
    inspection: "Visite tech.",
    registration: "Carte grise",
    noPaper: "0 papier",
    alert: "Assurance expire",
    days: "12 jours",
    mechanic: "Mécano Goovoiture",
    free: "Gratuit · en direct",
    online: "En ligne",
    garage: "Mon Garage",
    upToDate: "✓ Tout à jour",
    carName: "Dacia Sandero",
    rentalCar: "Peugeot 3008 · Premium",
  },
  en: {
    verified: "Verified seller",
    market: "Market price",
    listing: "Listing price",
    fair: "Fair price",
    history: "History",
    admin: "Admin check",
    info: "Full details",
    morocco: "All Morocco",
    dates: "Jun 12 – 18",
    reserve: "Book now",
    airport: "Airport",
    gps: "GPS",
    insurance: "Insurance",
    delivery: "Delivery",
    digital: "100% digital",
    insuranceDoc: "Insurance",
    inspection: "Inspection",
    registration: "Registration",
    noPaper: "0 paper",
    alert: "Insurance expires",
    days: "12 days",
    mechanic: "Goovoiture Mechanic",
    free: "Free · live chat",
    online: "Online",
    garage: "My Garage",
    upToDate: "✓ All up to date",
    carName: "Dacia Sandero",
    rentalCar: "Peugeot 3008 · Premium",
  },
  ar: {
    verified: "بائع موثّق",
    market: "سعر السوق",
    listing: "سعر الإعلان",
    fair: "سعر عادل",
    history: "السجل",
    admin: "مراجعة الإدارة",
    info: "بيانات كاملة",
    morocco: "كل المغرب",
    dates: "12 – 18 يونيو",
    reserve: "احجز",
    airport: "المطار",
    gps: "GPS",
    insurance: "تأمين",
    delivery: "توصيل",
    digital: "100% رقمي",
    insuranceDoc: "التأمين",
    inspection: "الفحص",
    registration: "البطاقة",
    noPaper: "0 ورق",
    alert: "ينتهي التأمين",
    days: "12 يوم",
    mechanic: "ميكانيكي Goovoiture",
    free: "مجاني · مباشر",
    online: "متصل",
    garage: "كراجي",
    upToDate: "✓ كل شيء محدّث",
    carName: "Dacia Sandero",
    rentalCar: "Peugeot 3008 · Premium",
  },
};

function StoryDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true">
      <defs>
        <linearGradient id="hxStoryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c6bff" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="hxStoryShine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Panel({ x, y, w, h, r = 10, className = "" }) {
  return (
    <g className={className}>
      <rect x={x} y={y} width={w} height={h} rx={r} className="hx-story-panel" />
      <rect x={x} y={y} width={w} height={h * 0.35} rx={r} className="hx-story-panel-shine" />
    </g>
  );
}

function SceneSales({ t }) {
  return (
    <svg viewBox="0 0 320 156" fill="none" className="hx-story-svg" aria-hidden="true">
      <Panel x={12} y={14} w={108} h={128} r={12} className="hx-story-enter hx-story-d1" />
      <rect x={20} y={22} width={92} height={52} rx={8} className="hx-story-img" />
      <rect x={20} y={80} width={48} height={5} rx={2.5} className="hx-story-line" />
      <rect x={20} y={90} width={36} height={4} rx={2} className="hx-story-line-dim" />
      <rect x={20} y={104} width={56} height={16} rx={8} className="hx-story-badge" />
      <text x={48} y={115} className="hx-story-txt-accent" fontSize="7" fontWeight="600" textAnchor="middle">
        {t.verified}
      </text>

      <Panel x={128} y={14} w={92} h={78} r={10} className="hx-story-enter hx-story-d2" />
      <text x={138} y={32} className="hx-story-txt-muted" fontSize="7" fontWeight="500">
        {t.market}
      </text>
      <rect x={138} y={40} width={72} height={6} rx={3} className="hx-story-bar-bg" />
      <rect x={138} y={40} width={52} height={6} rx={3} className="hx-story-bar-fill hx-story-bar-anim" />
      <text x={138} y={58} className="hx-story-txt-dim" fontSize="6">
        {t.listing}
      </text>
      <text x={210} y={58} className="hx-story-txt-dim" fontSize="6" textAnchor="end">
        248 000 MAD
      </text>
      <rect x={138} y={64} width={72} height={6} rx={3} className="hx-story-bar-bg" />
      <rect x={138} y={64} width={60} height={6} rx={3} className="hx-story-bar-fill2" />
      <text x={138} y={82} className="hx-story-txt-dim" fontSize="6">
        {t.market}
      </text>
      <text x={210} y={82} className="hx-story-txt-accent" fontSize="6" textAnchor="end" fontWeight="600">
        241 000 MAD
      </text>
      <rect x={138} y={88} width={72} height={14} rx={7} className="hx-story-pill" />
      <text x={174} y={98} className="hx-story-txt-ink" fontSize="7" fontWeight="600" textAnchor="middle">
        ✓ {t.fair}
      </text>

      <Panel x={128} y={100} w={92} h={42} r={10} className="hx-story-enter hx-story-d3" />
      {[t.history, t.admin, t.info].map((label, i) => (
        <g key={label}>
          <circle cx={142} cy={116 + i * 10} r={3} className="hx-story-dot" />
          <text x={150} y={119 + i * 10} className="hx-story-txt-muted" fontSize="6.5">
            {label}
          </text>
        </g>
      ))}

      <Panel x={228} y={14} w={80} h={128} r={12} className="hx-story-enter hx-story-d4" />
      <text x={268} y={34} className="hx-story-txt-muted" fontSize="7" textAnchor="middle" fontWeight="600">
        {t.carName}
      </text>
      <text x={268} y={52} className="hx-story-txt-accent" fontSize="11" textAnchor="middle" fontWeight="700">
        248K
      </text>
      <text x={268} y={64} className="hx-story-txt-dim" fontSize="6" textAnchor="middle">
        MAD · 2022
      </text>
      <line x1={244} y1={74} x2={292} y2={74} className="hx-story-divider" />
      {[["Km", "42 000"], ["Carburant", "Diesel"], ["Ville", "Casablanca"]].map(([k, v], i) => (
        <g key={k}>
          <text x={240} y={88 + i * 14} className="hx-story-txt-dim" fontSize="6">
            {k}
          </text>
          <text x={296} y={88 + i * 14} className="hx-story-txt-muted" fontSize="6" textAnchor="end" fontWeight="500">
            {v}
          </text>
        </g>
      ))}
    </svg>
  );
}

function SceneRentals({ t }) {
  const chips = [t.airport, t.gps, t.insurance, t.delivery];
  return (
    <svg viewBox="0 0 320 156" fill="none" className="hx-story-svg" aria-hidden="true">
      <Panel x={12} y={14} w={136} h={128} r={12} className="hx-story-enter hx-story-d1" />
      <text x={24} y={32} className="hx-story-txt-muted" fontSize="7" fontWeight="600">
        {t.morocco}
      </text>
      <path
        d="M40 118 L52 96 L68 88 L88 82 L108 78 L128 72 L148 68 L168 64 L188 60 L208 58 L228 56 L248 58 L268 62 L288 68 L300 76 L308 88 L300 100 L280 108 L260 112 L240 116 L220 118 L200 120 L180 122 L160 124 L140 124 L120 122 L100 120 L80 118 L60 118 Z"
        className="hx-story-map"
      />
      {[
        [88, 92],
        [148, 78],
        [208, 72],
        [260, 88],
      ].map(([cx, cy], i) => (
        <g key={i} className={`hx-story-map-pin hx-story-pin-${i}`}>
          <circle cx={cx} cy={cy} r={5} className="hx-story-pin-ring" />
          <circle cx={cx} cy={cy} r={2.5} className="hx-story-pin-dot" />
        </g>
      ))}

      <Panel x={156} y={14} w={152} h={72} r={12} className="hx-story-enter hx-story-d2" />
      <text x={168} y={32} className="hx-story-txt-muted" fontSize="7" fontWeight="600">
        {t.rentalCar}
      </text>
      <rect x={168} y={40} width={128} height={22} rx={6} className="hx-story-date-bg" />
      <rect x={172} y={44} width={36} height={14} rx={4} className="hx-story-date-sel hx-story-date-pulse" />
      <text x={190} y={54} className="hx-story-txt-ink" fontSize="6.5" textAnchor="middle" fontWeight="600">
        {t.dates}
      </text>
      <rect x={168} y={68} width={128} height={10} rx={5} className="hx-story-bar-bg" />
      <rect x={168} y={68} width={96} height={10} rx={5} className="hx-story-bar-fill hx-story-bar-anim" />

      <Panel x={156} y={94} w={152} h={48} r={12} className="hx-story-enter hx-story-d3" />
      {chips.map((label, i) => (
        <g key={label}>
          <rect
            x={164 + (i % 2) * 74}
            y={104 + Math.floor(i / 2) * 16}
            width={68}
            height={12}
            rx={6}
            className="hx-story-chip"
          />
          <text
            x={198 + (i % 2) * 74}
            y={113 + Math.floor(i / 2) * 16}
            className="hx-story-txt-muted"
            fontSize="6"
            textAnchor="middle"
            fontWeight="500"
          >
            {label}
          </text>
        </g>
      ))}

      <rect x={228} y={118} width={72} height={20} rx={10} className="hx-story-cta hx-story-cta-pulse" />
      <text x={264} y={131} fill="#fff" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="system-ui,sans-serif">
        {t.reserve}
      </text>
    </svg>
  );
}

function SceneGarage({ t }) {
  const docs = [t.insuranceDoc, t.inspection, t.registration];
  return (
    <svg viewBox="0 0 320 156" fill="none" className="hx-story-svg" aria-hidden="true">
      <Panel x={12} y={14} w={98} h={128} r={12} className="hx-story-enter hx-story-d1" />
      <text x={24} y={32} className="hx-story-txt-muted" fontSize="7" fontWeight="600">
        {t.digital}
      </text>
      {docs.map((label, i) => (
        <g key={label}>
          <rect x={20} y={42 + i * 28} width={82} height={22} rx={6} className="hx-story-doc" />
          <rect x={26} y={48 + i * 28} width={10} height={10} rx={2} className="hx-story-doc-ico" />
          <text x={42} y={56 + i * 28} className="hx-story-txt-muted" fontSize="6.5" fontWeight="500">
            {label}
          </text>
          <path
            d={`M88 ${52 + i * 28} l2 2 5-5`}
            className="hx-story-check"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
      <text x={61} y={132} className="hx-story-txt-accent" fontSize="8" textAnchor="middle" fontWeight="700">
        {t.noPaper}
      </text>

      <Panel x={118} y={14} w={92} h={62} r={10} className="hx-story-enter hx-story-d2 hx-story-alert-panel" />
      <circle cx={132} cy={32} r={8} className="hx-story-alert-ico" />
      <text x={132} y={35} fill="#fff" fontSize="9" textAnchor="middle" fontWeight="700">
        !
      </text>
      <text x={146} y={30} className="hx-story-txt-muted" fontSize="7" fontWeight="600">
        {t.alert}
      </text>
      <text x={146} y={42} className="hx-story-txt-accent" fontSize="8" fontWeight="700">
        {t.days}
      </text>
      <rect x={128} y={50} width={74} height={4} rx={2} className="hx-story-bar-bg" />
      <rect x={128} y={50} width={48} height={4} rx={2} className="hx-story-alert-bar" />

      <Panel x={118} y={84} w={92} h={58} r={10} className="hx-story-enter hx-story-d3" />
      <circle cx={134} cy={100} r={10} className="hx-story-avatar" />
      <text x={134} y={103} fill="#fff" fontSize="8" textAnchor="middle" fontWeight="700">
        G
      </text>
      <text x={150} y={98} className="hx-story-txt-muted" fontSize="6.5" fontWeight="600">
        {t.mechanic}
      </text>
      <text x={150} y={108} className="hx-story-txt-accent" fontSize="6">
        {t.free}
      </text>
      <rect x={128} y={116} width={74} height={18} rx={9} className="hx-story-chat" />
      <circle cx={138} cy={125} r={2} className="hx-story-typing hx-story-typing-1" />
      <circle cx={146} cy={125} r={2} className="hx-story-typing hx-story-typing-2" />
      <circle cx={154} cy={125} r={2} className="hx-story-typing hx-story-typing-3" />
      <text x={196} y={108} className="hx-story-txt-dim" fontSize="5.5" textAnchor="end">
        {t.online}
      </text>

      <Panel x={218} y={14} w={90} h={128} r={12} className="hx-story-enter hx-story-d4" />
      <text x={230} y={32} className="hx-story-txt-muted" fontSize="7" fontWeight="600">
        {t.garage}
      </text>
      {[["Assurance", "12j"], ["Visite", "45j"], ["Contrôle", "OK"]].map(([k, v], i) => (
        <g key={k}>
          <rect x={226} y={42 + i * 30} width={74} height={24} rx={6} className="hx-story-stat" />
          <text x={234} y={56 + i * 30} className="hx-story-txt-dim" fontSize="6">
            {k}
          </text>
          <text x={292} y={56 + i * 30} className="hx-story-txt-accent" fontSize="7" textAnchor="end" fontWeight="700">
            {v}
          </text>
        </g>
      ))}
      <rect x={226} y={118} width={74} height={16} rx={8} className="hx-story-pill" />
      <text x={263} y={129} className="hx-story-txt-ink" fontSize="6.5" textAnchor="middle" fontWeight="600">
        {t.upToDate}
      </text>
    </svg>
  );
}

const SCENES = [SceneSales, SceneRentals, SceneGarage];

/** Mobile hero — 3-step product story (sales · rentals · garage). */
export default function HeroMobileVisual() {
  const { lang } = useAppLang();
  const [step, setStep] = useState(0);

  const steps = STORY[lang] || STORY.fr;
  const labels = LABELS[lang] || LABELS.fr;

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 4500);
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

        <div className="hx-hero-story-stage">
          <StoryDefs />
          {SCENES.map((S, i) => (
            <div key={i} className={`hx-hero-story-scene${i === step ? " is-active" : ""}`}>
              <S t={labels} />
            </div>
          ))}
        </div>

        <div className="hx-hero-story-steps">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`hx-hero-story-step${i === step ? " is-active" : ""}${i < step ? " is-done" : ""}`}
              onClick={() => setStep(i)}
              aria-label={s.title}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="hx-hero-story-step-n">{i + 1}</span>
              <span className="hx-hero-story-step-l">{s.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
