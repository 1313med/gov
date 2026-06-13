import { CAR_BRANDS, getBrandBySlug } from "./brands.js";

/** Curated + programmatic model comparison pairs. */
const CURATED = [
  ["dacia", "logan", "renault", "clio"],
  ["hyundai", "i10", "kia", "picanto"],
  ["dacia", "duster", "renault", "captur"],
  ["peugeot", "208", "renault", "clio"],
  ["toyota", "yaris", "hyundai", "i20"],
  ["volkswagen", "polo", "seat", "ibiza"],
  ["fiat", "500", "hyundai", "i10"],
  ["mercedes", "classe-a", "bmw", "serie-1"],
  ["nissan", "micra", "suzuki", "swift"],
  ["ford", "fiesta", "peugeot", "208"],
];

function slugPart(brand, model) {
  return `${brand}-${model}`;
}

function comparisonSlug(aBrand, aModel, bBrand, bModel) {
  return `${slugPart(aBrand, aModel)}-vs-${slugPart(bBrand, bModel)}`;
}

function specRow(label, a, b) {
  return { label, a, b };
}

export function buildComparisonData(slug) {
  const m = slug.match(/^(.+)-vs-(.+)$/);
  if (!m) return null;
  const [, left, right] = m;
  const leftParts = left.split("-");
  const rightParts = right.split("-");
  const aModel = leftParts.pop();
  const aBrand = leftParts.join("-");
  const bModel = rightParts.pop();
  const bBrand = rightParts.join("-");
  const brandA = getBrandBySlug(aBrand);
  const brandB = getBrandBySlug(bBrand);
  if (!brandA || !brandB || !brandA.models.includes(aModel) || !brandB.models.includes(bModel)) {
    return null;
  }
  const nameA = `${brandA.name.fr} ${aModel.replace(/-/g, " ")}`;
  const nameB = `${brandB.name.fr} ${bModel.replace(/-/g, " ")}`;
  return {
    slug,
    path: `/comparer/${slug}`,
    brandA: aBrand,
    modelA: aModel,
    brandB: bBrand,
    modelB: bModel,
    nameA,
    nameB,
    title: `${nameA} vs ${nameB} — Comparatif Maroc | GoVoiture`,
    description: `Comparez ${nameA} et ${nameB} au Maroc : prix, consommation, confort et occasion.`,
    h1: `${nameA} vs ${nameB}`,
    intro: `Comparatif détaillé entre ${nameA} et ${nameB} pour choisir votre prochaine voiture au Maroc.`,
    strengthsA: ["Prix accessible", "Entretien économique", "Bon revendeur au Maroc"],
    strengthsB: ["Finition supérieure", "Confort route", "Revente stable"],
    weaknessesA: ["Finition basique", "Motorisation limitée sur certains trims"],
    weaknessesB: ["Prix plus élevé", "Coût pièces parfois plus fort"],
    specs: [
      specRow("Segment", "Citadine / compacte", "Citadine / compacte"),
      specRow("Usage Maroc", "Ville & nationale", "Ville & nationale"),
      specRow("Consommation", "Faible à modérée", "Modérée"),
      specRow("Confort", "Correct", "Bon"),
      specRow("Prix occasion", "Abordable", "Milieu de gamme"),
    ],
    faqs: [
      { q: `${nameA} ou ${nameB} pour Casablanca ?`, a: "Pour la ville, privilégiez la consommation et le stationnement ; comparez les annonces GoVoiture." },
      { q: "Quelle voiture revend le mieux ?", a: "Les marques à forte demande locale (Dacia, Renault, Hyundai) restent liquides." },
    ],
  };
}

export function getAllComparisons() {
  const seen = new Set();
  const list = [];
  for (const [aBrand, aModel, bBrand, bModel] of CURATED) {
    const slug = comparisonSlug(aBrand, aModel, bBrand, bModel);
    if (seen.has(slug)) continue;
    seen.add(slug);
    const data = buildComparisonData(slug);
    if (data) list.push(data);
  }
  // Programmatic pairs within top brands (first 2 models each)
  for (let i = 0; i < CAR_BRANDS.length; i++) {
    for (let j = i + 1; j < CAR_BRANDS.length && list.length < 120; j++) {
      const a = CAR_BRANDS[i];
      const b = CAR_BRANDS[j];
      const aModel = a.models[0];
      const bModel = b.models[0];
      if (!aModel || !bModel) continue;
      const slug = comparisonSlug(a.slug, aModel, b.slug, bModel);
      if (seen.has(slug)) continue;
      seen.add(slug);
      const data = buildComparisonData(slug);
      if (data) list.push(data);
    }
  }
  return list;
}

export function getComparisonBySlug(slug) {
  return buildComparisonData(slug);
}

export function getComparisonsForBrand(brandSlug, modelSlug = null, limit = 6) {
  return getAllComparisons()
    .filter((c) => {
      if (modelSlug) {
        return (
          (c.brandA === brandSlug && c.modelA === modelSlug) ||
          (c.brandB === brandSlug && c.modelB === modelSlug)
        );
      }
      return c.brandA === brandSlug || c.brandB === brandSlug;
    })
    .slice(0, limit);
}
