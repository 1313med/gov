import { notFound } from "next/navigation";
import { getSiteUrl, type SeoLang } from "@/lib/site";
import { fetchRentals } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { getAirportBySlug, getAirportName } from "@client-seo/catalog/airports";
import { getCityBySlug } from "@client-seo/catalog/cities";
import { buildAirportSeo, defaultFaqs } from "@client-seo/programmaticSeo";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, collectionPageJsonLd, faqPageJsonLd, breadcrumbJsonLd, localBusinessJsonLd } from "@client-seo/jsonLd";
import { buildRentalListingPath } from "@client-seo/slugUtils";

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

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          localBusinessJsonLd({ name: seo.h1, cityName: getAirportName(airport, lang), siteUrl, pageUrl }),
          collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: [] }),
          faqPageJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "Goovoiture", url: siteUrl },
            { name: seo.h1, url: pageUrl },
          ])
        )}
      />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Location", href: "/location-voiture" },
            { label: seo.h1, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-4">{seo.h1}</h1>
        <p className="text-gray-600 mb-8">{seo.intro}</p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {listings.map((item: Record<string, unknown>) => (
            <li key={String(item._id)}>
              <a href={buildSeoPath(lang, buildRentalListingPath(item))} className="block p-4 border rounded-xl hover:shadow-md">
                <h3 className="font-semibold">{String(item.brand)} {String(item.model)} {String(item.year)}</h3>
                <p className="text-violet-600 text-sm">{Number(item.pricePerDay).toLocaleString()} MAD/j</p>
              </a>
            </li>
          ))}
        </ul>
        <FaqSection faqs={faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
