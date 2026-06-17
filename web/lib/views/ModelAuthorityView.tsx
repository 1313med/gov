import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchRentals, fetchSales } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard from "@/components/ui/StatCard";
import VehicleCard from "@/components/ui/VehicleCard";
import BadgePill from "@/components/ui/BadgePill";
import GlassCard, { InsightCard } from "@/components/ui/GlassCard";
import { EntityGrid, RelatedLinksSection } from "@/components/ui/PremiumCTA";
import { getBrandBySlug, brandPath, modelPath } from "@client-seo/catalog/brands";
import { getComparisonsForBrand } from "@client-seo/catalog/comparisons";
import { getVehicleSpec, priceIntelPath, vehicleSpecPath } from "@client-seo/catalog/vehicleSpecs";
import { getReliabilityIndex, reliabilityPath } from "@client-seo/catalog/reliabilityIndex";
import {
  getModelAuthority,
  modelAuthorityPath,
  authorityMetadata,
  matchesListingModel,
  getAuthorityModelsByBrand,
} from "@client-seo/catalog/modelsAuthority";
import { buildSeoPath } from "@client-seo/seoPaths";
import { buildRentalListingPath, buildSaleListingPath } from "@client-seo/slugUtils";
import {
  graphJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  articleJsonLd,
  carJsonLd,
} from "@client-seo/jsonLd";

export function modelAuthorityPageMetadata(lang: SeoLang, brandSlug: string, modelSlug: string) {
  const model = getModelAuthority(brandSlug, modelSlug);
  if (!model) return null;
  return authorityMetadata(model);
}

function AuthoritySection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="gv-ma-section gv-sec-sm scroll-mt-28">
      <SectionHeader eyebrow={eyebrow} title={title} />
      {children}
    </section>
  );
}

export default async function ModelAuthorityView({
  lang,
  brandSlug,
  modelSlug,
}: {
  lang: SeoLang;
  brandSlug: string;
  modelSlug: string;
}) {
  const model = getModelAuthority(brandSlug, modelSlug);
  if (!model) notFound();

  const brand = getBrandBySlug(brandSlug);
  const brandN = brand?.name[lang] || brand?.name.fr || brandSlug;
  const path = modelAuthorityPath(brandSlug, modelSlug);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  const brandFilter = brandN;
  const [rentals, sales, comparisons] = await Promise.all([
    fetchRentals(undefined, brandFilter, 24),
    fetchSales(undefined, brandFilter, 24),
    Promise.resolve(getComparisonsForBrand(brandSlug, modelSlug, 4)),
  ]);

  const filteredRentals = rentals.filter((r: { model?: string }) => matchesListingModel(r.model, model));
  const filteredSales = sales.filter((s: { model?: string }) => matchesListingModel(s.model, model));

  const specSlug = brand?.models.includes(modelSlug) ? modelSlug : null;
  const rel = getReliabilityIndex(brandSlug, modelSlug) || (specSlug ? getReliabilityIndex(brandSlug, specSlug) : null);
  const spec = specSlug ? getVehicleSpec(brandSlug, specSlug) : getVehicleSpec(brandSlug, modelSlug);

  const intelLinks = [
    { label: lang === "fr" ? "Acheter une voiture" : "Buy a car", href: buildSeoPath(lang, `/voiture-occasion/casablanca/${brandSlug}`) },
    { label: lang === "fr" ? "Louer une voiture" : "Rent a car", href: buildSeoPath(lang, `/location-voiture/casablanca/${brandSlug}`) },
    { label: lang === "fr" ? `Marque ${brandN}` : `${brandN} brand`, href: buildSeoPath(lang, brandPath(brandSlug)) },
    ...(spec
      ? [
          { label: lang === "fr" ? "Indice prix" : "Price index", href: buildSeoPath(lang, priceIntelPath(brandSlug, spec.modelSlug)) },
          { label: lang === "fr" ? "Fiche technique" : "Specs", href: buildSeoPath(lang, vehicleSpecPath(brandSlug, spec.modelSlug)) },
        ]
      : []),
    ...(rel
      ? [{ label: lang === "fr" ? "Fiabilité" : "Reliability", href: buildSeoPath(lang, reliabilityPath(brandSlug, rel.modelSlug)) }]
      : []),
    ...(specSlug
      ? [{ label: lang === "fr" ? "Annonces modèle" : "Model listings", href: buildSeoPath(lang, modelPath(brandSlug, specSlug)) }]
      : []),
    ...comparisons.map((c: { slug: string; h1?: string; title: string }) => ({
      label: c.h1 || c.title,
      href: buildSeoPath(lang, `/comparer/${c.slug}`),
    })),
  ];

  const siblingModels = getAuthorityModelsByBrand(brandSlug).filter((m) => m.modelSlug !== modelSlug);

  const jsonLdData = graphJsonLd(
    organizationJsonLd(siteUrl),
    articleJsonLd({
      headline: `${model.displayName} au Maroc`,
      description: model.subtitle,
      url: pageUrl,
      datePublished: "2024-01-01",
    }),
    carJsonLd({
      name: model.displayName,
      brand: brandN,
      model: model.displayName.replace(brandN, "").trim(),
      description: model.introduction,
      url: pageUrl,
    }),
    breadcrumbJsonLd([
      { name: "Goovoiture", url: siteUrl },
      { name: "Voitures", url: `${siteUrl}${buildSeoPath(lang, "/voiture-occasion")}` },
      { name: brandN, url: `${siteUrl}${buildSeoPath(lang, brandPath(brandSlug))}` },
      { name: model.displayName, url: pageUrl },
    ]),
    faqPageJsonLd(model.faqs)
  );

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Voitures", href: "/voiture-occasion" },
        { label: brandN, href: brandPath(brandSlug) },
        { label: model.displayName, href: undefined },
      ]}
      hero={{
        kicker: "Guide Goovoiture",
        title: `${model.displayName} au Maroc`,
        titleHighlight: model.displayName.split(" ").slice(-1)[0],
        description: model.subtitle,
        badges: [brandN, "Guide expert", "Marché Maroc"],
      }}
      faqs={model.faqs}
      cta={{
        title: lang === "fr" ? `Trouver une ${model.displayName}` : `Find a ${model.displayName}`,
        description:
          lang === "fr"
            ? "Comparez les annonces occasion et location vérifiées sur Goovoiture."
            : "Compare verified sale and rental listings on Goovoiture.",
        primaryHref: buildSeoPath(lang, `/voiture-occasion/casablanca/${brandSlug}`),
        primaryLabel: lang === "fr" ? "Voir l'occasion" : "Browse used cars",
        secondaryHref: buildSeoPath(lang, `/location-voiture/casablanca/${brandSlug}`),
        secondaryLabel: lang === "fr" ? "Voir la location" : "Browse rentals",
      }}
      related={{ brandSlug, brandFilter, showListings: false, extraLinks: intelLinks }}
      jsonLd={<JsonLd data={jsonLdData} />}
    >
      <nav className="gv-ma-toc mb-8 flex flex-wrap gap-2" aria-label="Sommaire">
        {[
          ["presentation", "Présentation"],
          ["popularite", "Popularité"],
          ["motorisations", "Motorisations"],
          ["consommation", "Consommation"],
          ["fiabilite", "Fiabilité"],
          ["prix", "Prix"],
          ["entretien", "Entretien"],
          ["profils", "Pour qui ?"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="gv-ma-toc-link">
            {label}
          </a>
        ))}
      </nav>

      <AuthoritySection id="presentation" eyebrow="Modèle" title="Présentation du modèle">
        <p className="gv-ma-prose">{model.introduction}</p>
      </AuthoritySection>

      <AuthoritySection id="popularite" eyebrow="Marché Maroc" title="Pourquoi ce modèle est populaire au Maroc">
        <p className="gv-ma-prose">{model.popularity}</p>
      </AuthoritySection>

      <AuthoritySection id="motorisations" eyebrow="Motorisations" title="Motorisations disponibles">
        <EntityGrid cols={2}>
          <InsightCard title="Diesel" body={model.engines.diesel} badge={<BadgePill variant="neutral">Diesel</BadgePill>} />
          <InsightCard title="Essence" body={model.engines.essence} badge={<BadgePill variant="neutral">Essence</BadgePill>} />
          <InsightCard title="Automatique" body={model.engines.automatic} badge={<BadgePill variant="brand">Auto</BadgePill>} />
          <InsightCard title="Manuelle" body={model.engines.manual} badge={<BadgePill variant="neutral">BVM</BadgePill>} />
        </EntityGrid>
      </AuthoritySection>

      <AuthoritySection id="consommation" eyebrow="Consommation" title="Consommation moyenne">
        <div className="grid sm:grid-cols-2 gap-4">
          <StatCard value={model.consumption.city} label="Ville (estimation)" accent="brand" />
          <StatCard value={model.consumption.highway} label="Autoroute (estimation)" accent="accent" />
        </div>
        <p className="gv-ma-note mt-4">
          Estimations basées sur l&apos;usage réel au Maroc (climatisation, embouteillages Casa/Rabat). Votre consommation varie selon conduite et état mécanique.
        </p>
      </AuthoritySection>

      <AuthoritySection id="fiabilite" eyebrow="Fiabilité" title="Fiabilité">
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard className="gv-ma-pros">
            <h3 className="font-semibold text-emerald-700 mb-3">Points forts</h3>
            <ul className="space-y-2 text-sm text-[var(--gv-mut)]">
              {model.reliability.strengths.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-emerald-600 shrink-0">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
          <GlassCard className="gv-ma-cons">
            <h3 className="font-semibold text-amber-700 mb-3">Points de vigilance</h3>
            <ul className="space-y-2 text-sm text-[var(--gv-mut)]">
              {model.reliability.weaknesses.map((w) => (
                <li key={w} className="flex gap-2">
                  <span className="text-amber-600 shrink-0">!</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </AuthoritySection>

      <AuthoritySection id="prix" eyebrow="Prix Maroc" title="Prix au Maroc">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <GlassCard className="gv-card-glass">
            <div className="gv-ey mb-2">Occasion</div>
            <p className="text-sm leading-relaxed">{model.prices.occasion}</p>
          </GlassCard>
          <GlassCard className="gv-card-glass">
            <div className="gv-ey mb-2">Récent</div>
            <p className="text-sm leading-relaxed">{model.prices.recent}</p>
          </GlassCard>
        </div>
        <div>
          <h3 className="font-semibold mb-3">Versions populaires</h3>
          <div className="flex flex-wrap gap-2">
            {model.prices.popularVersions.map((v) => (
              <BadgePill key={v} variant="brand">
                {v}
              </BadgePill>
            ))}
          </div>
        </div>
      </AuthoritySection>

      <AuthoritySection id="entretien" eyebrow="Entretien" title="Coût d'entretien">
        <p className="gv-ma-prose">{model.maintenance}</p>
      </AuthoritySection>

      <AuthoritySection id="profils" eyebrow="Profils" title="Pour qui ce véhicule est-il adapté ?">
        <EntityGrid cols={2}>
          <InsightCard title="Jeunes conducteurs" body={model.audience.youngDrivers} />
          <InsightCard title="Familles" body={model.audience.families} />
          <InsightCard title="Professionnels" body={model.audience.professionals} />
          <InsightCard title="Grands rouleurs" body={model.audience.longDistance} />
        </EntityGrid>
      </AuthoritySection>

      {siblingModels.length > 0 && (
        <RelatedLinksSection
          title={lang === "fr" ? `Autres modèles ${brandN}` : `Other ${brandN} models`}
          links={siblingModels.map((m) => ({
            label: m.displayName,
            href: buildSeoPath(lang, modelAuthorityPath(m.brandSlug, m.modelSlug)),
          }))}
        />
      )}

      {filteredSales.length > 0 && (
        <section className="gv-sec-sm" id="annonces-occasion">
          <SectionHeader
            eyebrow="Marketplace"
            title={lang === "fr" ? `${model.displayName} à acheter` : `${model.displayName} for sale`}
            action={
              <a href={buildSeoPath(lang, `/voiture-occasion/casablanca/${brandSlug}`)} className="gv-btn gv-btn-outline text-sm">
                {lang === "fr" ? "Toutes les occasions" : "All used cars"}
              </a>
            }
          />
          <EntityGrid cols={3}>
            {filteredSales.slice(0, 6).map((s: { _id: string; brand: string; model: string; year?: number; price?: number; city?: string }) => (
              <VehicleCard
                key={s._id}
                title={`${s.brand} ${s.model} ${s.year || ""}`}
                subtitle={s.city}
                price={s.price ? `${Number(s.price).toLocaleString("fr-MA")} MAD` : undefined}
                href={buildSeoPath(lang, buildSaleListingPath(s))}
                badge="Occasion"
                intent="sale"
              />
            ))}
          </EntityGrid>
        </section>
      )}

      {filteredRentals.length > 0 && (
        <section className="gv-sec-sm" id="annonces-location">
          <SectionHeader
            eyebrow="Location"
            title={lang === "fr" ? `${model.displayName} à louer` : `${model.displayName} for rent`}
            action={
              <a href={buildSeoPath(lang, `/location-voiture/casablanca/${brandSlug}`)} className="gv-btn gv-btn-outline text-sm">
                {lang === "fr" ? "Toutes les locations" : "All rentals"}
              </a>
            }
          />
          <EntityGrid cols={3}>
            {filteredRentals.slice(0, 6).map((r: { _id: string; brand: string; model: string; year?: number; pricePerDay?: number; city?: string }) => (
              <VehicleCard
                key={r._id}
                title={`${r.brand} ${r.model} ${r.year || ""}`}
                subtitle={r.city}
                price={r.pricePerDay ? `${Number(r.pricePerDay).toLocaleString("fr-MA")} MAD` : undefined}
                priceLabel="/j"
                href={buildSeoPath(lang, buildRentalListingPath(r))}
                badge="Location"
                intent="rental"
              />
            ))}
          </EntityGrid>
        </section>
      )}

      <RelatedLinksSection title={lang === "fr" ? "Explorer sur Goovoiture" : "Explore on Goovoiture"} links={intelLinks} />
    </SeoPageShell>
  );
}
