import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import { InsightCard } from "@/components/ui/GlassCard";
import { EntityGrid } from "@/components/ui/PremiumCTA";
import BadgePill from "@/components/ui/BadgePill";
import { BLOG_CLUSTERS, getAllBlogArticles, getBlogArticle, blogArticlePath, blogClusterPath } from "@client-seo/catalog/blogArticles";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, breadcrumbJsonLd, articleJsonLd } from "@client-seo/jsonLd";

export function blogHubMetadata(lang: SeoLang) {
  return {
    basePath: "/blog",
    title: lang === "fr" ? "Blog automobile Maroc | GoVoiture" : "Automotive blog Morocco | GoVoiture",
    description:
      lang === "fr"
        ? "Guides location voiture, occasion, aéroports et conseils pour le Maroc."
        : "Car rental and used car guides for Morocco.",
    keywords: "blog voiture maroc, location voiture guide",
  };
}

export function blogArticleMetadata(lang: SeoLang, articleSlug: string) {
  const article = getBlogArticle(articleSlug);
  if (!article) return null;
  return {
    basePath: blogArticlePath(articleSlug),
    title: `${article.title[lang] || article.title.fr} | GoVoiture`,
    description: article.description[lang] || article.description.fr,
    keywords: article.keyword?.[lang] || article.keyword?.fr,
  };
}

export function BlogHubView({ lang }: { lang: SeoLang }) {
  const siteUrl = getSiteUrl();
  const meta = blogHubMetadata(lang);

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: "Blog", href: undefined }]}
      hero={{
        kicker: "GoVoiture Guides",
        title: lang === "fr" ? "Blog GoVoiture" : "GoVoiture Blog",
        description:
          lang === "fr"
            ? "Guides pratiques pour louer, acheter et vendre au Maroc — location, occasion, aéroports et conseils d'experts."
            : "Practical guides for renting, buying and selling in Morocco.",
      }}
      cta={{
        title: lang === "fr" ? "Explorer le marketplace" : "Explore the marketplace",
        primaryHref: buildSeoPath(lang, "/location-voiture"),
        primaryLabel: lang === "fr" ? "Location voiture" : "Car rental",
        secondaryHref: buildSeoPath(lang, "/voiture-occasion"),
        secondaryLabel: lang === "fr" ? "Voiture occasion" : "Used cars",
      }}
      jsonLd={
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Blog", url: `${siteUrl}${buildSeoPath(lang, "/blog")}` },
          ])}
        />
      }
    >
      {BLOG_CLUSTERS.map((cluster: { slug: string; name: Record<string, string> }) => {
        const articles = getAllBlogArticles()
          .filter((a: { cluster: string }) => a.cluster === cluster.slug)
          .slice(0, 12);

        if (!articles.length) return null;

        return (
          <section key={cluster.slug} className="gv-sec-sm">
            <SectionHeader
              eyebrow={cluster.name[lang] || cluster.name.fr}
              title={cluster.name[lang] || cluster.name.fr}
              action={
                <a href={buildSeoPath(lang, blogClusterPath(cluster.slug))} className="gv-btn gv-btn-outline text-sm">
                  {lang === "fr" ? "Voir tout →" : "View all →"}
                </a>
              }
            />
            <EntityGrid cols={2}>
              {articles.map((a: { slug: string; title: Record<string, string>; description: Record<string, string> }) => (
                <InsightCard
                  key={a.slug}
                  title={a.title[lang] || a.title.fr}
                  body={a.description[lang] || a.description.fr}
                  href={buildSeoPath(lang, blogArticlePath(a.slug))}
                  badge={<BadgePill variant="neutral">{cluster.name[lang] || cluster.name.fr}</BadgePill>}
                />
              ))}
            </EntityGrid>
          </section>
        );
      })}
    </SeoPageShell>
  );
}

export function BlogArticleView({ lang, clusterSlug, articleSlug }: { lang: SeoLang; clusterSlug: string; articleSlug: string }) {
  const article = getBlogArticle(articleSlug);
  if (!article || article.cluster !== clusterSlug) return null;

  const siteUrl = getSiteUrl();
  const path = blogArticlePath(articleSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;
  const title = article.title[lang] || article.title.fr;
  const body = article.body[lang] || article.body.fr;
  const cluster = BLOG_CLUSTERS.find((c) => c.slug === clusterSlug);

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Blog", href: "/blog" },
        { label: title, href: undefined },
      ]}
      hero={{
        kicker: cluster ? cluster.name[lang] || cluster.name.fr : "GoVoiture Guides",
        title,
        description: article.description[lang] || article.description.fr,
      }}
      cta={{
        title: lang === "fr" ? "Trouver votre voiture" : "Find your car",
        primaryHref: buildSeoPath(lang, "/location-voiture"),
        primaryLabel: lang === "fr" ? "Location voiture" : "Car rental",
        secondaryHref: buildSeoPath(lang, "/voiture-occasion"),
        secondaryLabel: lang === "fr" ? "Voiture occasion" : "Used cars",
      }}
      related={{ showListings: true }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            articleJsonLd({
              headline: title,
              description: article.description[lang] || article.description.fr,
              url: pageUrl,
              datePublished: "2026-01-01",
            }),
            breadcrumbJsonLd([
              { name: "GoVoiture", url: siteUrl },
              { name: "Blog", url: `${siteUrl}${buildSeoPath(lang, "/blog")}` },
              { name: title, url: pageUrl },
            ])
          )}
        />
      }
    >
      <article className="gv-card gv-card-static p-6 md:p-8 max-w-3xl">
        <div className="gv-prose">{body}</div>
      </article>
    </SeoPageShell>
  );
}
