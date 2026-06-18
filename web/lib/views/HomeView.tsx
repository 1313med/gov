import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import { InsightCard } from "@/components/ui/GlassCard";
import { EntityGrid, RelatedLinksSection } from "@/components/ui/PremiumCTA";
import BadgePill from "@/components/ui/BadgePill";
import { buildSeoPath } from "@client-seo/seoPaths";
import { getSeoForPath } from "@client-seo/seoLocales";
import { defaultFaqs } from "@client-seo/programmaticSeo";
import { MOROCCO_CITIES } from "@client-seo/catalog/cities";
import { graphJsonLd, organizationJsonLd, webSiteJsonLd, faqPageJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

export function homeMetadata(lang: SeoLang) {
  const seo = getSeoForPath(buildSeoPath(lang, "/"));
  if (!seo) return homeMetadataFallback(lang);
  return {
    basePath: "/",
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
  };
}

function homeMetadataFallback(lang: SeoLang) {
  if (lang === "en") {
    return {
      basePath: "/",
      title: "Goovoiture — Car rental & used cars Morocco",
      description: "Morocco's automotive platform: rent, buy, sell and manage vehicles with Goovoiture.",
      keywords: "car rental morocco, used cars morocco, Goovoiture",
    };
  }
  if (lang === "ar") {
    return {
      basePath: "/",
      title: "Goovoiture — كراء وبيع السيارات في المغرب",
      description: "منصة السيارات في المغرب: كراء، بيع، شراء وإدارة المركبات.",
      keywords: "كراء سيارات المغرب, سيارات مستعملة",
    };
  }
  return {
    basePath: "/",
    title: "Goovoiture — Location de voiture & vente auto au Maroc",
    description:
      "Louez ou achetez une voiture au Maroc. Location, voitures d'occasion et annonces vérifiées à Casablanca, Rabat, Marrakech et partout au Maroc.",
    keywords: "location voiture maroc, voiture occasion maroc, Goovoiture",
  };
}

export default function HomeView({ lang }: { lang: SeoLang }) {
  const siteUrl = getSiteUrl();
  const seo = getSeoForPath(buildSeoPath(lang, "/")) || {
    h1: homeMetadata(lang).title,
    intro: homeMetadata(lang).description,
    description: homeMetadata(lang).description,
  };
  const faqs = defaultFaqs(lang, { cityName: lang === "fr" ? "Maroc" : lang === "ar" ? "المغرب" : "Morocco", intent: "rental" });

  const hubs = [
    {
      title: lang === "fr" ? "Location voiture" : lang === "ar" ? "كراء السيارات" : "Car rental",
      body: lang === "fr" ? "45 villes & aéroports" : "45 cities & airports",
      href: buildSeoPath(lang, "/location-voiture"),
      badge: "Location",
    },
    {
      title: lang === "fr" ? "Voiture occasion" : lang === "ar" ? "سيارات مستعملة" : "Used cars",
      body: lang === "fr" ? "Acheter & vendre" : "Buy & sell",
      href: buildSeoPath(lang, "/voiture-occasion"),
      badge: "Occasion",
    },
    {
      title: "Goovoiture Pro",
      body: lang === "fr" ? "SaaS pour agences" : "Agency software",
      href: buildSeoPath(lang, "/pro"),
      badge: "Pro",
    },
    {
      title: lang === "fr" ? "Guides & blog" : "Guides",
      body: lang === "fr" ? "Conseils auto Maroc" : "Automotive guides",
      href: buildSeoPath(lang, "/blog"),
      badge: "Guides",
    },
  ];

  const cityRentalLinks = MOROCCO_CITIES.slice(0, 8).map((c) => ({
    label: `${lang === "fr" ? "Location" : "Rental"} ${c.name[lang] || c.name.fr}`,
    href: buildSeoPath(lang, `/location-voiture/${c.slug}`),
  }));

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: undefined }]}
      hero={{
        kicker: "Goovoiture",
        title: seo.h1 || "Goovoiture",
        description: seo.intro || seo.description,
      }}
      faqs={faqs}
      cta={{
        title: lang === "fr" ? "Explorer le marketplace" : "Explore the marketplace",
        primaryHref: buildSeoPath(lang, "/location-voiture"),
        primaryLabel: lang === "fr" ? "Location voiture" : "Car rental",
        secondaryHref: buildSeoPath(lang, "/voiture-occasion"),
        secondaryLabel: lang === "fr" ? "Voiture occasion" : "Used cars",
      }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            organizationJsonLd(siteUrl),
            webSiteJsonLd(siteUrl),
            faqPageJsonLd(faqs),
            breadcrumbJsonLd([{ name: "Goovoiture", url: siteUrl }])
          )}
        />
      }
    >
      <section className="gv-sec-sm">
        <p className="text-[var(--gv-ink2)] leading-relaxed max-w-3xl">{seo.intro}</p>
      </section>
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
      <RelatedLinksSection
        title={lang === "fr" ? "Location par ville" : "Rental by city"}
        links={cityRentalLinks}
      />
    </SeoPageShell>
  );
}
