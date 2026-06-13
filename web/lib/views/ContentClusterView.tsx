import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { getCluster, getClusterTopic, getAllClusterTopics, clusterTopicPath } from "@client-seo/catalog/contentClusters";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, articleJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@client-seo/jsonLd";

type ClusterSlug = "assurance" | "financement" | "demarches";

export function clusterHubMetadata(lang: SeoLang, clusterSlug: ClusterSlug) {
  const cluster = getCluster(clusterSlug);
  if (!cluster) return null;
  return {
    basePath: cluster.hubPath,
    title: `${cluster.hubTitle[lang] || cluster.hubTitle.fr} | GoVoiture`,
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
    title: `${topic.title[lang] || topic.title.fr} | GoVoiture`,
    description: topic.description[lang] || topic.description.fr,
    keywords: topicSlug,
  };
}

export function ContentClusterHubView({ lang, clusterSlug }: { lang: SeoLang; clusterSlug: ClusterSlug }) {
  const cluster = getCluster(clusterSlug);
  if (!cluster) return null;

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, cluster.hubPath)}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "GoVoiture", url: siteUrl },
          { name: cluster.name[lang] || cluster.name.fr, url: pageUrl },
        ])}
      />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[{ label: "Goovoiture", href: "/" }, { label: cluster.name[lang] || cluster.name.fr, href: undefined }]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-4">{cluster.hubTitle[lang] || cluster.hubTitle.fr}</h1>
        <p className="text-gray-600 mb-10">{cluster.hubDescription[lang] || cluster.hubDescription.fr}</p>
        <ul className="space-y-4">
          {cluster.topics.map((t) => (
            <li key={t.slug}>
              <a href={buildSeoPath(lang, clusterTopicPath(clusterSlug, t.slug))} className="block rounded-xl border p-4 hover:border-violet-300">
                <span className="font-semibold">{t.title[lang] || t.title.fr}</span>
                <p className="text-sm text-gray-600 mt-1">{t.description[lang] || t.description.fr}</p>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SeoFooter lang={lang} />
    </>
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

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          articleJsonLd({
            headline: title,
            description: topic.description[lang] || topic.description.fr,
            url: pageUrl,
            datePublished: "2026-01-01",
          }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: cluster.name[lang] || cluster.name.fr, url: `${siteUrl}${buildSeoPath(lang, cluster.hubPath)}` },
            { name: title, url: pageUrl },
          ]),
          faqPageJsonLd(topic.faqs)
        )}
      />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: cluster.name[lang] || cluster.name.fr, href: cluster.hubPath },
            { label: title, href: undefined },
          ]}
          lang={lang}
        />
        <article>
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <p className="text-gray-600 mb-8">{topic.description[lang] || topic.description.fr}</p>
          {topic.sections.map((s) => (
            <section key={s.heading} className="mb-8">
              <h2 className="text-xl font-semibold mb-2">{s.heading}</h2>
              <p className="text-gray-700 leading-relaxed">{s.body}</p>
            </section>
          ))}
          {topic.relatedLinks?.length ? (
            <section className="mb-8">
              <h2 className="font-semibold mb-2">Liens utiles</h2>
              <ul className="text-sm space-y-1">
                {topic.relatedLinks.map((l) => (
                  <li key={l.path}><a href={buildSeoPath(lang, l.path)} className="text-violet-600 hover:underline">{l.label}</a></li>
                ))}
              </ul>
            </section>
          ) : null}
          <FaqSection faqs={topic.faqs} />
        </article>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}

export { getAllClusterTopics };
