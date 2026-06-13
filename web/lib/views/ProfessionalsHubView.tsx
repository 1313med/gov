import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchAgencies, fetchDealers, type ProfessionalSummary } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import { EntityGrid, EmptyState, RelatedLinksSection } from "@/components/ui/PremiumCTA";
import BadgePill from "@/components/ui/BadgePill";
import { getCityBySlug, getCityName, MOROCCO_CITIES } from "@client-seo/catalog/cities";
import { buildAgencyHubSeo, buildDealerHubSeo, agencyFaqs, dealerFaqs } from "@client-seo/catalog/professionals";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, collectionPageJsonLd, faqPageJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

type Kind = "agency" | "dealer";

export function professionalsHubMetadata(lang: SeoLang, kind: Kind, citySlug?: string) {
  const seo = kind === "agency" ? buildAgencyHubSeo(lang, citySlug) : buildDealerHubSeo(lang, citySlug);
  if (!seo) return null;
  return { basePath: seo.path, title: seo.title, description: seo.description, keywords: seo.keywords };
}

function ProfessionalCard({ p, lang }: { p: ProfessionalSummary; lang: SeoLang }) {
  return (
    <a href={buildSeoPath(lang, p.path)} className="gv-card block p-5 no-underline text-inherit">
      <div className="flex gap-3 items-start">
        {p.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={String(p.avatar)} alt={p.name} className="w-14 h-14 rounded-full object-cover border-2 border-[var(--gv-gbd)]" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[var(--gv-gbg)] flex items-center justify-center text-[var(--gv-brand)] font-bold text-lg">
            {p.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--gv-ink)] truncate">{p.name}</h3>
          <p className="text-sm text-[var(--gv-mut)]">{p.city}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <BadgePill variant="neutral">{p.fleetSize} véhicule{p.fleetSize !== 1 ? "s" : ""}</BadgePill>
            {p.reviewCount > 0 ? <BadgePill variant="brand">{p.avgRating}/5</BadgePill> : null}
            {p.verified ? <BadgePill variant="success">✓ Vérifié</BadgePill> : null}
          </div>
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
  const seo = kind === "agency" ? buildAgencyHubSeo(lang, citySlug) : buildDealerHubSeo(lang, citySlug);
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

  const cityLinks = !citySlug
    ? MOROCCO_CITIES.slice(0, 15).map((c) => ({
        label: `${hubLabel} ${c.name[lang] || c.name.fr}`,
        href: buildSeoPath(lang, `${hubPath}/${c.slug}`),
      }))
    : [];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: hubLabel, href: hubPath },
        ...(city ? [{ label: cityName, href: undefined }] : []),
      ]}
      hero={{
        kicker: kind === "agency" ? "Goovoiture Pro · Location" : "Goovoiture Pro · Occasion",
        title: seo.h1,
        description: seo.intro,
        badges: [cityName, `${items.length} profils`],
      }}
      faqs={faqs}
      cta={{
        title: kind === "agency" ? "Louer une voiture au Maroc" : "Acheter une voiture au Maroc",
        description: "Comparez les offres marketplace en temps réel.",
        primaryHref: buildSeoPath(lang, kind === "agency" ? "/location-voiture" : "/voiture-occasion"),
        primaryLabel: kind === "agency" ? "Voir les locations" : "Voir les occasions",
      }}
      related={{ showListings: true, showBrands: true, showAgencies: false }}
      jsonLd={
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
              { name: "Goovoiture", url: siteUrl },
              { name: hubLabel, url: `${siteUrl}${buildSeoPath(lang, hubPath)}` },
              ...(city ? [{ name: cityName, url: pageUrl }] : []),
            ])
          )}
        />
      }
    >
      {cityLinks.length > 0 ? <RelatedLinksSection title="Par ville" links={cityLinks} /> : null}

      <section className="gv-sec-sm">
        <SectionHeader eyebrow="Professionnels" title={`${hubLabel} vérifiés`} description={`Profils actifs à ${cityName}.`} />
        {items.length > 0 ? (
          <EntityGrid cols={2}>
            {items.map((p) => (
              <ProfessionalCard key={p._id} p={p} lang={lang} />
            ))}
          </EntityGrid>
        ) : (
          <EmptyState title="Aucun profil pour le moment" description="Revenez bientôt — de nouvelles agences rejoignent Goovoiture." />
        )}
      </section>
    </SeoPageShell>
  );
}
