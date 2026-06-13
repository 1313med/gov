/** Structured buyer assistant — rule-based decision tree (no thin AI wrapper). */

export const ASSISTANT_STEPS = [
  {
    id: "budget",
    question: "Quel est votre budget total (achat + 1ère année) ?",
    type: "choice",
    options: [
      { value: "under-80k", label: "Moins de 80 000 MAD", tags: ["economy"] },
      { value: "80-150k", label: "80 000 – 150 000 MAD", tags: ["economy", "mid"] },
      { value: "150-250k", label: "150 000 – 250 000 MAD", tags: ["mid", "premium"] },
      { value: "over-250k", label: "Plus de 250 000 MAD", tags: ["premium"] },
    ],
  },
  {
    id: "usage",
    question: "Usage principal ?",
    type: "choice",
    options: [
      { value: "city", label: "Ville (Casablanca, Rabat…)", tags: ["citadine", "compact"] },
      { value: "mixed", label: "Mixte ville + route nationale", tags: ["compact", "berline", "suv"] },
      { value: "family", label: "Famille / 5+ places", tags: ["berline", "suv"] },
      { value: "professional", label: "Pro / VTC / flotte", tags: ["berline", "economy"] },
    ],
  },
  {
    id: "fuel",
    question: "Motorisation préférée ?",
    type: "choice",
    options: [
      { value: "essence", label: "Essence", tags: ["essence"] },
      { value: "diesel", label: "Diesel (+30 000 km/an)", tags: ["diesel"] },
      { value: "hybrid", label: "Hybride", tags: ["hybride"] },
      { value: "any", label: "Peu importe", tags: [] },
    ],
  },
  {
    id: "priority",
    question: "Priorité n°1 ?",
    type: "choice",
    options: [
      { value: "reliability", label: "Fiabilité & pièces", path: "/fiabilite" },
      { value: "cost", label: "Coût total (TCO)", path: "/cout-possession/dacia/logan" },
      { value: "resale", label: "Revente facile", path: "/prix/dacia/logan" },
      { value: "premium", label: "Confort & finition", path: "/marque/peugeot/208" },
    ],
  },
];

export const ASSISTANT_RECOMMENDATIONS = {
  "economy-city": [
    { brandSlug: "dacia", modelSlug: "sandero", reason: "Citadine la plus économique — entretien minimal." },
    { brandSlug: "hyundai", modelSlug: "i10", reason: "Micro-citadine fiable avec garantie longue." },
    { brandSlug: "kia", modelSlug: "picanto", reason: "Alternative i10 — garantie 7 ans." },
  ],
  "economy-mixed": [
    { brandSlug: "dacia", modelSlug: "logan", reason: "Berline budget — pièces partout au Maroc." },
    { brandSlug: "renault", modelSlug: "symbol", reason: "Robuste routes nationales — flottes/taxis." },
    { brandSlug: "renault", modelSlug: "clio", reason: "Occasion liquide — réseau dense." },
  ],
  "mid-family": [
    { brandSlug: "dacia", modelSlug: "duster", reason: "SUV familial routes & pistes légères." },
    { brandSlug: "hyundai", modelSlug: "tucson", reason: "SUV complet — bon rapport équipement/prix." },
    { brandSlug: "renault", modelSlug: "clio", reason: "Espace suffisant — entretien raisonnable." },
  ],
  "premium-mixed": [
    { brandSlug: "peugeot", modelSlug: "208", reason: "Citadine premium — finition supérieure." },
    { brandSlug: "volkswagen", modelSlug: "polo", reason: "Qualité VW — revente stable." },
    { brandSlug: "toyota", modelSlug: "yaris", reason: "Hybride fiable — consommation faible." },
  ],
  default: [
    { brandSlug: "dacia", modelSlug: "logan", reason: "Référence marché marocain — meilleur TCO." },
    { brandSlug: "renault", modelSlug: "clio", reason: "Polyvalente — forte demande occasion." },
    { brandSlug: "toyota", modelSlug: "yaris", reason: "Fiabilité top — revente rapide." },
  ],
};

export function buyerAssistantPath() {
  return "/assistant-achat";
}

export function resolveRecommendations(answers) {
  const budget = answers.budget || "80-150k";
  const usage = answers.usage || "mixed";
  const key = `${budget.includes("under") || budget.includes("80") ? "economy" : budget.includes("150") ? "mid" : "premium"}-${usage === "city" ? "city" : usage === "family" ? "family" : "mixed"}`;
  return ASSISTANT_RECOMMENDATIONS[key] || ASSISTANT_RECOMMENDATIONS.default;
}
