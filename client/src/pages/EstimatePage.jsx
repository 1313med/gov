import { useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { estimatePrice, createAlert } from "../api/price";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";

const FUEL_OPTIONS = ["Essence", "Diesel", "Hybride", "Électrique", "GPL"];
const GEARBOX_OPTIONS = ["Manuelle", "Automatique"];

export default function EstimatePage() {
  const [params] = useSearchParams();
  const { lang } = useAppLang();
  const { dark } = useTheme();
  const fr = lang === "fr";

  const [form, setForm] = useState({
    brand: params.get("brand") || "",
    model: params.get("model") || "",
    year: params.get("year") || "",
    mileage: params.get("mileage") || "",
    fuel: params.get("fuel") || "",
    gearbox: params.get("gearbox") || "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alertSaving, setAlertSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleEstimate = useCallback(async (e) => {
    e?.preventDefault();
    if (!form.brand.trim() || !form.year.trim()) {
      alert(fr ? "La marque et l'année sont obligatoires." : "Brand and year are required.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await estimatePrice(form);
      setResult(res.data);
    } catch (err) {
      alert(err?.response?.data?.message || (fr ? "Impossible d'estimer" : "Estimate failed"));
    } finally {
      setLoading(false);
    }
  }, [form, fr]);

  const handleCreateAlert = async () => {
    if (!result) return;
    setAlertSaving(true);
    try {
      await createAlert({
        brand: form.brand,
        model: form.model || undefined,
        maxPrice: result.mid,
        fuelType: form.fuel || undefined,
      });
      alert(
        fr
          ? `Alerte créée — vous serez notifié sous ${result.mid.toLocaleString()} MAD.`
          : `Alert created — you'll be notified below ${result.mid.toLocaleString()} MAD.`
      );
    } catch (err) {
      alert(err?.response?.data?.message || (fr ? "Erreur" : "Error"));
    } finally {
      setAlertSaving(false);
    }
  };

  const bg = dark ? "#05060f" : "#f5f7ff";
  const card = dark ? "#101426" : "#fff";
  const txt = dark ? "#f5f7ff" : "#0b163d";

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "32px 24px 80px", maxWidth: 560, margin: "0 auto" }}>
      <Link to="/garage" style={{ color: "#7c6bff", fontSize: 14 }}>← {fr ? "Garage" : "Garage"}</Link>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: txt, margin: "16px 0 8px" }}>
        {fr ? "Estimation de prix" : "Price estimate"}
      </h1>

      <form onSubmit={handleEstimate} style={{ background: card, padding: 24, borderRadius: 16, border: "1px solid rgba(148,163,184,.2)" }}>
        {["brand", "model", "year", "mileage"].map((key) => (
          <label key={key} style={{ display: "block", marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: "#94a3b8", textTransform: "capitalize" }}>{key}</span>
            <input
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 8, border: "1px solid rgba(148,163,184,.3)", background: dark ? "#0a0c18" : "#fff", color: txt }}
            />
          </label>
        ))}
        <label style={{ display: "block", marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{fr ? "Carburant" : "Fuel"}</span>
          <select value={form.fuel} onChange={(e) => set("fuel", e.target.value)} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 8 }}>
            <option value="">—</option>
            {FUEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label style={{ display: "block", marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{fr ? "Boîte" : "Gearbox"}</span>
          <select value={form.gearbox} onChange={(e) => set("gearbox", e.target.value)} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 8 }}>
            <option value="">—</option>
            {GEARBOX_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 12, borderRadius: 10, background: "#7c6bff", color: "#fff", fontWeight: 700, border: "none", cursor: "pointer" }}>
          {loading ? (fr ? "Calcul…" : "Calculating…") : (fr ? "Estimer" : "Estimate")}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: 24, background: card, padding: 24, borderRadius: 16, border: "1px solid rgba(124,107,255,.3)" }}>
          <p style={{ color: "#94a3b8", fontSize: 12 }}>{fr ? "Fourchette estimée" : "Estimated range"}</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: txt }}>
            {result.low?.toLocaleString()} – {result.high?.toLocaleString()} MAD
          </p>
          <p style={{ color: "#7c6bff", fontWeight: 700 }}>{fr ? "Médiane" : "Mid"}: {result.mid?.toLocaleString()} MAD</p>
          <button type="button" onClick={handleCreateAlert} disabled={alertSaving} style={{ marginTop: 16, padding: "10px 16px", borderRadius: 8, border: "1px solid #7c6bff", background: "transparent", color: "#7c6bff", cursor: "pointer" }}>
            {alertSaving ? "…" : (fr ? "Créer une alerte prix" : "Create price alert")}
          </button>
          <Link to="/price-alerts" style={{ display: "block", marginTop: 10, fontSize: 13, color: "#94a3b8" }}>
            {fr ? "Voir mes alertes →" : "View my alerts →"}
          </Link>
        </div>
      )}
    </div>
  );
}
