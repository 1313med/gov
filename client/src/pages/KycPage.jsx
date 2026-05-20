import { useState, useEffect } from "react";
import { getMyKyc, submitKyc } from "../api/kyc";
import { api } from "../api/axios";

export default function KycPage() {
  const [kyc, setKyc] = useState(null);
  const [form, setForm] = useState({
    cinNumber: "", cinImageUrl: "",
    permisNumber: "", permisExpiryDate: "", permisImageUrl: "",
  });
  const [uploading, setUploading] = useState({ cin: false, permis: false });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    getMyKyc().then((r) => {
      setKyc(r.data);
      setForm({
        cinNumber:       r.data.nationalId?.number    || "",
        cinImageUrl:     r.data.nationalId?.imageUrl  || "",
        permisNumber:    r.data.driverLicense?.number || "",
        permisExpiryDate:r.data.driverLicense?.expiryDate
          ? new Date(r.data.driverLicense.expiryDate).toISOString().slice(0, 10) : "",
        permisImageUrl:  r.data.driverLicense?.imageUrl || "",
      });
    });
  }, []);

  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const type = field === "cinImageUrl" ? "cin" : "permis";
    setUploading((p) => ({ ...p, [type]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.post("/upload/single", fd);
      setForm((p) => ({ ...p, [field]: res.data.url }));
    } catch {
      setMsg({ type: "error", text: "Upload failed. Try again." });
    } finally {
      setUploading((p) => ({ ...p, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await submitKyc(form);
      setKyc({ nationalId: res.data.nationalId, driverLicense: res.data.driverLicense });
      setMsg({ type: "success", text: "Documents submitted for review. Our team will verify within 48h." });
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Submission failed" });
    } finally {
      setSaving(false);
    }
  };

  const badge = (verified, submitted) =>
    verified   ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Vérifié</span>
    : submitted ? <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">⏳ En attente</span>
               : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Non soumis</span>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-1">Vérification d'identité (KYC)</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Soumettez votre CIN et permis de conduire pour débloquer la location et renforcer votre profil de confiance.
      </p>

      {/* Status badges */}
      {kyc && (
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Carte Nationale (CIN)</p>
            {badge(kyc.nationalId?.verified, !!(kyc.nationalId?.number || kyc.nationalId?.imageUrl))}
          </div>
          <div className="border rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Permis de conduire</p>
            {badge(kyc.driverLicense?.verified, !!(kyc.driverLicense?.number || kyc.driverLicense?.imageUrl))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* CIN Section */}
        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Carte Nationale d'Identité (CIN)</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Numéro CIN</label>
            <input
              type="text"
              value={form.cinNumber}
              onChange={(e) => setForm((p) => ({ ...p, cinNumber: e.target.value }))}
              placeholder="Ex : AB123456"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Photo de la CIN</label>
            {form.cinImageUrl && (
              <img src={form.cinImageUrl} alt="CIN" className="h-24 rounded-lg mb-2 object-cover" />
            )}
            <input type="file" accept="image/*,.pdf" onChange={(e) => handleUpload(e, "cinImageUrl")} className="text-sm" />
            {uploading.cin && <p className="text-xs text-blue-500 mt-1">Envoi en cours…</p>}
          </div>
        </div>

        {/* Permis Section */}
        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-800">Permis de conduire</h2>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Numéro du permis</label>
            <input
              type="text"
              value={form.permisNumber}
              onChange={(e) => setForm((p) => ({ ...p, permisNumber: e.target.value }))}
              placeholder="Numéro du permis"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Date d'expiration</label>
            <input
              type="date"
              value={form.permisExpiryDate}
              onChange={(e) => setForm((p) => ({ ...p, permisExpiryDate: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Photo du permis</label>
            {form.permisImageUrl && (
              <img src={form.permisImageUrl} alt="Permis" className="h-24 rounded-lg mb-2 object-cover" />
            )}
            <input type="file" accept="image/*,.pdf" onChange={(e) => handleUpload(e, "permisImageUrl")} className="text-sm" />
            {uploading.permis && <p className="text-xs text-blue-500 mt-1">Envoi en cours…</p>}
          </div>
        </div>

        {msg && (
          <div className={`rounded-lg px-4 py-3 text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {msg.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
        >
          {saving ? "Envoi en cours…" : "Soumettre pour vérification"}
        </button>
      </form>
    </div>
  );
}
