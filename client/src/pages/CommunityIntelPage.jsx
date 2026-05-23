import { useState, useEffect } from "react";
import { getCommunityInsights, postCommunityInsight } from "../api/garageIntel";
import { getMyCar } from "../api/userCar";
import GarageShell from "../components/garage/GarageShell";
import { useAppLang } from "../context/AppLangContext";
import "../styles/garage.css";

export default function CommunityIntelPage() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const [brand, setBrand] = useState("renault");
  const [model, setModel] = useState("clio");
  const [insights, setInsights] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", kmMention: "" });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getMyCar().then((r) => {
      if (r.data?.brand) {
        setBrand(r.data.brand.toLowerCase());
        setModel((r.data.model || "").toLowerCase());
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!brand) return;
    getCommunityInsights({ brand, model }).then((r) => setInsights(r.data.insights || []));
  }, [brand, model]);

  return (
    <GarageShell
      fr={fr}
      emoji="👥"
      title={fr ? "Communauté" : "Community"}
      subtitle={fr ? "Propriétaires de la même voiture au Maroc" : "Owners of your car in Morocco"}
      heroAccent="#a855f7"
    >
      <div className="ge-glass" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <input className="ge-input" style={{ margin: 0 }} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Marque" />
        <input className="ge-input" style={{ margin: 0 }} value={model} onChange={(e) => setModel(e.target.value)} placeholder="Modèle" />
      </div>

      {insights.map((item, i) => (
        <div key={item._id} className="ge-glass ge-stagger" style={{ animationDelay: `${i * 0.04}s`, borderLeft: "4px solid var(--ge-accent)" }}>
          <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, color: "var(--ge-accent)", textTransform: "uppercase" }}>
            {item.type?.replace("_", " ")}
            {item.kmMention ? ` · ${item.kmMention.toLocaleString()} km` : ""}
          </p>
          <strong style={{ fontSize: 15 }}>{item.title}</strong>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "var(--ge-muted)", lineHeight: 1.55 }}>{item.body}</p>
        </div>
      ))}

      <div className="ge-glass">
        <h3 style={{ marginTop: 0 }}>{fr ? "Partager votre expérience" : "Share your experience"}</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await postCommunityInsight({ brand, model, title: form.title, body: form.body, kmMention: form.kmMention ? Number(form.kmMention) : undefined });
              setMsg(fr ? "Merci !" : "Thanks!");
              const r = await getCommunityInsights({ brand, model });
              setInsights(r.data.insights || []);
              setForm({ title: "", body: "", kmMention: "" });
            } catch {
              setMsg(fr ? "Connectez-vous pour publier." : "Log in to post.");
            }
          }}
        >
          <input className="ge-input" required placeholder={fr ? "Titre" : "Title"} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
          <textarea className="ge-input" rows={4} required placeholder={fr ? "Votre conseil…" : "Your tip…"} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} />
          <input className="ge-input" type="number" placeholder="Km" value={form.kmMention} onChange={(e) => setForm((p) => ({ ...p, kmMention: e.target.value }))} />
          <button type="submit" className="ge-btn-primary">{fr ? "Publier" : "Post"}</button>
        </form>
        {msg && <p style={{ color: "#4ade80", marginTop: 12 }}>{msg}</p>}
      </div>
    </GarageShell>
  );
}
