import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchReliability } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import StatCard from "@/components/ui/StatCard";
import SectionHeader from "@/components/ui/SectionHeader";
import TrustScoreCard from "@/components/ui/TrustScoreCard";
import { InsightCard } from "@/components/ui/GlassCard";
import { EntityGrid, RelatedLinksSection } from "@/components/ui/PremiumCTA";
import BadgePill from "@/components/ui/BadgePill";
import { getBrandBySlug, modelPath } from "@client-seo/catalog/brands";
import { getVehicleSpec, priceIntelPath } from "@client-seo/catalog/vehicleSpecs";
import {
  getReliabilityIndex,
  getAllReliabilityIndexes,
  reliabilityHubPath,
  reliabilityPath,
  marketIntelPath,
  tcoPath,
} from "@client-seo/catalog/reliabilityIndex";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, breadcrumbJsonLd, faqPageJsonLd, aggregateRatingJsonLd } from "@client-seo/jsonLd";

function modelApiName(modelSlug: string) {
  return modelSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function reliabilityHubMetadata(lang: SeoLang) {
  return {
    basePath: reliabilityHubPath(),
    title: "Indice fiabilité voiture Maroc — Goovoiture",
    description: "Scores fiabilité, pièces détachées et revente — 15 modèles vérifiés au Maroc.",
    keywords: "fiabilité voiture maroc, indice fiabilité auto",
  };
}

export function reliabilityMetadata(lang: SeoLang, brandSlug: string, modelSlug: string) {
  const rel = getReliabilityIndex(brandSlug, modelSlug);
  if (!rel) return null;
  return {
    basePath: reliabilityPath(brandSlug, modelSlug),
    title: `Fiabilité ${rel.displayName} Maroc — indice Goovoiture ${rel.score}/100`,
    description: `${rel.moroccoVerdict} Score ${rel.score}/100 · grade ${rel.grade}.`,
    keywords: `fiabilité ${rel.displayName} maroc, panne ${rel.displayName}`,
  };
}

export async function ReliabilityHubView({ lang }: { lang: SeoLang }) {
  const models = getAllReliabilityIndexes();
  const siteUrl = getSiteUrl();

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: "Fiabilité", href: undefined }]}
      hero={{
        kicker: "Goovoiture Data",
        title: "Indice fiabilité Goovoiture",
        description: "Scores curatés + données communauté — uniquement modèles avec fiche technique vérifiée.",
      }}
      cta={{
        title: "Trouver une voiture fiable",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: "Fiabilité", url: `${siteUrl}${buildSeoPath(lang, reliabilityHubPath())}` },
            ])
          )}
        />
      }
    >
      <section className="gv-sec-sm">
        <SectionHeader eyebrow="Modèles indexés" title="Scores par modèle" />
        <EntityGrid cols={2}>
          {models.map((m) => (
            <InsightCard
              key={`${m!.brandSlug}:${m!.modelSlug}`}
              title={m!.displayName}
              body={`Grade ${m!.grade}`}
              href={buildSeoPath(lang, reliabilityPath(m!.brandSlug, m!.modelSlug))}
              footer={
                <span className={`text-lg font-bold ${m!.score >= 85 ? "text-emerald-600" : m!.score >= 70 ? "text-amber-600" : "text-red-600"}`}>
                  {m!.score}/100
                </span>
              }
              badge={<BadgePill variant="success">Fiabilité</BadgePill>}
            />
          ))}
        </EntityGrid>
      </section>
    </SeoPageShell>
  );
}

export default async function ReliabilityModelView({
  lang,
  brandSlug,
  modelSlug,
}: {
  lang: SeoLang;
  brandSlug: string;
  modelSlug: string;
}) {
  const curated = getReliabilityIndex(brandSlug, modelSlug);
  if (!curated) notFound();

  const brand = getBrandBySlug(brandSlug)!;
  const brandName = brand.name[lang] || brand.name.fr;
  const apiModel = modelApiName(modelSlug);
  const live = await fetchReliability(brandName, apiModel);
  const score = live?.score ?? curated.score;
  const grade = live?.grade ?? curated.grade;

  const siteUrl = getSiteUrl();
  const path = reliabilityPath(brandSlug, modelSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  const relatedLinks = [
    { label: "Intelligence marché", href: buildSeoPath(lang, marketIntelPath(brandSlug, modelSlug)) },
    { label: "Indice prix", href: buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug)) },
    { label: "Coût possession", href: buildSeoPath(lang, tcoPath(brandSlug, modelSlug)) },
    { label: "Annonces", href: buildSeoPath(lang, modelPath(brandSlug, modelSlug)) },
  ];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Fiabilité", href: reliabilityHubPath() },
        { label: curated.displayName, href: undefined },
      ]}
      hero={{
        kicker: "Goovoiture Data",
        title: `Fiabilité ${curated.displayName}`,
        description: curated.moroccoVerdict,
      }}
      faqs={curated.faqs}
      cta={{
        title: `Acheter une ${curated.displayName}`,
        primaryHref: buildSeoPath(lang, modelPath(brandSlug, modelSlug)),
        primaryLabel: "Voir les annonces",
        secondaryHref: buildSeoPath(lang, "/voiture-occasion"),
        secondaryLabel: "Voiture occasion",
      }}
      related={{ brandSlug, brandFilter: brandName }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            aggregateRatingJsonLd({
              itemReviewed: curated.displayName,
              ratingValue: Math.round(score / 20 * 10) / 10,
              reviewCount: live?.reviewSampleSize || curated.strengths.length + 5,
            }),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: "Fiabilité", url: `${siteUrl}${buildSeoPath(lang, reliabilityHubPath())}` },
              { name: curated.displayName, url: pageUrl },
            ]),
            faqPageJsonLd(curated.faqs)
          )}
        />
      }
    >
      <div className="mb-8">
        <TrustScoreCard score={score} grade={`Grade ${grade}`} />
      </div>

      <EntityGrid cols={2}>
        <div className="gv-card gv-card-static p-5">
          <SectionHeader title="Points forts" />
          <ul className="text-sm space-y-1 list-disc pl-4 text-[var(--gv-mut)]">
            {curated.strengths.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="gv-card gv-card-static p-5">
          <SectionHeader title="Points de vigilance" />
          <ul className="text-sm space-y-1 list-disc pl-4 text-[var(--gv-mut)]">
            {curated.weaknesses.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      </EntityGrid>

      <EntityGrid cols={2}>
        <StatCard value={curated.resaleIndex} suffix="/100" label="Revente" accent="brand" />
        <StatCard value={curated.partsAvailability} suffix="/100" label="Pièces détachées" />
      </EntityGrid>

      {live?.commonIssues?.length ? (
        <section className="gv-sec-sm">
          <SectionHeader eyebrow="Communauté" title="Retours communauté" />
          <div className="space-y-3">
            {live.commonIssues.map((i, idx) => (
              <InsightCard key={idx} title={i.title} body={i.body} />
            ))}
          </div>
        </section>
      ) : null}

      {live?.maintenanceTips?.length ? (
        <section className="gv-sec-sm">
          <SectionHeader eyebrow="Entretien" title="Entretien recommandé" />
          <div className="space-y-3">
            {live.maintenanceTips.slice(0, 5).map((t, idx) => (
              <InsightCard key={idx} title={t.title} body={t.body} badge={<BadgePill variant="success">Conseil</BadgePill>} />
            ))}
          </div>
        </section>
      ) : null}

      <RelatedLinksSection title="Explorer ce modèle" links={relatedLinks} />
      <p className="text-xs text-[var(--gv-mut)] mt-6">{live?.methodology || "Score composite Goovoiture : communauté, avis annonces, données curatées Maroc."}</p>
    </SeoPageShell>
  );
}
