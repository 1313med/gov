/** Entity cross-links for Booking.com-style internal linking. */
import { MOROCCO_CITIES } from "./cities.js";
import { CAR_BRANDS } from "./brands.js";
import { PRO_PAGES } from "./proPages.js";

export const ENTITY_HUBS = {
  rental: { path: "/location-voiture", label: { fr: "Location voiture", en: "Car rental", ar: "تأجير" } },
  sale: { path: "/voiture-occasion", label: { fr: "Voiture occasion", en: "Used cars", ar: "مستعملة" } },
  agencies: { path: "/agences", label: { fr: "Agences", en: "Agencies", ar: "وكالات" } },
  dealers: { path: "/concessionnaires", label: { fr: "Concessionnaires", en: "Dealers", ar: "وكلاء" } },
  brands: { path: "/marque/dacia", label: { fr: "Marques", en: "Brands", ar: "ماركات" } },
  compare: { path: "/comparer", label: { fr: "Comparatifs", en: "Compare", ar: "مقارنة" } },
  blog: { path: "/blog", label: { fr: "Blog", en: "Blog", ar: "مدونة" } },
  pro: { path: "/pro", label: { fr: "Goovoiture Pro", en: "Pro", ar: "Pro" } },
};

export function topCityLinks(limit = 8) {
  return MOROCCO_CITIES.slice(0, limit).map((c) => ({
    slug: c.slug,
    name: c.name,
    rentalPath: `/location-voiture/${c.slug}`,
    salePath: `/voiture-occasion/${c.slug}`,
    agencyPath: `/agences/${c.slug}`,
    dealerPath: `/concessionnaires/${c.slug}`,
  }));
}

export function topBrandLinks(limit = 8) {
  return CAR_BRANDS.slice(0, limit).map((b) => ({
    slug: b.slug,
    name: b.name,
    path: `/marque/${b.slug}`,
  }));
}

export function proLinks(limit = 5) {
  return PRO_PAGES.slice(0, limit).map((p) => ({
    slug: p.slug,
    title: p.title,
    path: `/pro/${p.slug}`,
  }));
}
