import { Link, useParams, useLocation } from "react-router-dom";
import SeoHead from "../../components/SeoHead";
import SeoBreadcrumbs from "../../components/seo/SeoBreadcrumbs";
import { getBrandBySlug, brandPath } from "../../seo/catalog/brands";
import {
  getModelAuthority,
  modelAuthorityPath,
  authorityMetadata,
  getAuthorityModelsByBrand,
} from "../../seo/catalog/modelsAuthority";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";
import { getSiteUrl } from "../../seo/seoLocales";
import { graphJsonLd, breadcrumbJsonLd, faqPageJsonLd, organizationJsonLd, articleJsonLd } from "../../seo/jsonLd";

export default function ModelAuthorityPage() {
  const { brandSlug, modelSlug } = useParams();
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const model = getModelAuthority(brandSlug, modelSlug);
  const brand = getBrandBySlug(brandSlug);

  if (!model || !brand) {
    return <div className="p-8 text-center text-gray-500">Modèle introuvable</div>;
  }

  const meta = authorityMetadata(model);
  const brandN = brand.name[lang] || brand.name.fr;
  const path = modelAuthorityPath(brandSlug, modelSlug);
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;
  const siblings = getAuthorityModelsByBrand(brandSlug).filter((m) => m.modelSlug !== modelSlug);

  return (
    <article className="pb-16">
      <SeoHead
        title={meta.title}
        description={meta.description}
        keywords={meta.keywords}
        canonical={pageUrl}
        jsonLd={graphJsonLd(
          organizationJsonLd(siteUrl),
          articleJsonLd({ headline: `${model.displayName} au Maroc`, description: model.subtitle, url: pageUrl }),
          breadcrumbJsonLd([
            { name: "Goovoiture", url: siteUrl },
            { name: brandN, url: `${siteUrl}${buildSeoPath(lang, brandPath(brandSlug))}` },
            { name: model.displayName, url: pageUrl },
          ]),
          faqPageJsonLd(model.faqs)
        )}
      />
      <header className="gv-hero">
        <div className="gv-wrap">
          <div className="gv-hero-kicker">Guide Goovoiture</div>
          <h1 className="gv-hero-title">{model.displayName} au Maroc</h1>
          <div className="gv-hero-rule" />
          <p className="gv-hero-desc">{model.subtitle}</p>
        </div>
      </header>
      <div className="gv-wrap gv-sec">
        <SeoBreadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: brandN, href: brandPath(brandSlug) },
            { label: model.displayName },
          ]}
        />
        <section className="gv-ma-section gv-sec-sm">
          <h2 className="gv-h2 mb-4">Présentation</h2>
          <p className="gv-ma-prose">{model.introduction}</p>
        </section>
        <section className="gv-ma-section gv-sec-sm">
          <h2 className="gv-h2 mb-4">Popularité au Maroc</h2>
          <p className="gv-ma-prose">{model.popularity}</p>
        </section>
        <section className="gv-ma-section gv-sec-sm">
          <h2 className="gv-h2 mb-4">Prix au Maroc</h2>
          <p className="mb-2"><strong>Occasion :</strong> {model.prices.occasion}</p>
          <p><strong>Récent :</strong> {model.prices.recent}</p>
        </section>
        {siblings.length > 0 && (
          <section className="gv-sec-sm">
            <h2 className="gv-h2 mb-4">Autres modèles {brandN}</h2>
            <ul className="flex flex-wrap gap-2">
              {siblings.map((m) => (
                <li key={m.modelSlug}>
                  <Link to={buildSeoPath(lang, modelAuthorityPath(m.brandSlug, m.modelSlug))} className="gv-ma-toc-link">
                    {m.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to={buildSeoPath(lang, `/voiture-occasion/casablanca/${brandSlug}`)} className="gv-btn gv-btn-primary">
            Voir l&apos;occasion
          </Link>
          <Link to={buildSeoPath(lang, `/location-voiture/casablanca/${brandSlug}`)} className="gv-btn gv-btn-outline">
            Voir la location
          </Link>
        </div>
      </div>
    </article>
  );
}
