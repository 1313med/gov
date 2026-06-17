import { DACIA_MODELS } from "./brands/dacia.js";
import { RENAULT_MODELS } from "./brands/renault.js";
import { VOLKSWAGEN_MODELS } from "./brands/volkswagen.js";
import { SEAT_MODELS } from "./brands/seat.js";
import { HYUNDAI_MODELS } from "./brands/hyundai.js";
import { PEUGEOT_MODELS } from "./brands/peugeot.js";
import { TOYOTA_MODELS } from "./brands/toyota.js";
import { MERCEDES_MODELS } from "./brands/mercedes.js";
import { BMW_MODELS } from "./brands/bmw.js";
import { AUDI_MODELS } from "./brands/audi.js";
import { FORD_MODELS } from "./brands/ford.js";

/** @typedef {{
 *   brandSlug: string;
 *   modelSlug: string;
 *   displayName: string;
 *   listingTerms: string[];
 *   subtitle: string;
 *   introduction: string;
 *   popularity: string;
 *   engines: { diesel: string; essence: string; automatic: string; manual: string };
 *   consumption: { city: string; highway: string };
 *   reliability: { strengths: string[]; weaknesses: string[] };
 *   prices: { occasion: string; recent: string; popularVersions: string[] };
 *   maintenance: string;
 *   audience: { youngDrivers: string; families: string; professionals: string; longDistance: string };
 *   faqs: { q: string; a: string }[];
 * }} AuthorityModel
 */

const ALL_MODELS = [
  ...DACIA_MODELS,
  ...RENAULT_MODELS,
  ...VOLKSWAGEN_MODELS,
  ...SEAT_MODELS,
  ...HYUNDAI_MODELS,
  ...PEUGEOT_MODELS,
  ...TOYOTA_MODELS,
  ...MERCEDES_MODELS,
  ...BMW_MODELS,
  ...AUDI_MODELS,
  ...FORD_MODELS,
];

const INDEX = new Map(ALL_MODELS.map((m) => [`${m.brandSlug}:${m.modelSlug}`, m]));

export function modelAuthorityPath(brandSlug, modelSlug) {
  return `/voitures/${brandSlug}/${modelSlug}`;
}

/** @returns {AuthorityModel | null} */
export function getModelAuthority(brandSlug, modelSlug) {
  return INDEX.get(`${brandSlug}:${modelSlug}`) || null;
}

/** @returns {AuthorityModel[]} */
export function getAllAuthorityModels() {
  return ALL_MODELS;
}

/** @returns {AuthorityModel[]} */
export function getAuthorityModelsByBrand(brandSlug) {
  return ALL_MODELS.filter((m) => m.brandSlug === brandSlug);
}

export function matchesListingModel(listingModel, authority) {
  if (!listingModel || !authority?.listingTerms?.length) return false;
  const norm = listingModel
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return authority.listingTerms.some((term) => {
    const t = term
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return norm.includes(t);
  });
}

export function authorityMetadata(model) {
  const name = model.displayName;
  return {
    basePath: modelAuthorityPath(model.brandSlug, model.modelSlug),
    title: `${name} au Maroc — guide, prix & fiabilité | Goovoiture`,
    description: model.subtitle,
    keywords: `${name} maroc, prix ${name}, fiabilité ${name}, occasion ${name}`,
  };
}
