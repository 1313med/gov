import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyCar,
  deleteCar,
  patchMileage,
  patchGarageReminders,
  getServiceLogs,
  createServiceLog,
  deleteServiceLog,
} from "../api/userCar";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";

export default function GaragePage() {
  const navigate = useNavigate();
  const { lang } = useAppLang();
  const { dark } = useTheme();
  const fr = lang === "fr";

  const [car, setCar] = useState(null);
  const [serviceLogs, setServiceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mileage, setMileage] = useState("");
  const [mileageSaving, setMileageSaving] = useState(false);
  const [remindersOn, setRemindersOn] = useState(true);
  const [logModal, setLogModal] = useState(false);
  const [logForm, setLogForm] = useState({ type: "oil", date: "", mileage: "", cost: "", notes: "", provider: "" });
  const [logSaving, setLogSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [carRes, logsRes] = await Promise.all([
        getMyCar(),
        getServiceLogs().catch(() => ({ data: [] })),
      ]);
      const c = carRes.data;
      setCar(c);
      setMileage(c?.mileage != null ? String(c.mileage) : "");
      setRemindersOn(c?.garageSettings?.remindersEnabled !== false);
      setServiceLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch {
      setCar(null);
      setServiceLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveMileage = async () => {
    if (!car?._id) return;
    setMileageSaving(true);
    try {
      await patchMileage(car._id, { mileage: Number(mileage) });
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Error");
    } finally {
      setMileageSaving(false);
    }
  };

  const toggleReminders = async () => {
    if (!car?._id) return;
    const next = !remindersOn;
    try {
      await patchGarageReminders(car._id, next);
      setRemindersOn(next);
    } catch (e) {
      alert(e?.response?.data?.message || "Error");
    }
  };

  const handleDeleteCar = async () => {
    if (!car?._id || !window.confirm(fr ? "Supprimer ce véhicule du garage ?" : "Remove this vehicle from garage?")) return;
    await deleteCar(car._id);
    setCar(null);
  };

  const submitLog = async (e) => {
    e.preventDefault();
    setLogSaving(true);
    try {
      await createServiceLog({
        userCarId: car._id,
        type: logForm.type,
        date: logForm.date || new Date().toISOString().slice(0, 10),
        mileage: logForm.mileage ? Number(logForm.mileage) : undefined,
        cost: logForm.cost ? Number(logForm.cost) : undefined,
        notes: logForm.notes || undefined,
        provider: logForm.provider || undefined,
      });
      setLogModal(false);
      load();
    } catch (err) {
      alert(err?.response?.data?.message || "Error");
    } finally {
      setLogSaving(false);
    }
  };

  const bg = dark ? "#05060f" : "#f0f9ff";
  const card = dark ? "#101426" : "#fff";
  const txt = dark ? "#f5f7ff" : "#0b163d";
  const accent = "#38bdf8";

  if (loading) {
    return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: txt }}>{fr ? "Chargement…" : "Loading…"}</div>;
  }

  if (!car) {
    return (
      <div style={{ minHeight: "100vh", background: bg, padding: "48px 24px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: txt }}>{fr ? "Mon garage" : "My garage"}</h1>
        <p style={{ color: "#94a3b8", margin: "16px 0 32px" }}>
          {fr ? "Ajoutez votre véhicule pour suivre l'entretien, le kilométrage et vendre plus tard." : "Add your vehicle to track maintenance, mileage, and sell later."}
        </p>
        <Link to="/garage/add" style={{ display: "inline-block", padding: "14px 28px", borderRadius: 12, background: accent, color: "#fff", fontWeight: 700, textDecoration: "none" }}>
          {fr ? "+ Ajouter ma voiture" : "+ Add my car"}
        </Link>
        <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <Link to="/my-sales/new" style={{ color: "#7c6bff" }}>{fr ? "Vendre sans garage" : "Sell without garage"}</Link>
        </div>
      </div>
    );
  }

  const img = car.image || car.images?.[0];

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "32px 24px 80px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <p style={{ fontSize: 10, letterSpacing: 2, color: accent, fontWeight: 800 }}>GARAGE</p>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: txt, margin: "4px 0" }}>
            {car.brand} {car.model}
          </h1>
          <p style={{ color: "#94a3b8" }}>{car.year} · {car.fuel || "—"} · {car.gearbox || "—"}</p>
        </div>
        {img && <img src={img} alt="" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 12 }} />}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { to: "/estimate", label: fr ? "Estimation" : "Estimate", q: `brand=${encodeURIComponent(car.brand || "")}&model=${encodeURIComponent(car.model || "")}&year=${car.year || ""}&mileage=${car.mileage || ""}` },
          { to: "/price-alerts", label: fr ? "Alertes prix" : "Price alerts" },
          { to: "/fuel-tracker", label: fr ? "Carburant" : "Fuel" },
          { to: "/garage/documents", label: fr ? "Documents" : "Documents" },
          { to: "/my-sales/new", label: fr ? "Vendre" : "Sell" },
          { to: "/dashboard", label: fr ? "Mes annonces" : "My listings" },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.q ? `${item.to}?${item.q}` : item.to}
            style={{ padding: 14, borderRadius: 12, background: card, border: `1px solid ${accent}33`, color: txt, textDecoration: "none", fontWeight: 600, fontSize: 14 }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div style={{ background: card, padding: 20, borderRadius: 16, marginBottom: 16, border: "1px solid rgba(148,163,184,.2)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: txt, marginBottom: 12 }}>{fr ? "Kilométrage" : "Mileage"}</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, border: "1px solid rgba(148,163,184,.3)" }} />
          <button type="button" onClick={saveMileage} disabled={mileageSaving} style={{ padding: "10px 16px", borderRadius: 8, background: accent, color: "#fff", border: "none", fontWeight: 700 }}>
            {mileageSaving ? "…" : (fr ? "Enregistrer" : "Save")}
          </button>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, color: txt, fontSize: 14 }}>
          <input type="checkbox" checked={remindersOn} onChange={toggleReminders} />
          {fr ? "Rappels d'entretien (navigateur)" : "Maintenance reminders (browser)"}
        </label>
      </div>

      <div style={{ background: card, padding: 20, borderRadius: 16, border: "1px solid rgba(148,163,184,.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: txt }}>{fr ? "Historique entretien" : "Service history"}</h2>
          <button type="button" onClick={() => setLogModal(true)} style={{ padding: "8px 14px", borderRadius: 8, background: accent, color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
            + {fr ? "Ajouter" : "Add"}
          </button>
        </div>
        {serviceLogs.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>{fr ? "Aucun enregistrement." : "No entries yet."}</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {serviceLogs.map((log) => (
              <li key={log._id} style={{ padding: "12px 0", borderBottom: "1px solid rgba(148,163,184,.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: txt }}>{log.type}</strong>
                  <span style={{ color: "#94a3b8", fontSize: 13, marginLeft: 8 }}>{log.date ? new Date(log.date).toLocaleDateString() : ""}</span>
                  {log.cost != null && <p style={{ margin: "4px 0 0", color: accent }}>{Number(log.cost).toLocaleString()} MAD</p>}
                </div>
                <button type="button" onClick={() => deleteServiceLog(log._id).then(load)} style={{ color: "#f43f5e", background: "none", border: "none", cursor: "pointer" }}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to={`/garage/add?id=${car._id}`} style={{ color: accent }}>{fr ? "Modifier le véhicule" : "Edit vehicle"}</Link>
        <button type="button" onClick={handleDeleteCar} style={{ color: "#f43f5e", background: "none", border: "none", cursor: "pointer" }}>
          {fr ? "Supprimer du garage" : "Remove from garage"}
        </button>
      </div>

      {logModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <form onSubmit={submitLog} style={{ background: card, padding: 24, borderRadius: 16, width: "100%", maxWidth: 400 }}>
            <h3 style={{ color: txt, marginBottom: 16 }}>{fr ? "Nouvel entretien" : "New service"}</h3>
            <select value={logForm.type} onChange={(e) => setLogForm((f) => ({ ...f, type: e.target.value }))} style={{ width: "100%", marginBottom: 10, padding: 10 }}>
              {["oil", "tires", "brakes", "inspection", "repair", "other"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input type="date" value={logForm.date} onChange={(e) => setLogForm((f) => ({ ...f, date: e.target.value }))} style={{ width: "100%", marginBottom: 10, padding: 10 }} />
            <input placeholder={fr ? "Km" : "Mileage"} value={logForm.mileage} onChange={(e) => setLogForm((f) => ({ ...f, mileage: e.target.value }))} style={{ width: "100%", marginBottom: 10, padding: 10 }} />
            <input placeholder={fr ? "Coût MAD" : "Cost MAD"} value={logForm.cost} onChange={(e) => setLogForm((f) => ({ ...f, cost: e.target.value }))} style={{ width: "100%", marginBottom: 10, padding: 10 }} />
            <input placeholder={fr ? "Garage / prestataire" : "Provider"} value={logForm.provider} onChange={(e) => setLogForm((f) => ({ ...f, provider: e.target.value }))} style={{ width: "100%", marginBottom: 10, padding: 10 }} />
            <textarea placeholder={fr ? "Notes" : "Notes"} value={logForm.notes} onChange={(e) => setLogForm((f) => ({ ...f, notes: e.target.value }))} style={{ width: "100%", marginBottom: 16, padding: 10, minHeight: 60 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => setLogModal(false)} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid rgba(148,163,184,.3)", background: "transparent", color: txt }}>{fr ? "Annuler" : "Cancel"}</button>
              <button type="submit" disabled={logSaving} style={{ flex: 1, padding: 10, borderRadius: 8, background: accent, color: "#fff", border: "none" }}>{logSaving ? "…" : "OK"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
