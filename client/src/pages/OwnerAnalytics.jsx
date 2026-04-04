import { useEffect, useState } from "react";
import { getOwnerAnalytics } from "../api/analytics";
import OwnerBookingCalendar from "../components/analytics/OwnerBookingCalendar";
import TimeFilter from "../components/analytics/TimeFilter";
import BookingStatusChart from "../components/analytics/BookingStatusChart";
import RevenuePerCarChart from "../components/analytics/RevenuePerCarChart";
import DemandHeatmap from "../components/analytics/DemandHeatmap";
import OwnerLayout from "../components/owner/OwnerLayout";

import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
  ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar,
} from "recharts";

import { Car, Calendar, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .oa {
    --bg:     #09090f;
    --s1:     #111118;
    --s2:     #16161f;
    --border: rgba(255,255,255,0.07);
    --bhi:    rgba(255,255,255,0.13);
    --txt:    #e8e8f0;
    --muted:  #5a5a72;
    --violet: #7c6cfc;
    --teal:   #2af5c0;
    --amber:  #f5a623;
    --blue:   #60a5fa;
    --danger: #fc6c6c;
    --head:   'Syne', sans-serif;
    --mono:   'DM Mono', monospace;

    font-family: var(--head);
    background:  var(--bg);
    color:       var(--txt);
    min-height:  100vh;
    width:       100%;
    box-sizing:  border-box;
    padding:     40px 44px 60px;
  }

  .oa-card {
    background: var(--s1);
    border: 1px solid var(--border);
    border-radius: 18px;
    position: relative;
    overflow: hidden;
    transition: border-color .25s, box-shadow .25s;
  }
  .oa-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(124,108,252,.05) 0%, transparent 55%);
    pointer-events: none;
  }
  .oa-card:hover {
    border-color: var(--bhi);
    box-shadow: 0 0 36px rgba(124,108,252,.09);
  }

  .oa-kpi { padding: 26px 22px 22px; display:flex; flex-direction:column; gap:14px; }
  .oa-kpi-bar { position:absolute; top:0; left:0; right:0; height:2px; border-radius:2px 2px 0 0; }
  .oa-kpi-top { display:flex; align-items:flex-start; justify-content:space-between; }
  .oa-kpi-icon {
    width:42px; height:42px; border-radius:11px;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }

  .oa-label {
    font-family: var(--mono);
    font-size: 10px; font-weight:500;
    letter-spacing:.12em; text-transform:uppercase;
    color: var(--muted);
  }
  .oa-kpi-value {
    font-family: var(--mono);
    font-size:34px; font-weight:500; line-height:1; letter-spacing:-.02em;
  }

  .oa-sh { margin-bottom:20px; }
  .oa-sh-title { font-size:17px; font-weight:700; letter-spacing:-.025em; margin:5px 0 0; color:var(--txt); }

  .oa-table { width:100%; border-collapse:collapse; }
  .oa-table th {
    font-family:var(--mono); font-size:10px; letter-spacing:.1em;
    text-transform:uppercase; color:var(--muted);
    padding:6px 0 12px; text-align:left; border-bottom:1px solid var(--border);
  }
  .oa-table td { padding:13px 0; border-bottom:1px solid var(--border); font-size:13.5px; color:var(--txt); }
  .oa-table tr:last-child td { border-bottom:none; }
  .oa-table tbody tr { transition:background .15s; }
  .oa-table tbody tr:hover td { background:rgba(124,108,252,.04); }

  .oa-rental {
    padding:13px 15px; border:1px solid var(--border); border-radius:11px;
    transition:border-color .2s, background .2s; cursor:default;
  }
  .oa-rental:hover { border-color:var(--bhi); background:var(--s2); }

  .oa-dot { width:7px; height:7px; border-radius:50%; display:inline-block; box-shadow:0 0 7px currentColor; }

  @keyframes oa-up {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .oa-fade { opacity:0; animation:oa-up .5s ease forwards; }

  @keyframes oa-spin { to { transform:rotate(360deg); } }

  .oa ::-webkit-scrollbar { width:4px; }
  .oa ::-webkit-scrollbar-thumb { background:var(--bhi); border-radius:4px; }
`;

/* ─── Tooltip ──────────────────────────────────────────────────────────── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:"#16161f", border:"1px solid rgba(255,255,255,.13)",
      borderRadius:10, padding:"9px 13px",
      fontFamily:"'DM Mono',monospace", fontSize:12, color:"#e8e8f0",
    }}>
      <div style={{ color:"#5a5a72", marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color||"#7c6cfc" }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

/* ─── KPI Card ─────────────────────────────────────────────────────────── */
const KpiCard = ({ label, value, icon: Icon, color, delay=0 }) => (
  <div className="oa-card oa-kpi oa-fade" style={{ animationDelay:`${delay}ms` }}>
    <div className="oa-kpi-bar" style={{ background:color }}/>
    <div className="oa-kpi-top">
      <span className="oa-label">{label}</span>
      <div className="oa-kpi-icon" style={{ background:`${color}18`, color }}>
        <Icon size={17}/>
      </div>
    </div>
    <div className="oa-kpi-value" style={{ color }}>{value}</div>
  </div>
);

/* ─── Section Heading ──────────────────────────────────────────────────── */
const SH = ({ eyebrow, title }) => (
  <div className="oa-sh">
    <span className="oa-label">{eyebrow}</span>
    <p className="oa-sh-title">{title}</p>
  </div>
);

/* ─── Shared chart props ───────────────────────────────────────────────── */
const TICK = { fill:"#5a5a72", fontSize:11, fontFamily:"'DM Mono'" };
const GRID = { stroke:"rgba(255,255,255,.04)", strokeDasharray:"4 4" };
const AX   = { axisLine:false, tickLine:false };

/* ═══════════════════════════════════════════════════════════════════════ */
export default function OwnerAnalytics() {

  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading  ] = useState(true);
  const [period,    setPeriod   ] = useState("30d");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOwnerAnalytics(period);
        setAnalytics(data);
      } catch(e) {
        console.error("Analytics error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  if (loading) return (
    <OwnerLayout>
      <style>{STYLES}</style>
      <div className="oa" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{
            width:44, height:44, borderRadius:"50%", margin:"0 auto 14px",
            border:"2px solid rgba(124,108,252,.25)", borderTopColor:"#7c6cfc",
            animation:"oa-spin .9s linear infinite",
          }}/>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#5a5a72" }}>
            Loading analytics…
          </p>
        </div>
      </div>
    </OwnerLayout>
  );

  if (!analytics) return (
    <OwnerLayout>
      <style>{STYLES}</style>
      <div className="oa" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
        <p style={{ fontFamily:"'DM Mono',monospace", color:"#5a5a72" }}>No analytics data</p>
      </div>
    </OwnerLayout>
  );

  const occupancyChart = [{ name:"occupancy", value:analytics.occupancyRate }];
  const growthPos      = analytics.revenueGrowth >= 0;

  return (
    <OwnerLayout>
      <style>{STYLES}</style>

      <div className="oa">

        {/* ══ HEADER ══════════════════════════════════════════════════════ */}
        <div className="oa-fade" style={{
          display:"flex", alignItems:"flex-end", justifyContent:"space-between",
          marginBottom:36,
        }}>
          <div>
            <span className="oa-label">Dashboard</span>
            <h1 style={{
              fontFamily:"'Syne',sans-serif",
              fontSize:38, fontWeight:800, letterSpacing:"-.04em",
              lineHeight:1, margin:"8px 0 0", color:"#e8e8f0",
            }}>
              Owner Analytics
            </h1>
          </div>
          <div style={{
            background:"#111118", border:"1px solid rgba(255,255,255,.07)",
            borderRadius:12, padding:4,
          }}>
            <TimeFilter period={period} setPeriod={setPeriod}/>
          </div>
        </div>

        {/* ══ KPI GRID ════════════════════════════════════════════════════ */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
          <KpiCard label="Total Bookings"   value={analytics.totalBookings}                icon={Calendar}   color="#7c6cfc" delay={0}  />
          <KpiCard label="Occupancy Rate"   value={`${analytics.occupancyRate}%`}           icon={TrendingUp} color="#2af5c0" delay={70} />
          <KpiCard label="Most Rented Car"  value={analytics.mostRentedCar?.title || "N/A"} icon={Car}        color="#f5a623" delay={140}/>
          <KpiCard label="Upcoming Rentals" value={analytics.upcomingRentals?.length || 0}  icon={DollarSign} color="#60a5fa" delay={210}/>
        </div>

        {/* ══ BOOKING CALENDAR ════════════════════════════════════════════ */}
        <div className="oa-card oa-fade" style={{ padding:"28px 28px 24px", marginBottom:24, animationDelay:"260ms" }}>
          <SH eyebrow="Schedule" title="Booking Calendar"/>
          <OwnerBookingCalendar/>
        </div>

        {/* ══ REVENUE PER CAR ═════════════════════════════════════════════ */}
        <div className="oa-card oa-fade" style={{ padding:28, marginBottom:24, animationDelay:"420ms" }}>
          <SH eyebrow="Breakdown" title="Revenue per Car"/>
          <RevenuePerCarChart data={analytics.fleetPerformance||[]}/>
        </div>

        {/* ══ BOOKING STATUS ══════════════════════════════════════════════ */}
        <div className="oa-card oa-fade" style={{ padding:28, marginBottom:24, animationDelay:"450ms" }}>
          <SH eyebrow="Overview" title="Booking Status"/>
          <BookingStatusChart data={analytics.bookingStatusData||[]}/>
        </div>

        {/* ══ REVENUE + OCCUPANCY ═════════════════════════════════════════ */}
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:14, marginBottom:24 }}>

          {/* Revenue area chart */}
          <div className="oa-card oa-fade" style={{ padding:28, animationDelay:"310ms" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22 }}>
              <div>
                <span className="oa-label">Performance</span>
                <p style={{ fontSize:17, fontWeight:700, margin:"6px 0 2px", letterSpacing:"-.02em" }}>Revenue</p>
                <p style={{
                  fontFamily:"'DM Mono',monospace", fontSize:30, fontWeight:500,
                  color:"#7c6cfc", letterSpacing:"-.02em", margin:0,
                }}>
                  ${analytics.totalRevenue?.toLocaleString()}
                </p>
              </div>
              <div style={{
                display:"flex", alignItems:"center", gap:5,
                background: growthPos ? "rgba(42,245,192,.1)"  : "rgba(252,108,108,.1)",
                color:       growthPos ? "#2af5c0"              : "#fc6c6c",
                border:`1px solid ${growthPos ? "rgba(42,245,192,.22)" : "rgba(252,108,108,.22)"}`,
                borderRadius:8, padding:"5px 11px",
                fontFamily:"'DM Mono',monospace", fontSize:12, fontWeight:500,
              }}>
                {growthPos ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>}
                {growthPos ? "+" : ""}{analytics.revenueGrowth}%
              </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={analytics.monthlyRevenue||[]} margin={{top:4,right:4,bottom:0,left:0}}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c6cfc" stopOpacity={.28}/>
                    <stop offset="95%" stopColor="#7c6cfc" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid {...GRID}/>
                <XAxis dataKey="month" tick={TICK} {...AX}/>
                <YAxis tick={TICK} {...AX}/>
                <Tooltip content={<Tip/>}/>
                <Area type="monotone" dataKey="revenue" stroke="#7c6cfc" strokeWidth={2.5}
                  fill="url(#rg)" dot={false} activeDot={{r:5,fill:"#7c6cfc",strokeWidth:0}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Occupancy radial */}
          <div className="oa-card oa-fade" style={{
            padding:28, animationDelay:"350ms",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4,
          }}>
            <span className="oa-label">Fleet Usage</span>
            <p style={{ fontSize:15, fontWeight:700, margin:"6px 0 16px", letterSpacing:"-.015em" }}>Occupancy</p>
            <RadialBarChart
              width={190} height={190}
              innerRadius="72%" outerRadius="100%"
              data={occupancyChart} startAngle={90} endAngle={-270}
            >
              <RadialBar minAngle={15} dataKey="value" fill="#2af5c0" cornerRadius={8}/>
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize:26, fontWeight:800, fill:"#2af5c0", fontFamily:"'DM Mono',monospace" }}>
                {analytics.occupancyRate}%
              </text>
            </RadialBarChart>
            <div style={{
              display:"flex", alignItems:"center", gap:7,
              fontFamily:"'DM Mono',monospace", fontSize:11, color:"#5a5a72", marginTop:6,
            }}>
              <span className="oa-dot" style={{ color:"#2af5c0", background:"#2af5c0" }}/>
              of fleet active
            </div>
          </div>
        </div>

        {/* ══ BOOKING TRENDS ══════════════════════════════════════════════ */}
        <div className="oa-card oa-fade" style={{ padding:28, marginBottom:24, animationDelay:"390ms" }}>
          <SH eyebrow="Activity" title="Booking Trends"/>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={analytics.bookingTrends||[]} margin={{top:4,right:4,bottom:0,left:0}}>
              <CartesianGrid {...GRID}/>
              <XAxis dataKey="month" tick={TICK} {...AX}/>
              <YAxis tick={TICK} {...AX}/>
              <Tooltip content={<Tip/>}/>
              <Line type="monotone" dataKey="bookings" stroke="#f5a623" strokeWidth={2.5}
                dot={{r:4,fill:"#f5a623",strokeWidth:0}}
                activeDot={{r:7,fill:"#f5a623",strokeWidth:0}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>


        {/* ══ UPCOMING RENTALS + FLEET ════════════════════════════════════ */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>

          <div className="oa-card oa-fade" style={{ padding:28, animationDelay:"480ms" }}>
            <SH eyebrow="Scheduled" title="Upcoming Rentals"/>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {analytics.upcomingRentals?.map((b) => (
                <div key={b._id} className="oa-rental">
                  <p style={{ fontWeight:600, fontSize:13.5, margin:"0 0 3px" }}>
                    {b.rentalId?.title}
                  </p>
                  <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:"#5a5a72", margin:0 }}>
                    {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="oa-card oa-fade" style={{ padding:28, animationDelay:"510ms" }}>
            <SH eyebrow="Vehicles" title="Fleet Performance"/>
            <table className="oa-table">
              <thead>
                <tr>
                  <th>Car</th><th>Revenue</th><th>Bookings</th><th>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {analytics.fleetPerformance?.map((car,i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:600 }}>{car.title}</td>
                    <td style={{ color:"#7c6cfc", fontFamily:"'DM Mono',monospace", fontWeight:500 }}>
                      ${car.revenue}
                    </td>
                    <td style={{ fontFamily:"'DM Mono',monospace", color:"#a0a0b8" }}>
                      {car.bookings}
                    </td>
                    <td>
                      <span style={{
                        background:"rgba(42,245,192,.1)", color:"#2af5c0",
                        border:"1px solid rgba(42,245,192,.2)",
                        borderRadius:6, padding:"2px 8px",
                        fontFamily:"'DM Mono',monospace", fontSize:11.5,
                      }}>
                        {car.utilization}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ══ DEMAND HEATMAP ══════════════════════════════════════════════ */}
        <div className="oa-card oa-fade" style={{ padding:28, animationDelay:"540ms" }}>
          <SH eyebrow="Patterns" title="Demand Heatmap"/>
          <DemandHeatmap data={analytics.demandHeatmap||[]}/>
        </div>

      </div>
    </OwnerLayout>
  );
}
