import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTravelReady } from "../api/garageIntel";
import GarageShell from "../components/garage/GarageShell";
import HealthScoreRing from "../components/garage/HealthScoreRing";
import { useAppLang } from "../context/AppLangContext";
import "../styles/garage.css";

export default function TravelReadyPage() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getTravelReady()
      .then((r) => setData(r.data))
      .catch(() => setErr(true));
  }, []);

  if (err) {
    return (
      <GarageShell fr={fr} emoji="🛣️" title={fr ? "Avant le voyage" : "Before travel"} subtitle="">
        <div className="ge-empty-wow">
          <p>{fr ? "Ajoutez d'abord votre voiture." : "Add your car first."}</p>
          <Link to="/garage/add" className="ge-cta">{fr ? "Ajouter" : "Add"}</Link>
        </div>
      </GarageShell>
    );
  }

  if (!data) {
    return (
      <GarageShell fr={fr} emoji="🛣️" title={fr ? "Avant le voyage" : "Before travel"} subtitle="">
        <div className="ge-loading"><div className="ge-spin" /></div>
      </GarageShell>
    );
  }

  const h = data.health;

  return (
    <GarageShell
      fr={fr}
      emoji="🛣️"
      title={fr ? "Avant le voyage" : "Before travel"}
      subtitle={fr ? "Tanger, Marrakech, Agadir, Aïd…" : "Road trips across Morocco"}
      heroAccent="#0ea5e9"
    >
      <div
        className="ge-glass ge-slide-up"
        style={{
          textAlign: "center",
          borderColor: data.ready ? "rgba(74,222,128,0.4)" : "rgba(251,191,36,0.4)",
        }}
      >
        <p style={{ fontSize: "3rem", margin: "0 0 8px" }}>{data.ready ? "✅" : "⚠️"}</p>
        <h2 style={{ margin: "0 0 8px", fontSize: "1.25rem" }}>{data.titleFr}</h2>
        <p style={{ margin: 0, color: "var(--ge-muted)" }}>{data.subtitleFr}</p>
        {h && (
          <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
            <HealthScoreRing score={h.score} color={h.color} size={100} fr={fr} />
          </div>
        )}
      </div>

      {data.checks.map((c, i) => (
        <div key={c.id} className="ge-feature-card ge-stagger" style={{ animationDelay: `${i * 0.05}s`, cursor: "default" }}>
          <div className="ge-feature-icon" style={{ background: c.ok ? "linear-gradient(135deg,#22c55e,#16a34a)" : "linear-gradient(135deg,#f59e0b,#d97706)" }}>
            {c.ok ? "✓" : "!"}
          </div>
          <div className="ge-feature-text">
            <strong>{c.labelFr}</strong>
            <span>{c.detailFr}</span>
          </div>
        </div>
      ))}

      <Link to="/emergency" className="ge-emergency-cta" style={{ marginTop: 20 }}>
        {fr ? "Mode urgence accident" : "Accident emergency mode"}
      </Link>
    </GarageShell>
  );
}
