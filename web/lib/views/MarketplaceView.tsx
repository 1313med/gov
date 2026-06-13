import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import ListingGrid from "@/components/ui/ListingGrid";
import { RelatedLinksSection } from "@/components/ui/PremiumCTA";
import SectionHeader from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/PremiumCTA";
import JsonLd from "@/components/ssr/JsonLd";
import { fetchRentals, fetchSales } from "@/lib/api";

import { getCityBySlug, getCityName, MOROCCO_CITIES } from "@client-seo/catalog/cities";
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
  const hubLabel = intent === "sale" ? "Occasion" : "Location";

  // Hub page (no slug)
  if (!slug.length) {
    const seo = buildHubSeo(lang, intent);
    if (!seo) return null;
    const pageUrl = `${siteUrl}${buildSeoPath(lang, hubPath)}`;
    const cityLinks = MOROCCO_CITIES.slice(0, 18).map((c) => ({
      label: `${hubLabel} ${c.name[lang] || c.name.fr}`,
      href: buildSeoPath(lang, `${hubPath}/${c.slug}`),
    }));

    return (
      <SeoPageShell
        lang={lang}
        breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: seo.h1, href: undefined }]}
        hero={{
          kicker: "Goovoiture Marketplace",
          title: seo.h1,
          description: seo.intro,
        }}
        cta={{
          title: lang === "fr" ? "Comparer les offres" : "Compare offers",
          primaryHref: buildSeoPath(lang, "/location-voiture/casablanca"),
          primaryLabel: lang === "fr" ? "Location Casablanca" : "Casablanca rental",
          secondaryHref: buildSeoPath(lang, "/voiture-occasion/casablanca"),
          secondaryLabel: lang === "fr" ? "Occasion Casablanca" : "Casablanca used cars",
        }}
        jsonLd={
          <JsonLd
            data={graphJsonLd(
              collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: [] }),
              breadcrumbJsonLd([
                { name: "Goovoiture", url: siteUrl },
                { name: seo.h1, url: pageUrl },
              ])
            )}
          />
        }
      >
        <RelatedLinksSection
          title={lang === "fr" ? "Par ville" : "By city"}
          links={cityLinks}
        />
      </SeoPageShell>
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
      <SeoPageShell
        lang={lang}
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: hubLabel, href: hubPath },
          { label: cityName, href: undefined },
        ]}
        hero={{
          kicker: "Goovoiture Marketplace",
          title: seo?.h1 || cityName,
          description: seo?.intro,
        }}
        cta={{
          title: lang === "fr" ? `Plus d'offres à ${cityName}` : `More offers in ${cityName}`,
          primaryHref: buildSeoPath(lang, intent === "rental" ? "/cars" : "/cars"),
          primaryLabel: lang === "fr" ? "Marketplace interactif" : "Interactive marketplace",
          secondaryHref: buildSeoPath(lang, intent === "rental" ? "/agences" : "/concessionnaires"),
          secondaryLabel: intent === "rental" ? "Agences" : "Concessionnaires",
        }}
        related={{ showListings: false, showBrands: true, showAgencies: intent === "rental" }}
        jsonLd={
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
        }
      >
        <section className="gv-sec-sm">
          <SectionHeader
            eyebrow={cityName}
            title={lang === "fr" ? "Annonces disponibles" : "Available listings"}
            description={lang === "fr" ? `${listings.length} offre(s) trouvée(s)` : `${listings.length} offer(s) found`}
          />
          <ListingGrid
            listings={listings}
            lang={lang}
            intent={intent}
            emptyActionHref={buildSeoPath(lang, hubPath)}
            emptyActionLabel={lang === "fr" ? "Voir toutes les villes" : "Browse all cities"}
          />
        </section>
      </SeoPageShell>
    );
  }

  if (!city) {
    return (
      <SeoPageShell
        lang={lang}
        breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: "Page introuvable", href: undefined }]}
        hero={{ title: "Page introuvable" }}
      >
        <EmptyState title="Page introuvable" actionHref="/" actionLabel="Retour à l'accueil" />
      </SeoPageShell>
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
      <SeoPageShell
        lang={lang}
        breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: "Page introuvable", href: undefined }]}
        hero={{ title: "Page introuvable" }}
      >
        <EmptyState title="Page introuvable" actionHref={buildSeoPath(lang, hubPath)} actionLabel={hubLabel} />
      </SeoPageShell>
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
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: hubLabel, href: hubPath },
        { label: getCityName(city, lang), href: `${hubPath}/${citySlug}` },
        { label: seo.h1.split("—")[0].trim(), href: undefined },
      ]}
      hero={{
        kicker: getCityName(city, lang),
        title: seo.h1,
        description: seo.intro,
      }}
      faqs={faqs}
      cta={{
        title: lang === "fr" ? "Comparer toutes les offres" : "Compare all offers",
        primaryHref: buildSeoPath(lang, hubPath),
        primaryLabel: hubLabel,
        secondaryHref: buildSeoPath(lang, `${hubPath}/${citySlug}`),
        secondaryLabel: getCityName(city, lang),
      }}
      related={{ brandSlug: facet.type === "brand" ? brandKey : undefined, showListings: false }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: itemList }),
            faqPageJsonLd(faqs),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: hubLabel, url: `${siteUrl}${buildSeoPath(lang, hubPath)}` },
              { name: getCityName(city, lang), url: `${siteUrl}${buildSeoPath(lang, `${hubPath}/${citySlug}`)}` },
              { name: seo.h1, url: pageUrl },
            ])
          )}
        />
      }
    >
      <section className="gv-sec-sm">
        <SectionHeader
          eyebrow={getCityName(city, lang)}
          title={lang === "fr" ? "Annonces filtrées" : "Filtered listings"}
        />
        <ListingGrid
          listings={listings}
          lang={lang}
          intent={intent}
          emptyActionHref={buildSeoPath(lang, `${hubPath}/${citySlug}`)}
          emptyActionLabel={getCityName(city, lang)}
        />
      </section>
    </SeoPageShell>
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
