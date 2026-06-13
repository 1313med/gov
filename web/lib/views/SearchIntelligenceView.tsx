import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchSearchDemand, type SearchDemandItem } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
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
    <>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs items={[{ label: "Goovoiture", href: "/" }, { label: "Recherches", href: undefined }]} lang={lang} />
        <h1 className="text-3xl font-bold mb-4">Intelligence recherches GoVoiture</h1>
        <p className="text-gray-600 mb-10">Modèles les plus consultés — agrégation viewCount marketplace vente + location.</p>

        {top.length > 0 ? (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Top demande live</h2>
            <ul className="space-y-2">
              {top.slice(0, 12).map((item: SearchDemandItem, i: number) => {
                const { brandSlug, modelSlug } = slugifyBrandModel(item.brand, item.model);
                const spec = getVehicleSpec(brandSlug, modelSlug);
                if (!spec) return null;
                return (
                  <li key={`${item.brand}-${item.model}`}>
                    <a href={buildSeoPath(lang, searchIntelPath(brandSlug, modelSlug))} className="flex justify-between rounded-lg border p-3 hover:border-violet-300">
                      <span><span className="text-gray-400 mr-2">#{i + 1}</span>{item.brand} {item.model}</span>
                      <span className="text-violet-600">{item.views?.toLocaleString()} vues</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <p className="text-gray-500 mb-12">Données live en cours d&apos;agrégation — consultez les modèles indexés ci-dessous.</p>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-4">Modèles indexés</h2>
          <ul className="grid sm:grid-cols-2 gap-2 text-sm">
            {curated.map((m) => (
              <li key={`${m!.brandSlug}:${m!.modelSlug}`}>
                <a href={buildSeoPath(lang, searchIntelPath(m!.brandSlug, m!.modelSlug))} className="text-violet-600 hover:underline capitalize">
                  {m!.displayName}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SeoFooter lang={lang} />
    </>
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

  return (
    <>
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
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Recherches", href: searchIntelHubPath() },
            { label: spec.displayName, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-2">Recherches {spec.displayName}</h1>
        <p className="text-gray-600 mb-8">Signaux de demande marketplace GoVoiture — vues agrégées vente + location.</p>

        {demand ? (
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <div className="rounded-xl border p-6 text-center">
              <p className="text-sm text-gray-500">Score demande</p>
              <p className="text-4xl font-bold text-violet-600">{demand.demandScore}/100</p>
            </div>
            <div className="rounded-xl border p-6 text-center">
              <p className="text-sm text-gray-500">Vues marketplace</p>
              <p className="text-4xl font-bold">{demand.views?.toLocaleString()}</p>
            </div>
            <div className="rounded-xl border p-4 text-center text-sm">
              <p className="text-gray-500">Annonces vente actives</p>
              <p className="text-2xl font-semibold">{demand.activeSaleListings || 0}</p>
            </div>
            <div className="rounded-xl border p-4 text-center text-sm">
              <p className="text-gray-500">Annonces location actives</p>
              <p className="text-2xl font-semibold">{demand.activeRentalListings || 0}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 mb-8">Pas encore de données agrégées — API marketplace en déploiement.</p>
        )}

        <section className="mb-10 flex flex-wrap gap-3 text-sm">
          <a href={buildSeoPath(lang, marketIntelPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-violet-100">Intelligence marché</a>
          <a href={buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-gray-100">Indice prix</a>
          <a href={buildSeoPath(lang, modelPath(brandSlug, modelSlug))} className="text-violet-600 hover:underline">Annonces {spec.displayName}</a>
        </section>

        <FaqSection faqs={faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
