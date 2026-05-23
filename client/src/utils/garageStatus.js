const CURRENT_YEAR = new Date().getFullYear();

export function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

export function kmLeft(car) {
  if (!car?.vidange?.lastKm || !car?.vidange?.intervalKm || !car?.currentMileage) return null;
  return car.vidange.lastKm + car.vidange.intervalKm - car.currentMileage;
}

export function computeStatuses(car) {
  if (!car) return null;
  const chainExpiry = car.chainDistribution?.lastChangeDate
    ? new Date(new Date(car.chainDistribution.lastChangeDate).getTime() + 365 * 5 * 86400000).toISOString()
    : null;
  const pneusExpiry = car.pneus?.lastChangeDate
    ? new Date(new Date(car.pneus.lastChangeDate).getTime() + 365 * 2 * 86400000).toISOString()
    : null;
  const batterieExpiry = car.batterie?.lastChangeDate
    ? new Date(new Date(car.batterie.lastChangeDate).getTime() + 365 * 3 * 86400000).toISOString()
    : null;
  const freinsExpiry = car.freins?.lastChangeDate
    ? new Date(new Date(car.freins.lastChangeDate).getTime() + 365 * 2 * 86400000).toISOString()
    : null;

  return {
    assurance: daysLeft(car.assurance?.expiryDate),
    visiteTechnique: daysLeft(car.visiteTechnique?.expiryDate),
    vignette: daysLeft(car.vignette?.expiryDate),
    permis: daysLeft(car.permis?.expiryDate),
    vidange: kmLeft(car),
    pneus: daysLeft(pneusExpiry),
    batterie: daysLeft(batterieExpiry),
    freins: daysLeft(freinsExpiry),
    chainDistribution: chainExpiry ? daysLeft(chainExpiry) : null,
  };
}

export function urgencyTier(value, type) {
  if (value === null || value === undefined) return "unknown";
  if (type === "km") {
    if (value <= 0) return "critical";
    if (value <= 500) return "critical";
    if (value <= 1500) return "warning";
    return "ok";
  }
  if (value <= 0) return "critical";
  if (value <= 7) return "critical";
  if (value <= 30) return "warning";
  return "ok";
}

export function tierColor(tier, C) {
  if (tier === "critical") return "#ef4444";
  if (tier === "warning") return "#f97316";
  if (tier === "ok") return C?.green ?? "#22c55e";
  return C?.muted ?? "#94a3b8";
}

export function tierIcon(tier) {
  if (tier === "critical") return "warning";
  if (tier === "warning") return "alert-circle";
  if (tier === "ok") return "checkmark-circle";
  return "ellipse-outline";
}

export function formatTrackDate(dateStr, fr) {
  if (!dateStr) return fr ? "Non renseigné" : "Not set";
  return new Date(dateStr).toLocaleDateString(fr ? "fr-FR" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function trackStatusLabel(value, type, fr) {
  if (type === "km") {
    if (value === null) return fr ? "À renseigner" : "Add data";
    if (value <= 0) return fr ? "Dépassé" : "Overdue";
    return `${value.toLocaleString()} km`;
  }
  if (value === null) return fr ? "À renseigner" : "Add data";
  if (value <= 0) return fr ? "Expiré" : "Expired";
  if (value === 1) return fr ? "1 jour" : "1 day";
  return fr ? `${value} j` : `${value} d`;
}

export function progressRatio(value, type, intervalKm = 10000) {
  if (value === null) return 0;
  if (type === "km") {
    return Math.max(0, Math.min(1, value / intervalKm));
  }
  return Math.max(0, Math.min(1, value / 365));
}

function mechanicalDueDate(lastChangeDate, years) {
  if (!lastChangeDate) return null;
  const d = new Date(lastChangeDate);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
}

export function buildTrackItems(car, statuses, fr) {
  if (!car || !statuses) return [];

  const items = [
    {
      id: "assurance",
      category: "papers",
      label: fr ? "Assurance" : "Insurance",
      hint: fr ? "Couverture obligatoire" : "Mandatory coverage",
      icon: "shield-checkmark-outline",
      color: "#f97316",
      value: statuses.assurance,
      type: "days",
      expiry: car.assurance?.expiryDate,
    },
    {
      id: "visite",
      category: "papers",
      label: fr ? "Visite technique" : "Technical inspection",
      hint: fr ? "Contrôle légal" : "Legal inspection",
      icon: "clipboard-outline",
      color: "#fb923c",
      value: statuses.visiteTechnique,
      type: "days",
      expiry: car.visiteTechnique?.expiryDate,
    },
    {
      id: "vignette",
      category: "papers",
      label: fr ? "Vignette" : "Road tax",
      hint: fr ? "Taxe annuelle" : "Annual tax",
      icon: "receipt-outline",
      color: "#eab308",
      value: statuses.vignette,
      type: "days",
      expiry: car.vignette?.expiryDate,
    },
    {
      id: "permis",
      category: "papers",
      label: fr ? "Permis de conduire" : "Driving licence",
      hint: fr ? "Validité personnelle" : "Personal validity",
      icon: "card-outline",
      color: "#a78bfa",
      value: statuses.permis,
      type: "days",
      expiry: car.permis?.expiryDate,
    },
    {
      id: "vidange",
      category: "mechanical",
      label: fr ? "Vidange" : "Oil change",
      hint: fr ? "Moteur & filtres" : "Engine & filters",
      icon: "water-outline",
      color: "#38bdf8",
      value: statuses.vidange,
      type: "km",
      expiry: car.vidange?.lastKm ? car.vidange.lastKm + (car.vidange.intervalKm || 0) : null,
      intervalKm: car.vidange?.intervalKm || 10000,
    },
    {
      id: "pneus",
      category: "mechanical",
      label: fr ? "Pneus" : "Tyres",
      hint: fr ? "Adhérence & sécurité" : "Grip & safety",
      icon: "disc-outline",
      color: "#22d3ee",
      value: statuses.pneus,
      type: "days",
      expiry: mechanicalDueDate(car.pneus?.lastChangeDate, 2),
    },
    {
      id: "freins",
      category: "mechanical",
      label: fr ? "Freins" : "Brakes",
      hint: fr ? "Disques & plaquettes" : "Pads & discs",
      icon: "stop-circle-outline",
      color: "#f87171",
      value: statuses.freins,
      type: "days",
      expiry: mechanicalDueDate(car.freins?.lastChangeDate, 2),
    },
    {
      id: "batterie",
      category: "mechanical",
      label: fr ? "Batterie" : "Battery",
      hint: fr ? "Démarrage fiable" : "Reliable starts",
      icon: "battery-charging-outline",
      color: "#4ade80",
      value: statuses.batterie,
      type: "days",
      expiry: mechanicalDueDate(car.batterie?.lastChangeDate, 3),
    },
  ];

  items.push({
    id: "chain",
    category: "mechanical",
    label: fr ? "Chaîne de distribution" : "Timing chain",
    hint: fr ? "Composant critique" : "Critical component",
    icon: "cog-outline",
    color: "#c084fc",
    value: car.chainDistribution?.lastChangeDate ? statuses.chainDistribution : null,
    type: "days",
    expiry: mechanicalDueDate(car.chainDistribution?.lastChangeDate, 5),
  });

  const rank = { critical: 0, warning: 1, unknown: 2, ok: 3 };
  return items
    .map((item) => ({ ...item, tier: urgencyTier(item.value, item.type) }))
    .sort((a, b) => rank[a.tier] - rank[b.tier] || (a.value ?? 9999) - (b.value ?? 9999));
}

export function computeGarageHealth(trackItems) {
  if (!trackItems.length) return { score: 0, labelKey: "empty" };
  let total = 0;
  let count = 0;
  for (const item of trackItems) {
    if (item.tier === "unknown") continue;
    count++;
    if (item.tier === "ok") total += 100;
    else if (item.tier === "warning") total += 62;
    else total += 28;
  }
  if (!count) return { score: 72, labelKey: "incomplete" };
  const score = Math.round(total / count);
  let labelKey = "excellent";
  if (score < 50) labelKey = "critical";
  else if (score < 70) labelKey = "attention";
  else if (score < 85) labelKey = "good";
  return { score, labelKey };
}

export function countAlerts(trackItems) {
  return trackItems.filter((i) => i.tier === "critical" || i.tier === "warning").length;
}

export function soonestDeadline(trackItems, fr) {
  const urgent = trackItems.filter((i) => i.tier === "critical" || i.tier === "warning");
  if (!urgent.length) return null;
  const first = urgent[0];
  return {
    label: first.label,
    status: trackStatusLabel(first.value, first.type, fr),
    tier: first.tier,
  };
}

export function carAgeYears(car) {
  return Math.max(0, CURRENT_YEAR - (parseInt(car?.year, 10) || CURRENT_YEAR));
}
