import { Link, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SeoHead from "../../components/SeoHead";
import SeoBreadcrumbs from "../../components/seo/SeoBreadcrumbs";
import SeoFooter from "../../components/seo/SeoFooter";
import { PRO_PAGES, getProPage, proPagePath } from "../../seo/catalog/proPages";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";
import { getSiteUrl } from "../../seo/seoLocales";
import { graphJsonLd, softwareApplicationJsonLd, breadcrumbJsonLd } from "../../seo/jsonLd";

export function ProHubPage() {
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const siteUrl = getSiteUrl();
  const title =
    lang === "fr"
      ? "GoVoiture Pro — Logiciel agence location voiture Maroc"
      : lang === "ar"
        ? "GoVoiture Pro — برنامج وكالات تأجير السيارات"
        : "GoVoiture Pro — Rental agency software Morocco";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f]">
      <SeoHead
        override={{
          title,
          description:
            lang === "fr"
              ? "CRM, flotte, réservations, facturation et site web pour agences de location au Maroc."
              : "CRM, fleet, bookings and billing for rental agencies in Morocco.",
          keywords: "logiciel location voiture maroc, gestion flotte, crm agence",
          canonical: `${siteUrl}${buildSeoPath(lang, "/pro")}`,
        }}
        jsonLdExtra={graphJsonLd(
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
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-3xl font-bold mb-4">GoVoiture Pro</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-10">
          {lang === "fr"
            ? "L'écosystème B2B pour dominer la location automobile au Maroc : flotte, CRM, contrats, facturation et SEO."
            : "The B2B ecosystem for rental agencies in Morocco."}
        </p>
        <ul className="grid sm:grid-cols-2 gap-4">
          {PRO_PAGES.map((p) => (
            <li key={p.slug}>
              <Link
                to={buildSeoPath(lang, proPagePath(p.slug))}
                className="block p-6 rounded-xl border border-gray-200 dark:border-white/10 hover:border-violet-400"
              >
                <h2 className="font-semibold text-lg">{p.title[lang] || p.title.fr}</h2>
                <p className="text-sm text-gray-500 mt-2">{p.description[lang] || p.description.fr}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <SeoFooter />
    </div>
  );
}

export default function ProPage() {
  const { pageSlug } = useParams();
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const page = getProPage(pageSlug);

  if (!page) {
    return <div className="p-8 text-center">Page Pro introuvable</div>;
  }

  const siteUrl = getSiteUrl();
  const path = proPagePath(pageSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;
  const title = `${page.title[lang] || page.title.fr} | GoVoiture Pro`;
  const desc = page.description[lang] || page.description.fr;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f]">
      <SeoHead
        override={{
          title,
          description: desc,
          keywords: page.keyword?.[lang] || page.keyword?.fr,
          canonical: pageUrl,
        }}
        jsonLdExtra={graphJsonLd(
          softwareApplicationJsonLd({
            name: `GoVoiture Pro — ${page.title.fr}`,
            description: desc,
            url: pageUrl,
            price: page.price,
          }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Pro", url: `${siteUrl}${buildSeoPath(lang, "/pro")}` },
            { name: page.title[lang] || page.title.fr, url: pageUrl },
          ])
        )}
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <SeoBreadcrumbs
          items={[
            { label: "GoVoiture", href: "/" },
            { label: "Pro", href: "/pro" },
            { label: page.title[lang] || page.title.fr, href: null },
          ]}
        />
        <h1 className="text-3xl font-bold mb-4">{page.title[lang] || page.title.fr}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">{desc}</p>
        {page.price && (
          <p className="text-2xl font-semibold text-violet-600 mb-8">
            {lang === "fr" ? "À partir de" : "From"} {page.price} MAD/mois
          </p>
        )}
        <Link
          to={buildSeoPath(lang, "/register")}
          className="inline-block px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700"
        >
          {lang === "fr" ? "Demander une démo" : "Request a demo"}
        </Link>
      </div>
      <SeoFooter />
    </div>
  );
}
