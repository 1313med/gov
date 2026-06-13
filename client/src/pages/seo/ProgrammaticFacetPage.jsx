import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { api } from "../../api/axios";
import SeoHead from "../../components/SeoHead";
import SeoBreadcrumbs from "../../components/seo/SeoBreadcrumbs";
import SeoFooter from "../../components/seo/SeoFooter";
import { getCityBySlug, getCityName } from "../../seo/catalog/cities";
import { resolveCityFacetSlug, getModelBySlugs } from "../../seo/catalog/brands";
import {
  buildCityCategorySeo,
  buildCityBrandSeo,
  buildCityModelSeo,
  defaultFaqs,
} from "../../seo/programmaticSeo";
import { shouldIndexPage, robotsForGate } from "../../seo/qualityGate";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";
import { getSiteUrl } from "../../seo/seoLocales";
import {
  graphJsonLd,
  collectionPageJsonLd,
  faqPageJsonLd,
  breadcrumbJsonLd,
} from "../../seo/jsonLd";
import { buildRentalListingPath, buildSaleListingPath } from "../../seo/slugUtils";

function filterListings(items, { city, brand, model, category, intent }) {
  let list = [...items];
  if (city) {
    const cn = getCityName(city, "fr");
    list = list.filter((x) => (x.city || "").toLowerCase() === cn.toLowerCase());
  }
  if (brand) {
    list = list.filter((x) => (x.brand || "").toLowerCase().includes(brand.name.fr.toLowerCase()));
  }
  if (model) {
    const mn = model.displayName.replace(/-/g, " ");
    list = list.filter((x) => (x.model || "").toLowerCase().includes(mn.toLowerCase()));
  }
  if (category?.filters?.gearbox === "automatic") {
    list = list.filter((x) => (x.gearbox || "").toLowerCase().includes("auto"));
  }
  if (category?.filters?.fuel === "diesel") {
    list = list.filter((x) => (x.fuel || "").toLowerCase().includes("diesel"));
  }
  if (category?.filters?.fuel === "electric") {
    list = list.filter((x) => (x.fuel || "").toLowerCase().includes("elec"));
  }
  if (category?.filters?.seatsMin) {
    list = list.filter((x) => Number(x.seats) >= category.filters.seatsMin);
  }
  return list;
}

export default function ProgrammaticFacetPage({ intent = "rental" }) {
  const { citySlug, facetSlug, brandSlug, modelSlug } = useParams();
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const city = getCityBySlug(citySlug);
  const brandKey = brandSlug || facetSlug;
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const facet = brandKey ? resolveCityFacetSlug(brandKey, intent) : null;
  const model = modelSlug && brandKey ? getModelBySlugs(brandKey, modelSlug) : null;

  const seo = useMemo(() => {
    if (!city) return null;
    if (model) return buildCityModelSeo(lang, citySlug, brandKey, modelSlug, intent);
    if (facet?.type === "brand") return buildCityBrandSeo(lang, citySlug, brandKey, intent);
    if (facet?.type === "category") return buildCityCategorySeo(lang, citySlug, brandKey, intent);
    return null;
  }, [city, facet, model, lang, citySlug, brandKey, modelSlug, intent]);

  const faqs = defaultFaqs(lang, {
    cityName: city ? getCityName(city, lang) : "",
    categoryName: facet?.data?.name?.[lang] || facet?.data?.name?.fr,
    intent,
  });

  useEffect(() => {
    if (!city || !seo) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        if (intent === "rental") {
          const res = await api.get("/rental", { params: { city: city.name.fr } });
          const data = Array.isArray(res.data) ? res.data : res.data?.rentals || [];
          setListings(
            filterListings(data, {
              city,
              brand: facet?.type === "brand" ? facet.data : model?.brand,
              model,
              category: facet?.type === "category" ? facet.data : null,
              intent,
            })
          );
        } else {
          const res = await api.get("/sale", { params: { limit: 100, city: city.name.fr } });
          setListings(
            filterListings(res.data?.items || [], {
              city,
              brand: facet?.type === "brand" ? facet.data : model?.brand,
              model,
              category: facet?.type === "category" ? facet.data : null,
              intent,
            })
          );
        }
      } catch {
        setListings([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [city, facet, model, intent, seo]);

  if (!city || !seo || !facet) {
    return (
      <div className="p-8 text-center text-gray-500 min-h-screen">
        Page introuvable
      </div>
    );
  }

  const indexable = shouldIndexPage({ listings, intro: seo.intro, faq: faqs, forceIndex: true });
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${pathname}`;
  const cityN = getCityName(city, lang);
  const hubPath = intent === "sale" ? "/voiture-occasion" : "/location-voiture";

  const breadcrumbs = [
    { label: "GoVoiture", href: "/" },
    {
      label: intent === "sale" ? (lang === "ar" ? "سيارات مستعملة" : lang === "en" ? "Used cars" : "Voiture occasion") : lang === "ar" ? "تأجير" : lang === "en" ? "Car rental" : "Location voiture",
      href: hubPath,
    },
    { label: cityN, href: `${hubPath}/${citySlug}` },
    { label: seo.h1.split("—")[0].trim(), href: null },
  ];

  const itemList = listings.slice(0, 12).map((item) => ({
    name: `${item.brand} ${item.model}`,
    url: `${siteUrl}${buildSeoPath(lang, intent === "sale" ? buildSaleListingPath(item).replace(/^\/(en|ar)/, "") : buildRentalListingPath(item))}`,
  }));

  const jsonLdExtra = graphJsonLd(
    collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: itemList }),
    faqPageJsonLd(faqs),
    breadcrumbJsonLd(
      breadcrumbs.filter((b) => b.href).map((b, i, arr) => ({
        name: b.label,
        url: `${siteUrl}${buildSeoPath(lang, b.href)}`,
      })).concat([{ name: seo.h1, url: pageUrl }])
    )
  );

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
        jsonLdExtra={jsonLdExtra}
      />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <SeoBreadcrumbs items={breadcrumbs} />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{seo.h1}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{seo.intro}</p>

        {loading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : listings.length === 0 ? (
          <p className="text-gray-500 mb-8">
            {lang === "fr"
              ? "Aucune annonce pour cette combinaison — explorez la ville ou d'autres catégories."
              : "No listings for this combination yet."}
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
            {listings.slice(0, 12).map((item) => (
              <li key={item._id}>
                <Link
                  to={buildSeoPath(lang, intent === "sale" ? buildSaleListingPath(item) : buildRentalListingPath(item))}
                  className="block rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 hover:shadow-md"
                >
                  {item.images?.[0] && (
                    <img src={item.images[0]} alt="" className="h-36 w-full object-cover rounded-lg mb-3" loading="lazy" />
                  )}
                  <h3 className="font-semibold">{item.brand} {item.model} {item.year}</h3>
                  <p className="text-violet-600 text-sm mt-1">
                    {intent === "rental"
                      ? `${Number(item.pricePerDay).toLocaleString()} MAD/j`
                      : `${Number(item.price).toLocaleString()} MAD`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <section className="border-t border-gray-200 dark:border-white/10 pt-8">
          <h2 className="text-lg font-semibold mb-4">FAQ</h2>
          <dl className="space-y-4">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-gray-900 dark:text-gray-100">{f.q}</dt>
                <dd className="text-gray-600 dark:text-gray-400 mt-1">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <SeoFooter />
    </div>
  );
}
