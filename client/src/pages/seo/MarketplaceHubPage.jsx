import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SeoHead from "../../components/SeoHead";
import SeoBreadcrumbs from "../../components/seo/SeoBreadcrumbs";
import SeoFooter from "../../components/seo/SeoFooter";
import { MOROCCO_CITIES, cityRentalPath, citySalePath } from "../../seo/catalog/cities";
import { MOROCCO_AIRPORTS, airportRentalPath } from "../../seo/catalog/airports";
import { RENTAL_CATEGORIES, SALE_CATEGORIES } from "../../seo/catalog/categories";
import { buildHubSeo } from "../../seo/programmaticSeo";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";
import { getSiteUrl } from "../../seo/seoLocales";
import { graphJsonLd, collectionPageJsonLd, breadcrumbJsonLd } from "../../seo/jsonLd";

export default function MarketplaceHubPage({ intent = "rental" }) {
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const seo = buildHubSeo(lang, intent);
  if (!seo) return null;

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, seo.path)}`;
  const categories = intent === "sale" ? SALE_CATEGORIES : RENTAL_CATEGORIES;
  const hubLabel =
    intent === "sale"
      ? lang === "ar"
        ? "سيارات مستعملة"
        : lang === "en"
          ? "Used cars"
          : "Voiture occasion"
      : lang === "ar"
        ? "تأجير السيارات"
        : lang === "en"
          ? "Car rental"
          : "Location voiture";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f]">
      <SeoHead
        jsonLdExtra={graphJsonLd(
          collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: [] }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: hubLabel, url: pageUrl },
          ])
        )}
      />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <SeoBreadcrumbs items={[{ label: "GoVoiture", href: "/" }, { label: hubLabel, href: null }]} />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{seo.h1}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">{seo.intro}</p>

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">
            {lang === "fr" ? "Villes" : lang === "ar" ? "المدن" : "Cities"}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {MOROCCO_CITIES.map((c) => (
              <li key={c.slug}>
                <Link
                  to={buildSeoPath(lang, intent === "sale" ? citySalePath(c.slug) : cityRentalPath(c.slug))}
                  className="inline-block px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm hover:bg-violet-200"
                >
                  {c.name[lang] || c.name.fr}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {intent === "rental" && (
          <section className="mb-10">
            <h2 className="text-lg font-semibold mb-3">
              {lang === "fr" ? "Aéroports" : "Airports"}
            </h2>
            <ul className="flex flex-wrap gap-2">
              {MOROCCO_AIRPORTS.map((a) => (
                <li key={a.slug}>
                  <Link
                    to={buildSeoPath(lang, airportRentalPath(a.slug))}
                    className="inline-block px-3 py-1 rounded-full border border-gray-200 dark:border-white/10 text-sm hover:border-violet-400"
                  >
                    {a.name[lang] || a.name.fr}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">
            {lang === "fr" ? "Catégories" : "Categories"}
          </h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={buildSeoPath(lang, intent === "sale" ? `/voiture-occasion/casablanca/${cat.slug}` : `/location-voiture/casablanca/${cat.slug}`)}
                  className="block p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-violet-400"
                >
                  {cat.name[lang] || cat.name.fr}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <SeoFooter />
    </div>
  );
}
