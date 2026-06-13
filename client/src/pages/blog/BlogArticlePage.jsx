import { Link, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SeoHead from "../../components/SeoHead";
import SeoBreadcrumbs from "../../components/seo/SeoBreadcrumbs";
import SeoFooter from "../../components/seo/SeoFooter";
import { getBlogArticle, BLOG_CLUSTERS } from "../../seo/catalog/blogArticles";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";
import { getSiteUrl } from "../../seo/seoLocales";
import { graphJsonLd, breadcrumbJsonLd } from "../../seo/jsonLd";

export default function BlogArticlePage() {
  const { clusterSlug, articleSlug } = useParams();
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const article = getBlogArticle(articleSlug);
  const cluster = BLOG_CLUSTERS.find((c) => c.slug === clusterSlug);

  if (!article || article.cluster !== clusterSlug) {
    return <div className="p-8 text-center">Article introuvable</div>;
  }

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${pathname}`;
  const title = article.title[lang] || article.title.fr;
  const desc = article.description[lang] || article.description.fr;
  const body = article.body[lang] || article.body.fr;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f]">
      <SeoHead
        override={{
          title: `${title} | GoVoiture`,
          description: desc,
          keywords: article.keyword?.[lang] || article.keyword?.fr,
          canonical: pageUrl,
        }}
        jsonLdExtra={graphJsonLd(
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description: desc,
            url: pageUrl,
            author: { "@type": "Organization", name: "GoVoiture" },
            publisher: { "@type": "Organization", name: "GoVoiture" },
          },
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Blog", url: `${siteUrl}${buildSeoPath(lang, "/blog")}` },
            { name: title, url: pageUrl },
          ])
        )}
      />
      <article className="mx-auto max-w-3xl px-4 py-12">
        <SeoBreadcrumbs
          items={[
            { label: "GoVoiture", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: cluster?.name[lang] || cluster?.name.fr || clusterSlug, href: `/blog#${clusterSlug}` },
            { label: title, href: null },
          ]}
        />
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{body}</p>
        <div className="flex flex-wrap gap-4">
          <Link to={buildSeoPath(lang, "/location-voiture")} className="text-violet-600 font-medium">
            {lang === "fr" ? "Louer une voiture →" : "Rent a car →"}
          </Link>
          <Link to={buildSeoPath(lang, "/voiture-occasion")} className="text-teal-600 font-medium">
            {lang === "fr" ? "Voitures d'occasion →" : "Used cars →"}
          </Link>
        </div>
      </article>
      <SeoFooter />
    </div>
  );
}
