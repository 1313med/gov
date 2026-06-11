/** Public SEO config (French). Owner/admin/auth routes use noindex via SeoHead. */

export const SITE_NAME = "Goovoiture";
export const DEFAULT_SITE_URL = "https://goovoiture.ma";
export const DEFAULT_LOCALE = "fr_MA";

/** Path prefixes that must not be indexed (owner panel, admin, account). */
export const NOINDEX_PREFIXES = [
  "/admin",
  "/owner",
  "/dashboard",
  "/my-fleet",
  "/my-rentals",
  "/my-sales",
  "/my-bookings",
  "/add-rental",
  "/owner-bookings",
  "/garage",
  "/messages",
  "/profile",
  "/notifications",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/saved",
  "/kyc",
  "/referral",
  "/credit-check",
  "/fuel-tracker",
  "/car-worth",
  "/travel-ready",
  "/accident",
  "/estimate",
  "/price-alerts",
  "/verify-cin",
  "/profile-documents",
];

export function isNoIndexPath(pathname) {
  return NOINDEX_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/** Static public pages for sitemap + default meta. */
export const STATIC_PUBLIC_PAGES = [
  {
    path: "/",
    title: "Goovoiture — Location de voiture & vente auto au Maroc",
    description:
      "Louez ou achetez une voiture au Maroc. Location de voiture, marketplace automobile et annonces vérifiées sur Goovoiture.",
    priority: "1.0",
    changefreq: "daily",
  },
  {
    path: "/rentals",
    title: "Location de voiture au Maroc | Goovoiture",
    description:
      "Location de voiture au Maroc : comparez les offres, réservez en ligne à Casablanca, Rabat, Marrakech et dans tout le royaume.",
    priority: "0.9",
    changefreq: "daily",
  },
  {
    path: "/cars",
    title: "Achat & vente de voitures au Maroc | Goovoiture",
    description:
      "Marketplace automobile au Maroc : achetez ou vendez votre voiture d'occasion en toute confiance sur Goovoiture.",
    priority: "0.9",
    changefreq: "daily",
  },
  {
    path: "/buying-guide",
    title: "Guide d'achat voiture au Maroc | Goovoiture",
    description: "Conseils pour acheter une voiture d'occasion au Maroc en toute sécurité.",
    priority: "0.5",
    changefreq: "monthly",
  },
  {
    path: "/mechanic-prices",
    title: "Prix réparation auto au Maroc | Goovoiture",
    description: "Estimez les prix de réparation et d'entretien automobile au Maroc.",
    priority: "0.5",
    changefreq: "monthly",
  },
  {
    path: "/community",
    title: "Communauté auto Goovoiture | Avis & entraide",
    description: "Partagez vos expériences et découvrez les avis de la communauté automobile marocaine.",
    priority: "0.5",
    changefreq: "weekly",
  },
  {
    path: "/afford-car",
    title: "Simulateur budget voiture | Goovoiture",
    description: "Calculez votre budget pour acheter ou louer une voiture au Maroc.",
    priority: "0.4",
    changefreq: "monthly",
  },
  {
    path: "/emergency",
    title: "Assistance & urgence route | Goovoiture",
    description: "Numéros utiles et conseils en cas d'urgence sur la route au Maroc.",
    priority: "0.4",
    changefreq: "monthly",
  },
];

export function getStaticSeoForPath(pathname) {
  if (pathname === "/") return STATIC_PUBLIC_PAGES[0];
  return STATIC_PUBLIC_PAGES.find((p) => p.path === pathname) || null;
}

export function getSiteUrl() {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  if (fromEnv) return String(fromEnv).replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_SITE_URL;
}
