import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchRentalById, fetchSaleById, fetchReviews } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import ReviewsSection from "@/components/ssr/ReviewsSection";
import SectionHeader from "@/components/ui/SectionHeader";
import BadgePill from "@/components/ui/BadgePill";
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
  const title = `${listing.brand} ${listing.model} ${listing.year}${listing.city ? ` — ${listing.city}` : ""} | Goovoiture`;
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
  const priceLabel =
    intent === "rental"
      ? `${Number(price).toLocaleString()} MAD / jour`
      : `${Number(price).toLocaleString()} MAD`;
  const itemReviewed = { "@type": "Vehicle", name: title, url: pageUrl };

  const reviewNodes = reviewsGraphJsonLd(
    (reviewData.reviews || []).map((r) => ({
      authorName: r.authorId?.name || "Client Goovoiture",
      rating: r.rating,
      body: r.comment || "",
      datePublished: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : undefined,
      itemReviewed,
    })),
    itemReviewed
  );

  const specs = [
    listing.fuel ? { label: "Carburant", value: listing.fuel } : null,
    listing.gearbox ? { label: "Boîte", value: listing.gearbox } : null,
    listing.seats ? { label: "Places", value: String(listing.seats) } : null,
    listing.mileage ? { label: "Kilométrage", value: `${Number(listing.mileage).toLocaleString()} km` } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: hubLabel, href: hubPath },
        { label: title, href: undefined },
      ]}
      hero={{
        kicker: intent === "rental" ? "Location voiture" : "Voiture occasion",
        title,
        description: listing.city ? `${listing.city} — ${priceLabel}` : priceLabel,
        badges: [
          intent === "rental" ? "Location" : "Occasion",
          ...(listing.city ? [listing.city] : []),
        ],
      }}
      cta={{
        title: intent === "rental" ? "Voir plus d'offres de location" : "Voir plus d'annonces occasion",
        primaryHref: buildSeoPath(lang, hubPath),
        primaryLabel: intent === "rental" ? "Explorer les locations" : "Explorer les occasions",
        secondaryHref: listing.city ? buildSeoPath(lang, `${hubPath}/${String(listing.city).toLowerCase().replace(/\s+/g, "-")}`) : undefined,
        secondaryLabel: listing.city ? `Offres à ${listing.city}` : undefined,
      }}
      related={{ brandFilter: listing.brand, showListings: true }}
      jsonLd={
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
              { name: "Goovoiture", url: siteUrl },
              { name: hubLabel, url: `${siteUrl}${buildSeoPath(lang, hubPath)}` },
              { name: title, url: pageUrl },
            ]),
            ...(Array.isArray(reviewNodes) ? reviewNodes : reviewNodes ? [reviewNodes] : [])
          )}
        />
      }
    >
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="gv-card gv-card-static overflow-hidden">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={String(image)} alt={title} className="w-full aspect-[4/3] object-cover" />
          ) : (
            <div className="w-full aspect-[4/3] bg-[var(--gv-sur2)] flex items-center justify-center">
              <svg className="w-16 h-16 text-[var(--gv-mut)] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4.5 13.5h15l-1.2-4.1a2 2 0 0 0-1.9-1.4H7.6a2 2 0 0 0-1.9 1.4L4.5 13.5Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="gv-card gv-card-static p-6">
            <p className="text-sm text-[var(--gv-mut)] mb-1">
              {intent === "rental" ? "Tarif journalier" : "Prix de vente"}
            </p>
            <p className={`text-3xl font-bold font-[family-name:var(--gv-disp)] ${intent === "rental" ? "text-[var(--gv-accent)]" : "text-[var(--gv-brand)]"}`}>
              {priceLabel}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <BadgePill variant={intent === "rental" ? "accent" : "brand"}>
                {intent === "rental" ? "Location" : "Occasion"}
              </BadgePill>
              {listing.city ? <BadgePill variant="neutral">{listing.city}</BadgePill> : null}
              {reviewData.total > 0 ? (
                <BadgePill variant="success">{reviewData.avgRating}/5 · {reviewData.total} avis</BadgePill>
              ) : null}
            </div>
          </div>

          {specs.length ? (
            <div className="gv-spec-grid">
              {specs.map((s) => (
                <div key={s.label} className="gv-spec-item">
                  <p className="gv-spec-label">{s.label}</p>
                  <p className="gv-spec-value">{s.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {listing.description ? (
        <section className="gv-sec-sm">
          <SectionHeader eyebrow="Description" title="À propos de ce véhicule" />
          <div className="gv-card gv-card-static p-6">
            <p className="text-[var(--gv-ink2)] leading-relaxed whitespace-pre-line">{listing.description}</p>
          </div>
        </section>
      ) : null}

      <ReviewsSection
        reviews={reviewData.reviews || []}
        avgRating={reviewData.avgRating}
        reviewCount={reviewData.total}
        lang={lang}
      />
    </SeoPageShell>
  );
}
