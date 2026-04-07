import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../api/user";
import { loadAuth, saveAuth } from "../utils/authStorage";

export default function Profile() {
  const auth = loadAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", bio: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth?.token) { navigate("/login"); return; }
    getMyProfile().then((r) => {
      const u = r.data;
      setForm({
        name: u.name || "",
        phone: u.phone || "",
        email: u.email || "",
        city: u.city || "",
        bio: u.bio || "",
        avatar: u.avatar || "",
      });
    }).finally(() => setLoading(false));
  }, []);

  const openCloudinaryWidget = () => {
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", multiple: false, cropping: true },
      (err, result) => {
        if (!err && result?.event === "success") {
          setForm((p) => ({ ...p, avatar: result.info.secure_url }));
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess(false);
    try {
      const r = await updateMyProfile({ name: form.name, city: form.city, bio: form.bio, avatar: form.avatar, email: form.email });
      // Update stored auth name
      saveAuth({ ...auth, name: r.data.name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 20px 60px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>My Profile</h1>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 32 }}>Update your personal information</p>

      {/* Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "#e5e7eb", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, color: "#374151",
        }}>
          {form.avatar
            ? <img src={form.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (form.name?.[0] || "?")}
        </div>
        <button
          type="button"
          onClick={openCloudinaryWidget}
          style={{
            padding: "9px 18px", background: "#f3f4f6", border: "1px solid #e5e7eb",
            borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          Change photo
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {[
          { label: "Full name", key: "name", type: "text" },
          { label: "Email address", key: "email", type: "email" },
          { label: "City", key: "city", type: "text" },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              style={{
                width: "100%", padding: "11px 14px", border: "1px solid #e5e7eb",
                borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Phone (read-only)</label>
          <input
            value={form.phone} readOnly
            style={{
              width: "100%", padding: "11px 14px", border: "1px solid #e5e7eb",
              borderRadius: 10, fontSize: 14, background: "#f9fafb", color: "#9ca3af", boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em" }}>Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            rows={3}
            placeholder="Tell buyers a bit about yourself…"
            style={{
              width: "100%", padding: "11px 14px", border: "1px solid #e5e7eb",
              borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none",
              resize: "vertical", boxSizing: "border-box",
            }}
          />
        </div>

        {error && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
        {success && <p style={{ color: "#059669", fontSize: 13 }}>Profile updated successfully!</p>}

        <button
          type="submit" disabled={saving}
          style={{
            padding: "13px", background: "#141412", color: "#fff",
            border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
