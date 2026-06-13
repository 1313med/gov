import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchMarketIntel, fetchMarketPrices } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { getBrandBySlug, modelPath } from "@client-seo/catalog/brands";
import { getVehicleSpec, priceIntelPath } from "@client-seo/catalog/vehicleSpecs";
import {
  getAllReliabilityIndexes,
  marketHubPath,
  marketIntelPath,
  reliabilityPath,
  searchIntelPath,
  tcoPath,
} from "@client-seo/catalog/reliabilityIndex";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, breadcrumbJsonLd, datasetJsonLd, faqPageJsonLd } from "@client-seo/jsonLd";

function modelApiName(modelSlug: string) {
  return modelSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function marketHubMetadata(lang: SeoLang) {
  return {
    basePath: marketHubPath(),
    title: "Intelligence marché auto Maroc — GoVoiture",
    description: "Demande, fiabilité et prix par modèle — données propriétaires marketplace GoVoiture.",
    keywords: "marché automobile maroc, tendances voiture maroc",
  };
}

export function marketIntelMetadata(lang: SeoLang, brandSlug: string, modelSlug: string) {
  const spec = getVehicleSpec(brandSlug, modelSlug);
  if (!spec) return null;
  return {
    basePath: marketIntelPath(brandSlug, modelSlug),
    title: `Marché ${spec.displayName} Maroc — intelligence GoVoiture`,
    description: `Demande, fiabilité et prix ${spec.displayName} — vue consolidée marketplace GoVoiture.`,
    keywords: `marché ${spec.displayName} maroc, demande ${spec.displayName}`,
  };
}

export async function MarketHubView({ lang }: { lang: SeoLang }) {
  const models = getAllReliabilityIndexes();
  const siteUrl = getSiteUrl();
  const path = marketHubPath();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Intelligence marché", url: pageUrl },
          ])
        )}
      />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs items={[{ label: "Goovoiture", href: "/" }, { label: "Intelligence marché", href: undefined }]} lang={lang} />
        <h1 className="text-3xl font-bold mb-4">Intelligence marché automobile Maroc</h1>
        <p className="text-gray-600 mb-10">
          Vue consolidée demande, fiabilité et prix — uniquement pour les modèles avec données vérifiées GoVoiture.
        </p>
        <ul className="grid sm:grid-cols-2 gap-3">
          {models.map((m) => (
            <li key={`${m!.brandSlug}:${m!.modelSlug}`}>
              <a href={buildSeoPath(lang, marketIntelPath(m!.brandSlug, m!.modelSlug))} className="block rounded-xl border p-4 hover:border-violet-300">
                <span className="font-medium capitalize">{m!.displayName}</span>
                <span className="block text-sm text-gray-500 mt-1">Score fiabilité {m!.score}/100 · {m!.grade}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}

export default async function MarketIntelligenceView({
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
  if (!brand || !spec) return null;

  const brandName = brand.name[lang] || brand.name.fr;
  const apiModel = modelApiName(modelSlug);
  const [intel, prices] = await Promise.all([
    fetchMarketIntel(brandName, apiModel),
    fetchMarketPrices(brandName, apiModel),
  ]);

  const siteUrl = getSiteUrl();
  const path = marketIntelPath(brandSlug, modelSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;
  const demand = intel?.demand;
  const rel = intel?.reliability;

  const faqs = [
    {
      q: `Quelle est la demande pour ${spec.displayName} au Maroc ?`,
      a: demand?.views
        ? `${demand.views.toLocaleString()} vues marketplace · score demande ${demand.demandScore}/100.`
        : "Consultez les annonces live sur GoVoiture.",
    },
    {
      q: `Fiabilité ${spec.displayName} ?`,
      a: rel ? `Indice GoVoiture ${rel.score}/100 (grade ${rel.grade}).` : spec.moroccoNotes || "",
    },
  ];

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          datasetJsonLd({
            name: `Intelligence marché ${spec.displayName} Maroc`,
            description: `Demande, fiabilité et prix ${spec.displayName}.`,
            url: pageUrl,
            dateModified: new Date().toISOString().slice(0, 10),
            variableMeasured: ["demandScore", "reliabilityScore", "salePriceMad"],
          }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Marché", url: `${siteUrl}${buildSeoPath(lang, marketHubPath())}` },
            { name: spec.displayName, url: pageUrl },
          ]),
          faqPageJsonLd(faqs)
        )}
      />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Marché", href: marketHubPath() },
            { label: spec.displayName, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-2">Marché {spec.displayName} au Maroc</h1>
        <p className="text-gray-600 mb-8">Intelligence propriétaire GoVoiture — demande, fiabilité et prix consolidés.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          {demand ? (
            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-gray-500">Demande</p>
              <p className="text-3xl font-bold text-violet-600">{demand.demandScore}/100</p>
              <p className="text-xs text-gray-500 mt-1">{demand.views?.toLocaleString()} vues · {demand.activeSaleListings} ventes · {demand.activeRentalListings} locations</p>
            </div>
          ) : null}
          {rel ? (
            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-gray-500">Fiabilité</p>
              <p className="text-3xl font-bold text-green-600">{rel.score}/100</p>
              <p className="text-xs text-gray-500 mt-1">Grade {rel.grade}</p>
            </div>
          ) : null}
          {prices?.sale?.market ? (
            <div className="rounded-xl border p-4 text-center">
              <p className="text-sm text-gray-500">Prix médian</p>
              <p className="text-3xl font-bold">{prices.sale.market.median?.toLocaleString()} MAD</p>
              <p className="text-xs text-gray-500 mt-1">{prices.sale.market.sampleSize} observations</p>
            </div>
          ) : null}
        </div>

        {rel?.commonIssues?.length ? (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3">Points de vigilance</h2>
            <ul className="space-y-2 text-sm">
              {rel.commonIssues.map((i, idx) => (
                <li key={idx} className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                  <strong>{i.title}</strong> — {i.body}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-10 flex flex-wrap gap-3 text-sm">
          <a href={buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-violet-100 text-violet-800">Indice prix</a>
          <a href={buildSeoPath(lang, reliabilityPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-green-100 text-green-800">Fiabilité</a>
          <a href={buildSeoPath(lang, searchIntelPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">Recherches</a>
          <a href={buildSeoPath(lang, tcoPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-gray-100">Coût possession</a>
          <a href={buildSeoPath(lang, modelPath(brandSlug, modelSlug))} className="text-violet-600 hover:underline">Annonces</a>
        </section>

        <FaqSection faqs={faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
