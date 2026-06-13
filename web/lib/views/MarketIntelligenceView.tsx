import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchMarketIntel, fetchMarketPrices } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import StatCard from "@/components/ui/StatCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { EntityGrid, RelatedLinksSection } from "@/components/ui/PremiumCTA";
import { InsightCard } from "@/components/ui/GlassCard";
import BadgePill from "@/components/ui/BadgePill";
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
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: "Intelligence marché", href: undefined }]}
      hero={{
        kicker: "GoVoiture Data",
        title: "Intelligence marché automobile Maroc",
        description: "Vue consolidée demande, fiabilité et prix — uniquement pour les modèles avec données vérifiées GoVoiture.",
      }}
      cta={{
        title: "Explorer le marketplace",
        description: "Annonces occasion et location vérifiées au Maroc.",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            breadcrumbJsonLd([
              { name: "GoVoiture", url: siteUrl },
              { name: "Intelligence marché", url: pageUrl },
            ])
          )}
        />
      }
    >
      <section className="gv-sec-sm">
        <SectionHeader eyebrow="Modèles indexés" title="Intelligence par modèle" />
        <EntityGrid cols={2}>
          {models.map((m) => (
            <InsightCard
              key={`${m!.brandSlug}:${m!.modelSlug}`}
              title={m!.displayName}
              body={`Score fiabilité ${m!.score}/100 · ${m!.grade}`}
              href={buildSeoPath(lang, marketIntelPath(m!.brandSlug, m!.modelSlug))}
              badge={<BadgePill variant="brand">Marché</BadgePill>}
            />
          ))}
        </EntityGrid>
      </section>
    </SeoPageShell>
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

  const relatedLinks = [
    { label: "Indice prix", href: buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug)) },
    { label: "Fiabilité", href: buildSeoPath(lang, reliabilityPath(brandSlug, modelSlug)) },
    { label: "Recherches", href: buildSeoPath(lang, searchIntelPath(brandSlug, modelSlug)) },
    { label: "Coût possession", href: buildSeoPath(lang, tcoPath(brandSlug, modelSlug)) },
    { label: "Annonces", href: buildSeoPath(lang, modelPath(brandSlug, modelSlug)) },
  ];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Marché", href: marketHubPath() },
        { label: spec.displayName, href: undefined },
      ]}
      hero={{
        kicker: "GoVoiture Data",
        title: `Marché ${spec.displayName} au Maroc`,
        description: "Intelligence propriétaire GoVoiture — demande, fiabilité et prix consolidés.",
      }}
      faqs={faqs}
      cta={{
        title: `Acheter ou louer une ${spec.displayName}`,
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
      }
    >
      <EntityGrid cols={3}>
        {demand ? (
          <StatCard
            value={demand.demandScore ?? "—"}
            suffix="/100"
            label="Demande"
            accent="brand"
          />
        ) : null}
        {rel ? (
          <StatCard value={rel.score} suffix="/100" label={`Fiabilité · ${rel.grade}`} accent="success" />
        ) : null}
        {prices?.sale?.market ? (
          <StatCard
            value={prices.sale.market.median?.toLocaleString() ?? "—"}
            suffix=" MAD"
            label={`Prix médian · ${prices.sale.market.sampleSize} obs.`}
          />
        ) : null}
      </EntityGrid>
      {demand ? (
        <p className="text-xs text-[var(--gv-mut)] mt-2 text-center">
          {demand.views?.toLocaleString()} vues · {demand.activeSaleListings} ventes · {demand.activeRentalListings} locations
        </p>
      ) : null}

      {rel?.commonIssues?.length ? (
        <section className="gv-sec-sm">
          <SectionHeader eyebrow="Vigilance" title="Points de vigilance" />
          <div className="space-y-3">
            {rel.commonIssues.map((i, idx) => (
              <InsightCard key={idx} title={i.title} body={i.body} badge={<BadgePill variant="neutral">Alerte</BadgePill>} />
            ))}
          </div>
        </section>
      ) : null}

      <RelatedLinksSection title="Explorer ce modèle" links={relatedLinks} />
    </SeoPageShell>
  );
}
