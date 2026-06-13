import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import { ChartContainer, RelatedLinksSection } from "@/components/ui/PremiumCTA";
import { getBrandBySlug, brandPath, modelPath } from "@client-seo/catalog/brands";
import { getVehicleSpec, priceIntelPath, vehicleSpecPath } from "@client-seo/catalog/vehicleSpecs";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, carJsonLd, breadcrumbJsonLd, faqPageJsonLd } from "@client-seo/jsonLd";

export function vehicleSpecMetadata(lang: SeoLang, brandSlug: string, modelSlug: string) {
  const spec = getVehicleSpec(brandSlug, modelSlug);
  if (!spec) return null;
  return {
    basePath: vehicleSpecPath(brandSlug, modelSlug),
    title: `Fiche technique ${spec.displayName} — encyclopédie GoVoiture`,
    description: `${spec.displayName} : motorisation, consommation, coffre, sécurité — guide technique Maroc.`,
    keywords: `fiche technique ${spec.displayName}, specs ${spec.brandName} ${spec.modelName}`,
  };
}

export default function VehicleSpecView({
  lang,
  brandSlug,
  modelSlug,
}: {
  lang: SeoLang;
  brandSlug: string;
  modelSlug: string;
}) {
  const spec = getVehicleSpec(brandSlug, modelSlug);
  if (!spec) notFound();

  const brand = getBrandBySlug(brandSlug);
  const brandName = brand?.name[lang] || brand?.name.fr || spec.brandName;

  const siteUrl = getSiteUrl();
  const path = vehicleSpecPath(brandSlug, modelSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  const specs = [
    ["Segment", spec.segment],
    ["Motorisation", spec.engine],
    ["Puissance", spec.power],
    ["Transmission", spec.transmission],
    ["Carburant", spec.fuel],
    ["Consommation", spec.consumption],
    ["Coffre", spec.trunk],
    ["Places", spec.seats ? String(spec.seats) : null],
    ["Sécurité", spec.safety],
  ].filter(([, v]) => v);

  const relatedLinks = [
    { label: "Indice prix live", href: buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug)) },
    { label: "Annonces", href: buildSeoPath(lang, modelPath(brandSlug, modelSlug)) },
    { label: `Marque ${spec.brandName}`, href: buildSeoPath(lang, brandPath(brandSlug)) },
    { label: "Intelligence marché", href: buildSeoPath(lang, `/marche/${brandSlug}/${modelSlug}`) },
    { label: "Fiabilité", href: buildSeoPath(lang, `/fiabilite/${brandSlug}/${modelSlug}`) },
    { label: "Coût possession", href: buildSeoPath(lang, `/cout-possession/${brandSlug}/${modelSlug}`) },
  ];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Fiche technique", href: vehicleSpecPath("dacia", "logan") },
        { label: spec.displayName, href: undefined },
      ]}
      hero={{
        kicker: "GoVoiture Encyclopédie",
        title: `Fiche technique ${spec.displayName}`,
        description: spec.moroccoNotes,
      }}
      faqs={spec.faqs}
      cta={{
        title: `Trouver une ${spec.displayName}`,
        primaryHref: buildSeoPath(lang, modelPath(brandSlug, modelSlug)),
        primaryLabel: "Voir les annonces",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      related={{ brandSlug, brandFilter: brandName }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            carJsonLd({
              name: spec.displayName,
              brand: spec.brandName,
              model: spec.modelName,
              description: spec.moroccoNotes,
              url: pageUrl,
              vehicleEngine: spec.engine,
              fuelType: spec.fuel,
              numberOfSeats: spec.seats,
            }),
            breadcrumbJsonLd([
              { name: "GoVoiture", url: siteUrl },
              { name: "Encyclopédie", url: `${siteUrl}${buildSeoPath(lang, vehicleSpecPath("dacia", "logan"))}` },
              { name: spec.displayName, url: pageUrl },
            ]),
            faqPageJsonLd(spec.faqs)
          )}
        />
      }
    >
      <ChartContainer title="Spécifications">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {specs.map(([label, value]) => (
              <tr key={label} className="border-b border-[var(--gv-bdr)]">
                <th className="text-left py-3 pr-4 font-medium w-1/3">{label}</th>
                <td className="py-3 text-[var(--gv-ink2)]">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </ChartContainer>

      <RelatedLinksSection title="Explorer ce modèle" links={relatedLinks} />
    </SeoPageShell>
  );
}
