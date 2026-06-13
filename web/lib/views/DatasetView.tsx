import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl, API_BASE } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import { DatasetCard } from "@/components/ui/GlassCard";
import { ChartContainer, EmptyState, RelatedLinksSection } from "@/components/ui/PremiumCTA";
import { getBrandBySlug } from "@client-seo/catalog/brands";
import { getVehicleSpec, datasetPath, priceIntelPath } from "@client-seo/catalog/vehicleSpecs";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, datasetJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

function modelApiName(modelSlug: string) {
  return modelSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function datasetMetadata(lang: SeoLang, brandSlug: string, modelSlug: string) {
  const spec = getVehicleSpec(brandSlug, modelSlug);
  if (!spec) return null;
  return {
    basePath: datasetPath(brandSlug, modelSlug),
    title: `Dataset prix ${spec.displayName} Maroc | Goovoiture`,
    description: `Données ouvertes prix occasion et location ${spec.displayName} — indice marketplace Goovoiture.`,
    keywords: `dataset prix ${spec.displayName}, data voiture maroc`,
  };
}

export default async function DatasetView({
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

  const brandName = brand.name.fr;
  const apiModel = modelApiName(modelSlug);
  const res = await fetch(`${API_BASE}/market/dataset?brand=${encodeURIComponent(brandName)}&model=${encodeURIComponent(apiModel)}`, {
    next: { revalidate: 3600 },
  });
  const data = res.ok ? await res.json() : null;

  const siteUrl = getSiteUrl();
  const path = datasetPath(brandSlug, modelSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;
  const jsonUrl = `${API_BASE}/market/dataset?brand=${encodeURIComponent(brandName)}&model=${encodeURIComponent(apiModel)}`;

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Données prix", href: priceIntelPath(brandSlug, modelSlug) },
        { label: spec.displayName, href: undefined },
      ]}
      hero={{
        kicker: "Goovoiture Data",
        title: `Dataset — ${spec.displayName}`,
        description: "Données propriétaires Goovoiture — prix occasion, location et tendances.",
      }}
      cta={{
        title: `Trouver une ${spec.displayName}`,
        primaryHref: buildSeoPath(lang, `/voiture-occasion/${brandSlug}/${modelSlug}`),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      related={{ brandSlug, brandFilter: brandName }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            datasetJsonLd({
              name: data?.name || `Prix ${spec.displayName} Maroc`,
              description: data?.description || `Dataset Goovoiture ${spec.displayName}`,
              url: pageUrl,
              dateModified: data?.dateModified || new Date().toISOString(),
              variableMeasured: ["salePriceMad", "rentalPricePerDayMad"],
            }),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: "Données", url: pageUrl },
              { name: spec.displayName, url: pageUrl },
            ])
          )}
        />
      }
    >
      <DatasetCard
        title={`API JSON — ${spec.displayName}`}
        description="Téléchargez les données brutes via l'endpoint marketplace Goovoiture."
        href={jsonUrl}
      />

      {data?.sale?.market ? (
        <ChartContainer title="Aperçu des données">
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify({ sale: data.sale.market, rental: data.rental?.market, trends: data.trends?.monthly?.slice(-6) }, null, 2)}
          </pre>
        </ChartContainer>
      ) : (
        <EmptyState
          title="Collecte de données en cours"
          description="Revenez après publication d'annonces."
          actionHref={buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug))}
          actionLabel={`Page prix ${spec.displayName}`}
        />
      )}

      <RelatedLinksSection
        links={[
          { label: `Page prix ${spec.displayName}`, href: buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug)) },
          { label: "Télécharger JSON API", href: jsonUrl },
        ]}
      />
    </SeoPageShell>
  );
}
