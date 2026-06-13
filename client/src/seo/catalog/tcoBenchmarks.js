import { getVehicleSpec } from "./vehicleSpecs.js";

/** TCO benchmarks — aligned with vehicleSpecs models only. */
const TCO = {
  "dacia:logan": { tier: "economy", consumptionL100: 5.0, fuel: "diesel", maintenanceYear: 3200, insuranceYear: 4200, depreciationRate: 0.08 },
  "dacia:sandero": { tier: "economy", consumptionL100: 5.2, fuel: "essence", maintenanceYear: 2800, insuranceYear: 4000, depreciationRate: 0.09 },
  "dacia:duster": { tier: "economy", consumptionL100: 5.8, fuel: "diesel", maintenanceYear: 3800, insuranceYear: 4800, depreciationRate: 0.08 },
  "renault:clio": { tier: "mid", consumptionL100: 5.2, fuel: "essence", maintenanceYear: 4200, insuranceYear: 5200, depreciationRate: 0.1 },
  "renault:symbol": { tier: "economy", consumptionL100: 5.5, fuel: "diesel", maintenanceYear: 3000, insuranceYear: 4100, depreciationRate: 0.08 },
  "peugeot:208": { tier: "mid", consumptionL100: 5.4, fuel: "essence", maintenanceYear: 4800, insuranceYear: 5800, depreciationRate: 0.11 },
  "hyundai:i10": { tier: "economy", consumptionL100: 4.9, fuel: "essence", maintenanceYear: 2900, insuranceYear: 3900, depreciationRate: 0.09 },
  "hyundai:tucson": { tier: "mid", consumptionL100: 6.8, fuel: "essence", maintenanceYear: 5200, insuranceYear: 6800, depreciationRate: 0.1 },
  "volkswagen:polo": { tier: "mid", consumptionL100: 5.3, fuel: "essence", maintenanceYear: 4500, insuranceYear: 5500, depreciationRate: 0.1 },
  "toyota:yaris": { tier: "mid", consumptionL100: 4.2, fuel: "hybride", maintenanceYear: 3500, insuranceYear: 5400, depreciationRate: 0.09 },
  "kia:picanto": { tier: "economy", consumptionL100: 4.9, fuel: "essence", maintenanceYear: 2800, insuranceYear: 3800, depreciationRate: 0.09 },
  "fiat:500": { tier: "mid", consumptionL100: 5.0, fuel: "essence", maintenanceYear: 4200, insuranceYear: 5000, depreciationRate: 0.12 },
  "seat:ibiza": { tier: "mid", consumptionL100: 5.2, fuel: "essence", maintenanceYear: 4300, insuranceYear: 5100, depreciationRate: 0.11 },
  "mercedes:classe-a": { tier: "premium", consumptionL100: 6.8, fuel: "essence", maintenanceYear: 9500, insuranceYear: 9800, depreciationRate: 0.13 },
  "bmw:serie-3": { tier: "premium", consumptionL100: 6.5, fuel: "diesel", maintenanceYear: 10200, insuranceYear: 10500, depreciationRate: 0.14 },
};

const FUEL_PRICES = { essence: 14.2, diesel: 13.5, hybride: 14.2 };
const PAPERS_YEAR = 750;

export function getTcoBenchmark(brandSlug, modelSlug) {
  const spec = getVehicleSpec(brandSlug, modelSlug);
  if (!spec) return null;
  const key = `${brandSlug}:${modelSlug}`;
  const bench = TCO[key];
  if (!bench) return null;
  return {
    brandSlug,
    modelSlug,
    displayName: spec.displayName,
    segment: spec.segment,
    ...bench,
    fuelPricePerLiter: FUEL_PRICES[bench.fuel] || 14.2,
    papersYear: PAPERS_YEAR,
    defaultKmPerYear: 15000,
    defaultYear: new Date().getFullYear() - 3,
  };
}

export function getAllTcoBenchmarks() {
  return Object.keys(TCO)
    .map((key) => {
      const [brandSlug, modelSlug] = key.split(":");
      return getTcoBenchmark(brandSlug, modelSlug);
    })
    .filter(Boolean);
}

export function computeTcoLocal(bench, { purchasePrice, kmPerYear, year }) {
  const km = kmPerYear || bench.defaultKmPerYear;
  const price = purchasePrice || 120000;
  const fuelYear = Math.round((km / 100) * bench.consumptionL100 * bench.fuelPricePerLiter);
  const depreciationYear = Math.round(price * bench.depreciationRate);
  const totalYear =
    fuelYear + bench.insuranceYear + bench.maintenanceYear + bench.papersYear + depreciationYear;
  return {
    yearly: {
      fuel: fuelYear,
      insurance: bench.insuranceYear,
      maintenance: bench.maintenanceYear,
      papers: bench.papersYear,
      depreciation: depreciationYear,
      total: totalYear,
    },
    monthly: { total: Math.round(totalYear / 12) },
    costPerKm: Math.round((totalYear / km) * 100) / 100,
    purchasePriceMad: price,
    kmPerYear: km,
    year: year || bench.defaultYear,
  };
}
