import { useState, useEffect } from "react";
import { getMyReferral, applyReferralCode } from "../api/referral";

export default function ReferralPage() {
  const [data, setData]     = useState(null);
  const [code, setCode]     = useState("");
  const [msg, setMsg]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { getMyReferral().then((r) => setData(r.data)); }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await applyReferralCode(code);
      setMsg({ type: "success", text: res.data.message });
      getMyReferral().then((r) => setData(r.data));
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Code invalide" });
    } finally {
      setLoading(false);
    }
  };

  if (!data) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  const shareText = `Rejoins GooVoiture avec mon code ${data.referralCode} et gagne ${data.rewards.refereeCreditMad} MAD de crédit ! 🚗`;
  const shareUrl  = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Programme de parrainage</h1>
      <p className="text-gray-500 text-sm mb-8">Invitez vos amis et gagnez des crédits à utiliser sur vos prochaines locations.</p>

      {/* Credits banner */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6">
        <p className="text-sm opacity-80 mb-1">Mes crédits disponibles</p>
        <p className="text-4xl font-bold mb-4">{data.referralCredits} MAD</p>
        <div className="flex gap-4 text-sm">
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <p className="opacity-70 text-xs">Amis invités</p>
            <p className="font-bold">{data.referredUsersCount}</p>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <p className="opacity-70 text-xs">Vous gagnez</p>
            <p className="font-bold">{data.rewards.referrerCreditMad} MAD/parrainage</p>
          </div>
          <div className="bg-white/20 rounded-lg px-3 py-2">
            <p className="opacity-70 text-xs">Ils gagnent</p>
            <p className="font-bold">{data.rewards.refereeCreditMad} MAD</p>
          </div>
        </div>
      </div>

      {/* My code */}
      <div className="border rounded-xl p-5 mb-6">
        <p className="text-sm text-gray-500 mb-2 font-medium">Votre code de parrainage</p>
        <div className="flex gap-3 items-center">
          <div className="flex-1 bg-gray-50 border rounded-lg px-4 py-3 font-mono font-bold text-xl text-center tracking-widest">
            {data.referralCode}
          </div>
          <button onClick={handleCopy} className="bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            {copied ? "✓ Copié" : "Copier"}
          </button>
        </div>
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-semibold transition"
        >
          <span>📲</span> Partager sur WhatsApp
        </a>
      </div>

      {/* Apply a code */}
      <div className="border rounded-xl p-5">
        <p className="font-medium text-gray-700 mb-3">Utiliser un code de parrainage</p>
        <form onSubmit={handleApply} className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Code d'un ami"
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            maxLength={8}
          />
          <button type="submit" disabled={loading || !code} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-blue-700 transition">
            {loading ? "…" : "Appliquer"}
          </button>
        </form>
        {msg && (
          <p className={`text-sm mt-2 ${msg.type === "success" ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>
        )}
      </div>
    </div>
  );
}
