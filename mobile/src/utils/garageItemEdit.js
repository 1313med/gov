/** Single-item garage edit — maps UI row ids to API nested keys & form fields. */

export const GARAGE_ITEM_IDS = [
  "assurance",
  "visite",
  "vignette",
  "permis",
  "vidange",
  "pneus",
  "freins",
  "batterie",
  "chain",
];

const ITEMS = {
  assurance: {
    serverKey: "assurance",
    icon: "shield-checkmark-outline",
    color: "#f97316",
    titleFr: "Assurance",
    titleEn: "Insurance",
    hintFr: "Date d'expiration de votre contrat.",
    hintEn: "Your policy expiry date.",
    fields: [
      { formKey: "startDate", apiKey: "startDate", type: "date", labelFr: "Date de début", labelEn: "Start date" },
      { formKey: "expiryDate", apiKey: "expiryDate", type: "date", labelFr: "Date d'expiration", labelEn: "Expiry date" },
    ],
  },
  visite: {
    serverKey: "visiteTechnique",
    icon: "clipboard-outline",
    color: "#fb923c",
    titleFr: "Visite technique",
    titleEn: "Technical inspection",
    hintFr: "Date limite du contrôle légal.",
    hintEn: "Legal inspection deadline.",
    fields: [{ formKey: "expiryDate", apiKey: "expiryDate", type: "date", labelFr: "Date d'expiration", labelEn: "Expiry date" }],
  },
  vignette: {
    serverKey: "vignette",
    icon: "receipt-outline",
    color: "#eab308",
    titleFr: "Vignette",
    titleEn: "Road tax",
    hintFr: "Date limite de la vignette annuelle.",
    hintEn: "Annual road tax due date.",
    fields: [{ formKey: "expiryDate", apiKey: "expiryDate", type: "date", labelFr: "Date d'expiration", labelEn: "Expiry date" }],
  },
  permis: {
    serverKey: "permis",
    icon: "card-outline",
    color: "#a78bfa",
    titleFr: "Permis de conduire",
    titleEn: "Driving licence",
    hintFr: "Date de fin de validité de votre permis.",
    hintEn: "Licence validity end date.",
    fields: [{ formKey: "expiryDate", apiKey: "expiryDate", type: "date", labelFr: "Date d'expiration", labelEn: "Expiry date" }],
  },
  vidange: {
    serverKey: "vidange",
    icon: "water-outline",
    color: "#38bdf8",
    titleFr: "Vidange",
    titleEn: "Oil change",
    hintFr: "Dernière vidange et intervalle en kilomètres.",
    hintEn: "Last oil change and interval in km.",
    fields: [
      { formKey: "lastDate", apiKey: "lastDate", type: "date", labelFr: "Date de la dernière vidange", labelEn: "Last oil change date" },
      { formKey: "lastKm", apiKey: "lastKm", type: "number", labelFr: "Km au compteur à la vidange", labelEn: "Odometer at last change" },
      { formKey: "intervalKm", apiKey: "intervalKm", type: "number", labelFr: "Prochaine vidange tous les (km)", labelEn: "Next change every (km)" },
      { formKey: "brand", apiKey: "brand", type: "text", labelFr: "Marque d'huile (optionnel)", labelEn: "Oil brand (optional)" },
    ],
  },
  pneus: {
    serverKey: "pneus",
    icon: "disc-outline",
    color: "#22d3ee",
    titleFr: "Pneus",
    titleEn: "Tyres",
    hintFr: "Dernier changement de pneus (rappel ~2 ans).",
    hintEn: "Last tyre change (~2 year reminder).",
    fields: [
      { formKey: "lastChangeDate", apiKey: "lastChangeDate", type: "date", labelFr: "Date du dernier changement", labelEn: "Last change date" },
      { formKey: "brand", apiKey: "brand", type: "text", labelFr: "Marque (optionnel)", labelEn: "Brand (optional)" },
    ],
  },
  freins: {
    serverKey: "freins",
    icon: "stop-circle-outline",
    color: "#f87171",
    titleFr: "Freins",
    titleEn: "Brakes",
    hintFr: "Dernier changement plaquettes / disques.",
    hintEn: "Last brake pad / disc change.",
    fields: [
      { formKey: "lastChangeDate", apiKey: "lastChangeDate", type: "date", labelFr: "Date du dernier changement", labelEn: "Last change date" },
      { formKey: "brand", apiKey: "brand", type: "text", labelFr: "Marque (optionnel)", labelEn: "Brand (optional)" },
    ],
  },
  batterie: {
    serverKey: "batterie",
    icon: "battery-charging-outline",
    color: "#4ade80",
    titleFr: "Batterie",
    titleEn: "Battery",
    hintFr: "Dernier remplacement de batterie.",
    hintEn: "Last battery replacement.",
    fields: [
      { formKey: "lastChangeDate", apiKey: "lastChangeDate", type: "date", labelFr: "Date du dernier changement", labelEn: "Last change date" },
      { formKey: "brand", apiKey: "brand", type: "text", labelFr: "Marque (optionnel)", labelEn: "Brand (optional)" },
    ],
  },
  chain: {
    serverKey: "chainDistribution",
    icon: "cog-outline",
    color: "#c084fc",
    titleFr: "Chaîne de distribution",
    titleEn: "Timing chain / belt",
    hintFr: "Dernier changement de la courroie / chaîne.",
    hintEn: "Last timing belt / chain change.",
    fields: [
      { formKey: "lastChangeDate", apiKey: "lastChangeDate", type: "date", labelFr: "Date du dernier changement", labelEn: "Last change date" },
      { formKey: "lastKm", apiKey: "lastKm", type: "number", labelFr: "Km au compteur (optionnel)", labelEn: "Odometer (optional)" },
    ],
  },
};

export function getGarageItemConfig(itemId) {
  return ITEMS[itemId] || null;
}

export function isValidGarageItemId(itemId) {
  return GARAGE_ITEM_IDS.includes(itemId);
}

export function loadGarageItemForm(car, itemId) {
  const cfg = getGarageItemConfig(itemId);
  if (!cfg || !car) return {};
  const block = car[cfg.serverKey] || {};
  const form = {};
  for (const f of cfg.fields) {
    const raw = block[f.apiKey];
    if (f.type === "date") {
      form[f.formKey] = raw ?? null;
    } else if (f.type === "number") {
      form[f.formKey] = raw != null && raw !== "" ? String(raw) : "";
    } else {
      form[f.formKey] = raw ?? "";
    }
  }
  return form;
}

export function buildGarageItemPayload(itemId, form) {
  const cfg = getGarageItemConfig(itemId);
  if (!cfg) return null;
  const nested = {};
  for (const f of cfg.fields) {
    const v = form[f.formKey];
    if (f.type === "date") {
      nested[f.apiKey] = v || null;
    } else if (f.type === "number") {
      nested[f.apiKey] = v !== "" && v != null ? Number(v) : null;
    } else {
      const t = typeof v === "string" ? v.trim() : "";
      nested[f.apiKey] = t || undefined;
    }
  }
  if (itemId === "vidange" && (nested.intervalKm == null || Number.isNaN(nested.intervalKm))) {
    nested.intervalKm = 10000;
  }
  return { [cfg.serverKey]: nested };
}
