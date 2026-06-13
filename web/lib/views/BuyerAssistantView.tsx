import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import { CalculatorCard } from "@/components/ui/GlassCard";
import { RelatedLinksSection } from "@/components/ui/PremiumCTA";
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
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: "Assistant achat", href: undefined }]}
      hero={{
        kicker: "GoVoiture Outils",
        title: "Assistant achat GoVoiture",
        description: "Répondez à 4 questions — nous croisons budget, usage et priorités avec nos indices propriétaires (prix, fiabilité, TCO).",
      }}
      cta={{
        title: "Parcourir le marketplace",
        description: "Annonces occasion et location vérifiées au Maroc.",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      jsonLd={
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
      }
    >
      <CalculatorCard>
        <BuyerAssistantClient />
      </CalculatorCard>

      <p className="text-sm text-[var(--gv-mut)] mt-8">
        Pas un chatbot générique — recommandations basées sur modèles indexés GoVoiture avec données vérifiées.
      </p>

      <RelatedLinksSection
        links={[
          { label: "Questions communauté", href: buildSeoPath(lang, "/questions") },
          { label: "Timeline achat", href: buildSeoPath(lang, "/possession/achat-voiture-occasion") },
        ]}
      />
    </SeoPageShell>
  );
}
