import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchMarketPrices, fetchMarketTrends } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
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

  return (
    <>
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
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Prix", href: "/prix/dacia/logan" },
            { label: spec.displayName, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-2">Prix {spec.displayName} au Maroc</h1>
        <p className="text-gray-600 mb-2">
          Indice basé sur {sale?.activeListings || 0} annonces actives
          {sale?.soldListings ? ` et ${sale.soldListings} ventes enregistrées` : ""}.
        </p>
        <p className="text-xs text-gray-500 mb-8">{prices?.methodology || "Moyenne tronquée (5 % outliers retirés)."}</p>

        {sale?.market ? (
          <section className="mb-10 rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">Occasion — prix marketplace</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><dt className="text-sm text-gray-500">Médiane</dt><dd className="text-2xl font-bold text-violet-600">{sale.market.median?.toLocaleString()} MAD</dd></div>
              <div><dt className="text-sm text-gray-500">Moyenne</dt><dd className="text-xl font-semibold">{sale.market.average?.toLocaleString()} MAD</dd></div>
              <div><dt className="text-sm text-gray-500">Min</dt><dd className="text-lg">{sale.market.min?.toLocaleString()} MAD</dd></div>
              <div><dt className="text-sm text-gray-500">Max</dt><dd className="text-lg">{sale.market.max?.toLocaleString()} MAD</dd></div>
            </dl>
            {sale.yearBreakdown?.length ? (
              <div className="mt-6">
                <h3 className="font-medium mb-2">Par année</h3>
                <ul className="text-sm space-y-1">
                  {sale.yearBreakdown.slice(0, 8).map((y) => (
                    <li key={y.year}>{y.year} — médiane {y.median?.toLocaleString()} MAD ({y.sampleSize} annonces)</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {sale.cityBreakdown?.length ? (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Par ville</h3>
                <ul className="text-sm flex flex-wrap gap-2">
                  {sale.cityBreakdown.slice(0, 6).map((c) => (
                    <li key={c.city} className="px-2 py-1 bg-gray-100 rounded">{c.city}: {c.median?.toLocaleString()} MAD</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ) : (
          <p className="text-gray-500 mb-8">Pas encore assez de données vente — parcourez les <a href={buildSeoPath(lang, modelPath(brandSlug, modelSlug))} className="text-violet-600">annonces {spec.displayName}</a>.</p>
        )}

        {rental?.market ? (
          <section className="mb-10 rounded-xl border p-6">
            <h2 className="text-xl font-semibold mb-4">Location — prix/jour</h2>
            <p className="text-2xl font-bold text-violet-600">{rental.market.median?.toLocaleString()} MAD/jour <span className="text-sm font-normal text-gray-500">médiane</span></p>
            <p className="text-sm text-gray-600 mt-1">{rental.activeListings} offres actives · {rental.market.min}–{rental.market.max} MAD/j</p>
          </section>
        ) : null}

        {trends?.monthly?.length ? (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3">Historique (snapshots GoVoiture)</h2>
            <ul className="text-sm space-y-1">
              {trends.monthly.slice(-6).map((m: { month: string; sale?: { median: number } | null }) => (
                <li key={m.month}>{m.month}{m.sale?.median ? ` — médiane vente ${m.sale.median.toLocaleString()} MAD` : ""}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-10 flex flex-wrap gap-3 text-sm">
          <a href={buildSeoPath(lang, modelPath(brandSlug, modelSlug))} className="text-violet-600 hover:underline">Annonces {spec.displayName}</a>
          <a href={buildSeoPath(lang, vehicleSpecPath(brandSlug, modelSlug))} className="text-violet-600 hover:underline">Fiche technique</a>
          <a href={buildSeoPath(lang, datasetPath(brandSlug, modelSlug))} className="text-violet-600 hover:underline">Dataset JSON</a>
          <a href={buildSeoPath(lang, `/marche/${brandSlug}/${modelSlug}`)} className="text-violet-600 hover:underline">Intelligence marché</a>
          <a href={buildSeoPath(lang, `/fiabilite/${brandSlug}/${modelSlug}`)} className="text-violet-600 hover:underline">Fiabilité</a>
          <a href={buildSeoPath(lang, `/recherches/${brandSlug}/${modelSlug}`)} className="text-violet-600 hover:underline">Recherches</a>
          <a href={buildSeoPath(lang, `/cout-possession/${brandSlug}/${modelSlug}`)} className="text-violet-600 hover:underline">Coût possession</a>
          <a href={buildSeoPath(lang, brandPath(brandSlug))} className="text-violet-600 hover:underline">Hub {brandName}</a>
        </section>

        <FaqSection faqs={faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
