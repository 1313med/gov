import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateMyProfile, updateDriverLicense } from "../api/user";
import { loadAuth, saveAuth } from "../utils/authStorage";

const INPUT = {
  width: "100%", padding: "11px 14px", border: "1px solid #e5e7eb",
  borderRadius: 10, fontSize: 14, fontFamily: "inherit", outline: "none",
  boxSizing: "border-box",
};
const LABEL = {
  display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280",
  marginBottom: 6, textTransform: "uppercase", letterSpacing: ".06em",
};
const SECTION_TITLE = {
  fontSize: 18, fontWeight: 700, margin: "36px 0 18px", paddingTop: 28,
  borderTop: "1px solid #f3f4f6", color: "#111827",
};

export default function Profile() {
  const auth = loadAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ name: "", phone: "", email: "", city: "", bio: "", avatar: "" });
  const [license, setLicense] = useState({ number: "", expiryDate: "", imageUrl: "" });
  const [existingLicense, setExistingLicense] = useState(null);

  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const [licSaving,  setLicSaving]  = useState(false);
  const [licSuccess, setLicSuccess] = useState(false);
  const [licError,   setLicError]   = useState("");

  useEffect(() => {
    if (!auth?._id) { navigate("/login"); return; }
    getMyProfile().then((r) => {
      const u = r.data;
      setForm({ name: u.name || "", phone: u.phone || "", email: u.email || "", city: u.city || "", bio: u.bio || "", avatar: u.avatar || "" });
      if (u.driverLicense?.number) {
        setExistingLicense(u.driverLicense);
        setLicense({
          number:     u.driverLicense.number || "",
          expiryDate: u.driverLicense.expiryDate ? u.driverLicense.expiryDate.slice(0, 10) : "",
          imageUrl:   u.driverLicense.imageUrl || "",
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const openAvatarWidget = () => {
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", multiple: false, cropping: true },
      (err, result) => {
        if (!err && result?.event === "success") setForm((p) => ({ ...p, avatar: result.info.secure_url }));
      }
    );
  };

  const openLicenseWidget = () => {
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", sources: ["local", "camera"], multiple: false, cropping: false },
      (err, result) => {
        if (!err && result?.event === "success") setLicense((p) => ({ ...p, imageUrl: result.info.secure_url }));
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess(false);
    try {
      const r = await updateMyProfile({ name: form.name, city: form.city, bio: form.bio, avatar: form.avatar, email: form.email });
      saveAuth({ ...auth, name: r.data.name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const handleLicenseSubmit = async (e) => {
    e.preventDefault();
    setLicSaving(true); setLicError(""); setLicSuccess(false);
    try {
      const r = await updateDriverLicense({ number: license.number, expiryDate: license.expiryDate || null, imageUrl: license.imageUrl });
      setExistingLicense(r.data.driverLicense);
      setLicSuccess(true);
      setTimeout(() => setLicSuccess(false), 3000);
    } catch (err) {
      setLicError(err?.response?.data?.message || "Failed to save license");
    } finally { setLicSaving(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: "0 20px 80px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>My Profile</h1>
      <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 32 }}>Update your personal information</p>

      {/* ── Avatar ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", background: "#e5e7eb", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#374151",
        }}>
          {form.avatar
            ? <img src={form.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : (form.name?.[0] || "?")}
        </div>
        <button type="button" onClick={openAvatarWidget}
          style={{ padding: "9px 18px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Change photo
        </button>
      </div>

      {/* ── Profile form ── */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {[
          { label: "Full name", key: "name", type: "text" },
          { label: "Email address", key: "email", type: "email" },
          { label: "City", key: "city", type: "text" },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label style={LABEL}>{label}</label>
            <input type={type} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} style={INPUT} />
          </div>
        ))}

        <div>
          <label style={LABEL}>Phone (read-only)</label>
          <input value={form.phone} readOnly style={{ ...INPUT, background: "#f9fafb", color: "#9ca3af" }} />
        </div>

        <div>
          <label style={LABEL}>Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={3}
            placeholder="Tell buyers a bit about yourself…"
            style={{ ...INPUT, resize: "vertical" }} />
        </div>

        {error   && <p style={{ color: "#dc2626", fontSize: 13 }}>{error}</p>}
        {success && <p style={{ color: "#059669", fontSize: 13 }}>Profile updated successfully!</p>}

        <button type="submit" disabled={saving}
          style={{ padding: "13px", background: "#141412", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>

      {/* ── Driver License section (customers only) ── */}
      {(auth?.role === "customer" || !auth?.role) && (
        <form onSubmit={handleLicenseSubmit}>
          <h2 style={SECTION_TITLE}>Driving License</h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
            Required to book a rental car. Upload a photo of your driving license.
          </p>

          {/* Status badge */}
          {existingLicense && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 18,
              padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600,
              background: existingLicense.verified ? "rgba(5,150,105,.1)" : "rgba(245,158,11,.1)",
              color: existingLicense.verified ? "#059669" : "#b45309",
              border: `1px solid ${existingLicense.verified ? "rgba(5,150,105,.3)" : "rgba(245,158,11,.3)"}`,
            }}>
              {existingLicense.verified ? "✓ License Verified" : "⏳ Pending Verification"}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={LABEL}>License Number</label>
              <input value={license.number} onChange={(e) => setLicense((p) => ({ ...p, number: e.target.value }))}
                placeholder="e.g. DZ-123456789" style={INPUT} required />
            </div>

            <div>
              <label style={LABEL}>Expiry Date</label>
              <input type="date" value={license.expiryDate} onChange={(e) => setLicense((p) => ({ ...p, expiryDate: e.target.value }))} style={INPUT} />
            </div>

            <div>
              <label style={LABEL}>License Photo</label>
              {license.imageUrl ? (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <img src={license.imageUrl} alt="license" style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <button type="button" onClick={openLicenseWidget}
                    style={{ padding: "8px 14px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Replace photo
                  </button>
                </div>
              ) : (
                <button type="button" onClick={openLicenseWidget}
                  style={{ padding: "10px 20px", background: "#f3f4f6", border: "1.5px dashed #d1d5db", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", width: "100%" }}>
                  Upload license photo
                </button>
              )}
            </div>

            {licError   && <p style={{ color: "#dc2626", fontSize: 13 }}>{licError}</p>}
            {licSuccess && <p style={{ color: "#059669", fontSize: 13 }}>License saved! It will be reviewed shortly.</p>}

            <button type="submit" disabled={licSaving || !license.number || !license.imageUrl}
              style={{ padding: "13px", background: "#141412", color: "#fff", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: (licSaving || !license.number || !license.imageUrl) ? "not-allowed" : "pointer", opacity: (licSaving || !license.number || !license.imageUrl) ? 0.5 : 1 }}>
              {licSaving ? "Saving…" : "Save License"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
