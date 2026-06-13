import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import { ComparisonCard } from "@/components/ui/VehicleCard";
import { ChartContainer, RelatedLinksSection } from "@/components/ui/PremiumCTA";
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

  const listingLinks = [
    { label: `Location ${data.nameA} Casablanca`, href: buildSeoPath(lang, cityBrandRentalPath("casablanca", data.brandA)) },
    { label: `Occasion ${data.nameB} Casablanca`, href: buildSeoPath(lang, cityBrandSalePath("casablanca", data.brandB)) },
    { label: `Hub ${data.brandA}`, href: buildSeoPath(lang, brandPath(data.brandA)) },
  ];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Comparatifs", href: "/comparer" },
        { label: data.h1, href: undefined },
      ]}
      hero={{
        kicker: "GoVoiture Comparatifs",
        title: data.h1,
        description: data.intro,
      }}
      faqs={data.faqs}
      cta={{
        title: "Trouver votre prochaine voiture",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      jsonLd={
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
      }
    >
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <ComparisonCard
          name={data.nameA}
          strengths={data.strengthsA}
          weaknesses={data.weaknessesA}
          href={buildSeoPath(lang, modelPath(data.brandA, data.modelA))}
          side="a"
        />
        <ComparisonCard
          name={data.nameB}
          strengths={data.strengthsB}
          weaknesses={data.weaknessesB}
          href={buildSeoPath(lang, modelPath(data.brandB, data.modelB))}
          side="b"
        />
      </div>

      <ChartContainer title="Tableau comparatif">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--gv-bdr)]">
                <th className="text-left py-2 pr-4">Critère</th>
                <th className="text-left py-2 pr-4">{data.nameA}</th>
                <th className="text-left py-2">{data.nameB}</th>
              </tr>
            </thead>
            <tbody>
              {data.specs.map((row) => (
                <tr key={row.label} className="border-b border-[var(--gv-bdr)]">
                  <td className="py-2 pr-4 font-medium">{row.label}</td>
                  <td className="py-2 pr-4">{row.a}</td>
                  <td className="py-2">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartContainer>

      <RelatedLinksSection title="Annonces liées" links={listingLinks} />
    </SeoPageShell>
  );
}
