import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { loadAuth } from "../utils/authStorage";
import OwnerLayout from "../components/owner/OwnerLayout";
import { Plus, X, Pencil, Check, Trash2, ImagePlus, CalendarOff, Tag, ToggleLeft, ToggleRight } from "lucide-react";

const API = "http://localhost:5000/api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  .mf-wrap { background:#09090f; min-height:100vh; padding:36px 32px; box-sizing:border-box; color:#e8e8f0; font-family:'DM Mono',monospace; }
  .mf-heading { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; letter-spacing:-.04em; color:#e8e8f0; margin:0 0 6px; }
  .mf-sub { color:#3a3a52; font-size:12px; margin:0 0 32px; }

  .mf-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:20px; }

  .mf-card { background:#111118; border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden; display:flex; flex-direction:column; transition:border-color .2s; }
  .mf-card:hover { border-color:rgba(124,108,252,.3); }
  .mf-card-img { width:100%; height:180px; object-fit:cover; background:#1a1a24; }
  .mf-card-img-placeholder { width:100%; height:180px; background:#1a1a24; display:flex; align-items:center; justify-content:center; color:#3a3a52; font-size:12px; }
  .mf-card-body { padding:16px; flex:1; display:flex; flex-direction:column; gap:6px; }
  .mf-card-title { font-family:'Syne',sans-serif; font-size:15px; font-weight:800; color:#e8e8f0; letter-spacing:-.02em; margin:0; }
  .mf-card-meta { color:#4a4a62; font-size:11px; }
  .mf-card-price { font-size:13px; color:#7c6cfc; font-weight:500; margin-top:4px; }
  .mf-card-badges { display:flex; flex-wrap:wrap; gap:6px; margin-top:4px; }
  .mf-status { display:inline-flex; align-items:center; gap:5px; font-size:10px; letter-spacing:.08em; text-transform:uppercase; padding:3px 9px; border-radius:99px; font-weight:500; width:fit-content; }
  .mf-status.approved  { background:rgba(74,222,128,.1);  color:#4ade80; border:1px solid rgba(74,222,128,.2); }
  .mf-status.pending   { background:rgba(251,191,36,.1);  color:#fbbf24; border:1px solid rgba(251,191,36,.2); }
  .mf-status.rejected  { background:rgba(248,113,113,.1); color:#f87171; border:1px solid rgba(248,113,113,.2); }
  .mf-offer-badge { display:inline-flex; align-items:center; gap:4px; font-size:9px; letter-spacing:.06em; text-transform:uppercase; padding:3px 8px; border-radius:99px; background:rgba(251,191,36,.1); color:#fbbf24; border:1px solid rgba(251,191,36,.2); }
  .mf-card-actions { display:flex; gap:8px; margin-top:12px; }

  .mf-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:8px 12px; border-radius:8px; font-family:'DM Mono',monospace; font-size:11px; font-weight:500; cursor:pointer; border:1px solid transparent; transition:all .2s; }
  .mf-btn-primary { background:rgba(124,108,252,.15); border-color:rgba(124,108,252,.3); color:#7c6cfc; }
  .mf-btn-primary:hover { background:rgba(124,108,252,.25); border-color:#7c6cfc; }
  .mf-btn-danger { background:rgba(248,113,113,.1); border-color:rgba(248,113,113,.2); color:#f87171; }
  .mf-btn-danger:hover { background:rgba(248,113,113,.2); }
  .mf-btn:disabled { opacity:.4; cursor:not-allowed; }

  .mf-overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; }
  .mf-modal { background:#111118; border:1px solid rgba(255,255,255,.08); border-radius:20px; width:100%; max-width:600px; max-height:88vh; overflow-y:auto; padding:28px; box-sizing:border-box; }
  .mf-modal::-webkit-scrollbar { width:4px; }
  .mf-modal::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:4px; }
  .mf-modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .mf-modal-title { font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:#e8e8f0; margin:0; letter-spacing:-.03em; }
  .mf-modal-close { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#5a5a72; transition:all .2s; }
  .mf-modal-close:hover { color:#e8e8f0; background:rgba(255,255,255,.1); }

  .mf-section-title { font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:#3a3a52; margin:0 0 10px; }
  .mf-label { font-size:11px; color:#5a5a72; margin-bottom:5px; display:block; }
  .mf-input { width:100%; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:10px; color:#e8e8f0; font-family:'DM Mono',monospace; font-size:13px; padding:10px 14px; box-sizing:border-box; outline:none; transition:border-color .2s; }
  .mf-input:focus { border-color:#7c6cfc; }
  select.mf-input { cursor:pointer; }
  select.mf-input option { background:#1a1a28; color:#e8e8f0; }

  .mf-images { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:10px; }
  .mf-img-thumb { position:relative; width:80px; height:80px; border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,.08); }
  .mf-img-thumb img { width:100%; height:100%; object-fit:cover; }
  .mf-img-remove { position:absolute; top:3px; right:3px; background:rgba(0,0,0,.75); border:none; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#f87171; padding:0; }
  .mf-img-add { width:80px; height:80px; border-radius:10px; border:1px dashed rgba(124,108,252,.3); background:rgba(124,108,252,.06); display:flex; align-items:center; justify-content:center; cursor:pointer; color:#7c6cfc; transition:all .2s; }
  .mf-img-add:hover { background:rgba(124,108,252,.12); border-color:#7c6cfc; }

  .mf-blocked-list { display:flex; flex-direction:column; gap:8px; margin-bottom:10px; }
  .mf-blocked-item { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:10px 14px; font-size:12px; color:#8a8aa0; }
  .mf-blocked-item span { flex:1; }
  .mf-blocked-remove { background:none; border:none; cursor:pointer; color:#f87171; padding:2px; display:flex; }
  .mf-date-row { display:flex; gap:10px; margin-bottom:10px; }
  .mf-date-row > * { flex:1; }

  .mf-offers-list { display:flex; flex-direction:column; gap:10px; margin-bottom:14px; }
  .mf-offer-item { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:6px; transition:border-color .2s; }
  .mf-offer-item.active { border-color:rgba(251,191,36,.25); }
  .mf-offer-item-header { display:flex; align-items:center; gap:8px; }
  .mf-offer-item-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#e8e8f0; flex:1; }
  .mf-offer-item-desc { font-size:11px; color:#5a5a72; }
  .mf-offer-item-meta { font-size:10px; color:#fbbf24; }
  .mf-offer-toggle { background:none; border:none; cursor:pointer; padding:0; display:flex; align-items:center; transition:color .2s; }
  .mf-offer-toggle.on  { color:#fbbf24; }
  .mf-offer-toggle.off { color:#3a3a52; }

  .mf-offer-form { background:rgba(124,108,252,.06); border:1px solid rgba(124,108,252,.15); border-radius:14px; padding:16px; display:flex; flex-direction:column; gap:12px; }
  .mf-offer-form-row { display:flex; gap:10px; }
  .mf-offer-form-row > * { flex:1; }
  .mf-offer-type-pills { display:flex; gap:8px; flex-wrap:wrap; }
  .mf-pill { padding:6px 14px; border-radius:99px; font-size:11px; cursor:pointer; border:1px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); color:#5a5a72; transition:all .2s; }
  .mf-pill.selected { background:rgba(124,108,252,.2); border-color:#7c6cfc; color:#c4baff; }

  .mf-divider { height:1px; background:rgba(255,255,255,.05); margin:20px 0; }
  .mf-save-btn { width:100%; padding:12px; background:linear-gradient(135deg,#7c6cfc,#9b8cff); border:none; border-radius:12px; color:#fff; font-family:'Syne',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:opacity .2s; display:flex; align-items:center; justify-content:center; gap:8px; margin-top:20px; }
  .mf-save-btn:disabled { opacity:.5; cursor:not-allowed; }
  .mf-empty { text-align:center; padding:80px 20px; color:#3a3a52; font-size:13px; }
  .mf-empty-icon { font-size:40px; margin-bottom:12px; opacity:.3; }

  @media (max-width:767px) {
    .mf-wrap { padding:20px 16px 100px; }
    .mf-grid { grid-template-columns:1fr; }
    .mf-offer-form-row { flex-direction:column; }
  }
`;

const OFFER_TYPE_LABELS = { free_days: "Free Days", percent_discount: "% Discount", custom: "Custom Text" };

function offerSummary(o) {
  if (o.type === "free_days") return `Rent ${o.minDays}+ days → get ${o.freeExtraDays} extra day${o.freeExtraDays > 1 ? "s" : ""} free`;
  if (o.type === "percent_discount") return `Rent ${o.minDays}+ days → ${o.discountPercent}% off`;
  return o.description || "Custom offer";
}

const BLANK_OFFER = { type: "free_days", title: "", description: "", minDays: 3, freeExtraDays: 1, discountPercent: 10 };

export default function MyFleet() {
  const { token } = loadAuth();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [offers, setOffers] = useState([]);
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newOffer, setNewOffer] = useState(BLANK_OFFER);
  const [showOfferForm, setShowOfferForm] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchFleet(); }, []);

  async function fetchFleet() {
    try {
      const { data } = await axios.get(`${API}/rental/owner/mine`, { headers });
      setCars(data);
    } catch { setCars([]); }
    finally { setLoading(false); }
  }

  function openEdit(car) {
    setEditing(car);
    setPrice(car.pricePerDay);
    setImages(car.images || []);
    setAvailability((car.availability || []).map((r) => ({ startDate: r.startDate?.slice(0, 10) || "", endDate: r.endDate?.slice(0, 10) || "" })));
    setOffers((car.offers || []).map((o) => ({ ...o })));
    setNewStart(""); setNewEnd("");
    setNewOffer(BLANK_OFFER);
    setShowOfferForm(false);
  }

  function closeEdit() { setEditing(null); }
  function removeImage(idx) { setImages((p) => p.filter((_, i) => i !== idx)); }

  function openCloudinary() {
    if (!window.cloudinary) return;
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", sources: ["local", "camera"], multiple: true, maxFiles: 10, cropping: false },
      (error, result) => { if (!error && result?.event === "success") setImages((p) => [...p, result.info.secure_url]); }
    );
  }

  function addBlockedRange() {
    if (!newStart || !newEnd || newEnd <= newStart) return;
    setAvailability((p) => [...p, { startDate: newStart, endDate: newEnd }]);
    setNewStart(""); setNewEnd("");
  }
  function removeBlockedRange(idx) { setAvailability((p) => p.filter((_, i) => i !== idx)); }

  function addOffer() {
    if (!newOffer.title.trim()) return;
    setOffers((p) => [...p, { ...newOffer, isActive: true }]);
    setNewOffer(BLANK_OFFER);
    setShowOfferForm(false);
  }
  function removeOffer(idx) { setOffers((p) => p.filter((_, i) => i !== idx)); }
  function toggleOffer(idx) { setOffers((p) => p.map((o, i) => i === idx ? { ...o, isActive: !o.isActive } : o)); }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    try {
      const { data } = await axios.put(`${API}/rental/${editing._id}`, { pricePerDay: Number(price), images, availability, offers }, { headers });
      setCars((p) => p.map((c) => (c._id === data._id ? data : c)));
      closeEdit();
    } catch (err) { alert(err.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this rental listing? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/rental/${id}`, { headers });
      setCars((p) => p.filter((c) => c._id !== id));
    } catch { alert("Failed to delete"); }
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <OwnerLayout>
      <style>{STYLES}</style>
      <div className="mf-wrap">
        <h1 className="mf-heading">My Fleet</h1>
        <p className="mf-sub">Manage price, images, availability &amp; special offers</p>

        {loading ? (
          <div className="mf-empty"><div className="mf-empty-icon">⏳</div>Loading fleet…</div>
        ) : cars.length === 0 ? (
          <div className="mf-empty">
            <div className="mf-empty-icon">🚗</div>
            <p>No rental cars yet.</p>
            <button className="mf-btn mf-btn-primary" style={{ width: "auto", margin: "12px auto 0", display: "inline-flex" }} onClick={() => navigate("/add-rental")}>
              <Plus size={14} /> Add your first car
            </button>
          </div>
        ) : (
          <div className="mf-grid">
            {cars.map((car) => {
              const activeOffers = (car.offers || []).filter((o) => o.isActive);
              return (
                <div key={car._id} className="mf-card">
                  {car.images?.[0] ? <img src={car.images[0]} alt={car.title} className="mf-card-img" /> : <div className="mf-card-img-placeholder">No image</div>}
                  <div className="mf-card-body">
                    <p className="mf-card-title">{car.title}</p>
                    <p className="mf-card-meta">{car.brand} {car.model} · {car.year} · {car.city}</p>
                    <p className="mf-card-price">{car.pricePerDay} MAD / day</p>
                    <div className="mf-card-badges">
                      <span className={`mf-status ${car.status}`}>{car.status}</span>
                      {activeOffers.length > 0 && <span className="mf-offer-badge"><Tag size={9} /> {activeOffers.length} offer{activeOffers.length > 1 ? "s" : ""}</span>}
                    </div>
                    {car.availability?.length > 0 && (
                      <p className="mf-card-meta" style={{ color: "#f87171", fontSize: 10, marginTop: 2 }}>
                        <CalendarOff size={10} style={{ display: "inline", marginRight: 4 }} />
                        {car.availability.length} blocked period{car.availability.length > 1 ? "s" : ""}
                      </p>
                    )}
                    <div className="mf-card-actions">
                      <button className="mf-btn mf-btn-primary" onClick={() => openEdit(car)}><Pencil size={12} /> Edit</button>
                      <button className="mf-btn mf-btn-danger" onClick={() => handleDelete(car._id)}><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <div className="mf-overlay" onClick={(e) => e.target === e.currentTarget && closeEdit()}>
          <div className="mf-modal">
            <div className="mf-modal-header">
              <h2 className="mf-modal-title">{editing.title}</h2>
              <button className="mf-modal-close" onClick={closeEdit}><X size={14} /></button>
            </div>

            <p className="mf-section-title">Price</p>
            <label className="mf-label">Price per day (MAD)</label>
            <input type="number" className="mf-input" value={price} min={1} onChange={(e) => setPrice(e.target.value)} style={{ marginBottom: 20 }} />

            <div className="mf-divider" />

            <p className="mf-section-title">Images</p>
            <div className="mf-images">
              {images.map((url, i) => (
                <div key={i} className="mf-img-thumb">
                  <img src={url} alt="" />
                  <button className="mf-img-remove" onClick={() => removeImage(i)}><X size={10} /></button>
                </div>
              ))}
              <button className="mf-img-add" onClick={openCloudinary}><ImagePlus size={22} /></button>
            </div>

            <div className="mf-divider" />

            <p className="mf-section-title">Blocked / Unavailable Periods</p>
            <p className="mf-label" style={{ marginBottom: 12 }}>Add date ranges when the car is not available.</p>
            {availability.length > 0 && (
              <div className="mf-blocked-list">
                {availability.map((r, i) => (
                  <div key={i} className="mf-blocked-item">
                    <CalendarOff size={13} style={{ color: "#f87171", flexShrink: 0 }} />
                    <span>{new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}</span>
                    <button className="mf-blocked-remove" onClick={() => removeBlockedRange(i)}><X size={13} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="mf-date-row">
              <div>
                <label className="mf-label">From</label>
                <input type="date" className="mf-input" value={newStart} min={today} onChange={(e) => setNewStart(e.target.value)} />
              </div>
              <div>
                <label className="mf-label">To</label>
                <input type="date" className="mf-input" value={newEnd} min={newStart || today} onChange={(e) => setNewEnd(e.target.value)} />
              </div>
            </div>
            <button className="mf-btn mf-btn-primary" style={{ width: "auto" }} onClick={addBlockedRange} disabled={!newStart || !newEnd || newEnd <= newStart}>
              <Plus size={13} /> Add blocked period
            </button>

            <div className="mf-divider" />

            <p className="mf-section-title">Special Offers</p>
            <p className="mf-label" style={{ marginBottom: 12 }}>Create promotions visible to customers on the listing page.</p>
            {offers.length > 0 && (
              <div className="mf-offers-list">
                {offers.map((o, i) => (
                  <div key={i} className={`mf-offer-item${o.isActive ? " active" : ""}`}>
                    <div className="mf-offer-item-header">
                      <Tag size={13} style={{ color: o.isActive ? "#fbbf24" : "#3a3a52", flexShrink: 0 }} />
                      <span className="mf-offer-item-title">{o.title}</span>
                      <button className={`mf-offer-toggle ${o.isActive ? "on" : "off"}`} onClick={() => toggleOffer(i)}>
                        {o.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button className="mf-blocked-remove" onClick={() => removeOffer(i)}><X size={13} /></button>
                    </div>
                    <p className="mf-offer-item-meta">{offerSummary(o)}</p>
                    {o.description && <p className="mf-offer-item-desc">{o.description}</p>}
                  </div>
                ))}
              </div>
            )}
            {showOfferForm ? (
              <div className="mf-offer-form">
                <div>
                  <label className="mf-label">Offer type</label>
                  <div className="mf-offer-type-pills">
                    {["free_days", "percent_discount", "custom"].map((t) => (
                      <button key={t} className={`mf-pill${newOffer.type === t ? " selected" : ""}`} onClick={() => setNewOffer((p) => ({ ...p, type: t }))}>
                        {OFFER_TYPE_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mf-label">Offer title (shown to customers)</label>
                  <input className="mf-input" placeholder={newOffer.type === "free_days" ? "e.g. 5+1 Deal" : newOffer.type === "percent_discount" ? "e.g. Weekend -20%" : "e.g. Special Promo"} value={newOffer.title} onChange={(e) => setNewOffer((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="mf-label">Description (optional)</label>
                  <input className="mf-input" placeholder="e.g. Valid for bookings made in advance" value={newOffer.description} onChange={(e) => setNewOffer((p) => ({ ...p, description: e.target.value }))} />
                </div>
                {newOffer.type !== "custom" && (
                  <div className="mf-offer-form-row">
                    <div>
                      <label className="mf-label">Minimum days</label>
                      <input type="number" min={1} className="mf-input" value={newOffer.minDays} onChange={(e) => setNewOffer((p) => ({ ...p, minDays: Number(e.target.value) }))} />
                    </div>
                    {newOffer.type === "free_days" && (
                      <div>
                        <label className="mf-label">Free extra days</label>
                        <input type="number" min={1} className="mf-input" value={newOffer.freeExtraDays} onChange={(e) => setNewOffer((p) => ({ ...p, freeExtraDays: Number(e.target.value) }))} />
                      </div>
                    )}
                    {newOffer.type === "percent_discount" && (
                      <div>
                        <label className="mf-label">Discount (%)</label>
                        <input type="number" min={1} max={100} className="mf-input" value={newOffer.discountPercent} onChange={(e) => setNewOffer((p) => ({ ...p, discountPercent: Number(e.target.value) }))} />
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="mf-btn mf-btn-primary" style={{ flex: 1 }} onClick={addOffer} disabled={!newOffer.title.trim()}><Check size={13} /> Add offer</button>
                  <button className="mf-btn mf-btn-danger" style={{ flex: "0 0 auto", width: 40 }} onClick={() => setShowOfferForm(false)}><X size={13} /></button>
                </div>
              </div>
            ) : (
              <button className="mf-btn mf-btn-primary" style={{ width: "auto" }} onClick={() => setShowOfferForm(true)}><Plus size={13} /> Add new offer</button>
            )}

            <button className="mf-save-btn" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : <><Check size={15} /> Save changes</>}
            </button>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
