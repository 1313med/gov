import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchSellerProfile } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { getCityBySlug, getCityName } from "@client-seo/catalog/cities";
import { parseAgencySlug, buildAgencyPath, buildDealerPath, buildRentalListingPath, buildSaleListingPath } from "@client-seo/slugUtils";
import { buildSeoPath } from "@client-seo/seoPaths";
import { defaultFaqs } from "@client-seo/programmaticSeo";
import { graphJsonLd, localBusinessJsonLd, autoDealerJsonLd, collectionPageJsonLd, faqPageJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

type ProfileKind = "agency" | "dealer";

function profilePath(kind: ProfileKind, citySlug: string, name: string, id: string) {
  return kind === "agency" ? buildAgencyPath(citySlug, name, id) : buildDealerPath(citySlug, name, id);
}

export async function profileMetadata(kind: ProfileKind, citySlug: string, profileSlug: string) {
  const { id } = parseAgencySlug(profileSlug);
  if (!id) return null;
  const data = await fetchSellerProfile(id);
  if (!data?.seller) return null;
  const seller = data.seller;
  const city = getCityBySlug(citySlug);
  const cityName = city ? getCityName(city, "fr") : seller.city || citySlug;
  const basePath = profilePath(kind, citySlug, seller.name, String(seller._id));
  const label = kind === "agency" ? "Agence" : "Concessionnaire";
  return {
    basePath,
    title: `${seller.name} — ${label} ${cityName} | GoVoiture`,
    description: `${seller.name} à ${cityName} : ${(data.rentalListings?.length || 0) + (data.listings?.length || 0)} annonces sur GoVoiture.`,
    keywords: `${seller.name} ${cityName}, ${kind === "agency" ? "agence location voiture" : "concessionnaire auto"}`,
  };
}

export default async function ProfileView({
  lang,
  kind,
  citySlug,
  profileSlug,
}: {
  lang: SeoLang;
  kind: ProfileKind;
  citySlug: string;
  profileSlug: string;
}) {
  const { id } = parseAgencySlug(profileSlug);
  if (!id) notFound();

  const data = await fetchSellerProfile(id);
  if (!data?.seller) notFound();

  const seller = data.seller;
  const city = getCityBySlug(citySlug);
  const cityName = city ? getCityName(city, lang) : seller.city || citySlug;
  const rentals = data.rentalListings || [];
  const sales = data.listings || [];
  const allListings = [...rentals, ...sales].slice(0, 12);
  const basePath = profilePath(kind, citySlug, seller.name, String(seller._id));
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, basePath)}`;
  const hubPath = kind === "agency" ? "/agences" : "/concessionnaires";
  const hubLabel = kind === "agency" ? "Agences" : "Concessionnaires";
  const faqs = defaultFaqs(lang, { cityName, intent: kind === "agency" ? "rental" : "sale" });

  const businessSchema =
    kind === "agency"
      ? localBusinessJsonLd({ name: seller.name, cityName, siteUrl, pageUrl })
      : autoDealerJsonLd({ name: seller.name, cityName, siteUrl, pageUrl });

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          businessSchema,
          collectionPageJsonLd({
            name: seller.name,
            url: pageUrl,
            description: `${seller.name} — ${cityName}`,
            items: allListings.map((item: Record<string, unknown>) => ({
              name: `${item.brand} ${item.model}`,
              url: `${siteUrl}${buildSeoPath(
                lang,
                item.pricePerDay != null ? buildRentalListingPath(item) : buildSaleListingPath(item)
              )}`,
            })),
          }),
          faqPageJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: hubLabel, url: `${siteUrl}${hubPath}` },
            { name: cityName, url: `${siteUrl}${hubPath}/${citySlug}` },
            { name: seller.name, url: pageUrl },
          ])
        )}
      />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: hubLabel, href: hubPath },
            { label: cityName, href: `${hubPath}/${citySlug}` },
            { label: seller.name, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-2">{seller.name}</h1>
        <p className="text-gray-600 mb-2">{cityName}</p>
        {seller.bio ? <p className="text-gray-700 mb-6">{seller.bio}</p> : null}
        <p className="text-sm text-gray-500 mb-8">
          {allListings.length} annonce{allListings.length !== 1 ? "s" : ""} active{allListings.length !== 1 ? "s" : ""}
        </p>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {allListings.map((item: Record<string, unknown>) => (
            <li key={String(item._id)}>
              <a
                href={buildSeoPath(
                  lang,
                  item.pricePerDay != null ? buildRentalListingPath(item) : buildSaleListingPath(item)
                )}
                className="block p-4 border rounded-xl hover:shadow-md"
              >
                <h3 className="font-semibold">{String(item.brand)} {String(item.model)}</h3>
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
