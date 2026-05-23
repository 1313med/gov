/**
 * Moroccan mechanic price benchmarks (MAD).
 * Blended with anonymous user submissions when enough data exists (≥3 reports).
 * Sources: typical garage quotes in MA major cities (2024–2026 ranges).
 */

const CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kenitra",
  "Salé",
  "Mohammedia",
  "Nador",
  "Tétouan",
  "Maroc",
];

const SERVICES = {
  oil_change: {
    labelFr: "Vidange (huile + filtre)",
    labelEn: "Oil change (oil + filter)",
    unit: "service",
    defaultRange: { min: 350, max: 750, avg: 520 },
    cityFactor: { Casablanca: 1.08, Rabat: 1.05, Marrakech: 1.06, Tanger: 1.02, Agadir: 1.04, Fès: 0.98, Maroc: 1 },
  },
  brake_pads: {
    labelFr: "Plaquettes de frein (jeu)",
    labelEn: "Brake pads (set)",
    unit: "service",
    defaultRange: { min: 700, max: 1800, avg: 1150 },
    cityFactor: { Casablanca: 1.1, Rabat: 1.06, Marrakech: 1.05, Maroc: 1 },
    modelHints: {
      "golf": { min: 700, max: 1200 },
      "clio": { min: 550, max: 950 },
      "dacia logan": { min: 500, max: 900 },
      "megane": { min: 650, max: 1100 },
    },
  },
  brake_discs: {
    labelFr: "Disques de frein (paire)",
    labelEn: "Brake discs (pair)",
    unit: "service",
    defaultRange: { min: 1200, max: 2800, avg: 1900 },
    cityFactor: { Casablanca: 1.1, Maroc: 1 },
  },
  labour_hour: {
    labelFr: "Main d'œuvre (par heure)",
    labelEn: "Labour (per hour)",
    unit: "hour",
    defaultRange: { min: 120, max: 280, avg: 180 },
    cityFactor: { Casablanca: 1.12, Rabat: 1.08, Marrakech: 1.05, Maroc: 1 },
  },
  timing_belt: {
    labelFr: "Courroie / chaîne de distribution",
    labelEn: "Timing belt / chain",
    unit: "service",
    defaultRange: { min: 3500, max: 9000, avg: 5800 },
    cityFactor: { Casablanca: 1.1, Maroc: 1 },
  },
  battery: {
    labelFr: "Batterie",
    labelEn: "Battery",
    unit: "piece",
    defaultRange: { min: 800, max: 2200, avg: 1400 },
    cityFactor: { Maroc: 1 },
  },
  tyres_set: {
    labelFr: "4 pneus (milieu de gamme)",
    labelEn: "4 tyres (mid-range)",
    unit: "set",
    defaultRange: { min: 2400, max: 5200, avg: 3600 },
    cityFactor: { Casablanca: 1.08, Maroc: 1 },
  },
  injector_clean: {
    labelFr: "Nettoyage injecteurs",
    labelEn: "Injector cleaning",
    unit: "service",
    defaultRange: { min: 400, max: 1200, avg: 750 },
    cityFactor: { Maroc: 1 },
  },
  clutch: {
    labelFr: "Embrayage",
    labelEn: "Clutch replacement",
    unit: "service",
    defaultRange: { min: 4500, max: 12000, avg: 7500 },
    cityFactor: { Maroc: 1 },
  },
};

const FUEL_PRICE_MAD = { essence: 14.2, diesel: 12.8, hybride: 14, electrique: 1.2 };
const INSURANCE_MONTHLY = { economy: 380, mid: 520, premium: 850, luxury: 1200 };
const VIGNETTE_YEARLY = 350;
const VISITE_YEARLY = 400;

function normalizeCity(c) {
  const s = String(c || "Maroc").trim();
  const hit = CITIES.find((x) => x.toLowerCase() === s.toLowerCase());
  return hit || "Maroc";
}

function getBenchmark(serviceKey, city, brandModelKey) {
  const svc = SERVICES[serviceKey];
  if (!svc) return null;
  const c = normalizeCity(city);
  const factor = svc.cityFactor?.[c] ?? svc.cityFactor?.Maroc ?? 1;
  let { min, max, avg } = svc.defaultRange;
  const hint = brandModelKey && svc.modelHints?.[brandModelKey];
  if (hint) {
    min = hint.min;
    max = hint.max;
    avg = Math.round((min + max) / 2);
  }
  return {
    serviceKey,
    labelFr: svc.labelFr,
    labelEn: svc.labelEn,
    unit: svc.unit,
    city: c,
    min: Math.round(min * factor),
    max: Math.round(max * factor),
    avg: Math.round(avg * factor),
    source: "benchmark_ma",
    reportCount: 0,
  };
}

function evaluateQuote(serviceKey, quotedPrice, city, brandModelKey) {
  const b = getBenchmark(serviceKey, city, brandModelKey);
  if (!b || !quotedPrice) return null;
  const p = Number(quotedPrice);
  let verdict = "fair";
  let messageFr = "Dans la fourchette normale pour le Maroc.";
  let messageEn = "Within the normal range for Morocco.";
  if (p < b.min * 0.85) {
    verdict = "cheap";
    messageFr = "En dessous de la moyenne — vérifiez la qualité des pièces.";
    messageEn = "Below average — check parts quality.";
  } else if (p > b.max * 1.15) {
    verdict = "expensive";
    messageFr = "Ce devis semble cher pour cette ville.";
    messageEn = "This quote seems expensive for this city.";
  } else if (p > b.max) {
    verdict = "high";
    messageFr = "Légèrement au-dessus de la fourchette habituelle.";
    messageEn = "Slightly above the usual range.";
  }
  return { ...b, quotedPrice: p, verdict, messageFr, messageEn };
}

module.exports = {
  CITIES,
  SERVICES,
  FUEL_PRICE_MAD,
  INSURANCE_MONTHLY,
  VIGNETTE_YEARLY,
  VISITE_YEARLY,
  normalizeCity,
  getBenchmark,
  evaluateQuote,
};
