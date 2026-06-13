import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import { InsightCard } from "@/components/ui/GlassCard";
import { RelatedLinksSection } from "@/components/ui/PremiumCTA";
import { TimelineCard } from "@/components/ui/VehicleCard";
import BadgePill from "@/components/ui/BadgePill";
import {
  getOwnershipTimeline,
  getAllOwnershipTimelines,
  ownershipHubPath,
  ownershipTimelinePath,
} from "@client-seo/catalog/ownershipTimelines";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, breadcrumbJsonLd, howToJsonLd, faqPageJsonLd } from "@client-seo/jsonLd";

export function ownershipHubMetadata(lang: SeoLang) {
  return {
    basePath: ownershipHubPath(),
    title: "Guides possession auto Maroc — timelines Goovoiture",
    description: "Achat, vente, transfert carte grise, assurance — étapes et délais réalistes au Maroc.",
    keywords: "possession voiture maroc, timeline achat voiture maroc",
  };
}

export function ownershipTimelineMetadata(lang: SeoLang, topicSlug: string) {
  const t = getOwnershipTimeline(topicSlug);
  if (!t) return null;
  return {
    basePath: ownershipTimelinePath(topicSlug),
    title: `${t.title} | Goovoiture`,
    description: t.description,
    keywords: `possession auto maroc ${topicSlug.replace(/-/g, " ")}`,
  };
}

export async function OwnershipHubView({ lang }: { lang: SeoLang }) {
  const timelines = getAllOwnershipTimelines();

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: "Possession", href: undefined }]}
      hero={{
        kicker: "Goovoiture Guides",
        title: "Guides possession automobile Maroc",
        description: "Timelines procédurales — étapes, checklists et délais réalistes.",
      }}
      cta={{
        title: "Trouver votre prochaine voiture",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
    >
      <section className="gv-sec-sm">
        <SectionHeader eyebrow="Timelines" title="Guides par sujet" />
        <div className="space-y-4">
          {timelines.map((t) => (
            <InsightCard
              key={t!.slug}
              title={t!.title}
              body={t!.description}
              href={buildSeoPath(lang, ownershipTimelinePath(t!.slug))}
              footer={
                <span className="text-xs text-[var(--gv-brand)]">
                  {t!.steps.length} étapes · ~{t!.durationWeeks} semaines
                </span>
              }
              badge={<BadgePill variant="brand">Guide</BadgePill>}
            />
          ))}
        </div>
      </section>
    </SeoPageShell>
  );
}

export default function OwnershipTimelineDetailView({
  lang,
  topicSlug,
}: {
  lang: SeoLang;
  topicSlug: string;
}) {
  const t = getOwnershipTimeline(topicSlug);
  if (!t) notFound();

  const siteUrl = getSiteUrl();
  const path = ownershipTimelinePath(topicSlug);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Possession", href: ownershipHubPath() },
        { label: t.title, href: undefined },
      ]}
      hero={{
        kicker: "Goovoiture Guides",
        title: t.title,
        description: t.description,
      }}
      faqs={t.faqs}
      cta={{
        title: "Prêt à acheter ?",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            howToJsonLd({
              name: t.title,
              description: t.description,
              url: pageUrl,
              totalTime: `P${t.durationWeeks}W`,
              steps: t.steps.map((s) => ({ title: s.title, body: s.body })),
            }),
            breadcrumbJsonLd([
              { name: "Goovoiture", url: siteUrl },
              { name: "Possession", url: `${siteUrl}${buildSeoPath(lang, ownershipHubPath())}` },
              { name: t.title, url: pageUrl },
            ]),
            faqPageJsonLd(t.faqs)
          )}
        />
      }
    >
      <ol className="gv-timeline ml-4 space-y-8 mb-12">
        {t.steps.map((s, i) => (
          <li key={i}>
            <TimelineCard
              index={i + 1}
              title={s.title}
              body={s.body}
              when={"week" in s && s.week ? `Semaine ${s.week}` : "day" in s && s.day ? `Jour ${s.day}` : undefined}
              checklist={s.checklist}
            />
          </li>
        ))}
      </ol>

      {t.relatedLinks?.length ? (
        <RelatedLinksSection
          title="Liens utiles"
          links={t.relatedLinks.map((l) => ({
            label: l.label,
            href: buildSeoPath(lang, l.path),
          }))}
        />
      ) : null}
    </SeoPageShell>
  );
}
