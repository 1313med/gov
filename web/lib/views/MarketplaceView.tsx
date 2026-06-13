import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { fetchRentals, fetchSales } from "@/lib/api";

import { getCityBySlug, getCityName } from "@client-seo/catalog/cities";
import { resolveCityFacetSlug, getModelBySlugs } from "@client-seo/catalog/brands";
import {
  buildHubSeo,
  buildCityCategorySeo,
  buildCityBrandSeo,
  buildCityModelSeo,
  defaultFaqs,
} from "@client-seo/programmaticSeo";
import { getSeoForPath } from "@client-seo/seoLocales";
import { buildSeoPath } from "@client-seo/seoPaths";
import {
  graphJsonLd,
  collectionPageJsonLd,
  faqPageJsonLd,
  breadcrumbJsonLd,
  localBusinessJsonLd,
} from "@client-seo/jsonLd";
import { buildRentalListingPath, buildSaleListingPath } from "@client-seo/slugUtils";

type Intent = "rental" | "sale";

function filterListings(
  items: Record<string, unknown>[],
  opts: {
    city?: ReturnType<typeof getCityBySlug>;
    brand?: { name?: Record<string, string> };
    model?: { displayName: string };
    category?: { filters?: Record<string, unknown> };
  }
) {
  let list = [...items];
  if (opts.city) {
    const cn = getCityName(opts.city, "fr");
    list = list.filter((x) => String(x.city || "").toLowerCase() === cn.toLowerCase());
  }
  if (opts.brand?.name?.fr) {
    list = list.filter((x) =>
      String(x.brand || "").toLowerCase().includes(opts.brand!.name!.fr!.toLowerCase())
    );
  }
  if (opts.model) {
    const mn = opts.model.displayName.replace(/-/g, " ");
    list = list.filter((x) => String(x.model || "").toLowerCase().includes(mn.toLowerCase()));
  }
  const cat = opts.category?.filters;
  if (cat?.gearbox === "automatic") {
    list = list.filter((x) => String(x.gearbox || "").toLowerCase().includes("auto"));
  }
  if (cat?.fuel === "diesel") {
    list = list.filter((x) => String(x.fuel || "").toLowerCase().includes("diesel"));
  }
  if (cat?.fuel === "electric") {
    list = list.filter((x) => String(x.fuel || "").toLowerCase().includes("elec"));
  }
  if (cat?.seatsMin) {
    list = list.filter((x) => Number(x.seats) >= Number(cat.seatsMin));
  }
  return list;
}

export async function MarketplaceView({
  lang,
  intent,
  slug = [],
}: {
  lang: SeoLang;
  intent: Intent;
  slug?: string[];
}) {
  const siteUrl = getSiteUrl();
  const hubPath = intent === "sale" ? "/voiture-occasion" : "/location-voiture";

  // Hub page (no slug)
  if (!slug.length) {
    const seo = buildHubSeo(lang, intent);
    if (!seo) return null;
    const pageUrl = `${siteUrl}${buildSeoPath(lang, hubPath)}`;
    return (
      <>
        <JsonLd
          data={graphJsonLd(
            collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: [] }),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: seo.h1, url: pageUrl },
            ])
          )}
        />
        <main className="mx-auto max-w-5xl px-4 py-10">
          <Breadcrumbs items={[{ label: "Goovoiture", href: "/" }, { label: seo.h1, href: undefined }]} lang={lang} />
          <h1 className="text-3xl font-bold mb-4">{seo.h1}</h1>
          <p className="text-gray-600 mb-8">{seo.intro}</p>
          <p>
            <a href={buildSeoPath(lang, "/location-voiture/casablanca")} className="text-violet-600 font-medium">
              {lang === "fr" ? "Location Casablanca →" : "Casablanca →"}
            </a>
          </p>
        </main>
        <SeoFooter lang={lang} />
      </>
    );
  }

  const [citySlug, facetOrBrand, modelSlug] = slug;
  const city = getCityBySlug(citySlug);

  // City-only page
  if (city && slug.length === 1) {
    const basePath = `${hubPath}/${citySlug}`;
    const seo = getSeoForPath(buildSeoPath(lang, basePath));
    const cityName = getCityName(city, lang);
    const raw =
      intent === "rental"
        ? await fetchRentals(city.name.fr)
        : await fetchSales(city.name.fr, undefined, 12);
    const listings = raw.slice(0, 12);
    const pageUrl = `${siteUrl}${buildSeoPath(lang, basePath)}`;

    return (
      <>
        <JsonLd
          data={
            intent === "rental"
              ? graphJsonLd(
                  localBusinessJsonLd({ cityName, siteUrl, pageUrl }),
                  breadcrumbJsonLd([
                    { name: "Goovoiture", url: siteUrl },
                    { name: seo?.h1 || cityName, url: pageUrl },
                  ])
                )
              : breadcrumbJsonLd([
                  { name: "Goovoiture", url: siteUrl },
                  { name: seo?.h1 || cityName, url: pageUrl },
                ])
          }
        />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <Breadcrumbs
            items={[
              { label: "Goovoiture", href: "/" },
              { label: intent === "sale" ? "Occasion" : "Location", href: hubPath },
              { label: cityName, href: undefined },
            ]}
            lang={lang}
          />
          <h1 className="text-2xl font-bold mb-3">{seo?.h1}</h1>
          <p className="text-gray-600 mb-8">{seo?.intro}</p>
          <ListingGrid listings={listings} lang={lang} intent={intent} />
        </main>
        <SeoFooter lang={lang} />
      </>
    );
  }

  if (!city) {
    return (
      <main className="p-8 text-center text-gray-500">
        <h1>Page introuvable</h1>
      </main>
    );
  }

  const brandKey = facetOrBrand;
  const facet = brandKey ? resolveCityFacetSlug(brandKey, intent) : null;
  const model = modelSlug && brandKey ? getModelBySlugs(brandKey, modelSlug) : null;

  let seo = null;
  if (model) seo = buildCityModelSeo(lang, citySlug, brandKey, modelSlug, intent);
  else if (facet?.type === "brand") seo = buildCityBrandSeo(lang, citySlug, brandKey, intent);
  else if (facet?.type === "category") seo = buildCityCategorySeo(lang, citySlug, brandKey, intent);

  if (!seo || !facet) {
    return (
      <main className="p-8 text-center text-gray-500">
        <h1>Page introuvable</h1>
      </main>
    );
  }

  const raw =
    intent === "rental" ? await fetchRentals(city.name.fr) : await fetchSales(city.name.fr, undefined, 100);
  const listings = filterListings(raw, {
    city,
    brand: facet.type === "brand" ? facet.data : model?.brand,
    model: model || undefined,
    category: facet.type === "category" ? facet.data : undefined,
  }).slice(0, 12);

  const faqs = defaultFaqs(lang, {
    cityName: getCityName(city, lang),
    categoryName: facet.data?.name?.[lang] || facet.data?.name?.fr,
    intent,
  });

  const pageUrl = `${siteUrl}${buildSeoPath(lang, seo.path)}`;
  const itemList = listings.map((item: Record<string, unknown>) => ({
    name: `${item.brand} ${item.model}`,
    url: `${siteUrl}${buildSeoPath(
      lang,
      intent === "sale" ? buildSaleListingPath(item) : buildRentalListingPath(item)
    )}`,
  }));

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: itemList }),
          faqPageJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Goovoiture", url: siteUrl },
            { name: intent === "sale" ? "Occasion" : "Location", url: `${siteUrl}${buildSeoPath(lang, hubPath)}` },
            { name: getCityName(city, lang), url: `${siteUrl}${buildSeoPath(lang, `${hubPath}/${citySlug}`)}` },
            { name: seo.h1, url: pageUrl },
          ])
        )}
      />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: intent === "sale" ? "Occasion" : "Location", href: hubPath },
            { label: getCityName(city, lang), href: `${hubPath}/${citySlug}` },
            { label: seo.h1.split("—")[0].trim(), href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-2xl font-bold mb-3">{seo.h1}</h1>
        <p className="text-gray-600 mb-8">{seo.intro}</p>
        <ListingGrid listings={listings} lang={lang} intent={intent} />
        <FaqSection faqs={faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}

function ListingGrid({
  listings,
  lang,
  intent,
}: {
  listings: Record<string, unknown>[];
  lang: SeoLang;
  intent: Intent;
}) {
  if (!listings.length) {
    return <p className="text-gray-500">Aucune annonce pour le moment.</p>;
  }
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
      {listings.map((item) => (
        <li key={String(item._id)}>
          <a
            href={buildSeoPath(
              lang,
              intent === "sale" ? buildSaleListingPath(item) : buildRentalListingPath(item)
            )}
            className="block rounded-xl border border-gray-200 p-4 hover:shadow-md"
          >
            {Array.isArray(item.images) && item.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={String(item.images[0])}
                alt={`${item.brand} ${item.model}`}
                className="h-36 w-full object-cover rounded-lg mb-3"
                loading="lazy"
              />
            ) : null}
            <h3 className="font-semibold">
              {String(item.brand)} {String(item.model)} {String(item.year)}
            </h3>
            <p className="text-violet-600 text-sm mt-1">
              {intent === "rental"
                ? `${Number(item.pricePerDay).toLocaleString()} MAD/jour`
                : `${Number(item.price).toLocaleString()} MAD`}
            </p>
          </a>
        </li>
      ))}
    </ul>
  );
}

export async function marketplaceMetadata(lang: SeoLang, intent: Intent, slug: string[] = []) {
  const hubPath = intent === "sale" ? "/voiture-occasion" : "/location-voiture";
  if (!slug.length) {
    const seo = buildHubSeo(lang, intent);
    if (!seo) return null;
    return { basePath: hubPath, title: seo.title, description: seo.description, keywords: seo.keywords };
  }
  const [citySlug, facetOrBrand, modelSlug] = slug;
  const city = getCityBySlug(citySlug);
  if (city && slug.length === 1) {
    const seo = getSeoForPath(buildSeoPath(lang, `${hubPath}/${citySlug}`));
    return {
      basePath: `${hubPath}/${citySlug}`,
      title: seo?.title || "",
      description: seo?.description || "",
      keywords: seo?.keywords,
    };
  }
  const facet = facetOrBrand ? resolveCityFacetSlug(facetOrBrand, intent) : null;
  const model = modelSlug && facetOrBrand ? getModelBySlugs(facetOrBrand, modelSlug) : null;
  let seo = null;
  if (model) seo = buildCityModelSeo(lang, citySlug, facetOrBrand, modelSlug, intent);
  else if (facet?.type === "brand") seo = buildCityBrandSeo(lang, citySlug, facetOrBrand, intent);
  else if (facet?.type === "category") seo = buildCityCategorySeo(lang, citySlug, facetOrBrand, intent);
  if (!seo) return null;
  return { basePath: seo.path, title: seo.title, description: seo.description, keywords: seo.keywords };
}
