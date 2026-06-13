import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchReputation } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import StatCard from "@/components/ui/StatCard";
import SectionHeader from "@/components/ui/SectionHeader";
import TrustScoreCard from "@/components/ui/TrustScoreCard";
import BadgePill from "@/components/ui/BadgePill";
import { EntityGrid } from "@/components/ui/PremiumCTA";
import { sellerTrustPath } from "@client-seo/catalog/reliabilityIndex";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, breadcrumbJsonLd, aggregateRatingJsonLd } from "@client-seo/jsonLd";

export function sellerTrustMetadata(lang: SeoLang, sellerId: string) {
  return {
    basePath: sellerTrustPath(sellerId),
    title: "Profil confiance vendeur — GoVoiture",
    description: "Score réputation GoVoiture : avis vérifiés, identité, historique ventes marketplace Maroc.",
    keywords: "réputation vendeur voiture maroc, confiance concessionnaire maroc",
  };
}

export default async function SellerReputationView({
  lang,
  sellerId,
}: {
  lang: SeoLang;
  sellerId: string;
}) {
  const rep = await fetchReputation(sellerId);
  if (!rep) notFound();

  const siteUrl = getSiteUrl();
  const path = sellerTrustPath(sellerId);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Confiance", href: undefined },
        { label: rep.name, href: undefined },
      ]}
      hero={{
        kicker: "GoVoiture Confiance",
        title: rep.name,
        description: [
          rep.city,
          rep.memberSince ? `Membre depuis ${new Date(rep.memberSince).getFullYear()}` : null,
        ].filter(Boolean).join(" · ") || undefined,
        badges: rep.identityVerified ? ["Identité vérifiée"] : undefined,
      }}
      cta={{
        title: "Explorer le marketplace",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            rep.reviewCount > 0
              ? aggregateRatingJsonLd({
                  itemReviewed: rep.name,
                  ratingValue: rep.avgRating,
                  reviewCount: rep.reviewCount,
                })
              : null,
            breadcrumbJsonLd([
              { name: "GoVoiture", url: siteUrl },
              { name: "Confiance", url: pageUrl },
              { name: rep.name, url: pageUrl },
            ])
          )}
        />
      }
    >
      <div className="flex items-start gap-4 mb-8">
        {rep.avatar ? (
          <img src={rep.avatar} alt={rep.name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[var(--gv-sur2)] flex items-center justify-center text-2xl font-bold text-[var(--gv-brand)]">
            {rep.name.charAt(0)}
          </div>
        )}
        <TrustScoreCard
          score={rep.score}
          grade={rep.grade}
          badges={rep.badges}
        />
      </div>

      <EntityGrid cols={4}>
        <StatCard value={rep.avgRating || "—"} suffix="/5" label="Note moyenne" accent="brand" />
        <StatCard value={rep.reviewCount} label="Avis" />
        <StatCard value={rep.verifiedReviewCount} label="Vérifiés" accent="success" />
        <StatCard value={rep.soldCount} label="Vendues" />
      </EntityGrid>

      {rep.badges.length > 0 ? (
        <section className="gv-sec-sm">
          <SectionHeader title="Badges confiance" />
          <div className="flex flex-wrap gap-2">
            {rep.badges.map((b) => (
              <BadgePill key={b.id} variant="success">{b.label}</BadgePill>
            ))}
          </div>
        </section>
      ) : null}

      <section className="gv-sec-sm text-sm text-[var(--gv-mut)]">
        <p>
          {rep.inventoryCount > 0 ? `${rep.inventoryCount} annonces vente actives` : ""}
          {rep.inventoryCount > 0 && rep.fleetSize > 0 ? " · " : ""}
          {rep.fleetSize > 0 ? `${rep.fleetSize} véhicules location` : ""}
        </p>
        {rep.identityVerified ? <p className="text-emerald-600 mt-2">✓ Identité vérifiée GoVoiture</p> : null}
      </section>

      <p className="text-xs text-[var(--gv-mut)]">{rep.methodology}</p>
    </SeoPageShell>
  );
}
