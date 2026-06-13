import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchReliability } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { getBrandBySlug, modelPath } from "@client-seo/catalog/brands";
import { getVehicleSpec, priceIntelPath } from "@client-seo/catalog/vehicleSpecs";
import {
  getReliabilityIndex,
  getAllReliabilityIndexes,
  reliabilityHubPath,
  reliabilityPath,
  marketIntelPath,
  tcoPath,
} from "@client-seo/catalog/reliabilityIndex";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, breadcrumbJsonLd, faqPageJsonLd, aggregateRatingJsonLd } from "@client-seo/jsonLd";

function modelApiName(modelSlug: string) {
  return modelSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function reliabilityHubMetadata(lang: SeoLang) {
  return {
    basePath: reliabilityHubPath(),
    title: "Indice fiabilité voiture Maroc — GoVoiture",
    description: "Scores fiabilité, pièces détachées et revente — 15 modèles vérifiés au Maroc.",
    keywords: "fiabilité voiture maroc, indice fiabilité auto",
  };
}

export function reliabilityMetadata(lang: SeoLang, brandSlug: string, modelSlug: string) {
  const rel = getReliabilityIndex(brandSlug, modelSlug);
  if (!rel) return null;
  return {
    basePath: reliabilityPath(brandSlug, modelSlug),
    title: `Fiabilité ${rel.displayName} Maroc — indice GoVoiture ${rel.score}/100`,
    description: `${rel.moroccoVerdict} Score ${rel.score}/100 · grade ${rel.grade}.`,
    keywords: `fiabilité ${rel.displayName} maroc, panne ${rel.displayName}`,
  };
}

export async function ReliabilityHubView({ lang }: { lang: SeoLang }) {
  const models = getAllReliabilityIndexes();
  const siteUrl = getSiteUrl();

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs items={[{ label: "Goovoiture", href: "/" }, { label: "Fiabilité", href: undefined }]} lang={lang} />
        <h1 className="text-3xl font-bold mb-4">Indice fiabilité GoVoiture</h1>
        <p className="text-gray-600 mb-10">Scores curatés + données communauté — uniquement modèles avec fiche technique vérifiée.</p>
        <ul className="space-y-3">
          {models.map((m) => (
            <li key={`${m!.brandSlug}:${m!.modelSlug}`}>
              <a href={buildSeoPath(lang, reliabilityPath(m!.brandSlug, m!.modelSlug))} className="flex items-center justify-between rounded-xl border p-4 hover:border-violet-300">
                <span className="font-medium capitalize">{m!.displayName}</span>
                <span className={`text-lg font-bold ${m!.score >= 85 ? "text-green-600" : m!.score >= 70 ? "text-amber-600" : "text-red-600"}`}>
                  {m!.score}/100 · {m!.grade}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}

export default async function ReliabilityModelView({
  lang,
  brandSlug,
  modelSlug,
}: {
  lang: SeoLang;
  brandSlug: string;
  modelSlug: string;
}) {
  const curated = getReliabilityIndex(brandSlug, modelSlug);
  if (!curated) notFound();

  const brand = getBrandBySlug(brandSlug)!;
  const brandName = brand.name[lang] || brand.name.fr;
  const apiModel = modelApiName(modelSlug);
  const live = await fetchReliability(brandName, apiModel);
  const score = live?.score ?? curated.score;
  const grade = live?.grade ?? curated.grade;

  const siteUrl = getSiteUrl();
  const path = reliabilityPath(brandSlug, modelSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          aggregateRatingJsonLd({
            itemReviewed: curated.displayName,
            ratingValue: Math.round(score / 20 * 10) / 10,
            reviewCount: live?.reviewSampleSize || curated.strengths.length + 5,
          }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Fiabilité", url: `${siteUrl}${buildSeoPath(lang, reliabilityHubPath())}` },
            { name: curated.displayName, url: pageUrl },
          ]),
          faqPageJsonLd(curated.faqs)
        )}
      />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Fiabilité", href: reliabilityHubPath() },
            { label: curated.displayName, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-2">Fiabilité {curated.displayName}</h1>
        <div className="flex items-baseline gap-4 mb-4">
          <span className="text-5xl font-bold text-green-600">{score}</span>
          <span className="text-2xl text-gray-500">/100 · Grade {grade}</span>
        </div>
        <p className="text-gray-600 mb-8">{curated.moroccoVerdict}</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="rounded-xl border p-4">
            <h2 className="font-semibold text-green-700 mb-2">Points forts</h2>
            <ul className="text-sm space-y-1 list-disc pl-4">
              {curated.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border p-4">
            <h2 className="font-semibold text-amber-700 mb-2">Points de vigilance</h2>
            <ul className="text-sm space-y-1 list-disc pl-4">
              {curated.weaknesses.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 mb-10 text-center">
          <div className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">Revente</dt><dd className="text-2xl font-bold">{curated.resaleIndex}/100</dd></div>
          <div className="rounded-xl bg-gray-50 p-4"><dt className="text-sm text-gray-500">Pièces détachées</dt><dd className="text-2xl font-bold">{curated.partsAvailability}/100</dd></div>
        </dl>

        {live?.commonIssues?.length ? (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3">Retours communauté</h2>
            <ul className="space-y-2 text-sm">
              {live.commonIssues.map((i, idx) => (
                <li key={idx} className="border-l-4 border-amber-400 pl-3">{i.title} — {i.body}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {live?.maintenanceTips?.length ? (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-3">Entretien recommandé</h2>
            <ul className="space-y-2 text-sm">
              {live.maintenanceTips.slice(0, 5).map((t, idx) => (
                <li key={idx} className="border-l-4 border-green-400 pl-3">{t.title} — {t.body}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-10 flex flex-wrap gap-3 text-sm">
          <a href={buildSeoPath(lang, marketIntelPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-violet-100">Intelligence marché</a>
          <a href={buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-gray-100">Indice prix</a>
          <a href={buildSeoPath(lang, tcoPath(brandSlug, modelSlug))} className="px-3 py-1 rounded-full bg-gray-100">Coût possession</a>
          <a href={buildSeoPath(lang, modelPath(brandSlug, modelSlug))} className="text-violet-600 hover:underline">Annonces</a>
        </section>

        <FaqSection faqs={curated.faqs} />
        <p className="text-xs text-gray-400 mt-6">{live?.methodology || "Score composite GoVoiture : communauté, avis annonces, données curatées Maroc."}</p>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
