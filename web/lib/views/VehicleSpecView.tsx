import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { brandPath, modelPath } from "@client-seo/catalog/brands";
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

  return (
    <>
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
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Fiche technique", href: vehicleSpecPath("dacia", "logan") },
            { label: spec.displayName, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-4">Fiche technique {spec.displayName}</h1>
        <p className="text-gray-600 mb-8">{spec.moroccoNotes}</p>

        <table className="w-full text-sm border-collapse mb-10">
          <tbody>
            {specs.map(([label, value]) => (
              <tr key={label} className="border-b">
                <th className="text-left py-3 pr-4 font-medium w-1/3">{label}</th>
                <td className="py-3 text-gray-700">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <section className="mb-10 flex flex-wrap gap-3 text-sm">
          <a href={buildSeoPath(lang, priceIntelPath(brandSlug, modelSlug))} className="px-4 py-2 bg-violet-600 text-white rounded-lg">Indice prix live</a>
          <a href={buildSeoPath(lang, modelPath(brandSlug, modelSlug))} className="text-violet-600 hover:underline">Annonces</a>
          <a href={buildSeoPath(lang, brandPath(brandSlug))} className="text-violet-600 hover:underline">Marque {spec.brandName}</a>
        </section>

        <FaqSection faqs={spec.faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
