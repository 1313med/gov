import { getBrandBySlug } from "./brands.js";

/** Curated technical specs — only models with verified data get encyclopedia pages. */
const SPECS = {
  "dacia:logan": {
    segment: "Berline compacte",
    engine: "1.0 SCe / 1.5 dCi",
    power: "65–95 ch",
    transmission: "Manuelle / BVM",
    fuel: "Essence / Diesel",
    consumption: "5.2–4.8 L/100 km",
    trunk: "510 L",
    seats: 5,
    safety: "3 airbags, ABS, ESP",
    moroccoNotes: "Meilleure vente neuf/occasion au Maroc — pièces abondantes, SAV Dacia étendu.",
  },
  "dacia:sandero": {
    segment: "Citadine",
    engine: "1.0 SCe / 1.0 TCe",
    power: "65–90 ch",
    transmission: "Manuelle / BVM",
    fuel: "Essence",
    consumption: "5.0 L/100 km",
    trunk: "320 L",
    seats: 5,
    safety: "ABS, ESP, aide au démarrage en côte",
    moroccoNotes: "Idéale ville — stationnement facile, entretien économique.",
  },
  "dacia:duster": {
    segment: "SUV compact",
    engine: "1.5 dCi / 1.3 TCe",
    power: "115–150 ch",
    transmission: "Manuelle / BVM",
    fuel: "Diesel / Essence",
    consumption: "5.5–6.2 L/100 km",
    trunk: "478 L",
    seats: 5,
    safety: "ESP, contrôle de trajectoire, 6 airbags (selon finition)",
    moroccoNotes: "Référence routes nationales et pistes — forte demande location.",
  },
  "renault:clio": {
    segment: "Citadine polyvalente",
    engine: "1.0 SCe / 1.5 dCi / E-Tech hybrid",
    power: "65–145 ch",
    transmission: "Manuelle / EDC",
    fuel: "Essence / Diesel / Hybride",
    consumption: "4.8–5.5 L/100 km",
    trunk: "391 L",
    seats: 5,
    safety: "5★ Euro NCAP (gen. récente), AEB disponible",
    moroccoNotes: "Très liquide en occasion — comparez les finitions Zen/Intens.",
  },
  "renault:symbol": {
    segment: "Berline tronc",
    engine: "1.0 SCe / 1.5 dCi",
    power: "65–90 ch",
    fuel: "Essence / Diesel",
    consumption: "5.5 L/100 km",
    trunk: "510 L",
    seats: 5,
    moroccoNotes: "Populaire taxis et flottes — robuste, coût km faible.",
  },
  "peugeot:208": {
    segment: "Citadine premium",
    engine: "1.2 PureTech / électrique e-208",
    power: "75–136 ch",
    transmission: "Manuelle / EAT8",
    fuel: "Essence / Électrique",
    consumption: "5.0–5.8 L/100 km",
    trunk: "311 L",
    seats: 5,
    safety: "i-Cockpit, alerte angle mort (option)",
    moroccoNotes: "Finition supérieure — budget entretien plus élevé que Dacia.",
  },
  "hyundai:i10": {
    segment: "Micro-citadine",
    engine: "1.0 / 1.2",
    power: "67–84 ch",
    fuel: "Essence",
    consumption: "4.9 L/100 km",
    trunk: "252 L",
    seats: 5,
    moroccoNotes: "Concurrence directe Picanto — garantie constructeur attractive.",
  },
  "hyundai:tucson": {
    segment: "SUV compact",
    engine: "1.6 T-GDi / Hybrid",
    power: "150–230 ch",
    transmission: "Manuelle / DCT",
    fuel: "Essence / Hybride",
    consumption: "6.5–7.5 L/100 km",
    trunk: "620 L",
    seats: 5,
    moroccoNotes: "SUV familial très demandé — bon rapport équipement/prix.",
  },
  "volkswagen:polo": {
    segment: "Citadine",
    engine: "1.0 TSI",
    power: "80–110 ch",
    fuel: "Essence",
    consumption: "5.3 L/100 km",
    trunk: "351 L",
    seats: 5,
    moroccoNotes: "Qualité perçue VW — revente stable sur grandes villes.",
  },
  "toyota:yaris": {
    segment: "Citadine",
    engine: "1.5 Hybrid",
    power: "116 ch",
    fuel: "Hybride",
    consumption: "3.8–4.5 L/100 km",
    trunk: "286 L",
    seats: 5,
    moroccoNotes: "Fiabilité légendaire — prime en occasion récente.",
  },
  "kia:picanto": {
    segment: "Micro-citadine",
    engine: "1.0 / 1.2",
    power: "67–84 ch",
    fuel: "Essence",
    consumption: "4.9 L/100 km",
    trunk: "255 L",
    seats: 5,
    moroccoNotes: "Garantie 7 ans — argument clé vs occasion importée.",
  },
  "fiat:500": {
    segment: "Citadine style",
    engine: "1.0 / 1.2 / électrique",
    power: "70–118 ch",
    fuel: "Essence / Électrique",
    consumption: "5.0 L/100 km",
    trunk: "185 L",
    seats: 4,
    moroccoNotes: "Niche urbaine — entretien Fiat disponible Casablanca/Rabat.",
  },
  "seat:ibiza": {
    segment: "Citadine sportive",
    engine: "1.0 TSI",
    power: "80–110 ch",
    fuel: "Essence",
    consumption: "5.2 L/100 km",
    trunk: "355 L",
    seats: 5,
    moroccoNotes: "Plateforme VW — bon compromis dynamisme/coût.",
  },
  "mercedes:classe-a": {
    segment: "Compacte premium",
    engine: "1.3 / 2.0 / AMG",
    power: "136–421 ch",
    fuel: "Essence / Diesel",
    consumption: "6.5–8.0 L/100 km",
    trunk: "370 L",
    seats: 5,
    moroccoNotes: "Entretien concessionnaire — vérifier historique complet.",
  },
  "bmw:serie-3": {
    segment: "Berline premium",
    engine: "2.0 TwinPower",
    power: "156–374 ch",
    fuel: "Essence / Diesel / Hybride",
    consumption: "6.0–7.5 L/100 km",
    trunk: "480 L",
    seats: 5,
    moroccoNotes: "Import Allemagne fréquent — contrôler homologation et CT.",
  },
};

export function getVehicleSpec(brandSlug, modelSlug) {
  const brand = getBrandBySlug(brandSlug);
  if (!brand || !brand.models.includes(modelSlug)) return null;
  const key = `${brandSlug}:${modelSlug}`;
  const spec = SPECS[key];
  if (!spec) return null;
  const modelName = modelSlug.replace(/-/g, " ");
  const brandName = brand.name.fr;
  return {
    brandSlug,
    modelSlug,
    brandName,
    modelName,
    displayName: `${brandName} ${modelName}`,
    path: `/fiche-technique/${brandSlug}/${modelSlug}`,
    pricePath: `/prix/${brandSlug}/${modelSlug}`,
    comparePath: `/marque/${brandSlug}/${modelSlug}`,
    ...spec,
    faqs: [
      {
        q: `Quelle motorisation choisir pour ${brandName} ${modelName} au Maroc ?`,
        a: `Privilégiez ${spec.fuel?.split("/")[0]?.trim() || "essence"} pour usage urbain ; diesel si +30 000 km/an sur route.`,
      },
      {
        q: `Consommation réelle ${brandName} ${modelName} ?`,
        a: `Comptez ${spec.consumption} en conduite mixte — +10 à 15 % en ville estivale avec climatisation.`,
      },
      {
        q: `Entretien ${brandName} ${modelName} au Maroc`,
        a: spec.moroccoNotes,
      },
    ],
  };
}

export function getAllVehicleSpecs() {
  return Object.keys(SPECS)
    .map((key) => {
      const [brandSlug, modelSlug] = key.split(":");
      return getVehicleSpec(brandSlug, modelSlug);
    })
    .filter(Boolean);
}

export function vehicleSpecPath(brandSlug, modelSlug) {
  return `/fiche-technique/${brandSlug}/${modelSlug}`;
}

export function priceIntelPath(brandSlug, modelSlug) {
  return `/prix/${brandSlug}/${modelSlug}`;
}

export function datasetPath(brandSlug, modelSlug) {
  return `/donnees/prix/${brandSlug}/${modelSlug}`;
}
