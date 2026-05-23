import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyCar, patchDocuments } from "../api/userCar";
import { uploadListingImages } from "../api/upload";
import { useAppLang } from "../context/AppLangContext";
import GarageShell from "../components/garage/GarageShell";
import "../styles/garage.css";

const PRESETS_FR = ["Carte grise", "Assurance", "Vignette", "Visite technique", "Permis", "Autre"];
const PRESETS_EN = ["Registration", "Insurance", "Tax", "Inspection", "License", "Other"];

export default function DocScannerPage() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const PRESETS = fr ? PRESETS_FR : PRESETS_EN;

  const [car, setCar] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getMyCar()
      .then((r) => {
        setCar(r.data);
        setDocs(r.data?.scannedDocuments || []);
      })
      .catch(() => alert(fr ? "Impossible de charger." : "Could not load."))
      .finally(() => setLoading(false));
  }, [fr]);

  const handleFiles = async (e) => {
    const label = labelInput.trim();
    if (!label || !car?._id) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadListingImages(files);
      if (urls[0]) {
        setDocs((p) => [...p, { label, url: urls[0], uploadedAt: new Date().toISOString() }]);
        setLabelInput("");
      }
    } catch {
      alert(fr ? "Échec envoi." : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <GarageShell fr={fr} emoji="📄" title="…" subtitle="">
        <div className="ge-loading"><div className="ge-spin" /></div>
      </GarageShell>
    );
  }

  if (!car) {
    return (
      <GarageShell fr={fr} emoji="📄" title={fr ? "Documents" : "Documents"} subtitle="">
        <div className="ge-empty-wow">
          <Link to="/garage/add" className="ge-cta">{fr ? "Ajouter ma voiture" : "Add my car"}</Link>
        </div>
      </GarageShell>
    );
  }

  return (
    <GarageShell
      fr={fr}
      emoji="📄"
      title={fr ? "Mes papiers" : "My documents"}
      subtitle={fr ? "Carte grise, assurance, vignette…" : "Registration, insurance…"}
      heroAccent="#14b8a6"
      fullWidth
    >
      <div className="ge-chip-row">
        {PRESETS.map((p) => (
          <button key={p} type="button" className={`ge-chip-v2${labelInput === p ? " on" : ""}`} onClick={() => setLabelInput(p)}>
            {p}
          </button>
        ))}
      </div>

      <input className="ge-input" value={labelInput} onChange={(e) => setLabelInput(e.target.value)} placeholder={fr ? "Nom du document" : "Document name"} />

      <label className="ge-glass" style={{ display: "block", padding: 28, textAlign: "center", cursor: "pointer", borderStyle: "dashed" }}>
        {uploading ? "…" : fr ? "📷 Scanner ou importer" : "📷 Scan or import"}
        <input type="file" accept="image/*,application/pdf" onChange={handleFiles} style={{ display: "none" }} />
      </label>

      {docs.map((d, i) => (
        <div key={i} className="ge-feature-card ge-stagger" style={{ animationDelay: `${i * 0.04}s`, cursor: "default" }}>
          <div className="ge-feature-text">
            <strong>{d.label}</strong>
            {d.url && (
              <a href={d.url} target="_blank" rel="noreferrer" style={{ color: "var(--ge-accent)", fontSize: 12 }}>
                {fr ? "Ouvrir" : "Open"}
              </a>
            )}
          </div>
          <button type="button" onClick={() => setDocs((p) => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}>✕</button>
        </div>
      ))}

      <button
        type="button"
        className="ge-btn-primary"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await patchDocuments(car._id, docs);
            alert(fr ? "Enregistré !" : "Saved!");
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "…" : fr ? "Enregistrer" : "Save"}
      </button>
    </GarageShell>
  );
}
