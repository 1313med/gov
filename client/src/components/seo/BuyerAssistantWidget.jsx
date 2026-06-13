import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ASSISTANT_STEPS, resolveRecommendations } from "../../seo/catalog/buyerAssistant";
import { marketIntelPath, reliabilityPath, tcoPath } from "../../seo/catalog/reliabilityIndex";
import { priceIntelPath } from "../../seo/catalog/vehicleSpecs";
import { modelPath } from "../../seo/catalog/brands";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";

export default function BuyerAssistantWidget() {
  const { pathname } = useLocation();
  const { lang } = parseSeoPath(pathname);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = ASSISTANT_STEPS[step];
  const done = step >= ASSISTANT_STEPS.length;
  const recommendations = done ? resolveRecommendations(answers) : [];

  function choose(value) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    setStep(step + 1 >= ASSISTANT_STEPS.length ? ASSISTANT_STEPS.length : step + 1);
  }

  if (done) {
    return (
      <div>
        <h2 className="mb-4 text-xl font-semibold">Modèles recommandés pour vous</h2>
        <div className="mb-8 space-y-4">
          {recommendations.map((rec) => (
            <div
              key={`${rec.brandSlug}:${rec.modelSlug}`}
              className="rounded-2xl border border-[rgba(12,26,86,0.12)] dark:border-white/10 bg-white dark:bg-[#101426] p-5 shadow-sm"
            >
              <p className="mb-2 font-semibold capitalize">
                {rec.brandSlug} {rec.modelSlug.replace(/-/g, " ")}
              </p>
              <p className="mb-3 text-sm text-[#53608f] dark:text-[#8a95bf]">{rec.reason}</p>
              <div className="flex flex-wrap gap-2">
                {[
                  ["Annonces", modelPath(rec.brandSlug, rec.modelSlug)],
                  ["Marché", marketIntelPath(rec.brandSlug, rec.modelSlug)],
                  ["Fiabilité", reliabilityPath(rec.brandSlug, rec.modelSlug)],
                  ["TCO", tcoPath(rec.brandSlug, rec.modelSlug)],
                  ["Prix", priceIntelPath(rec.brandSlug, rec.modelSlug)],
                ].map(([label, path]) => (
                  <Link
                    key={label}
                    to={buildSeoPath(lang, path)}
                    className="rounded-full border border-[rgba(124,107,255,0.3)] bg-[rgba(124,107,255,0.08)] px-3 py-1 text-xs font-medium text-[#7c6bff] hover:bg-[rgba(124,107,255,0.16)]"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => { setStep(0); setAnswers({}); }}
          className="rounded-xl border border-[rgba(12,26,86,0.18)] dark:border-white/12 px-4 py-2 text-sm font-medium hover:border-[#7c6bff]"
        >
          Recommencer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-full bg-[rgba(124,107,255,0.12)] px-3 py-1 text-xs font-semibold text-[#7c6bff]">
          Étape {step + 1} / {ASSISTANT_STEPS.length}
        </span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#eef2ff] dark:bg-[#141b34]">
          <div
            className="h-full bg-[#7c6bff] transition-all duration-300"
            style={{ width: `${((step + 1) / ASSISTANT_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
      <h2 className="mb-6 text-xl font-semibold">{current.question}</h2>
      <ul className="space-y-3">
        {current.options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => choose(opt.value)}
              className="w-full rounded-2xl border border-[rgba(12,26,86,0.12)] dark:border-white/10 bg-white dark:bg-[#101426] p-4 text-left transition hover:border-[#7c6bff] hover:bg-[rgba(124,107,255,0.06)]"
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
