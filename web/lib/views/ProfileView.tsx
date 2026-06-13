import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchSellerProfile } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import ReviewsSection from "@/components/ssr/ReviewsSection";
import SectionHeader from "@/components/ui/SectionHeader";
import TrustScoreCard from "@/components/ui/TrustScoreCard";
import VehicleCard from "@/components/ui/VehicleCard";
import BadgePill from "@/components/ui/BadgePill";
import { EntityGrid, RelatedLinksSection } from "@/components/ui/PremiumCTA";
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
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: hubLabel, href: hubPath },
        { label: cityName, href: `${hubPath}/${citySlug}` },
        { label: seller.name, href: undefined },
      ]}
      hero={{
        kicker: kind === "agency" ? "Agence vérifiée" : "Concessionnaire",
        title: seller.name,
        description: seller.bio || `${seller.name} — ${cityName}`,
        badges: [
          ...(data.verified ? ["✓ Profil vérifié"] : []),
          `${data.fleetSize || data.inventoryCount || inventory.length} véhicules`,
        ],
      }}
      faqs={faqs}
      cta={{
        title: kind === "agency" ? "Réserver sur GoVoiture" : "Voir l'inventaire occasion",
        primaryHref: buildSeoPath(lang, kind === "agency" ? "/location-voiture" : "/voiture-occasion"),
        primaryLabel: kind === "agency" ? "Explorer les locations" : "Explorer les occasions",
        secondaryHref: wa || undefined,
        secondaryLabel: wa ? "WhatsApp" : undefined,
      }}
      related={{ showListings: false, showBrands: true, showAgencies: kind === "dealer" }}
      jsonLd={
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
      }
    >
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 flex gap-4 items-start">
          {seller.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={String(seller.avatar)} alt={seller.name} className="w-20 h-20 rounded-[var(--gv-r-lg)] object-cover border border-[var(--gv-bdr2)]" />
          ) : (
            <div className="w-20 h-20 rounded-[var(--gv-r-lg)] bg-[var(--gv-gbg)] flex items-center justify-center text-2xl font-bold text-[var(--gv-brand)]">
              {seller.name.charAt(0)}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3 text-sm flex-1">
            {seller.phone ? (
              <p><strong className="text-[var(--gv-ink)]">Téléphone :</strong> <a href={`tel:${seller.phone}`} className="text-[var(--gv-brand)]">{seller.phone}</a></p>
            ) : null}
            {wa ? (
              <p><strong className="text-[var(--gv-ink)]">WhatsApp :</strong> <a href={wa} className="text-[var(--gv-brand)]" rel="noopener">Contacter</a></p>
            ) : null}
            {seller.email ? (
              <p><strong className="text-[var(--gv-ink)]">Email :</strong> <a href={`mailto:${seller.email}`} className="text-[var(--gv-brand)]">{seller.email}</a></p>
            ) : null}
            <p><strong className="text-[var(--gv-ink)]">Horaires :</strong> {data.openingHours || "Lun–Sam 9h–19h"}</p>
            <p><strong className="text-[var(--gv-ink)]">Adresse :</strong> {data.address || cityName}</p>
          </div>
        </div>
        {(data as { reputation?: { score: number; grade: string; badges: Array<{ id: string; label: string }> } }).reputation ? (
          <TrustScoreCard
            score={(data as { reputation: { score: number; grade: string; badges: Array<{ id: string; label: string }> } }).reputation.score}
            grade={(data as { reputation: { score: number; grade: string } }).reputation.grade}
            badges={(data as { reputation: { badges: Array<{ id: string; label: string }> } }).reputation.badges}
          />
        ) : data.reviewCount > 0 ? (
          <TrustScoreCard score={Math.round(data.avgRating * 20)} grade={`${data.avgRating}/5`} label="Note moyenne" />
        ) : null}
      </div>

      {data.rentalCategories?.length ? (
        <RelatedLinksSection
          title="Catégories"
          links={data.rentalCategories.map((c: string) => ({ label: c, href: "#" }))}
        />
      ) : null}

      <section className="gv-sec-sm">
        <SectionHeader eyebrow="Inventaire" title={kind === "agency" ? "Flotte disponible" : "Véhicules en vente"} />
        <EntityGrid cols={3}>
          {inventory.slice(0, 12).map((item: Record<string, unknown>) => (
            <VehicleCard
              key={String(item._id)}
              title={`${item.brand} ${item.model}`}
              subtitle={String(item.city || cityName)}
              price={
                item.pricePerDay != null
                  ? `${Number(item.pricePerDay).toLocaleString()} MAD`
                  : `${Number(item.price).toLocaleString()} MAD`
              }
              priceLabel={item.pricePerDay != null ? "/j" : undefined}
              href={buildSeoPath(lang, item.pricePerDay != null ? buildRentalListingPath(item) : buildSaleListingPath(item))}
              intent={item.pricePerDay != null ? "rental" : "sale"}
            />
          ))}
        </EntityGrid>
      </section>

      <ReviewsSection reviews={data.reviews || []} avgRating={data.avgRating || 0} reviewCount={data.reviewCount || 0} lang={lang} verified={data.verified} />

      {data.related?.length ? (
        <RelatedLinksSection
          title={kind === "agency" ? "Agences similaires" : "Concessionnaires similaires"}
          links={data.related.map((r: { path: string; name: string; city?: string }) => ({
            label: `${r.name}${r.city ? ` — ${r.city}` : ""}`,
            href: buildSeoPath(lang, r.path),
          }))}
        />
      ) : null}

      <RelatedLinksSection
        title="Carte"
        links={[
          {
            label: `Voir ${cityName} sur OpenStreetMap`,
            href: `https://www.openstreetmap.org/search?query=${encodeURIComponent(cityName + ", Morocco")}`,
          },
          ...(seller._id ? [{ label: "Score confiance GoVoiture", href: buildSeoPath(lang, `/confiance/${seller._id}`) }] : []),
        ]}
      />
    </SeoPageShell>
  );
}
