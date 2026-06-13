import { useState } from "react";
import { api } from "../api/axios";

const PHOTO_PROMPTS = [
  { id: "scene",    label: "Vue générale de la scène", icon: "🛣️" },
  { id: "damage1",  label: "Dommages votre véhicule",  icon: "🚗" },
  { id: "damage2",  label: "Dommages autre véhicule",  icon: "🚙" },
  { id: "plates",   label: "Plaques d'immatriculation",icon: "🔢" },
  { id: "road",     label: "Signalisation / état route",icon: "⚠️" },
];

export default function AccidentAssistantPage() {
  const [phase, setPhase] = useState("start");
  const [photos, setPhotos] = useState({});
  const [uploading, setUploading] = useState({});

  const handleUpload = async (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading((p) => ({ ...p, [id]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/upload/single", fd);
      setPhotos((p) => ({ ...p, [id]: res.data.url }));
    } catch {
      alert("Upload échoué");
    } finally {
      setUploading((p) => ({ ...p, [id]: false }));
    }
  };

  const contacts = [
    { label: "Police", number: "19", icon: "🚔" },
    { label: "SAMU",   number: "15", icon: "🚑" },
    { label: "Pompiers",number:"15", icon: "🚒" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1 text-red-600">🆘 Assistant accident</h1>
      <p className="text-gray-500 text-sm mb-8">Suivez ces étapes immédiatement après un accident.</p>

      {phase === "start" && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h2 className="font-bold text-red-700 mb-3">1. Êtes-vous en sécurité ?</h2>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {contacts.map((c) => (
                <a key={c.label} href={`tel:${c.number}`} className="bg-red-600 text-white rounded-xl p-3 text-center hover:bg-red-700 transition">
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <p className="text-xs font-bold">{c.label}</p>
                  <p className="text-lg font-bold">{c.number}</p>
                </a>
              ))}
            </div>
            <p className="text-sm text-red-700">Si vous ou d'autres personnes êtes blessés, appelez immédiatement le 15 ou le 19.</p>
          </div>
          <button onClick={() => setPhase("photos")} className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl hover:bg-blue-700 transition">
            Je suis en sécurité → Documenter l'accident
          </button>
        </div>
      )}

      {phase === "photos" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700 mb-4">
            📸 Prenez des photos de chaque élément avant de déplacer les véhicules.
          </div>
          {PHOTO_PROMPTS.map((p) => (
            <div key={p.id} className="border rounded-xl p-4 flex items-center gap-4">
              <span className="text-3xl">{p.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-sm text-gray-700">{p.label}</p>
                {photos[p.id]
                  ? <img src={photos[p.id]} alt={p.label} className="mt-2 h-20 rounded-lg object-cover" />
                  : <label className="mt-1 cursor-pointer text-xs text-blue-600 hover:underline flex items-center gap-1">
                      <input type="file" accept="image/*" capture="environment" onChange={(e) => handleUpload(e, p.id)} className="hidden" />
                      {uploading[p.id] ? "Envoi…" : "+ Prendre photo"}
                    </label>
                }
              </div>
              {photos[p.id] && (
                <button onClick={() => setPhotos((prev) => { const n = {...prev}; delete n[p.id]; return n; })} className="text-red-400 hover:text-red-600 text-sm">✕</button>
              )}
            </div>
          ))}
          <button onClick={() => setPhase("constat")} className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl hover:bg-blue-700 transition">
            Photos prises → Constat amiable
          </button>
        </div>
      )}

      {phase === "constat" && (
        <div className="space-y-4">
          <div className="border rounded-2xl p-5">
            <h2 className="font-bold text-gray-800 mb-4">📋 Constat amiable</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex gap-2"><span className="text-green-600 font-bold">✓</span><p>Remplissez le formulaire de constat amiable avec l'autre conducteur.</p></div>
              <div className="flex gap-2"><span className="text-green-600 font-bold">✓</span><p>Ne signez <strong>rien sous pression</strong> ni sans avoir relu.</p></div>
              <div className="flex gap-2"><span className="text-green-600 font-bold">✓</span><p>Chaque conducteur conserve <strong>un exemplaire signé</strong>.</p></div>
              <div className="flex gap-2"><span className="text-green-600 font-bold">✓</span><p>En cas de désaccord, ne signez pas et appelez la police (19).</p></div>
            </div>
            <a
              href="https://www.fnacam.ma/wp-content/uploads/2020/05/constat-amiable.pdf"
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-center justify-center gap-2 w-full bg-gray-100 border rounded-xl py-3 text-sm font-medium hover:bg-gray-200 transition"
            >
              📄 Télécharger le modèle de constat amiable
            </a>
          </div>
          <button onClick={() => setPhase("insurance")} className="w-full bg-blue-600 text-white font-semibold py-4 rounded-2xl hover:bg-blue-700 transition">
            Constat rempli → Contacter l'assurance
          </button>
        </div>
      )}

      {phase === "insurance" && (
        <div className="space-y-4">
          <div className="border rounded-2xl p-5">
            <h2 className="font-bold text-gray-800 mb-4">📞 Contacter votre assurance</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex gap-2"><span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</span><p>Appelez votre assurance dans les <strong>5 jours ouvrables</strong> suivant l'accident.</p></div>
              <div className="flex gap-2"><span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</span><p>Transmettez le constat signé et les photos que vous venez de prendre.</p></div>
              <div className="flex gap-2"><span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</span><p>Notez le <strong>numéro de sinistre</strong> qu'ils vous donnent.</p></div>
              <div className="flex gap-2"><span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">4</span><p>Si vous louez : <strong>contactez immédiatement le propriétaire</strong> via Goovoiture.</p></div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
            <p className="font-semibold mb-1">✅ Vous avez tout documenté !</p>
            <p>Photos prises, constat rempli, assurance contactée. Gardez tous les documents en lieu sûr.</p>
          </div>
          <button onClick={() => { setPhase("start"); setPhotos({}); }} className="w-full border border-gray-200 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            Recommencer
          </button>
        </div>
      )}
    </div>
  );
}
