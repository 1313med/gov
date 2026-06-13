import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { getComparisonBySlug } from "@client-seo/catalog/comparisons";
import { buildSeoPath } from "@client-seo/seoPaths";
import { cityBrandRentalPath, cityBrandSalePath, brandPath, modelPath } from "@client-seo/catalog/brands";
import { graphJsonLd, articleJsonLd, faqPageJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

export function comparisonMetadata(lang: SeoLang, slug: string) {
  const data = getComparisonBySlug(slug);
  if (!data) return null;
  return { basePath: data.path, title: data.title, description: data.description, keywords: `${data.nameA} vs ${data.nameB}` };
}

export default function ComparisonView({ lang, slug }: { lang: SeoLang; slug: string }) {
  const data = getComparisonBySlug(slug);
  if (!data) notFound();

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, data.path)}`;

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          articleJsonLd({
            headline: data.h1,
            description: data.description,
            url: pageUrl,
            datePublished: "2026-01-01",
          }),
          faqPageJsonLd(data.faqs),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Comparatifs", url: `${siteUrl}${buildSeoPath(lang, "/comparer")}` },
            { name: data.h1, url: pageUrl },
          ])
        )}
      />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Comparatifs", href: "/comparer" },
            { label: data.h1, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-4">{data.h1}</h1>
        <p className="text-gray-600 mb-8">{data.intro}</p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <section className="rounded-xl border p-5">
            <h2 className="font-semibold text-lg mb-3">{data.nameA}</h2>
            <h3 className="text-sm font-medium text-green-700 mb-2">Points forts</h3>
            <ul className="list-disc pl-5 text-sm mb-3">
              {data.strengthsA.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <h3 className="text-sm font-medium text-amber-700 mb-2">Points faibles</h3>
            <ul className="list-disc pl-5 text-sm">
              {data.weaknessesA.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <a href={buildSeoPath(lang, modelPath(data.brandA, data.modelA))} className="text-violet-600">
                Voir {data.nameA} →
              </a>
            </p>
          </section>
          <section className="rounded-xl border p-5">
            <h2 className="font-semibold text-lg mb-3">{data.nameB}</h2>
            <h3 className="text-sm font-medium text-green-700 mb-2">Points forts</h3>
            <ul className="list-disc pl-5 text-sm mb-3">
              {data.strengthsB.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <h3 className="text-sm font-medium text-amber-700 mb-2">Points faibles</h3>
            <ul className="list-disc pl-5 text-sm">
              {data.weaknessesB.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              <a href={buildSeoPath(lang, modelPath(data.brandB, data.modelB))} className="text-violet-600">
                Voir {data.nameB} →
              </a>
            </p>
          </section>
        </div>

        <section className="mb-10 overflow-x-auto">
          <h2 className="font-semibold mb-3">Tableau comparatif</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Critère</th>
                <th className="text-left py-2 pr-4">{data.nameA}</th>
                <th className="text-left py-2">{data.nameB}</th>
              </tr>
            </thead>
            <tbody>
              {data.specs.map((row) => (
                <tr key={row.label} className="border-b">
                  <td className="py-2 pr-4 font-medium">{row.label}</td>
                  <td className="py-2 pr-4">{row.a}</td>
                  <td className="py-2">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-10 text-sm">
          <h2 className="font-semibold mb-3">Annonces liées</h2>
          <ul className="space-y-1">
            <li>
              <a href={buildSeoPath(lang, cityBrandRentalPath("casablanca", data.brandA))} className="text-violet-600">
                Location {data.nameA} Casablanca
              </a>
            </li>
            <li>
              <a href={buildSeoPath(lang, cityBrandSalePath("casablanca", data.brandB))} className="text-violet-600">
                Occasion {data.nameB} Casablanca
              </a>
            </li>
            <li>
              <a href={buildSeoPath(lang, brandPath(data.brandA))} className="text-violet-600">
                Hub {data.brandA}
              </a>
            </li>
          </ul>
        </section>

        <FaqSection faqs={data.faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
