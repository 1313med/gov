import { useEffect, useState } from "react";
import { api } from "../api/axios";
import OwnerLayout from "../components/owner/OwnerLayout";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";
import {
  Wrench, Plus, Trash2, X, Car, MapPin, AlertTriangle,
  Activity, DollarSign, ChevronDown, ChevronUp, Gauge,
  Clock, CheckCircle, Droplets, RotateCcw, Search, ShieldCheck,
} from "lucide-react";

/* ── type meta ───────────────────────────────────────────── */
const TYPE_META = {
  oil_change:    { color: "#f59e0b", bg: "rgba(245,158,11,.12)",  border: "rgba(245,158,11,.28)",  Icon: Droplets   },
  tire_rotation: { color: "#38bdf8", bg: "rgba(56,189,248,.12)",  border: "rgba(56,189,248,.28)",  Icon: RotateCcw  },
  inspection:    { color: "#10b981", bg: "rgba(16,185,129,.12)",  border: "rgba(16,185,129,.28)",  Icon: ShieldCheck },
  repair:        { color: "#f87171", bg: "rgba(248,113,113,.12)", border: "rgba(248,113,113,.28)", Icon: Wrench     },
  cleaning:      { color: "#2dd4bf", bg: "rgba(45,212,191,.12)",  border: "rgba(45,212,191,.28)",  Icon: Search     },
  other:         { color: "#a78bfa", bg: "rgba(167,139,250,.12)", border: "rgba(167,139,250,.28)", Icon: CheckCircle },
};

const BLANK = {
  rentalId: "", type: "oil_change", cost: "", date: "",
  mileageAtService: "", provider: "", notes: "",
  nextServiceDate: "", nextServiceMileage: "",
};

function isDueSoon(d) {
  if (!d) return false;
  const diff = (new Date(d) - new Date()) / 86400000;
  return diff >= 0 && diff <= 7;
}

function fmt(d, lang) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* ── CSS ─────────────────────────────────────────────────── */
const S = `
  .mx { --v:#7c6cfc; --vl:rgba(124,108,252,.14); --vb:rgba(124,108,252,.28); --amb:#f5a623; --dan:#f87171; --grn:#10b981;
    --bg:#f6f8ff; --s1:#fff; --s2:#f0f4ff; --s3:#e6eaff;
    --border:rgba(15,23,42,.08); --bhi:rgba(98,72,232,.18);
    --txt:#0f172a; --txt2:#334155; --muted:#64748b; --dim:#94a3b8;
    padding:40px 44px 80px; min-height:100vh; background:var(--bg);
    color:var(--txt); font-family:'Outfit',sans-serif; box-sizing:border-box;
  }
  .mx.dark { --v:#7c6cfc; --vl:rgba(124,108,252,.14); --vb:rgba(124,108,252,.3);
    --bg:#09090f; --s1:#111118; --s2:#16161f; --s3:#1e1e2c;
    --border:rgba(255,255,255,.07); --bhi:rgba(124,108,252,.22);
    --txt:#e8e8f0; --txt2:#c0c0d0; --muted:#5a5a72; --dim:#3a3a52;
  }
  @media(max-width:768px){ .mx{ padding:20px 16px 100px; } }

  /* ─ header ─ */
  .mx-hero { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:36px; flex-wrap:wrap; }
  .mx-hero-left { display:flex; align-items:flex-start; gap:18px; }
  .mx-icon-wrap { width:52px; height:52px; border-radius:16px; background:var(--vl); border:1px solid var(--vb);
    display:flex; align-items:center; justify-content:center; color:var(--v); flex-shrink:0;
    box-shadow:0 0 0 6px var(--vl); }
  .mx-eyebrow { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
  .mx-title { font-family:'Poppins',sans-serif; font-size:30px; font-weight:800; letter-spacing:-.04em; line-height:1; margin:0; }
  .mx-sub { font-size:13px; color:var(--muted); margin-top:6px; }

  /* ─ stat cards ─ */
  .mx-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:32px; }
  @media(max-width:900px){ .mx-stats{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:480px){ .mx-stats{ grid-template-columns:1fr 1fr; gap:10px; } }

  .mx-stat { background:var(--s1); border:1px solid var(--border); border-radius:18px; padding:20px; display:flex; flex-direction:column; gap:10px; transition:border-color .25s, box-shadow .25s; }
  .mx-stat:hover { border-color:var(--bhi); box-shadow:0 4px 24px rgba(124,108,252,.07); }
  .mx-stat-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .mx-stat-n { font-family:'DM Mono',monospace; font-size:26px; font-weight:500; letter-spacing:-.03em; line-height:1; }
  .mx-stat-l { font-size:11px; color:var(--muted); font-weight:500; }

  /* ─ due-soon banner ─ */
  .mx-banner { display:flex; align-items:center; gap:10px; padding:12px 18px; border-radius:14px;
    background:rgba(245,158,11,.1); border:1px solid rgba(245,158,11,.28);
    color:#d97706; font-size:13px; font-weight:600; margin-bottom:24px; }
  .dark .mx-banner { color:var(--amb); background:rgba(245,158,11,.08); }

  /* ─ section label ─ */
  .mx-section-label { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); margin-bottom:14px; }

  /* ─ grid ─ */
  .mx-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(360px,1fr)); gap:20px; }
  @media(max-width:768px){ .mx-grid{ grid-template-columns:1fr; } }

  /* ─ car card ─ */
  .mx-card { background:var(--s1); border:1px solid var(--border); border-radius:22px; overflow:hidden; display:flex; flex-direction:column; transition:border-color .3s, box-shadow .3s; }
  .mx-card:hover { border-color:var(--bhi); box-shadow:0 8px 40px rgba(124,108,252,.09); }

  /* image hero */
  .mx-card-hero { position:relative; height:160px; background:var(--s2); overflow:hidden; }
  .mx-card-hero-img { width:100%; height:100%; object-fit:cover; display:block; }
  .mx-card-hero-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
  .mx-hero-grad { position:absolute; inset:0; background:linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.18) 55%, transparent 100%); }
  .mx-card-hero-info { position:absolute; bottom:0; left:0; right:0; padding:14px 16px; }
  .mx-car-name { font-family:'Poppins',sans-serif; font-size:15px; font-weight:700; color:#fff; letter-spacing:-.02em; line-height:1.2; text-shadow:0 1px 4px rgba(0,0,0,.4); }
  .mx-car-badges { display:flex; align-items:center; gap:6px; margin-top:5px; flex-wrap:wrap; }
  .mx-badge { display:inline-flex; align-items:center; gap:4px; font-family:'DM Mono',monospace; font-size:10px; padding:3px 8px; border-radius:99px; background:rgba(255,255,255,.15); color:rgba(255,255,255,.85); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,.15); }
  .mx-badge-due { background:rgba(245,158,11,.35); color:#fef3c7; border-color:rgba(245,158,11,.5); }

  /* no image fallback — no overlay */
  .mx-card-noimg-head { padding:18px 18px 14px; border-bottom:1px solid var(--border); }
  .mx-noimg-title { font-family:'Poppins',sans-serif; font-size:15px; font-weight:700; color:var(--txt); letter-spacing:-.02em; margin:0 0 6px; }
  .mx-noimg-meta { display:flex; flex-wrap:wrap; gap:8px; font-family:'DM Mono',monospace; font-size:11px; color:var(--muted); align-items:center; }
  .mx-noimg-meta span { display:flex; align-items:center; gap:4px; }

  /* cost chip on card */
  .mx-cost-chip { font-family:'DM Mono',monospace; font-size:11px; color:var(--v); background:var(--vl); border:1px solid var(--vb); padding:3px 10px; border-radius:99px; width:fit-content; margin-top:7px; }

  /* records */
  .mx-records { flex:1; }
  .mx-records-divider { height:1px; background:var(--border); margin:0; }
  .mx-record-row { display:flex; align-items:center; gap:8px; padding:10px 16px; border-bottom:1px solid rgba(0,0,0,.03); transition:background .15s; }
  .dark .mx-record-row { border-bottom:1px solid rgba(255,255,255,.025); }
  .mx-record-row:hover { background:var(--s2); }
  .mx-record-row:last-child { border-bottom:none; }
  .mx-record-type-pill { display:inline-flex; align-items:center; gap:5px; font-family:'DM Mono',monospace; font-size:10px; text-transform:uppercase; letter-spacing:.05em; padding:3px 9px; border-radius:99px; white-space:nowrap; border-width:1px; border-style:solid; }
  .mx-record-date { font-family:'DM Mono',monospace; font-size:10px; color:var(--muted); white-space:nowrap; }
  .mx-record-due-chip { display:inline-flex; align-items:center; gap:3px; font-family:'DM Mono',monospace; font-size:9px; color:var(--amb); background:rgba(245,158,11,.1); border:1px solid rgba(245,158,11,.25); padding:2px 7px; border-radius:99px; white-space:nowrap; }
  .dark .mx-record-due-chip { color:var(--amb); }
  .mx-record-cost { font-family:'DM Mono',monospace; font-size:12px; color:var(--v); white-space:nowrap; margin-left:auto; flex-shrink:0; }
  .mx-record-del { background:none; border:none; cursor:pointer; color:var(--dim); padding:5px; display:flex; border-radius:7px; transition:all .18s; flex-shrink:0; }
  .mx-record-del:hover { color:var(--dan); background:rgba(248,113,113,.1); }

  .mx-show-more { display:flex; align-items:center; justify-content:center; gap:5px; padding:9px 16px; font-family:'DM Mono',monospace; font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); cursor:pointer; border:none; background:none; width:100%; border-top:1px solid var(--border); transition:color .18s, background .18s; }
  .mx-show-more:hover { color:var(--v); background:var(--s2); }

  /* empty inside card */
  .mx-card-empty { padding:26px 18px; text-align:center; font-size:12px; color:var(--dim); }
  .mx-card-empty p { margin:0; }

  /* card footer */
  .mx-card-foot { padding:12px 16px; border-top:1px solid var(--border); }
  .mx-add-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:6px; padding:10px; border-radius:12px; font-family:'Outfit',sans-serif; font-size:13px; font-weight:600; background:var(--vl); border:1px solid var(--vb); color:var(--v); cursor:pointer; transition:all .2s; }
  .mx-add-btn:hover { background:rgba(124,108,252,.22); border-color:var(--v); box-shadow:0 0 18px var(--vl); }

  /* empty fleet */
  .mx-no-cars { text-align:center; padding:72px 24px; background:var(--s1); border:1px solid var(--border); border-radius:20px; }
  .mx-no-cars-icon { width:60px; height:60px; border-radius:18px; background:var(--s2); display:flex; align-items:center; justify-content:center; color:var(--dim); margin:0 auto 16px; }
  .mx-no-cars p { font-size:14px; color:var(--muted); margin:0; }

  /* loading */
  .mx-loading { text-align:center; padding:72px 24px; font-family:'DM Mono',monospace; font-size:12px; color:var(--muted); }

  /* ─ modal ─ */
  .mx-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(8px); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
  .mx-modal { background:var(--s1); border:1px solid var(--bhi); border-radius:24px; width:100%; max-width:540px; max-height:92vh; overflow-y:auto; box-shadow:0 32px 80px rgba(0,0,0,.35); box-sizing:border-box; }
  .mx-modal::-webkit-scrollbar { width:3px; }
  .mx-modal::-webkit-scrollbar-thumb { background:var(--s3); border-radius:4px; }

  .mx-modal-top { padding:26px 26px 0; position:sticky; top:0; background:var(--s1); z-index:1; padding-bottom:20px; border-bottom:1px solid var(--border); }
  .mx-modal-header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
  .mx-modal-icon { width:42px; height:42px; border-radius:12px; background:var(--vl); border:1px solid var(--vb); display:flex; align-items:center; justify-content:center; color:var(--v); flex-shrink:0; }
  .mx-modal-title { font-family:'Poppins',sans-serif; font-size:17px; font-weight:800; letter-spacing:-.03em; margin:0; }
  .mx-modal-subtitle { font-family:'DM Mono',monospace; font-size:11px; color:var(--muted); margin-top:4px; }
  .mx-modal-close { background:var(--s2); border:1px solid var(--border); border-radius:10px; width:34px; height:34px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); flex-shrink:0; transition:all .18s; }
  .mx-modal-close:hover { color:var(--txt); background:var(--s3); }

  .mx-modal-body { padding:24px 26px 26px; }
  .mx-modal-section { font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); margin:20px 0 10px; padding-bottom:6px; border-bottom:1px solid var(--border); }
  .mx-modal-section:first-child { margin-top:0; }

  .mx-field { display:flex; flex-direction:column; gap:5px; margin-bottom:12px; }
  .mx-label { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
  .mx-input, .mx-select, .mx-textarea { width:100%; background:var(--s2); border:1px solid var(--border); border-radius:12px; color:var(--txt); font-family:'DM Mono',monospace; font-size:13px; padding:11px 14px; box-sizing:border-box; outline:none; transition:border-color .2s, box-shadow .2s; }
  .mx-input:focus, .mx-select:focus, .mx-textarea:focus { border-color:var(--v); box-shadow:0 0 0 3px var(--vl); }
  select.mx-select option { background:var(--s1); }
  .mx-textarea { resize:vertical; min-height:72px; font-family:'Outfit',sans-serif; font-size:13px; }
  .mx-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  @media(max-width:480px){ .mx-grid-2{ grid-template-columns:1fr; } }

  /* type selector grid */
  .mx-type-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  @media(max-width:480px){ .mx-type-grid{ grid-template-columns:repeat(2,1fr); } }
  .mx-type-chip { display:flex; align-items:center; justify-content:center; gap:5px; padding:9px 8px; border-radius:10px; font-family:'DM Mono',monospace; font-size:10px; text-transform:uppercase; letter-spacing:.04em; cursor:pointer; border:1px solid var(--border); background:var(--s2); color:var(--muted); transition:all .18s; text-align:center; line-height:1.2; }
  .mx-type-chip.active { color:inherit; }
  .mx-type-chip:hover { border-color:var(--bhi); }

  .mx-submit-btn { width:100%; padding:13px; background:linear-gradient(135deg,#7c6cfc,#a78bfa); border:none; border-radius:14px; color:#fff; font-family:'Poppins',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:opacity .2s, box-shadow .2s; margin-top:8px; letter-spacing:-.01em; }
  .mx-submit-btn:hover:not(:disabled) { opacity:.9; box-shadow:0 8px 28px rgba(124,108,252,.4); }
  .mx-submit-btn:disabled { opacity:.45; cursor:not-allowed; }

  @keyframes mx-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .mx-fade { opacity:0; animation:mx-up .45s ease forwards; }
`;

/* ── type chip selector ──────────────────────────────────── */
function TypeGrid({ value, onChange, types }) {
  const TYPE_OPTIONS = ["oil_change", "tire_rotation", "inspection", "repair", "cleaning", "other"];
  return (
    <div className="mx-type-grid">
      {TYPE_OPTIONS.map((typ) => {
        const meta = TYPE_META[typ] || TYPE_META.other;
        const Icon = meta.Icon;
        const active = value === typ;
        return (
          <button
            key={typ}
            type="button"
            className={`mx-type-chip${active ? " active" : ""}`}
            style={active ? { background: meta.bg, borderColor: meta.border, color: meta.color } : {}}
            onClick={() => onChange(typ)}
          >
            <Icon size={13} />
            {types[typ] || typ}
          </button>
        );
      })}
    </div>
  );
}

/* ── main component ──────────────────────────────────────── */
export default function MaintenancePage() {
  const { copy, lang } = useAppLang();
  const { dark } = useTheme();
  const t = copy.maintenance;
  const numLocale = lang === "fr" ? "fr-FR" : "en-US";

  const [records,   setRecords]  = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [cars,      setCars]     = useState([]);
  const [loading,   setLoading]  = useState(true);
  const [modal,     setModal]    = useState(false);
  const [form,      setForm]     = useState(BLANK);
  const [saving,    setSaving]   = useState(false);
  const [modalCar,  setModalCar] = useState(null);
  const [expanded,  setExpanded] = useState({});

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const [mainRes, carRes] = await Promise.all([
        api.get("/maintenance"),
        api.get("/rental/owner/mine"),
      ]);
      const data = mainRes.data;
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
        mileageAtService:   form.mileageAtService   ? Number(form.mileageAtService)   : undefined,
        nextServiceMileage: form.nextServiceMileage ? Number(form.nextServiceMileage) : undefined,
        nextServiceDate:    form.nextServiceDate || undefined,
      });
      setModal(false); setForm(BLANK); setModalCar(null);
      await loadAll();
    } catch (err) { alert(err?.response?.data?.message || t.saveFail); }
    finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!confirm(t.confirmDelete)) return;
    try { await api.delete(`/maintenance/${id}`); await loadAll(); }
    catch { alert(t.deleteFail); }
  }

  function openModal(car) {
    setModalCar(car);
    setForm({ ...BLANK, rentalId: car._id });
    setModal(true);
  }

  const chg = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const byCarId = records.reduce((acc, r) => {
    const id = (r.rentalId?._id || r.rentalId)?.toString();
    if (id) { (acc[id] = acc[id] || []).push(r); }
    return acc;
  }, {});

  const dueSoonCount = records.filter((r) => isDueSoon(r.nextServiceDate)).length;

  const STATS = [
    { Icon: Car,          value: cars.length,                                                    label: t.summary.cars,     color: "#7c6cfc", iconBg: "rgba(124,108,252,.12)", iconBorder: "rgba(124,108,252,.22)" },
    { Icon: Activity,     value: records.length,                                                 label: t.summary.records,  color: "#38bdf8", iconBg: "rgba(56,189,248,.12)",  iconBorder: "rgba(56,189,248,.22)"  },
    { Icon: DollarSign,   value: `${Number(totalCost).toLocaleString(numLocale)} MAD`,           label: t.summary.total,    color: "#7c6cfc", iconBg: "rgba(124,108,252,.12)", iconBorder: "rgba(124,108,252,.22)" },
    { Icon: AlertTriangle,value: dueSoonCount,                                                   label: t.summary.dueSoon,  color: dueSoonCount > 0 ? "#f59e0b" : undefined, iconBg: dueSoonCount > 0 ? "rgba(245,158,11,.12)" : undefined, iconBorder: dueSoonCount > 0 ? "rgba(245,158,11,.22)" : undefined },
  ];

  return (
    <OwnerLayout>
      <style>{S}</style>
      <div className={`mx${dark ? " dark" : ""}`}>

        {/* ── Hero header ── */}
        <div className="mx-hero mx-fade">
          <div className="mx-hero-left">
            <div className="mx-icon-wrap">
              <Wrench size={22} />
            </div>
            <div>
              <p className="mx-eyebrow">{t.eyebrow}</p>
              <h1 className="mx-title">{t.title}</h1>
              <p className="mx-sub">{t.sub}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="mx-loading">{t.loading}</div>
        ) : (
          <>
            {/* ── Stats ── */}
            <div className="mx-stats mx-fade" style={{ animationDelay: "50ms" }}>
              {STATS.map(({ Icon, value, label, color, iconBg, iconBorder }, i) => (
                <div className="mx-stat" key={i}>
                  <div
                    className="mx-stat-icon"
                    style={{
                      background: iconBg || "var(--s2)",
                      border: `1px solid ${iconBorder || "var(--border)"}`,
                      color: color || "var(--dim)",
                    }}
                  >
                    <Icon size={17} />
                  </div>
                  <div>
                    <div className="mx-stat-n" style={{ color: color || "var(--txt)" }}>{value}</div>
                    <div className="mx-stat-l">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Due soon banner ── */}
            {dueSoonCount > 0 && (
              <div className="mx-banner mx-fade" style={{ animationDelay: "90ms" }}>
                <AlertTriangle size={16} />
                {dueSoonCount} {t.summary.dueSoon} — {lang === "fr" ? "vérifiez vos véhicules" : "check your vehicles"}
              </div>
            )}

            {/* ── Car grid ── */}
            {cars.length === 0 ? (
              <div className="mx-no-cars mx-fade" style={{ animationDelay: "120ms" }}>
                <div className="mx-no-cars-icon"><Car size={26} /></div>
                <p>{t.emptyFleet}</p>
              </div>
            ) : (
              <>
                <p className="mx-section-label mx-fade" style={{ animationDelay: "100ms" }}>
                  {cars.length} {t.summary.cars}
                </p>
                <div className="mx-grid">
                  {cars.map((car, i) => {
                    const carRecords  = byCarId[car._id] || [];
                    const carCost     = carRecords.reduce((s, r) => s + (r.cost || 0), 0);
                    const image       = car.images?.[0];
                    const hasDue      = carRecords.some((r) => isDueSoon(r.nextServiceDate));
                    const isExpanded  = expanded[car._id];
                    const LIMIT       = 3;
                    const visible     = isExpanded ? carRecords : carRecords.slice(0, LIMIT);

                    return (
                      <div key={car._id} className="mx-card mx-fade" style={{ animationDelay: `${100 + i * 55}ms` }}>

                        {/* ── Image hero ── */}
                        {image ? (
                          <div className="mx-card-hero">
                            <img src={image} alt={car.title} className="mx-card-hero-img" />
                            <div className="mx-hero-grad" />
                            <div className="mx-card-hero-info">
                              <div className="mx-car-name">{car.title}</div>
                              <div className="mx-car-badges">
                                <span className="mx-badge">
                                  <Car size={9} /> {car.brand} {car.model} · {car.year}
                                </span>
                                {car.city && (
                                  <span className="mx-badge">
                                    <MapPin size={9} /> {car.city}
                                  </span>
                                )}
                                {hasDue && (
                                  <span className="mx-badge mx-badge-due">
                                    <AlertTriangle size={9} /> Due soon
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mx-card-noimg-head">
                            <h3 className="mx-noimg-title">{car.title}</h3>
                            <div className="mx-noimg-meta">
                              <span><Car size={11} /> {car.brand} {car.model} · {car.year}</span>
                              {car.city && <span><MapPin size={11} /> {car.city}</span>}
                              {hasDue && (
                                <span style={{ color: "#f59e0b" }}><AlertTriangle size={11} /> Due soon</span>
                              )}
                            </div>
                            {carRecords.length > 0 && (
                              <div className="mx-cost-chip">
                                {Number(carCost).toLocaleString(numLocale)} MAD {t.totalCost}
                              </div>
                            )}
                          </div>
                        )}

                        {/* cost chip (image variant) */}
                        {image && carRecords.length > 0 && (
                          <div style={{ padding: "10px 16px 0" }}>
                            <div className="mx-cost-chip">
                              {Number(carCost).toLocaleString(numLocale)} MAD {t.totalCost}
                            </div>
                          </div>
                        )}

                        {/* ── Records list ── */}
                        <div className="mx-records" style={{ marginTop: 8 }}>
                          {carRecords.length === 0 ? (
                            <div className="mx-card-empty">
                              <Gauge size={20} style={{ color: "var(--dim)", marginBottom: 8 }} />
                              <p>{t.emptyRecords}</p>
                            </div>
                          ) : (
                            <>
                              {visible.map((r) => {
                                const meta = TYPE_META[r.type] || TYPE_META.other;
                                const Icon = meta.Icon;
                                return (
                                  <div key={r._id} className="mx-record-row">
                                    <span
                                      className="mx-record-type-pill"
                                      style={{ background: meta.bg, borderColor: meta.border, color: meta.color }}
                                    >
                                      <Icon size={10} />
                                      {t.types[r.type] || r.type}
                                    </span>
                                    <span className="mx-record-date">{fmt(r.date, lang)}</span>
                                    {isDueSoon(r.nextServiceDate) && (
                                      <span className="mx-record-due-chip">
                                        <AlertTriangle size={8} /> {fmt(r.nextServiceDate, lang)}
                                      </span>
                                    )}
                                    <span className="mx-record-cost">
                                      {Number(r.cost).toLocaleString(numLocale)} MAD
                                    </span>
                                    <button
                                      className="mx-record-del"
                                      onClick={() => handleDelete(r._id)}
                                      title={t.delete}
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                );
                              })}

                              {carRecords.length > LIMIT && (
                                <button
                                  className="mx-show-more"
                                  onClick={() => setExpanded((p) => ({ ...p, [car._id]: !p[car._id] }))}
                                >
                                  {isExpanded ? (
                                    <><ChevronUp size={12} /> {lang === "fr" ? "Voir moins" : "Show less"}</>
                                  ) : (
                                    <><ChevronDown size={12} /> {carRecords.length - LIMIT} {lang === "fr" ? "de plus" : "more"}</>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>

                        {/* ── Add button ── */}
                        <div className="mx-card-foot">
                          <button className="mx-add-btn" onClick={() => openModal(car)}>
                            <Plus size={14} /> {t.addBtn}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className={`mx-overlay${dark ? " dark" : ""}`} onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className={`mx-modal${dark ? " dark" : ""}`}>
            <div className="mx-modal-top">
              <div className="mx-modal-header">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div className="mx-modal-icon"><Wrench size={18} /></div>
                  <div>
                    <h2 className="mx-modal-title">{t.modal.title}</h2>
                    {modalCar && <p className="mx-modal-subtitle">{modalCar.title}</p>}
                  </div>
                </div>
                <button className="mx-modal-close" onClick={() => setModal(false)}><X size={14} /></button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mx-modal-body">

              {/* Service type */}
              <p className="mx-modal-section">{t.modal.serviceType}</p>
              <TypeGrid value={form.type} onChange={(v) => setForm((p) => ({ ...p, type: v }))} types={t.types} />

              {/* Service details */}
              <p className="mx-modal-section">{lang === "fr" ? "Détails du service" : "Service details"}</p>
              <div className="mx-grid-2">
                <div className="mx-field">
                  <label className="mx-label">{t.modal.date}</label>
                  <input type="date" className="mx-input" name="date" value={form.date} onChange={chg} required />
                </div>
                <div className="mx-field">
                  <label className="mx-label">{t.modal.cost}</label>
                  <input type="number" className="mx-input" name="cost" value={form.cost} onChange={chg} placeholder={t.modal.costPh} min={0} required />
                </div>
              </div>
              <div className="mx-grid-2">
                <div className="mx-field">
                  <label className="mx-label">{t.modal.mileage}</label>
                  <input type="number" className="mx-input" name="mileageAtService" value={form.mileageAtService} onChange={chg} placeholder={t.modal.mileagePh} min={0} />
                </div>
                <div className="mx-field">
                  <label className="mx-label">{t.modal.provider}</label>
                  <input className="mx-input" name="provider" value={form.provider} onChange={chg} placeholder={t.modal.providerPh} />
                </div>
              </div>

              {/* Next service */}
              <p className="mx-modal-section">{lang === "fr" ? "Prochain entretien" : "Next service"}</p>
              <div className="mx-grid-2">
                <div className="mx-field">
                  <label className="mx-label">{t.modal.nextDate}</label>
                  <input type="date" className="mx-input" name="nextServiceDate" value={form.nextServiceDate} onChange={chg} />
                </div>
                <div className="mx-field">
                  <label className="mx-label">{t.modal.nextMileage}</label>
                  <input type="number" className="mx-input" name="nextServiceMileage" value={form.nextServiceMileage} onChange={chg} placeholder={t.modal.nextMileagePh} min={0} />
                </div>
              </div>

              {/* Notes */}
              <p className="mx-modal-section">{t.modal.notes}</p>
              <div className="mx-field" style={{ marginBottom: 0 }}>
                <textarea className="mx-textarea" name="notes" value={form.notes} onChange={chg} placeholder={t.modal.notesPh} />
              </div>

              <button type="submit" className="mx-submit-btn" disabled={saving || !form.cost || !form.date}>
                {saving ? t.modal.saving : t.modal.save}
              </button>
            </form>
          </div>
        </div>
      )}
    </OwnerLayout>
  );
}
