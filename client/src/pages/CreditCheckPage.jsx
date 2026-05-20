import { useState, useEffect } from "react";
import { requestCreditCheck, getMyCreditChecks } from "../api/creditCheck";

const STATUS_STYLES = {
  pending:       { color: "text-yellow-700 bg-yellow-50 border-yellow-200", label: "En attente de vérification", icon: "⏳" },
  clear:         { color: "text-green-700 bg-green-50 border-green-200",    label: "Aucune charge bancaire",     icon: "✅" },
  flagged:       { color: "text-red-700 bg-red-50 border-red-200",          label: "Charge bancaire détectée",   icon: "⚠️" },
  unverifiable:  { color: "text-gray-700 bg-gray-50 border-gray-200",       label: "Non vérifiable",             icon: "❓" },
};

export default function CreditCheckPage() {
  const [checks, setChecks] = useState([]);
  const [form, setForm]     = useState({ immatriculation: "", ownerCin: "", brand: "", model: "", year: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const loadChecks = () => getMyCreditChecks().then((r) => setChecks(r.data));
  useEffect(() => { loadChecks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      await requestCreditCheck(form);
      setMsg({ type: "success", text: "Demande envoyée. Vous serez notifié dans 48h par notification et WhatsApp." });
      setForm({ immatriculation: "", ownerCin: "", brand: "", model: "", year: "" });
      loadChecks();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Erreur lors de l'envoi" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Vérification de crédit voiture</h1>
        <p className="text-gray-500 text-sm">
          Au Maroc, de nombreuses voitures sont vendues alors qu'elles sont encore sous crédit bancaire.
          Notre service vérifie si le véhicule a une charge bancaire active avant votre achat.
        </p>
      </div>

      {/* Why it matters */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
        <p className="font-semibold mb-1">⚠️ Pourquoi c'est important ?</p>
        <p>Si la voiture a un crédit non remboursé, la banque peut récupérer le véhicule même si vous l'avez acheté. Vous perdrez votre argent ET la voiture.</p>
      </div>

      {/* Request form */}
      <div className="border rounded-2xl p-5 mb-8">
        <h2 className="font-semibold text-gray-800 mb-4">Nouvelle vérification</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Immatriculation</label>
              <input
                type="text"
                value={form.immatriculation}
                onChange={(e) => setForm((p) => ({ ...p, immatriculation: e.target.value }))}
                placeholder="Ex: 12345-A-1"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">CIN du vendeur (optionnel)</label>
              <input
                type="text"
                value={form.ownerCin}
                onChange={(e) => setForm((p) => ({ ...p, ownerCin: e.target.value }))}
                placeholder="CIN du propriétaire actuel"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Marque</label>
              <input type="text" value={form.brand} onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))} placeholder="Ex: Dacia" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Modèle</label>
              <input type="text" value={form.model} onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))} placeholder="Ex: Logan" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Année</label>
              <input type="number" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))} placeholder="2019" min="1990" max="2026" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {msg && (
            <div className={`rounded-lg px-4 py-3 text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {msg.text}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || (!form.immatriculation && !form.ownerCin)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
          >
            {submitting ? "Envoi en cours…" : "Demander une vérification (gratuit)"}
          </button>
        </form>
      </div>

      {/* My checks */}
      {checks.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-800 mb-4">Mes vérifications</h2>
          <div className="space-y-3">
            {checks.map((c) => {
              const s = STATUS_STYLES[c.status] || STATUS_STYLES.pending;
              return (
                <div key={c._id} className={`border rounded-xl p-4 ${s.color}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {c.brand} {c.model} {c.year || ""} — {c.immatriculation || c.ownerCin || "—"}
                      </p>
                      <p className="text-xs opacity-70 mt-0.5">{new Date(c.createdAt).toLocaleDateString("fr-FR")}</p>
                      {c.adminNote && <p className="text-sm mt-2 italic">{c.adminNote}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl">{s.icon}</span>
                      <p className="text-xs font-medium mt-1">{s.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
