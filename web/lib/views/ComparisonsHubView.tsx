import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
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
    <>
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
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: lang === "fr" ? "Comparatifs" : "Compare", href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-4">{seo.h1}</h1>
        <p className="text-gray-600 mb-8">{seo.intro}</p>

        <ul className="grid sm:grid-cols-2 gap-3">
          {comparisons.map((c) => (
            <li key={c.slug}>
              <a
                href={buildSeoPath(lang, c.path)}
                className="block rounded-xl border p-4 hover:border-violet-300 hover:shadow-sm"
              >
                <span className="font-medium">{c.h1}</span>
                <span className="block text-sm text-gray-500 mt-1">{c.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
