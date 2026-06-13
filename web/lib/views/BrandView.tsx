import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchRentals, fetchSales, fetchAgencies, fetchDealers } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
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
      title: `${brandN} ${modelN} Maroc | GoVoiture`,
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
      { q: `How much does a ${brandN}${modelN ? ` ${modelN}` : ""} cost in Morocco?`, a: "Prices vary by year and mileage — compare live listings on GoVoiture." },
      { q: `Where to rent a ${brandN} in Morocco?`, a: "Browse verified agencies on GoVoiture in Casablanca, Rabat, Marrakech and more." },
      { q: `Is ${brandN} popular in Morocco?`, a: `${brandN} is among the most requested brands for rental and used cars in Morocco.` },
    ];
  }
  return [
    {
      q: `Quel prix pour une ${brandN}${modelN ? ` ${modelN}` : ""} au Maroc ?`,
      a: "Les tarifs dépendent de l'année, du kilométrage et de la ville — consultez les annonces en temps réel sur GoVoiture.",
    },
    {
      q: `Où louer une ${brandN} au Maroc ?`,
      a: "Comparez les agences vérifiées GoVoiture à Casablanca, Rabat, Marrakech et dans 45 villes.",
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
        title: `${brandN} ${modelN} Maroc | GoVoiture`,
        description: `Location et occasion ${brandN} ${modelN} au Maroc.`,
        h1: `${brandN} ${modelN} au Maroc`,
        intro: `Toutes les offres ${brandN} ${modelN} — location et vente sur GoVoiture.`,
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

  return (
    <>
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
            { name: "GoVoiture", url: siteUrl },
            { name: brandN, url: `${siteUrl}${buildSeoPath(lang, brandPath(brandSlug))}` },
            ...(model ? [{ name: modelN!, url: pageUrl }] : []),
          ]),
          faqPageJsonLd(faqs)
        )}
      />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: lang === "fr" ? "Marques" : "Brands", href: "/voiture-occasion" },
            { label: brandN, href: model ? brandPath(brandSlug) : undefined },
            ...(model ? [{ label: modelN!, href: undefined }] : []),
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-4">{seo.h1}</h1>
        <p className="text-gray-600 mb-8">{seo.intro}</p>

        {!model && (
          <section className="mb-10">
            <h2 className="font-semibold mb-3">{lang === "fr" ? "Modèles" : "Models"}</h2>
            <ul className="flex flex-wrap gap-2">
              {brand.models.map((m: string) => (
                <li key={m}>
                  <a
                    href={buildSeoPath(lang, modelPath(brandSlug, m))}
                    className="px-3 py-1 rounded-full bg-gray-100 text-sm capitalize hover:bg-violet-100"
                  >
                    {m.replace(/-/g, " ")}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {model && (
          <section className="mb-10">
            <h2 className="font-semibold mb-3">{lang === "fr" ? "Modèles similaires" : "Similar models"}</h2>
            <ul className="flex flex-wrap gap-2">
              {similarModels(brand, model).map((m: string) => (
                <li key={m}>
                  <a href={buildSeoPath(lang, modelPath(brandSlug, m))} className="text-violet-600 hover:underline capitalize">
                    {m.replace(/-/g, " ")}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {filteredRentals.length > 0 && (
          <section className="mb-10">
            <h2 className="font-semibold mb-3">{lang === "fr" ? "Location" : "Rental"}</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {filteredRentals.slice(0, 6).map((r: { _id: string; brand: string; model: string; year?: number; pricePerDay?: number; city?: string }) => (
                <li key={r._id}>
                  <a href={buildSeoPath(lang, buildRentalListingPath(r))} className="block p-3 rounded-lg border hover:border-violet-300">
                    <span className="font-medium">{r.brand} {r.model} {r.year}</span>
                    {r.city ? <span className="text-gray-500 text-sm block">{r.city}</span> : null}
                    {r.pricePerDay ? <span className="text-violet-600 text-sm">{Number(r.pricePerDay).toLocaleString()} MAD/j</span> : null}
                  </a>
                </li>
              ))}
            </ul>
            <a href={buildSeoPath(lang, `/location-voiture/casablanca/${brandSlug}`)} className="text-sm text-violet-600 hover:underline mt-2 inline-block">
              {lang === "fr" ? `Voir toutes les locations ${brandN}` : `All ${brandN} rentals`}
            </a>
          </section>
        )}

        {filteredSales.length > 0 && (
          <section className="mb-10">
            <h2 className="font-semibold mb-3">{lang === "fr" ? "Occasion" : "Used cars"}</h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {filteredSales.slice(0, 6).map((s: { _id: string; brand: string; model: string; year?: number; price?: number; city?: string }) => (
                <li key={s._id}>
                  <a href={buildSeoPath(lang, buildSaleListingPath(s))} className="block p-3 rounded-lg border hover:border-violet-300">
                    <span className="font-medium">{s.brand} {s.model} {s.year}</span>
                    {s.city ? <span className="text-gray-500 text-sm block">{s.city}</span> : null}
                    {s.price ? <span className="text-violet-600 text-sm">{Number(s.price).toLocaleString()} MAD</span> : null}
                  </a>
                </li>
              ))}
            </ul>
            <a href={buildSeoPath(lang, `/voiture-occasion/casablanca/${brandSlug}`)} className="text-sm text-violet-600 hover:underline mt-2 inline-block">
              {lang === "fr" ? `Voir toutes les occasions ${brandN}` : `All ${brandN} used cars`}
            </a>
          </section>
        )}

        <section className="mb-10 grid sm:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold mb-3">{lang === "fr" ? "Agences" : "Agencies"}</h2>
            <ul className="space-y-2 text-sm">
              {agencies.slice(0, 4).map((a) => (
                <li key={a._id}>
                  <a href={a.path} className="text-violet-600 hover:underline">{a.name}</a>
                  {a.city ? <span className="text-gray-500"> — {a.city}</span> : null}
                </li>
              ))}
            </ul>
            <a href="/agences" className="text-sm text-violet-600 hover:underline mt-2 inline-block">
              {lang === "fr" ? "Toutes les agences" : "All agencies"}
            </a>
          </div>
          <div>
            <h2 className="font-semibold mb-3">{lang === "fr" ? "Concessionnaires" : "Dealers"}</h2>
            <ul className="space-y-2 text-sm">
              {dealers.slice(0, 4).map((d) => (
                <li key={d._id}>
                  <a href={d.path} className="text-violet-600 hover:underline">{d.name}</a>
                  {d.city ? <span className="text-gray-500"> — {d.city}</span> : null}
                </li>
              ))}
            </ul>
            <a href="/concessionnaires" className="text-sm text-violet-600 hover:underline mt-2 inline-block">
              {lang === "fr" ? "Tous les concessionnaires" : "All dealers"}
            </a>
          </div>
        </section>

        {comparisons.length > 0 && (
          <section className="mb-10">
            <h2 className="font-semibold mb-3">{lang === "fr" ? "Comparatifs" : "Comparisons"}</h2>
            <ul className="flex flex-wrap gap-2 text-sm">
              {comparisons.map((c) => (
                <li key={c.slug}>
                  <a href={c.path} className="px-3 py-1 rounded-full bg-gray-100 hover:bg-violet-100">{c.h1}</a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {blogArticles.length > 0 && (
          <section className="mb-10">
            <h2 className="font-semibold mb-3">{lang === "fr" ? "Guides" : "Guides"}</h2>
            <ul className="space-y-2 text-sm">
              {blogArticles.map((a) => (
                <li key={a.slug}>
                  <a href={buildSeoPath(lang, blogArticlePath(a.slug))} className="text-violet-600 hover:underline">
                    {a.title[lang] || a.title.fr}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-10">
          <h2 className="font-semibold mb-3">{lang === "fr" ? "Par ville" : "By city"}</h2>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {MOROCCO_CITIES.slice(0, 12).map((c: { slug: string; name: Record<string, string> }) => (
              <li key={c.slug}>
                <a href={buildSeoPath(lang, cityBrandRentalPath(c.slug, brandSlug))} className="text-violet-600 hover:underline">
                  {brandN} {c.name[lang] || c.name.fr}
                </a>
                {" · "}
                <a href={buildSeoPath(lang, cityBrandSalePath(c.slug, brandSlug))} className="text-gray-500 hover:underline">
                  {lang === "fr" ? "occasion" : "used"}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-semibold mb-3">{lang === "fr" ? "Marques similaires" : "Related brands"}</h2>
          <ul className="flex flex-wrap gap-2">
            {relatedBrands(brandSlug).map((b) => (
              <li key={b.slug}>
                <a href={buildSeoPath(lang, brandPath(b.slug))} className="px-3 py-1 rounded-full bg-gray-100 text-sm hover:bg-violet-100">
                  {b.name[lang] || b.name.fr}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {model && getVehicleSpec(brandSlug, model) ? (
          <section className="mb-10 flex flex-wrap gap-3 text-sm">
            <a href={buildSeoPath(lang, priceIntelPath(brandSlug, model))} className="px-3 py-1 rounded-full bg-violet-100 text-violet-800 hover:bg-violet-200">
              Indice prix {modelN}
            </a>
            <a href={buildSeoPath(lang, vehicleSpecPath(brandSlug, model))} className="px-3 py-1 rounded-full bg-gray-100 hover:bg-violet-100">
              Fiche technique
            </a>
          </section>
        ) : null}

        <FaqSection faqs={faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
