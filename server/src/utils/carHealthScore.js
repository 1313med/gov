/**
 * Car Health Score 0–100 from garage data (mirrors client garageStatus).
 */

function daysLeft(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}

function kmLeft(car) {
  if (!car?.vidange?.lastKm || !car?.vidange?.intervalKm || car.currentMileage == null) return null;
  return car.vidange.lastKm + car.vidange.intervalKm - car.currentMileage;
}

function urgencyTier(value, type) {
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

function mechanicalDueDate(lastChangeDate, years) {
  if (!lastChangeDate) return null;
  const d = new Date(lastChangeDate);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
}

function buildStatuses(car) {
  const chainExpiry = car.chainDistribution?.lastChangeDate
    ? mechanicalDueDate(car.chainDistribution.lastChangeDate, 5)
    : null;
  const pneusExpiry = car.pneus?.lastChangeDate ? mechanicalDueDate(car.pneus.lastChangeDate, 2) : null;
  const batterieExpiry = car.batterie?.lastChangeDate ? mechanicalDueDate(car.batterie.lastChangeDate, 3) : null;
  const freinsExpiry = car.freins?.lastChangeDate ? mechanicalDueDate(car.freins.lastChangeDate, 2) : null;

  return {
    assurance: daysLeft(car.assurance?.expiryDate),
    visiteTechnique: daysLeft(car.visiteTechnique?.expiryDate),
    vignette: daysLeft(car.vignette?.expiryDate),
    permis: daysLeft(car.permis?.expiryDate),
    vidange: kmLeft(car),
    pneus: pneusExpiry ? daysLeft(pneusExpiry) : null,
    batterie: batterieExpiry ? daysLeft(batterieExpiry) : null,
    freins: freinsExpiry ? daysLeft(freinsExpiry) : null,
    chainDistribution: chainExpiry ? daysLeft(chainExpiry) : null,
  };
}

function computeHealthScore(car) {
  if (!car) {
    return { score: 0, level: "unknown", labelFr: "Aucune voiture", labelEn: "No vehicle", color: "#94a3b8", breakdown: [] };
  }

  const statuses = buildStatuses(car);
  const items = [
    { key: "assurance", labelFr: "Assurance", labelEn: "Insurance", value: statuses.assurance, type: "days" },
    { key: "visite", labelFr: "Visite technique", labelEn: "Inspection", value: statuses.visiteTechnique, type: "days" },
    { key: "vignette", labelFr: "Vignette", labelEn: "Road tax", value: statuses.vignette, type: "days" },
    { key: "vidange", labelFr: "Vidange", labelEn: "Oil change", value: statuses.vidange, type: "km" },
    { key: "pneus", labelFr: "Pneus", labelEn: "Tyres", value: statuses.pneus, type: "days" },
    { key: "freins", labelFr: "Freins", labelEn: "Brakes", value: statuses.freins, type: "days" },
    { key: "batterie", labelFr: "Batterie", labelEn: "Battery", value: statuses.batterie, type: "days" },
    { key: "chain", labelFr: "Distribution", labelEn: "Timing", value: statuses.chainDistribution, type: "days" },
  ];

  let total = 0;
  let count = 0;
  const breakdown = items.map((item) => {
    const tier = urgencyTier(item.value, item.type);
    let points = null;
    if (tier !== "unknown") {
      count++;
      if (tier === "ok") points = 100;
      else if (tier === "warning") points = 62;
      else points = 28;
      total += points;
    }
    return { ...item, tier, points };
  });

  const score = count ? Math.round(total / count) : 72;
  let level = "excellent";
  let color = "#22c55e";
  let labelFr = "En bonne santé";
  let labelEn = "Healthy";

  if (score < 50) {
    level = "urgent";
    color = "#ef4444";
    labelFr = "Attention urgente";
    labelEn = "Urgent attention";
  } else if (score < 70) {
    level = "attention";
    color = "#f97316";
    labelFr = "À surveiller";
    labelEn = "Needs attention";
  } else if (score < 85) {
    level = "good";
    color = "#eab308";
    labelFr = "Correct";
    labelEn = "Fair";
  }

  return { score, level, labelFr, labelEn, color, breakdown, alertCount: breakdown.filter((b) => b.tier === "critical" || b.tier === "warning").length };
}

module.exports = { computeHealthScore, buildStatuses, urgencyTier };
