import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchRentalById, fetchSaleById, fetchReviews } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import JsonLd from "@/components/ssr/JsonLd";
import ReviewsSection from "@/components/ssr/ReviewsSection";
import SeoFooter from "@/components/ssr/SeoFooter";
import { parseSemanticListingParam, buildRentalListingPath, buildSaleListingPath } from "@client-seo/slugUtils";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, vehicleJsonLd, breadcrumbJsonLd, reviewsGraphJsonLd } from "@client-seo/jsonLd";

type Intent = "rental" | "sale";

export async function listingMetadata(lang: SeoLang, intent: Intent, listingSlug: string) {
  const { id } = parseSemanticListingParam(listingSlug);
  if (!id) return null;
  const listing = intent === "rental" ? await fetchRentalById(id) : await fetchSaleById(id);
  if (!listing) return null;
  const basePath = intent === "rental" ? buildRentalListingPath(listing) : buildSaleListingPath(listing);
  const title = `${listing.brand} ${listing.model} ${listing.year}${listing.city ? ` — ${listing.city}` : ""} | GoVoiture`;
  const price = intent === "rental" ? listing.pricePerDay : listing.price;
  const description =
    intent === "rental"
      ? `Louez ${listing.brand} ${listing.model} ${listing.year} à ${listing.pricePerDay} MAD/jour${listing.city ? ` à ${listing.city}` : ""}.`
      : `${listing.brand} ${listing.model} ${listing.year} à vendre — ${Number(price).toLocaleString()} MAD${listing.city ? ` à ${listing.city}` : ""}.`;
  return { basePath, title, description, keywords: `${listing.brand} ${listing.model} ${listing.city || "maroc"}` };
}

export default async function ListingView({
  lang,
  intent,
  listingSlug,
}: {
  lang: SeoLang;
  intent: Intent;
  listingSlug: string;
}) {
  const { id } = parseSemanticListingParam(listingSlug);
  if (!id) notFound();

  const targetModel = intent === "rental" ? "RentalListing" : "SaleListing";
  const [listing, reviewData] = await Promise.all([
    intent === "rental" ? fetchRentalById(id) : fetchSaleById(id),
    fetchReviews(targetModel, id),
  ]);
  if (!listing) notFound();

  const siteUrl = getSiteUrl();
  const basePath = intent === "rental" ? buildRentalListingPath(listing) : buildSaleListingPath(listing);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, basePath)}`;
  const hubPath = intent === "rental" ? "/location-voiture" : "/voiture-occasion";
  const hubLabel = intent === "rental" ? "Location" : "Occasion";
  const title = `${listing.brand} ${listing.model} ${listing.year}`;
  const price = intent === "rental" ? listing.pricePerDay : listing.price;
  const image = Array.isArray(listing.images) ? listing.images[0] : null;
  const itemReviewed = { "@type": "Vehicle", name: title, url: pageUrl };

  const reviewNodes = reviewsGraphJsonLd(
    (reviewData.reviews || []).map((r) => ({
      authorName: r.authorId?.name || "Client GoVoiture",
      rating: r.rating,
      body: r.comment || "",
      datePublished: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : undefined,
      itemReviewed,
    })),
    itemReviewed
  );

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          vehicleJsonLd({
            name: title,
            brand: listing.brand,
            model: listing.model,
            year: listing.year,
            description: listing.description || title,
            image,
            price,
            priceUnit: intent === "rental" ? "DAY" : undefined,
            url: pageUrl,
            city: listing.city,
            fuel: listing.fuel,
            transmission: listing.gearbox,
            intent,
            ratingValue: reviewData.avgRating,
            reviewCount: reviewData.total,
          }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: hubLabel, url: `${siteUrl}${buildSeoPath(lang, hubPath)}` },
            { name: title, url: pageUrl },
          ]),
          ...(Array.isArray(reviewNodes) ? reviewNodes : reviewNodes ? [reviewNodes] : [])
        )}
      />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: hubLabel, href: hubPath },
            { label: title, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        {listing.city ? <p className="text-gray-600 mb-4">{listing.city}</p> : null}
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={String(image)} alt={title} className="w-full max-h-96 object-cover rounded-xl mb-6" />
        ) : null}
        <p className="text-2xl font-semibold text-violet-600 mb-6">
          {intent === "rental"
            ? `${Number(price).toLocaleString()} MAD / jour`
            : `${Number(price).toLocaleString()} MAD`}
        </p>
        {listing.description ? <p className="text-gray-700 mb-8 whitespace-pre-line">{listing.description}</p> : null}
        <ul className="grid grid-cols-2 gap-3 text-sm mb-8">
          {listing.fuel ? <li><strong>Carburant:</strong> {listing.fuel}</li> : null}
          {listing.gearbox ? <li><strong>Boîte:</strong> {listing.gearbox}</li> : null}
          {listing.seats ? <li><strong>Places:</strong> {listing.seats}</li> : null}
          {listing.mileage ? <li><strong>Kilométrage:</strong> {Number(listing.mileage).toLocaleString()} km</li> : null}
        </ul>

        <ReviewsSection
          reviews={reviewData.reviews || []}
          avgRating={reviewData.avgRating}
          reviewCount={reviewData.total}
          lang={lang}
        />

        <a href={hubPath} className="inline-block px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold">
          {intent === "rental" ? "Voir plus d'offres" : "Voir plus d'annonces"}
        </a>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
