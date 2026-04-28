import { useEffect, useState } from "react";
import { api } from "../api/axios";
import OwnerLayout from "../components/owner/OwnerLayout";
import { Wrench, Plus, Trash2, X, Car, MapPin, Calendar, AlertTriangle } from "lucide-react";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .mx {
    --bg:#09090f; --s1:#111118; --s2:#16161f;
    --border:rgba(255,255,255,0.07); --bhi:rgba(255,255,255,0.13);
    --txt:#e8e8f0; --txt2:#c0c0d0; --muted:#5a5a72; --dim:#3a3a52;
    --violet:#7c6cfc; --amber:#f5a623; --danger:#fc6c6c; --green:#34d399;
    --head:'Syne',sans-serif; --mono:'DM Mono',monospace;
    padding:40px 44px 80px; min-height:100vh; background:var(--bg);
    color:var(--txt); font-family:var(--head); box-sizing:border-box;
  }
  @media(max-width:768px){ .mx{padding:24px 16px 100px;} }

  .mx-header { margin-bottom:32px; }
  .mx-eyebrow { font-family:var(--mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-bottom:8px; }
  .mx-title { font-size:32px; font-weight:800; letter-spacing:-.04em; line-height:1; }
  .mx-sub { font-family:var(--mono); font-size:12px; color:var(--muted); margin-top:8px; }

  /* Summary strip */
  .mx-summary { display:flex; gap:1px; background:var(--border); border:1px solid var(--border); border-radius:14px; overflow:hidden; margin-bottom:32px; }
  .mx-sum-cell { flex:1; background:var(--s1); padding:18px 22px; }
  .mx-sum-n { font-family:var(--mono); font-size:24px; font-weight:500; letter-spacing:-.03em; }
  .mx-sum-l { font-family:var(--mono); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin-top:3px; }

  /* Car card grid */
  .mx-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:20px; }
  @media(max-width:768px){ .mx-grid{grid-template-columns:1fr;} }

  /* Car card */
  .mx-card { background:var(--s1); border:1px solid var(--border); border-radius:20px; overflow:hidden; display:flex; flex-direction:column; transition:border-color .25s, box-shadow .25s; }
  .mx-card:hover { border-color:var(--bhi); box-shadow:0 0 32px rgba(124,108,252,.08); }

  /* Car image */
  .mx-card-img { width:100%; height:170px; object-fit:cover; background:var(--s2); }
  .mx-card-img-placeholder { width:100%; height:170px; background:var(--s2); display:flex; align-items:center; justify-content:center; color:var(--dim); }

  /* Car info header */
  .mx-card-head { padding:16px 18px 14px; border-bottom:1px solid var(--border); }
  .mx-car-title { font-family:var(--head); font-size:16px; font-weight:700; letter-spacing:-.025em; color:var(--txt); margin:0 0 6px; }
  .mx-car-meta { display:flex; flex-wrap:wrap; gap:10px; font-family:var(--mono); font-size:11px; color:var(--muted); }
  .mx-car-meta-item { display:flex; align-items:center; gap:4px; }
  .mx-car-cost { font-family:var(--mono); font-size:12px; color:var(--violet); margin-top:5px; }

  /* Records list inside card */
  .mx-records { flex:1; padding:0; }
  .mx-record-row { display:flex; align-items:center; gap:10px; padding:11px 18px; border-bottom:1px solid rgba(255,255,255,.03); }
  .mx-record-row:last-child { border-bottom:none; }
  .mx-record-type { font-family:var(--mono); font-size:10px; text-transform:uppercase; letter-spacing:.06em; padding:3px 8px; border-radius:99px; background:rgba(124,108,252,.12); color:#a78bfa; border:1px solid rgba(124,108,252,.2); white-space:nowrap; }
  .mx-record-date { font-family:var(--mono); font-size:11px; color:var(--muted); white-space:nowrap; }
  .mx-record-cost { font-family:var(--mono); font-size:12px; color:var(--violet); white-space:nowrap; margin-left:auto; }
  .mx-record-due { display:flex; align-items:center; gap:3px; font-family:var(--mono); font-size:10px; color:var(--amber); }
  .mx-record-del { background:none; border:none; cursor:pointer; color:var(--dim); padding:4px; display:flex; border-radius:6px; transition:color .2s; flex-shrink:0; }
  .mx-record-del:hover { color:var(--danger); }

  /* Empty inside card */
  .mx-card-empty { padding:28px 18px; text-align:center; font-family:var(--mono); font-size:11px; color:var(--dim); }

  /* Card footer with Add button */
  .mx-card-foot { padding:12px 18px; border-top:1px solid var(--border); }
  .mx-add-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:6px; padding:9px 16px; border-radius:10px; font-family:var(--mono); font-size:11px; background:rgba(124,108,252,.1); border:1px solid rgba(124,108,252,.2); color:var(--violet); cursor:pointer; transition:all .2s; }
  .mx-add-btn:hover { background:rgba(124,108,252,.2); border-color:rgba(124,108,252,.4); }

  /* Modal */
  .mx-overlay { position:fixed; inset:0; background:rgba(0,0,0,.75); backdrop-filter:blur(4px); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; }
  .mx-modal { background:var(--s1); border:1px solid rgba(255,255,255,.08); border-radius:20px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; padding:28px; box-sizing:border-box; }
  .mx-modal::-webkit-scrollbar { width:4px; }
  .mx-modal::-webkit-scrollbar-thumb { background:#2a2a3a; border-radius:4px; }
  .mx-modal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; }
  .mx-modal-title { font-size:18px; font-weight:800; letter-spacing:-.03em; }
  .mx-modal-subtitle { font-family:var(--mono); font-size:11px; color:var(--muted); margin-top:3px; }
  .mx-modal-close { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); }
  .mx-modal-close:hover { color:var(--txt); background:rgba(255,255,255,.1); }

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

  .mx-no-cars { text-align:center; padding:60px 20px; font-family:var(--mono); font-size:13px; color:var(--muted); background:var(--s1); border:1px solid var(--border); border-radius:18px; }

  @keyframes mx-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .mx-fade { opacity:0; animation:mx-up .45s ease forwards; }
`;

const TYPE_OPTIONS = ["oil_change", "tire_rotation", "inspection", "repair", "cleaning", "other"];
const TYPE_LABELS  = { oil_change: "Oil Change", tire_rotation: "Tire Rotation", inspection: "Inspection", repair: "Repair", cleaning: "Cleaning", other: "Other" };

const BLANK = { rentalId: "", type: "oil_change", cost: "", date: "", mileageAtService: "", provider: "", notes: "", nextServiceDate: "", nextServiceMileage: "" };

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const diff = (new Date(dateStr) - new Date()) / 86400000;
  return diff >= 0 && diff <= 7;
}

function fmt(d) { return d ? new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" }) : "—"; }

export default function MaintenancePage() {
  const [records,  setRecords]  = useState([]);
  const [totalCost,setTotalCost]= useState(0);
  const [cars,     setCars]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(BLANK);
  const [saving,   setSaving]   = useState(false);
  const [modalCar, setModalCar] = useState(null); // car object for the open modal

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [mainRes, carRes] = await Promise.all([
        api.get("/maintenance"),
        api.get("/rental/owner/mine"),
      ]);
      const data = mainRes.data;
      // flatten all records from byRental groups
      const allRecords = (data.byRental || []).flatMap((g) =>
        g.records.map((r) => ({ ...r, _rentalTitle: g.rental?.title }))
      );
      setRecords(allRecords);
      setTotalCost(data.totalCost || 0);
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
        cost:               Number(form.cost),
        mileageAtService:   form.mileageAtService ? Number(form.mileageAtService) : undefined,
        nextServiceMileage: form.nextServiceMileage ? Number(form.nextServiceMileage) : undefined,
        date:               form.date,
        nextServiceDate:    form.nextServiceDate || undefined,
      });
      setModal(false);
      setForm(BLANK);
      setModalCar(null);
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

  function openModal(car) {
    setModalCar(car);
    setForm({ ...BLANK, rentalId: car._id });
    setModal(true);
  }

  const chg = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // group records by rentalId for fast lookup
  const byCarId = records.reduce((acc, r) => {
    const id = (r.rentalId?._id || r.rentalId)?.toString();
    if (id) { (acc[id] = acc[id] || []).push(r); }
    return acc;
  }, {});

  const dueSoonCount = records.filter((r) => isDueSoon(r.nextServiceDate)).length;

  return (
    <OwnerLayout>
      <style>{S}</style>
      <div className="mx">

        {/* Header */}
        <div className="mx-header mx-fade">
          <p className="mx-eyebrow">Owner Panel</p>
          <h1 className="mx-title">Maintenance Log</h1>
          <p className="mx-sub">Track service history and schedule upcoming maintenance for your fleet</p>
        </div>

        {!loading && (
          <>
            {/* Summary strip */}
            <div className="mx-summary mx-fade" style={{ animationDelay: "60ms" }}>
              <div className="mx-sum-cell">
                <div className="mx-sum-n">{cars.length}</div>
                <div className="mx-sum-l">Cars in Fleet</div>
              </div>
              <div className="mx-sum-cell">
                <div className="mx-sum-n">{records.length}</div>
                <div className="mx-sum-l">Total Records</div>
              </div>
              <div className="mx-sum-cell">
                <div className="mx-sum-n" style={{ color: "#7c6cfc" }}>{Number(totalCost).toLocaleString()}</div>
                <div className="mx-sum-l">Total Cost (MAD)</div>
              </div>
              <div className="mx-sum-cell">
                <div className="mx-sum-n" style={{ color: dueSoonCount > 0 ? "#f5a623" : "inherit" }}>{dueSoonCount}</div>
                <div className="mx-sum-l">Due Within 7 Days</div>
              </div>
            </div>

            {/* Car cards grid */}
            {cars.length === 0 ? (
              <div className="mx-no-cars">No cars in your fleet yet. Add a rental to get started.</div>
            ) : (
              <div className="mx-grid">
                {cars.map((car, i) => {
                  const carRecords = byCarId[car._id] || [];
                  const carCost = carRecords.reduce((s, r) => s + (r.cost || 0), 0);
                  const image = car.images?.[0];

                  return (
                    <div
                      key={car._id}
                      className="mx-card mx-fade"
                      style={{ animationDelay: `${80 + i * 60}ms` }}
                    >
                      {/* Car image */}
                      {image ? (
                        <img src={image} alt={car.title} className="mx-card-img" />
                      ) : (
                        <div className="mx-card-img-placeholder">
                          <Car size={32} />
                        </div>
                      )}

                      {/* Car info */}
                      <div className="mx-card-head">
                        <h3 className="mx-car-title">{car.title}</h3>
                        <div className="mx-car-meta">
                          <span className="mx-car-meta-item">
                            <Car size={11} /> {car.brand} {car.model} · {car.year}
                          </span>
                          <span className="mx-car-meta-item">
                            <MapPin size={11} /> {car.city}
                          </span>
                        </div>
                        {carRecords.length > 0 && (
                          <p className="mx-car-cost">{Number(carCost).toLocaleString()} MAD total maintenance cost</p>
                        )}
                      </div>

                      {/* Maintenance records list */}
                      <div className="mx-records">
                        {carRecords.length === 0 ? (
                          <div className="mx-card-empty">No maintenance records yet</div>
                        ) : (
                          carRecords.map((r) => (
                            <div key={r._id} className="mx-record-row">
                              <span className="mx-record-type">{TYPE_LABELS[r.type] || r.type}</span>
                              <span className="mx-record-date">{fmt(r.date)}</span>
                              {r.nextServiceDate && isDueSoon(r.nextServiceDate) && (
                                <span className="mx-record-due">
                                  <AlertTriangle size={10} /> {fmt(r.nextServiceDate)}
                                </span>
                              )}
                              <span className="mx-record-cost">{Number(r.cost).toLocaleString()} MAD</span>
                              <button className="mx-record-del" onClick={() => handleDelete(r._id)} title="Delete">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add button per car */}
                      <div className="mx-card-foot">
                        <button className="mx-add-btn" onClick={() => openModal(car)}>
                          <Plus size={13} /> Add maintenance record
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: "var(--mono)", fontSize: 12, color: "var(--muted)" }}>
            Loading maintenance data…
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {modal && (
        <div className="mx-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="mx-modal">
            <div className="mx-modal-header">
              <div>
                <h2 className="mx-modal-title">Add Maintenance Record</h2>
                {modalCar && <p className="mx-modal-subtitle">{modalCar.title}</p>}
              </div>
              <button className="mx-modal-close" onClick={() => setModal(false)}><X size={14} /></button>
            </div>

            <form onSubmit={handleSubmit}>
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
                <input className="mx-input" name="provider" value={form.provider} onChange={chg} placeholder="e.g. Auto Garage Casablanca" />
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

              <button type="submit" className="mx-submit-btn" disabled={saving || !form.cost || !form.date}>
                {saving ? "Saving…" : "Save Record"}
              </button>
            </form>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
