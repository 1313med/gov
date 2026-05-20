import { useState } from "react";
import { reportListing } from "../api/reports";

const REASONS = [
  { value: "fake_listing",         label: "Annonce frauduleuse / inexistante" },
  { value: "wrong_price",          label: "Prix trompeur ou erroné" },
  { value: "car_under_credit",     label: "Voiture sous crédit bancaire" },
  { value: "duplicate",            label: "Annonce en double" },
  { value: "inappropriate_content",label: "Contenu inapproprié" },
  { value: "scam",                 label: "Tentative d'arnaque" },
  { value: "other",                label: "Autre raison" },
];

export default function ReportListingModal({ listingId, listingModel, onClose }) {
  const [reason, setReason] = useState("");
  const [note, setNote]     = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return;
    setLoading(true);
    setError(null);
    try {
      await reportListing({ listingId, listingModel, reason, note });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du signalement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Signaler cette annonce</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="font-semibold text-gray-800 mb-1">Signalement reçu</p>
            <p className="text-sm text-gray-500 mb-5">Notre équipe examine le signalement dans les plus brefs délais. Merci pour votre vigilance.</p>
            <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Raison du signalement</label>
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label key={r.value} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition ${reason === r.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                    <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={(e) => setReason(e.target.value)} className="accent-blue-600" />
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Détails (optionnel)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Décrivez le problème…"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                maxLength={500}
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium">
                Annuler
              </button>
              <button type="submit" disabled={loading || !reason} className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-red-700 transition">
                {loading ? "Envoi…" : "Signaler"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
