import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getMyProfile, updateDriverLicense, updateNationalId } from "../api/user";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";

export default function ProfileDocumentsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useAppLang();
  const { dark } = useTheme();
  const fr = lang === "fr";
  const returnPath = params.get("return") === "add-rental" ? "/add-rental" : "/rentals";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [license, setLicense] = useState({ number: "", expiryDate: "", imageUrl: "" });
  const [cin, setCin] = useState({ number: "", imageUrl: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((r) => {
        const u = r.data;
        setProfile(u);
        if (u?.driverLicense) {
          setLicense({
            number: u.driverLicense.number || "",
            expiryDate: u.driverLicense.expiryDate ? u.driverLicense.expiryDate.slice(0, 10) : "",
            imageUrl: u.driverLicense.imageUrl || "",
          });
        }
        if (u?.nationalId) {
          setCin({ number: u.nationalId.number || "", imageUrl: u.nationalId.imageUrl || "" });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const upload = async (setter) => {
    const { loadCloudinary } = await import("../utils/loadCloudinary");
    await loadCloudinary();
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", sources: ["local", "camera"], multiple: false },
      (error, result) => {
        if (!error && result?.event === "success") setter(result.info.secure_url);
      }
    );
  };

  const canRent =
    profile?.driverLicense?.imageUrl &&
    profile?.nationalId?.imageUrl &&
    license.number &&
    cin.number;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        updateDriverLicense({
          number: license.number,
          expiryDate: license.expiryDate || null,
          imageUrl: license.imageUrl,
        }),
        updateNationalId({ number: cin.number, imageUrl: cin.imageUrl }),
      ]);
      if (canRent || (license.imageUrl && cin.imageUrl)) {
        navigate(returnPath);
      } else {
        alert(fr ? "Documents enregistrés — en attente de vérification." : "Documents saved — pending verification.");
        navigate("/profile");
      }
    } catch (err) {
      alert(err?.response?.data?.message || (fr ? "Erreur" : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const bg = dark ? "#05060f" : "#f5f7ff";
  const card = dark ? "#101426" : "#fff";
  const txt = dark ? "#f5f7ff" : "#0b163d";

  if (loading) {
    return <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: txt }}>…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "32px 24px 80px", maxWidth: 520, margin: "0 auto" }}>
      <Link to="/profile" style={{ color: "#7c6bff" }}>← {fr ? "Profil" : "Profile"}</Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: txt, margin: "16px 0 8px" }}>
        {fr ? "Documents de location" : "Rental documents"}
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: 24 }}>
        {fr ? "Permis de conduire et carte d'identité nationale." : "Driver license and national ID."}
      </p>

      <form onSubmit={handleSubmit} style={{ background: card, padding: 24, borderRadius: 16, border: "1px solid rgba(148,163,184,.2)" }}>
        <h2 style={{ fontSize: 16, color: txt, marginBottom: 12 }}>{fr ? "Permis" : "License"}</h2>
        <input placeholder={fr ? "Numéro" : "Number"} value={license.number} onChange={(e) => setLicense((l) => ({ ...l, number: e.target.value }))} style={{ width: "100%", marginBottom: 8, padding: 10, borderRadius: 8 }} />
        <input type="date" value={license.expiryDate} onChange={(e) => setLicense((l) => ({ ...l, expiryDate: e.target.value }))} style={{ width: "100%", marginBottom: 8, padding: 10, borderRadius: 8 }} />
        {license.imageUrl && <img src={license.imageUrl} alt="" style={{ width: "100%", maxHeight: 120, objectFit: "contain", marginBottom: 8 }} />}
        <button type="button" onClick={() => upload((url) => setLicense((l) => ({ ...l, imageUrl: url })))} style={{ width: "100%", marginBottom: 20, padding: 10, borderRadius: 8, border: "1px dashed #7c6bff", background: "transparent", color: "#7c6bff" }}>
          {fr ? "Photo permis" : "License photo"}
        </button>

        <h2 style={{ fontSize: 16, color: txt, marginBottom: 12 }}>CIN</h2>
        <input placeholder={fr ? "Numéro CIN" : "CIN number"} value={cin.number} onChange={(e) => setCin((c) => ({ ...c, number: e.target.value }))} style={{ width: "100%", marginBottom: 8, padding: 10, borderRadius: 8 }} />
        {cin.imageUrl && <img src={cin.imageUrl} alt="" style={{ width: "100%", maxHeight: 120, objectFit: "contain", marginBottom: 8 }} />}
        <button type="button" onClick={() => upload((url) => setCin((c) => ({ ...c, imageUrl: url })))} style={{ width: "100%", marginBottom: 20, padding: 10, borderRadius: 8, border: "1px dashed #7c6bff", background: "transparent", color: "#7c6bff" }}>
          {fr ? "Photo CIN" : "CIN photo"}
        </button>

        <button type="submit" disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, background: "#7c6bff", color: "#fff", fontWeight: 700, border: "none" }}>
          {saving ? "…" : (fr ? "Enregistrer et continuer" : "Save and continue")}
        </button>
      </form>
    </div>
  );
}
