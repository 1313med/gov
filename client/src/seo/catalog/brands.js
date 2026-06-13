import { getRentalCategoryBySlug, getSaleCategoryBySlug } from "./categories.js";

/** Top automotive brands & models in Morocco. */
export const CAR_BRANDS = [
  { slug: "dacia", name: { fr: "Dacia", en: "Dacia", ar: "دacia" }, models: ["logan", "sandero", "duster", "lodgy", "spring"] },
  { slug: "renault", name: { fr: "Renault", en: "Renault", ar: "رينو" }, models: ["clio", "symbol", "megane", "captur", "koleos", "express"] },
  { slug: "peugeot", name: { fr: "Peugeot", en: "Peugeot", ar: "بيجو" }, models: ["208", "301", "308", "2008", "3008", "5008"] },
  { slug: "hyundai", name: { fr: "Hyundai", en: "Hyundai", ar: "هيونداي" }, models: ["i10", "i20", "accent", "tucson", "creta", "santa-fe"] },
  { slug: "volkswagen", name: { fr: "Volkswagen", en: "Volkswagen", ar: "فولkswagen" }, models: ["polo", "golf", "passat", "tiguan", "touareg"] },
  { slug: "fiat", name: { fr: "Fiat", en: "Fiat", ar: "فiat" }, models: ["500", "panda", "tipo", "doblo"] },
  { slug: "toyota", name: { fr: "Toyota", en: "Toyota", ar: "تويota" }, models: ["yaris", "corolla", "rav4", "land-cruiser", "hilux"] },
  { slug: "kia", name: { fr: "Kia", en: "Kia", ar: "كيا" }, models: ["picanto", "rio", "sportage", "sorento", "seltos"] },
  { slug: "seat", name: { fr: "SEAT", en: "SEAT", ar: "SEAT" }, models: ["ibiza", "leon", "arona", "ateca"] },
  { slug: "citroen", name: { fr: "Citroën", en: "Citroën", ar: "سيتroën" }, models: ["c3", "c4", "c5-aircross", "berlingo"] },
  { slug: "mercedes", name: { fr: "Mercedes-Benz", en: "Mercedes-Benz", ar: "مرسيدس" }, models: ["classe-a", "classe-c", "glc", "gle"] },
  { slug: "bmw", name: { fr: "BMW", en: "BMW", ar: "BMW" }, models: ["serie-1", "serie-3", "x1", "x3", "x5"] },
  { slug: "audi", name: { fr: "Audi", en: "Audi", ar: "أودي" }, models: ["a3", "a4", "q3", "q5", "q7"] },
  { slug: "nissan", name: { fr: "Nissan", en: "Nissan", ar: "نissan" }, models: ["micra", "juke", "qashqai", "x-trail", "patrol"] },
  { slug: "ford", name: { fr: "Ford", en: "Ford", ar: "فord" }, models: ["fiesta", "focus", "ranger", "kuga"] },
  { slug: "opel", name: { fr: "Opel", en: "Opel", ar: "أopel" }, models: ["corsa", "astra", "mokka", "grandland"] },
  { slug: "suzuki", name: { fr: "Suzuki", en: "Suzuki", ar: "سuzuki" }, models: ["swift", "vitara", "jimny", "dzire"] },
  { slug: "honda", name: { fr: "Honda", en: "Honda", ar: "هonda" }, models: ["jazz", "civic", "cr-v", "hr-v"] },
  { slug: "mazda", name: { fr: "Mazda", en: "Mazda", ar: "مazda" }, models: ["mazda2", "mazda3", "cx-3", "cx-5"] },
  { slug: "chevrolet", name: { fr: "Chevrolet", en: "Chevrolet", ar: "شevrolet" }, models: ["spark", "aveo", "captiva", "trailblazer"] },
  { slug: "mitsubishi", name: { fr: "Mitsubishi", en: "Mitsubishi", ar: "مitsubishi" }, models: ["space-star", "asx", "outlander", "l200"] },
  { slug: "jeep", name: { fr: "Jeep", en: "Jeep", ar: "Jeep" }, models: ["renegade", "compass", "wrangler", "grand-cherokee"] },
  { slug: "land-rover", name: { fr: "Land Rover", en: "Land Rover", ar: "Land Rover" }, models: ["defender", "discovery", "range-rover-evoque"] },
  { slug: "porsche", name: { fr: "Porsche", en: "Porsche", ar: "Porsche" }, models: ["cayenne", "macan", "panamera"] },
  { slug: "skoda", name: { fr: "Škoda", en: "Skoda", ar: "Skoda" }, models: ["fabia", "octavia", "kamiq", "kodiaq"] },
  { slug: "mg", name: { fr: "MG", en: "MG", ar: "MG" }, models: ["zs", "hs", "mg4"] },
  { slug: "chery", name: { fr: "Chery", en: "Chery", ar: "Chery" }, models: ["tiggo-2", "tiggo-4", "tiggo-7"] },
  { slug: "geely", name: { fr: "Geely", en: "Geely", ar: "Geely" }, models: ["coolray", "azkarra"] },
  { slug: "byd", name: { fr: "BYD", en: "BYD", ar: "BYD" }, models: ["atto-3", "dolphin", "seal"] },
  { slug: "tesla", name: { fr: "Tesla", en: "Tesla", ar: "Tesla" }, models: ["model-3", "model-y"] },
];

export function getBrandBySlug(slug) {
  return CAR_BRANDS.find((b) => b.slug === slug) || null;
}

export function getModelBySlugs(brandSlug, modelSlug) {
  const brand = getBrandBySlug(brandSlug);
  if (!brand || !brand.models.includes(modelSlug)) return null;
  return { brand, modelSlug, displayName: modelSlug.replace(/-/g, " ") };
}

export function brandPath(brandSlug) {
  return `/marque/${brandSlug}`;
}

export function modelPath(brandSlug, modelSlug) {
  return `/marque/${brandSlug}/${modelSlug}`;
}

export function cityBrandRentalPath(citySlug, brandSlug) {
  return `/location-voiture/${citySlug}/${brandSlug}`;
}

export function cityBrandSalePath(citySlug, brandSlug) {
  return `/voiture-occasion/${citySlug}/${brandSlug}`;
}

export function cityModelRentalPath(citySlug, brandSlug, modelSlug) {
  return `/location-voiture/${citySlug}/${brandSlug}/${modelSlug}`;
}

export function cityModelSalePath(citySlug, brandSlug, modelSlug) {
  return `/voiture-occasion/${citySlug}/${brandSlug}/${modelSlug}`;
}

/** Resolve facet slug at city level: category vs brand. */
export function resolveCityFacetSlug(slug, intent = "rental") {
  const cat =
    intent === "sale" ? getSaleCategoryBySlug(slug) : getRentalCategoryBySlug(slug);
  if (cat) return { type: "category", data: cat };
  const brand = getBrandBySlug(slug);
  if (brand) return { type: "brand", data: brand };
  return null;
}
