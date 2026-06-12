import { Link, useLocation } from "react-router-dom";
import { getSeoForPath, MOROCCO_CITIES, cityRentalPath, citySalePath } from "../seo/seoLocales";
import { buildSeoPath, parseSeoPath } from "../seo/seoPaths";

/** Visible SEO intro + city links + Darija for crawlers and users. */
export default function SeoContentBlock() {
  const { pathname } = useLocation();
  const seo = getSeoForPath(pathname);
  if (!seo?.h1) return null;

  const { lang, basePath } = parseSeoPath(pathname);
  const isHome = basePath === "/";
  const isRentals = basePath === "/rentals";
  const isCars = basePath === "/cars";
  const isSell = basePath === "/vendre-ma-voiture";
  const isCityPage =
    basePath.startsWith("/location-voiture/") || basePath.startsWith("/location-voiture-occasion/");
  const TitleTag = isCityPage || isSell ? "h1" : "h2";

  const labels = {
    fr: {
      cities: "Location par ville",
      sales: "Voitures d'occasion par ville",
      darija: "En darija",
      sellLink: "Vendre ma voiture",
    },
    en: {
      cities: "Car rental by city",
      sales: "Used cars by city",
      darija: null,
      sellLink: "Sell my car",
    },
    ar: {
      cities: "تأجير حسب المدينة",
      sales: "سيارات مستعملة حسب المدينة",
      darija: null,
      sellLink: "بيع سيارتي",
    },
  };
  const L = labels[lang] || labels.fr;

  const headingId = "seo-content-heading";

  return (
    <section
      className="seo-content mx-auto max-w-4xl px-4 py-10 text-sm leading-relaxed text-gray-600 dark:text-gray-400 border-t border-gray-200/60 dark:border-white/10"
      aria-labelledby={headingId}
    >
      <TitleTag id={headingId} className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{seo.h1}</TitleTag>
      <p className="mb-4">{seo.intro}</p>

      {seo.darija && (lang === "fr" || lang === "ar") && (
        <p className="mb-6 italic text-gray-500 dark:text-gray-500 border-l-2 border-violet-400 pl-3">
          {lang === "fr" && L.darija && (
            <span className="block text-xs font-semibold uppercase tracking-wide not-italic mb-1 text-violet-600 dark:text-violet-400">
              {L.darija}
            </span>
          )}
          {seo.darija}
        </p>
      )}

      {(isHome || isCars || isSell) && (
        <p className="mb-6">
          <Link
            to={buildSeoPath(lang, "/vendre-ma-voiture")}
            className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
          >
            {L.sellLink} →
          </Link>
        </p>
      )}

      {(isHome || isRentals) && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{L.cities}</h2>
          <ul className="flex flex-wrap gap-2">
            {MOROCCO_CITIES.map((city) => (
              <li key={city.slug}>
                <Link
                  to={buildSeoPath(lang, cityRentalPath(city.slug))}
                  className="text-violet-600 dark:text-violet-400 hover:underline"
                >
                  {lang === "fr"
                    ? `Location voiture ${city.name.fr}`
                    : lang === "ar"
                      ? `كراء ${city.name.ar}`
                      : `Rent ${city.name.en}`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(isHome || isCars || isSell) && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{L.sales}</h2>
          <ul className="flex flex-wrap gap-2">
            {MOROCCO_CITIES.map((city) => (
              <li key={city.slug}>
                <Link
                  to={buildSeoPath(lang, citySalePath(city.slug))}
                  className="text-violet-600 dark:text-violet-400 hover:underline"
                >
                  {lang === "fr"
                    ? `Voiture occasion ${city.name.fr}`
                    : lang === "ar"
                      ? `سيارات ${city.name.ar}`
                      : `Used cars ${city.name.en}`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
