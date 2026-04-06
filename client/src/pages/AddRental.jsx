import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import OwnerLayout from "../components/owner/OwnerLayout";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .ar {
    --bg:     #09090f;
    --s1:     #111118;
    --s2:     #16161f;
    --border: rgba(255,255,255,0.07);
    --bhi:    rgba(255,255,255,0.13);
    --txt:    #e8e8f0;
    --txt2:   #c0c0d0;
    --muted:  #5a5a72;
    --dim:    #3a3a52;
    --violet: #7c6cfc;
    --teal:   #2af5c0;
    --amber:  #f5a623;
    --danger: #fc6c6c;
    --head:   'Syne', sans-serif;
    --mono:   'DM Mono', monospace;

    padding: 40px 44px 60px;
    min-height: 100vh;
    background: var(--bg);
    color: var(--txt);
    font-family: var(--head);
    width: 100%;
    box-sizing: border-box;
  }

  /* ── Header ── */
  .ar-header { margin-bottom: 36px; }
  .ar-eyebrow {
    font-family: var(--mono); font-size: 10px; letter-spacing: .14em;
    text-transform: uppercase; color: var(--muted); margin-bottom: 8px;
  }
  .ar-title {
    font-family: var(--head); font-size: 32px; font-weight: 800;
    letter-spacing: -.04em; line-height: 1; color: var(--txt);
  }
  .ar-sub {
    font-family: var(--mono); font-size: 12px; color: var(--muted); margin-top: 8px;
  }

  /* ── Form card ── */
  .ar-form-card {
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 20px; padding: 36px;
    max-width: 780px;
  }

  /* ── Section divider ── */
  .ar-section {
    margin-bottom: 28px;
  }
  .ar-section-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: .16em;
    text-transform: uppercase; color: var(--violet);
    display: flex; align-items: center; gap: 8px;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
  }
  .ar-section-label::before {
    content: ''; width: 18px; height: 1px; background: var(--violet);
  }

  /* ── Field ── */
  .ar-field { display: flex; flex-direction: column; gap: 6px; }
  .ar-label {
    font-family: var(--mono); font-size: 10px; letter-spacing: .1em;
    text-transform: uppercase; color: var(--muted);
  }
  .ar-input, .ar-textarea {
    width: 100%;
    background: var(--s2); border: 1px solid var(--border);
    border-radius: 11px; padding: 13px 16px;
    font-family: var(--mono); font-size: 13px; color: var(--txt);
    outline: none; transition: border-color .2s, background .2s, box-shadow .2s;
    -moz-appearance: textfield;
  }
  .ar-input::-webkit-outer-spin-button,
  .ar-input::-webkit-inner-spin-button { -webkit-appearance: none; }
  .ar-input:focus, .ar-textarea:focus {
    border-color: var(--violet);
    background: rgba(124,108,252,.07);
    box-shadow: 0 0 0 3px rgba(124,108,252,.1);
  }
  .ar-input::placeholder, .ar-textarea::placeholder { color: var(--dim); }
  .ar-textarea { resize: vertical; min-height: 100px; }

  /* ── Grid for paired fields ── */
  .ar-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ar-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

  /* ── Image upload ── */
  .ar-upload-zone {
    position: relative;
    border: 1.5px dashed var(--border);
    border-radius: 12px; padding: 28px;
    text-align: center; cursor: pointer;
    transition: border-color .2s, background .2s;
    background: var(--s2);
  }
  .ar-upload-zone:hover {
    border-color: var(--violet);
    background: rgba(124,108,252,.06);
  }
  .ar-upload-input {
    position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%;
  }
  .ar-upload-icon { font-size: 28px; margin-bottom: 8px; }
  .ar-upload-text {
    font-family: var(--mono); font-size: 11px; letter-spacing: .06em;
    color: var(--muted);
  }
  .ar-upload-text strong { color: var(--violet); }

  /* Image previews */
  .ar-previews { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
  .ar-preview {
    position: relative; width: 88px; height: 72px;
    border-radius: 10px; overflow: hidden;
    border: 1px solid var(--border);
  }
  .ar-preview img { width: 100%; height: 100%; object-fit: cover; }
  .ar-preview-rm {
    position: absolute; top: 4px; right: 4px;
    width: 18px; height: 18px; border-radius: 50%;
    background: rgba(252,108,108,.85); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; cursor: pointer; border: none;
    transition: transform .15s;
  }
  .ar-preview-rm:hover { transform: scale(1.15); }
  /* Uploading overlay */
  .ar-preview-loading {
    position: absolute; inset: 0;
    background: rgba(17,17,24,.7);
    display: flex; align-items: center; justify-content: center;
  }
  .ar-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(124,108,252,.3);
    border-top-color: var(--violet);
    animation: ar-spin .8s linear infinite;
  }
  @keyframes ar-spin { to { transform: rotate(360deg); } }

  /* ── Submit ── */
  .ar-footer {
    display: flex; align-items: center; gap: 14px;
    padding-top: 24px; border-top: 1px solid var(--border); margin-top: 8px;
  }
  .ar-submit {
    padding: 14px 32px;
    background: var(--violet); color: #fff;
    border: none; border-radius: 12px;
    font-family: var(--mono); font-size: 12px;
    letter-spacing: .1em; text-transform: uppercase;
    font-weight: 500; cursor: pointer;
    transition: opacity .2s, transform .2s, box-shadow .2s;
    display: flex; align-items: center; gap: 8px;
    box-shadow: 0 4px 20px rgba(124,108,252,.3);
  }
  .ar-submit:hover:not(:disabled) {
    opacity: .88; transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(124,108,252,.4);
  }
  .ar-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; }
  .ar-submit-note {
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    letter-spacing: .04em;
  }

  /* ── Fade ── */
  @keyframes ar-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .ar-fade { opacity:0; animation:ar-up .5s ease forwards; }

  /* ── Responsive ── */
  @media(max-width:768px) {
    .ar { padding: 28px 16px 48px; }
    .ar-title { font-size: 26px; }
    .ar-form-card { padding: 22px; }
    .ar-grid-2, .ar-grid-3 { grid-template-columns: 1fr; }
  }
`;

/* ── Field components ──────────────────────────────────────────────────── */
function Field({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div className="ar-field">
      <label className="ar-label">{label}</label>
      <input
        className="ar-input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        required
      />
    </div>
  );
}

function TextArea({ label, name, value, onChange }) {
  return (
    <div className="ar-field">
      <label className="ar-label">{label}</label>
      <textarea
        className="ar-textarea"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={label}
        rows={4}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function AddRental() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", pricePerDay: "",
    city: "", brand: "", model: "", year: "", fuel: "", gearbox: "",
  });
  const [images,      setImages     ] = useState([]);
  const [uploading,   setUploading  ] = useState(false);
  const [loading,     setLoading    ] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImages = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "your_preset_here");
          const res  = await fetch("https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload", { method:"POST", body:data });
          const json = await res.json();
          return json.secure_url;
        })
      );
      setImages(prev => [...prev, ...uploads]);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_,i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/rental", { ...form, pricePerDay: Number(form.pricePerDay), year: Number(form.year), images });
      alert("✅ Rental submitted for approval");
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create rental");
    } finally {
      setLoading(false);
    }
  };

  return (
    <OwnerLayout>
      <style>{S}</style>

      <div className="ar">

        {/* ── Header ── */}
        <div className="ar-header ar-fade" style={{animationDelay:"0ms"}}>
          <p className="ar-eyebrow">Owner Panel</p>
          <h1 className="ar-title">Add Rental Car</h1>
          <p className="ar-sub">Fill in the details below — your listing will be reviewed before going live</p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="ar-form-card ar-fade" style={{animationDelay:"80ms"}}>

          {/* Section 1 — Listing info */}
          <div className="ar-section">
            <div className="ar-section-label">Listing Info</div>
            <div style={{display:"flex", flexDirection:"column", gap:14}}>
              <Field label="Title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. BMW 3 Series 2021" />
              <TextArea label="Description" name="description" value={form.description} onChange={handleChange} />
              <div className="ar-grid-2">
                <Field label="Price per Day (MAD)" name="pricePerDay" type="number" value={form.pricePerDay} onChange={handleChange} placeholder="e.g. 350" />
                <Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="e.g. Casablanca" />
              </div>
            </div>
          </div>

          {/* Section 2 — Vehicle specs */}
          <div className="ar-section">
            <div className="ar-section-label">Vehicle Specs</div>
            <div className="ar-grid-2" style={{gap:14}}>
              <Field label="Brand"   name="brand"   value={form.brand}   onChange={handleChange} placeholder="e.g. BMW" />
              <Field label="Model"   name="model"   value={form.model}   onChange={handleChange} placeholder="e.g. 320i" />
              <Field label="Year"    name="year"    type="number" value={form.year}    onChange={handleChange} placeholder="e.g. 2021" />
              <Field label="Fuel"    name="fuel"    value={form.fuel}    onChange={handleChange} placeholder="e.g. Diesel" />
              <Field label="Gearbox" name="gearbox" value={form.gearbox} onChange={handleChange} placeholder="e.g. Automatic" />
            </div>
          </div>

          {/* Section 3 — Images */}
          <div className="ar-section" style={{marginBottom:24}}>
            <div className="ar-section-label">Photos</div>

            <div className="ar-upload-zone">
              <input
                type="file" multiple accept="image/*"
                className="ar-upload-input"
                onChange={handleImages}
              />
              <div className="ar-upload-icon">📷</div>
              <p className="ar-upload-text">
                <strong>Click to upload</strong> or drag & drop<br/>
                PNG, JPG, WEBP — multiple allowed
              </p>
            </div>

            {(images.length > 0 || uploading) && (
              <div className="ar-previews">
                {images.map((img, i) => (
                  <div key={i} className="ar-preview">
                    <img src={img} alt={`Preview ${i+1}`}/>
                    <button
                      type="button"
                      className="ar-preview-rm"
                      onClick={() => removeImage(i)}
                    >✕</button>
                  </div>
                ))}
                {uploading && (
                  <div className="ar-preview" style={{background:"var(--s2)", display:"flex", alignItems:"center", justifyContent:"center"}}>
                    <div className="ar-spinner"/>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="ar-footer">
            <button type="submit" className="ar-submit" disabled={loading || uploading}>
              {loading
                ? <><div className="ar-spinner" style={{borderTopColor:"#fff"}}/> Submitting…</>
                : "Submit for Review →"
              }
            </button>
            <span className="ar-submit-note">
              Your listing will be reviewed before going live
            </span>
          </div>

        </form>
      </div>
    </OwnerLayout>
  );
}
