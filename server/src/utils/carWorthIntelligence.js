const SaleListing = require("../models/SaleListing");
const { estimate } = require("./priceEngine");

function escapeRegex(s) {
  return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function median(nums) {
  if (!nums.length) return null;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

async function getMarketListings(brand, model, city) {
  const q = {
    status: { $in: ["approved", "pending"] },
    deletedAt: null,
    brand: new RegExp(`^${escapeRegex(brand)}$`, "i"),
  };
  if (model) q.model = new RegExp(escapeRegex(model), "i");
  if (city) q.city = new RegExp(escapeRegex(city), "i");

  const listings = await SaleListing.find(q)
    .select("price year mileage city createdAt brand model")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return listings;
}

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function getCarWorthIntelligence({ brand, model, year, mileage, fuel, gearbox, city }) {
  const est = estimate({ brand, model, year, mileage, fuel, gearbox });
  const worthToday = est.mid || 0;

  const listings = await getMarketListings(brand, model, city);
  const prices = listings.map((l) => l.price).filter((p) => p > 0);
  const marketMedian = median(prices);
  const listingCount = listings.length;

  const now = new Date();
  const thisMonth = monthKey(now);
  const lastMonth = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

  const recent = listings.filter((l) => {
    const k = monthKey(new Date(l.createdAt));
    return k === thisMonth || k === lastMonth;
  });
  const older = listings.filter((l) => {
    const k = monthKey(new Date(l.createdAt));
    return k !== thisMonth && k !== lastMonth;
  });

  let demandTrend = "stable";
  let demandLabelFr = "Demande stable";
  let demandLabelEn = "Stable demand";
  if (recent.length > older.length * 1.2 && recent.length >= 3) {
    demandTrend = "rising";
    demandLabelFr = city ? `Demande en hausse à ${city}` : "Demande en hausse sur le marché";
    demandLabelEn = city ? `Rising demand in ${city}` : "Rising market demand";
  } else if (recent.length < older.length * 0.7 && older.length >= 3) {
    demandTrend = "cooling";
    demandLabelFr = "Marché un peu plus calme";
    demandLabelEn = "Market cooling slightly";
  }

  const monthlyDepreciationRate = 0.012;
  const monthlyChangeMad = -Math.round(worthToday * monthlyDepreciationRate);

  const month = now.getMonth();
  let bestPeriodFr = "Printemps (mars–mai) : bonne période de vente";
  let bestPeriodEn = "Spring (Mar–May): good time to sell";
  if (month >= 5 && month <= 8) {
    bestPeriodFr = "Été : forte demande pour les voyages et locations";
    bestPeriodEn = "Summer: high demand for trips and rentals";
  } else if (month >= 9 && month <= 11) {
    bestPeriodFr = "Automne : marché actif avant fin d'année";
    bestPeriodEn = "Autumn: active market before year-end";
  } else if (month === 0 || month === 1) {
    bestPeriodFr = "Début d'année : négociations possibles pour les acheteurs";
    bestPeriodEn = "Early year: room for buyer negotiation";
  }

  const blended =
    marketMedian && worthToday
      ? Math.round(marketMedian * 0.55 + worthToday * 0.45)
      : worthToday;

  return {
    worthTodayMad: blended,
    estimateMad: worthToday,
    marketMedianMad: marketMedian,
    listingCount,
    monthlyChangeMad,
    demandTrend,
    demandLabelFr,
    demandLabelEn,
    bestPeriodFr,
    bestPeriodEn,
    city: city || null,
    brand,
    model,
    year,
    insightsFr: [
      marketMedian
        ? `Prix médian observé sur Goovoiture : ${marketMedian.toLocaleString("fr-MA")} MAD (${listingCount} annonce${listingCount > 1 ? "s" : ""}).`
        : "Peu d'annonces identiques — estimation basée sur le marché marocain.",
      monthlyChangeMad < 0
        ? `Votre ${brand} ${model || ""} a probablement perdu environ ${Math.abs(monthlyChangeMad).toLocaleString("fr-MA")} MAD ce mois (dépréciation normale).`
        : "Valeur stable ce mois.",
      demandLabelFr,
      bestPeriodFr,
    ],
    insightsEn: [
      marketMedian
        ? `Median price on Goovoiture: ${marketMedian.toLocaleString("en")} MAD (${listingCount} listing${listingCount > 1 ? "s" : ""}).`
        : "Few matching listings — estimate based on Moroccan market data.",
      monthlyChangeMad < 0
        ? `Your ${brand} ${model || ""} likely lost about ${Math.abs(monthlyChangeMad).toLocaleString("en")} MAD this month (normal depreciation).`
        : "Value stable this month.",
      demandLabelEn,
      bestPeriodEn,
    ],
    engine: est,
  };
}

module.exports = { getCarWorthIntelligence, getMarketListings };
