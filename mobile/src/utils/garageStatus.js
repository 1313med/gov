import { pickLang, dateLocaleTag, formatNumber } from "./i18n";
import { arOverrides } from "../locales/arOverrides";

const p = (lang, en, fr, ar) => pickLang(lang, en, fr, ar, arOverrides);

const CURRENT_YEAR = new Date().getFullYear();

export function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

export function kmLeft(car) {
  if (!car?.vidange?.lastKm || !car?.vidange?.intervalKm || !car?.currentMileage) return null;
  return car.vidange.lastKm + car.vidange.intervalKm - car.currentMileage;
}

export function computeStatuses(car) {
  if (!car) return null;
  const chainExpiry = car.chainDistribution?.lastChangeDate
    ? new Date(new Date(car.chainDistribution.lastChangeDate).getTime() + 365 * 5 * 86400000).toISOString()
    : null;
  const pneusExpiry = car.pneus?.lastChangeDate
    ? new Date(new Date(car.pneus.lastChangeDate).getTime() + 365 * 2 * 86400000).toISOString()
    : null;
  const batterieExpiry = car.batterie?.lastChangeDate
    ? new Date(new Date(car.batterie.lastChangeDate).getTime() + 365 * 3 * 86400000).toISOString()
    : null;
  const freinsExpiry = car.freins?.lastChangeDate
    ? new Date(new Date(car.freins.lastChangeDate).getTime() + 365 * 2 * 86400000).toISOString()
    : null;

  return {
    assurance: daysLeft(car.assurance?.expiryDate),
    visiteTechnique: daysLeft(car.visiteTechnique?.expiryDate),
    vignette: daysLeft(car.vignette?.expiryDate),
    permis: daysLeft(car.permis?.expiryDate),
    vidange: kmLeft(car),
    pneus: daysLeft(pneusExpiry),
    batterie: daysLeft(batterieExpiry),
    freins: daysLeft(freinsExpiry),
    chainDistribution: chainExpiry ? daysLeft(chainExpiry) : null,
  };
}

export function urgencyTier(value, type) {
  if (value === null || value === undefined) return "unknown";
  if (type === "km") {
    if (value <= 0) return "critical";
    if (value <= 500) return "critical";
    if (value <= 1500) return "warning";
    return "ok";
  }
  if (value <= 0) return "critical";
  if (value <= 7) return "critical";
  if (value <= 30) return "warning";
  return "ok";
}

export function tierColor(tier, C) {
  if (tier === "critical") return "#ef4444";
  if (tier === "warning") return "#f97316";
  if (tier === "ok") return C?.green ?? "#22c55e";
  return C?.muted ?? "#94a3b8";
}

export function tierIcon(tier) {
  if (tier === "critical") return "warning";
  if (tier === "warning") return "alert-circle";
  if (tier === "ok") return "checkmark-circle";
  return "ellipse-outline";
}

export function formatTrackDate(dateStr, lang) {
  if (!dateStr) return p(lang, "Not set", "Non renseigné", "Ma m3tach");
  return new Date(dateStr).toLocaleDateString(dateLocaleTag(lang), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function trackStatusLabel(value, type, lang) {
  if (type === "km") {
    if (value === null) return p(lang, "Add data", "À renseigner", "Zid m3lomat");
    if (value <= 0) return p(lang, "Overdue", "Dépassé", "T3ada");
    return `${formatNumber(value, lang)} km`;
  }
  if (value === null) return p(lang, "Add data", "À renseigner", "Zid m3lomat");
  if (value <= 0) return p(lang, "Expired", "Expiré", "Sala");
  if (value === 1) return p(lang, "1 day", "1 jour", "nhar wa7ed");
  return lang === "ar" ? `${value} ي` : lang === "fr" ? `${value} j` : `${value} d`;
}

export function progressRatio(value, type, intervalKm = 10000) {
  if (value === null) return 0;
  if (type === "km") {
    return Math.max(0, Math.min(1, value / intervalKm));
  }
  return Math.max(0, Math.min(1, value / 365));
}

function mechanicalDueDate(lastChangeDate, years) {
  if (!lastChangeDate) return null;
  const d = new Date(lastChangeDate);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
}

export function buildTrackItems(car, statuses, lang) {
  if (!car || !statuses) return [];

  const items = [
    {
      id: "assurance",
      category: "papers",
      label: p(lang, "Insurance", "Assurance", "Assurance"),
      hint: p(lang, "Mandatory coverage", "Couverture obligatoire", "Tghliya wajiba"),
      icon: "shield-checkmark-outline",
      color: "#f97316",
      value: statuses.assurance,
      type: "days",
      expiry: car.assurance?.expiryDate,
    },
    {
      id: "visite",
      category: "papers",
      label: p(lang, "Technical inspection", "Visite technique", "Visite technique"),
      hint: p(lang, "Legal inspection", "Contrôle légal", "Control qanouni"),
      icon: "clipboard-outline",
      color: "#fb923c",
      value: statuses.visiteTechnique,
      type: "days",
      expiry: car.visiteTechnique?.expiryDate,
    },
    {
      id: "vignette",
      category: "papers",
      label: p(lang, "Road tax", "Vignette", "Vignette"),
      hint: p(lang, "Annual tax", "Taxe annuelle", "Dariba snaouya"),
      icon: "receipt-outline",
      color: "#eab308",
      value: statuses.vignette,
      type: "days",
      expiry: car.vignette?.expiryDate,
    },
    {
      id: "permis",
      category: "papers",
      label: p(lang, "Driving licence", "Permis de conduire", "Permis"),
      hint: p(lang, "Personal validity", "Validité personnelle", "Sahl dyalek"),
      icon: "card-outline",
      color: "#a78bfa",
      value: statuses.permis,
      type: "days",
      expiry: car.permis?.expiryDate,
    },
    {
      id: "vidange",
      category: "mechanical",
      label: p(lang, "Oil change", "Vidange", "Vidange"),
      hint: p(lang, "Engine & filters", "Moteur & filtres", "Moteur w filtres"),
      icon: "water-outline",
      color: "#38bdf8",
      value: statuses.vidange,
      type: "km",
      expiry: car.vidange?.lastKm ? car.vidange.lastKm + (car.vidange.intervalKm || 0) : null,
      intervalKm: car.vidange?.intervalKm || 10000,
    },
    {
      id: "pneus",
      category: "mechanical",
      label: p(lang, "Tyres", "Pneus", "Pneus"),
      hint: p(lang, "Grip & safety", "Adhérence & sécurité", "Lissk a aman"),
      icon: "disc-outline",
      color: "#22d3ee",
      value: statuses.pneus,
      type: "days",
      expiry: mechanicalDueDate(car.pneus?.lastChangeDate, 2),
    },
    {
      id: "freins",
      category: "mechanical",
      label: p(lang, "Brakes", "Freins", "Freins"),
      hint: p(lang, "Pads & discs", "Disques & plaquettes", "Disques w plaquettes"),
      icon: "stop-circle-outline",
      color: "#f87171",
      value: statuses.freins,
      type: "days",
      expiry: mechanicalDueDate(car.freins?.lastChangeDate, 2),
    },
    {
      id: "batterie",
      category: "mechanical",
      label: p(lang, "Battery", "Batterie", "Batterie"),
      hint: p(lang, "Reliable starts", "Démarrage fiable", "Demarrage mzyan"),
      icon: "battery-charging-outline",
      color: "#4ade80",
      value: statuses.batterie,
      type: "days",
      expiry: mechanicalDueDate(car.batterie?.lastChangeDate, 3),
    },
  ];

  items.push({
    id: "chain",
    category: "mechanical",
    label: p(lang, "Timing chain", "Chaîne de distribution", "Chaine distribution"),
    hint: p(lang, "Critical component", "Composant critique", "Piece mohima"),
    icon: "cog-outline",
    color: "#c084fc",
    value: car.chainDistribution?.lastChangeDate ? statuses.chainDistribution : null,
    type: "days",
    expiry: mechanicalDueDate(car.chainDistribution?.lastChangeDate, 5),
  });

  const rank = { critical: 0, warning: 1, unknown: 2, ok: 3 };
  return items
    .map((item) => ({ ...item, tier: urgencyTier(item.value, item.type) }))
    .sort((a, b) => rank[a.tier] - rank[b.tier] || (a.value ?? 9999) - (b.value ?? 9999));
}

export function computeGarageHealth(trackItems) {
  if (!trackItems.length) return { score: 0, labelKey: "empty" };
  let total = 0;
  let count = 0;
  for (const item of trackItems) {
    if (item.tier === "unknown") continue;
    count++;
    if (item.tier === "ok") total += 100;
    else if (item.tier === "warning") total += 62;
    else total += 28;
  }
  if (!count) return { score: 72, labelKey: "incomplete" };
  const score = Math.round(total / count);
  let labelKey = "excellent";
  if (score < 50) labelKey = "critical";
  else if (score < 70) labelKey = "attention";
  else if (score < 85) labelKey = "good";
  return { score, labelKey };
}

export function countAlerts(trackItems) {
  return trackItems.filter((i) => i.tier === "critical" || i.tier === "warning").length;
}

export function soonestDeadline(trackItems, lang) {
  const urgent = trackItems.filter((i) => i.tier === "critical" || i.tier === "warning");
  if (!urgent.length) return null;
  const first = urgent[0];
  return {
    label: first.label,
    status: trackStatusLabel(first.value, first.type, lang),
    tier: first.tier,
  };
}

export function carAgeYears(car) {
  return Math.max(0, CURRENT_YEAR - (parseInt(car?.year, 10) || CURRENT_YEAR));
}
