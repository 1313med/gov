import { notFound } from "next/navigation";
import { getSiteUrl, type SeoLang } from "@/lib/site";
import { fetchRentals } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import ListingGrid from "@/components/ui/ListingGrid";
import SectionHeader from "@/components/ui/SectionHeader";
import JsonLd from "@/components/ssr/JsonLd";
import { getAirportBySlug, getAirportName } from "@client-seo/catalog/airports";
import { getCityBySlug } from "@client-seo/catalog/cities";
import { buildAirportSeo, defaultFaqs } from "@client-seo/programmaticSeo";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, collectionPageJsonLd, faqPageJsonLd, breadcrumbJsonLd, localBusinessJsonLd } from "@client-seo/jsonLd";

export default async function AirportView({
  lang,
  airportSlug,
  categorySlug,
}: {
  lang: SeoLang;
  airportSlug: string;
  categorySlug?: string;
}) {
  const airport = getAirportBySlug(airportSlug);
  const seo = airport ? buildAirportSeo(lang, airportSlug, categorySlug) : null;
  if (!airport || !seo) notFound();

  const city = getCityBySlug(airport.citySlug);
  const listings = city ? (await fetchRentals(city.name.fr)).slice(0, 12) : [];
  const faqs = defaultFaqs(lang, { cityName: getAirportName(airport, lang) });
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, seo.path)}`;
  const airportName = getAirportName(airport, lang);

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Location", href: "/location-voiture" },
        { label: seo.h1, href: undefined },
      ]}
      hero={{
        kicker: "Location aéroport",
        title: seo.h1,
        description: seo.intro,
        badges: [airportName],
      }}
      faqs={faqs}
      cta={{
        title: lang === "fr" ? `Louer à ${airportName}` : `Rent at ${airportName}`,
        primaryHref: buildSeoPath(lang, `/location-voiture/${airport.citySlug}`),
        primaryLabel: lang === "fr" ? "Voir la ville" : "Browse city",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: lang === "fr" ? "Toutes les locations" : "All rentals",
      }}
      related={{ showListings: true, showAgencies: true }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            localBusinessJsonLd({ name: seo.h1, cityName: airportName, siteUrl, pageUrl }),
            collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: [] }),
            faqPageJsonLd(faqs),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: seo.h1, url: pageUrl },
            ])
          )}
        />
      }
    >
      <section className="gv-sec-sm">
        <SectionHeader
          eyebrow={airportName}
          title={lang === "fr" ? "Véhicules disponibles" : "Available vehicles"}
          description={lang === "fr" ? "Location avec récupération à l'aéroport" : "Pickup at the airport"}
        />
        <ListingGrid
          listings={listings}
          lang={lang}
          intent="rental"
          emptyActionHref={buildSeoPath(lang, `/location-voiture/${airport.citySlug}`)}
          emptyActionLabel={lang === "fr" ? "Voir la ville" : "Browse city"}
        />
      </section>
    </SeoPageShell>
  );
}
