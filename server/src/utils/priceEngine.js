"use strict";

const CURRENT_YEAR = new Date().getFullYear();

// Median new-car price in Morocco (MAD) — official or grey-market import prices,
// calibrated against Avito.ma / Moteur.ma real listings + import duty structure.
// Moroccan new-car prices are 30-50% above Europe due to 40-60% import duties.
const BRAND_BASES = {
  // Economy — officially sold via Moroccan dealers
  dacia:        { base: 120000, tier: "economy" },
  renault:      { base: 175000, tier: "economy" },
  peugeot:      { base: 185000, tier: "economy" },
  citroen:      { base: 178000, tier: "economy" },
  fiat:         { base: 138000, tier: "economy" },
  // European imports (no official dealer → grey market premium)
  seat:         { base: 200000, tier: "economy" },
  opel:         { base: 195000, tier: "mid" },
  suzuki:       { base: 165000, tier: "economy" },
  lada:         { base:  98000, tier: "economy" },
  // Mid — officially sold
  volkswagen:   { base: 295000, tier: "mid" },
  vw:           { base: 295000, tier: "mid" },
  toyota:       { base: 235000, tier: "mid" },
  honda:        { base: 255000, tier: "mid" },
  hyundai:      { base: 215000, tier: "mid" },
  kia:          { base: 228000, tier: "mid" },
  nissan:       { base: 228000, tier: "mid" },
  ford:         { base: 238000, tier: "mid" },
  mazda:        { base: 248000, tier: "mid" },
  mitsubishi:   { base: 235000, tier: "mid" },
  skoda:        { base: 228000, tier: "mid" },
  chevrolet:    { base: 208000, tier: "mid" },
  // Premium
  bmw:          { base: 520000, tier: "premium" },
  mercedes:     { base: 575000, tier: "premium" },
  "mercedes-benz": { base: 575000, tier: "premium" },
  audi:         { base: 490000, tier: "premium" },
  volvo:        { base: 460000, tier: "premium" },
  lexus:        { base: 575000, tier: "premium" },
  infiniti:     { base: 478000, tier: "premium" },
  // Luxury
  porsche:      { base: 980000, tier: "luxury" },
  "land rover": { base: 820000, tier: "luxury" },
  jaguar:       { base: 715000, tier: "luxury" },
  // Default fallback
  default:      { base: 178000, tier: "economy" },
};

const FUEL_FACTORS = {
  diesel: 1.05, gasoil: 1.05,
  electric: 1.15, électrique: 1.15, electrique: 1.15,
  hybrid: 1.10, hybride: 1.10,
  lpg: 0.92, gpl: 0.92,
  essence: 1.0, gasoline: 1.0,
};

// Moroccan depreciation is significantly slower than Europe:
// - Import duties make new cars expensive → used cars hold value longer
// - Limited supply of quality used cars → buyers pay a premium
// Calibrated against real Moroccan listings (Avito.ma / Moteur.ma).
function getDepreciation(age) {
  if (age <= 0) return 1.0;
  let m = 1.0;
  for (let i = 1; i <= Math.min(age, 25); i++) {
    if (i === 1)      m *= 0.88; // Year 1: -12% (first-owner penalty)
    else if (i <= 3)  m *= 0.91; // Years 2-3: -9%/year
    else if (i <= 7)  m *= 0.93; // Years 4-7: -7%/year
    else if (i <= 12) m *= 0.95; // Years 8-12: -5%/year
    else              m *= 0.97; // Years 13+: -3%/year
  }
  return Math.max(m, 0.10); // floor at 10% of new price
}

function estimate({ brand, model, year, mileage, fuel, gearbox }) {
  const key = (brand || "").toLowerCase().trim();
  const brandData = BRAND_BASES[key] || BRAND_BASES.default;
  const parsedYear = parseInt(year) || CURRENT_YEAR;
  const age = Math.max(0, CURRENT_YEAR - parsedYear);

  const deprFactor = getDepreciation(age);
  let price = brandData.base * deprFactor;

  // Mileage adjustment vs expected average (20 000 km/year Morocco)
  const expectedKm = age * 20000;
  const actualKm   = parseInt(mileage) || expectedKm;
  const kmDiff     = actualKm - expectedKm;
  const kmFactor   = Math.max(0.72, Math.min(1.05, 1 - (kmDiff / 10000) * 0.015));
  price *= kmFactor;

  // Fuel
  const fuelKey    = (fuel || "").toLowerCase().trim();
  const fuelFactor = FUEL_FACTORS[fuelKey] || 1.0;
  price *= fuelFactor;

  // Gearbox
  const gearKey    = (gearbox || "").toLowerCase().trim();
  const gearFactor = ["automatic", "automatique", "auto"].includes(gearKey) ? 1.07 : 1.0;
  price *= gearFactor;

  const mid  = Math.round(price / 500) * 500;
  const low  = Math.round(price * 0.88 / 500) * 500;
  const high = Math.round(price * 1.12 / 500) * 500;

  const breakdown = buildBreakdown({
    brandData, age, deprFactor, kmFactor, fuelFactor, gearFactor,
    actualKm, expectedKm, fuelKey, gearKey, parsedYear,
  });

  return { low, mid, high, tier: brandData.tier, age, breakdown };
}

const TIER_LABELS = { economy: "segment économique", mid: "segment intermédiaire", premium: "segment premium", luxury: "segment luxe" };

function buildBreakdown({ brandData, age, deprFactor, kmFactor, fuelFactor, gearFactor, actualKm, expectedKm, fuelKey, gearKey, parsedYear }) {
  const items = [];

  items.push({
    label: "Prix de référence neuf",
    value: `${brandData.base.toLocaleString()} MAD`,
    note: `Estimation pour le ${TIER_LABELS[brandData.tier] || brandData.tier} au Maroc`,
    positive: null,
  });

  const deprPct = Math.round((1 - deprFactor) * 100);
  items.push({
    label: `Dépréciation (${age} an${age !== 1 ? "s" : ""})`,
    value: `-${deprPct}%`,
    note: age <= 2 ? "Forte dépréciation les premières années" : age <= 5 ? "Dépréciation modérée" : "Dépréciation ralentie avec l'âge",
    positive: false,
  });

  if (Math.abs(actualKm - expectedKm) > 5000) {
    const diff = actualKm - expectedKm;
    const pct  = Math.abs(Math.round((kmFactor - 1) * 100));
    items.push({
      label: diff > 0 ? "Kilométrage élevé" : "Faible kilométrage",
      value: diff > 0 ? `-${pct}%` : `+${pct}%`,
      note: diff > 0
        ? `${actualKm.toLocaleString()} km vs ${expectedKm.toLocaleString()} km attendus pour ${parsedYear}`
        : `${actualKm.toLocaleString()} km, bien en dessous de la moyenne pour ${parsedYear}`,
      positive: diff < 0,
    });
  }

  if (fuelFactor !== 1.0) {
    const pct = Math.round(Math.abs(fuelFactor - 1) * 100);
    const FUEL_LABELS = {
      diesel: "Diesel (préféré au Maroc)", gasoil: "Diesel (préféré au Maroc)",
      electric: "Électrique (haute valeur)", électrique: "Électrique", electrique: "Électrique",
      hybrid: "Hybride", hybride: "Hybride",
      lpg: "LPG / GPL (moins prisé)", gpl: "LPG / GPL (moins prisé)",
    };
    items.push({
      label: FUEL_LABELS[fuelKey] || "Carburant",
      value: fuelFactor > 1 ? `+${pct}%` : `-${pct}%`,
      note: fuelFactor > 1 ? "Prime sur le marché marocain" : "Décote sur le marché marocain",
      positive: fuelFactor > 1,
    });
  }

  if (gearFactor !== 1.0) {
    items.push({
      label: "Boîte automatique",
      value: "+7%",
      note: "Demande croissante pour l'automatique au Maroc",
      positive: true,
    });
  }

  return items;
}

// Smart recommendations based on car profile — fully deterministic, no DB needed
function getRecommendations(car) {
  const recs = [];
  const age   = Math.max(0, CURRENT_YEAR - (parseInt(car.year) || CURRENT_YEAR));
  const brand = (car.brand || "").toLowerCase();
  const fuel  = (car.fuelType || car.fuel || "").toLowerCase();
  const km    = parseInt(car.currentMileage) || 0;

  // Fuel-specific tips
  if (["diesel", "gasoil"].includes(fuel)) {
    recs.push({
      type: "maintenance", icon: "water-outline", color: "#f97316",
      title: "Filtre à gasoil",
      body: "Les moteurs diesel nécessitent un filtre à carburant changé tous les 40 000 km. Un filtre encrassé augmente la conso de 10-15%.",
    });
    if (km > 100000) {
      recs.push({
        type: "maintenance", icon: "settings-outline", color: "#ef4444",
        title: "Injecteurs diesel",
        body: "Au-delà de 100 000 km, un nettoyage professionnel des injecteurs peut redonner des performances et économiser du carburant.",
      });
    }
  }

  if (["essence", "gasoline"].includes(fuel)) {
    recs.push({
      type: "maintenance", icon: "flash-outline", color: "#eab308",
      title: "Bougies d'allumage",
      body: "Remplacez les bougies tous les 30 000 km. Des bougies usées font perdre puissance et consomment plus.",
    });
  }

  if (["electric", "electrique", "électrique"].includes(fuel)) {
    recs.push({
      type: "tip", icon: "battery-charging-outline", color: "#22c55e",
      title: "Santé de la batterie",
      body: "Gardez la charge entre 20% et 80% au quotidien. Évitez la charge rapide systématique pour préserver les cellules.",
    });
  }

  // Age-based
  if (age >= 5) {
    recs.push({
      type: "inspection", icon: "shield-checkmark-outline", color: "#38bdf8",
      title: "Courroie de distribution",
      body: `Votre ${car.brand} a ${age} an${age > 1 ? "s" : ""}. Vérifiez l'état de la courroie de distribution — une rupture détruit le moteur sans avertissement.`,
    });
  }

  if (age >= 8) {
    recs.push({
      type: "sell", icon: "trending-up-outline", color: "#a78bfa",
      title: "Bonne fenêtre de vente",
      body: `Les ${car.brand} de ${car.year || ""} se vendent encore bien. Estimez la valeur maintenant avant que la dépréciation s'accélère.`,
      action: "estimate",
    });
  }

  // Brand-specific
  if (["dacia", "renault"].includes(brand)) {
    recs.push({
      type: "tip", icon: "construct-outline", color: "#f97316",
      title: "Pièces : original vs compatible",
      body: "Pour les pièces critiques (freins, courroie, pompe à eau) privilégiez toujours les pièces d'origine Dacia/Renault. Pour le reste, les compatibles sont acceptables.",
    });
  }

  if (["bmw", "mercedes", "mercedes-benz", "audi"].includes(brand)) {
    recs.push({
      type: "tip", icon: "alert-circle-outline", color: "#a78bfa",
      title: "Entretien agréé obligatoire",
      body: `${car.brand} exige des révisions en centre agréé. Des pièces non-origine peuvent invalider la garantie et générer des pannes électroniques coûteuses.`,
    });
  }

  if (["toyota", "honda"].includes(brand)) {
    recs.push({
      type: "tip", icon: "checkmark-circle-outline", color: "#22c55e",
      title: "Fiabilité longue durée",
      body: `${car.brand} est parmi les marques les plus fiables au Maroc. Avec un entretien régulier, votre véhicule peut dépasser 300 000 km sans grosse panne.`,
    });
  }

  // High mileage
  if (km > 150000) {
    recs.push({
      type: "maintenance", icon: "construct-outline", color: "#ef4444",
      title: "Révision complète recommandée",
      body: `À ${km.toLocaleString()} km, une révision complète (liquides, filtres, courroies, freins, amortisseurs) peut augmenter la valeur de revente de 5 000 à 15 000 MAD.`,
    });
  }

  return recs.slice(0, 5);
}

module.exports = { estimate, getRecommendations };
