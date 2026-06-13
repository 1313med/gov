const asyncHandler = require("express-async-handler");
const SaleListing = require("../models/SaleListing");
const RentalListing = require("../models/RentalListing");
const Review = require("../models/Review");
const User = require("../models/User");
const CommunityCarInsight = require("../models/CommunityCarInsight");
const SEEDS = require("../data/moroccoCommunitySeeds");
const { estimate } = require("../utils/priceEngine");

const FUEL_PRICE_MAD = { essence: 14.2, diesel: 13.5 };
const INSURANCE_YEARLY = { economy: 4500, mid: 6200, premium: 9800, luxury: 14500 };
const VIGNETTE_YEARLY = 350;
const VISITE_YEARLY = 400;

function brandFilter(brand) {
  return { $regex: new RegExp(`^${String(brand).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
}

function modelFilter(model) {
  return { $regex: new RegExp(`^${String(model).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") };
}

function tierFromBrand(brand) {
  const b = String(brand).toLowerCase();
  if (["mercedes", "bmw", "audi", "porsche", "land-rover"].some((x) => b.includes(x))) return "luxury";
  if (["volkswagen", "peugeot", "hyundai", "toyota", "seat"].some((x) => b.includes(x))) return "mid";
  if (["dacia", "renault", "fiat", "kia"].some((x) => b.includes(x))) return "economy";
  return "mid";
}

async function aggregateSearchDemand(limit = 20) {
  const [saleAgg, rentalAgg] = await Promise.all([
    SaleListing.aggregate([
      { $match: { status: { $in: ["approved", "sold"] }, deletedAt: null } },
      {
        $group: {
          _id: { brand: { $toLower: "$brand" }, model: { $toLower: "$model" } },
          views: { $sum: "$viewCount" },
          listings: { $sum: 1 },
          sold: { $sum: { $cond: [{ $eq: ["$status", "sold"] }, 1, 0] } },
        },
      },
      { $sort: { views: -1 } },
      { $limit: limit },
    ]),
    RentalListing.aggregate([
      { $match: { status: "approved", deletedAt: null } },
      {
        $group: {
          _id: { brand: { $toLower: "$brand" }, model: { $toLower: "$model" } },
          views: { $sum: "$viewCount" },
          listings: { $sum: 1 },
        },
      },
      { $sort: { views: -1 } },
      { $limit: limit },
    ]),
  ]);

  const map = new Map();
  for (const row of [...saleAgg, ...rentalAgg]) {
    const key = `${row._id.brand}:${row._id.model}`;
    const prev = map.get(key) || { brand: row._id.brand, model: row._id.model, views: 0, listings: 0, sold: 0 };
    prev.views += row.views || 0;
    prev.listings += row.listings || 0;
    prev.sold += row.sold || 0;
    map.set(key, prev);
  }

  return [...map.values()]
    .filter((r) => r.brand && r.model)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

async function modelSearchDemand(brand, model) {
  const base = { brand: brandFilter(brand), model: modelFilter(model), deletedAt: null };
  const [saleViews, rentalViews, saleCount, rentalCount, soldCount] = await Promise.all([
    SaleListing.aggregate([
      { $match: { ...base, status: { $in: ["approved", "sold"] } } },
      { $group: { _id: null, views: { $sum: "$viewCount" } } },
    ]),
    RentalListing.aggregate([
      { $match: { ...base, status: "approved" } },
      { $group: { _id: null, views: { $sum: "$viewCount" } } },
    ]),
    SaleListing.countDocuments({ ...base, status: "approved" }),
    RentalListing.countDocuments({ ...base, status: "approved" }),
    SaleListing.countDocuments({ ...base, status: "sold" }),
  ]);

  const views = (saleViews[0]?.views || 0) + (rentalViews[0]?.views || 0);
  const demandScore = Math.min(100, Math.round(Math.log10(views + 1) * 28 + saleCount + rentalCount * 0.5));

  return {
    brand,
    model,
    views,
    activeSaleListings: saleCount,
    activeRentalListings: rentalCount,
    soldListings: soldCount,
    demandScore,
    lastUpdated: new Date().toISOString(),
  };
}

async function computeReliability(brand, model) {
  const brandKey = String(brand).toLowerCase();
  const modelKey = String(model).toLowerCase().replace(/\s+/g, "-");

  const [insights, listingReviews] = await Promise.all([
    CommunityCarInsight.find({
      brand: brandKey,
      $or: [{ model: modelKey.replace(/-/g, "") }, { model: modelKey }, { model: "" }],
      approved: true,
    })
      .sort({ upvotes: -1 })
      .limit(20)
      .lean(),
    Review.find({ targetModel: "SaleListing" })
      .populate({
        path: "targetId",
        select: "brand model",
        match: { brand: brandFilter(brand), model: modelFilter(model) },
      })
      .limit(50)
      .lean(),
  ]);

  const seeds = SEEDS.filter(
    (s) => s.brand === brandKey && (!s.model || s.model === modelKey.replace(/-/g, "") || s.model === modelKey)
  );

  const merged = [...insights, ...seeds.map((s, i) => ({ ...s, _id: `seed-${i}`, source: "curated_ma" }))];
  const relevantReviews = listingReviews.filter((r) => r.targetId);
  const avgRating =
    relevantReviews.length > 0
      ? relevantReviews.reduce((s, r) => s + r.rating, 0) / relevantReviews.length
      : null;

  const reliabilityNotes = merged.filter((i) => i.type === "reliability");
  const issues = merged.filter((i) => i.type === "common_issue");
  const tips = merged.filter((i) => ["maintenance_tip", "cost_tip", "fuel_average"].includes(i.type));

  let score = 72;
  if (avgRating) score = Math.round(avgRating * 18);
  if (reliabilityNotes.length) score = Math.min(98, score + reliabilityNotes.length * 2);
  if (issues.length) score = Math.max(45, score - issues.length * 3);
  if (tierFromBrand(brand) === "economy") score = Math.min(98, score + 4);
  if (tierFromBrand(brand) === "luxury") score = Math.max(50, score - 6);

  return {
    brand,
    model,
    score,
    grade: score >= 85 ? "A" : score >= 75 ? "B" : score >= 65 ? "C" : "D",
    avgListingRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    reviewSampleSize: relevantReviews.length,
    insights: merged.slice(0, 12),
    commonIssues: issues.slice(0, 5),
    maintenanceTips: tips.slice(0, 5),
    methodology: "Score composite : avis annonces, insights communauté Goovoiture, données curatées Maroc.",
    lastUpdated: new Date().toISOString(),
  };
}

async function computeReputation(userId) {
  const user = await User.findById(userId).select(
    "name city avatar nationalId driverLicense businessProfile createdAt"
  );
  if (!user) return null;

  const [reviews, saleListings, rentalListings, soldCount] = await Promise.all([
    Review.find({ targetId: userId, targetModel: "User" }).lean(),
    SaleListing.countDocuments({ sellerId: userId, status: "approved", deletedAt: null }),
    RentalListing.countDocuments({ rentalOwnerId: userId, status: "approved", deletedAt: null }),
    SaleListing.countDocuments({ sellerId: userId, status: "sold", deletedAt: null }),
  ]);

  const total = reviews.length;
  const avgRating = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
  const verifiedReviews = reviews.filter((r) => r.bookingId).length;
  const identityVerified = Boolean(user.nationalId?.verified || user.driverLicense?.verified);
  const memberSince = user.createdAt;

  let score = Math.round(avgRating * 14);
  if (total >= 3) score += 8;
  if (total >= 10) score += 7;
  if (identityVerified) score += 12;
  if (verifiedReviews > 0) score += Math.min(15, verifiedReviews * 3);
  score += Math.min(12, soldCount * 2);
  score += Math.min(8, Math.floor((saleListings + rentalListings) / 3));
  score = Math.min(100, Math.max(0, score));

  const badges = [];
  if (identityVerified) badges.push({ id: "verified", label: "Identité vérifiée" });
  if (verifiedReviews >= 2) badges.push({ id: "trusted_reviews", label: "Avis transaction vérifiés" });
  if (soldCount >= 3) badges.push({ id: "active_seller", label: "Vendeur actif" });
  if (rentalListings >= 5) badges.push({ id: "fleet", label: "Flotte location" });
  if (avgRating >= 4.5 && total >= 5) badges.push({ id: "top_rated", label: "Top noté" });

  return {
    userId: user._id,
    name: user.businessProfile?.businessName || user.name,
    city: user.city,
    avatar: user.businessProfile?.logo || user.avatar,
    score,
    grade: score >= 85 ? "Excellent" : score >= 70 ? "Fiable" : score >= 55 ? "Correct" : "Nouveau",
    avgRating: Math.round(avgRating * 10) / 10,
    reviewCount: total,
    verifiedReviewCount: verifiedReviews,
    identityVerified,
    inventoryCount: saleListings,
    fleetSize: rentalListings,
    soldCount,
    badges,
    memberSince: memberSince?.toISOString(),
    methodology: "Score Goovoiture : avis vérifiés, identité, historique ventes et activité marketplace.",
    lastUpdated: new Date().toISOString(),
  };
}

function parseConsumption(consumptionStr, fuelKey) {
  if (!consumptionStr) return fuelKey === "diesel" ? 5.5 : 6.2;
  const m = String(consumptionStr).match(/[\d.]+/);
  return m ? parseFloat(m[0]) : fuelKey === "diesel" ? 5.5 : 6.2;
}

// GET /api/intelligence/search-demand
exports.getSearchDemand = asyncHandler(async (req, res) => {
  const { brand, model, limit = 20 } = req.query;
  if (brand && model) {
    const data = await modelSearchDemand(brand, model);
    return res.json(data);
  }
  const top = await aggregateSearchDemand(Math.min(Number(limit) || 20, 30));
  res.json({ top, source: "Goovoiture viewCount aggregation", lastUpdated: new Date().toISOString() });
});

// GET /api/intelligence/reliability?brand=&model=
exports.getReliability = asyncHandler(async (req, res) => {
  const { brand, model } = req.query;
  if (!brand || !model) {
    return res.status(400).json({ message: "brand and model are required" });
  }
  const data = await computeReliability(brand, model);
  res.json(data);
});

// GET /api/intelligence/reputation/:userId
exports.getReputation = asyncHandler(async (req, res) => {
  const data = await computeReputation(req.params.userId);
  if (!data) return res.status(404).json({ message: "Seller not found" });
  res.json(data);
});

// GET /api/intelligence/tco?brand=&model=&year=&kmPerYear=&purchasePrice=
exports.getTco = asyncHandler(async (req, res) => {
  const { brand, model, year, kmPerYear = 15000, purchasePrice } = req.query;
  if (!brand || !model) {
    return res.status(400).json({ message: "brand and model are required" });
  }

  const yr = Number(year) || new Date().getFullYear() - 3;
  const km = Number(kmPerYear) || 15000;
  const tier = tierFromBrand(brand);
  const est = estimate({ brand, model, year: yr, mileage: Math.round(km * 2), fuel: "essence" });
  const price = Number(purchasePrice) || est.mid || 120000;
  const fuelKey = String(model).includes("dci") || tier === "economy" ? "diesel" : "essence";
  const l100 = parseConsumption(null, fuelKey);
  const fuelYear = Math.round((km / 100) * l100 * (FUEL_PRICE_MAD[fuelKey] || 14));
  const insuranceYear = INSURANCE_YEARLY[tier] || INSURANCE_YEARLY.mid;
  const maintenanceYear = tier === "luxury" ? 12000 : tier === "premium" ? 7800 : tier === "mid" ? 4800 : 3200;
  const papersYear = VIGNETTE_YEARLY + VISITE_YEARLY;
  const depreciationRate = tier === "luxury" ? 0.14 : tier === "premium" ? 0.12 : tier === "mid" ? 0.1 : 0.08;
  const depreciationYear = Math.round(price * depreciationRate);
  const totalYear = fuelYear + insuranceYear + maintenanceYear + papersYear + depreciationYear;
  const totalMonth = Math.round(totalYear / 12);
  const costPerKm = Math.round((totalYear / km) * 100) / 100;

  res.json({
    brand,
    model,
    year: yr,
    kmPerYear: km,
    purchasePriceMad: price,
    tier,
    yearly: {
      fuel: fuelYear,
      insurance: insuranceYear,
      maintenance: maintenanceYear,
      papers: papersYear,
      depreciation: depreciationYear,
      total: totalYear,
    },
    monthly: { total: totalMonth },
    costPerKm,
    assumptions: {
      fuelPricePerLiter: FUEL_PRICE_MAD[fuelKey],
      consumptionL100: l100,
      depreciationRate: `${Math.round(depreciationRate * 100)}%`,
    },
    methodology: "Estimation Goovoiture basée sur prix marketplace, barèmes assurance Maroc et tier véhicule.",
    lastUpdated: new Date().toISOString(),
  });
});

// GET /api/intelligence/market?brand=&model=
exports.getMarketIntel = asyncHandler(async (req, res) => {
  const { brand, model } = req.query;
  if (!brand || !model) {
    return res.status(400).json({ message: "brand and model are required" });
  }

  const marketController = require("./marketController");
  const [demand, reliability] = await Promise.all([
    modelSearchDemand(brand, model),
    computeReliability(brand, model),
  ]);

  res.json({
    brand,
    model,
    demand,
    reliability: {
      score: reliability.score,
      grade: reliability.grade,
      commonIssues: reliability.commonIssues.slice(0, 3),
    },
    links: {
      prices: `/prix/${String(brand).toLowerCase()}/${String(model).toLowerCase().replace(/\s+/g, "-")}`,
      reliability: `/fiabilite/${String(brand).toLowerCase()}/${String(model).toLowerCase().replace(/\s+/g, "-")}`,
      tco: `/cout-possession/${String(brand).toLowerCase()}/${String(model).toLowerCase().replace(/\s+/g, "-")}`,
    },
    source: "Goovoiture proprietary intelligence",
    lastUpdated: new Date().toISOString(),
  });
});

exports.computeReputation = computeReputation;
