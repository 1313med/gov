import { Link, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SeoHead from "../../components/SeoHead";
import EcosystemPageShell from "../../components/seo/EcosystemPageShell";
import BuyerAssistantWidget from "../../components/seo/BuyerAssistantWidget";
import TcoCalculatorWidget from "../../components/seo/TcoCalculatorWidget";
import { getTcoBenchmark, getAllTcoBenchmarks } from "../../seo/catalog/tcoBenchmarks";
import { getAllComparisons, getComparisonBySlug, buildComparisonHubSeo } from "../../seo/catalog/comparisons";
import { getCluster, getClusterTopic, clusterTopicPath } from "../../seo/catalog/contentClusters";
import { getAllQuestionSeeds, getQuestionSeed, questionPath, questionsHubPath } from "../../seo/catalog/questionSeeds";
import {
  getOwnershipTimeline,
  getAllOwnershipTimelines,
  ownershipHubPath,
  ownershipTimelinePath,
} from "../../seo/catalog/ownershipTimelines";
import { cityBrandRentalPath, cityBrandSalePath, brandPath, modelPath } from "../../seo/catalog/brands";
import { priceIntelPath } from "../../seo/catalog/vehicleSpecs";
import { reliabilityPath } from "../../seo/catalog/reliabilityIndex";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";

function useLang() {
  const { pathname } = useLocation();
  return parseSeoPath(pathname).lang;
}

function LinkCard({ title, body, href, badge }) {
  return (
    <Link
      to={href}
      className="block rounded-2xl border border-[rgba(12,26,86,0.12)] dark:border-white/10 bg-white dark:bg-[#101426] p-5 shadow-sm transition hover:border-[#7c6bff] hover:shadow-md"
    >
      {badge ? (
        <span className="mb-2 inline-block rounded-full bg-[rgba(124,107,255,0.12)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#7c6bff]">
          {badge}
        </span>
      ) : null}
      <h3 className="font-semibold">{title}</h3>
      {body ? <p className="mt-2 text-sm text-[#53608f] dark:text-[#8a95bf]">{body}</p> : null}
    </Link>
  );
}

function RelatedLinks({ title, links }) {
  const lang = useLang();
  if (!links?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              to={typeof l.href === "string" && l.href.startsWith("/") ? buildSeoPath(lang, l.href) : l.href}
              className="inline-block rounded-full border border-[rgba(12,26,86,0.14)] dark:border-white/12 px-3 py-1.5 text-sm hover:border-[#7c6bff] hover:text-[#7c6bff]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FaqSection({ faqs }) {
  if (!faqs?.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-4 text-lg font-semibold">Questions fréquentes</h2>
      <dl className="space-y-4">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-xl border border-[rgba(12,26,86,0.1)] dark:border-white/10 bg-white/60 dark:bg-[#101426]/60 p-4">
            <dt className="font-medium">{f.q}</dt>
            <dd className="mt-2 text-sm text-[#53608f] dark:text-[#8a95bf]">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function NotFound({ backHref, backLabel }) {
  const lang = useLang();
  return (
    <div className="py-16 text-center">
      <p className="text-lg font-medium">Page introuvable</p>
      <Link to={buildSeoPath(lang, backHref)} className="mt-4 inline-block text-[#7c6bff] hover:underline">
        ← {backLabel}
      </Link>
    </div>
  );
}

export function BuyerAssistantPage() {
  const lang = useLang();
  return (
    <>
      <SeoHead
        override={{
          title: "Assistant achat voiture Maroc — Goovoiture",
          description: "4 questions → modèles recommandés avec indices prix, fiabilité et TCO — données marketplace Maroc.",
          keywords: "assistant achat voiture maroc, quel voiture acheter maroc",
        }}
      />
      <EcosystemPageShell
        kicker="Goovoiture Outils"
        title="Assistant achat Goovoiture"
        description="Répondez à 4 questions — nous croisons budget, usage et priorités avec nos indices propriétaires (prix, fiabilité, TCO)."
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: "Assistant achat", href: null },
        ]}
      >
        <div className="rounded-2xl border border-[rgba(12,26,86,0.12)] dark:border-white/10 bg-white dark:bg-[#101426] p-6 shadow-sm">
          <BuyerAssistantWidget />
        </div>
        <RelatedLinks
          title="Explorer le marketplace"
          links={[
            { label: "Voiture occasion", href: "/voiture-occasion" },
            { label: "Location voiture", href: "/location-voiture" },
          ]}
        />
      </EcosystemPageShell>
    </>
  );
}

export function TcoCalculatorPage() {
  const { brandSlug, modelSlug } = useParams();
  const lang = useLang();
  const bench = getTcoBenchmark(brandSlug, modelSlug);

  if (!bench) {
    return (
      <>
        <SeoHead />
        <NotFound backHref="/cout-possession/dacia/logan" backLabel="Calculateur TCO" />
      </>
    );
  }

  const otherModels = getAllTcoBenchmarks()
    .filter((b) => b && (b.brandSlug !== brandSlug || b.modelSlug !== modelSlug))
    .slice(0, 8)
    .map((b) => ({
      label: b.displayName,
      href: `/cout-possession/${b.brandSlug}/${b.modelSlug}`,
    }));

  return (
    <>
      <SeoHead
        override={{
          title: `Coût possession ${bench.displayName} Maroc — calculateur Goovoiture`,
          description: `TCO annuel ${bench.displayName} : carburant, assurance, entretien, dépréciation — barèmes Maroc.`,
          keywords: `coût possession ${bench.displayName} maroc, TCO ${bench.displayName}`,
        }}
      />
      <EcosystemPageShell
        kicker="Goovoiture Data"
        title={`Coût de possession ${bench.displayName}`}
        description="Calculateur TCO Goovoiture — barèmes carburant, assurance et entretien Maroc 2025."
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: "Coût possession", href: "/cout-possession/dacia/logan" },
          { label: bench.displayName, href: null },
        ]}
      >
        <div className="rounded-2xl border border-[rgba(12,26,86,0.12)] dark:border-white/10 bg-white dark:bg-[#101426] p-6 shadow-sm">
          <TcoCalculatorWidget bench={bench} />
        </div>
        <RelatedLinks
          title="Explorer ce modèle"
          links={[
            { label: "Indice prix", href: priceIntelPath(brandSlug, modelSlug) },
            { label: "Fiabilité", href: reliabilityPath(brandSlug, modelSlug) },
            { label: "Annonces", href: modelPath(brandSlug, modelSlug) },
          ]}
        />
        <RelatedLinks title="Autres calculateurs TCO" links={otherModels} />
        <FaqSection
          faqs={[
            {
              q: `Combien coûte ${bench.displayName} par an au Maroc ?`,
              a: `Utilisez le calculateur ci-dessus — estimation basée sur ${bench.defaultKmPerYear} km/an et barèmes Maroc 2025.`,
            },
            {
              q: "Qu'est-ce que le TCO ?",
              a: "Total Cost of Ownership : carburant + assurance + entretien + vignette/visite + dépréciation — pas seulement le prix d'achat.",
            },
          ]}
        />
      </EcosystemPageShell>
    </>
  );
}

export function ComparisonsHubPage() {
  const lang = useLang();
  const seo = buildComparisonHubSeo(lang);
  const comparisons = getAllComparisons();

  return (
    <>
      <SeoHead
        override={{
          title: seo.title,
          description: seo.description,
          keywords: seo.keywords,
        }}
      />
      <EcosystemPageShell
        kicker="Goovoiture Comparatifs"
        title={seo.h1}
        description={seo.intro}
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: lang === "fr" ? "Comparatifs" : "Compare", href: null },
        ]}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {comparisons.map((c) => (
            <LinkCard
              key={c.slug}
              title={c.h1}
              body={c.description}
              href={buildSeoPath(lang, c.path)}
              badge="VS"
            />
          ))}
        </div>
      </EcosystemPageShell>
    </>
  );
}

export function ComparisonDetailPage() {
  const { slug } = useParams();
  const lang = useLang();
  const data = getComparisonBySlug(slug);

  if (!data) {
    return (
      <>
        <SeoHead />
        <NotFound backHref="/comparer" backLabel="Comparatifs" />
      </>
    );
  }

  return (
    <>
      <SeoHead
        override={{
          title: data.title,
          description: data.description,
          keywords: `${data.nameA} vs ${data.nameB}`,
        }}
      />
      <EcosystemPageShell
        kicker="Goovoiture Comparatifs"
        title={data.h1}
        description={data.intro}
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: "Comparatifs", href: "/comparer" },
          { label: data.h1, href: null },
        ]}
      >
        <div className="mb-10 grid gap-6 md:grid-cols-2">
          {[["a", data.nameA, data.strengthsA, data.weaknessesA, data.brandA, data.modelA], ["b", data.nameB, data.strengthsB, data.weaknessesB, data.brandB, data.modelB]].map(
            ([side, name, strengths, weaknesses, brand, model]) => (
              <div
                key={side}
                className="rounded-2xl border border-[rgba(12,26,86,0.12)] dark:border-white/10 bg-white dark:bg-[#101426] p-5"
              >
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">Points forts</p>
                <ul className="mt-1 list-inside list-disc text-sm text-[#53608f] dark:text-[#8a95bf]">
                  {strengths.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-rose-500">Points faibles</p>
                <ul className="mt-1 list-inside list-disc text-sm text-[#53608f] dark:text-[#8a95bf]">
                  {weaknesses.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                <Link
                  to={buildSeoPath(lang, modelPath(brand, model))}
                  className="mt-4 inline-block text-sm font-medium text-[#7c6bff] hover:underline"
                >
                  Voir les annonces →
                </Link>
              </div>
            )
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[rgba(12,26,86,0.12)] dark:border-white/10 bg-white dark:bg-[#101426]">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[rgba(12,26,86,0.1)] dark:border-white/10">
                <th className="p-3 text-left">Critère</th>
                <th className="p-3 text-left">{data.nameA}</th>
                <th className="p-3 text-left">{data.nameB}</th>
              </tr>
            </thead>
            <tbody>
              {data.specs.map((row) => (
                <tr key={row.label} className="border-b border-[rgba(12,26,86,0.08)] dark:border-white/8">
                  <td className="p-3 font-medium">{row.label}</td>
                  <td className="p-3">{row.a}</td>
                  <td className="p-3">{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <FaqSection faqs={data.faqs} />
        <RelatedLinks
          title="Annonces liées"
          links={[
            { label: `Location ${data.nameA} Casablanca`, href: cityBrandRentalPath("casablanca", data.brandA) },
            { label: `Occasion ${data.nameB} Casablanca`, href: cityBrandSalePath("casablanca", data.brandB) },
            { label: `Hub ${data.brandA}`, href: brandPath(data.brandA) },
          ]}
        />
      </EcosystemPageShell>
    </>
  );
}

export function ContentClusterHubPage({ clusterSlug }) {
  const lang = useLang();
  const cluster = getCluster(clusterSlug);
  if (!cluster) return null;

  const clusterName = cluster.name[lang] || cluster.name.fr;

  return (
    <>
      <SeoHead
        override={{
          title: `${cluster.hubTitle[lang] || cluster.hubTitle.fr} | Goovoiture`,
          description: cluster.hubDescription[lang] || cluster.hubDescription.fr,
          keywords: cluster.slug,
        }}
      />
      <EcosystemPageShell
        kicker="Goovoiture Guides"
        title={cluster.hubTitle[lang] || cluster.hubTitle.fr}
        description={cluster.hubDescription[lang] || cluster.hubDescription.fr}
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: clusterName, href: null },
        ]}
      >
        <div className="space-y-4">
          {cluster.topics.map((t) => (
            <LinkCard
              key={t.slug}
              title={t.title[lang] || t.title.fr}
              body={t.description[lang] || t.description.fr}
              href={buildSeoPath(lang, clusterTopicPath(clusterSlug, t.slug))}
              badge={clusterName}
            />
          ))}
        </div>
      </EcosystemPageShell>
    </>
  );
}

export function ContentClusterTopicPage({ clusterSlug }) {
  const { topicSlug } = useParams();
  const lang = useLang();
  const data = getClusterTopic(clusterSlug, topicSlug);

  if (!data) {
    return (
      <>
        <SeoHead />
        <NotFound backHref={`/${clusterSlug}`} backLabel={clusterSlug} />
      </>
    );
  }

  const { cluster, topic } = data;
  const title = topic.title[lang] || topic.title.fr;
  const clusterName = cluster.name[lang] || cluster.name.fr;

  return (
    <>
      <SeoHead
        override={{
          title: `${title} | Goovoiture`,
          description: topic.description[lang] || topic.description.fr,
          keywords: topicSlug,
        }}
      />
      <EcosystemPageShell
        kicker="Goovoiture Guides"
        title={title}
        description={topic.description[lang] || topic.description.fr}
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: clusterName, href: cluster.hubPath },
          { label: title, href: null },
        ]}
      >
        <article className="space-y-8">
          {topic.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="mb-3 text-lg font-semibold">{s.heading}</h2>
              <p className="leading-relaxed text-[#53608f] dark:text-[#8a95bf]">{s.body}</p>
            </section>
          ))}
        </article>
        <FaqSection faqs={topic.faqs} />
        {topic.relatedLinks?.length ? (
          <RelatedLinks title="Liens utiles" links={topic.relatedLinks} />
        ) : null}
      </EcosystemPageShell>
    </>
  );
}

export function QuestionsHubPage() {
  const lang = useLang();
  const seeds = getAllQuestionSeeds();

  return (
    <>
      <SeoHead
        override={{
          title: "Questions auto Maroc — communauté Goovoiture",
          description: "Assurance, crédit, démarches, prix — réponses vérifiées sur le marché automobile marocain.",
          keywords: "questions voiture maroc, forum auto maroc",
        }}
      />
      <EcosystemPageShell
        kicker="Goovoiture Communauté"
        title="Questions & réponses auto Maroc"
        description="Réponses vérifiées Goovoiture et contributions communauté."
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: "Questions", href: null },
        ]}
      >
        <div className="space-y-3">
          {seeds.map((q) => (
            <Link
              key={q.slug}
              to={buildSeoPath(lang, questionPath(q.slug))}
              className="block rounded-xl border border-[rgba(12,26,86,0.1)] dark:border-white/10 bg-white dark:bg-[#101426] p-4 transition hover:border-[#7c6bff]"
            >
              <p className="font-medium">{q.question}</p>
              {q.topic ? (
                <span className="mt-2 inline-block rounded-full bg-[rgba(124,107,255,0.1)] px-2 py-0.5 text-xs text-[#7c6bff]">
                  {q.topic}
                </span>
              ) : null}
              {(q.answers || []).length ? (
                <span className="ml-2 text-xs text-[#53608f] dark:text-[#8a95bf]">
                  {(q.answers || []).length} réponse{(q.answers || []).length > 1 ? "s" : ""}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      </EcosystemPageShell>
    </>
  );
}

export function QuestionDetailPage() {
  const { slug } = useParams();
  const lang = useLang();
  const q = getQuestionSeed(slug);

  if (!q) {
    return (
      <>
        <SeoHead />
        <NotFound backHref={questionsHubPath()} backLabel="Questions" />
      </>
    );
  }

  return (
    <>
      <SeoHead
        override={{
          title: `${q.question} | Goovoiture`,
          description: q.body || q.question,
          keywords: q.topic || "auto maroc",
        }}
      />
      <EcosystemPageShell
        kicker="Goovoiture Communauté"
        title={q.question}
        description={q.body || undefined}
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: "Questions", href: questionsHubPath() },
          {
            label: q.question.slice(0, 40) + (q.question.length > 40 ? "…" : ""),
            href: null,
          },
        ]}
      >
        <section className="space-y-4">
          {(q.answers || []).map((a, i) => (
            <div
              key={i}
              className={`rounded-xl border p-5 ${
                a.accepted
                  ? "border-[#7c6bff] bg-[rgba(124,107,255,0.06)]"
                  : "border-[rgba(12,26,86,0.1)] dark:border-white/10 bg-white dark:bg-[#101426]"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{a.authorName || "Membre Goovoiture"}</span>
                {a.verifiedExpert ? (
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                    Expert Goovoiture
                  </span>
                ) : null}
                {a.accepted ? (
                  <span className="rounded-full bg-[rgba(124,107,255,0.12)] px-2 py-0.5 text-xs text-[#7c6bff]">
                    Acceptée
                  </span>
                ) : null}
              </div>
              <p className="text-[#53608f] dark:text-[#8a95bf]">{a.body}</p>
            </div>
          ))}
        </section>
        <p className="mt-8 text-sm text-[#53608f] dark:text-[#8a95bf]">
          Posez votre question sur l&apos;app Goovoiture — réponses alimentées par la communauté et nos experts.
        </p>
      </EcosystemPageShell>
    </>
  );
}

export function OwnershipHubPage() {
  const lang = useLang();
  const timelines = getAllOwnershipTimelines();

  return (
    <>
      <SeoHead
        override={{
          title: "Guides possession auto Maroc — timelines Goovoiture",
          description: "Achat, vente, transfert carte grise, assurance — étapes et délais réalistes au Maroc.",
          keywords: "possession voiture maroc, timeline achat voiture maroc",
        }}
      />
      <EcosystemPageShell
        kicker="Goovoiture Guides"
        title="Guides possession automobile Maroc"
        description="Timelines procédurales — étapes, checklists et délais réalistes."
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: "Possession", href: null },
        ]}
      >
        <div className="space-y-4">
          {timelines.map((t) => (
            <LinkCard
              key={t.slug}
              title={t.title}
              body={t.description}
              href={buildSeoPath(lang, ownershipTimelinePath(t.slug))}
              badge="Guide"
            />
          ))}
        </div>
      </EcosystemPageShell>
    </>
  );
}

export function OwnershipTimelinePage() {
  const { topicSlug } = useParams();
  const lang = useLang();
  const t = getOwnershipTimeline(topicSlug);

  if (!t) {
    return (
      <>
        <SeoHead />
        <NotFound backHref={ownershipHubPath()} backLabel="Possession" />
      </>
    );
  }

  return (
    <>
      <SeoHead
        override={{
          title: `${t.title} | Goovoiture`,
          description: t.description,
          keywords: `possession auto maroc ${topicSlug.replace(/-/g, " ")}`,
        }}
      />
      <EcosystemPageShell
        kicker="Goovoiture Guides"
        title={t.title}
        description={t.description}
        breadcrumbs={[
          { label: "Goovoiture", href: "/" },
          { label: "Possession", href: ownershipHubPath() },
          { label: t.title, href: null },
        ]}
      >
        <ol className="relative ml-4 space-y-8 border-l-2 border-[#7c6bff]/30 pl-8">
          {t.steps.map((s, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[2.35rem] flex h-7 w-7 items-center justify-center rounded-full bg-[#7c6bff] text-xs font-bold text-white">
                {i + 1}
              </span>
              <div className="rounded-xl border border-[rgba(12,26,86,0.1)] dark:border-white/10 bg-white dark:bg-[#101426] p-5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="font-semibold">{s.title}</h3>
                  {s.week ? (
                    <span className="text-xs text-[#7c6bff]">Semaine {s.week}</span>
                  ) : s.day ? (
                    <span className="text-xs text-[#7c6bff]">Jour {s.day}</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-[#53608f] dark:text-[#8a95bf]">{s.body}</p>
                {s.checklist?.length ? (
                  <ul className="mt-3 list-inside list-disc text-sm text-[#53608f] dark:text-[#8a95bf]">
                    {s.checklist.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
        <FaqSection faqs={t.faqs} />
        {t.relatedLinks?.length ? <RelatedLinks title="Liens utiles" links={t.relatedLinks} /> : null}
      </EcosystemPageShell>
    </>
  );
}
