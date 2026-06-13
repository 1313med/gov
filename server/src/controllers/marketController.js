const asyncHandler = require("express-async-handler");
const SaleListing = require("../models/SaleListing");
const RentalListing = require("../models/RentalListing");
const PriceSnapshot = require("../models/PriceSnapshot");

function brandFilter(brand) {
  return { $regex: new RegExp(`^${String(brand).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
}

function modelFilter(model) {
  return { $regex: new RegExp(`^${String(model).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
}

function trimOutliers(prices) {
  if (prices.length < 4) return prices;
  const sorted = [...prices].sort((a, b) => a - b);
  const trim = Math.floor(sorted.length * 0.05);
  return sorted.slice(trim, sorted.length - trim || undefined);
}

function stats(prices) {
  const clean = trimOutliers(prices);
  if (!clean.length) return null;
  const sorted = [...clean].sort((a, b) => a - b);
  const avg = Math.round(sorted.reduce((s, p) => s + p, 0) / sorted.length);
  return {
    sampleSize: sorted.length,
    average: avg,
    median: sorted[Math.floor(sorted.length / 2)],
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

async function saleStats(brand, model) {
  const base = {
    brand: brandFilter(brand),
    model: modelFilter(model),
    deletedAt: null,
  };
  const [active, sold] = await Promise.all([
    SaleListing.find({ ...base, status: "approved" }).select("price city year mileage").lean(),
    SaleListing.find({ ...base, status: "sold" }).select("price city year mileage updatedAt").lean(),
  ]);
  const activePrices = active.map((l) => l.price);
  const soldPrices = sold.map((l) => l.price);
  const byCity = {};
  for (const l of active) {
    const c = l.city || "Maroc";
    if (!byCity[c]) byCity[c] = [];
    byCity[c].push(l.price);
  }
  const cityBreakdown = Object.entries(byCity)
    .map(([city, prices]) => ({ city, ...stats(prices) }))
    .filter((c) => c.sampleSize)
    .sort((a, b) => b.sampleSize - a.sampleSize)
    .slice(0, 12);

  const byYear = {};
  for (const l of [...active, ...sold]) {
    if (!l.year) continue;
    if (!byYear[l.year]) byYear[l.year] = [];
    byYear[l.year].push(l.price);
  }
  const yearBreakdown = Object.entries(byYear)
    .map(([year, prices]) => ({ year: Number(year), ...stats(prices) }))
    .filter((y) => y.sampleSize)
    .sort((a, b) => b.year - a.year);

  return {
    available: active.length + sold.length > 0,
    activeListings: active.length,
    soldListings: sold.length,
    market: stats([...activePrices, ...soldPrices]),
    activeMarket: stats(activePrices),
    soldMarket: stats(soldPrices),
    cityBreakdown,
    yearBreakdown,
    lastUpdated: new Date().toISOString(),
  };
}

async function rentalStats(brand, model) {
  const listings = await RentalListing.find({
    brand: brandFilter(brand),
    model: modelFilter(model),
    status: "approved",
    deletedAt: null,
  })
    .select("pricePerDay city")
    .lean();

  const byCity = {};
  for (const l of listings) {
    const c = l.city || "Maroc";
    if (!byCity[c]) byCity[c] = [];
    byCity[c].push(l.pricePerDay);
  }

  return {
    available: listings.length > 0,
    activeListings: listings.length,
    market: stats(listings.map((l) => l.pricePerDay)),
    cityBreakdown: Object.entries(byCity)
      .map(([city, prices]) => ({ city, ...stats(prices) }))
      .filter((c) => c.sampleSize)
      .sort((a, b) => b.sampleSize - a.sampleSize)
      .slice(0, 12),
    lastUpdated: new Date().toISOString(),
  };
}

async function trendStats(brand, model) {
  const snapshots = await PriceSnapshot.find({
    brand: brandFilter(brand),
    model: modelFilter(model),
  })
    .sort({ recordedAt: -1 })
    .limit(500)
    .lean();

  const buckets = {};
  for (const s of snapshots) {
    const key = s.recordedAt.toISOString().slice(0, 7);
    if (!buckets[key]) buckets[key] = { sale: [], rental: [] };
    buckets[key][s.intent].push(s.price);
  }

  const monthly = Object.entries(buckets)
    .map(([month, data]) => ({
      month,
      sale: stats(data.sale),
      rental: stats(data.rental),
    }))
    .filter((m) => m.sale || m.rental)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-18);

  return {
    available: monthly.length > 0,
    sampleSize: snapshots.length,
    monthly,
    lastUpdated: new Date().toISOString(),
  };
}

// GET /api/market/prices?brand=&model=
exports.getMarketPrices = asyncHandler(async (req, res) => {
  const { brand, model } = req.query;
  if (!brand || !model) {
    return res.status(400).json({ message: "brand and model are required" });
  }
  const [sale, rental] = await Promise.all([saleStats(brand, model), rentalStats(brand, model)]);
  res.json({
    brand,
    model,
    sale,
    rental,
    source: "Goovoiture marketplace",
    methodology: "Trimmed mean (5% outliers removed) on approved and sold listings.",
  });
});

// GET /api/market/trends?brand=&model=
exports.getMarketTrends = asyncHandler(async (req, res) => {
  const { brand, model } = req.query;
  if (!brand || !model) {
    return res.status(400).json({ message: "brand and model are required" });
  }
  const trends = await trendStats(brand, model);
  res.json({ brand, model, ...trends, source: "Goovoiture PriceSnapshot" });
});

// GET /api/market/dataset?brand=&model=
exports.getMarketDataset = asyncHandler(async (req, res) => {
  const { brand, model } = req.query;
  if (!brand || !model) {
    return res.status(400).json({ message: "brand and model are required" });
  }
  const [sale, rental, trends] = await Promise.all([
    saleStats(brand, model),
    rentalStats(brand, model),
    trendStats(brand, model),
  ]);
  res.json({
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Goovoiture price index — ${brand} ${model} Morocco`,
    description: `Live and historical price data for ${brand} ${model} on Goovoiture Morocco.`,
    url: `https://Goovoiture.ma/donnees/prix/${String(brand).toLowerCase()}/${String(model).toLowerCase().replace(/\s+/g, "-")}`,
    dateModified: new Date().toISOString(),
    publisher: { "@type": "Organization", name: "Goovoiture", url: "https://Goovoiture.ma" },
    distribution: [{ "@type": "DataDownload", encodingFormat: "application/json", contentUrl: req.originalUrl }],
    variableMeasured: ["salePriceMad", "rentalPricePerDayMad"],
    brand,
    model,
    sale,
    rental,
    trends,
  });
});
