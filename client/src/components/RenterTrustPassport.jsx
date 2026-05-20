import { useState, useEffect } from "react";
import { getRenterTrustPassport } from "../api/kyc";

const levelColors = {
  high:   "text-green-700 bg-green-50 border-green-200",
  medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
  low:    "text-red-700 bg-red-50 border-red-200",
};
const levelLabel = { high: "Confiance élevée", medium: "Confiance moyenne", low: "Faible confiance" };

export default function RenterTrustPassport({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getRenterTrustPassport(userId)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />;
  if (!data) return null;

  return (
    <div className={`border rounded-xl p-4 ${levelColors[data.trustLevel]}`}>
      <div className="flex items-center gap-3 mb-3">
        {data.avatar
          ? <img src={data.avatar} alt={data.name} className="w-10 h-10 rounded-full object-cover" />
          : <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-600">{data.name?.[0]}</div>
        }
        <div>
          <p className="font-semibold text-sm">{data.name}</p>
          <p className="text-xs opacity-70">Membre depuis {new Date(data.memberSince).toLocaleDateString("fr-FR", { month: "short", year: "numeric" })}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold">{data.trustScore}<span className="text-sm font-normal">/100</span></p>
          <p className="text-xs font-medium">{levelLabel[data.trustLevel]}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${data.verification.cinVerified ? "bg-green-100" : "bg-gray-100 text-gray-500"}`}>
          <span>{data.verification.cinVerified ? "✓" : "○"}</span>
          <span>CIN {data.verification.cinVerified ? "vérifiée" : data.verification.cinSubmitted ? "(en attente)" : "non soumise"}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg ${data.verification.permisVerified ? "bg-green-100" : "bg-gray-100 text-gray-500"}`}>
          <span>{data.verification.permisVerified ? "✓" : "○"}</span>
          <span>Permis {data.verification.permisVerified ? "vérifié" : data.verification.permisSubmitted ? "(en attente)" : "non soumis"}</span>
        </div>
      </div>

      <div className="flex gap-4 text-xs">
        <span><strong>{data.stats.completedRentals}</strong> loc. complétées</span>
        <span><strong>{data.stats.cancelledRentals}</strong> annulations</span>
        {data.stats.platformFlags > 0 && (
          <span className="text-red-600 font-medium">⚠ {data.stats.platformFlags} signalement(s) confirmé(s)</span>
        )}
      </div>
    </div>
  );
}
