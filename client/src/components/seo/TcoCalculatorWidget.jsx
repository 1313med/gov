import { useMemo, useState } from "react";

export default function TcoCalculatorWidget({ bench }) {
  const [kmPerYear, setKmPerYear] = useState(bench.defaultKmPerYear);
  const [year, setYear] = useState(bench.defaultYear);
  const [purchasePrice, setPurchasePrice] = useState(120000);

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
    { label: "Carburant", value: computed.yearly.fuel, color: "bg-orange-400/40" },
    { label: "Assurance", value: computed.yearly.insurance, color: "bg-sky-400/40" },
    { label: "Entretien", value: computed.yearly.maintenance, color: "bg-emerald-400/40" },
    { label: "Vignette & visite", value: computed.yearly.papers, color: "bg-violet-400/40" },
    { label: "Dépréciation", value: computed.yearly.depreciation, color: "bg-gray-400/30" },
  ];

  const inputClass =
    "mt-1 w-full rounded-lg border border-[rgba(12,26,86,0.18)] dark:border-white/12 bg-white dark:bg-[#101426] px-3 py-2 focus:border-[#7c6bff] focus:outline-none";

  return (
    <div>
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="text-[#53608f] dark:text-[#8a95bf]">Prix d&apos;achat (MAD)</span>
          <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value) || 0)} className={inputClass} min={20000} step={5000} />
        </label>
        <label className="block text-sm">
          <span className="text-[#53608f] dark:text-[#8a95bf]">Km / an</span>
          <input type="number" value={kmPerYear} onChange={(e) => setKmPerYear(Number(e.target.value) || 0)} className={inputClass} min={5000} step={1000} />
        </label>
        <label className="block text-sm">
          <span className="text-[#53608f] dark:text-[#8a95bf]">Année modèle</span>
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value) || bench.defaultYear)} className={inputClass} min={2005} max={new Date().getFullYear()} />
        </label>
      </div>

      <div className="mb-8 rounded-2xl border border-[rgba(12,26,86,0.12)] dark:border-white/10 bg-white dark:bg-[#101426] p-6 text-center shadow-sm">
        <p className="text-sm text-[#53608f] dark:text-[#8a95bf]">Coût total annuel estimé — {bench.displayName}</p>
        <p className="mt-1 font-[Poppins] text-4xl font-bold text-[#7c6bff]">
          {computed.yearly.total.toLocaleString()} MAD
        </p>
        <p className="mt-1 text-[#53608f] dark:text-[#8a95bf]">
          {computed.monthly.total.toLocaleString()} MAD/mois · {computed.costPerKm} MAD/km
        </p>
      </div>

      <div className="mb-8 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <div className={`h-8 rounded ${r.color}`} style={{ width: `${Math.max(8, (r.value / computed.yearly.total) * 100)}%` }} />
            <span className="whitespace-nowrap text-sm">{r.label}</span>
            <span className="ml-auto text-sm font-medium">{r.value.toLocaleString()} MAD</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#53608f] dark:text-[#8a95bf]">
        Consommation {bench.consumptionL100} L/100km · carburant {bench.fuelPricePerLiter} MAD/L · dépréciation {(bench.depreciationRate * 100).toFixed(0)}%/an
      </p>
    </div>
  );
}
