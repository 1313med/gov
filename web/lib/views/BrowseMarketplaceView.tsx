import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import ListingGrid from "@/components/ui/ListingGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import JsonLd from "@/components/ssr/JsonLd";
import { RelatedLinksSection } from "@/components/ui/PremiumCTA";
import { fetchRentals, fetchSales } from "@/lib/api";
import { getSeoForPath } from "@client-seo/seoLocales";
import { buildSeoPath } from "@client-seo/seoPaths";
import { defaultFaqs } from "@client-seo/programmaticSeo";
import { MOROCCO_CITIES } from "@client-seo/catalog/cities";
import { graphJsonLd, collectionPageJsonLd, faqPageJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";
import { buildRentalListingPath, buildSaleListingPath } from "@client-seo/slugUtils";
import { formatListingTitle } from "@client-seo/listingContent";

type Intent = "rental" | "sale";

export function browseMetadata(lang: SeoLang, intent: Intent) {
  const basePath = intent === "sale" ? "/cars" : "/rentals";
  const seo = getSeoForPath(buildSeoPath(lang, basePath));
  if (!seo) return null;
  return {
    basePath,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  };
}

export default async function BrowseMarketplaceView({ lang, intent }: { lang: SeoLang; intent: Intent }) {
  const basePath = intent === "sale" ? "/cars" : "/rentals";
  const seo = getSeoForPath(buildSeoPath(lang, basePath));
  const hubPath = intent === "sale" ? "/voiture-occasion" : "/location-voiture";
  const listings =
    intent === "rental" ? await fetchRentals(undefined, undefined, 24) : await fetchSales(undefined, undefined, 24);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, basePath)}`;
  const faqs = defaultFaqs(lang, { cityName: lang === "fr" ? "Maroc" : lang === "ar" ? "المغرب" : "Morocco", intent });

  const itemList = listings.slice(0, 12).map((item: Record<string, unknown>) => ({
    name: formatListingTitle(item),
    url: `${siteUrl}${buildSeoPath(
      lang,
      intent === "sale" ? buildSaleListingPath(item) : buildRentalListingPath(item)
    )}`,
  }));

  const cityLinks = MOROCCO_CITIES.slice(0, 12).map((c) => ({
    label: `${intent === "sale" ? (lang === "fr" ? "Occasion" : "Used") : lang === "fr" ? "Location" : "Rental"} ${c.name[lang] || c.name.fr}`,
    href: buildSeoPath(lang, `${hubPath}/${c.slug}`),
  }));

  const labels = {
    fr: {
      hub: intent === "sale" ? "Hub occasion Maroc" : "Hub location Maroc",
      count: (n: number) => `${n} annonce(s) disponible(s)`,
      section: intent === "sale" ? "Voitures d'occasion à vendre" : "Locations disponibles",
    },
    en: {
      hub: intent === "sale" ? "Used cars hub" : "Rental hub",
      count: (n: number) => `${n} listing(s) available`,
      section: intent === "sale" ? "Used cars for sale" : "Available rentals",
    },
    ar: {
      hub: intent === "sale" ? "سوق السيارات المستعملة" : "مركز الكراء",
      count: (n: number) => `${n} إعلان(ات)`,
      section: intent === "sale" ? "سيارات مستعملة للبيع" : "عروض الكراء",
    },
  };
  const L = labels[lang] || labels.fr;

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: seo?.h1 || basePath, href: undefined },
      ]}
      hero={{
        kicker: "Goovoiture Marketplace",
        title: seo?.h1 || basePath,
        description: seo?.intro,
      }}
      faqs={faqs}
      cta={{
        title: lang === "fr" ? "Explorer par ville" : "Browse by city",
        primaryHref: buildSeoPath(lang, hubPath),
        primaryLabel: L.hub,
        secondaryHref: buildSeoPath(lang, intent === "sale" ? "/vendre-ma-voiture" : "/agences"),
        secondaryLabel: intent === "sale" ? (lang === "fr" ? "Vendre ma voiture" : "Sell my car") : lang === "fr" ? "Agences" : "Agencies",
      }}
      related={{ showListings: false, showBrands: true, showBlog: true }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            collectionPageJsonLd({
              name: seo?.h1 || basePath,
              url: pageUrl,
              description: seo?.description || "",
              items: itemList,
            }),
            faqPageJsonLd(faqs),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: seo?.h1 || basePath, url: pageUrl },
            ])
          )}
        />
      }
    >
      <section className="gv-sec-sm">
        <SectionHeader
          eyebrow={intent === "sale" ? "Occasion" : "Location"}
          title={L.section}
          description={L.count(listings.length)}
        />
        <ListingGrid listings={listings} lang={lang} intent={intent} />
      </section>
      <RelatedLinksSection title={lang === "fr" ? "Par ville" : "By city"} links={cityLinks} />
    </SeoPageShell>
  );
}
