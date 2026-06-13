import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchTco } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import TcoCalculatorClient from "@/components/client/TcoCalculatorClient";
import { getBrandBySlug, modelPath } from "@client-seo/catalog/brands";
import { getTcoBenchmark, getAllTcoBenchmarks } from "@client-seo/catalog/tcoBenchmarks";
import { priceIntelPath } from "@client-seo/catalog/vehicleSpecs";
import { reliabilityPath } from "@client-seo/catalog/reliabilityIndex";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@client-seo/jsonLd";

function modelApiName(modelSlug: string) {
  return modelSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function tcoMetadata(lang: SeoLang, brandSlug: string, modelSlug: string) {
  const bench = getTcoBenchmark(brandSlug, modelSlug);
  if (!bench) return null;
  return {
    basePath: `/cout-possession/${brandSlug}/${modelSlug}`,
    title: `Coût possession ${bench.displayName} Maroc — calculateur GoVoiture`,
    description: `TCO annuel ${bench.displayName} : carburant, assurance, entretien, dépréciation — barèmes Maroc.`,
    keywords: `coût possession ${bench.displayName} maroc, TCO ${bench.displayName}`,
  };
}

export default async function TcoCalculatorView({
  lang,
  brandSlug,
  modelSlug,
}: {
  lang: SeoLang;
  brandSlug: string;
  modelSlug: string;
}) {
  const bench = getTcoBenchmark(brandSlug, modelSlug);
  if (!bench) notFound();

  const brand = getBrandBySlug(brandSlug)!;
  const brandName = brand.name[lang] || brand.name.fr;
  const apiModel = modelApiName(modelSlug);
  const apiTco = await fetchTco(brandName, apiModel, bench.defaultYear, bench.defaultKmPerYear);

  const siteUrl = getSiteUrl();
  const path = `/cout-possession/${brandSlug}/${modelSlug}`;
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  const faqs = [
    {
      q: `Combien coûte ${bench.displayName} par an au Maroc ?`,
      a: apiTco
        ? `Estimation GoVoiture : ${apiTco.yearly.total.toLocaleString()} MAD/an (${apiTco.monthly.total.toLocaleString()} MAD/mois).`
        : `Fourchette typique selon usage ${bench.defaultKmPerYear} km/an — utilisez le calculateur.`,
    },
    {
      q: "Qu'est-ce que le TCO ?",
      a: "Total Cost of Ownership : carburant + assurance + entretien + vignette/visite + dépréciation — pas seulement le prix d'achat.",
    },
  ];

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Coût possession", url: pageUrl },
            { name: bench.displayName, url: pageUrl },
          ]),
          faqPageJsonLd(faqs)
        )}
      />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Coût possession", href: "/cout-possession/dacia/logan" },
            { label: bench.displayName, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-2">Coût de possession {bench.displayName}</h1>
        <p className="text-gray-600 mb-8">Calculateur TCO GoVoiture — barèmes carburant, assurance et entretien Maroc 2025.</p>

        <TcoCalculatorClient
          bench={{
            ...bench,
            depreciationRate: bench.depreciationRate,
          }}
          initialApi={apiTco}
        />

        <section className="mt-10 mb-10 flex flex-wrap gap-3 text-sm">
          <a href={buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-violet-100">Indice prix</a>
          <a href={buildSeoPath(lang, reliabilityPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-green-100">Fiabilité</a>
          <a href={buildSeoPath(lang, modelPath(brandSlug, modelSlug))} className="text-violet-600 hover:underline">Annonces</a>
        </section>

        <section className="mb-10">
          <h2 className="font-semibold mb-3">Autres modèles indexés</h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            {getAllTcoBenchmarks()
              .filter((b) => b!.brandSlug !== brandSlug || b!.modelSlug !== modelSlug)
              .slice(0, 8)
              .map((b) => (
                <li key={`${b!.brandSlug}:${b!.modelSlug}`}>
                  <a href={buildSeoPath(lang, `/cout-possession/${b!.brandSlug}/${b!.modelSlug}`)} className="px-2 py-1 bg-gray-100 rounded capitalize hover:bg-violet-100">
                    {b!.displayName}
                  </a>
                </li>
              ))}
          </ul>
        </section>

        <FaqSection faqs={faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
