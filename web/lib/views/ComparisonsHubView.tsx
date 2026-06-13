import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import { EntityGrid } from "@/components/ui/PremiumCTA";
import { InsightCard } from "@/components/ui/GlassCard";
import BadgePill from "@/components/ui/BadgePill";
import { getAllComparisons, buildComparisonHubSeo } from "@client-seo/catalog/comparisons";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, collectionPageJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

export function comparisonsHubMetadata(lang: SeoLang) {
  const seo = buildComparisonHubSeo(lang);
  return {
    basePath: seo.path,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  };
}

export default function ComparisonsHubView({ lang }: { lang: SeoLang }) {
  const seo = buildComparisonHubSeo(lang);
  const comparisons = getAllComparisons();
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, seo.path)}`;

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: lang === "fr" ? "Comparatifs" : "Compare", href: undefined },
      ]}
      hero={{
        kicker: "GoVoiture Comparatifs",
        title: seo.h1,
        description: seo.intro,
      }}
      cta={{
        title: "Trouver votre prochaine voiture",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            collectionPageJsonLd({
              name: seo.h1,
              url: pageUrl,
              description: seo.description,
              items: comparisons.map((c) => ({ name: c.h1, url: `${siteUrl}${buildSeoPath(lang, c.path)}` })),
            }),
            breadcrumbJsonLd([
              { name: "GoVoiture", url: siteUrl },
              { name: lang === "fr" ? "Comparatifs" : "Compare", url: pageUrl },
            ])
          )}
        />
      }
    >
      <section className="gv-sec-sm">
        <SectionHeader eyebrow="Comparatifs" title="Modèles face à face" />
        <EntityGrid cols={2}>
          {comparisons.map((c) => (
            <InsightCard
              key={c.slug}
              title={c.h1}
              body={c.description}
              href={buildSeoPath(lang, c.path)}
              badge={<BadgePill variant="brand">VS</BadgePill>}
            />
          ))}
        </EntityGrid>
      </section>
    </SeoPageShell>
  );
}
