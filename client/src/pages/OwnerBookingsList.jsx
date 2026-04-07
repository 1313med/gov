import { useEffect, useState } from "react";
import { getOwnerBookings, updateBookingStatus, markBookingPaid, updateBookingMedia } from "../api/booking";
import OwnerLayout from "../components/owner/OwnerLayout";
import { ChevronDown, ChevronUp, ImagePlus, Upload, X } from "lucide-react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  .obl { background:#09090f; min-height:100vh; padding:36px 32px; box-sizing:border-box; font-family:'DM Mono',monospace; color:#e8e8f0; }
  .obl-heading { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; letter-spacing:-.04em; color:#e8e8f0; margin:0 0 6px; }
  .obl-sub { color:#3a3a52; font-size:12px; margin:0 0 28px; }

  .obl-filters { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:24px; }
  .obl-filter-pill { padding:6px 16px; border-radius:99px; font-size:11px; cursor:pointer; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.04); color:#5a5a72; transition:all .2s; font-family:'DM Mono',monospace; }
  .obl-filter-pill.active { background:rgba(124,108,252,.18); border-color:rgba(124,108,252,.4); color:#c4baff; }

  .obl-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:12px; margin-bottom:28px; }
  .obl-stat { background:#111118; border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:16px; text-align:center; }
  .obl-stat-val { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:#e8e8f0; }
  .obl-stat-lbl { font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:#3a3a52; margin-top:4px; }

  .obl-table-wrap { background:#111118; border:1px solid rgba(255,255,255,.07); border-radius:18px; overflow:hidden; }
  .obl-table { width:100%; border-collapse:collapse; }
  .obl-th { text-align:left; font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:#3a3a52; padding:14px 18px; border-bottom:1px solid rgba(255,255,255,.05); white-space:nowrap; }
  .obl-td { padding:13px 18px; border-bottom:1px solid rgba(255,255,255,.04); font-size:12px; vertical-align:middle; }
  .obl-tr:last-child > .obl-td { border-bottom:none; }
  .obl-tr:hover > .obl-td { background:rgba(255,255,255,.015); }

  .obl-car-name { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#e8e8f0; margin:0; letter-spacing:-.02em; }
  .obl-car-city { font-size:10px; color:#3a3a52; margin:2px 0 0; }
  .obl-customer-name { font-weight:500; color:#c8c8d8; }
  .obl-customer-contact { font-size:10px; color:#4a4a62; margin-top:2px; }
  .obl-dates-main { color:#c8c8d8; }
  .obl-dates-days { font-size:10px; color:#4a4a62; margin-top:2px; }
  .obl-booking-date { font-size:10px; color:#4a4a62; }
  .obl-total { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#7c6cfc; }
  .obl-offer { font-size:10px; color:#fbbf24; margin-top:2px; }

  .obl-badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; letter-spacing:.06em; text-transform:uppercase; padding:4px 10px; border-radius:99px; white-space:nowrap; }
  .obl-badge.pending   { background:rgba(251,191,36,.1);  color:#fbbf24; border:1px solid rgba(251,191,36,.2); }
  .obl-badge.confirmed { background:rgba(74,222,128,.1);  color:#4ade80; border:1px solid rgba(74,222,128,.2); }
  .obl-badge.rejected  { background:rgba(248,113,113,.1); color:#f87171; border:1px solid rgba(248,113,113,.2); }
  .obl-badge.cancelled { background:rgba(148,163,184,.1); color:#94a3b8; border:1px solid rgba(148,163,184,.2); }
  .obl-badge.completed { background:rgba(124,108,252,.1); color:#a78bfa; border:1px solid rgba(124,108,252,.2); }

  .obl-pay-btn { display:inline-flex; align-items:center; gap:6px; padding:5px 12px; border-radius:99px; font-size:10px; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; border:1px solid; transition:all .2s; font-family:'DM Mono',monospace; white-space:nowrap; }
  .obl-pay-btn.paid   { background:rgba(74,222,128,.1); color:#4ade80; border-color:rgba(74,222,128,.25); }
  .obl-pay-btn.unpaid { background:rgba(255,255,255,.03); color:#6a6a82; border-color:rgba(255,255,255,.1); }
  .obl-pay-btn.paid:hover   { background:rgba(74,222,128,.18); }
  .obl-pay-btn.unpaid:hover { background:rgba(248,113,113,.12); color:#f87171; border-color:rgba(248,113,113,.3); }

  .obl-actions { display:flex; gap:6px; }
  .obl-act-btn { padding:5px 11px; border-radius:8px; font-size:10px; cursor:pointer; border:1px solid transparent; font-family:'DM Mono',monospace; transition:all .2s; white-space:nowrap; }
  .obl-act-btn.confirm  { background:rgba(74,222,128,.1); color:#4ade80; border-color:rgba(74,222,128,.2); }
  .obl-act-btn.confirm:hover  { background:rgba(74,222,128,.2); }
  .obl-act-btn.reject   { background:rgba(248,113,113,.1); color:#f87171; border-color:rgba(248,113,113,.2); }
  .obl-act-btn.reject:hover   { background:rgba(248,113,113,.2); }
  .obl-act-btn.complete { background:rgba(124,108,252,.1); color:#a78bfa; border-color:rgba(124,108,252,.2); }
  .obl-act-btn.complete:hover { background:rgba(124,108,252,.2); }
  .obl-act-btn:disabled { opacity:.35; cursor:not-allowed; }

  /* Expand button */
  .obl-expand-btn { background:none; border:none; cursor:pointer; color:#4a4a62; display:flex; align-items:center; gap:4px; font-family:'DM Mono',monospace; font-size:10px; padding:4px 8px; border-radius:6px; transition:all .2s; }
  .obl-expand-btn:hover { color:#7c6cfc; background:rgba(124,108,252,.08); }
  .obl-expand-btn.open { color:#7c6cfc; }

  /* Expanded row panel */
  .obl-detail-row > .obl-detail-td { padding:0; border-bottom:1px solid rgba(255,255,255,.05); }
  .obl-detail-panel { background:#0d0d14; padding:20px 24px; display:grid; grid-template-columns:1fr 1fr; gap:24px; }
  @media (max-width:700px) { .obl-detail-panel { grid-template-columns:1fr; } }

  .obl-panel-section-title { font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:#3a3a52; margin:0 0 12px; }
  .obl-panel-label { font-size:11px; color:#5a5a72; margin-bottom:5px; display:block; }

  /* Photo grid */
  .obl-photo-tabs { display:flex; gap:8px; margin-bottom:12px; }
  .obl-ptab { flex:1; padding:7px; border-radius:8px; font-size:10px; cursor:pointer; border:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.03); color:#5a5a72; transition:all .2s; font-family:'DM Mono',monospace; text-align:center; }
  .obl-ptab.before { background:rgba(74,222,128,.08); border-color:rgba(74,222,128,.25); color:#4ade80; }
  .obl-ptab.after  { background:rgba(248,113,113,.08); border-color:rgba(248,113,113,.25); color:#f87171; }

  .obl-photo-grid { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; }
  .obl-photo-thumb { position:relative; width:72px; height:72px; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,.07); }
  .obl-photo-thumb img { width:100%; height:100%; object-fit:cover; }
  .obl-photo-rm { position:absolute; top:2px; right:2px; background:rgba(0,0,0,.8); border:none; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#f87171; padding:0; }
  .obl-photo-add { width:72px; height:72px; border-radius:8px; border:1px dashed rgba(124,108,252,.25); background:rgba(124,108,252,.05); display:flex; align-items:center; justify-content:center; cursor:pointer; color:#7c6cfc; transition:all .2s; }
  .obl-photo-add:hover { background:rgba(124,108,252,.12); }

  /* Documents */
  .obl-docs-list { display:flex; flex-direction:column; gap:7px; margin-bottom:10px; }
  .obl-doc-item { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05); border-radius:8px; padding:8px 12px; }
  .obl-doc-name { flex:1; font-size:11px; color:#c8c8d8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .obl-doc-type { font-size:9px; color:#3a3a52; text-transform:uppercase; }
  .obl-doc-view { color:#7c6cfc; text-decoration:none; font-size:10px; white-space:nowrap; }
  .obl-doc-view:hover { text-decoration:underline; }
  .obl-doc-rm { background:none; border:none; cursor:pointer; color:#f87171; padding:2px; display:flex; }

  .obl-doc-upload-row { display:flex; gap:8px; align-items:flex-end; }
  .obl-doc-upload-row > div { flex:1; }
  .obl-panel-input { width:100%; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:8px; color:#e8e8f0; font-family:'DM Mono',monospace; font-size:12px; padding:8px 12px; box-sizing:border-box; outline:none; transition:border-color .2s; }
  .obl-panel-input:focus { border-color:#7c6cfc; }

  .obl-media-save-btn { margin-top:14px; grid-column:1/-1; width:100%; padding:10px; background:linear-gradient(135deg,#7c6cfc,#9b8cff); border:none; border-radius:10px; color:#fff; font-family:'Syne',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:opacity .2s; }
  .obl-media-save-btn:disabled { opacity:.45; cursor:not-allowed; }

  .obl-media-saved { font-size:11px; color:#4ade80; margin-top:8px; grid-column:1/-1; text-align:center; }

  .obl-empty { text-align:center; padding:60px 20px; color:#3a3a52; font-size:13px; }

  @media (max-width:900px) {
    .obl { padding:20px 12px 100px; }
    .obl-table-wrap { overflow-x:auto; }
    .obl-table { min-width:820px; }
  }
`;

const STATUS_FILTERS = ["all", "pending", "confirmed", "completed", "rejected", "cancelled"];

function fmt(d) { return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
function daysDiff(a, b) { return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000)); }

// Per-booking media panel component
function BookingMediaPanel({ booking, onSaved }) {
  const [photoTab, setPhotoTab] = useState("before");
  const [before, setBefore]   = useState(booking.conditionPhotos?.before || []);
  const [after, setAfter]     = useState(booking.conditionPhotos?.after  || []);
  const [docs, setDocs]       = useState(booking.documents || []);
  const [docName, setDocName] = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  function openPhotoUpload() {
    if (!window.cloudinary) return;
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", sources: ["local", "camera"], multiple: true, maxFiles: 10, cropping: false },
      (error, result) => {
        if (!error && result?.event === "success") {
          const url = result.info.secure_url;
          if (photoTab === "before") setBefore((p) => [...p, url]);
          else setAfter((p) => [...p, url]);
        }
      }
    );
  }

  function openDocUpload() {
    if (!window.cloudinary) return;
    if (!docName.trim()) { alert("Enter a document name first"); return; }
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", sources: ["local"], multiple: false, resourceType: "auto", clientAllowedFormats: ["pdf", "jpg", "jpeg", "png", "webp"] },
      (error, result) => {
        if (!error && result?.event === "success") {
          const info = result.info;
          const fileType = info.resource_type === "raw" || info.format === "pdf" ? "pdf" : "image";
          setDocs((p) => [...p, { name: docName.trim(), url: info.secure_url, fileType, uploadedAt: new Date().toISOString() }]);
          setDocName("");
        }
      }
    );
  }

  function removePhoto(tab, idx) {
    if (tab === "before") setBefore((p) => p.filter((_, i) => i !== idx));
    else setAfter((p) => p.filter((_, i) => i !== idx));
  }
  function removeDoc(idx) { setDocs((p) => p.filter((_, i) => i !== idx)); }

  async function handleSave() {
    setSaving(true);
    try {
      const { data } = await updateBookingMedia(booking._id, { conditionPhotos: { before, after }, documents: docs });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved(data);
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  }

  const currentPhotos = photoTab === "before" ? before : after;

  return (
    <div className="obl-detail-panel">
      {/* Condition photos */}
      <div>
        <p className="obl-panel-section-title">Condition Photos</p>
        <div className="obl-photo-tabs">
          <button className={`obl-ptab${photoTab === "before" ? " before" : ""}`} onClick={() => setPhotoTab("before")}>
            Before ({before.length})
          </button>
          <button className={`obl-ptab${photoTab === "after" ? " after" : ""}`} onClick={() => setPhotoTab("after")}>
            After ({after.length})
          </button>
        </div>
        <div className="obl-photo-grid">
          {currentPhotos.map((url, i) => (
            <div key={i} className="obl-photo-thumb">
              <img src={url} alt="" />
              <button className="obl-photo-rm" onClick={() => removePhoto(photoTab, i)}><X size={9} /></button>
            </div>
          ))}
          <button className="obl-photo-add" onClick={openPhotoUpload}><ImagePlus size={20} /></button>
        </div>
      </div>

      {/* Legal documents */}
      <div>
        <p className="obl-panel-section-title">Legal Documents</p>
        {docs.length > 0 && (
          <div className="obl-docs-list">
            {docs.map((doc, i) => (
              <div key={i} className="obl-doc-item">
                <span>{doc.fileType === "pdf" ? "📄" : "🖼️"}</span>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p className="obl-doc-name">{doc.name}</p>
                  <span className="obl-doc-type">{doc.fileType}</span>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="obl-doc-view">View</a>
                <button className="obl-doc-rm" onClick={() => removeDoc(i)}><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="obl-doc-upload-row">
          <div>
            <label className="obl-panel-label">Document name</label>
            <input
              className="obl-panel-input"
              placeholder="e.g. Rental Contract"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && openDocUpload()}
            />
          </div>
          <button
            className="obl-act-btn confirm"
            style={{ whiteSpace: "nowrap", alignSelf: "flex-end" }}
            onClick={openDocUpload}
            disabled={!docName.trim()}
          >
            <Upload size={11} style={{ display: "inline", marginRight: 4 }} />Upload
          </button>
        </div>
      </div>

      {/* Save */}
      <button className="obl-media-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? "Saving…" : "Save photos & documents"}
      </button>
      {saved && <p className="obl-media-saved">✓ Saved successfully</p>}
    </div>
  );
}

export default function OwnerBookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState(null);
  const [expanded, setExpanded] = useState(null); // booking id

  useEffect(() => { load(); }, []);

  async function load() {
    try { const { data } = await getOwnerBookings(); setBookings(data); }
    catch { setBookings([]); }
    finally { setLoading(false); }
  }

  async function changeStatus(id, status) {
    setActing(id);
    try {
      await updateBookingStatus(id, status);
      setBookings((p) => p.map((b) => b._id === id ? { ...b, status } : b));
    } catch (e) { alert(e?.response?.data?.message || "Failed"); }
    finally { setActing(null); }
  }

  async function togglePaid(id) {
    setActing(id);
    try {
      const { data } = await markBookingPaid(id);
      setBookings((p) => p.map((b) => b._id === id ? { ...b, isPaid: data.isPaid, paidAt: data.paidAt } : b));
    } catch { alert("Failed to update payment"); }
    finally { setActing(null); }
  }

  function handleMediaSaved(updated) {
    setBookings((p) => p.map((b) => b._id === updated._id ? { ...b, conditionPhotos: updated.conditionPhotos, documents: updated.documents } : b));
  }

  const visible = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const total     = bookings.length;
  const pending   = bookings.filter((b) => b.status === "pending").length;
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const revenue   = bookings.filter((b) => b.isPaid).reduce((s, b) => s + (b.totalAmount || 0), 0);

  return (
    <OwnerLayout>
      <style>{STYLES}</style>
      <div className="obl">
        <h1 className="obl-heading">Bookings</h1>
        <p className="obl-sub">Manage status, payments, condition photos &amp; documents</p>

        <div className="obl-stats">
          <div className="obl-stat"><div className="obl-stat-val">{total}</div><div className="obl-stat-lbl">Total</div></div>
          <div className="obl-stat"><div className="obl-stat-val" style={{ color:"#fbbf24" }}>{pending}</div><div className="obl-stat-lbl">Pending</div></div>
          <div className="obl-stat"><div className="obl-stat-val" style={{ color:"#4ade80" }}>{confirmed}</div><div className="obl-stat-lbl">Confirmed</div></div>
          <div className="obl-stat"><div className="obl-stat-val" style={{ color:"#7c6cfc" }}>{revenue.toLocaleString()} MAD</div><div className="obl-stat-lbl">Collected</div></div>
        </div>

        <div className="obl-filters">
          {STATUS_FILTERS.map((s) => (
            <button key={s} className={`obl-filter-pill${filter === s ? " active" : ""}`} onClick={() => setFilter(s)}>
              {s === "all" ? `All (${bookings.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${bookings.filter((b) => b.status === s).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="obl-empty">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="obl-empty">No bookings found.</div>
        ) : (
          <div className="obl-table-wrap">
            <table className="obl-table">
              <thead>
                <tr>
                  <th className="obl-th">Car</th>
                  <th className="obl-th">Customer</th>
                  <th className="obl-th">Booked on</th>
                  <th className="obl-th">Rental Period</th>
                  <th className="obl-th">Total</th>
                  <th className="obl-th">Status</th>
                  <th className="obl-th">Payment</th>
                  <th className="obl-th">Actions</th>
                  <th className="obl-th">Files</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((b) => {
                  const days   = daysDiff(b.startDate, b.endDate);
                  const busy   = acting === b._id;
                  const isOpen = expanded === b._id;
                  const photoCount = (b.conditionPhotos?.before?.length || 0) + (b.conditionPhotos?.after?.length || 0);
                  const docCount   = b.documents?.length || 0;
                  return (
                    <>
                      <tr key={b._id} className="obl-tr">
                        <td className="obl-td">
                          <p className="obl-car-name">{b.rentalId?.title || "—"}</p>
                          <p className="obl-car-city">{b.rentalId?.city}</p>
                        </td>
                        <td className="obl-td">
                          <p className="obl-customer-name">{b.customerId?.name || "—"}</p>
                          <p className="obl-customer-contact">{b.customerId?.phone || b.customerId?.email || "—"}</p>
                        </td>
                        <td className="obl-td"><p className="obl-booking-date">{fmt(b.createdAt)}</p></td>
                        <td className="obl-td">
                          <p className="obl-dates-main">{fmt(b.startDate)} → {fmt(b.endDate)}</p>
                          <p className="obl-dates-days">{days} day{days > 1 ? "s" : ""}</p>
                        </td>
                        <td className="obl-td">
                          <p className="obl-total">{b.totalAmount != null ? `${b.totalAmount.toLocaleString()} MAD` : "—"}</p>
                          {b.appliedOfferTitle && <p className="obl-offer">🏷️ {b.appliedOfferTitle}</p>}
                        </td>
                        <td className="obl-td"><span className={`obl-badge ${b.status}`}>{b.status}</span></td>
                        <td className="obl-td">
                          <button className={`obl-pay-btn ${b.isPaid ? "paid" : "unpaid"}`} onClick={() => togglePaid(b._id)} disabled={busy}>
                            {b.isPaid ? "✓ Paid" : "Unpaid"}
                          </button>
                          {b.isPaid && b.paidAt && <p style={{ fontSize:9, color:"#3a3a52", marginTop:3 }}>{fmt(b.paidAt)}</p>}
                        </td>
                        <td className="obl-td">
                          <div className="obl-actions">
                            {b.status === "pending" && (<>
                              <button className="obl-act-btn confirm" disabled={busy} onClick={() => changeStatus(b._id, "confirmed")}>Confirm</button>
                              <button className="obl-act-btn reject"  disabled={busy} onClick={() => changeStatus(b._id, "rejected")}>Reject</button>
                            </>)}
                            {b.status === "confirmed" && (
                              <button className="obl-act-btn complete" disabled={busy} onClick={() => changeStatus(b._id, "completed")}>Complete</button>
                            )}
                            {["rejected","cancelled","completed"].includes(b.status) && <span style={{ fontSize:10, color:"#3a3a52" }}>—</span>}
                          </div>
                        </td>
                        <td className="obl-td">
                          <button className={`obl-expand-btn${isOpen ? " open" : ""}`} onClick={() => setExpanded(isOpen ? null : b._id)}>
                            {photoCount + docCount > 0 && <span style={{ color:"#fbbf24" }}>{photoCount + docCount}</span>}
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr key={`${b._id}-detail`} className="obl-detail-row">
                          <td className="obl-detail-td" colSpan={9}>
                            <BookingMediaPanel booking={b} onSaved={handleMediaSaved} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </OwnerLayout>
  );
}
