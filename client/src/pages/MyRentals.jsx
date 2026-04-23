import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { updateBookingStatus, markBookingPaid } from "../api/booking";
import OwnerLayout from "../components/owner/OwnerLayout";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .mr {
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

  /* ── Page header ── */
  .mr-header {
    margin-bottom: 36px;
  }
  .mr-eyebrow {
    font-family: var(--mono);
    font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 8px;
  }
  .mr-title {
    font-family: var(--head);
    font-size: 32px; font-weight: 800;
    letter-spacing: -.04em; line-height: 1;
    color: var(--txt);
  }
  .mr-sub {
    font-family: var(--mono);
    font-size: 12px; color: var(--muted);
    margin-top: 8px;
  }

  /* ── Summary strip ── */
  .mr-summary {
    display: flex; gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 14px; overflow: hidden;
    margin-bottom: 28px;
  }
  .mr-summary-cell {
    flex: 1; background: var(--s1);
    padding: 18px 22px;
  }
  .mr-summary-n {
    font-family: var(--mono); font-size: 26px; font-weight: 500;
    letter-spacing: -.03em; color: var(--txt);
  }
  .mr-summary-l {
    font-family: var(--mono); font-size: 9px; letter-spacing: .12em;
    text-transform: uppercase; color: var(--muted); margin-top: 3px;
  }

  /* ── States ── */
  .mr-state {
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 18px; padding: 48px;
    text-align: center;
  }
  .mr-state-icon { font-size: 36px; margin-bottom: 12px; }
  .mr-state-title {
    font-family: var(--head); font-size: 18px; font-weight: 700;
    letter-spacing: -.025em; color: var(--txt); margin-bottom: 6px;
  }
  .mr-state-sub {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
  }

  /* ── Booking cards ── */
  .mr-list { display: flex; flex-direction: column; gap: 14px; }

  .mr-card {
    background: var(--s1); border: 1px solid var(--border);
    border-radius: 18px; padding: 24px 26px;
    position: relative; overflow: hidden;
    transition: border-color .25s, box-shadow .25s;
  }
  .mr-card::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(124,108,252,.04) 0%, transparent 55%);
    pointer-events: none;
  }
  .mr-card:hover {
    border-color: var(--bhi);
    box-shadow: 0 0 32px rgba(124,108,252,.07);
  }

  /* Left accent bar colored by status */
  .mr-card-bar {
    position: absolute; top: 0; left: 0; bottom: 0;
    width: 3px; border-radius: 2px 0 0 2px;
  }

  /* Card top row */
  .mr-card-top {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 16px;
    margin-bottom: 18px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--border);
  }
  .mr-car-title {
    font-family: var(--head); font-size: 17px; font-weight: 700;
    letter-spacing: -.025em; color: var(--txt); margin-bottom: 5px;
  }
  .mr-car-meta {
    font-family: var(--mono); font-size: 11px; color: var(--muted);
    display: flex; align-items: center; gap: 8px;
  }
  .mr-car-meta-dot {
    width: 3px; height: 3px; border-radius: 50%;
    background: var(--dim); display: inline-block;
  }

  /* Status badge */
  .mr-badge {
    font-family: var(--mono); font-size: 9px; letter-spacing: .1em;
    text-transform: uppercase; border-radius: 999px;
    padding: 4px 11px; flex-shrink: 0;
    border: 1px solid;
  }

  /* Card bottom row */
  .mr-card-bottom {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }
  .mr-info-block {}
  .mr-info-lbl {
    font-family: var(--mono); font-size: 9px; letter-spacing: .1em;
    text-transform: uppercase; color: var(--muted); margin-bottom: 5px;
  }
  .mr-info-val {
    font-family: var(--mono); font-size: 13px; color: var(--txt2);
  }
  .mr-info-val strong {
    font-family: var(--head); font-size: 14px; font-weight: 700;
    color: var(--txt); letter-spacing: -.02em;
  }

  /* Date range pill */
  .mr-date-range {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 12px; color: var(--txt2);
  }
  .mr-date-arrow {
    font-size: 10px; color: var(--dim);
  }

  /* Loading skeleton */
  @keyframes mr-sh { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  .mr-sk {
    background: linear-gradient(90deg, var(--s1) 25%, rgba(255,255,255,.04) 50%, var(--s1) 75%);
    background-size: 600px 100%;
    animation: mr-sh 1.4s infinite;
  }
  .mr-sk-card {
    border: 1px solid var(--border); border-radius: 18px;
    padding: 24px 26px; display: flex; flex-direction: column; gap: 12px;
  }
  .mr-sk-line { border-radius: 6px; height: 11px; }

  /* Fade-up */
  @keyframes mr-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  .mr-fade { opacity:0; animation:mr-up .5s ease forwards; }

  /* Responsive */
  @media(max-width:768px) {
    .mr { padding: 28px 16px 48px; }
    .mr-title { font-size: 26px; }
    .mr-card-bottom { grid-template-columns: 1fr 1fr; }
    .mr-summary-n { font-size: 22px; }
    .mr-summary-cell { padding: 14px 16px; }
  }
  @media(max-width:480px) {
    .mr-card-top { flex-direction: column; }
    .mr-card-bottom { grid-template-columns: 1fr; }
  }
`;

/* ── Status helpers ────────────────────────────────────────────────────── */
const STATUS = {
  confirmed: { color:"#2af5c0", bg:"rgba(42,245,192,.1)",  bd:"rgba(42,245,192,.25)", label:"Confirmed" },
  pending:   { color:"#f5a623", bg:"rgba(245,166,35,.1)",  bd:"rgba(245,166,35,.25)",  label:"Pending"   },
  rejected:  { color:"#fc6c6c", bg:"rgba(252,108,108,.1)", bd:"rgba(252,108,108,.25)", label:"Rejected"  },
  default:   { color:"#7c6cfc", bg:"rgba(124,108,252,.1)", bd:"rgba(124,108,252,.25)", label:"Booked"    },
};
const ss = (s) => STATUS[s] || STATUS.default;

/* ── Date range formatter ─────────────────────────────────────────────── */
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

function daysBetween(a, b) {
  const diff = Math.abs(new Date(b) - new Date(a));
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function MyRentals() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [error,    setError   ] = useState("");
  const [acting,   setActing  ] = useState(null); // bookingId being acted on

  const load = async () => {
    try {
      const res = await api.get("/rental/owner/bookings");
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch { setError("Failed to load bookings"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    setActing(id);
    try {
      await updateBookingStatus(id, status);
      await load();
    } catch (e) { alert(e?.response?.data?.message || "Failed to update"); }
    finally { setActing(null); }
  };

  const togglePaid = async (id) => {
    setActing(id);
    try {
      const { data } = await markBookingPaid(id);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, isPaid: data.isPaid, paidAt: data.paidAt } : b));
    } catch { alert("Failed to update payment"); }
    finally { setActing(null); }
  };

  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const pending   = bookings.filter(b => b.status === "pending").length;

  return (
    <OwnerLayout>
      <style>{S}</style>

      <div className="mr">

        {/* ── Header ── */}
        <div className="mr-header mr-fade" style={{animationDelay:"0ms"}}>
          <p className="mr-eyebrow">Owner Panel</p>
          <h1 className="mr-title">Rental Bookings</h1>
          <p className="mr-sub">Track who booked your cars and when</p>
        </div>

        {/* ── Summary strip ── */}
        {!loading && !error && bookings.length > 0 && (
          <div className="mr-summary mr-fade" style={{animationDelay:"60ms"}}>
            <div className="mr-summary-cell">
              <div className="mr-summary-n">{bookings.length}</div>
              <div className="mr-summary-l">Total Bookings</div>
            </div>
            <div className="mr-summary-cell">
              <div className="mr-summary-n" style={{color:"#2af5c0"}}>{confirmed}</div>
              <div className="mr-summary-l">Confirmed</div>
            </div>
            <div className="mr-summary-cell">
              <div className="mr-summary-n" style={{color:"#f5a623"}}>{pending}</div>
              <div className="mr-summary-l">Pending</div>
            </div>
            <div className="mr-summary-cell">
              <div className="mr-summary-n" style={{color:"#7c6cfc"}}>
                {bookings.reduce((s,b) => s + daysBetween(b.startDate, b.endDate), 0)}
              </div>
              <div className="mr-summary-l">Total Days</div>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{display:"flex", flexDirection:"column", gap:14}}>
            {[0,1,2].map(i => (
              <div key={i} className="mr-sk-card" style={{animationDelay:`${i*80}ms`}}>
                <div className="mr-sk-line mr-sk" style={{width:"40%"}}/>
                <div className="mr-sk-line mr-sk" style={{width:"60%"}}/>
                <div className="mr-sk-line mr-sk" style={{width:"30%"}}/>
              </div>
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="mr-state mr-fade">
            <div className="mr-state-icon">⚠️</div>
            <p className="mr-state-title">Something went wrong</p>
            <p className="mr-state-sub">{error}</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && bookings.length === 0 && (
          <div className="mr-state mr-fade">
            <div className="mr-state-icon">📋</div>
            <p className="mr-state-title">No bookings yet</p>
            <p className="mr-state-sub">Your rentals haven't been booked yet</p>
          </div>
        )}

        {/* ── Booking list ── */}
        {!loading && bookings.length > 0 && (
          <div className="mr-list">
            {bookings.map((b, idx) => {
              const style  = ss(b.status);
              const days   = daysBetween(b.startDate, b.endDate);
              const total  = days * (b.rentalId?.pricePerDay || 0);

              return (
                <div
                  key={b._id}
                  className="mr-card mr-fade"
                  style={{animationDelay:`${120 + idx * 50}ms`}}
                >
                  {/* Left accent bar */}
                  <div className="mr-card-bar" style={{background: style.color}}/>

                  {/* Top row */}
                  <div className="mr-card-top">
                    <div>
                      <h3 className="mr-car-title">{b.rentalId?.title}</h3>
                      <div className="mr-car-meta">
                        <span>{b.rentalId?.city}</span>
                        <span className="mr-car-meta-dot"/>
                        <span>{b.rentalId?.pricePerDay} MAD / day</span>
                      </div>
                    </div>

                    <span
                      className="mr-badge"
                      style={{
                        color: style.color,
                        background: style.bg,
                        borderColor: style.bd,
                      }}
                    >
                      {style.label}
                    </span>
                  </div>

                  {/* Bottom info grid */}
                  <div className="mr-card-bottom">

                    <div className="mr-info-block">
                      <p className="mr-info-lbl">Dates</p>
                      <div className="mr-date-range">
                        <span>{fmtDate(b.startDate)}</span>
                        <span className="mr-date-arrow">→</span>
                        <span>{fmtDate(b.endDate)}</span>
                      </div>
                    </div>

                    <div className="mr-info-block">
                      <p className="mr-info-lbl">Customer</p>
                      <p className="mr-info-val">
                        <strong>{b.customerId?.name}</strong>
                      </p>
                      <p className="mr-info-val" style={{fontSize:11, marginTop:2}}>
                        {b.customerId?.phone}
                      </p>
                    </div>

                    <div className="mr-info-block">
                      <p className="mr-info-lbl">Duration · Revenue</p>
                      <p className="mr-info-val">
                        <strong>{days}</strong>
                        <span style={{color:"var(--muted)", fontSize:11}}> days</span>
                        {b.totalAmount > 0 && (
                          <>
                            <span style={{color:"var(--dim)", margin:"0 6px"}}>·</span>
                            <strong style={{color:"#7c6cfc"}}>{Number(b.totalAmount).toLocaleString()} MAD</strong>
                          </>
                        )}
                      </p>
                    </div>

                  </div>

                  {/* Action row */}
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:18, paddingTop:14, borderTop:"1px solid var(--border)" }}>
                    {b.status === "pending" && (
                      <>
                        <button
                          disabled={acting === b._id}
                          onClick={() => changeStatus(b._id, "confirmed")}
                          style={{ padding:"6px 14px", borderRadius:8, fontSize:11, fontFamily:"var(--mono)", border:"1px solid rgba(42,245,192,.3)", background:"rgba(42,245,192,.08)", color:"#2af5c0", cursor:"pointer" }}
                        >
                          ✓ Confirm
                        </button>
                        <button
                          disabled={acting === b._id}
                          onClick={() => changeStatus(b._id, "rejected")}
                          style={{ padding:"6px 14px", borderRadius:8, fontSize:11, fontFamily:"var(--mono)", border:"1px solid rgba(252,108,108,.3)", background:"rgba(252,108,108,.08)", color:"#fc6c6c", cursor:"pointer" }}
                        >
                          ✗ Reject
                        </button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <>
                        <button
                          disabled={acting === b._id}
                          onClick={() => changeStatus(b._id, "completed")}
                          style={{ padding:"6px 14px", borderRadius:8, fontSize:11, fontFamily:"var(--mono)", border:"1px solid rgba(124,108,252,.3)", background:"rgba(124,108,252,.08)", color:"#a78bfa", cursor:"pointer" }}
                        >
                          ✓ Mark Completed
                        </button>
                        <button
                          disabled={acting === b._id}
                          onClick={() => togglePaid(b._id)}
                          style={{ padding:"6px 14px", borderRadius:8, fontSize:11, fontFamily:"var(--mono)", border:`1px solid ${b.isPaid ? "rgba(52,211,153,.3)" : "rgba(245,166,35,.3)"}`, background: b.isPaid ? "rgba(52,211,153,.08)" : "rgba(245,166,35,.08)", color: b.isPaid ? "#34d399" : "#f5a623", cursor:"pointer" }}
                        >
                          {b.isPaid ? "✓ Paid" : "$ Mark Paid"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </OwnerLayout>
  );
}
