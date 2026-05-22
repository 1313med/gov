import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyCar, patchDocuments } from "../api/userCar";
import { uploadListingImages } from "../api/upload";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";

const PRESETS_FR = ["Carte Grise", "Assurance", "Vignette", "Visite Technique", "Permis de Conduire", "Autre"];
const PRESETS_EN = ["Registration", "Insurance", "Tax Disc", "Technical Inspection", "Driver's License", "Other"];

export default function DocScannerPage() {
  const { lang } = useAppLang();
  const { dark } = useTheme();
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
      .catch(() => alert(fr ? "Impossible de charger le véhicule." : "Could not load vehicle."))
      .finally(() => setLoading(false));
  }, [fr]);

  const handleFiles = async (e) => {
    const label = labelInput.trim();
    if (!label) {
      alert(fr ? "Entrez un nom pour ce document." : "Enter a label for this document.");
      return;
    }
    if (!car?._id) {
      alert(fr ? "Enregistrez d'abord un véhicule dans Mon Garage." : "Register a vehicle in My Garage first.");
      return;
    }
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadListingImages(files);
      const url = urls[0];
      if (url) {
        setDocs((p) => [...p, { label, url, uploadedAt: new Date().toISOString() }]);
        setLabelInput("");
      }
    } catch {
      alert(fr ? "Échec de l'envoi." : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!car?._id) return;
    setSaving(true);
    try {
      await patchDocuments(car._id, docs);
      alert(fr ? "Documents enregistrés." : "Documents saved.");
    } catch (err) {
      alert(err?.response?.data?.message || (fr ? "Erreur" : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const bg = dark ? "#05060f" : "#f0f9ff";
  const card = dark ? "#101426" : "#fff";
  const txt = dark ? "#f5f7ff" : "#0b163d";

  if (loading) {
    return <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: txt }}>…</div>;
  }

  if (!car) {
    return (
      <div style={{ padding: 48, textAlign: "center", background: bg, minHeight: "60vh" }}>
        <p style={{ color: txt }}>{fr ? "Aucun véhicule dans le garage." : "No vehicle in garage."}</p>
        <Link to="/garage/add" style={{ color: "#38bdf8" }}>{fr ? "Ajouter ma voiture" : "Add my car"}</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "32px 24px 80px", maxWidth: 560, margin: "0 auto" }}>
      <Link to="/garage" style={{ color: "#38bdf8" }}>← {fr ? "Garage" : "Garage"}</Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: txt, margin: "16px 0 24px" }}>
        {fr ? "Documents scannés" : "Scanned documents"}
      </h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => setLabelInput(p)} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid rgba(148,163,184,.3)", background: labelInput === p ? "rgba(56,189,248,.15)" : "transparent", color: txt, fontSize: 12, cursor: "pointer" }}>
            {p}
          </button>
        ))}
      </div>

      <input
        value={labelInput}
        onChange={(e) => setLabelInput(e.target.value)}
        placeholder={fr ? "Nom du document" : "Document name"}
        style={{ width: "100%", padding: 10, borderRadius: 8, marginBottom: 12, border: "1px solid rgba(148,163,184,.3)" }}
      />

      <label style={{ display: "block", padding: 20, border: "2px dashed #38bdf8", borderRadius: 12, textAlign: "center", cursor: "pointer", marginBottom: 20, color: txt }}>
        {uploading ? "…" : (fr ? "📷 Scanner / importer" : "📷 Scan / import")}
        <input type="file" accept="image/*,application/pdf" onChange={handleFiles} style={{ display: "none" }} />
      </label>

      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
        {docs.map((d, i) => (
          <li key={i} style={{ background: card, padding: 12, borderRadius: 10, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(148,163,184,.2)" }}>
            <div>
              <strong style={{ color: txt }}>{d.label}</strong>
              {d.url && (
                <a href={d.url} target="_blank" rel="noreferrer" style={{ display: "block", fontSize: 12, color: "#38bdf8", marginTop: 4 }}>
                  {fr ? "Voir" : "View"}
                </a>
              )}
            </div>
            <button type="button" onClick={() => setDocs((p) => p.filter((_, j) => j !== i))} style={{ color: "#f43f5e", background: "none", border: "none", cursor: "pointer" }}>✕</button>
          </li>
        ))}
      </ul>

      <button type="button" onClick={save} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, background: "#38bdf8", color: "#fff", fontWeight: 700, border: "none" }}>
        {saving ? "…" : (fr ? "Enregistrer" : "Save")}
      </button>
    </div>
  );
}
