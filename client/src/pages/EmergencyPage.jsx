import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEmergencyGuide } from "../api/garageIntel";
import GarageShell from "../components/garage/GarageShell";
import { useAppLang } from "../context/AppLangContext";
import "../styles/garage.css";

export default function EmergencyPage() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const [guide, setGuide] = useState(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    getEmergencyGuide().then((r) => setGuide(r.data)).catch(() => {});
  }, []);

  const contacts = guide?.contacts || [];
  const steps = guide?.steps || [];
  const photos = guide?.photoChecklistFr || [];

  return (
    <GarageShell
      fr={fr}
      emoji="🆘"
      title={fr ? "Urgence Maroc" : "Morocco emergency"}
      subtitle={fr ? "Accident ? Restez calme." : "Accident? Stay calm."}
      heroAccent="#ef4444"
    >
      {!started ? (
        <button type="button" className="ge-emergency-cta ge-slide-up" onClick={() => setStarted(true)}>
          🚨 {fr ? "J'ai eu un accident" : "I had an accident"}
        </button>
      ) : null}

      <div className="ge-glass">
        <h3 style={{ marginTop: 0, color: "#f87171" }}>📞 {fr ? "Numéros" : "Numbers"}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {contacts.map((c) => (
            <a key={c.labelFr} href={`tel:${c.tel}`} className="ge-quick-item" style={{ minWidth: "auto", width: "100%" }}>
              <strong style={{ fontSize: 18 }}>{c.number}</strong>
              <span>{c.labelFr}</span>
            </a>
          ))}
        </div>
      </div>

      {started && photos.length > 0 && (
        <div className="ge-glass ge-slide-up">
          <h3 style={{ marginTop: 0 }}>📸 Photos à prendre</h3>
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8, fontSize: 14 }}>
            {photos.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {(started ? steps : steps.slice(0, 2)).map((s, i) => (
        <div key={i} className="ge-feature-card ge-stagger" style={{ animationDelay: `${i * 0.06}s`, cursor: "default" }}>
          <span style={{ fontSize: "1.75rem" }}>{s.icon}</span>
          <div className="ge-feature-text">
            <strong>{s.titleFr}</strong>
            <span>{s.bodyFr}</span>
          </div>
        </div>
      ))}

      {!started && steps.length > 2 && (
        <button type="button" className="ge-btn-primary" onClick={() => setStarted(true)}>
          {fr ? "Voir toutes les étapes" : "See all steps"}
        </button>
      )}

      <p style={{ textAlign: "center", marginTop: 16 }}>
        <Link to="/garage" style={{ color: "var(--ge-accent)", fontWeight: 700 }}>← {fr ? "Mon garage" : "My garage"}</Link>
      </p>
    </GarageShell>
  );
}
