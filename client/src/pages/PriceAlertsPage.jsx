import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getMyAlerts, createAlert, deleteAlert, toggleAlert } from "../api/price";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";

const FUEL_OPTIONS = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"];

export default function PriceAlertsPage() {
  const { lang } = useAppLang();
  const { dark } = useTheme();
  const fr = lang === "fr";

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ brand: "", model: "", maxPrice: "", minYear: "", fuelType: "", city: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyAlerts();
      setAlerts(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.brand.trim() || !form.maxPrice.trim()) {
      alert(fr ? "Marque et prix max requis." : "Brand and max price required.");
      return;
    }
    setSaving(true);
    try {
      const res = await createAlert({
        brand: form.brand.trim(),
        model: form.model.trim() || undefined,
        maxPrice: Number(form.maxPrice),
        minYear: form.minYear ? Number(form.minYear) : undefined,
        fuelType: form.fuelType || undefined,
        city: form.city.trim() || undefined,
      });
      setAlerts((p) => [res.data, ...p]);
      setModal(false);
      setForm({ brand: "", model: "", maxPrice: "", minYear: "", fuelType: "", city: "" });
    } catch (err) {
      alert(err?.response?.data?.message || (fr ? "Erreur" : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(fr ? "Supprimer cette alerte ?" : "Delete this alert?")) return;
    await deleteAlert(id);
    setAlerts((p) => p.filter((a) => a._id !== id));
  };

  const handleToggle = async (id) => {
    const res = await toggleAlert(id);
    setAlerts((p) => p.map((a) => (a._id === id ? res.data : a)));
  };

  const bg = dark ? "#05060f" : "#f5f7ff";
  const card = dark ? "#101426" : "#fff";
  const txt = dark ? "#f5f7ff" : "#0b163d";

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "32px 24px 80px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: txt }}>{fr ? "Alertes prix" : "Price alerts"}</h1>
        <button type="button" onClick={() => setModal(true)} style={{ padding: "10px 18px", borderRadius: 10, background: "#7c6bff", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>
          + {fr ? "Nouvelle" : "New"}
        </button>
      </div>
      <Link to="/estimate" style={{ color: "#7c6bff", fontSize: 14 }}>{fr ? "Estimer un véhicule →" : "Estimate a vehicle →"}</Link>

      {loading ? (
        <p style={{ marginTop: 24, color: "#94a3b8" }}>{fr ? "Chargement…" : "Loading…"}</p>
      ) : alerts.length === 0 ? (
        <p style={{ marginTop: 24, color: "#94a3b8" }}>{fr ? "Aucune alerte." : "No alerts yet."}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 24 }}>
          {alerts.map((a) => (
            <li key={a._id} style={{ background: card, padding: 16, borderRadius: 12, marginBottom: 10, border: "1px solid rgba(148,163,184,.2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <strong style={{ color: txt }}>{a.brand} {a.model || ""}</strong>
                  <p style={{ margin: "4px 0 0", color: "#7c6bff" }}>≤ {Number(a.maxPrice).toLocaleString()} MAD</p>
                  {a.city && <p style={{ fontSize: 12, color: "#94a3b8" }}>{a.city}</p>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => handleToggle(a._id)} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(148,163,184,.3)", background: "transparent", color: txt, cursor: "pointer" }}>
                    {a.active !== false ? (fr ? "Actif" : "On") : (fr ? "Off" : "Off")}
                  </button>
                  <button type="button" onClick={() => handleDelete(a._id)} style={{ fontSize: 12, color: "#f43f5e", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <form onSubmit={handleCreate} style={{ background: card, padding: 24, borderRadius: 16, width: "100%", maxWidth: 400 }}>
            <h2 style={{ color: txt, marginBottom: 16 }}>{fr ? "Nouvelle alerte" : "New alert"}</h2>
            {["brand", "model", "maxPrice", "minYear", "city"].map((k) => (
              <input key={k} placeholder={k} value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} style={{ width: "100%", marginBottom: 10, padding: 10, borderRadius: 8, border: "1px solid rgba(148,163,184,.3)" }} />
            ))}
            <select value={form.fuelType} onChange={(e) => setForm((f) => ({ ...f, fuelType: e.target.value }))} style={{ width: "100%", marginBottom: 16, padding: 10 }}>
              <option value="">{fr ? "Carburant" : "Fuel"}</option>
              {FUEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setModal(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(148,163,184,.3)", background: "transparent", color: txt }}>{fr ? "Annuler" : "Cancel"}</button>
              <button type="submit" disabled={saving} style={{ flex: 1, padding: 10, borderRadius: 8, background: "#7c6bff", color: "#fff", border: "none" }}>{saving ? "…" : "OK"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
