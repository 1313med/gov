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

const PUBLIC_PREFIXES = [
  "/location-voiture",
  "/location-voiture-aeroport",
  "/voiture-occasion",
  "/location-voiture-occasion",
  "/louer/",
  "/acheter/",
  "/marque/",
  "/voitures/",
  "/agences/",
  "/concessionnaires/",
  "/pro",
  "/blog",
  "/a-propos",
  "/equipe",
  "/avis",
  "/partenaires",
  "/etudes-de-cas",
  "/assistant-achat",
  "/cout-possession/",
  "/comparer",
  "/assurance",
  "/financement",
  "/demarches",
  "/questions",
  "/possession",
];

export function isPublicSeoPath(pathname) {
  const { basePath } = parseSeoPath(pathname);
  if (PUBLIC_PREFIXES.some((p) => basePath === p || basePath.startsWith(p))) return true;
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
    "/conditions-utilisation",
    "/politique-confidentialite",
  ];
  if (publicExact.includes(basePath)) return true;
  if (/^\/cars\/[^/]+$/.test(basePath)) return true;
  if (/^\/rentals\/[^/]+$/.test(basePath)) return true;
  if (/^\/louer\/[^/]+$/.test(basePath)) return true;
  if (/^\/acheter\/[^/]+$/.test(basePath)) return true;
  return false;
}
