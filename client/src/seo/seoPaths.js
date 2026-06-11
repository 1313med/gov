/** URL helpers for trilingual public SEO (fr default, /en/, /ar/). */

export const SEO_LANGS = ["fr", "en", "ar"];

export const HREFLANG_MAP = {
  fr: "fr-MA",
  en: "en-MA",
  ar: "ar-MA",
};

/** @returns {{ lang: 'fr'|'en'|'ar', basePath: string }} */
export function parseSeoPath(pathname) {
  const path = pathname || "/";
  const m = path.match(/^\/(en|ar)(\/.*)?$/);
  if (m) {
    const rest = m[2] || "/";
    return { lang: m[1], basePath: rest };
  }
  return { lang: "fr", basePath: path };
}

/** Build localized path. basePath e.g. `/cars` or `/rentals/abc`. */
export function buildSeoPath(lang, basePath) {
  const p = basePath?.startsWith("/") ? basePath : `/${basePath || ""}`;
  if (lang === "fr") return p === "//" ? "/" : p;
  if (p === "/") return `/${lang}`;
  return `/${lang}${p}`;
}

/** Alternate URLs for hreflang on public pages. */
export function getAlternateUrls(siteUrl, pathname) {
  const { basePath } = parseSeoPath(pathname);
  return SEO_LANGS.map((lang) => ({
    lang: HREFLANG_MAP[lang],
    href: `${siteUrl.replace(/\/+$/, "")}${buildSeoPath(lang, basePath)}`,
  }));
}

export function isPublicSeoPath(pathname) {
  const { basePath } = parseSeoPath(pathname);
  if (basePath.startsWith("/location-voiture/")) return true;
  if (basePath.startsWith("/location-voiture-occasion/")) return true;
  const publicExact = [
    "/",
    "/cars",
    "/rentals",
    "/buying-guide",
    "/mechanic-prices",
    "/community",
    "/afford-car",
    "/emergency",
    "/vendre-ma-voiture",
  ];
  if (publicExact.includes(basePath)) return true;
  if (/^\/cars\/[^/]+$/.test(basePath)) return true;
  if (/^\/rentals\/[^/]+$/.test(basePath)) return true;
  return false;
}
