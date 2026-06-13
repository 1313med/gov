import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { PRO_PAGES, getProPage, proPagePath } from "@client-seo/catalog/proPages";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, softwareApplicationJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

export function proHubMetadata(lang: SeoLang) {
  const title =
    lang === "fr"
      ? "GoVoiture Pro — Logiciel agence location voiture Maroc"
      : lang === "ar"
        ? "GoVoiture Pro — برنامج وكالات تأجير السيارات"
        : "GoVoiture Pro — Rental agency software Morocco";
  const description =
    lang === "fr"
      ? "CRM, flotte, réservations, facturation et site web pour agences de location au Maroc."
      : "CRM, fleet, bookings and billing for rental agencies in Morocco.";
  return { basePath: "/pro", title, description, keywords: "logiciel location voiture maroc, gestion flotte, crm agence" };
}

export function proPageMetadata(lang: SeoLang, pageSlug: string) {
  const page = getProPage(pageSlug);
  if (!page) return null;
  return {
    basePath: proPagePath(pageSlug),
    title: `${page.title[lang] || page.title.fr} | GoVoiture Pro`,
    description: page.description[lang] || page.description.fr,
    keywords: page.keyword?.[lang] || page.keyword?.fr,
  };
}

export function ProHubView({ lang }: { lang: SeoLang }) {
  const siteUrl = getSiteUrl();
  const meta = proHubMetadata(lang);

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          softwareApplicationJsonLd({
            name: "GoVoiture Pro",
            description: "Suite SaaS pour agences de location automobile au Maroc",
            url: `${siteUrl}/pro`,
          }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Pro", url: `${siteUrl}${buildSeoPath(lang, "/pro")}` },
          ])
        )}
      />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <Breadcrumbs items={[{ label: "Goovoiture", href: "/" }, { label: "Pro", href: undefined }]} lang={lang} />
        <h1 className="text-3xl font-bold mb-4">GoVoiture Pro</h1>
        <p className="text-gray-600 mb-10">
          {lang === "fr"
            ? "L'écosystème B2B pour dominer la location automobile au Maroc : flotte, CRM, contrats, facturation et SEO."
            : "The B2B ecosystem for rental agencies in Morocco."}
        </p>
        <ul className="grid sm:grid-cols-2 gap-4">
          {PRO_PAGES.map((p: { slug: string; title: Record<string, string>; description: Record<string, string>; price: number | null }) => (
            <li key={p.slug}>
              <a
                href={buildSeoPath(lang, proPagePath(p.slug))}
                className="block p-6 rounded-xl border hover:border-violet-400"
              >
                <h2 className="font-semibold text-lg">{p.title[lang] || p.title.fr}</h2>
                <p className="text-sm text-gray-600 mt-2">{p.description[lang] || p.description.fr}</p>
                {p.price ? <p className="text-violet-600 mt-2 font-medium">à partir de {p.price} MAD/mois</p> : null}
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}

export function ProPageView({ lang, pageSlug }: { lang: SeoLang; pageSlug: string }) {
  const page = getProPage(pageSlug);
  if (!page) return null;
  const siteUrl = getSiteUrl();
  const path = proPagePath(pageSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;
  const title = page.title[lang] || page.title.fr;

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          softwareApplicationJsonLd({
            name: `GoVoiture Pro — ${title}`,
            description: page.description[lang] || page.description.fr,
            url: pageUrl,
          }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Pro", url: `${siteUrl}${buildSeoPath(lang, "/pro")}` },
            { name: title, url: pageUrl },
          ])
        )}
      />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Pro", href: "/pro" },
            { label: title, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-gray-600 mb-6">{page.description[lang] || page.description.fr}</p>
        {page.price ? (
          <p className="text-xl font-semibold text-violet-600 mb-8">à partir de {page.price} MAD/mois</p>
        ) : null}
        <a href="/register" className="inline-block px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold">
          {lang === "fr" ? "Demander une démo" : "Request a demo"}
        </a>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
