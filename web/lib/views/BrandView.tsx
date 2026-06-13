import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { getBrandBySlug, brandPath, modelPath, cityBrandRentalPath, cityBrandSalePath } from "@client-seo/catalog/brands";
import { MOROCCO_CITIES } from "@client-seo/catalog/cities";
import { buildBrandHubSeo } from "@client-seo/programmaticSeo";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, collectionPageJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

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

export default function BrandView({
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

  const siteUrl = getSiteUrl();
  const path = model ? modelPath(brandSlug, modelSlug!) : brandPath(brandSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          collectionPageJsonLd({ name: seo.h1, url: pageUrl, description: seo.description, items: [] }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: brandN, url: `${siteUrl}${buildSeoPath(lang, brandPath(brandSlug))}` },
            ...(model ? [{ name: modelN!, url: pageUrl }] : []),
          ])
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
            <h2 className="font-semibold mb-3">Modèles</h2>
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

        <section>
          <h2 className="font-semibold mb-3">{lang === "fr" ? "Par ville" : "By city"}</h2>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {MOROCCO_CITIES.slice(0, 12).map((c: { slug: string; name: Record<string, string> }) => (
              <li key={c.slug}>
                <a href={buildSeoPath(lang, cityBrandRentalPath(c.slug, brandSlug))} className="text-violet-600 hover:underline">
                  {brandN} {c.name[lang] || c.name.fr}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
