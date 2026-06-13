import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SeoHead from "../../components/SeoHead";
import { BLOG_CLUSTERS, BLOG_ARTICLES, blogArticlePath } from "../../seo/catalog/blogArticles";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";
import { getSiteUrl } from "../../seo/seoLocales";

export default function BlogHubPage() {
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const siteUrl = getSiteUrl();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f]">
      <SeoHead
        override={{
          title: lang === "fr" ? "Blog automobile Maroc | Goovoiture" : "Automotive blog Morocco | Goovoiture",
          description: lang === "fr" ? "Guides location, occasion, conduite et tourisme au Maroc." : "Guides for Morocco drivers.",
          canonical: `${siteUrl}${buildSeoPath(lang, "/blog")}`,
        }}
      />
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">{lang === "fr" ? "Guides & actualités" : "Guides & news"}</h1>
        {BLOG_CLUSTERS.map((cluster) => (
          <section key={cluster.slug} className="mb-10">
            <h2 className="text-xl font-semibold mb-4">{cluster.name[lang] || cluster.name.fr}</h2>
            <ul className="space-y-3">
              {BLOG_ARTICLES.filter((a) => a.cluster === cluster.slug).map((a) => (
                <li key={a.slug}>
                  <Link to={buildSeoPath(lang, blogArticlePath(a.slug))} className="text-violet-600 hover:underline">
                    {a.title[lang] || a.title.fr}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
