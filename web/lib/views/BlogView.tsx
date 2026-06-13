import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
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

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "GoVoiture", url: siteUrl },
          { name: "Blog", url: `${siteUrl}${buildSeoPath(lang, "/blog")}` },
        ])}
      />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <Breadcrumbs items={[{ label: "Goovoiture", href: "/" }, { label: "Blog", href: undefined }]} lang={lang} />
        <h1 className="text-3xl font-bold mb-4">{lang === "fr" ? "Blog GoVoiture" : "GoVoiture Blog"}</h1>
        <p className="text-gray-600 mb-10">
          {lang === "fr" ? "Guides pratiques pour louer, acheter et vendre au Maroc." : "Practical guides for Morocco."}
        </p>
        {BLOG_CLUSTERS.map((cluster: { slug: string; name: Record<string, string> }) => (
          <section key={cluster.slug} className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              <a href={buildSeoPath(lang, blogClusterPath(cluster.slug))} className="hover:text-violet-600">
                {cluster.name[lang] || cluster.name.fr}
              </a>
            </h2>
            <ul className="space-y-2">
              {getAllBlogArticles().filter((a: { cluster: string }) => a.cluster === cluster.slug).slice(0, 12).map(
                (a: { slug: string; title: Record<string, string> }) => (
                  <li key={a.slug}>
                    <a href={buildSeoPath(lang, blogArticlePath(a.slug))} className="text-violet-600 hover:underline">
                      {a.title[lang] || a.title.fr}
                    </a>
                  </li>
                )
              )}
            </ul>
          </section>
        ))}
      </main>
      <SeoFooter lang={lang} />
    </>
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

  return (
    <>
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
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: title, href: undefined },
          ]}
          lang={lang}
        />
        <article>
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <p className="text-gray-600 mb-8">{article.description[lang] || article.description.fr}</p>
          <div className="prose max-w-none">{body}</div>
        </article>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
