import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/axios";
import SeoHead from "../components/SeoHead";
import SeoContentBlock from "../components/SeoContentBlock";
import { getCityBySlug } from "../seo/cityPages";
import { getSeoForPath, getSiteUrl } from "../seo/seoLocales";
import { buildSeoPath, parseSeoPath } from "../seo/seoPaths";
import { breadcrumbJsonLd, localBusinessJsonLd } from "../seo/jsonLd";
import { buildRentalListingPath, buildSaleListingPath } from "../seo/slugUtils";
import { useLocation } from "react-router-dom";

export default function CityLandingPage({ mode = "rental" }) {
  const { citySlug } = useParams();
  const { pathname } = useLocation();
  const city = getCityBySlug(citySlug);
  const seo = getSeoForPath(pathname);
  const { lang } = parseSeoPath(pathname);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const cityName = city?.name[lang] || citySlug;
  const siteUrl = getSiteUrl();

  useEffect(() => {
    if (!city) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        if (mode === "rental") {
          const res = await api.get("/rental", { params: { city: city.name.fr } });
          const data = Array.isArray(res.data) ? res.data : res.data?.rentals || [];
          setListings(data.slice(0, 12));
        } else {
          const res = await api.get("/sale", { params: { limit: 12, city: city.name.fr } });
          setListings(res.data?.items || []);
        }
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [city, mode]);

  if (!city) {
    return (
      <div className="p-8 text-center text-gray-500">
        Ville introuvable / City not found
      </div>
    );
  }

  const listPath = mode === "rental" ? "/rentals" : "/cars";
  const detailPrefix = mode === "rental" ? "/rentals" : "/cars";
  const pageUrl = `${siteUrl}${pathname}`;

  const jsonLdExtra =
    mode === "rental"
      ? {
          "@context": "https://schema.org",
          "@graph": [
            localBusinessJsonLd({ cityName, siteUrl, pageUrl }),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              {
                name: lang === "en" ? "Car rental" : lang === "ar" ? "تأجير السيارات" : "Location voiture",
                url: `${siteUrl}${buildSeoPath(lang, listPath)}`,
              },
              { name: cityName, url: pageUrl },
            ]),
          ],
        }
      : breadcrumbJsonLd([
          { name: "Goovoiture", url: siteUrl },
          {
            name: lang === "en" ? "Used cars" : lang === "ar" ? "سيارات مستعملة" : "Voitures occasion",
            url: `${siteUrl}${buildSeoPath(lang, listPath)}`,
          },
          { name: cityName, url: pageUrl },
        ]);

  const ctaLabels = {
    fr: { all: "Voir toutes les annonces", loading: "Chargement…", empty: "Aucune annonce pour le moment.", priceDay: "MAD/jour", price: "MAD" },
    en: { all: "View all listings", loading: "Loading…", empty: "No listings yet.", priceDay: "MAD/day", price: "MAD" },
    ar: { all: "عرض كل الإعلانات", loading: "جاري التحميل…", empty: "لا توجد إعلانات حالياً.", priceDay: "درهم/اليوم", price: "درهم" },
  };
  const C = ctaLabels[lang] || ctaLabels.fr;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f]">
      <SeoHead jsonLdExtra={jsonLdExtra} />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <SeoContentBlock />

        <div className="mt-8">
          <Link
            to={buildSeoPath(lang, listPath)}
            className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
          >
            ← {C.all}
          </Link>
        </div>

        {loading ? (
          <p className="mt-6 text-gray-500">{C.loading}</p>
        ) : listings.length === 0 ? (
          <p className="mt-6 text-gray-500">{C.empty}</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
              <li key={item._id}>
                <Link
                  to={buildSeoPath(
                    lang,
                    mode === "rental" ? buildRentalListingPath(item) : buildSaleListingPath(item)
                  )}
                  className="block rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 hover:shadow-md transition-shadow"
                >
                  {item.images?.[0] && (
                    <img
                      src={item.images[0]}
                      alt={`${item.brand} ${item.model}`}
                      className="mb-3 h-36 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.brand} {item.model} {item.year}
                  </h3>
                  <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">
                    {mode === "rental"
                      ? `${Number(item.pricePerDay).toLocaleString()} ${C.priceDay}`
                      : `${Number(item.price).toLocaleString()} ${C.price}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
