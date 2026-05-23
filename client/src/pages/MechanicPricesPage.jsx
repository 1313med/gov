import { useState, useEffect } from "react";
import { getMechanicPrices, submitMechanicPrice, evaluateMechanicQuote } from "../api/garageIntel";
import GarageShell from "../components/garage/GarageShell";
import { useAppLang } from "../context/AppLangContext";
import "../styles/garage.css";

const SERVICE_KEYS = [
  { key: "oil_change", fr: "Vidange" },
  { key: "brake_pads", fr: "Freins" },
  { key: "labour_hour", fr: "Main d'œuvre" },
  { key: "timing_belt", fr: "Distribution" },
  { key: "battery", fr: "Batterie" },
  { key: "tyres_set", fr: "Pneus" },
];

const CITIES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Meknès", "Oujda"];

export default function MechanicPricesPage() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const [city, setCity] = useState("Casablanca");
  const [serviceKey, setServiceKey] = useState("brake_pads");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [data, setData] = useState(null);
  const [quote, setQuote] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [submitForm, setSubmitForm] = useState({ priceMad: "", garageName: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMechanicPrices({ serviceKey, city, brand, model })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [serviceKey, city, brand, model]);

  const cur = data?.current;

  return (
    <GarageShell
      fr={fr}
      emoji="🔧"
      title={fr ? "Prix garagiste" : "Mechanic prices"}
      subtitle={fr ? "Fourchettes réelles au Maroc — évitez les arnaques" : "Real Morocco price ranges"}
      heroAccent="#f59e0b"
    >
      <div className="ge-glass ge-slide-up">
        <label className="ge-spec-label">{fr ? "Ville" : "City"}</label>
        <select className="ge-input" value={city} onChange={(e) => setCity(e.target.value)}>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="ge-chip-row">
          {SERVICE_KEYS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`ge-chip-v2${serviceKey === s.key ? " on" : ""}`}
              onClick={() => setServiceKey(s.key)}
            >
              {s.fr}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input className="ge-input" placeholder="Renault" value={brand} onChange={(e) => setBrand(e.target.value)} />
          <input className="ge-input" placeholder="Clio" value={model} onChange={(e) => setModel(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "var(--ge-muted)" }}>{fr ? "Chargement…" : "Loading…"}</p>
      ) : cur ? (
        <div className="ge-price-hero ge-stagger">
          <p style={{ margin: 0, fontSize: 13, color: "var(--ge-muted)" }}>{cur.labelFr} · {cur.city}</p>
          <p className="big">{cur.avg?.toLocaleString()} MAD</p>
          <p style={{ margin: "8px 0 0", fontSize: 14 }}>
            {cur.min?.toLocaleString()} — {cur.max?.toLocaleString()} MAD
          </p>
        </div>
      ) : null}

      <div className="ge-glass">
        <h3 style={{ marginTop: 0 }}>{fr ? "Votre devis est cher ?" : "Is your quote fair?"}</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const r = await evaluateMechanicQuote({ serviceKey, quotedPrice: Number(quote), city, brand, model });
            setEvaluation(r.data.evaluation);
          }}
        >
          <input className="ge-input" type="number" placeholder="Montant MAD" value={quote} onChange={(e) => setQuote(e.target.value)} />
          <button type="submit" className="ge-btn-primary">{fr ? "Analyser" : "Analyze"}</button>
        </form>
        {evaluation && <div className={`ge-verdict ${evaluation.verdict}`} style={{ marginTop: 14 }}>{evaluation.messageFr}</div>}
      </div>

      <div className="ge-glass">
        <h3 style={{ marginTop: 0 }}>{fr ? "Partager un prix (anonyme)" : "Share a price"}</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await submitMechanicPrice({ serviceKey, priceMad: Number(submitForm.priceMad), city, brand, model, garageName: submitForm.garageName });
              setMsg(fr ? "Choukran ! Prix enregistré." : "Thanks! Price saved.");
              const r = await getMechanicPrices({ serviceKey, city, brand, model });
              setData(r.data);
            } catch (err) {
              setMsg(err.response?.data?.message || "Erreur");
            }
          }}
        >
          <input className="ge-input" type="number" required placeholder="Prix MAD" value={submitForm.priceMad} onChange={(e) => setSubmitForm((p) => ({ ...p, priceMad: e.target.value }))} />
          <input className="ge-input" placeholder={fr ? "Garage (optionnel)" : "Garage"} value={submitForm.garageName} onChange={(e) => setSubmitForm((p) => ({ ...p, garageName: e.target.value }))} />
          <button type="submit" className="ge-btn-primary" style={{ background: "var(--ge-glass)", color: "var(--ge-txt)", border: "1px solid var(--ge-border)" }}>
            {fr ? "Envoyer" : "Submit"}
          </button>
        </form>
        {msg && <p style={{ color: "#4ade80", marginTop: 12, fontWeight: 700 }}>{msg}</p>}
      </div>
    </GarageShell>
  );
}
