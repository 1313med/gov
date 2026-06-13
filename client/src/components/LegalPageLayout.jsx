import { Link } from "react-router-dom";
import { useAppLang } from "../context/AppLangContext";
import SeoHead from "./SeoHead";
import SeoContentBlock from "./SeoContentBlock";
import { buildSeoPath } from "../seo/seoPaths";
import { breadcrumbJsonLd } from "../seo/jsonLd";
import { getSiteUrl } from "../seo/seoLocales";
import { LEGAL_PAGES } from "../locales/legal";

export default function LegalPageLayout({ pageKey }) {
  const { lang } = useAppLang();
  const page = LEGAL_PAGES[pageKey];
  const C = page.copy[lang] || page.copy.fr;
  const siteUrl = getSiteUrl();
  const pagePath = buildSeoPath(lang, page.path);

  const jsonLdExtra = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd([
        { name: "Goovoiture", url: siteUrl },
        { name: C.title, url: `${siteUrl}${pagePath}` },
      ]),
      {
        "@type": "WebPage",
        name: C.title,
        description: C.intro,
        url: `${siteUrl}${pagePath}`,
        inLanguage: lang === "ar" ? "ar-MA" : lang === "en" ? "en-MA" : "fr-MA",
        isPartOf: { "@type": "WebSite", name: "Goovoiture", url: siteUrl },
      },
    ],
  };

  const otherKey = pageKey === "terms" ? "privacy" : "terms";
  const other = LEGAL_PAGES[otherKey];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f] text-gray-900 dark:text-gray-100">
      <SeoHead jsonLdExtra={jsonLdExtra} />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2">
          {C.kicker}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
          {C.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">{C.updated}</p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 mb-10 border-l-2 border-violet-500 pl-4">
          {C.intro}
        </p>

        <div className="space-y-8">
          {C.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                {section.title}
              </h2>
              {section.body && (
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line">
                  {section.body}
                </p>
              )}
              {section.list && (
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400 list-disc pl-5">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">{C.contactTitle}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{C.contact}</p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-sm">
          <Link
            to={buildSeoPath(lang, "/")}
            className="text-violet-600 dark:text-violet-400 hover:underline"
          >
            {C.backHome}
          </Link>
          <Link
            to={buildSeoPath(lang, other.path)}
            className="text-violet-600 dark:text-violet-400 hover:underline"
          >
            {C.otherLink}
          </Link>
        </div>
      </article>

      <SeoContentBlock />
    </div>
  );
}
