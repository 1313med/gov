"use client";

import { useState } from "react";
import { ASSISTANT_STEPS, resolveRecommendations } from "@client-seo/catalog/buyerAssistant";
import { marketIntelPath, reliabilityPath, tcoPath } from "@client-seo/catalog/reliabilityIndex";
import { priceIntelPath } from "@client-seo/catalog/vehicleSpecs";
import { modelPath } from "@client-seo/catalog/brands";

export default function BuyerAssistantClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const current = ASSISTANT_STEPS[step];
  const done = step >= ASSISTANT_STEPS.length;

  function choose(value: string) {
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (step + 1 >= ASSISTANT_STEPS.length) {
      setStep(ASSISTANT_STEPS.length);
    } else {
      setStep(step + 1);
    }
  }

  const recommendations = done ? resolveRecommendations(answers) : [];

  if (done) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Modèles recommandés pour vous</h2>
        <ul className="space-y-4 mb-8">
          {recommendations.map((rec) => (
            <li key={`${rec.brandSlug}:${rec.modelSlug}`} className="rounded-xl border p-4">
              <p className="font-medium capitalize">{rec.brandSlug} {rec.modelSlug.replace(/-/g, " ")}</p>
              <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
              <div className="flex flex-wrap gap-2 mt-3 text-sm">
                <a href={modelPath(rec.brandSlug, rec.modelSlug)} className="text-violet-600 hover:underline">Annonces</a>
                <a href={marketIntelPath(rec.brandSlug, rec.modelSlug)} className="text-violet-600 hover:underline">Marché</a>
                <a href={reliabilityPath(rec.brandSlug, rec.modelSlug)} className="text-violet-600 hover:underline">Fiabilité</a>
                <a href={tcoPath(rec.brandSlug, rec.modelSlug)} className="text-violet-600 hover:underline">TCO</a>
                <a href={priceIntelPath(rec.brandSlug, rec.modelSlug)} className="text-violet-600 hover:underline">Prix</a>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => { setStep(0); setAnswers({}); }} className="text-sm text-violet-600 hover:underline">
          Recommencer
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">Étape {step + 1} / {ASSISTANT_STEPS.length}</p>
      <h2 className="text-xl font-semibold mb-6">{current.question}</h2>
      <ul className="space-y-3">
        {current.options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => choose(opt.value)}
              className="w-full text-left rounded-xl border p-4 hover:border-violet-400 hover:bg-violet-50 transition"
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
