const asyncHandler = require("express-async-handler");
const MechanicPriceReport = require("../models/MechanicPriceReport");
const CommunityCarInsight = require("../models/CommunityCarInsight");
const UserCar = require("../models/UserCar");
const FuelLog = require("../models/FuelLog");
const {
  CITIES,
  SERVICES,
  normalizeCity,
  getBenchmark,
  evaluateQuote,
  FUEL_PRICE_MAD,
  INSURANCE_MONTHLY,
  VIGNETTE_YEARLY,
  VISITE_YEARLY,
} = require("../data/moroccoGarageBenchmarks");
const SEEDS = require("../data/moroccoCommunitySeeds");
const { computeHealthScore, buildStatuses, urgencyTier } = require("../utils/carHealthScore");
const { getCarWorthIntelligence } = require("../utils/carWorthIntelligence");
const { estimate } = require("../utils/priceEngine");

function brandModelKey(brand, model) {
  const b = String(brand || "").toLowerCase().trim();
  const m = String(model || "").toLowerCase().trim();
  return m ? `${b} ${m}`.trim() : b;
}

async function aggregateMechanicPrices(serviceKey, city, brand, model) {
  const c = normalizeCity(city);
  const reports = await MechanicPriceReport.find({
    serviceKey,
    city: new RegExp(`^${c}$`, "i"),
    approved: true,
  })
    .select("priceMad brand model")
    .limit(500)
    .lean();

  const bmKey = brandModelKey(brand, model);
  const key = SERVICES[serviceKey]?.modelHints ? bmKey : null;
  let bench = getBenchmark(serviceKey, c, key);

  if (reports.length >= 3) {
    const prices = reports.map((r) => r.priceMad);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    bench = {
      ...bench,
      min,
      max,
      avg,
      reportCount: prices.length,
      source: "community_ma",
    };
  }

  return bench;
}

// GET /api/garage-intel/mechanic-prices
exports.listMechanicPrices = asyncHandler(async (req, res) => {
  const { serviceKey = "brake_pads", city = "Casablanca", brand, model } = req.query;
  if (!SERVICES[serviceKey]) {
    res.status(400);
    throw new Error("Invalid serviceKey");
  }
  const data = await aggregateMechanicPrices(serviceKey, city, brand, model);
  const allServices = await Promise.all(
    Object.keys(SERVICES).slice(0, 5).map((sk) => aggregateMechanicPrices(sk, city, brand, model))
  );
  res.json({
    city: normalizeCity(city),
    cities: CITIES,
    services: Object.keys(SERVICES).map((k) => ({
      key: k,
      labelFr: SERVICES[k].labelFr,
      labelEn: SERVICES[k].labelEn,
    })),
    current: data,
    samples: allServices,
  });
});

// POST /api/garage-intel/mechanic-prices/submit
exports.submitMechanicPrice = asyncHandler(async (req, res) => {
  const { serviceKey, priceMad, city, brand, model, year, garageName, note } = req.body;
  if (!serviceKey || priceMad == null || !city) {
    res.status(400);
    throw new Error("serviceKey, priceMad, city required");
  }
  if (!SERVICES[serviceKey]) {
    res.status(400);
    throw new Error("Invalid serviceKey");
  }
  const report = await MechanicPriceReport.create({
    serviceKey,
    priceMad: Number(priceMad),
    city: normalizeCity(city),
    brand: String(brand || "").trim(),
    model: String(model || "").trim(),
    year: year ? Number(year) : undefined,
    garageName: String(garageName || "").slice(0, 80),
    note: String(note || "").slice(0, 300),
    userId: req.user?._id,
  });
  res.status(201).json({
    message: "Merci ! Votre prix aide la communauté (anonyme).",
    messageEn: "Thanks! Your price helps the community (anonymous).",
    id: report._id,
  });
});

// POST /api/garage-intel/mechanic-prices/evaluate
exports.evaluateMechanicQuote = asyncHandler(async (req, res) => {
  const { serviceKey, quotedPrice, city, brand, model } = req.body;
  if (!serviceKey || quotedPrice == null) {
    res.status(400);
    throw new Error("serviceKey and quotedPrice required");
  }
  const bmKey = brandModelKey(brand, model);
  const key = SERVICES[serviceKey]?.modelHints?.[bmKey.split(" ").pop()] ? bmKey : bmKey.includes("golf") ? "golf" : bmKey.includes("clio") ? "clio" : bmKey.includes("logan") ? "dacia logan" : bmKey.includes("megane") ? "megane" : null;
  const merged = await aggregateMechanicPrices(serviceKey, city, brand, model);
  const evaluation = evaluateQuote(serviceKey, quotedPrice, city, key);
  if (evaluation && merged.reportCount >= 3) {
    evaluation.min = merged.min;
    evaluation.max = merged.max;
    evaluation.avg = merged.avg;
    evaluation.reportCount = merged.reportCount;
    evaluation.source = merged.source;
  }
  res.json({ evaluation, benchmark: merged });
});

// GET /api/garage-intel/health-score
exports.getHealthScore = asyncHandler(async (req, res) => {
  const car = await UserCar.findOne({ userId: req.user._id, deletedAt: null }).sort({ updatedAt: -1 });
  if (!car) {
    return res.json({ hasCar: false, health: computeHealthScore(null) });
  }
  res.json({ hasCar: true, carId: car._id, brand: car.brand, model: car.model, health: computeHealthScore(car) });
});

// GET /api/garage-intel/car-worth
exports.getMyCarWorth = asyncHandler(async (req, res) => {
  const car = await UserCar.findOne({ userId: req.user._id, deletedAt: null }).sort({ updatedAt: -1 });
  if (!car) {
    res.status(404);
    throw new Error("No car in garage");
  }
  const city = req.query.city || "Casablanca";
  const intel = await getCarWorthIntelligence({
    brand: car.brand,
    model: car.model,
    year: car.year,
    mileage: car.currentMileage,
    fuel: car.fuelType,
    gearbox: car.gearbox,
    city,
  });
  res.json({ car: { brand: car.brand, model: car.model, year: car.year, mileage: car.currentMileage }, ...intel });
});

// POST /api/garage-intel/car-worth/preview
exports.previewCarWorth = asyncHandler(async (req, res) => {
  const { brand, model, year, mileage, fuel, gearbox, city } = req.body;
  if (!brand || !year) {
    res.status(400);
    throw new Error("brand and year required");
  }
  const intel = await getCarWorthIntelligence({
    brand,
    model,
    year,
    mileage,
    fuel,
    gearbox,
    city: city || "Casablanca",
  });
  res.json(intel);
});

function computeConsumptionFromLogs(logs) {
  if (logs.length < 2) return null;
  const sorted = [...logs].sort((a, b) => a.kmAtFillup - b.kmAtFillup);
  const consumptions = [];
  for (let i = 1; i < sorted.length; i++) {
    const kmDiff = sorted[i].kmAtFillup - sorted[i - 1].kmAtFillup;
    const liters = sorted[i].liters;
    if (kmDiff > 50 && liters > 0) consumptions.push((liters / kmDiff) * 100);
  }
  if (!consumptions.length) return null;
  return consumptions.reduce((s, v) => s + v, 0) / consumptions.length;
}

// GET /api/garage-intel/fuel-compare/:carId
exports.getFuelCompare = asyncHandler(async (req, res) => {
  const car = await UserCar.findOne({ _id: req.params.carId, userId: req.user._id, deletedAt: null });
  if (!car) {
    res.status(404);
    throw new Error("Car not found");
  }

  const myLogs = await FuelLog.find({ userCarId: car._id }).sort({ date: -1 }).lean();
  const myL100 = computeConsumptionFromLogs(myLogs);

  const peerCars = await UserCar.find({
    brand: new RegExp(`^${(car.brand || "").trim()}$`, "i"),
    model: new RegExp(`^${(car.model || "").trim()}$`, "i"),
    fuelType: car.fuelType || "essence",
    deletedAt: null,
    _id: { $ne: car._id },
  })
    .select("_id")
    .limit(80)
    .lean();

  const peerIds = peerCars.map((c) => c._id);
  const peerLogs = await FuelLog.find({ userCarId: { $in: peerIds } }).lean();

  const byCar = {};
  for (const log of peerLogs) {
    const id = String(log.userCarId);
    if (!byCar[id]) byCar[id] = [];
    byCar[id].push(log);
  }

  const peerConsumptions = Object.values(byCar)
    .map(computeConsumptionFromLogs)
    .filter((v) => v != null && v > 2 && v < 25);

  let percentile = null;
  let betterThanPct = null;
  if (myL100 && peerConsumptions.length >= 2) {
    const below = peerConsumptions.filter((p) => myL100 <= p).length;
    betterThanPct = Math.round((below / peerConsumptions.length) * 100);
    percentile = betterThanPct;
  }

  const typicalRange =
    car.fuelType === "diesel"
      ? { min: 4.8, max: 7.5, labelFr: "Diesel typique au Maroc" }
      : car.fuelType === "electrique"
        ? { min: 0, max: 0, labelFr: "Électrique" }
        : { min: 6.0, max: 9.5, labelFr: "Essence typique au Maroc" };

  res.json({
    car: { brand: car.brand, model: car.model, fuelType: car.fuelType },
    myConsumptionL100km: myL100 ? Math.round(myL100 * 10) / 10 : null,
    fillupCount: myLogs.length,
    peerCount: peerConsumptions.length,
    betterThanPct,
    percentile,
    typicalRange,
    messageFr: myL100 && betterThanPct != null
      ? `Votre ${car.brand} ${car.model} consomme ${(Math.round(myL100 * 10) / 10)} L/100km — mieux que ${betterThanPct}% des véhicules similaires sur Goovoiture.`
      : myL100
        ? `Consommation moyenne : ${(Math.round(myL100 * 10) / 10)} L/100km. Ajoutez plus de pleins pour comparer avec d'autres propriétaires.`
        : "Enregistrez au moins 2 pleins avec le kilométrage pour calculer votre consommation.",
    messageEn: myL100 && betterThanPct != null
      ? `Your ${car.brand} ${car.model} uses ${(Math.round(myL100 * 10) / 10)} L/100km — better than ${betterThanPct}% of similar cars on Goovoiture.`
      : myL100
        ? `Average consumption: ${(Math.round(myL100 * 10) / 10)} L/100km. Add more fill-ups to compare with other owners.`
        : "Log at least 2 fill-ups with odometer readings to calculate consumption.",
  });
});

// GET /api/garage-intel/travel-ready
exports.getTravelReady = asyncHandler(async (req, res) => {
  const car = await UserCar.findOne({ userId: req.user._id, deletedAt: null }).sort({ updatedAt: -1 });
  if (!car) {
    res.status(404);
    throw new Error("No car in garage");
  }

  const statuses = buildStatuses(car);
  const checks = [
    { id: "tyres", labelFr: "Pneus", labelEn: "Tyres", ok: urgencyTier(statuses.pneus, "days") === "ok" || statuses.pneus === null, detailFr: statuses.pneus != null && statuses.pneus <= 60 ? "Vérifiez l'usure avant long trajet" : "OK ou date non renseignée" },
    { id: "oil", labelFr: "Vidange / huile", labelEn: "Oil change", ok: urgencyTier(statuses.vidange, "km") !== "critical", detailFr: statuses.vidange != null && statuses.vidange <= 1500 ? "Vidange bientôt due" : "OK" },
    { id: "visite", labelFr: "Visite technique", labelEn: "Inspection", ok: urgencyTier(statuses.visiteTechnique, "days") !== "critical", detailFr: statuses.visiteTechnique != null && statuses.visiteTechnique <= 30 ? "Visite à renouveler" : "OK" },
    { id: "battery", labelFr: "Batterie", labelEn: "Battery", ok: urgencyTier(statuses.batterie, "days") !== "critical", detailFr: statuses.batterie != null && statuses.batterie <= 90 ? "Batterie vieillissante" : "OK" },
    { id: "assurance", labelFr: "Assurance", labelEn: "Insurance", ok: urgencyTier(statuses.assurance, "days") !== "critical", detailFr: statuses.assurance != null && statuses.assurance <= 14 ? "Assurance expire bientôt" : "OK" },
    { id: "freins", labelFr: "Freins", labelEn: "Brakes", ok: urgencyTier(statuses.freins, "days") !== "critical", detailFr: statuses.freins != null && statuses.freins <= 60 ? "Contrôlez les freins" : "OK" },
  ];

  const failed = checks.filter((c) => !c.ok);
  const ready = failed.length === 0;

  res.json({
    ready,
    titleFr: ready ? "Votre voiture est prête pour la route" : "Vérifiez avant le long trajet",
    titleEn: ready ? "Your car is road-trip ready" : "Check before your long drive",
    subtitleFr: ready
      ? "Papiers et entretiens critiques semblent OK. Bon voyage (Tanger, Marrakech, Agadir…) !"
      : `${failed.length} point(s) à traiter avant de partir.`,
    subtitleEn: ready
      ? "Critical papers and maintenance look OK. Safe travels!"
      : `${failed.length} item(s) to address before you leave.`,
    checks,
    health: computeHealthScore(car),
  });
});

// GET /api/garage-intel/community
exports.getCommunityInsights = asyncHandler(async (req, res) => {
  const brand = String(req.query.brand || "").toLowerCase().trim();
  const model = String(req.query.model || "").toLowerCase().trim();
  if (!brand) {
    res.status(400);
    throw new Error("brand required");
  }

  const dbItems = await CommunityCarInsight.find({
    brand,
    ...(model ? { $or: [{ model }, { model: "" }] } : {}),
    approved: true,
  })
    .sort({ upvotes: -1, createdAt: -1 })
    .limit(30)
    .select("-userId")
    .lean();

  const seedItems = SEEDS.filter(
    (s) => s.brand === brand && (!model || !s.model || s.model === model)
  );

  const merged = [...dbItems, ...seedItems.map((s, i) => ({ ...s, _id: `seed-${i}`, source: "curated_ma" }))];

  res.json({ brand, model, insights: merged.slice(0, 25) });
});

// POST /api/garage-intel/community
exports.postCommunityInsight = asyncHandler(async (req, res) => {
  const { brand, model, type, title, body, kmMention, city } = req.body;
  if (!brand || !title || !body) {
    res.status(400);
    throw new Error("brand, title, body required");
  }
  const item = await CommunityCarInsight.create({
    brand: String(brand).toLowerCase().trim(),
    model: String(model || "").toLowerCase().trim(),
    type: type || "maintenance_tip",
    title: String(title).slice(0, 120),
    body: String(body).slice(0, 800),
    kmMention: kmMention ? Number(kmMention) : undefined,
    city: String(city || "").trim(),
    userId: req.user._id,
  });
  res.status(201).json(item);
});

// POST /api/garage-intel/afford
exports.affordCalculator = asyncHandler(async (req, res) => {
  const {
    salaryMad,
    purchasePriceMad,
    brand,
    model,
    year,
    fuelType = "essence",
    kmPerMonth = 1200,
    city = "Casablanca",
    fuelConsumptionL100 = null,
  } = req.body;

  const salary = Number(salaryMad) || 0;
  let price = Number(purchasePriceMad) || 0;
  let tier = "economy";

  if (!price && brand && year) {
    const est = estimate({ brand, model, year, mileage: 80000, fuel: fuelType });
    price = est.mid || 120000;
    tier = est.tier || "economy";
  }

  const fuelKey = String(fuelType).toLowerCase().includes("diesel") ? "diesel" : "essence";
  const pricePerLiter = FUEL_PRICE_MAD[fuelKey] || 14;
  const l100 = fuelConsumptionL100 || (fuelKey === "diesel" ? 6.2 : 7.5);
  const monthlyFuel = Math.round((kmPerMonth / 100) * l100 * pricePerLiter);

  const insKey = tier === "luxury" ? "luxury" : tier === "premium" ? "premium" : tier === "mid" ? "mid" : "economy";
  const monthlyInsurance = INSURANCE_MONTHLY[insKey] || 520;
  const monthlyMaintenance = tier === "premium" || tier === "luxury" ? 650 : tier === "mid" ? 380 : 220;
  const monthlyPapers = Math.round((VIGNETTE_YEARLY + VISITE_YEARLY) / 12);
  const monthlyLoan = price > 0 ? Math.round((price * 0.65) / 48) : 0;
  const monthlyTotal = monthlyFuel + monthlyInsurance + monthlyMaintenance + monthlyPapers + monthlyLoan;
  const pctOfSalary = salary > 0 ? Math.round((monthlyTotal / salary) * 100) : null;

  let verdict = "comfortable";
  let verdictFr = "Coût d'usage raisonnable pour votre salaire.";
  let verdictEn = "Reasonable running cost for your salary.";
  if (pctOfSalary != null && pctOfSalary > 45) {
    verdict = "stretch";
    verdictFr = "Attention : cette voiture peut grignoter une grosse part de votre salaire.";
    verdictEn = "Careful: this car may take a large share of your salary.";
  } else if (pctOfSalary != null && pctOfSalary > 32) {
    verdict = "tight";
    verdictFr = "Budget serré — pensez à une voiture plus économique (Dacia, Renault…).";
    verdictEn = "Tight budget — consider a more economical car.";
  }

  const punchlineFr =
    tier === "premium" || tier === "luxury"
      ? "Cette voiture n'est pas chère seulement à l'achat — l'entretien et l'assurance coûtent cher au Maroc."
      : "L'achat n'est qu'une partie : carburant et entretien comptent chaque mois.";

  res.json({
    purchasePriceMad: price,
    city: normalizeCity(city),
    monthly: {
      fuel: monthlyFuel,
      insurance: monthlyInsurance,
      maintenance: monthlyMaintenance,
      papers: monthlyPapers,
      loanEstimate: monthlyLoan,
      total: monthlyTotal,
    },
    pctOfSalary,
    verdict,
    verdictFr,
    verdictEn,
    punchlineFr,
    punchlineEn: punchlineFr,
    breakdownLabelsFr: {
      fuel: "Carburant",
      insurance: "Assurance",
      maintenance: "Entretien",
      papers: "Vignette + visite",
      loanEstimate: "Crédit estimé (48 mois)",
    },
  });
});

// GET /api/garage-intel/emergency-guide — public Morocco accident flow
exports.getEmergencyGuide = asyncHandler(async (req, res) => {
  res.json({
    titleFr: "J'ai eu un accident",
    titleEn: "I had an accident",
    contacts: [
      { labelFr: "Police", labelEn: "Police", number: "19", tel: "19" },
      { labelFr: "SAMU", labelEn: "Ambulance", number: "15", tel: "15" },
      { labelFr: "Pompiers", labelEn: "Fire", number: "15", tel: "15" },
      { labelFr: "Gendarmerie royale", labelEn: "Gendarmerie", number: "177", tel: "177" },
    ],
    photoChecklistFr: [
      "Vue d'ensemble de la scène",
      "Dégâts sur chaque véhicule",
      "Plaques d'immatriculation",
      "Permis et carte grise de l'autre conducteur",
      "Constat amiable signé (2 exemplaires)",
    ],
    steps: [
      { icon: "🛡️", titleFr: "Sécurité d'abord", titleEn: "Safety first", bodyFr: "Mettez le triangle, gilets, éloignez-vous si danger. Appelez le 19 ou 15 si blessés.", bodyEn: "Hazard lights, triangle, move to safety. Call 19 or 15 if injured." },
      { icon: "📸", titleFr: "Photos", titleEn: "Photos", bodyFr: "Photographiez positions, dégâts, plaques, route et panneaux.", bodyEn: "Photograph positions, damage, plates, road signs." },
      { icon: "📋", titleFr: "Constat amiable", titleEn: "Accident report", bodyFr: "Remplissez le constat à l'amiable sur place. Ne signez pas sous pression. Chacun garde un exemplaire.", bodyEn: "Fill the amicable report on site. Don't sign under pressure." },
      { icon: "📞", titleFr: "Assurance (5 jours)", titleEn: "Insurance (5 days)", bodyFr: "Déclarez le sinistre à votre assurance sous 5 jours ouvrables. Notez le numéro de dossier.", bodyEn: "Declare to insurer within 5 business days." },
      { icon: "🚛", titleFr: "Remorquage", titleEn: "Tow truck", bodyFr: "Si immobilisé : appelez votre assurance (assistance) ou un dépanneur agréé. Évitez les arnaques — demandez un devis.", bodyEn: "If stuck: call insurer assistance or licensed tow. Ask for a quote." },
      { icon: "🔔", titleFr: "Rappel sinistre", titleEn: "Claim reminder", bodyFr: "Gardez photos, constat, et numéro de dossier. Goovoiture peut vous rappeler les étapes restantes.", bodyEn: "Keep photos, report, claim number." },
    ],
  });
});
