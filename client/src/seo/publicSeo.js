/** @deprecated — use seoLocales.js */
export {
  SITE_NAME,
  DEFAULT_SITE_URL,
  NOINDEX_PREFIXES,
  STATIC_PUBLIC_PAGES,
  isNoIndexPath,
  getStaticSeoForPath,
  getSiteUrl,
  getSeoForPath,
  getSeoLangFromPath,
  buildSaleListingSeo,
  buildRentalListingSeo,
} from "./seoLocales";

export const DEFAULT_LOCALE = "fr_MA";

export {
  MOROCCO_CITIES,
  getCityBySlug,
  getCityName,
  cityRentalPath,
  citySalePath,
} from "./catalog/cities.js";
