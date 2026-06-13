import { Link, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import SeoHead from "../../components/SeoHead";
import SeoBreadcrumbs from "../../components/seo/SeoBreadcrumbs";
import { getAirportBySlug, getAirportName } from "../../seo/catalog/airports";
import { getRentalCategoryBySlug } from "../../seo/catalog/categories";
import { getCityBySlug } from "../../seo/catalog/cities";
import { buildAirportSeo, defaultFaqs } from "../../seo/programmaticSeo";
import { shouldIndexPage, robotsForGate } from "../../seo/qualityGate";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";
import { getSiteUrl } from "../../seo/seoLocales";
import { graphJsonLd, collectionPageJsonLd, faqPageJsonLd, breadcrumbJsonLd, localBusinessJsonLd } from "../../seo/jsonLd";
import { buildRentalListingPath } from "../../seo/slugUtils";

export default function AirportLandingPage() {
  const { airportSlug, categorySlug } = useParams();
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const airport = getAirportBySlug(airportSlug);
  const category = categorySlug ? getRentalCategoryBySlug(categorySlug) : null;
  const city = airport ? getCityBySlug(airport.citySlug) : null;
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const seo = airport ? buildAirportSeo(lang, airportSlug, categorySlug) : null;

  useEffect(() => {
    if (!city) {
      setLoading(false);
      return;
    }
    api
      .get("/rental", { params: { city: city.name.fr } })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.rentals || [];
        setListings(data.slice(0, 12));
      })
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, [city]);

  if (!airport || !seo) {
    return <div className="p-8 text-center text-gray-500">Aéroport introuvable</div>;
  }

  const faqs = defaultFaqs(lang, { cityName: getAirportName(airport, lang) });
  const indexable = shouldIndexPage({ listings, intro: seo.intro, faq: faqs, forceIndex: true });
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${pathname}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f]">
      <SeoHead
        override={{
          title: seo.title,
          description: seo.description,
          keywords: seo.keywords,
          canonical: pageUrl,
          robots: robotsForGate(indexable),
        }}
        jsonLdExtra={graphJsonLd(
          localBusinessJsonLd({ name: seo.h1, cityName: getAirportName(airport, lang), siteUrl, pageUrl }),
          collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: [] }),
          faqPageJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Goovoiture", url: siteUrl },
            { name: "Location voiture", url: `${siteUrl}${buildSeoPath(lang, "/location-voiture")}` },
            { name: seo.h1, url: pageUrl },
          ])
        )}
      />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <SeoBreadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Location", href: "/location-voiture" },
            { label: getAirportName(airport, lang), href: null },
          ]}
        />
        <h1 className="text-3xl font-bold mb-4">{seo.h1}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{seo.intro}</p>

        {loading ? (
          <p>Chargement…</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {listings.map((item) => (
              <li key={item._id}>
                <Link
                  to={buildSeoPath(lang, buildRentalListingPath(item))}
                  className="block p-4 rounded-xl border border-gray-200 dark:border-white/10"
                >
                  <h3 className="font-semibold">{item.brand} {item.model}</h3>
                  <p className="text-violet-600 text-sm">{Number(item.pricePerDay).toLocaleString()} MAD/j</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <section>
          <h2 className="font-semibold mb-4">FAQ</h2>
          {faqs.map((f) => (
            <div key={f.q} className="mb-4">
              <h3 className="font-medium">{f.q}</h3>
              <p className="text-gray-600 dark:text-gray-400">{f.a}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
