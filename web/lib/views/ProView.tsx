import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import { InsightCard } from "@/components/ui/GlassCard";
import { EntityGrid } from "@/components/ui/PremiumCTA";
import BadgePill from "@/components/ui/BadgePill";
import { PRO_PAGES, getProPage, proPagePath } from "@client-seo/catalog/proPages";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, softwareApplicationJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

export function proHubMetadata(lang: SeoLang) {
  const title =
    lang === "fr"
      ? "GoVoiture Pro — Logiciel agence location voiture Maroc"
      : lang === "ar"
        ? "GoVoiture Pro — برنامج وكالات تأجير السيارات"
        : "GoVoiture Pro — Rental agency software Morocco";
  const description =
    lang === "fr"
      ? "CRM, flotte, réservations, facturation et site web pour agences de location au Maroc."
      : "CRM, fleet, bookings and billing for rental agencies in Morocco.";
  return { basePath: "/pro", title, description, keywords: "logiciel location voiture maroc, gestion flotte, crm agence" };
}

export function proPageMetadata(lang: SeoLang, pageSlug: string) {
  const page = getProPage(pageSlug);
  if (!page) return null;
  return {
    basePath: proPagePath(pageSlug),
    title: `${page.title[lang] || page.title.fr} | GoVoiture Pro`,
    description: page.description[lang] || page.description.fr,
    keywords: page.keyword?.[lang] || page.keyword?.fr,
  };
}

export function ProHubView({ lang }: { lang: SeoLang }) {
  const siteUrl = getSiteUrl();

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: "Pro", href: undefined }]}
      hero={{
        kicker: "GoVoiture Pro",
        title: "GoVoiture Pro",
        description:
          lang === "fr"
            ? "L'écosystème B2B pour dominer la location automobile au Maroc : flotte, CRM, contrats, facturation et SEO."
            : "The B2B ecosystem for rental agencies in Morocco.",
      }}
      cta={{
        title: lang === "fr" ? "Démarrer avec GoVoiture Pro" : "Get started with GoVoiture Pro",
        primaryHref: "/register",
        primaryLabel: lang === "fr" ? "Demander une démo" : "Request a demo",
        secondaryHref: buildSeoPath(lang, "/agences"),
        secondaryLabel: lang === "fr" ? "Voir les agences" : "Browse agencies",
      }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            softwareApplicationJsonLd({
              name: "GoVoiture Pro",
              description: "Suite SaaS pour agences de location automobile au Maroc",
              url: `${siteUrl}/pro`,
            }),
            breadcrumbJsonLd([
              { name: "GoVoiture", url: siteUrl },
              { name: "Pro", url: `${siteUrl}${buildSeoPath(lang, "/pro")}` },
            ])
          )}
        />
      }
    >
      <section className="gv-sec-sm">
        <SectionHeader
          eyebrow="Modules"
          title={lang === "fr" ? "Suite complète pour agences" : "Complete agency suite"}
        />
        <EntityGrid cols={2}>
          {PRO_PAGES.map((p: { slug: string; title: Record<string, string>; description: Record<string, string>; price: number | null }) => (
            <InsightCard
              key={p.slug}
              title={p.title[lang] || p.title.fr}
              body={p.description[lang] || p.description.fr}
              href={buildSeoPath(lang, proPagePath(p.slug))}
              badge={<BadgePill variant="brand">Pro</BadgePill>}
              footer={
                p.price ? (
                  <span className="text-[var(--gv-brand)] font-semibold">
                    {lang === "fr" ? `à partir de ${p.price} MAD/mois` : `from ${p.price} MAD/month`}
                  </span>
                ) : undefined
              }
            />
          ))}
        </EntityGrid>
      </section>
    </SeoPageShell>
  );
}

export function ProPageView({ lang, pageSlug }: { lang: SeoLang; pageSlug: string }) {
  const page = getProPage(pageSlug);
  if (!page) return null;
  const siteUrl = getSiteUrl();
  const path = proPagePath(pageSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;
  const title = page.title[lang] || page.title.fr;

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Pro", href: "/pro" },
        { label: title, href: undefined },
      ]}
      hero={{
        kicker: "GoVoiture Pro",
        title,
        description: page.description[lang] || page.description.fr,
        badges: page.price ? [`à partir de ${page.price} MAD/mois`] : undefined,
      }}
      cta={{
        title: lang === "fr" ? "Prêt à transformer votre agence ?" : "Ready to transform your agency?",
        primaryHref: "/register",
        primaryLabel: lang === "fr" ? "Demander une démo" : "Request a demo",
        secondaryHref: buildSeoPath(lang, "/pro"),
        secondaryLabel: "GoVoiture Pro",
      }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            softwareApplicationJsonLd({
              name: `GoVoiture Pro — ${title}`,
              description: page.description[lang] || page.description.fr,
              url: pageUrl,
            }),
            breadcrumbJsonLd([
              { name: "GoVoiture", url: siteUrl },
              { name: "Pro", url: `${siteUrl}${buildSeoPath(lang, "/pro")}` },
              { name: title, url: pageUrl },
            ])
          )}
        />
      }
    >
      <div className="gv-card gv-card-static p-6 md:p-8 max-w-2xl">
        <p className="text-[var(--gv-ink2)] leading-relaxed mb-6">
          {page.description[lang] || page.description.fr}
        </p>
        {page.price ? (
          <p className="text-2xl font-bold text-[var(--gv-brand)] font-[family-name:var(--gv-disp)] mb-6">
            {lang === "fr" ? `à partir de ${page.price} MAD/mois` : `from ${page.price} MAD/month`}
          </p>
        ) : null}
        <a href="/register" className="gv-btn gv-btn-primary">
          {lang === "fr" ? "Demander une démo →" : "Request a demo →"}
        </a>
      </div>
    </SeoPageShell>
  );
}
