import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchSellerProfile } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import ReviewsSection from "@/components/ssr/ReviewsSection";
import SeoFooter from "@/components/ssr/SeoFooter";
import { getCityBySlug, getCityName } from "@client-seo/catalog/cities";
import { agencyFaqs, dealerFaqs } from "@client-seo/catalog/professionals";
import { parseAgencySlug, buildRentalListingPath, buildSaleListingPath } from "@client-seo/slugUtils";
import { buildSeoPath } from "@client-seo/seoPaths";
import {
  graphJsonLd,
  localBusinessJsonLd,
  autoDealerJsonLd,
  collectionPageJsonLd,
  faqPageJsonLd,
  breadcrumbJsonLd,
  reviewsGraphJsonLd,
} from "@client-seo/jsonLd";

type ProfileKind = "agency" | "dealer";

export async function profileMetadata(kind: ProfileKind, citySlug: string, profileSlug: string) {
  const { id } = parseAgencySlug(profileSlug);
  if (!id) return null;
  const data = await fetchSellerProfile(id);
  if (!data?.seller) return null;
  const path = kind === "agency" ? data.agencyPath : data.dealerPath;
  if (!path) return null;
  const city = getCityBySlug(citySlug);
  const cityName = city ? getCityName(city, "fr") : data.seller.city || citySlug;
  const label = kind === "agency" ? "Agence" : "Concessionnaire";
  return {
    basePath: path,
    title: `${data.seller.name} — ${label} ${cityName} | GoVoiture`,
    description: `${data.seller.name} à ${cityName} : flotte, avis et contact sur GoVoiture.`,
    keywords: `${data.seller.name} ${cityName}, ${kind === "agency" ? "agence location voiture" : "concessionnaire auto"}`,
  };
}

function whatsAppLink(phone?: string) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
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
  const inventory = kind === "agency" ? rentals : sales;
  const basePath = kind === "agency" ? data.agencyPath : data.dealerPath;
  if (!basePath) notFound();

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, basePath)}`;
  const hubPath = kind === "agency" ? "/agences" : "/concessionnaires";
  const hubLabel = kind === "agency" ? "Agences" : "Concessionnaires";
  const faqs = kind === "agency" ? agencyFaqs(lang, cityName) : dealerFaqs(lang, cityName);
  const wa = whatsAppLink(seller.phone);
  const itemReviewed = { "@type": kind === "agency" ? "AutoRental" : "AutoDealer", name: seller.name, url: pageUrl };

  const reviewNodes = reviewsGraphJsonLd(
    (data.reviews || []).map((r: { rating: number; comment?: string; authorId?: { name?: string }; createdAt?: string }) => ({
      authorName: r.authorId?.name,
      rating: r.rating,
      body: r.comment,
      datePublished: r.createdAt,
    })),
    itemReviewed
  );

  const businessSchema =
    kind === "agency"
      ? localBusinessJsonLd({
          name: seller.name,
          cityName,
          siteUrl,
          pageUrl,
          ratingValue: data.avgRating,
          reviewCount: data.reviewCount,
          phone: seller.phone,
          email: seller.email,
          address: data.address,
        })
      : autoDealerJsonLd({
          name: seller.name,
          cityName,
          siteUrl,
          pageUrl,
          ratingValue: data.avgRating,
          reviewCount: data.reviewCount,
          phone: seller.phone,
          email: seller.email,
          address: data.address,
        });

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          businessSchema,
          collectionPageJsonLd({
            name: seller.name,
            url: pageUrl,
            description: seller.bio || `${seller.name} — ${cityName}`,
            items: inventory.slice(0, 12).map((item: Record<string, unknown>) => ({
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
            { name: hubLabel, url: `${siteUrl}${buildSeoPath(lang, hubPath)}` },
            { name: cityName, url: `${siteUrl}${buildSeoPath(lang, `${hubPath}/${citySlug}`)}` },
            { name: seller.name, url: pageUrl },
          ]),
          ...(Array.isArray(reviewNodes) ? reviewNodes : reviewNodes ? [reviewNodes] : [])
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

        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          {seller.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={String(seller.avatar)} alt={seller.name} className="w-24 h-24 rounded-2xl object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-violet-100 flex items-center justify-center text-3xl font-bold text-violet-700">
              {seller.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-1">{seller.name}</h1>
            <p className="text-gray-600">{data.address || cityName}</p>
            {data.verified ? (
              <span className="inline-block mt-2 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                ✓ Profil vérifié
              </span>
            ) : null}
            <p className="text-sm text-gray-500 mt-2">
              {kind === "agency" ? "Flotte" : "Inventaire"} : {data.fleetSize || data.inventoryCount || inventory.length} véhicule
              {(data.fleetSize || inventory.length) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {seller.bio ? <p className="text-gray-700 mb-6">{seller.bio}</p> : null}

        <div className="grid sm:grid-cols-2 gap-4 mb-8 text-sm">
          {seller.phone ? (
            <p>
              <strong>Téléphone :</strong>{" "}
              <a href={`tel:${seller.phone}`} className="text-violet-600">
                {seller.phone}
              </a>
            </p>
          ) : null}
          {wa ? (
            <p>
              <strong>WhatsApp :</strong>{" "}
              <a href={wa} className="text-violet-600" rel="noopener">
                Contacter
              </a>
            </p>
          ) : null}
          {seller.email ? (
            <p>
              <strong>Email :</strong>{" "}
              <a href={`mailto:${seller.email}`} className="text-violet-600">
                {seller.email}
              </a>
            </p>
          ) : null}
          <p>
            <strong>Horaires :</strong> {data.openingHours || "Lun–Sam 9h–19h"}
          </p>
        </div>

        {data.rentalCategories?.length ? (
          <section className="mb-8">
            <h2 className="font-semibold mb-2">Catégories</h2>
            <ul className="flex flex-wrap gap-2">
              {data.rentalCategories.map((c: string) => (
                <li key={c} className="px-3 py-1 rounded-full bg-gray-100 text-sm">
                  {c}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-8">
          <h2 className="font-semibold mb-3">{kind === "agency" ? "Flotte disponible" : "Inventaire"}</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventory.slice(0, 12).map((item: Record<string, unknown>) => (
              <li key={String(item._id)}>
                <a
                  href={buildSeoPath(
                    lang,
                    item.pricePerDay != null ? buildRentalListingPath(item) : buildSaleListingPath(item)
                  )}
                  className="block p-4 border rounded-xl hover:shadow-md"
                >
                  <h3 className="font-semibold">
                    {String(item.brand)} {String(item.model)}
                  </h3>
                  <p className="text-violet-600 text-sm mt-1">
                    {item.pricePerDay != null
                      ? `${Number(item.pricePerDay).toLocaleString()} MAD/j`
                      : `${Number(item.price).toLocaleString()} MAD`}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <ReviewsSection
          reviews={data.reviews || []}
          avgRating={data.avgRating || 0}
          reviewCount={data.reviewCount || 0}
          lang={lang}
          verified={data.verified}
        />

        {data.related?.length ? (
          <section className="mb-10">
            <h2 className="font-semibold mb-3">
              {kind === "agency" ? "Agences similaires" : "Concessionnaires similaires"}
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3 text-sm">
              {data.related.map((r: { _id: string; name: string; path: string; city?: string }) => (
                <li key={r._id}>
                  <a href={buildSeoPath(lang, r.path)} className="text-violet-600 hover:underline">
                    {r.name} {r.city ? `— ${r.city}` : ""}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-8">
          <h2 className="font-semibold mb-2">Carte</h2>
          <p className="text-sm text-gray-600 mb-2">{cityName}, Maroc</p>
          <a
            href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(cityName + ", Morocco")}`}
            className="text-violet-600 text-sm hover:underline"
            rel="noopener noreferrer"
          >
            Voir sur la carte →
          </a>
        </section>

        <FaqSection faqs={faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
