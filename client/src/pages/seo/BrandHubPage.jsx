import { Link, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SeoHead from "../../components/SeoHead";
import SeoBreadcrumbs from "../../components/seo/SeoBreadcrumbs";
import { getBrandBySlug, brandPath, modelPath, cityBrandRentalPath, cityBrandSalePath } from "../../seo/catalog/brands";
import { MOROCCO_CITIES } from "../../seo/catalog/cities";
import { buildBrandHubSeo } from "../../seo/programmaticSeo";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";
import { getSiteUrl } from "../../seo/seoLocales";
import { graphJsonLd, collectionPageJsonLd, breadcrumbJsonLd } from "../../seo/jsonLd";

export default function BrandHubPage() {
  const { brandSlug, modelSlug } = useParams();
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const brand = getBrandBySlug(brandSlug);
  const model = modelSlug && brand?.models.includes(modelSlug) ? modelSlug : null;

  if (!brand) {
    return <div className="p-8 text-center text-gray-500">Marque introuvable</div>;
  }

  const seoRaw = buildBrandHubSeo(lang, brandSlug);
  const brandN = brand.name[lang] || brand.name.fr;
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

  const siteUrl = getSiteUrl();
  const path = model ? modelPath(brandSlug, modelSlug) : brandPath(brandSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05060f]">
      <SeoHead
        override={{ title: seo.title, description: seo.description, keywords: seo.keywords, canonical: pageUrl }}
        jsonLdExtra={graphJsonLd(
          collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: [] }),
          breadcrumbJsonLd([
            { name: "Goovoiture", url: siteUrl },
            { name: brandN, url: `${siteUrl}${buildSeoPath(lang, brandPath(brandSlug))}` },
            ...(model ? [{ name: modelN, url: pageUrl }] : []),
          ])
        )}
      />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <SeoBreadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: lang === "fr" ? "Marques" : "Brands", href: "/voiture-occasion" },
            { label: brandN, href: model ? brandPath(brandSlug) : null },
            ...(model ? [{ label: modelN, href: null }] : []),
          ]}
        />
        <h1 className="text-3xl font-bold mb-4">{seo.h1}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">{seo.intro}</p>

        {!model && (
          <section className="mb-10">
            <h2 className="font-semibold mb-3">Modèles</h2>
            <ul className="flex flex-wrap gap-2">
              {brand.models.map((m) => (
                <li key={m}>
                  <Link
                    to={buildSeoPath(lang, modelPath(brandSlug, m))}
                    className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-sm capitalize hover:bg-violet-100"
                  >
                    {m.replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="font-semibold mb-3">{lang === "fr" ? "Par ville" : "By city"}</h2>
          <ul className="flex flex-wrap gap-2">
            {MOROCCO_CITIES.slice(0, 20).map((c) => (
              <li key={c.slug}>
                <Link
                  to={buildSeoPath(lang, model ? `/location-voiture/${c.slug}/${brandSlug}/${modelSlug}` : cityBrandRentalPath(c.slug, brandSlug))}
                  className="text-sm text-violet-600 hover:underline"
                >
                  {c.name.fr}
                </Link>
                {" · "}
                <Link
                  to={buildSeoPath(lang, model ? `/voiture-occasion/${c.slug}/${brandSlug}/${modelSlug}` : cityBrandSalePath(c.slug, brandSlug))}
                  className="text-sm text-teal-600 hover:underline"
                >
                  occasion
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
