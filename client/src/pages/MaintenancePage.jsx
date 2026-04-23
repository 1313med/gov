import { useEffect, useState } from "react";
import { api } from "../api/axios";
import OwnerLayout from "../components/owner/OwnerLayout";
import { Wrench, Plus, Trash2, X } from "lucide-react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .mx { --bg:#09090f; --s1:#111118; --s2:#16161f; --border:rgba(255,255,255,0.07); --bhi:rgba(255,255,255,0.13); --txt:#e8e8f0; --muted:#5a5a72; --violet:#7c6cfc; --amber:#f5a623; --danger:#fc6c6c; --green:#34d399; --head:'Syne',sans-serif; --mono:'DM Mono',monospace; padding:40px 44px 80px; min-height:100vh; background:var(--bg); color:var(--txt); font-family:var(--head); box-sizing:border-box; }
  @media(max-width:768px){ .mx{padding:24px 16px 100px;} }

  .mx-header { margin-bottom:32px; }
  .mx-eyebrow { font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
  .mx-title { font-size:32px; font-weight:800; letter-spacing:-.04em; line-height:1; }
  .mx-sub { font-family:var(--mono); font-size:12px; color:var(--muted); margin-top:8px; }

  /* Summary strip */
  .mx-summary { display:flex; gap:1px; background:var(--border); border:1px solid var(--border); border-radius:14px; overflow:hidden; margin-bottom:28px; }
  .mx-sum-cell { flex:1; background:var(--s1); padding:18px 22px; }
  .mx-sum-n { font-family:var(--mono); font-size:24px; font-weight:500; letter-spacing:-.03em; }
  .mx-sum-l { font-family:var(--mono); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-top:3px; }

  /* Car sections */
  .mx-car-section { background:var(--s1); border:1px solid var(--border); border-radius:18px; margin-bottom:16px; overflow:hidden; }
  .mx-car-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:18px 22px; border-bottom:1px solid var(--border); }
  .mx-car-name { font-size:16px; font-weight:700; letter-spacing:-.025em; }
  .mx-car-cost { font-family:var(--mono); font-size:12px; color:var(--violet); }

  .mx-table-wrap { overflow-x:auto; }
  .mx-table { width:100%; border-collapse:collapse; min-width:600px; }
  .mx-table th { font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); padding:10px 16px; text-align:left; border-bottom:1px solid var(--border); }
  .mx-table td { padding:12px 16px; font-size:13px; color:var(--txt); border-bottom:1px solid rgba(255,255,255,.03); }
  .mx-table tr:last-child td { border-bottom:none; }
  .mx-table tbody tr:hover td { background:rgba(124,108,252,.03); }

  .mx-type-badge { display:inline-flex; align-items:center; gap:5px; font-family:var(--mono); font-size:10px; text-transform:uppercase; letter-spacing:.06em; padding:3px 9px; border-radius:99px; background:rgba(124,108,252,.12); color:#a78bfa; border:1px solid rgba(124,108,252,.2); }
  .mx-due-soon { color:var(--amber); font-family:var(--mono); font-size:11px; }

  .mx-add-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px; font-family:var(--mono); font-size:11px; background:rgba(124,108,252,.12); border:1px solid rgba(124,108,252,.25); color:var(--violet); cursor:pointer; transition:all .2s; }
  .mx-add-btn:hover { background:rgba(124,108,252,.22); }
  .mx-del-btn { background:none; border:none; cursor:pointer; color:var(--muted); padding:4px; display:flex; border-radius:6px; transition:color .2s; }
  .mx-del-btn:hover { color:var(--danger); }

  /* Modal */
  .mx-overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; }
  .mx-modal { background:var(--s1); border:1px solid rgba(255,255,255,.08); border-radius:20px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; padding:28px; box-sizing:border-box; }
  .mx-modal::-webkit-scrollbar { width:4px; }
  .mx-modal::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:4px; }
  .mx-modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .mx-modal-title { font-size:18px; font-weight:800; letter-spacing:-.03em; }
  .mx-modal-close { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); }
  .mx-modal-close:hover { color:var(--txt); }

  .mx-field { display:flex; flex-direction:column; gap:5px; margin-bottom:14px; }
  .mx-label { font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
  .mx-input, .mx-select, .mx-textarea { width:100%; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:10px; color:var(--txt); font-family:var(--mono); font-size:13px; padding:10px 14px; box-sizing:border-box; outline:none; transition:border-color .2s; }
  .mx-input:focus, .mx-select:focus, .mx-textarea:focus { border-color:var(--violet); }
  select.mx-select option { background:#1a1a28; }
  .mx-textarea { resize:vertical; min-height:70px; }
  .mx-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media(max-width:480px){ .mx-grid-2{grid-template-columns:1fr;} }

  .mx-submit-btn { width:100%; padding:12px; background:linear-gradient(135deg,#7c6cfc,#9b8cff); border:none; border-radius:12px; color:#fff; font-family:'Syne',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:opacity .2s; margin-top:8px; }
  .mx-submit-btn:disabled { opacity:.5; cursor:not-allowed; }

  .mx-empty { text-align:center; padding:40px; color:var(--muted); font-family:var(--mono); font-size:12px; }
  @keyframes mx-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .mx-fade { opacity:0; animation:mx-up .45s ease forwards; }
`;

const TYPE_OPTIONS = ["oil_change", "tire_rotation", "inspection", "repair", "cleaning", "other"];
const TYPE_LABELS  = { oil_change: "Oil Change", tire_rotation: "Tire Rotation", inspection: "Inspection", repair: "Repair", cleaning: "Cleaning", other: "Other" };

const BLANK = { rentalId: "", type: "oil_change", cost: "", date: "", mileageAtService: "", provider: "", notes: "", nextServiceDate: "", nextServiceMileage: "" };

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const diff = (d - new Date()) / 86400000;
  return diff >= 0 && diff <= 7;
}

export default function MaintenancePage() {
  const [data,    setData]    = useState({ records: [], totalCost: 0, byRental: [] });
  const [cars,    setCars]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(BLANK);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [mainRes, carRes] = await Promise.all([
        api.get("/maintenance"),
        api.get("/rental/owner/mine"),
      ]);
      setData(mainRes.data);
      setCars(carRes.data || []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/maintenance", {
        ...form,
        cost:              Number(form.cost),
        mileageAtService:  form.mileageAtService ? Number(form.mileageAtService) : undefined,
        nextServiceMileage: form.nextServiceMileage ? Number(form.nextServiceMileage) : undefined,
        date:              form.date,
        nextServiceDate:   form.nextServiceDate || undefined,
      });
      setModal(false);
      setForm(BLANK);
      await loadAll();
    } catch (err) { alert(err?.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this maintenance record?")) return;
    try {
      await api.delete(`/maintenance/${id}`);
      await loadAll();
    } catch { alert("Failed to delete"); }
  }

  function openModal(carId = "") { setForm({ ...BLANK, rentalId: carId }); setModal(true); }
  const chg = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const totalRecords = data.records?.length || 0;

  return (
    <OwnerLayout>
      <style>{S}</style>
      <div className="mx">

        {/* Header */}
        <div className="mx-header mx-fade">
          <p className="mx-eyebrow">Owner Panel</p>
          <h1 className="mx-title">Maintenance Log</h1>
          <p className="mx-sub">Track service history and upcoming maintenance for your fleet</p>
        </div>

        {!loading && (
          <>
            {/* Summary */}
            <div className="mx-summary mx-fade" style={{ animationDelay: "60ms" }}>
              <div className="mx-sum-cell">
                <div className="mx-sum-n">{totalRecords}</div>
                <div className="mx-sum-l">Total Records</div>
              </div>
              <div className="mx-sum-cell">
                <div className="mx-sum-n" style={{ color: "#7c6cfc" }}>{Number(data.totalCost || 0).toLocaleString()}</div>
                <div className="mx-sum-l">Total Cost (MAD)</div>
              </div>
              <div className="mx-sum-cell">
                <div className="mx-sum-n" style={{ color: "#f5a623" }}>
                  {data.records?.filter((r) => isDueSoon(r.nextServiceDate)).length || 0}
                </div>
                <div className="mx-sum-l">Due Within 7 Days</div>
              </div>
            </div>

            {/* Add record button */}
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "flex-end" }}>
              <button className="mx-add-btn" onClick={() => openModal()}>
                <Plus size={14} /> Add maintenance record
              </button>
            </div>

            {/* Per-car sections */}
            {data.byRental?.length === 0 ? (
              <div className="mx-empty">No maintenance records yet. Add your first one above.</div>
            ) : (
              data.byRental.map((group, i) => (
                <div key={group.rental?._id} className="mx-car-section mx-fade" style={{ animationDelay: `${80 + i * 50}ms` }}>
                  <div className="mx-car-header">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Wrench size={14} style={{ color: "#7c6cfc" }} />
                        <span className="mx-car-name">{group.rental?.title || "Unknown Car"}</span>
                      </div>
                      <p className="mx-car-cost">{Number(group.totalCost).toLocaleString()} MAD total cost</p>
                    </div>
                    <button className="mx-add-btn" onClick={() => openModal(group.rental?._id)}>
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  <div className="mx-table-wrap">
                    <table className="mx-table">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Date</th>
                          <th>Cost (MAD)</th>
                          <th>Mileage</th>
                          <th>Provider</th>
                          <th>Next Service</th>
                          <th>Notes</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.records.map((r) => (
                          <tr key={r._id}>
                            <td><span className="mx-type-badge">{TYPE_LABELS[r.type] || r.type}</span></td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>{r.date ? new Date(r.date).toLocaleDateString() : "—"}</td>
                            <td style={{ fontFamily: "var(--mono)", color: "#7c6cfc" }}>{Number(r.cost).toLocaleString()}</td>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>{r.mileageAtService ? r.mileageAtService.toLocaleString() + " km" : "—"}</td>
                            <td style={{ fontSize: 12 }}>{r.provider || "—"}</td>
                            <td>
                              {r.nextServiceDate ? (
                                <span className={isDueSoon(r.nextServiceDate) ? "mx-due-soon" : ""} style={{ fontFamily: "var(--mono)", fontSize: 11 }}>
                                  {isDueSoon(r.nextServiceDate) ? "⚠ " : ""}{new Date(r.nextServiceDate).toLocaleDateString()}
                                  {r.nextServiceMileage ? ` / ${r.nextServiceMileage.toLocaleString()} km` : ""}
                                </span>
                              ) : "—"}
                            </td>
                            <td style={{ fontSize: 12, color: "var(--muted)", maxWidth: 180 }}>{r.notes || "—"}</td>
                            <td>
                              <button className="mx-del-btn" onClick={() => handleDelete(r._id)}><Trash2 size={13} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {loading && <div className="mx-empty">Loading maintenance records…</div>}
      </div>

      {/* Modal */}
      {modal && (
        <div className="mx-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="mx-modal">
            <div className="mx-modal-header">
              <h2 className="mx-modal-title">Add Maintenance Record</h2>
              <button className="mx-modal-close" onClick={() => setModal(false)}><X size={14} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mx-field">
                <label className="mx-label">Car</label>
                <select className="mx-select" name="rentalId" value={form.rentalId} onChange={chg} required>
                  <option value="">Select a car…</option>
                  {cars.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>

              <div className="mx-grid-2">
                <div className="mx-field">
                  <label className="mx-label">Service type</label>
                  <select className="mx-select" name="type" value={form.type} onChange={chg}>
                    {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div className="mx-field">
                  <label className="mx-label">Date</label>
                  <input type="date" className="mx-input" name="date" value={form.date} onChange={chg} required />
                </div>
              </div>

              <div className="mx-grid-2">
                <div className="mx-field">
                  <label className="mx-label">Cost (MAD)</label>
                  <input type="number" className="mx-input" name="cost" value={form.cost} onChange={chg} placeholder="e.g. 1200" min={0} required />
                </div>
                <div className="mx-field">
                  <label className="mx-label">Mileage at service (km)</label>
                  <input type="number" className="mx-input" name="mileageAtService" value={form.mileageAtService} onChange={chg} placeholder="e.g. 45000" min={0} />
                </div>
              </div>

              <div className="mx-field">
                <label className="mx-label">Provider / Garage</label>
                <input className="mx-input" name="provider" value={form.provider} onChange={chg} placeholder="e.g. Auto Garage Alger" />
              </div>

              <div className="mx-grid-2">
                <div className="mx-field">
                  <label className="mx-label">Next service date</label>
                  <input type="date" className="mx-input" name="nextServiceDate" value={form.nextServiceDate} onChange={chg} />
                </div>
                <div className="mx-field">
                  <label className="mx-label">Next service mileage</label>
                  <input type="number" className="mx-input" name="nextServiceMileage" value={form.nextServiceMileage} onChange={chg} placeholder="e.g. 50000" min={0} />
                </div>
              </div>

              <div className="mx-field">
                <label className="mx-label">Notes</label>
                <textarea className="mx-textarea" name="notes" value={form.notes} onChange={chg} placeholder="Any additional notes…" />
              </div>

              <button type="submit" className="mx-submit-btn" disabled={saving || !form.rentalId || !form.cost || !form.date}>
                {saving ? "Saving…" : "Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
