import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { getMyProfile, updateNationalId } from "../api/user";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";

export default function VerifyCinPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useAppLang();
  const { dark } = useTheme();
  const fr = lang === "fr";

  const purpose = params.get("purpose") === "rent" ? "rent" : "sell";
  const returnPath =
    params.get("return") === "add-rental"
      ? "/add-rental"
      : params.get("return") === "new-sale"
        ? "/my-sales/new"
        : "/my-sales/new";

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cinNumber, setCinNumber] = useState("");
  const [cinImage, setCinImage] = useState("");

  useEffect(() => {
    if (purpose === "rent") {
      navigate(`/profile-documents${params.get("return") ? `?return=${params.get("return")}` : ""}`, { replace: true });
    }
  }, [purpose, params, navigate]);

  useEffect(() => {
    getMyProfile()
      .then((r) => {
        setProfile(r.data);
        if (r.data?.nationalId?.number) setCinNumber(r.data.nationalId.number);
        if (r.data?.nationalId?.imageUrl) setCinImage(r.data.nationalId.imageUrl);
      })
      .finally(() => setLoading(false));
  }, []);

  const uploadCin = () => {
    if (!window.cloudinary) return;
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", sources: ["local", "camera"], multiple: false },
      (error, result) => {
        if (!error && result?.event === "success") setCinImage(result.info.secure_url);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cinNumber.trim() || !cinImage) {
      alert(fr ? "Numéro CIN et photo requis." : "CIN number and photo required.");
      return;
    }
    setSaving(true);
    try {
      await updateNationalId({ number: cinNumber.trim(), imageUrl: cinImage });
      navigate(returnPath);
    } catch (err) {
      alert(err?.response?.data?.message || (fr ? "Erreur" : "Error"));
    } finally {
      setSaving(false);
    }
  };

  if (purpose === "rent") return null;

  const bg = dark ? "#05060f" : "#f5f7ff";
  const card = dark ? "#101426" : "#fff";
  const txt = dark ? "#f5f7ff" : "#0b163d";

  if (loading) {
    return <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: txt }}>…</div>;
  }

  if (profile?.nationalId?.verified) {
    navigate(returnPath, { replace: true });
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "32px 24px 80px", maxWidth: 480, margin: "0 auto" }}>
      <Link to="/profile" style={{ color: "#7c6bff" }}>← {fr ? "Profil" : "Profile"}</Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: txt, margin: "16px 0 8px" }}>
        {fr ? "Vérification CIN" : "National ID verification"}
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: 24 }}>
        {fr ? "Requis pour publier une annonce à la vente." : "Required to publish a sale listing."}
      </p>

      <form onSubmit={handleSubmit} style={{ background: card, padding: 24, borderRadius: 16, border: "1px solid rgba(148,163,184,.2)" }}>
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{fr ? "Numéro CIN" : "CIN number"}</span>
          <input value={cinNumber} onChange={(e) => setCinNumber(e.target.value)} style={{ width: "100%", marginTop: 6, padding: 10, borderRadius: 8 }} required />
        </label>
        {cinImage && <img src={cinImage} alt="CIN" style={{ width: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 8, marginBottom: 12 }} />}
        <button type="button" onClick={uploadCin} style={{ width: "100%", padding: 10, marginBottom: 16, borderRadius: 8, border: "1px dashed #7c6bff", background: "transparent", color: "#7c6bff", cursor: "pointer" }}>
          {fr ? "Photo de la CIN" : "CIN photo"}
        </button>
        <button type="submit" disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, background: "#7c6bff", color: "#fff", fontWeight: 700, border: "none" }}>
          {saving ? "…" : (fr ? "Continuer" : "Continue")}
        </button>
      </form>
    </div>
  );
}
