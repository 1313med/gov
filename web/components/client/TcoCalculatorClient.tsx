"use client";

import { useMemo, useState } from "react";
import type { TcoPayload } from "@/lib/api";

type Bench = {
  brandSlug: string;
  modelSlug: string;
  displayName: string;
  consumptionL100: number;
  fuelPricePerLiter: number;
  insuranceYear: number;
  maintenanceYear: number;
  papersYear: number;
  depreciationRate: number;
  defaultKmPerYear: number;
  defaultYear: number;
};

export default function TcoCalculatorClient({
  bench,
  initialApi,
}: {
  bench: Bench;
  initialApi: TcoPayload | null;
}) {
  const [kmPerYear, setKmPerYear] = useState(initialApi?.kmPerYear || bench.defaultKmPerYear);
  const [year, setYear] = useState(initialApi?.year || bench.defaultYear);
  const [purchasePrice, setPurchasePrice] = useState(initialApi?.purchasePriceMad || 120000);

  const computed = useMemo(() => {
    const fuelYear = Math.round((kmPerYear / 100) * bench.consumptionL100 * bench.fuelPricePerLiter);
    const depreciationYear = Math.round(purchasePrice * bench.depreciationRate);
    const totalYear = fuelYear + bench.insuranceYear + bench.maintenanceYear + bench.papersYear + depreciationYear;
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
      costPerKm: Math.round((totalYear / kmPerYear) * 100) / 100,
    };
  }, [bench, kmPerYear, purchasePrice, year]);

  const rows = [
    { label: "Carburant", value: computed.yearly.fuel, color: "bg-orange-100" },
    { label: "Assurance", value: computed.yearly.insurance, color: "bg-blue-100" },
    { label: "Entretien", value: computed.yearly.maintenance, color: "bg-green-100" },
    { label: "Vignette & visite", value: computed.yearly.papers, color: "bg-purple-100" },
    { label: "Dépréciation", value: computed.yearly.depreciation, color: "bg-gray-100" },
  ];

  return (
    <div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <label className="block">
          <span className="text-sm text-gray-600">Prix d&apos;achat (MAD)</span>
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            min={20000}
            step={5000}
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Km / an</span>
          <input
            type="number"
            value={kmPerYear}
            onChange={(e) => setKmPerYear(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            min={5000}
            step={1000}
          />
        </label>
        <label className="block">
          <span className="text-sm text-gray-600">Année modèle</span>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || bench.defaultYear)}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            min={2005}
            max={new Date().getFullYear()}
          />
        </label>
      </div>

      <div className="rounded-xl border p-6 mb-8 text-center">
        <p className="text-sm text-gray-500">Coût total annuel estimé</p>
        <p className="text-4xl font-bold text-violet-600">{computed.yearly.total.toLocaleString()} MAD</p>
        <p className="text-gray-600 mt-1">{computed.monthly.total.toLocaleString()} MAD/mois · {computed.costPerKm} MAD/km</p>
      </div>

      <div className="space-y-2 mb-8">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <div className={`h-8 rounded ${r.color}`} style={{ width: `${Math.max(8, (r.value / computed.yearly.total) * 100)}%` }} />
            <span className="text-sm whitespace-nowrap">{r.label}</span>
            <span className="text-sm font-medium ml-auto">{r.value.toLocaleString()} MAD</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        Consommation {bench.consumptionL100} L/100km · carburant {bench.fuelPricePerLiter} MAD/L · dépréciation {(bench.depreciationRate * 100).toFixed(0)}%/an
      </p>
    </div>
  );
}
