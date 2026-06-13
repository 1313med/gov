import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import BuyerAssistantClient from "@/components/client/BuyerAssistantClient";
import { buyerAssistantPath } from "@client-seo/catalog/buyerAssistant";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, breadcrumbJsonLd, softwareApplicationJsonLd } from "@client-seo/jsonLd";

export function buyerAssistantMetadata(lang: SeoLang) {
  return {
    basePath: buyerAssistantPath(),
    title: "Assistant achat voiture Maroc — GoVoiture",
    description: "4 questions → modèles recommandés avec indices prix, fiabilité et TCO — données marketplace Maroc.",
    keywords: "assistant achat voiture maroc, quel voiture acheter maroc",
  };
}

export default function BuyerAssistantView({ lang }: { lang: SeoLang }) {
  const siteUrl = getSiteUrl();
  const path = buyerAssistantPath();
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          softwareApplicationJsonLd({
            name: "Assistant achat GoVoiture",
            description: "Recommandations voiture basées sur budget, usage et priorités — Maroc.",
            url: pageUrl,
          }),
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Assistant achat", url: pageUrl },
          ])
        )}
      />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Breadcrumbs items={[{ label: "Goovoiture", href: "/" }, { label: "Assistant achat", href: undefined }]} lang={lang} />
        <h1 className="text-3xl font-bold mb-2">Assistant achat GoVoiture</h1>
        <p className="text-gray-600 mb-10">
          Répondez à 4 questions — nous croisons budget, usage et priorités avec nos indices propriétaires (prix, fiabilité, TCO).
        </p>
        <BuyerAssistantClient />
        <section className="mt-12 text-sm text-gray-500">
          <p>Pas un chatbot générique — recommandations basées sur modèles indexés GoVoiture avec données vérifiées.</p>
          <p className="mt-2">
            <a href={buildSeoPath(lang, "/questions")} className="text-violet-600 hover:underline">Questions communauté</a>
            {" · "}
            <a href={buildSeoPath(lang, "/possession/achat-voiture-occasion")} className="text-violet-600 hover:underline">Timeline achat</a>
          </p>
        </section>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
