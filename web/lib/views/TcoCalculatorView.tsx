import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchTco } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import { CalculatorCard } from "@/components/ui/GlassCard";
import { RelatedLinksSection } from "@/components/ui/PremiumCTA";
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

  const relatedLinks = [
    { label: "Indice prix", href: buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug)) },
    { label: "Fiabilité", href: buildSeoPath(lang, reliabilityPath(brandSlug, modelSlug)) },
    { label: "Annonces", href: buildSeoPath(lang, modelPath(brandSlug, modelSlug)) },
  ];

  const otherModels = getAllTcoBenchmarks()
    .filter((b) => b!.brandSlug !== brandSlug || b!.modelSlug !== modelSlug)
    .slice(0, 8)
    .map((b) => ({
      label: b!.displayName,
      href: buildSeoPath(lang, `/cout-possession/${b!.brandSlug}/${b!.modelSlug}`),
    }));

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Coût possession", href: "/cout-possession/dacia/logan" },
        { label: bench.displayName, href: undefined },
      ]}
      hero={{
        kicker: "GoVoiture Data",
        title: `Coût de possession ${bench.displayName}`,
        description: "Calculateur TCO GoVoiture — barèmes carburant, assurance et entretien Maroc 2025.",
      }}
      faqs={faqs}
      cta={{
        title: `Acheter une ${bench.displayName}`,
        primaryHref: buildSeoPath(lang, modelPath(brandSlug, modelSlug)),
        primaryLabel: "Voir les annonces",
        secondaryHref: buildSeoPath(lang, "/voiture-occasion"),
        secondaryLabel: "Voiture occasion",
      }}
      related={{ brandSlug, brandFilter: brandName }}
      jsonLd={
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
      }
    >
      <CalculatorCard title="Calculateur TCO">
        <TcoCalculatorClient
          bench={{
            ...bench,
            depreciationRate: bench.depreciationRate,
          }}
          initialApi={apiTco}
        />
      </CalculatorCard>

      <RelatedLinksSection title="Explorer ce modèle" links={relatedLinks} />

      <section className="gv-sec-sm">
        <SectionHeader eyebrow="Autres modèles" title="Modèles indexés" />
        <RelatedLinksSection title="Calculateurs TCO" links={otherModels} />
      </section>
    </SeoPageShell>
  );
}
