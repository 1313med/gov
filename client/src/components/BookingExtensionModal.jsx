import { useState } from "react";
import { requestExtension } from "../api/extensions";

export default function BookingExtensionModal({ booking, onClose, onSuccess }) {
  const [newEndDate, setNewEndDate] = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const currentEnd = new Date(booking.endDate).toISOString().slice(0, 10);
  const rental     = booking.rentalId;

  const extraDays = newEndDate
    ? Math.ceil((new Date(newEndDate) - new Date(booking.endDate)) / 86400000)
    : 0;
  const extraCost = extraDays > 0 ? extraDays * (rental?.pricePerDay || 0) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newEndDate || extraDays <= 0) return;
    setLoading(true);
    setError(null);
    try {
      await requestExtension(booking._id, newEndDate);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">Prolonger la location</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p className="text-gray-500">Fin actuelle</p>
            <p className="font-semibold">{new Date(booking.endDate).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nouvelle date de fin</label>
            <input
              type="date"
              value={newEndDate}
              min={new Date(new Date(booking.endDate).getTime() + 86400000).toISOString().slice(0, 10)}
              onChange={(e) => setNewEndDate(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {extraDays > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm">
              <p className="text-blue-700">
                <strong>{extraDays} jour{extraDays > 1 ? "s" : ""} supplémentaire{extraDays > 1 ? "s" : ""}</strong>
                {" "}— Coût estimé : <strong>{extraCost} MAD</strong>
              </p>
              <p className="text-xs text-blue-500 mt-1">Le propriétaire doit approuver la prolongation.</p>
            </div>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium">
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || extraDays <= 0}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40 hover:bg-blue-700 transition"
            >
              {loading ? "Envoi…" : "Envoyer la demande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
