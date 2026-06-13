import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchAgencies, fetchDealers, type ProfessionalSummary } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { getCityBySlug, getCityName, MOROCCO_CITIES } from "@client-seo/catalog/cities";
import {
  buildAgencyHubSeo,
  buildDealerHubSeo,
  agencyFaqs,
  dealerFaqs,
} from "@client-seo/catalog/professionals";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, collectionPageJsonLd, faqPageJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

type Kind = "agency" | "dealer";

export function professionalsHubMetadata(lang: SeoLang, kind: Kind, citySlug?: string) {
  const seo =
    kind === "agency" ? buildAgencyHubSeo(lang, citySlug) : buildDealerHubSeo(lang, citySlug);
  if (!seo) return null;
  return { basePath: seo.path, title: seo.title, description: seo.description, keywords: seo.keywords };
}

function ProfessionalCard({ p, lang }: { p: ProfessionalSummary; lang: SeoLang }) {
  return (
    <a href={buildSeoPath(lang, p.path)} className="block rounded-xl border p-4 hover:shadow-md">
      <div className="flex gap-3 items-start">
        {p.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={String(p.avatar)} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold">
            {p.name.charAt(0)}
          </div>
        )}
        <div>
          <h3 className="font-semibold">{p.name}</h3>
          <p className="text-sm text-gray-600">{p.city}</p>
          <p className="text-xs text-gray-500 mt-1">
            {p.fleetSize} véhicule{p.fleetSize !== 1 ? "s" : ""}
            {p.reviewCount > 0 ? ` · ${p.avgRating}/5 (${p.reviewCount})` : ""}
            {p.verified ? " · ✓ Vérifié" : ""}
          </p>
        </div>
      </div>
    </a>
  );
}

export default async function ProfessionalsHubView({
  lang,
  kind,
  citySlug,
}: {
  lang: SeoLang;
  kind: Kind;
  citySlug?: string;
}) {
  const seo =
    kind === "agency" ? buildAgencyHubSeo(lang, citySlug) : buildDealerHubSeo(lang, citySlug);
  if (!seo) return null;

  const city = citySlug ? getCityBySlug(citySlug) : null;
  const cityName = city ? getCityName(city, lang) : "Maroc";
  const items =
    kind === "agency"
      ? await fetchAgencies(city ? getCityName(city, "fr") : undefined, citySlug)
      : await fetchDealers(city ? getCityName(city, "fr") : undefined, citySlug);

  const hubPath = kind === "agency" ? "/agences" : "/concessionnaires";
  const hubLabel = kind === "agency" ? "Agences" : "Concessionnaires";
  const faqs = kind === "agency" ? agencyFaqs(lang, cityName) : dealerFaqs(lang, cityName);
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
            items: items.map((p) => ({ name: p.name, url: `${siteUrl}${buildSeoPath(lang, p.path)}` })),
          }),
          faqPageJsonLd(faqs),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: hubLabel, url: `${siteUrl}${buildSeoPath(lang, hubPath)}` },
            ...(city ? [{ name: cityName, url: pageUrl }] : []),
          ])
        )}
      />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: hubLabel, href: hubPath },
            ...(city ? [{ label: cityName, href: undefined }] : []),
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-4">{seo.h1}</h1>
        <p className="text-gray-600 mb-8">{seo.intro}</p>

        {!citySlug ? (
          <section className="mb-10">
            <h2 className="font-semibold mb-3">{lang === "fr" ? "Par ville" : "By city"}</h2>
            <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {MOROCCO_CITIES.slice(0, 15).map((c) => (
                <li key={c.slug}>
                  <a
                    href={buildSeoPath(lang, `${hubPath}/${c.slug}`)}
                    className="text-violet-600 hover:underline"
                  >
                    {hubLabel} {c.name[lang] || c.name.fr}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <ul className="grid sm:grid-cols-2 gap-4 mb-10">
          {items.map((p) => (
            <li key={p._id}>
              <ProfessionalCard p={p} lang={lang} />
            </li>
          ))}
        </ul>
        {!items.length ? (
          <p className="text-gray-500 mb-8">{lang === "fr" ? "Aucun profil pour le moment." : "No profiles yet."}</p>
        ) : null}
        <FaqSection faqs={faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
