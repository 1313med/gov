import { getBrandBySlug } from "./brands.js";
import { getVehicleSpec } from "./vehicleSpecs.js";

/** Curated reliability baseline — only models with vehicleSpecs get index pages. */
const RELIABILITY = {
  "dacia:logan": {
    score: 88,
    grade: "A",
    strengths: ["Pièces abondantes et peu chères", "Entretien simple", "SAV Dacia étendu au Maroc"],
    weaknesses: ["Finitions basiques", "Consommation diesel élevée en ville"],
    resaleIndex: 82,
    partsAvailability: 95,
    moroccoVerdict: "Référence fiabilité budget au Maroc — idéale flottes et premiers achats.",
  },
  "dacia:sandero": {
    score: 86,
    grade: "A",
    strengths: ["Robuste en usage urbain", "Coût km faible", "Bon marché de l'occasion"],
    weaknesses: ["Isolation phonique limitée", "Revente légèrement inférieure à Logan"],
    resaleIndex: 78,
    partsAvailability: 94,
    moroccoVerdict: "Citadine économique très fiable pour Casablanca et Rabat.",
  },
  "dacia:duster": {
    score: 84,
    grade: "A",
    strengths: ["Tenue de route routes nationales", "4x2/4x4 adaptés Maroc", "Demande location forte"],
    weaknesses: ["Intérieur vieillissant sur anciennes gen.", "Consommation route"],
    resaleIndex: 85,
    partsAvailability: 92,
    moroccoVerdict: "SUV le plus demandé pour routes et pistes légères.",
  },
  "renault:clio": {
    score: 81,
    grade: "B",
    strengths: ["Réseau Renault dense", "Occasion liquide", "Motorisations variées"],
    weaknesses: ["Injecteurs diesel vers 170 000 km", "Coût entretien supérieur à Dacia"],
    resaleIndex: 83,
    partsAvailability: 90,
    moroccoVerdict: "Excellent compromis — vérifiez historique diesel.",
  },
  "renault:symbol": {
    score: 85,
    grade: "A",
    strengths: ["Robuste flottes/taxis", "Pièces Logan compatibles", "Faible coût km"],
    weaknesses: ["Design daté", "Équipements limités"],
    resaleIndex: 80,
    partsAvailability: 93,
    moroccoVerdict: "Choix pro et VTC — fiabilité éprouvée.",
  },
  "peugeot:208": {
    score: 76,
    grade: "B",
    strengths: ["Finition premium", "PureTech performant", "Bonne tenue de route"],
    weaknesses: ["Courroie distribution à surveiller", "Entretien plus cher que Dacia"],
    resaleIndex: 74,
    partsAvailability: 82,
    moroccoVerdict: "Citadine premium — budget entretien à prévoir.",
  },
  "hyundai:i10": {
    score: 83,
    grade: "A",
    strengths: ["Garantie constructeur attractive", "Fiabilité moteur essence", "Compacte ville"],
    weaknesses: ["Espace réduit", "Revente modérée hors grandes villes"],
    resaleIndex: 72,
    partsAvailability: 78,
    moroccoVerdict: "Micro-citadine fiable avec bon SAV Hyundai.",
  },
  "hyundai:tucson": {
    score: 80,
    grade: "B",
    strengths: ["SUV familial complet", "Garantie longue", "Demande occasion forte"],
    weaknesses: ["Consommation hybride/essence", "Pièces premium"],
    resaleIndex: 81,
    partsAvailability: 80,
    moroccoVerdict: "SUV familial très demandé — vérifiez finition hybrid.",
  },
  "volkswagen:polo": {
    score: 78,
    grade: "B",
    strengths: ["Qualité perçue VW", "Revente stable grandes villes", "Châssis solide"],
    weaknesses: ["Coût pièces élevé", "DSG à entretenir si BVM auto"],
    resaleIndex: 79,
    partsAvailability: 76,
    moroccoVerdict: "Citadine premium — import Allemagne fréquent, contrôler CT.",
  },
  "toyota:yaris": {
    score: 90,
    grade: "A",
    strengths: ["Fiabilité hybride légendaire", "Consommation faible", "Revente rapide"],
    weaknesses: ["Prix occasion élevé", "Attente sur stock neuf"],
    resaleIndex: 91,
    partsAvailability: 75,
    moroccoVerdict: "Top fiabilité et revente — prime en occasion récente.",
  },
  "kia:picanto": {
    score: 82,
    grade: "A",
    strengths: ["Garantie 7 ans", "Entretien économique", "Concurrence i10 directe"],
    weaknesses: ["Motorisation modeste", "Revente hors réseau Kia"],
    resaleIndex: 73,
    partsAvailability: 77,
    moroccoVerdict: "Alternative fiable à i10 — bon rapport garantie/prix.",
  },
  "fiat:500": {
    score: 70,
    grade: "C",
    strengths: ["Style urbain", "Maniable en ville", "Niche électrique"],
    weaknesses: ["Espace limité", "Pièces Fiat moins répandues hors Casa/Rabat"],
    resaleIndex: 65,
    partsAvailability: 62,
    moroccoVerdict: "Niche urbaine — entretien disponible grandes villes.",
  },
  "seat:ibiza": {
    score: 77,
    grade: "B",
    strengths: ["Plateforme VW solide", "Dynamique route", "Bon rapport équipement/prix"],
    weaknesses: ["Réseau Seat plus petit", "Revente modérée"],
    resaleIndex: 71,
    partsAvailability: 74,
    moroccoVerdict: "Compromis sportif/économique — pièces VW compatibles.",
  },
  "mercedes:classe-a": {
    score: 68,
    grade: "C",
    strengths: ["Prestige", "Technologie", "Confort"],
    weaknesses: ["Entretien concessionnaire coûteux", "Pièces premium", "Import à vérifier"],
    resaleIndex: 76,
    partsAvailability: 70,
    moroccoVerdict: "Premium — historique complet indispensable.",
  },
  "bmw:serie-3": {
    score: 65,
    grade: "C",
    strengths: ["Plaisir de conduite", "Image premium", "Revente niche"],
    weaknesses: ["Coût entretien élevé", "Import Allemagne — homologation", "Électronique complexe"],
    resaleIndex: 74,
    partsAvailability: 68,
    moroccoVerdict: "Berline premium — budget entretien significatif.",
  },
};

export function getReliabilityIndex(brandSlug, modelSlug) {
  const spec = getVehicleSpec(brandSlug, modelSlug);
  if (!spec) return null;
  const key = `${brandSlug}:${modelSlug}`;
  const rel = RELIABILITY[key];
  if (!rel) return null;
  return {
    brandSlug,
    modelSlug,
    displayName: spec.displayName,
    segment: spec.segment,
    ...rel,
    faqs: [
      {
        q: `${spec.displayName} est-elle fiable au Maroc ?`,
        a: rel.moroccoVerdict,
      },
      {
        q: `Quels problèmes connus sur ${spec.displayName} ?`,
        a: rel.weaknesses.join(" — ") + ". Consultez les retours communauté Goovoiture.",
      },
      {
        q: `Pièces détachées ${spec.displayName} au Maroc`,
        a: `Disponibilité estimée ${rel.partsAvailability}/100 — ${rel.partsAvailability >= 85 ? "excellente" : rel.partsAvailability >= 70 ? "correcte" : "limitée hors grandes villes"}.`,
      },
    ],
  };
}

export function getAllReliabilityIndexes() {
  return Object.keys(RELIABILITY)
    .map((key) => {
      const [brandSlug, modelSlug] = key.split(":");
      return getReliabilityIndex(brandSlug, modelSlug);
    })
    .filter(Boolean);
}

export function reliabilityPath(brandSlug, modelSlug) {
  return `/fiabilite/${brandSlug}/${modelSlug}`;
}

export function reliabilityHubPath() {
  return "/fiabilite";
}

export function marketIntelPath(brandSlug, modelSlug) {
  return `/marche/${brandSlug}/${modelSlug}`;
}

export function marketHubPath() {
  return "/marche";
}

export function searchIntelPath(brandSlug, modelSlug) {
  return `/recherches/${brandSlug}/${modelSlug}`;
}

export function searchIntelHubPath() {
  return "/recherches";
}

export function tcoPath(brandSlug, modelSlug) {
  return `/cout-possession/${brandSlug}/${modelSlug}`;
}

export function buyerAssistantPath() {
  return "/assistant-achat";
}

export function ownershipHubPath() {
  return "/possession";
}

export function ownershipTimelinePath(topicSlug) {
  return `/possession/${topicSlug}`;
}

export function sellerTrustPath(sellerId) {
  return `/confiance/${sellerId}`;
}
