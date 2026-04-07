import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import OwnerLayout from "../components/owner/OwnerLayout";

const FEATURES = ["Air conditioning", "GPS", "Bluetooth", "Backup camera", "Sunroof", "Leather seats", "Heated seats", "USB port", "Cruise control", "Parking sensors"];

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');
  .ar { --bg:#09090f; --s1:#111118; --s2:#16161f; --border:rgba(255,255,255,0.07); --txt:#e8e8f0; --muted:#5a5a72; --dim:#3a3a52; --violet:#7c6cfc; --head:'Syne',sans-serif; --mono:'DM Mono',monospace; padding:40px 44px 60px; min-height:100vh; background:var(--bg); color:var(--txt); font-family:var(--head); width:100%; box-sizing:border-box; }
  .ar-header { margin-bottom:36px; }
  .ar-eyebrow { font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
  .ar-title { font-size:32px; font-weight:800; letter-spacing:-.04em; line-height:1; }
  .ar-sub { font-family:var(--mono); font-size:12px; color:var(--muted); margin-top:8px; }
  .ar-form-card { background:var(--s1); border:1px solid var(--border); border-radius:20px; padding:36px; max-width:780px; }
  .ar-section { margin-bottom:28px; }
  .ar-section-label { font-family:var(--mono); font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:var(--violet); display:flex; align-items:center; gap:8px; margin-bottom:18px; padding-bottom:12px; border-bottom:1px solid var(--border); }
  .ar-section-label::before { content:''; width:18px; height:1px; background:var(--violet); }
  .ar-field { display:flex; flex-direction:column; gap:6px; }
  .ar-label { font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
  .ar-input, .ar-textarea, .ar-select { width:100%; background:var(--s2); border:1px solid var(--border); border-radius:11px; padding:13px 16px; font-family:var(--mono); font-size:13px; color:var(--txt); outline:none; transition:border-color .2s; }
  .ar-input:focus, .ar-textarea:focus, .ar-select:focus { border-color:var(--violet); box-shadow:0 0 0 3px rgba(124,108,252,.1); }
  .ar-input::placeholder, .ar-textarea::placeholder { color:var(--dim); }
  .ar-select option { background:var(--s1); }
  .ar-textarea { resize:vertical; min-height:100px; }
  .ar-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .ar-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; }
  .ar-upload-zone { position:relative; border:1.5px dashed var(--border); border-radius:12px; padding:28px; text-align:center; cursor:pointer; transition:border-color .2s, background .2s; background:var(--s2); }
  .ar-upload-zone:hover { border-color:var(--violet); background:rgba(124,108,252,.06); }
  .ar-upload-input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
  .ar-upload-text { font-family:var(--mono); font-size:11px; letter-spacing:.06em; color:var(--muted); }
  .ar-upload-text strong { color:var(--violet); }
  .ar-previews { display:flex; flex-wrap:wrap; gap:10px; margin-top:14px; }
  .ar-preview { position:relative; width:88px; height:72px; border-radius:10px; overflow:hidden; border:1px solid var(--border); }
  .ar-preview img { width:100%; height:100%; object-fit:cover; }
  .ar-preview-rm { position:absolute; top:4px; right:4px; width:18px; height:18px; border-radius:50%; background:rgba(252,108,108,.85); color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px; cursor:pointer; border:none; }
  .ar-spinner { width:16px; height:16px; border-radius:50%; border:2px solid rgba(124,108,252,.3); border-top-color:var(--violet); animation:ar-spin .8s linear infinite; }
  @keyframes ar-spin { to { transform:rotate(360deg); } }
  .ar-footer { display:flex; align-items:center; gap:14px; padding-top:24px; border-top:1px solid var(--border); margin-top:8px; }
  .ar-submit { padding:14px 32px; background:var(--violet); color:#fff; border:none; border-radius:12px; font-family:var(--mono); font-size:12px; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:opacity .2s, transform .2s; display:flex; align-items:center; gap:8px; }
  .ar-submit:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
  .ar-submit:disabled { opacity:.5; cursor:not-allowed; }
  .ar-submit-note { font-family:var(--mono); font-size:10px; color:var(--muted); }
  .ar-features-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
  .ar-feature-check { display:flex; align-items:center; gap:8px; cursor:pointer; font-family:var(--mono); font-size:11px; color:var(--muted); }
  .ar-feature-check input { accent-color:var(--violet); width:14px; height:14px; }
  @keyframes ar-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .ar-fade { opacity:0; animation:ar-up .5s ease forwards; }
  @media(max-width:768px) { .ar{padding:28px 16px 48px;} .ar-form-card{padding:22px;} .ar-grid-2,.ar-grid-3{grid-template-columns:1fr;} .ar-features-grid{grid-template-columns:1fr;} }
`;

function Field({ label, name, type = "text", value, onChange, placeholder, required = true }) {
  return (
    <div className="ar-field">
      <label className="ar-label">{label}</label>
      <input className="ar-input" type={type} name={name} value={value} onChange={onChange} placeholder={placeholder || label} required={required} />
    </div>
  );
}
function SelectField({ label, name, value, onChange, options }) {
  return (
    <div className="ar-field">
      <label className="ar-label">{label}</label>
      <select className="ar-select" name={name} value={value} onChange={onChange}>
        <option value="">Select {label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export default function AddRental() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", pricePerDay: "", city: "",
    brand: "", model: "", year: "", fuel: "", gearbox: "",
    color: "", doors: "", seats: "", fuelPolicy: "", cancelPolicy: "", minRentalDays: "1",
  });
  const [features, setFeatures] = useState([]);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleFeature = (f) =>
    setFeatures((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const openCloudinaryWidget = () => {
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", multiple: true },
      (err, result) => {
        if (!err && result?.event === "success") {
          setImages((prev) => [...prev, result.info.secure_url]);
        }
      }
    );
  };

  const removeImage = (idx) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (images.length === 0) { setError("Please upload at least one photo"); return; }
    setLoading(true);
    try {
      await api.post("/rental", {
        ...form,
        pricePerDay: Number(form.pricePerDay),
        year: Number(form.year),
        doors: form.doors ? Number(form.doors) : undefined,
        seats: form.seats ? Number(form.seats) : undefined,
        minRentalDays: Number(form.minRentalDays) || 1,
        features,
        images,
      });
      navigate("/my-rentals");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create rental");
    } finally { setLoading(false); }
  };

  return (
    <OwnerLayout>
      <style>{S}</style>
      <div className="ar">
        <div className="ar-header ar-fade">
          <p className="ar-eyebrow">Owner Panel</p>
          <h1 className="ar-title">Add Rental Car</h1>
          <p className="ar-sub">Fill in the details — your listing will be reviewed before going live</p>
        </div>

        {error && (
          <div style={{ background: "#2a0a0a", border: "1px solid rgba(252,108,108,.3)", borderRadius: 12, padding: "12px 18px", marginBottom: 20, color: "#fc6c6c", fontSize: 13, maxWidth: 780 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="ar-form-card ar-fade" style={{ animationDelay: "80ms" }}>

          {/* Listing Info */}
          <div className="ar-section">
            <div className="ar-section-label">Listing Info</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. BMW 3 Series 2021" />
              <div className="ar-field">
                <label className="ar-label">Description</label>
                <textarea className="ar-textarea" name="description" value={form.description} onChange={handleChange} placeholder="Describe the car, condition, extras…" rows={4} />
              </div>
              <div className="ar-grid-2">
                <Field label="Price per Day (MAD)" name="pricePerDay" type="number" value={form.pricePerDay} onChange={handleChange} placeholder="e.g. 350" />
                <Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Casablanca" />
              </div>
            </div>
          </div>

          {/* Vehicle Specs */}
          <div className="ar-section">
            <div className="ar-section-label">Vehicle Specs</div>
            <div className="ar-grid-2" style={{ gap: 14 }}>
              <Field label="Brand" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. BMW" />
              <Field label="Model" name="model" value={form.model} onChange={handleChange} placeholder="e.g. 320i" />
              <Field label="Year" name="year" type="number" value={form.year} onChange={handleChange} placeholder="e.g. 2021" />
              <Field label="Color" name="color" value={form.color} onChange={handleChange} placeholder="e.g. Black" required={false} />
              <Field label="Doors" name="doors" type="number" value={form.doors} onChange={handleChange} placeholder="e.g. 4" required={false} />
              <Field label="Seats" name="seats" type="number" value={form.seats} onChange={handleChange} placeholder="e.g. 5" required={false} />
              <SelectField label="Fuel" name="fuel" value={form.fuel} onChange={handleChange} options={["Diesel", "Petrol", "Hybrid", "Electric"]} />
              <SelectField label="Gearbox" name="gearbox" value={form.gearbox} onChange={handleChange} options={["Manual", "Automatic"]} />
            </div>
          </div>

          {/* Rental Terms */}
          <div className="ar-section">
            <div className="ar-section-label">Rental Terms</div>
            <div className="ar-grid-2" style={{ gap: 14 }}>
              <Field label="Min Rental Days" name="minRentalDays" type="number" value={form.minRentalDays} onChange={handleChange} placeholder="e.g. 1" required={false} />
              <Field label="Fuel Policy" name="fuelPolicy" value={form.fuelPolicy} onChange={handleChange} placeholder="e.g. Full-to-Full" required={false} />
            </div>
            <div style={{ marginTop: 14 }}>
              <Field label="Cancellation Policy" name="cancelPolicy" value={form.cancelPolicy} onChange={handleChange} placeholder="e.g. Free cancellation 24h before pickup" required={false} />
            </div>
          </div>

          {/* Features */}
          <div className="ar-section">
            <div className="ar-section-label">Features & Extras</div>
            <div className="ar-features-grid">
              {FEATURES.map((f) => (
                <label key={f} className="ar-feature-check">
                  <input type="checkbox" checked={features.includes(f)} onChange={() => toggleFeature(f)} />
                  {f}
                </label>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="ar-section" style={{ marginBottom: 24 }}>
            <div className="ar-section-label">Photos</div>
            <div className="ar-upload-zone" onClick={openCloudinaryWidget} style={{ cursor: "pointer" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
              <p className="ar-upload-text"><strong>Click to upload</strong> — multiple images allowed</p>
            </div>
            {images.length > 0 && (
              <div className="ar-previews">
                {images.map((img, i) => (
                  <div key={i} className="ar-preview">
                    <img src={img} alt={`Preview ${i + 1}`} />
                    <button type="button" className="ar-preview-rm" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ar-footer">
            <button type="submit" className="ar-submit" disabled={loading || uploading}>
              {loading
                ? <><div className="ar-spinner" style={{ borderTopColor: "#fff" }} /> Submitting…</>
                : "Submit for Review →"}
            </button>
            <span className="ar-submit-note">Your listing will be reviewed before going live</span>
          </div>
        </form>
      </div>
    </OwnerLayout>
  );
}
