import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchQuestions } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
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
    <>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Breadcrumbs items={[{ label: "Goovoiture", href: "/" }, { label: "Questions", href: undefined }]} lang={lang} />
        <h1 className="text-3xl font-bold mb-4">Questions & réponses auto Maroc</h1>
        <p className="text-gray-600 mb-10">Réponses vérifiées GoVoiture et contributions communauté.</p>
        <ul className="space-y-4">
          {merged.map((q) => (
            <li key={q.slug}>
              <a href={questionPath(q.slug)} className="block rounded-xl border p-4 hover:border-violet-300">
                <span className="font-medium">{q.question}</span>
                {q.topic ? <span className="ml-2 text-xs text-violet-600 uppercase">{q.topic}</span> : null}
                <p className="text-sm text-gray-500 mt-1">{(q.answers || []).length} réponse(s)</p>
              </a>
            </li>
          ))}
        </ul>
      </main>
      <SeoFooter lang={lang} />
    </>
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
    <>
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
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Questions", href: questionsHubPath() },
            { label: q.question.slice(0, 40) + (q.question.length > 40 ? "…" : ""), href: undefined },
          ]}
          lang={lang}
        />
        <h1 className="text-2xl font-bold mb-4">{q.question}</h1>
        {q.body ? <p className="text-gray-600 mb-8">{q.body}</p> : null}
        <section className="space-y-4 mb-10">
          {answers.map((a, i) => (
            <div key={i} className={`rounded-xl border p-4 ${a.accepted ? "border-violet-300 bg-violet-50/50" : ""}`}>
              <div className="flex items-center gap-2 mb-2 text-sm">
                <span className="font-medium">{a.authorName}</span>
                {a.verifiedExpert ? <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">✓ Expert GoVoiture</span> : null}
                {a.accepted ? <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded">✓ Acceptée</span> : null}
                {a.upvotes > 0 ? <span className="text-xs text-gray-500 ml-auto">▲ {a.upvotes}</span> : null}
              </div>
              <p className="text-gray-700">{a.text}</p>
            </div>
          ))}
        </section>
        <p className="text-sm text-gray-500">
          Posez votre question sur l&apos;app GoVoiture — réponses alimentées par la communauté et nos experts.
        </p>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
