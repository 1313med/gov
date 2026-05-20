const SaleListing = require("../models/SaleListing");
const RentalListing = require("../models/RentalListing");

// ── GET /api/fair-price/sale?brand=&model=&year=&mileage= ─────────────────────
exports.getSaleFairPrice = async (req, res, next) => {
  try {
    const { brand, model, year, mileage, excludeId } = req.query;
    if (!brand || !model) {
      return res.status(400).json({ message: "brand and model are required" });
    }

    const filter = {
      brand: { $regex: new RegExp(`^${brand}$`, "i") },
      model: { $regex: new RegExp(`^${model}$`, "i") },
      status: "approved",
      deletedAt: null,
    };
    if (excludeId) filter._id = { $ne: excludeId };

    // Year range ±2 years for better sample size
    if (year) {
      const y = parseInt(year);
      filter.year = { $gte: y - 2, $lte: y + 2 };
    }

    const listings = await SaleListing.find(filter).select("price mileage year").lean();
    if (!listings.length) {
      return res.json({ available: false, message: "Not enough data for this car" });
    }

    // Filter outliers: remove prices in bottom 5% and top 5%
    const prices = listings.map((l) => l.price).sort((a, b) => a - b);
    const trim   = Math.floor(prices.length * 0.05);
    const clean  = prices.slice(trim, prices.length - trim || undefined);

    const avg    = Math.round(clean.reduce((s, p) => s + p, 0) / clean.length);
    const min    = Math.min(...clean);
    const max    = Math.max(...clean);
    const median = clean[Math.floor(clean.length / 2)];

    // Mileage-adjusted estimate (−1% per 10k km above 80k baseline)
    let adjustedAvg = avg;
    if (mileage && year) {
      const km = parseInt(mileage);
      if (km > 80000) {
        const penalty = Math.min(0.3, ((km - 80000) / 10000) * 0.01);
        adjustedAvg   = Math.round(avg * (1 - penalty));
      }
    }

    res.json({
      available: true,
      sampleSize: clean.length,
      marketPrice: {
        average:  avg,
        median,
        min,
        max,
        adjustedAvg,
      },
    });
  } catch (err) { next(err); }
};

// ── GET /api/fair-price/rental?brand=&model=&city= ────────────────────────────
exports.getRentalFairPrice = async (req, res, next) => {
  try {
    const { brand, model, city, excludeId } = req.query;
    if (!brand || !model) {
      return res.status(400).json({ message: "brand and model are required" });
    }

    const filter = {
      brand: { $regex: new RegExp(`^${brand}$`, "i") },
      model: { $regex: new RegExp(`^${model}$`, "i") },
      status: "approved",
      deletedAt: null,
    };
    if (city)      filter.city = { $regex: new RegExp(city, "i") };
    if (excludeId) filter._id  = { $ne: excludeId };

    const listings = await RentalListing.find(filter).select("pricePerDay").lean();
    if (!listings.length) {
      return res.json({ available: false, message: "Not enough data for this car in this city" });
    }

    const prices = listings.map((l) => l.pricePerDay).sort((a, b) => a - b);
    const avg    = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
    const min    = Math.min(...prices);
    const max    = Math.max(...prices);

    res.json({
      available:  true,
      sampleSize: prices.length,
      marketPrice: { average: avg, min, max },
    });
  } catch (err) { next(err); }
};

// ── GET /api/fair-price/competitor?city=&brand= ───────────────────────────────
// Competitor price intelligence for rental owners
exports.getCompetitorPricing = async (req, res, next) => {
  try {
    const { city, brand, ownerId } = req.query;
    if (!city) return res.status(400).json({ message: "city is required" });

    const filter = {
      status: "approved",
      deletedAt: null,
      city: { $regex: new RegExp(city, "i") },
    };
    if (brand)   filter.brand = { $regex: new RegExp(`^${brand}$`, "i") };
    if (ownerId) filter.rentalOwnerId = { $ne: ownerId };

    const listings = await RentalListing.find(filter)
      .select("brand model pricePerDay year city")
      .lean();

    if (!listings.length) {
      return res.json({ available: false, city, sampleSize: 0 });
    }

    const prices   = listings.map((l) => l.pricePerDay);
    const avg      = Math.round(prices.reduce((s, p) => s + p, 0) / prices.length);
    const min      = Math.min(...prices);
    const max      = Math.max(...prices);

    // Breakdown by brand
    const byBrand = {};
    for (const l of listings) {
      if (!byBrand[l.brand]) byBrand[l.brand] = [];
      byBrand[l.brand].push(l.pricePerDay);
    }
    const brandBreakdown = Object.entries(byBrand).map(([b, ps]) => ({
      brand:   b,
      avgPrice:Math.round(ps.reduce((s, p) => s + p, 0) / ps.length),
      count:   ps.length,
    })).sort((a, b) => b.count - a.count);

    res.json({
      available: true,
      city,
      sampleSize: listings.length,
      market: { avg, min, max },
      brandBreakdown,
    });
  } catch (err) { next(err); }
};
