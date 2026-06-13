import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import { InsightCard } from "@/components/ui/GlassCard";
import { RelatedLinksSection } from "@/components/ui/PremiumCTA";
import BadgePill from "@/components/ui/BadgePill";
import { getCluster, getClusterTopic, getAllClusterTopics, clusterTopicPath } from "@client-seo/catalog/contentClusters";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@client-seo/jsonLd";

type ClusterSlug = "assurance" | "financement" | "demarches";

export function clusterHubMetadata(lang: SeoLang, clusterSlug: ClusterSlug) {
  const cluster = getCluster(clusterSlug);
  if (!cluster) return null;
  return {
    basePath: cluster.hubPath,
    title: `${cluster.hubTitle[lang] || cluster.hubTitle.fr} | Goovoiture`,
    description: cluster.hubDescription[lang] || cluster.hubDescription.fr,
    keywords: cluster.slug,
  };
}

export function clusterTopicMetadata(lang: SeoLang, clusterSlug: ClusterSlug, topicSlug: string) {
  const data = getClusterTopic(clusterSlug, topicSlug);
  if (!data) return null;
  const { topic } = data;
  return {
    basePath: clusterTopicPath(clusterSlug, topicSlug),
    title: `${topic.title[lang] || topic.title.fr} | Goovoiture`,
    description: topic.description[lang] || topic.description.fr,
    keywords: topicSlug,
  };
}

export function ContentClusterHubView({ lang, clusterSlug }: { lang: SeoLang; clusterSlug: ClusterSlug }) {
  const cluster = getCluster(clusterSlug);
  if (!cluster) return null;

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, cluster.hubPath)}`;
  const clusterName = cluster.name[lang] || cluster.name.fr;

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: clusterName, href: undefined }]}
      hero={{
        kicker: "Goovoiture Guides",
        title: cluster.hubTitle[lang] || cluster.hubTitle.fr,
        description: cluster.hubDescription[lang] || cluster.hubDescription.fr,
      }}
      cta={{
        title: "Trouver une voiture",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      jsonLd={
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Goovoiture", url: siteUrl },
            { name: clusterName, url: pageUrl },
          ])}
        />
      }
    >
      <section className="gv-sec-sm">
        <SectionHeader eyebrow={clusterName} title="Articles" />
        <div className="space-y-4">
          {cluster.topics.map((t) => (
            <InsightCard
              key={t.slug}
              title={t.title[lang] || t.title.fr}
              body={t.description[lang] || t.description.fr}
              href={buildSeoPath(lang, clusterTopicPath(clusterSlug, t.slug))}
              badge={<BadgePill variant="brand">{clusterName}</BadgePill>}
            />
          ))}
        </div>
      </section>
    </SeoPageShell>
  );
}

export function ContentClusterTopicView({
  lang,
  clusterSlug,
  topicSlug,
}: {
  lang: SeoLang;
  clusterSlug: ClusterSlug;
  topicSlug: string;
}) {
  const data = getClusterTopic(clusterSlug, topicSlug);
  if (!data) notFound();

  const { cluster, topic } = data;
  const siteUrl = getSiteUrl();
  const path = clusterTopicPath(clusterSlug, topicSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;
  const title = topic.title[lang] || topic.title.fr;
  const clusterName = cluster.name[lang] || cluster.name.fr;

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: clusterName, href: cluster.hubPath },
        { label: title, href: undefined },
      ]}
      hero={{
        kicker: "Goovoiture Guides",
        title,
        description: topic.description[lang] || topic.description.fr,
      }}
      faqs={topic.faqs}
      cta={{
        title: "Explorer le marketplace",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            articleJsonLd({
              headline: title,
              description: topic.description[lang] || topic.description.fr,
              url: pageUrl,
              datePublished: "2026-01-01",
            }),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: clusterName, url: `${siteUrl}${buildSeoPath(lang, cluster.hubPath)}` },
              { name: title, url: pageUrl },
            ]),
            faqPageJsonLd(topic.faqs)
          )}
        />
      }
    >
      <article>
        {topic.sections.map((s) => (
          <section key={s.heading} className="gv-sec-sm">
            <SectionHeader title={s.heading} />
            <p className="text-[var(--gv-ink2)] leading-relaxed">{s.body}</p>
          </section>
        ))}
        {topic.relatedLinks?.length ? (
          <RelatedLinksSection
            title="Liens utiles"
            links={topic.relatedLinks.map((l) => ({
              label: l.label,
              href: buildSeoPath(lang, l.path),
            }))}
          />
        ) : null}
      </article>
    </SeoPageShell>
  );
}

export { getAllClusterTopics };
