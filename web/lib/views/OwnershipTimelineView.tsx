import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import FaqSection from "@/components/ssr/FaqSection";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
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
    title: "Guides possession auto Maroc — timelines GoVoiture",
    description: "Achat, vente, transfert carte grise, assurance — étapes et délais réalistes au Maroc.",
    keywords: "possession voiture maroc, timeline achat voiture maroc",
  };
}

export function ownershipTimelineMetadata(lang: SeoLang, topicSlug: string) {
  const t = getOwnershipTimeline(topicSlug);
  if (!t) return null;
  return {
    basePath: ownershipTimelinePath(topicSlug),
    title: `${t.title} | GoVoiture`,
    description: t.description,
    keywords: `possession auto maroc ${topicSlug.replace(/-/g, " ")}`,
  };
}

export async function OwnershipHubView({ lang }: { lang: SeoLang }) {
  const timelines = getAllOwnershipTimelines();

  return (
    <>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs items={[{ label: "Goovoiture", href: "/" }, { label: "Possession", href: undefined }]} lang={lang} />
        <h1 className="text-3xl font-bold mb-4">Guides possession automobile Maroc</h1>
        <p className="text-gray-600 mb-10">Timelines procédurales — étapes, checklists et délais réalistes.</p>
        <ul className="space-y-4">
          {timelines.map((t) => (
            <li key={t!.slug}>
              <a href={buildSeoPath(lang, ownershipTimelinePath(t!.slug))} className="block rounded-xl border p-5 hover:border-violet-300">
                <span className="font-medium">{t!.title}</span>
                <p className="text-sm text-gray-600 mt-1">{t!.description}</p>
                <p className="text-xs text-violet-600 mt-2">{t!.steps.length} étapes · ~{t!.durationWeeks} semaines</p>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SeoFooter lang={lang} />
    </>
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
    <>
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
            { name: "GoVoiture", url: siteUrl },
            { name: "Possession", url: `${siteUrl}${buildSeoPath(lang, ownershipHubPath())}` },
            { name: t.title, url: pageUrl },
          ]),
          faqPageJsonLd(t.faqs)
        )}
      />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Possession", href: ownershipHubPath() },
            { label: t.title, href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-gray-600 mb-10">{t.description}</p>

        <ol className="relative border-l-2 border-violet-200 ml-4 space-y-8 mb-12">
          {t.steps.map((s, i) => (
            <li key={i} className="ml-6">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-xs">{i + 1}</span>
              <h2 className="font-semibold text-lg">{s.title}</h2>
              {"week" in s && s.week ? <p className="text-xs text-violet-600 mb-1">Semaine {s.week}</p> : null}
              {"day" in s && s.day ? <p className="text-xs text-violet-600 mb-1">Jour {s.day}</p> : null}
              <p className="text-gray-600 text-sm mt-1">{s.body}</p>
              {s.checklist?.length ? (
                <ul className="mt-2 text-sm list-disc pl-4 text-gray-700">
                  {s.checklist.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>

        {t.relatedLinks?.length ? (
          <section className="mb-10">
            <h2 className="font-semibold mb-3">Liens utiles</h2>
            <ul className="flex flex-wrap gap-2 text-sm">
              {t.relatedLinks.map((l) => (
                <li key={l.path}>
                  <a href={buildSeoPath(lang, l.path)} className="px-3 py-1 rounded-full bg-gray-100 hover:bg-violet-100">{l.label}</a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <FaqSection faqs={t.faqs} />
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
