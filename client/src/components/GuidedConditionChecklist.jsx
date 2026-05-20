import { useState, useRef } from "react";
import { api } from "../api/axios";

const STEPS = [
  { id: "front",     label: "Avant du véhicule",       hint: "Photographiez l'avant — capot, pare-chocs, phares" },
  { id: "back",      label: "Arrière du véhicule",      hint: "Arrière — coffre, pare-chocs, feux" },
  { id: "left",      label: "Côté gauche",               hint: "Profil gauche complet" },
  { id: "right",     label: "Côté droit",                hint: "Profil droit complet" },
  { id: "dashboard", label: "Tableau de bord",           hint: "Compteur kilométrique visible" },
  { id: "fuel",      label: "Jauge de carburant",        hint: "Niveau de carburant actuel" },
];

export default function GuidedConditionChecklist({ onComplete, onCancel }) {
  const [step, setStep]       = useState(0);
  const [photos, setPhotos]   = useState({});
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const current = STEPS[step];
  const progress = Math.round(((step) / STEPS.length) * 100);

  const handleCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/upload/single", fd);
      setPhotos((p) => ({ ...p, [current.id]: res.data.url }));
    } catch {
      alert("Upload échoué, veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      onComplete(Object.values(photos));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">État du véhicule</h2>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{step + 1} / {STEPS.length}</p>
        </div>

        {/* Step content */}
        <div className="p-5">
          <div className="text-center mb-5">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-3xl">📷</span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{current.label}</h3>
            <p className="text-sm text-gray-500">{current.hint}</p>
          </div>

          {photos[current.id] ? (
            <div className="relative">
              <img src={photos[current.id]} alt={current.label} className="w-full h-48 object-cover rounded-xl" />
              <button
                onClick={() => setPhotos((p) => { const n = { ...p }; delete n[current.id]; return n; })}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 text-sm flex items-center justify-center"
              >✕</button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="w-full h-40 border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center gap-2 text-blue-500 hover:bg-blue-50 transition disabled:opacity-50"
            >
              <span className="text-3xl">{uploading ? "⏳" : "+"}</span>
              <span className="text-sm font-medium">{uploading ? "Envoi en cours…" : "Prendre / Choisir une photo"}</span>
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} className="hidden" />
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium">
              Précédent
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!photos[current.id] || uploading}
            className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-blue-700 transition"
          >
            {step < STEPS.length - 1 ? "Suivant" : "Terminer"}
          </button>
        </div>
      </div>
    </div>
  );
}
