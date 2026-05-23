import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFuelLogs, addFuelLog, deleteFuelLog, getCostOfOwnership } from "../api/fuelLogs";
import { getMyCar } from "../api/userCar";
import { getFuelCompare } from "../api/garageIntel";
import GarageShell from "../components/garage/GarageShell";
import { useAppLang } from "../context/AppLangContext";
import "../styles/garage.css";

export default function FuelTrackerPage() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const [selectedCar, setSelectedCar] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [coo, setCoo] = useState(null);
  const [tab, setTab] = useState("logs");
  const [form, setForm] = useState({
    liters: "",
    pricePerLiter: "",
    kmAtFillup: "",
    fuelType: "essence",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [compare, setCompare] = useState(null);
  const [hasCar, setHasCar] = useState(true);

  useEffect(() => {
    getMyCar()
      .then((r) => {
        const c = r.data;
        if (c?._id) setSelectedCar(c);
        else setHasCar(false);
      })
      .catch(() => setHasCar(false));
  }, []);

  useEffect(() => {
    if (!selectedCar) return;
    getFuelLogs(selectedCar._id).then((r) => {
      setLogs(r.data.logs || []);
      setStats(r.data.stats);
    });
    getCostOfOwnership(selectedCar._id).then((r) => setCoo(r.data)).catch(() => setCoo(null));
    getFuelCompare(selectedCar._id).then((r) => setCompare(r.data)).catch(() => setCompare(null));
  }, [selectedCar]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await addFuelLog({ ...form, userCarId: selectedCar._id });
      const r = await getFuelLogs(selectedCar._id);
      setLogs(r.data.logs || []);
      setStats(r.data.stats);
      getFuelCompare(selectedCar._id).then((res) => setCompare(res.data));
      setForm((p) => ({ ...p, liters: "", kmAtFillup: "", note: "" }));
      setMsg({ type: "success", text: fr ? "Plein enregistré !" : "Fill-up saved!" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  if (!hasCar) {
    return (
      <GarageShell fr={fr} emoji="⛽" title={fr ? "Carburant" : "Fuel"} subtitle="">
        <div className="ge-empty-wow">
          <p>{fr ? "Ajoutez d'abord votre voiture au garage." : "Add your car to the garage first."}</p>
          <Link to="/garage/add" className="ge-cta">{fr ? "Ajouter ma voiture" : "Add my car"}</Link>
        </div>
      </GarageShell>
    );
  }

  const totalCost =
    form.liters && form.pricePerLiter
      ? (parseFloat(form.liters) * parseFloat(form.pricePerLiter)).toFixed(2)
      : null;

  return (
    <GarageShell
      fr={fr}
      emoji="⛽"
      title={fr ? "Carburant" : "Fuel"}
      subtitle={
        selectedCar
          ? `${selectedCar.brand} ${selectedCar.model} — L/100km & comparaison Maroc`
          : ""
      }
      heroAccent="#38bdf8"
    >
      {compare?.myConsumptionL100km != null && (
        <div className="ge-price-hero ge-slide-up">
          <p style={{ margin: 0, fontSize: 13, color: "var(--ge-muted)" }}>{fr ? "Votre consommation" : "Your consumption"}</p>
          <p className="big">{compare.myConsumptionL100km} L/100km</p>
          <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.5 }}>{compare.messageFr}</p>
          {compare.betterThanPct != null && (
            <div style={{ marginTop: 16, height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 999 }}>
              <div
                style={{
                  width: `${compare.betterThanPct}%`,
                  height: "100%",
                  background: "linear-gradient(90deg,#22c55e,#4ade80)",
                  borderRadius: 999,
                  transition: "width 1s ease",
                }}
              />
            </div>
          )}
        </div>
      )}

      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { v: stats.avgConsumptionL100km, l: "L/100km" },
            { v: stats.totalFuelSpentMad?.toLocaleString("fr-FR"), l: "MAD" },
            { v: stats.totalFillups, l: fr ? "pleins" : "fill-ups" },
          ].map((s) => (
            <div key={s.l} className="ge-glass" style={{ textAlign: "center", padding: 14 }}>
              <p style={{ margin: 0, fontSize: "1.35rem", fontWeight: 800, color: "var(--ge-accent)" }}>{s.v}</p>
              <p style={{ margin: 4, fontSize: 11, color: "var(--ge-muted)" }}>{s.l}</p>
            </div>
          ))}
        </div>
      )}

      <div className="ge-chip-row" style={{ marginBottom: 16 }}>
        {["logs", "add", "costs"].map((t) => (
          <button
            key={t}
            type="button"
            className={`ge-chip-v2${tab === t ? " on" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "logs" ? (fr ? "Historique" : "History") : t === "add" ? "+ Plein" : (fr ? "Coûts" : "Costs")}
          </button>
        ))}
      </div>

      {tab === "add" && (
        <form onSubmit={handleAdd} className="ge-glass">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input className="ge-input" type="number" step="0.1" required placeholder="Litres" value={form.liters} onChange={(e) => setForm((p) => ({ ...p, liters: e.target.value }))} />
            <input className="ge-input" type="number" step="0.01" required placeholder="MAD/L" value={form.pricePerLiter} onChange={(e) => setForm((p) => ({ ...p, pricePerLiter: e.target.value }))} />
            <input className="ge-input" type="number" required placeholder="Km compteur" value={form.kmAtFillup} onChange={(e) => setForm((p) => ({ ...p, kmAtFillup: e.target.value }))} />
            <select className="ge-input" value={form.fuelType} onChange={(e) => setForm((p) => ({ ...p, fuelType: e.target.value }))}>
              <option value="essence">Essence</option>
              <option value="diesel">Diesel</option>
            </select>
          </div>
          {totalCost && (
            <p style={{ textAlign: "center", fontWeight: 800, color: "var(--ge-accent)" }}>Total : {totalCost} MAD</p>
          )}
          {msg && (
            <p style={{ color: msg.type === "success" ? "#4ade80" : "#f87171", fontSize: 14 }}>{msg.text}</p>
          )}
          <button type="submit" className="ge-btn-primary" disabled={saving}>
            {saving ? "…" : fr ? "Enregistrer le plein" : "Save fill-up"}
          </button>
        </form>
      )}

      {tab === "logs" && (
        <div>
          {!logs.length && (
            <p style={{ textAlign: "center", color: "var(--ge-muted)", padding: 24 }}>
              {fr ? "Aucun plein — ajoutez le premier !" : "No fill-ups yet."}
            </p>
          )}
          {logs.map((log, i) => (
            <div key={log._id} className="ge-feature-card ge-stagger" style={{ animationDelay: `${i * 0.03}s`, cursor: "default" }}>
              <div className="ge-feature-text">
                <strong>{log.liters}L — {log.totalCost?.toFixed(2)} MAD</strong>
                <span>
                  {new Date(log.date).toLocaleDateString("fr-FR")} · {log.kmAtFillup?.toLocaleString("fr-FR")} km
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm(fr ? "Supprimer ?" : "Delete?")) return;
                  await deleteFuelLog(log._id);
                  const r = await getFuelLogs(selectedCar._id);
                  setLogs(r.data.logs || []);
                  setStats(r.data.stats);
                }}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "costs" && coo && (
        <div className="ge-glass">
          <p className="ge-km-big" style={{ fontSize: "1.75rem", textAlign: "center" }}>
            {coo.totals.monthlyAvg.toLocaleString("fr-FR")} MAD
            <span style={{ fontSize: 14 }}> / {fr ? "mois" : "mo"}</span>
          </p>
          <div className="ge-budget-row">
            <span>{fr ? "Carburant (12 mois)" : "Fuel (12 mo)"}</span>
            <strong>{coo.totals.fuel.toLocaleString("fr-FR")} MAD</strong>
          </div>
          <div className="ge-budget-row">
            <span>{fr ? "Entretien" : "Maintenance"}</span>
            <strong>{coo.totals.maintenance.toLocaleString("fr-FR")} MAD</strong>
          </div>
        </div>
      )}
    </GarageShell>
  );
}
