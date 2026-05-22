import { useState, useEffect } from "react";
import OwnerLayout from "../components/owner/OwnerLayout";
import { getMyStaff, inviteStaff, removeStaff, updateStaffPermissions } from "../api/staff";

const PERMISSION_LABELS = {
  manageBookings: "Gérer les réservations",
  manageMessages: "Gérer les messages",
  viewAnalytics:  "Voir les analytics",
  managePricing:  "Gérer les prix",
};

export default function StaffManagementPage() {
  const [data, setData]   = useState({ staff: [], pendingInvites: [] });
  const [form, setForm]   = useState({ phone: "", name: "", permissions: { manageBookings: true, manageMessages: true, viewAnalytics: false, managePricing: false } });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]     = useState(null);

  const load = () => getMyStaff().then((r) => setData(r.data));
  useEffect(() => { load(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await inviteStaff(form);
      setMsg({ type: "success", text: "Invitation envoyée !" });
      setForm({ phone: "", name: "", permissions: { manageBookings: true, manageMessages: true, viewAnalytics: false, managePricing: false } });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Erreur" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm("Retirer ce membre de l'équipe ?")) return;
    await removeStaff(userId);
    load();
  };

  const togglePermission = async (userId, perm, current) => {
    await updateStaffPermissions(userId, { [perm]: !current });
    load();
  };

  return (
    <OwnerLayout>
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">👥 Mon équipe</h1>

      {/* Active staff */}
      {data.staff.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-3">Membres actifs</h2>
          <div className="space-y-3">
            {data.staff.map((s) => (
              <div key={s._id} className="border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">{s.name?.[0]}</div>
                    <div>
                      <p className="font-semibold text-sm">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.phone}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(s._id)} className="text-red-400 hover:text-red-600 text-xs border border-red-200 px-3 py-1 rounded-lg">Retirer</button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PERMISSION_LABELS).map(([perm, label]) => (
                    <label key={perm} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!s.staffPermissions?.[perm]}
                        onChange={() => togglePermission(s._id, perm, s.staffPermissions?.[perm])}
                        className="accent-blue-600"
                      />
                      <span className="text-xs text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending invites */}
      {data.pendingInvites.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-3">Invitations en attente</h2>
          <div className="space-y-2">
            {data.pendingInvites.map((inv) => (
              <div key={inv._id} className="border border-dashed rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{inv.name}</p>
                  <p className="text-xs text-gray-500">{inv.phone} · Expire le {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">⏳ En attente</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite form */}
      <div className="border rounded-2xl p-5">
        <h2 className="font-semibold text-gray-700 mb-4">Inviter un collaborateur</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Prénom & Nom</label>
              <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Mohamed Alami" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Téléphone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="06XXXXXXXX" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PERMISSION_LABELS).map(([perm, label]) => (
                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.permissions[perm]}
                    onChange={(e) => setForm((p) => ({ ...p, permissions: { ...p.permissions, [perm]: e.target.checked } }))}
                    className="accent-blue-600"
                  />
                  <span className="text-xs text-gray-600">{label}</span>
                </label>
              ))}
            </div>
          </div>
          {msg && (
            <div className={`rounded-lg px-4 py-2 text-sm ${msg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{msg.text}</div>
          )}
          <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
            {saving ? "Envoi…" : "Envoyer l'invitation"}
          </button>
        </form>
      </div>
    </div>
    </OwnerLayout>
  );
}
