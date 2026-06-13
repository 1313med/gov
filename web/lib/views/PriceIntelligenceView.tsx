import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchMarketPrices, fetchMarketTrends } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import StatCard from "@/components/ui/StatCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { EntityGrid, ChartContainer, RelatedLinksSection, EmptyState } from "@/components/ui/PremiumCTA";
import { getBrandBySlug, modelPath, brandPath } from "@client-seo/catalog/brands";
import { getVehicleSpec, priceIntelPath, datasetPath, vehicleSpecPath } from "@client-seo/catalog/vehicleSpecs";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, datasetJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@client-seo/jsonLd";

function modelApiName(modelSlug: string) {
  return modelSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function priceIntelMetadata(lang: SeoLang, brandSlug: string, modelSlug: string) {
  const brand = getBrandBySlug(brandSlug);
  const spec = getVehicleSpec(brandSlug, modelSlug);
  if (!brand || !spec) return null;
  const name = spec.displayName;
  return {
    basePath: priceIntelPath(brandSlug, modelSlug),
    title: `Prix ${name} occasion Maroc — indice GoVoiture`,
    description: `Prix médian, fourchette et tendances ${name} au Maroc — données marketplace GoVoiture en temps réel.`,
    keywords: `prix ${name} maroc, cote ${name}, valeur ${name} occasion`,
  };
}

export default async function PriceIntelligenceView({
  lang,
  brandSlug,
  modelSlug,
}: {
  lang: SeoLang;
  brandSlug: string;
  modelSlug: string;
}) {
  const brand = getBrandBySlug(brandSlug);
  const spec = getVehicleSpec(brandSlug, modelSlug);
  if (!brand || !spec) notFound();

  const brandName = brand.name[lang] || brand.name.fr;
  const apiModel = modelApiName(modelSlug);
  const [prices, trends] = await Promise.all([
    fetchMarketPrices(brandName, apiModel),
    fetchMarketTrends(brandName, apiModel),
  ]);

  const siteUrl = getSiteUrl();
  const path = priceIntelPath(brandSlug, modelSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;
  const sale = prices?.sale;
  const rental = prices?.rental;

  const faqs = [
    {
      q: `Quel est le prix d'une ${spec.displayName} occasion au Maroc ?`,
      a: sale?.market
        ? `Indice GoVoiture : médiane ${sale.market.median?.toLocaleString()} MAD (${sale.market.sampleSize} observations).`
        : "Données insuffisantes — consultez les annonces live sur GoVoiture.",
    },
    {
      q: `Combien coûte la location ${spec.displayName} ?`,
      a: rental?.market
        ? `Médiane ${rental.market.median?.toLocaleString()} MAD/jour sur ${rental.market.sampleSize} offres actives.`
        : "Comparez les agences sur GoVoiture.",
    },
  ];

  const relatedLinks = [
    { label: `Annonces ${spec.displayName}`, href: buildSeoPath(lang, modelPath(brandSlug, modelSlug)) },
    { label: "Fiche technique", href: buildSeoPath(lang, vehicleSpecPath(brandSlug, modelSlug)) },
    { label: "Dataset JSON", href: buildSeoPath(lang, datasetPath(brandSlug, modelSlug)) },
    { label: "Intelligence marché", href: buildSeoPath(lang, `/marche/${brandSlug}/${modelSlug}`) },
    { label: "Fiabilité", href: buildSeoPath(lang, `/fiabilite/${brandSlug}/${modelSlug}`) },
    { label: "Recherches", href: buildSeoPath(lang, `/recherches/${brandSlug}/${modelSlug}`) },
    { label: "Coût possession", href: buildSeoPath(lang, `/cout-possession/${brandSlug}/${modelSlug}`) },
    { label: `Hub ${brandName}`, href: buildSeoPath(lang, brandPath(brandSlug)) },
  ];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Prix", href: "/prix/dacia/logan" },
        { label: spec.displayName, href: undefined },
      ]}
      hero={{
        kicker: "GoVoiture Data",
        title: `Prix ${spec.displayName} au Maroc`,
        description: `Indice basé sur ${sale?.activeListings || 0} annonces actives${sale?.soldListings ? ` et ${sale.soldListings} ventes enregistrées` : ""}. ${prices?.methodology || "Moyenne tronquée (5 % outliers retirés)."}`,
      }}
      faqs={faqs}
      cta={{
        title: `Trouver une ${spec.displayName}`,
        description: "Comparez les annonces occasion et location sur GoVoiture.",
        primaryHref: buildSeoPath(lang, modelPath(brandSlug, modelSlug)),
        primaryLabel: "Voir les annonces",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      related={{ brandSlug, brandFilter: brandName }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            datasetJsonLd({
              name: `Indice prix ${spec.displayName} Maroc`,
              description: `Données prix occasion et location ${spec.displayName} — GoVoiture Morocco.`,
              url: pageUrl,
              dateModified: new Date().toISOString().slice(0, 10),
              variableMeasured: ["salePriceMad", "rentalPricePerDayMad"],
            }),
            breadcrumbJsonLd([
              { name: "GoVoiture", url: siteUrl },
              { name: "Prix", url: `${siteUrl}${buildSeoPath(lang, "/prix/dacia/logan")}` },
              { name: spec.displayName, url: pageUrl },
            ]),
            faqPageJsonLd(faqs)
          )}
        />
      }
    >
      {sale?.market ? (
        <section className="gv-sec-sm">
          <SectionHeader eyebrow="Occasion" title="Prix marketplace" />
          <EntityGrid cols={4}>
            <StatCard value={sale.market.median?.toLocaleString() ?? "—"} suffix=" MAD" label="Médiane" accent="brand" />
            <StatCard value={sale.market.average?.toLocaleString() ?? "—"} suffix=" MAD" label="Moyenne" />
            <StatCard value={sale.market.min?.toLocaleString() ?? "—"} suffix=" MAD" label="Min" />
            <StatCard value={sale.market.max?.toLocaleString() ?? "—"} suffix=" MAD" label="Max" />
          </EntityGrid>
          {sale.yearBreakdown?.length ? (
            <ChartContainer title="Par année" >
              <ul className="text-sm space-y-1">
                {sale.yearBreakdown.slice(0, 8).map((y) => (
                  <li key={y.year}>{y.year} — médiane {y.median?.toLocaleString()} MAD ({y.sampleSize} annonces)</li>
                ))}
              </ul>
            </ChartContainer>
          ) : null}
          {sale.cityBreakdown?.length ? (
            <ChartContainer title="Par ville">
              <ul className="text-sm flex flex-wrap gap-2">
                {sale.cityBreakdown.slice(0, 6).map((c) => (
                  <li key={c.city} className="gv-chip">{c.city}: {c.median?.toLocaleString()} MAD</li>
                ))}
              </ul>
            </ChartContainer>
          ) : null}
        </section>
      ) : (
        <EmptyState
          title="Données vente insuffisantes"
          description={`Pas encore assez de données — parcourez les annonces ${spec.displayName}.`}
          actionHref={buildSeoPath(lang, modelPath(brandSlug, modelSlug))}
          actionLabel={`Annonces ${spec.displayName}`}
        />
      )}

      {rental?.market ? (
        <section className="gv-sec-sm">
          <SectionHeader eyebrow="Location" title="Prix par jour" />
          <EntityGrid cols={3}>
            <StatCard value={rental.market.median?.toLocaleString() ?? "—"} suffix=" MAD/j" label="Médiane" accent="accent" />
            <StatCard value={rental.market.min ?? "—"} suffix=" MAD/j" label="Min" />
            <StatCard value={rental.market.max ?? "—"} suffix=" MAD/j" label="Max" />
          </EntityGrid>
          <p className="text-sm text-[var(--gv-mut)] mt-2">{rental.activeListings} offres actives</p>
        </section>
      ) : null}

      {trends?.monthly?.length ? (
        <ChartContainer title="Historique (snapshots GoVoiture)">
          <ul className="text-sm space-y-1">
            {trends.monthly.slice(-6).map((m: { month: string; sale?: { median: number } | null }) => (
              <li key={m.month}>{m.month}{m.sale?.median ? ` — médiane vente ${m.sale.median.toLocaleString()} MAD` : ""}</li>
            ))}
          </ul>
        </ChartContainer>
      ) : null}

      <RelatedLinksSection title="Explorer ce modèle" links={relatedLinks} />
    </SeoPageShell>
  );
}
