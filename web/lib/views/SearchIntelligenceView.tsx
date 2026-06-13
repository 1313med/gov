import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchSearchDemand, type SearchDemandItem } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import StatCard from "@/components/ui/StatCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { EntityGrid, RelatedLinksSection, EmptyState } from "@/components/ui/PremiumCTA";
import { InsightCard } from "@/components/ui/GlassCard";
import BadgePill from "@/components/ui/BadgePill";
import { getBrandBySlug, modelPath } from "@client-seo/catalog/brands";
import { getVehicleSpec } from "@client-seo/catalog/vehicleSpecs";
import {
  getAllReliabilityIndexes,
  searchIntelHubPath,
  searchIntelPath,
  marketIntelPath,
} from "@client-seo/catalog/reliabilityIndex";
import { priceIntelPath } from "@client-seo/catalog/vehicleSpecs";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, breadcrumbJsonLd, datasetJsonLd, faqPageJsonLd } from "@client-seo/jsonLd";

function modelApiName(modelSlug: string) {
  return modelSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugifyBrandModel(brand: string, model: string) {
  const b = brand.toLowerCase().replace(/\s+/g, "-");
  const m = model.toLowerCase().replace(/\s+/g, "-");
  return { brandSlug: b, modelSlug: m };
}

export function searchIntelHubMetadata(lang: SeoLang) {
  return {
    basePath: searchIntelHubPath(),
    title: "Recherches auto Maroc — intelligence GoVoiture",
    description: "Modèles les plus consultés sur GoVoiture — signaux de demande marketplace en temps réel.",
    keywords: "voiture recherchée maroc, demande auto maroc",
  };
}

export function searchIntelMetadata(lang: SeoLang, brandSlug: string, modelSlug: string) {
  const spec = getVehicleSpec(brandSlug, modelSlug);
  if (!spec) return null;
  return {
    basePath: searchIntelPath(brandSlug, modelSlug),
    title: `Recherches ${spec.displayName} Maroc — demande GoVoiture`,
    description: `Vues marketplace et score demande ${spec.displayName} — signaux d'achat et location au Maroc.`,
    keywords: `recherche ${spec.displayName} maroc, demande ${spec.displayName}`,
  };
}

export async function SearchIntelHubView({ lang }: { lang: SeoLang }) {
  const demandData = await fetchSearchDemand(undefined, undefined, 15);
  const curated = getAllReliabilityIndexes();
  const top = demandData?.top?.length ? demandData.top : [];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: "Recherches", href: undefined }]}
      hero={{
        kicker: "GoVoiture Data",
        title: "Intelligence recherches GoVoiture",
        description: "Modèles les plus consultés — agrégation viewCount marketplace vente + location.",
      }}
      cta={{
        title: "Explorer le marketplace",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
    >
      {top.length > 0 ? (
        <section className="gv-sec-sm">
          <SectionHeader eyebrow="Live" title="Top demande" />
          <div className="space-y-2">
            {top.slice(0, 12).map((item: SearchDemandItem, i: number) => {
              const { brandSlug, modelSlug } = slugifyBrandModel(item.brand, item.model);
              const spec = getVehicleSpec(brandSlug, modelSlug);
              if (!spec) return null;
              return (
                <InsightCard
                  key={`${item.brand}-${item.model}`}
                  title={`#${i + 1} ${item.brand} ${item.model}`}
                  body={`${item.views?.toLocaleString()} vues marketplace`}
                  href={buildSeoPath(lang, searchIntelPath(brandSlug, modelSlug))}
                  badge={<BadgePill variant="brand">Demande</BadgePill>}
                />
              );
            })}
          </div>
        </section>
      ) : (
        <EmptyState
          title="Données live en cours d'agrégation"
          description="Consultez les modèles indexés ci-dessous."
        />
      )}

      <section className="gv-sec-sm">
        <SectionHeader eyebrow="Index" title="Modèles indexés" />
        <RelatedLinksSection
          title="Tous les modèles"
          links={curated.map((m) => ({
            label: m!.displayName,
            href: buildSeoPath(lang, searchIntelPath(m!.brandSlug, m!.modelSlug)),
          }))}
        />
      </section>
    </SeoPageShell>
  );
}

export default async function SearchIntelModelView({
  lang,
  brandSlug,
  modelSlug,
}: {
  lang: SeoLang;
  brandSlug: string;
  modelSlug: string;
}) {
  const spec = getVehicleSpec(brandSlug, modelSlug);
  if (!spec) notFound();

  const brand = getBrandBySlug(brandSlug)!;
  const brandName = brand.name[lang] || brand.name.fr;
  const apiModel = modelApiName(modelSlug);
  const demand = await fetchSearchDemand(brandName, apiModel);

  const siteUrl = getSiteUrl();
  const path = searchIntelPath(brandSlug, modelSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  const faqs = [
    {
      q: `${spec.displayName} est-elle recherchée au Maroc ?`,
      a: demand?.views
        ? `${demand.views.toLocaleString()} vues sur GoVoiture · score demande ${demand.demandScore}/100.`
        : "Données en cours — parcourez les annonces live.",
    },
    {
      q: `Combien d'annonces ${spec.displayName} actives ?`,
      a: demand
        ? `${demand.activeSaleListings || 0} ventes · ${demand.activeRentalListings || 0} locations · ${demand.soldListings || 0} vendues.`
        : "Consultez le hub modèle GoVoiture.",
    },
  ];

  const relatedLinks = [
    { label: "Intelligence marché", href: buildSeoPath(lang, marketIntelPath(brandSlug, modelSlug)) },
    { label: "Indice prix", href: buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug)) },
    { label: `Annonces ${spec.displayName}`, href: buildSeoPath(lang, modelPath(brandSlug, modelSlug)) },
  ];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Recherches", href: searchIntelHubPath() },
        { label: spec.displayName, href: undefined },
      ]}
      hero={{
        kicker: "GoVoiture Data",
        title: `Recherches ${spec.displayName}`,
        description: "Signaux de demande marketplace GoVoiture — vues agrégées vente + location.",
      }}
      faqs={faqs}
      cta={{
        title: `Trouver une ${spec.displayName}`,
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
              name: `Demande ${spec.displayName} Maroc`,
              description: `Signaux de recherche marketplace ${spec.displayName}.`,
              url: pageUrl,
              dateModified: new Date().toISOString().slice(0, 10),
              variableMeasured: ["viewCount", "demandScore"],
            }),
            breadcrumbJsonLd([
              { name: "GoVoiture", url: siteUrl },
              { name: "Recherches", url: `${siteUrl}${buildSeoPath(lang, searchIntelHubPath())}` },
              { name: spec.displayName, url: pageUrl },
            ]),
            faqPageJsonLd(faqs)
          )}
        />
      }
    >
      {demand ? (
        <EntityGrid cols={4}>
          <StatCard value={demand.demandScore} suffix="/100" label="Score demande" accent="brand" />
          <StatCard value={demand.views?.toLocaleString() ?? "—"} label="Vues marketplace" />
          <StatCard value={demand.activeSaleListings || 0} label="Annonces vente actives" />
          <StatCard value={demand.activeRentalListings || 0} label="Annonces location actives" />
        </EntityGrid>
      ) : (
        <EmptyState title="Pas encore de données agrégées" description="API marketplace en déploiement." />
      )}

      <RelatedLinksSection title="Explorer ce modèle" links={relatedLinks} />
    </SeoPageShell>
  );
}
