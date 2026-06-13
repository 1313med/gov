import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchQuestions } from "@/lib/api";
import SeoPageShell from "@/components/layout/SeoPageShell";
import JsonLd from "@/components/ssr/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import { QuestionCard } from "@/components/ui/VehicleCard";
import BadgePill from "@/components/ui/BadgePill";
import { getAllQuestionSeeds, getQuestionSeed, questionPath, questionsHubPath } from "@client-seo/catalog/questionSeeds";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, qaPageJsonLd, breadcrumbJsonLd } from "@client-seo/jsonLd";

export function questionsHubMetadata(lang: SeoLang) {
  return {
    basePath: questionsHubPath(),
    title: "Questions auto Maroc — communauté GoVoiture",
    description: "Assurance, crédit, démarches, prix — réponses vérifiées sur le marché automobile marocain.",
    keywords: "questions voiture maroc, forum auto maroc",
  };
}

export function questionMetadata(lang: SeoLang, slug: string) {
  const seed = getQuestionSeed(slug);
  if (!seed) return null;
  return {
    basePath: questionPath(slug),
    title: `${seed.question} | GoVoiture`,
    description: seed.body || seed.question,
    keywords: seed.topic || "auto maroc",
  };
}

function normalizeAnswers(q: {
  answers?: Array<{ body: string; authorName?: string; authorId?: { name?: string }; verifiedExpert?: boolean; accepted?: boolean; upvotes?: number }>;
}) {
  return (q.answers || []).map((a) => ({
    text: a.body,
    authorName: a.authorName || a.authorId?.name || "Membre GoVoiture",
    accepted: a.accepted,
    verifiedExpert: a.verifiedExpert,
    upvotes: a.upvotes || 0,
  }));
}

export async function QuestionsHubView({ lang }: { lang: SeoLang }) {
  const apiQuestions = await fetchQuestions(30);
  const seeds = getAllQuestionSeeds();
  const seen = new Set(seeds.map((s) => s.slug));
  const merged = [...seeds, ...apiQuestions.filter((q) => !seen.has(q.slug))];

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[{ label: "Goovoiture", href: "/" }, { label: "Questions", href: undefined }]}
      hero={{
        kicker: "GoVoiture Communauté",
        title: "Questions & réponses auto Maroc",
        description: "Réponses vérifiées GoVoiture et contributions communauté.",
      }}
      cta={{
        title: "Trouver une voiture",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
    >
      <section className="gv-sec-sm">
        <SectionHeader eyebrow="Forum" title="Questions récentes" />
        <div className="space-y-3">
          {merged.map((q) => (
            <QuestionCard
              key={q.slug}
              question={q.question}
              topic={q.topic}
              answerCount={(q.answers || []).length}
              href={questionPath(q.slug)}
            />
          ))}
        </div>
      </section>
    </SeoPageShell>
  );
}

export async function QuestionDetailView({ lang, slug }: { lang: SeoLang; slug: string }) {
  let q = getQuestionSeed(slug);
  if (!q) {
    const apiQs = await fetchQuestions(50);
    const found = apiQs.find((x) => x.slug === slug);
    if (found) q = found;
  }
  if (!q) notFound();

  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}${questionPath(slug)}`;
  const answers = normalizeAnswers(q);

  return (
    <SeoPageShell
      lang={lang}
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Questions", href: questionsHubPath() },
        { label: q.question.slice(0, 40) + (q.question.length > 40 ? "…" : ""), href: undefined },
      ]}
      hero={{
        kicker: "GoVoiture Communauté",
        title: q.question,
        description: q.body || undefined,
      }}
      cta={{
        title: "Explorer le marketplace",
        primaryHref: buildSeoPath(lang, "/voiture-occasion"),
        primaryLabel: "Voiture occasion",
        secondaryHref: buildSeoPath(lang, "/location-voiture"),
        secondaryLabel: "Location voiture",
      }}
      jsonLd={
        <JsonLd
          data={graphJsonLd(
            qaPageJsonLd({ question: q.question, answers, url: pageUrl }),
            breadcrumbJsonLd([
              { name: "GoVoiture", url: siteUrl },
              { name: "Questions", url: `${siteUrl}${questionsHubPath()}` },
              { name: q.question, url: pageUrl },
            ])
          )}
        />
      }
    >
      <section className="space-y-4 mb-10">
        {answers.map((a, i) => (
          <div key={i} className={`gv-card p-5 ${a.accepted ? "ring-2 ring-[var(--gv-brand)]" : ""}`}>
            <div className="flex items-center gap-2 mb-2 text-sm flex-wrap">
              <span className="font-medium">{a.authorName}</span>
              {a.verifiedExpert ? <BadgePill variant="success">Expert GoVoiture</BadgePill> : null}
              {a.accepted ? <BadgePill variant="brand">Acceptée</BadgePill> : null}
              {a.upvotes > 0 ? <span className="text-xs text-[var(--gv-mut)] ml-auto">▲ {a.upvotes}</span> : null}
            </div>
            <p className="text-[var(--gv-ink2)]">{a.text}</p>
          </div>
        ))}
      </section>
      <p className="text-sm text-[var(--gv-mut)]">
        Posez votre question sur l&apos;app GoVoiture — réponses alimentées par la communauté et nos experts.
      </p>
    </SeoPageShell>
  );
}
