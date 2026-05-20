import { useState, useEffect } from "react";
import { getFuelLogs, addFuelLog, deleteFuelLog, getCostOfOwnership } from "../api/fuelLogs";
import { api } from "../api/axios";

export default function FuelTrackerPage() {
  const [cars, setCars]     = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [logs, setLogs]     = useState([]);
  const [stats, setStats]   = useState(null);
  const [coo, setCoo]       = useState(null);
  const [tab, setTab]       = useState("logs");
  const [form, setForm]     = useState({ liters: "", pricePerLiter: "", kmAtFillup: "", fuelType: "essence", date: new Date().toISOString().slice(0, 10), note: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState(null);

  useEffect(() => {
    api.get("/user-car").then((r) => {
      const list = r.data?.cars || r.data || [];
      setCars(list);
      if (list.length) setSelectedCar(list[0]);
    });
  }, []);

  useEffect(() => {
    if (!selectedCar) return;
    getFuelLogs(selectedCar._id).then((r) => { setLogs(r.data.logs || []); setStats(r.data.stats); });
    getCostOfOwnership(selectedCar._id).then((r) => setCoo(r.data)).catch(() => setCoo(null));
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
      setForm((p) => ({ ...p, liters: "", kmAtFillup: "", note: "" }));
      setMsg({ type: "success", text: "Plein enregistré !" });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce plein ?")) return;
    await deleteFuelLog(id);
    const r = await getFuelLogs(selectedCar._id);
    setLogs(r.data.logs || []);
    setStats(r.data.stats);
  };

  const totalCost = form.liters && form.pricePerLiter
    ? (parseFloat(form.liters) * parseFloat(form.pricePerLiter)).toFixed(2)
    : null;

  if (!cars.length) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-3">⛽</div>
        <h1 className="text-xl font-bold mb-2">Suivi de carburant</h1>
        <p className="text-gray-500 text-sm">Ajoutez d'abord une voiture dans votre Garage pour commencer le suivi.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">⛽ Suivi de carburant</h1>

      {/* Car selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {cars.map((car) => (
          <button
            key={car._id}
            onClick={() => setSelectedCar(car)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${selectedCar?._id === car._id ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}
          >
            {car.brand} {car.model}
          </button>
        ))}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.avgConsumptionL100km}</p>
            <p className="text-xs text-gray-500">L/100km</p>
          </div>
          <div className="border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.totalFuelSpentMad.toLocaleString("fr-FR")}</p>
            <p className="text-xs text-gray-500">MAD dépensés</p>
          </div>
          <div className="border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.totalFillups}</p>
            <p className="text-xs text-gray-500">pleins enregistrés</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {["logs", "add", "costs"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? "bg-blue-600 text-white" : "border hover:bg-gray-50"}`}>
            {t === "logs" ? "Historique" : t === "add" ? "+ Ajouter" : "Coûts totaux"}
          </button>
        ))}
      </div>

      {/* Add form */}
      {tab === "add" && (
        <form onSubmit={handleAdd} className="border rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Litres ajoutés</label>
              <input type="number" step="0.1" value={form.liters} onChange={(e) => setForm((p) => ({ ...p, liters: e.target.value }))} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ex: 45.5" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Prix / litre (MAD)</label>
              <input type="number" step="0.01" value={form.pricePerLiter} onChange={(e) => setForm((p) => ({ ...p, pricePerLiter: e.target.value }))} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ex: 14.50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Kilométrage actuel</label>
              <input type="number" value={form.kmAtFillup} onChange={(e) => setForm((p) => ({ ...p, kmAtFillup: e.target.value }))} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Ex: 85000" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type de carburant</label>
              <select value={form.fuelType} onChange={(e) => setForm((p) => ({ ...p, fuelType: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="essence">Essence</option>
                <option value="diesel">Diesel</option>
                <option value="hybride">Hybride</option>
                <option value="electrique">Électrique</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date du plein</label>
            <input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          {totalCost && (
            <div className="bg-blue-50 rounded-lg px-4 py-2 text-sm text-blue-700 font-medium">
              Total : {totalCost} MAD
            </div>
          )}
          {msg && (
            <div className={`rounded-lg px-4 py-2 text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>
          )}
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? "Enregistrement…" : "Enregistrer le plein"}
          </button>
        </form>
      )}

      {/* Logs list */}
      {tab === "logs" && (
        <div className="space-y-3">
          {!logs.length && <p className="text-gray-400 text-center py-8 text-sm">Aucun plein enregistré. Ajoutez votre premier plein !</p>}
          {logs.map((log) => (
            <div key={log._id} className="border rounded-xl p-4 flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">{log.liters}L — {log.totalCost?.toFixed(2)} MAD</p>
                <p className="text-xs text-gray-500">{new Date(log.date).toLocaleDateString("fr-FR")} · {log.kmAtFillup?.toLocaleString("fr-FR")} km · {log.pricePerLiter} MAD/L</p>
                {log.note && <p className="text-xs text-gray-400 mt-0.5 italic">{log.note}</p>}
              </div>
              <button onClick={() => handleDelete(log._id)} className="text-red-400 hover:text-red-600 text-sm ml-2">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Cost of ownership */}
      {tab === "costs" && coo && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="border rounded-xl p-4 bg-blue-50">
              <p className="text-xs text-blue-500 mb-1">Carburant (12 mois)</p>
              <p className="text-2xl font-bold text-blue-700">{coo.totals.fuel.toLocaleString("fr-FR")} MAD</p>
            </div>
            <div className="border rounded-xl p-4 bg-orange-50">
              <p className="text-xs text-orange-500 mb-1">Entretien (12 mois)</p>
              <p className="text-2xl font-bold text-orange-700">{coo.totals.maintenance.toLocaleString("fr-FR")} MAD</p>
            </div>
            <div className="border rounded-xl p-4 bg-gray-50 col-span-2">
              <p className="text-xs text-gray-500 mb-1">Coût mensuel moyen</p>
              <p className="text-3xl font-bold text-gray-800">{coo.totals.monthlyAvg.toLocaleString("fr-FR")} MAD<span className="text-lg font-normal">/mois</span></p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Évolution mensuelle</p>
            {coo.timeline.map((m) => (
              <div key={m.month} className="flex items-center gap-3 mb-1">
                <p className="text-xs text-gray-400 w-16">{m.month.slice(0, 7)}</p>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${coo.totals.total ? Math.min(100, (m.total / coo.totals.total) * 12 * 100) : 0}%` }} />
                </div>
                <p className="text-xs font-medium text-gray-600 w-16 text-right">{m.total.toLocaleString("fr-FR")} MAD</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
