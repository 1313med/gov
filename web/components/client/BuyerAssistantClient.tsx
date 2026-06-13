"use client";

import { useState } from "react";
import { ASSISTANT_STEPS, resolveRecommendations } from "@client-seo/catalog/buyerAssistant";
import { marketIntelPath, reliabilityPath, tcoPath } from "@client-seo/catalog/reliabilityIndex";
import { priceIntelPath } from "@client-seo/catalog/vehicleSpecs";
import { modelPath } from "@client-seo/catalog/brands";
import BadgePill from "@/components/ui/BadgePill";

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
        <h2 className="gv-h2 mb-4">Modèles recommandés pour vous</h2>
        <div className="space-y-4 mb-8">
          {recommendations.map((rec) => (
            <div key={`${rec.brandSlug}:${rec.modelSlug}`} className="gv-card gv-card-static p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="font-semibold capitalize text-[var(--gv-ink)]">
                  {rec.brandSlug} {rec.modelSlug.replace(/-/g, " ")}
                </p>
                <BadgePill variant="brand">Recommandé</BadgePill>
              </div>
              <p className="text-sm text-[var(--gv-mut)] mb-3">{rec.reason}</p>
              <div className="flex flex-wrap gap-2">
                <a href={modelPath(rec.brandSlug, rec.modelSlug)} className="gv-chip">Annonces</a>
                <a href={marketIntelPath(rec.brandSlug, rec.modelSlug)} className="gv-chip">Marché</a>
                <a href={reliabilityPath(rec.brandSlug, rec.modelSlug)} className="gv-chip">Fiabilité</a>
                <a href={tcoPath(rec.brandSlug, rec.modelSlug)} className="gv-chip">TCO</a>
                <a href={priceIntelPath(rec.brandSlug, rec.modelSlug)} className="gv-chip">Prix</a>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => { setStep(0); setAnswers({}); }}
          className="gv-btn gv-btn-outline text-sm"
        >
          Recommencer
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <span className="gv-badge gv-badge-brand">
          Étape {step + 1} / {ASSISTANT_STEPS.length}
        </span>
        <div className="flex-1 h-1 rounded-full bg-[var(--gv-sur2)] overflow-hidden">
          <div
            className="h-full bg-[var(--gv-brand)] transition-all duration-300"
            style={{ width: `${((step + 1) / ASSISTANT_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
      <h2 className="gv-h2 mb-6">{current.question}</h2>
      <ul className="space-y-3">
        {current.options.map((opt) => (
          <li key={opt.value}>
            <button
              type="button"
              onClick={() => choose(opt.value)}
              className="w-full text-left gv-card gv-card-static p-4 hover:border-[var(--gv-gbd)] hover:bg-[var(--gv-gbg)] transition-all"
            >
              {opt.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
