import { Link, useLocation } from "react-router-dom";
import { MOROCCO_CITIES, cityRentalPath, citySalePath } from "../../seo/catalog/cities.js";
import { RENTAL_CATEGORIES } from "../../seo/catalog/categories.js";
import { CAR_BRANDS } from "../../seo/catalog/brands.js";
import { MOROCCO_AIRPORTS, airportRentalPath } from "../../seo/catalog/airports.js";
import { PRO_PAGES } from "../../seo/catalog/proPages.js";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";

const TOP_CITIES = MOROCCO_CITIES.slice(0, 12);

export default function SeoFooter() {
  const { pathname } = useLocation();
  const { lang, basePath } = parseSeoPath(pathname);
  if (basePath.startsWith("/admin") || basePath.startsWith("/dashboard")) return null;

  const L = {
    fr: {
      rental: "Location voiture",
      sale: "Voiture occasion",
      airports: "Aéroports",
      categories: "Catégories",
      brands: "Marques",
      pro: "Goovoiture Pro",
      guides: "Guides",
      trust: "Confiance",
      allCities: "Toutes les villes →",
    },
    en: {
      rental: "Car rental",
      sale: "Used cars",
      airports: "Airports",
      categories: "Categories",
      brands: "Brands",
      pro: "Goovoiture Pro",
      guides: "Guides",
      trust: "Trust",
      allCities: "All cities →",
    },
    ar: {
      rental: "تأجير السيارات",
      sale: "سيارات مستعملة",
      airports: "المطارات",
      categories: "الفئات",
      brands: "العلامات",
      pro: "Goovoiture Pro",
      guides: "أدلة",
      trust: "الثقة",
      allCities: "كل المدن →",
    },
  }[lang] || {
    rental: "Location voiture",
    sale: "Voiture occasion",
    airports: "Aéroports",
    categories: "Catégories",
    brands: "Marques",
    pro: "Goovoiture Pro",
    guides: "Guides",
    trust: "Confiance",
    allCities: "Toutes les villes →",
  };

  return (
    <footer className="seo-footer border-t border-gray-200/70 dark:border-white/10 bg-gray-50/80 dark:bg-[#080c18] mt-16">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.rental}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link to={buildSeoPath(lang, "/location-voiture")} className="hover:text-violet-600">
                {lang === "fr" ? "Hub location Maroc" : lang === "ar" ? "تأجير في المغرب" : "Morocco rental hub"}
              </Link>
            </li>
            {TOP_CITIES.map((c) => (
              <li key={c.slug}>
                <Link to={buildSeoPath(lang, cityRentalPath(c.slug))} className="hover:text-violet-600">
                  {c.name[lang] || c.name.fr}
                </Link>
              </li>
            ))}
            <li>
              <Link to={buildSeoPath(lang, "/location-voiture")} className="text-violet-600 font-medium">
                {L.allCities}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.sale}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li>
              <Link to={buildSeoPath(lang, "/voiture-occasion")} className="hover:text-violet-600">
                {lang === "fr" ? "Hub occasion Maroc" : "Used cars hub"}
              </Link>
            </li>
            {TOP_CITIES.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link to={buildSeoPath(lang, citySalePath(c.slug))} className="hover:text-violet-600">
                  {lang === "fr" ? `Occasion ${c.name.fr}` : c.name[lang] || c.name.fr}
                </Link>
              </li>
            ))}
            <li>
              <Link to={buildSeoPath(lang, "/vendre-ma-voiture")} className="hover:text-violet-600">
                {lang === "fr" ? "Vendre ma voiture" : lang === "ar" ? "بيع سيارتي" : "Sell my car"}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.categories}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
            {RENTAL_CATEGORIES.slice(0, 6).map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={buildSeoPath(lang, `/location-voiture/casablanca/${cat.slug}`)}
                  className="hover:text-violet-600"
                >
                  {cat.name[lang] || cat.name.fr}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.airports}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            {MOROCCO_AIRPORTS.slice(0, 6).map((a) => (
              <li key={a.slug}>
                <Link to={buildSeoPath(lang, airportRentalPath(a.slug))} className="hover:text-violet-600">
                  {a.iata}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.brands}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 mb-6">
            {CAR_BRANDS.slice(0, 8).map((b) => (
              <li key={b.slug}>
                <Link to={buildSeoPath(lang, `/marque/${b.slug}`)} className="hover:text-violet-600">
                  {b.name[lang] || b.name.fr}
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">{L.pro}</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            {PRO_PAGES.slice(0, 5).map((p) => (
              <li key={p.slug}>
                <Link to={buildSeoPath(lang, `/pro/${p.slug}`)} className="hover:text-violet-600">
                  {p.title[lang] || p.title.fr}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-200/60 dark:border-white/10 py-6 px-4">
        <div className="mx-auto max-w-6xl flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-500">
          <Link to={buildSeoPath(lang, "/a-propos")} className="hover:text-violet-600">{lang === "fr" ? "À propos" : "About"}</Link>
          <Link to={buildSeoPath(lang, "/blog")} className="hover:text-violet-600">{L.guides}</Link>
          <Link to={buildSeoPath(lang, "/avis")} className="hover:text-violet-600">{lang === "fr" ? "Avis clients" : "Reviews"}</Link>
          <Link to={buildSeoPath(lang, "/partenaires")} className="hover:text-violet-600">{lang === "fr" ? "Partenaires" : "Partners"}</Link>
          <Link to={buildSeoPath(lang, "/conditions-utilisation")} className="hover:text-violet-600">CGU</Link>
          <Link to={buildSeoPath(lang, "/politique-confidentialite")} className="hover:text-violet-600">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
