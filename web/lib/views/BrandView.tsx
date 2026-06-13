import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchRentals, fetchSales, fetchAgencies, fetchDealers } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import VehicleCard from "@/components/ui/VehicleCard";
import { EntityGrid, RelatedLinksSection } from "@/components/ui/PremiumCTA";
import {
  getBrandBySlug,
  brandPath,
  modelPath,
  cityBrandRentalPath,
  cityBrandSalePath,
  CAR_BRANDS,
} from "@client-seo/catalog/brands";
import { MOROCCO_CITIES } from "@client-seo/catalog/cities";
import { getAllBlogArticles, blogArticlePath } from "@client-seo/catalog/blogArticles";
import { getComparisonsForBrand } from "@client-seo/catalog/comparisons";
import { getVehicleSpec, priceIntelPath, vehicleSpecPath } from "@client-seo/catalog/vehicleSpecs";
import { buildBrandHubSeo } from "@client-seo/programmaticSeo";
import { buildSeoPath } from "@client-seo/seoPaths";
import { buildRentalListingPath, buildSaleListingPath } from "@client-seo/slugUtils";
import { graphJsonLd, collectionPageJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@client-seo/jsonLd";

export function brandMetadata(lang: SeoLang, brandSlug: string, modelSlug?: string) {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return null;
  const brandN = brand.name[lang] || brand.name.fr;
  const path = modelSlug ? modelPath(brandSlug, modelSlug) : brandPath(brandSlug);
  if (modelSlug) {
    const modelN = modelSlug.replace(/-/g, " ");
    return {
      basePath: path,
      title: `${brandN} ${modelN} Maroc | Goovoiture`,
      description: `Location et occasion ${brandN} ${modelN} au Maroc.`,
      keywords: `${brandN} ${modelN} maroc`,
    };
  }
  const seo = buildBrandHubSeo(lang, brandSlug);
  if (!seo) return null;
  return { basePath: path, title: seo.title, description: seo.description, keywords: seo.keywords };
}

function brandFaqs(lang: SeoLang, brandN: string, modelN: string | null) {
  if (lang === "en") {
    return [
      { q: `How much does a ${brandN}${modelN ? ` ${modelN}` : ""} cost in Morocco?`, a: "Prices vary by year and mileage — compare live listings on Goovoiture." },
      { q: `Where to rent a ${brandN} in Morocco?`, a: "Browse verified agencies on Goovoiture in Casablanca, Rabat, Marrakech and more." },
      { q: `Is ${brandN} popular in Morocco?`, a: `${brandN} is among the most requested brands for rental and used cars in Morocco.` },
    ];
  }
  return [
    {
      q: `Quel prix pour une ${brandN}${modelN ? ` ${modelN}` : ""} au Maroc ?`,
      a: "Les tarifs dépendent de l'année, du kilométrage et de la ville — consultez les annonces en temps réel sur Goovoiture.",
    },
    {
      q: `Où louer une ${brandN} au Maroc ?`,
      a: "Comparez les agences vérifiées Goovoiture à Casablanca, Rabat, Marrakech et dans 45 villes.",
    },
    {
      q: `La ${brandN} est-elle fiable au Maroc ?`,
      a: `${brandN} reste l'une des marques les plus demandées pour la location et l'occasion grâce à son réseau SAV local.`,
    },
  ];
}

function relatedBrands(brandSlug: string, limit = 6) {
  const idx = CAR_BRANDS.findIndex((b) => b.slug === brandSlug);
  if (idx < 0) return CAR_BRANDS.slice(0, limit);
  const out = [];
  for (let i = 1; i <= CAR_BRANDS.length && out.length < limit; i++) {
    const b = CAR_BRANDS[(idx + i) % CAR_BRANDS.length];
    if (b.slug !== brandSlug) out.push(b);
  }
  return out;
}

function similarModels(brand: { slug: string; models: string[] }, modelSlug: string | null) {
  if (!modelSlug) return brand.models.slice(0, 6);
  return brand.models.filter((m) => m !== modelSlug).slice(0, 5);
}

export default async function BrandView({
  lang,
  brandSlug,
  modelSlug,
}: {
  lang: SeoLang;
  brandSlug: string;
  modelSlug?: string;
}) {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return null;

  const brandN = brand.name[lang] || brand.name.fr;
  const model = modelSlug && brand.models.includes(modelSlug) ? modelSlug : null;
  const seoRaw = buildBrandHubSeo(lang, brandSlug);
  const modelN = model ? model.replace(/-/g, " ") : null;
  const seo = model
    ? {
        title: `${brandN} ${modelN} Maroc | Goovoiture`,
        description: `Location et occasion ${brandN} ${modelN} au Maroc.`,
        h1: `${brandN} ${modelN} au Maroc`,
        intro: `Toutes les offres ${brandN} ${modelN} — location et vente sur Goovoiture.`,
        keywords: `${brandN} ${modelN} maroc`,
      }
    : seoRaw;

  if (!seo) return null;

  const brandFilter = brand.name.fr;
  const [rentals, sales, agencies, dealers, comparisons] = await Promise.all([
    fetchRentals(undefined, brandFilter, 8),
    fetchSales(undefined, brandFilter, 8),
    fetchAgencies(undefined, undefined),
    fetchDealers(undefined, undefined),
    Promise.resolve(getComparisonsForBrand(brandSlug, model, 6)),
  ]);

  const filteredRentals = model
    ? rentals.filter((r: { model?: string }) => r.model?.toLowerCase().includes(model.replace(/-/g, " ").split(" ")[0]))
    : rentals;
  const filteredSales = model
    ? sales.filter((r: { model?: string }) => r.model?.toLowerCase().includes(model.replace(/-/g, " ").split(" ")[0]))
    : sales;

  const blogArticles = getAllBlogArticles()
    .filter((a) => a.slug.startsWith(`${brandSlug}-`) || a.slug.includes(brandSlug))
    .slice(0, 5);

  const faqs = brandFaqs(lang, brandN, modelN);
  const siteUrl = getSiteUrl();
  const path = model ? modelPath(brandSlug, modelSlug!) : brandPath(brandSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  const modelIntelLinks = model && getVehicleSpec(brandSlug, model)
    ? [
        { label: `Indice prix ${modelN}`, href: buildSeoPath(lang, priceIntelPath(brandSlug, model)) },
        { label: "Fiche technique", href: buildSeoPath(lang, vehicleSpecPath(brandSlug, model)) },
        { label: "Intelligence marché", href: buildSeoPath(lang, `/marche/${brandSlug}/${model}`) },
        { label: "Fiabilité", href: buildSeoPath(lang, `/fiabilite/${brandSlug}/${model}`) },
        { label: "Coût possession", href: buildSeoPath(lang, `/cout-possession/${brandSlug}/${model}`) },
      ]
    : [];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: lang === "fr" ? "Marques" : "Brands", href: "/voiture-occasion" },
        { label: brandN, href: model ? brandPath(brandSlug) : undefined },
        ...(model ? [{ label: modelN!, href: undefined }] : []),
      ]}
      hero={{
        kicker: "Goovoiture Marketplace",
        title: seo.h1,
        description: seo.intro,
      }}
      faqs={faqs}
      cta={{
        title: model ? `Trouver une ${brandN} ${modelN}` : `Trouver une ${brandN}`,
        primaryHref: buildSeoPath(lang, model ? modelPath(brandSlug, model) : `/voiture-occasion/${brandSlug}`),
        primaryLabel: lang === "fr" ? "Voir les annonces" : "Browse listings",
        secondaryHref: buildSeoPath(lang, `/location-voiture/casablanca/${brandSlug}`),
        secondaryLabel: lang === "fr" ? "Location voiture" : "Car rental",
      }}
      related={{ brandSlug, brandFilter, showListings: false, ...(model ? { extraLinks: modelIntelLinks } : {}) }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            collectionPageJsonLd({
              name: seo.h1,
              url: pageUrl,
              description: seo.description,
              items: [
                ...filteredRentals.slice(0, 4).map((r: { _id: string; brand: string; model: string }) => ({
                  name: `${r.brand} ${r.model}`,
                  url: `${siteUrl}${buildSeoPath(lang, buildRentalListingPath(r))}`,
                })),
                ...filteredSales.slice(0, 4).map((s: { _id: string; brand: string; model: string }) => ({
                  name: `${s.brand} ${s.model}`,
                  url: `${siteUrl}${buildSeoPath(lang, buildSaleListingPath(s))}`,
                })),
              ],
            }),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: brandN, url: `${siteUrl}${buildSeoPath(lang, brandPath(brandSlug))}` },
              ...(model ? [{ name: modelN!, url: pageUrl }] : []),
            ]),
            faqPageJsonLd(faqs)
          )}
        />
      }
    >
      {!model && (
        <RelatedLinksSection
          title={lang === "fr" ? "Modèles" : "Models"}
          links={brand.models.map((m: string) => ({
            label: m.replace(/-/g, " "),
            href: buildSeoPath(lang, modelPath(brandSlug, m)),
          }))}
        />
      )}

      {model && similarModels(brand, model).length > 0 && (
        <RelatedLinksSection
          title={lang === "fr" ? "Modèles similaires" : "Similar models"}
          links={similarModels(brand, model).map((m: string) => ({
            label: m.replace(/-/g, " "),
            href: buildSeoPath(lang, modelPath(brandSlug, m)),
          }))}
        />
      )}

      {filteredRentals.length > 0 && (
        <section className="gv-sec-sm">
          <SectionHeader
            eyebrow="Location"
            title={lang === "fr" ? "Location" : "Rental"}
            action={
              <a href={buildSeoPath(lang, `/location-voiture/casablanca/${brandSlug}`)} className="gv-btn gv-btn-outline text-sm">
                {lang === "fr" ? `Toutes les locations ${brandN}` : `All ${brandN} rentals`}
              </a>
            }
          />
          <EntityGrid cols={3}>
            {filteredRentals.slice(0, 6).map((r: { _id: string; brand: string; model: string; year?: number; pricePerDay?: number; city?: string }) => (
              <VehicleCard
                key={r._id}
                title={`${r.brand} ${r.model} ${r.year || ""}`}
                subtitle={r.city}
                price={r.pricePerDay ? `${Number(r.pricePerDay).toLocaleString()} MAD` : undefined}
                priceLabel="/j"
                href={buildSeoPath(lang, buildRentalListingPath(r))}
                badge="Location"
                intent="rental"
              />
            ))}
          </EntityGrid>
        </section>
      )}

      {filteredSales.length > 0 && (
        <section className="gv-sec-sm">
          <SectionHeader
            eyebrow="Occasion"
            title={lang === "fr" ? "Occasion" : "Used cars"}
            action={
              <a href={buildSeoPath(lang, `/voiture-occasion/casablanca/${brandSlug}`)} className="gv-btn gv-btn-outline text-sm">
                {lang === "fr" ? `Toutes les occasions ${brandN}` : `All ${brandN} used cars`}
              </a>
            }
          />
          <EntityGrid cols={3}>
            {filteredSales.slice(0, 6).map((s: { _id: string; brand: string; model: string; year?: number; price?: number; city?: string }) => (
              <VehicleCard
                key={s._id}
                title={`${s.brand} ${s.model} ${s.year || ""}`}
                subtitle={s.city}
                price={s.price ? `${Number(s.price).toLocaleString()} MAD` : undefined}
                href={buildSeoPath(lang, buildSaleListingPath(s))}
                badge="Occasion"
                intent="sale"
              />
            ))}
          </EntityGrid>
        </section>
      )}

      <section className="gv-sec-sm grid sm:grid-cols-2 gap-6">
        <div>
          <SectionHeader eyebrow="Professionnels" title={lang === "fr" ? "Agences" : "Agencies"} />
          <RelatedLinksSection
            title={lang === "fr" ? "Agences location" : "Rental agencies"}
            links={[
              ...agencies.slice(0, 4).map((a) => ({ label: a.city ? `${a.name} — ${a.city}` : a.name, href: a.path })),
              { label: lang === "fr" ? "Toutes les agences" : "All agencies", href: "/agences" },
            ]}
          />
        </div>
        <div>
          <SectionHeader title={lang === "fr" ? "Concessionnaires" : "Dealers"} />
          <RelatedLinksSection
            title={lang === "fr" ? "Concessionnaires" : "Dealers"}
            links={[
              ...dealers.slice(0, 4).map((d) => ({ label: d.city ? `${d.name} — ${d.city}` : d.name, href: d.path })),
              { label: lang === "fr" ? "Tous les concessionnaires" : "All dealers", href: "/concessionnaires" },
            ]}
          />
        </div>
      </section>

      {comparisons.length > 0 && (
        <RelatedLinksSection
          title={lang === "fr" ? "Comparatifs" : "Comparisons"}
          links={comparisons.map((c) => ({ label: c.h1, href: c.path }))}
        />
      )}

      {blogArticles.length > 0 && (
        <RelatedLinksSection
          title={lang === "fr" ? "Guides" : "Guides"}
          links={blogArticles.map((a) => ({
            label: a.title[lang] || a.title.fr,
            href: buildSeoPath(lang, blogArticlePath(a.slug)),
          }))}
        />
      )}

      <RelatedLinksSection
        title={lang === "fr" ? "Par ville" : "By city"}
        links={MOROCCO_CITIES.slice(0, 12).flatMap((c: { slug: string; name: Record<string, string> }) => [
          { label: `${brandN} ${c.name[lang] || c.name.fr} (location)`, href: buildSeoPath(lang, cityBrandRentalPath(c.slug, brandSlug)) },
          { label: `${brandN} ${c.name[lang] || c.name.fr} (occasion)`, href: buildSeoPath(lang, cityBrandSalePath(c.slug, brandSlug)) },
        ])}
      />

      <RelatedLinksSection
        title={lang === "fr" ? "Marques similaires" : "Related brands"}
        links={relatedBrands(brandSlug).map((b) => ({
          label: b.name[lang] || b.name.fr,
          href: buildSeoPath(lang, brandPath(b.slug)),
        }))}
      />
    </SeoPageShell>
  );
}
