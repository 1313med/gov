import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { affordCalculator } from "../api/garageIntel";
import GarageShell from "../components/garage/GarageShell";
import { useAppLang } from "../context/AppLangContext";
import "../styles/garage.css";

export default function AffordCarPage() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    salaryMad: "",
    purchasePriceMad: params.get("price") || "",
    brand: params.get("brand") || "",
    model: params.get("model") || "",
    year: params.get("year") || "",
    fuelType: params.get("fuel") || "essence",
    kmPerMonth: "1200",
    city: params.get("city") || "Casablanca",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runCalc = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await affordCalculator({
        salaryMad: Number(form.salaryMad) || 0,
        purchasePriceMad: Number(form.purchasePriceMad) || undefined,
        brand: form.brand,
        model: form.model,
        year: form.year ? Number(form.year) : undefined,
        fuelType: form.fuelType,
        kmPerMonth: Number(form.kmPerMonth) || 1200,
        city: form.city,
      });
      setResult(r.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GarageShell
      fr={fr}
      emoji="🧮"
      title={fr ? "Je peux me l'offrir ?" : "Can I afford it?"}
      subtitle={fr ? "Le vrai coût mensuel au Maroc" : "True monthly cost in Morocco"}
      heroAccent="#6366f1"
    >
      <form className="ge-glass" onSubmit={runCalc}>
        <label className="ge-spec-label">{fr ? "Salaire net / mois (MAD)" : "Net salary / month"}</label>
        <input className="ge-input" type="number" required value={form.salaryMad} onChange={(e) => setForm((p) => ({ ...p, salaryMad: e.target.value }))} />
        <label className="ge-spec-label">{fr ? "Prix voiture (MAD)" : "Car price"}</label>
        <input className="ge-input" type="number" value={form.purchasePriceMad} onChange={(e) => setForm((p) => ({ ...p, purchasePriceMad: e.target.value }))} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input className="ge-input" placeholder="Marque" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} />
          <input className="ge-input" placeholder="Modèle" value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} />
        </div>
        <select className="ge-input" value={form.fuelType} onChange={(e) => setForm((p) => ({ ...p, fuelType: e.target.value }))}>
          <option value="essence">Essence</option>
          <option value="diesel">Diesel</option>
        </select>
        <button type="submit" className="ge-btn-primary" disabled={loading}>
          {loading ? "…" : fr ? "Calculer" : "Calculate"}
        </button>
      </form>

      {result && (
        <>
          <div className="ge-price-hero ge-slide-up">
            <p style={{ margin: 0, fontSize: 13, color: "var(--ge-muted)" }}>{fr ? "Coût mensuel total" : "Total monthly"}</p>
            <p className="big">{result.monthly.total.toLocaleString()} MAD</p>
            {result.pctOfSalary != null && (
              <p style={{ fontWeight: 800, marginTop: 8 }}>{result.pctOfSalary}% {fr ? "du salaire" : "of salary"}</p>
            )}
          </div>
          <div className="ge-glass">
            <p style={{ fontStyle: "italic", color: "var(--ge-accent)", marginBottom: 16 }}>{result.punchlineFr}</p>
            <p style={{ fontWeight: 700, marginBottom: 12 }}>{result.verdictFr}</p>
            {Object.entries(result.breakdownLabelsFr).map(([key, label]) => (
              <div key={key} className="ge-budget-row">
                <span>{label}</span>
                <strong>{result.monthly[key]?.toLocaleString()} MAD</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </GarageShell>
  );
}
