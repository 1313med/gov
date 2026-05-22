import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getMyCar, createCar, updateCar } from "../api/userCar";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";

export default function AddCarPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const navigate = useNavigate();
  const { lang } = useAppLang();
  const { dark } = useTheme();
  const fr = lang === "fr";

  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    fuel: "essence",
    gearbox: "manuelle",
    color: "",
    vin: "",
    image: "",
  });

  useEffect(() => {
    if (!editId) return;
    getMyCar()
      .then((r) => {
        const c = r.data;
        if (c && String(c._id) === editId) {
          setForm({
            brand: c.brand || "",
            model: c.model || "",
            year: c.year ? String(c.year) : "",
            mileage: c.mileage != null ? String(c.mileage) : "",
            fuel: c.fuel || "essence",
            gearbox: c.gearbox || "manuelle",
            color: c.color || "",
            vin: c.vin || "",
            image: c.image || c.images?.[0] || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [editId]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openImageUpload = () => {
    if (!window.cloudinary) {
      alert(fr ? "Upload non disponible" : "Upload unavailable");
      return;
    }
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", sources: ["local", "camera"], multiple: false },
      (error, result) => {
        if (!error && result?.event === "success") {
          set("image", result.info.secure_url);
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.brand.trim() || !form.year.trim()) {
      alert(fr ? "Marque et année requises." : "Brand and year required.");
      return;
    }
    setSaving(true);
    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      mileage: form.mileage ? Number(form.mileage) : 0,
      fuel: form.fuel,
      gearbox: form.gearbox,
      color: form.color || undefined,
      vin: form.vin || undefined,
      image: form.image || undefined,
    };
    try {
      if (editId) {
        await updateCar(editId, payload);
      } else {
        await createCar(payload);
      }
      navigate("/garage");
    } catch (err) {
      alert(err?.response?.data?.message || (fr ? "Erreur" : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const bg = dark ? "#05060f" : "#f0f9ff";
  const card = dark ? "#101426" : "#fff";
  const txt = dark ? "#f5f7ff" : "#0b163d";

  if (loading) {
    return <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg, color: txt }}>…</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "32px 24px 80px", maxWidth: 520, margin: "0 auto" }}>
      <Link to="/garage" style={{ color: "#38bdf8" }}>← {fr ? "Garage" : "Garage"}</Link>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: txt, margin: "16px 0 24px" }}>
        {editId ? (fr ? "Modifier le véhicule" : "Edit vehicle") : (fr ? "Ajouter ma voiture" : "Add my car")}
      </h1>

      <form onSubmit={handleSubmit} style={{ background: card, padding: 24, borderRadius: 16, border: "1px solid rgba(148,163,184,.2)" }}>
        {form.image && <img src={form.image} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 12, marginBottom: 16 }} />}
        <button type="button" onClick={openImageUpload} style={{ width: "100%", marginBottom: 16, padding: 10, borderRadius: 8, border: "1px dashed #38bdf8", background: "transparent", color: "#38bdf8", cursor: "pointer" }}>
          {fr ? "Photo du véhicule" : "Vehicle photo"}
        </button>
        {["brand", "model", "year", "mileage", "color", "vin"].map((key) => (
          <label key={key} style={{ display: "block", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{key}</span>
            <input value={form[key]} onChange={(e) => set(key, e.target.value)} required={key === "brand" || key === "year"} style={{ width: "100%", marginTop: 4, padding: 10, borderRadius: 8, border: "1px solid rgba(148,163,184,.3)", color: txt, background: dark ? "#0a0c18" : "#fff" }} />
          </label>
        ))}
        <label style={{ display: "block", marginBottom: 12 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{fr ? "Carburant" : "Fuel"}</span>
          <select value={form.fuel} onChange={(e) => set("fuel", e.target.value)} style={{ width: "100%", marginTop: 4, padding: 10 }}>
            <option value="essence">Essence</option>
            <option value="diesel">Diesel</option>
            <option value="hybride">Hybride</option>
            <option value="electrique">Électrique</option>
          </select>
        </label>
        <label style={{ display: "block", marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>{fr ? "Boîte" : "Gearbox"}</span>
          <select value={form.gearbox} onChange={(e) => set("gearbox", e.target.value)} style={{ width: "100%", marginTop: 4, padding: 10 }}>
            <option value="manuelle">{fr ? "Manuelle" : "Manual"}</option>
            <option value="automatique">{fr ? "Automatique" : "Automatic"}</option>
          </select>
        </label>
        <button type="submit" disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, background: "#38bdf8", color: "#fff", fontWeight: 700, border: "none" }}>
          {saving ? "…" : (fr ? "Enregistrer" : "Save")}
        </button>
      </form>
    </div>
  );
}
