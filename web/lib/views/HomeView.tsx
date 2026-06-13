import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import { InsightCard } from "@/components/ui/GlassCard";
import { EntityGrid } from "@/components/ui/PremiumCTA";
import BadgePill from "@/components/ui/BadgePill";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, organizationJsonLd, webSiteJsonLd } from "@client-seo/jsonLd";

export function homeMetadata(lang: SeoLang) {
  if (lang === "en") {
    return {
      basePath: "/",
      title: "GoVoiture — Car rental & used cars Morocco",
      description: "Morocco's automotive ecosystem: rent, buy, sell and manage your fleet with GoVoiture Pro.",
      keywords: "car rental morocco, used cars morocco, goovoiture",
    };
  }
  if (lang === "ar") {
    return {
      basePath: "/",
      title: "GoVoiture — كراء وبيع السيارات في المغرب",
      description: "منصة السيارات في المغرب: كراء، بيع، شراء وإدارة الأسطول.",
      keywords: "كراء سيارات المغرب, سيارات مستعملة",
    };
  }
  return {
    basePath: "/",
    title: "GoVoiture — Location, occasion & écosystème auto Maroc",
    description:
      "Location de voiture, voitures d'occasion, concessionnaires et GoVoiture Pro — la plateforme automobile de référence au Maroc.",
    keywords: "location voiture maroc, voiture occasion maroc, goovoiture pro",
  };
}

export default function HomeView({ lang }: { lang: SeoLang }) {
  const siteUrl = getSiteUrl();
  const meta = homeMetadata(lang);

  const hubs = [
    {
      title: lang === "fr" ? "Location voiture" : "Car rental",
      body: "45 villes & aéroports",
      href: buildSeoPath(lang, "/location-voiture"),
      badge: "Location",
    },
    {
      title: lang === "fr" ? "Voiture occasion" : "Used cars",
      body: lang === "fr" ? "Acheter & vendre" : "Buy & sell",
      href: buildSeoPath(lang, "/voiture-occasion"),
      badge: "Occasion",
    },
    {
      title: "GoVoiture Pro",
      body: "SaaS agences",
      href: buildSeoPath(lang, "/pro"),
      badge: "Pro",
    },
    {
      title: "Blog",
      body: lang === "fr" ? "Guides & conseils" : "Guides",
      href: buildSeoPath(lang, "/blog"),
      badge: "Guides",
    },
  ];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: undefined }]}
      hero={{
        kicker: "GoVoiture",
        title: meta.title.split("—")[0].trim(),
        description: meta.description,
      }}
      cta={{
        title: lang === "fr" ? "Explorer le marketplace" : "Explore the marketplace",
        primaryHref: buildSeoPath(lang, "/location-voiture"),
        primaryLabel: lang === "fr" ? "Location voiture" : "Car rental",
        secondaryHref: buildSeoPath(lang, "/voiture-occasion"),
        secondaryLabel: lang === "fr" ? "Voiture occasion" : "Used cars",
      }}
      jsonLd={<JsonLd data={graphJsonLd(organizationJsonLd(siteUrl), webSiteJsonLd(siteUrl))} />}
    >
      <EntityGrid cols={4}>
        {hubs.map((h) => (
          <InsightCard
            key={h.href}
            title={h.title}
            body={h.body}
            href={h.href}
            badge={<BadgePill variant="brand">{h.badge}</BadgePill>}
          />
        ))}
      </EntityGrid>
    </SeoPageShell>
  );
}
