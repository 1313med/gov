import { useState, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { updateBookingMedia } from "../api/booking";
import { uploadListingImages } from "../api/upload";
import { useAppLang } from "../context/AppLangContext";

const CHECKPOINTS_FR = [
  { id: "front", label: "Avant" },
  { id: "rear", label: "Arrière" },
  { id: "left", label: "Côté gauche" },
  { id: "right", label: "Côté droit" },
  { id: "interior", label: "Intérieur avant" },
  { id: "rear_in", label: "Intérieur arrière" },
  { id: "dash", label: "Tableau de bord / km" },
  { id: "trunk", label: "Coffre" },
  { id: "tires", label: "Pneus" },
];

const CHECKPOINTS_EN = [
  { id: "front", label: "Front" },
  { id: "rear", label: "Rear" },
  { id: "left", label: "Left side" },
  { id: "right", label: "Right side" },
  { id: "interior", label: "Interior front" },
  { id: "rear_in", label: "Interior rear" },
  { id: "dash", label: "Dashboard / mileage" },
  { id: "trunk", label: "Trunk" },
  { id: "tires", label: "Tires" },
];

export default function ConditionChecklistPage() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const phase = searchParams.get("phase") === "after" ? "after" : "before";
  const existingBefore = searchParams.get("existingBefore");
  const existingAfter = searchParams.get("existingAfter");
  const CHECKPOINTS = fr ? CHECKPOINTS_FR : CHECKPOINTS_EN;

  const [photos, setPhotos] = useState(() => {
    const initial = {};
    CHECKPOINTS.forEach((cp) => { initial[cp.id] = []; });
    return initial;
  });
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const current = CHECKPOINTS[step];
  const isLast = step === CHECKPOINTS.length - 1;

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await uploadListingImages(files);
      setPhotos((prev) => ({
        ...prev,
        [current.id]: [...(prev[current.id] || []), ...urls],
      }));
    } catch {
      alert(fr ? "Échec de l'envoi." : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const finish = async () => {
    const flat = Object.values(photos).flat().filter(Boolean);
    if (!flat.length) {
      alert(fr ? "Ajoutez au moins une photo." : "Add at least one photo.");
      return;
    }
    setSaving(true);
    try {
      let before = [];
      let after = [];
      try {
        if (existingBefore) before = JSON.parse(existingBefore);
        if (existingAfter) after = JSON.parse(existingAfter);
      } catch {
        /* ignore */
      }
      if (phase === "before") before = [...before, ...flat];
      else after = [...after, ...flat];
      await updateBookingMedia(bookingId, { conditionPhotos: { before, after } });
      navigate(`/owner/bookings-list?booking=${bookingId}`);
    } catch (err) {
      alert(err?.response?.data?.message || (fr ? "Erreur" : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const progress = Math.round((step / CHECKPOINTS.length) * 100);

  return (
    <div style={{ minHeight: "100vh", background: "#05060f", color: "#f5f7ff", padding: "24px 20px 48px", maxWidth: 480, margin: "0 auto" }}>
      <button type="button" onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", marginBottom: 16 }}>
        ← {fr ? "Retour" : "Back"}
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
        {fr ? "État du véhicule" : "Vehicle condition"} — {phase === "after" ? (fr ? "Retour" : "Return") : (fr ? "Départ" : "Pickup")}
      </h1>
      <div style={{ height: 6, background: "rgba(255,255,255,.1)", borderRadius: 4, margin: "16px 0 24px" }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "#7c6bff", borderRadius: 4 }} />
      </div>

      <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{step + 1} / {CHECKPOINTS.length}</p>
      <h2 style={{ fontSize: 18, marginBottom: 16 }}>{current.label}</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {(photos[current.id] || []).map((url, i) => (
          <img key={i} src={url} alt="" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8 }} />
        ))}
      </div>

      <label style={{ display: "block", padding: 24, border: "2px dashed rgba(124,107,255,.4)", borderRadius: 12, textAlign: "center", cursor: "pointer", marginBottom: 24 }}>
        {uploading ? "…" : (fr ? "📷 Ajouter des photos" : "📷 Add photos")}
        <input type="file" accept="image/*" multiple capture="environment" onChange={handleFiles} style={{ display: "none" }} />
      </label>

      <div style={{ display: "flex", gap: 8 }}>
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,.2)", background: "transparent", color: "#fff" }}>
            {fr ? "Précédent" : "Previous"}
          </button>
        )}
        {!isLast ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!(photos[current.id]?.length)}
            style={{ flex: 1, padding: 12, borderRadius: 10, background: "#7c6bff", color: "#fff", border: "none", fontWeight: 700 }}
          >
            {fr ? "Suivant" : "Next"}
          </button>
        ) : (
          <button type="button" onClick={finish} disabled={saving} style={{ flex: 1, padding: 12, borderRadius: 10, background: "#34d399", color: "#0f172a", border: "none", fontWeight: 700 }}>
            {saving ? "…" : (fr ? "Terminer" : "Finish")}
          </button>
        )}
      </div>
    </div>
  );
}
