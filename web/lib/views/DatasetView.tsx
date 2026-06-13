import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl, API_BASE } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
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
    title: `Dataset prix ${spec.displayName} Maroc | GoVoiture`,
    description: `Données ouvertes prix occasion et location ${spec.displayName} — indice marketplace GoVoiture.`,
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
    <>
      <JsonLd
        data={graphJsonLd(
          datasetJsonLd({
            name: data?.name || `Prix ${spec.displayName} Maroc`,
            description: data?.description || `Dataset GoVoiture ${spec.displayName}`,
            url: pageUrl,
            dateModified: data?.dateModified || new Date().toISOString(),
            variableMeasured: ["salePriceMad", "rentalPricePerDayMad"],
          }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Données", url: pageUrl },
            { name: spec.displayName, url: pageUrl },
          ])
        )}
      />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Données prix", href: priceIntelPath(brandSlug, modelSlug) },
            { label: spec.displayName, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-4">Dataset — {spec.displayName}</h1>
        <p className="text-gray-600 mb-6">Données propriétaires GoVoiture — prix occasion, location et tendances.</p>
        <p className="mb-4">
          <a href={jsonUrl} className="text-violet-600 hover:underline font-medium" target="_blank" rel="noopener">
            Télécharger JSON API →
          </a>
        </p>
        {data?.sale?.market ? (
          <pre className="text-xs bg-gray-100 p-4 rounded-xl overflow-x-auto mb-8">
            {JSON.stringify({ sale: data.sale.market, rental: data.rental?.market, trends: data.trends?.monthly?.slice(-6) }, null, 2)}
          </pre>
        ) : (
          <p className="text-gray-500">Collecte de données en cours — revenez après publication d&apos;annonces.</p>
        )}
        <a href={buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug))} className="text-violet-600 hover:underline">
          Voir la page prix {spec.displayName}
        </a>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
