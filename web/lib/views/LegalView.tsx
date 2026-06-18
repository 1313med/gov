import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import { LEGAL_PAGES, LEGAL_SEO } from "@client-locales/legal.js";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, organizationJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

export type LegalPageSlug = "conditions-utilisation" | "politique-confidentialite";

const SLUG_TO_KEY: Record<LegalPageSlug, "terms" | "privacy"> = {
  "conditions-utilisation": "terms",
  "politique-confidentialite": "privacy",
};

export function legalMetadata(slug: LegalPageSlug, lang: SeoLang) {
  const basePath = `/${slug}` as keyof typeof LEGAL_SEO;
  const seo = LEGAL_SEO[basePath]?.[lang] || LEGAL_SEO[basePath]?.fr;
  if (!seo) return null;
  return { basePath, title: seo.title, description: seo.description, keywords: seo.keywords };
}

export default function LegalView({ lang, slug }: { lang: SeoLang; slug: LegalPageSlug }) {
  const basePath = `/${slug}` as keyof typeof LEGAL_SEO;
  const seo = LEGAL_SEO[basePath]?.[lang] || LEGAL_SEO[basePath]?.fr;
  const pageKey = SLUG_TO_KEY[slug];
  const legal = LEGAL_PAGES[pageKey];
  const copy = legal.copy[lang] || legal.copy.fr;
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, basePath)}`;

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: seo?.h1 || copy.title, href: undefined },
      ]}
      hero={{
        kicker: copy.kicker,
        title: seo?.h1 || copy.title,
        description: seo?.intro || copy.intro,
      }}
      related={{ showListings: false, showBrands: false, showBlog: false }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            organizationJsonLd(siteUrl),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: seo?.h1 || copy.title, url: pageUrl },
            ])
          )}
        />
      }
    >
      <article className="max-w-3xl space-y-8">
        <p className="text-sm text-[var(--gv-mut)]">{copy.updated}</p>
        <p className="text-[var(--gv-ink2)] leading-relaxed">{copy.intro}</p>
        {copy.sections.map((section: { title: string; body?: string; list?: string[] }) => (
          <section key={section.title}>
            <h2 className="gv-h2 mb-3">{section.title}</h2>
            {section.body ? <p className="text-[var(--gv-ink2)] leading-relaxed whitespace-pre-line">{section.body}</p> : null}
            {section.list ? (
              <ul className="list-disc pl-5 space-y-2 text-[var(--gv-ink2)] mt-3">
                {section.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        <section className="gv-card gv-card-static p-6">
          <h2 className="font-semibold mb-2">{copy.contactTitle}</h2>
          <p className="text-[var(--gv-ink2)] whitespace-pre-line">{copy.contact}</p>
          <div className="flex flex-wrap gap-4 mt-6 text-sm">
            <a href="/" className="text-violet-600 hover:underline">
              {copy.backHome}
            </a>
            <a
              href={buildSeoPath(
                lang,
                slug === "conditions-utilisation" ? "/politique-confidentialite" : "/conditions-utilisation"
              )}
              className="text-violet-600 hover:underline"
            >
              {copy.otherLink}
            </a>
          </div>
        </section>
      </article>
    </SeoPageShell>
  );
}
