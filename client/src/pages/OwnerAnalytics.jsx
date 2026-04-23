import { useEffect, useState } from "react";
import { getOwnerAnalytics, getOwnerInsights } from "../api/analytics";
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

import {
  Car, Calendar, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight,
  Wrench, Lightbulb, AlertTriangle, Zap, TrendingDown,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────────── */
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
    --green:  #34d399;
    --head:   'Syne', sans-serif;
    --mono:   'DM Mono', monospace;

    font-family: var(--head);
    background: var(--bg);
    color: var(--txt);
    min-height: 100vh;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding: clamp(16px, 4vw, 40px) clamp(14px, 3.5vw, 44px) clamp(40px, 6vw, 60px);
    overflow-x: hidden;
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
    background: linear-gradient(135deg, rgba(124,108,252,.06) 0%, transparent 55%);
    pointer-events: none;
  }
  .oa-card:hover {
    border-color: var(--bhi);
    box-shadow: 0 0 40px rgba(124,108,252,.1);
  }

  .oa-card-pad   { padding: clamp(18px, 4vw, 28px); }
  .oa-card-pad-sm { padding: clamp(18px, 4vw, 28px) clamp(16px, 4vw, 28px) clamp(16px, 3vw, 24px); }

  .oa-kpi { padding: clamp(18px, 3.5vw, 26px) clamp(16px, 3vw, 22px) clamp(16px, 3vw, 22px); display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  .oa-kpi-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 2px 2px 0 0; z-index: 1; }
  .oa-kpi-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .oa-kpi-icon { width: 40px; height: 40px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  .oa-label { font-family: var(--mono); font-size: 10px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
  .oa-kpi-value { font-family: var(--mono); font-size: clamp(22px, 6vw, 32px); font-weight: 500; line-height: 1.05; letter-spacing: -.02em; min-width: 0; }
  .oa-kpi-value.clip { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .oa-header { display: flex; flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: clamp(22px, 5vw, 36px); }
  @media (min-width: 720px) { .oa-header { flex-direction: row; align-items: flex-end; justify-content: space-between; } }

  .oa-title { font-family: var(--head); font-size: clamp(28px, 7vw, 38px); font-weight: 800; letter-spacing: -.04em; line-height: 1.05; margin: 8px 0 0; color: var(--txt); }

  .oa-kpi-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px; }
  @media (min-width: 520px) { .oa-kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
  @media (min-width: 1100px) { .oa-kpi-grid { grid-template-columns: repeat(4, 1fr); margin-bottom: 24px; } }

  .oa-kpi-grid-6 { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 20px; }
  @media (min-width: 520px) { .oa-kpi-grid-6 { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 860px) { .oa-kpi-grid-6 { grid-template-columns: repeat(3, 1fr); } }
  @media (min-width: 1200px) { .oa-kpi-grid-6 { grid-template-columns: repeat(6, 1fr); margin-bottom: 24px; } }

  .oa-split-2-1 { display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 20px; }
  @media (min-width: 900px) { .oa-split-2-1 { grid-template-columns: 2fr 1fr; margin-bottom: 24px; } }

  .oa-split-eq { display: grid; grid-template-columns: 1fr; gap: 14px; margin-bottom: 20px; }
  @media (min-width: 768px) { .oa-split-eq { grid-template-columns: 1fr 1fr; margin-bottom: 24px; } }

  .oa-sh { margin-bottom: clamp(14px, 3vw, 20px); }
  .oa-sh-title { font-size: clamp(15px, 3.5vw, 17px); font-weight: 700; letter-spacing: -.025em; margin: 5px 0 0; color: var(--txt); }

  .oa-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; margin: 0 -4px; padding: 0 4px; }
  .oa-table { width: 100%; border-collapse: collapse; min-width: 480px; }
  .oa-table th { font-family: var(--mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); padding: 6px 8px 12px 0; text-align: left; border-bottom: 1px solid var(--border); }
  .oa-table td { padding: 12px 8px 12px 0; border-bottom: 1px solid var(--border); font-size: 13px; color: var(--txt); vertical-align: middle; }
  .oa-table tr:last-child td { border-bottom: none; }
  .oa-table tbody tr { transition: background .15s; }
  .oa-table tbody tr:hover td { background: rgba(124,108,252,.04); }

  .oa-rental { padding: 12px 14px; border: 1px solid var(--border); border-radius: 12px; transition: border-color .2s, background .2s; cursor: default; }
  .oa-rental:hover { border-color: var(--bhi); background: var(--s2); }

  .oa-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; box-shadow: 0 0 7px currentColor; }

  .oa-rev-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 18px; flex-wrap: wrap; }
  .oa-rev-title { font-size: clamp(15px, 3.5vw, 17px); font-weight: 700; margin: 6px 0 2px; letter-spacing: -.02em; }
  .oa-rev-amt { font-family: var(--mono); font-size: clamp(22px, 6vw, 30px); font-weight: 500; color: var(--violet); letter-spacing: -.02em; margin: 0; }
  .oa-growth-pill { display: flex; align-items: center; gap: 5px; border-radius: 10px; padding: 6px 12px; font-family: var(--mono); font-size: 11px; font-weight: 500; flex-shrink: 0; }

  .oa-radial-box { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; text-align: center; min-height: 200px; }
  .oa-radial-chart { width: 100%; max-width: 220px; height: 200px; }
  .oa-chart-h { width: 100%; height: clamp(200px, 42vw, 240px); }

  /* INSIGHT CARDS */
  .oa-insight { padding: 14px 16px; border-radius: 14px; display: flex; gap: 14px; align-items: flex-start; border: 1px solid; transition: opacity .2s; }
  .oa-insight-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .oa-insight-title { font-size: 13.5px; font-weight: 700; margin: 0 0 5px; line-height: 1.3; }
  .oa-insight-action { font-family: var(--mono); font-size: 11.5px; color: var(--muted); margin: 0; line-height: 1.5; }
  .oa-insight-gain { font-family: var(--mono); font-size: 11px; margin-top: 6px; font-weight: 500; }

  .oa-insights-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
  @media (min-width: 700px) { .oa-insights-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (min-width: 1100px) { .oa-insights-grid { grid-template-columns: repeat(3, 1fr); } }

  @keyframes oa-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .oa-fade { opacity: 0; animation: oa-up .5s ease forwards; }
  @keyframes oa-spin { to { transform: rotate(360deg); } }

  .oa ::-webkit-scrollbar { width: 4px; height: 4px; }
  .oa ::-webkit-scrollbar-thumb { background: var(--bhi); border-radius: 4px; }

  .oa-loading { display: flex; align-items: center; justify-content: center; min-height: 50vh; padding: 24px; }
  .oa-spin { width: 44px; height: 44px; border-radius: 50%; margin: 0 auto 14px; border: 2px solid rgba(124,108,252,.25); border-top-color: #7c6cfc; animation: oa-spin .9s linear infinite; }
`;

/* ─────────────────────────────────────────────────────────────────────
   SHARED HELPERS
───────────────────────────────────────────────────────────────────── */
const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#16161f", border: "1px solid rgba(255,255,255,.13)", borderRadius: 10, padding: "9px 13px", fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#e8e8f0" }}>
      <div style={{ color: "#5a5a72", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || "#7c6cfc" }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const TICK = { fill: "#5a5a72", fontSize: 11, fontFamily: "'DM Mono'" };
const GRID = { stroke: "rgba(255,255,255,.04)", strokeDasharray: "4 4" };
const AX   = { axisLine: false, tickLine: false };

const SH = ({ eyebrow, title }) => (
  <div className="oa-sh">
    <span className="oa-label">{eyebrow}</span>
    <p className="oa-sh-title">{title}</p>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, icon: Icon, color, delay = 0, clip = false, sub }) {
  return (
    <div className="oa-card oa-kpi oa-fade" style={{ animationDelay: `${delay}ms` }}>
      <div className="oa-kpi-bar" style={{ background: color }} />
      <div className="oa-kpi-top">
        <span className="oa-label">{label}</span>
        <div className="oa-kpi-icon" style={{ background: `${color}18`, color }}>
          <Icon size={17} />
        </div>
      </div>
      <div className={`oa-kpi-value${clip ? " clip" : ""}`} style={{ color }} title={clip ? String(value) : undefined}>
        {value}
      </div>
      {sub && <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--muted)" }}>{sub}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   INSIGHT CARD
───────────────────────────────────────────────────────────────────── */
const INSIGHT_CONFIG = {
  alert:       { bg: "rgba(252,108,108,.08)", border: "rgba(252,108,108,.22)", iconBg: "rgba(252,108,108,.15)", color: "#fc6c6c",  Icon: AlertTriangle },
  warning:     { bg: "rgba(245,166,35,.08)",  border: "rgba(245,166,35,.22)",  iconBg: "rgba(245,166,35,.15)",  color: "#f5a623",  Icon: TrendingDown },
  opportunity: { bg: "rgba(42,245,192,.08)",  border: "rgba(42,245,192,.22)",  iconBg: "rgba(42,245,192,.15)",  color: "#2af5c0",  Icon: Zap },
  maintenance: { bg: "rgba(96,165,250,.08)",  border: "rgba(96,165,250,.22)",  iconBg: "rgba(96,165,250,.15)",  color: "#60a5fa",  Icon: Wrench },
};

function InsightCard({ insight }) {
  const cfg = INSIGHT_CONFIG[insight.type] || INSIGHT_CONFIG.alert;
  const { Icon } = cfg;
  return (
    <div className="oa-insight" style={{ background: cfg.bg, borderColor: cfg.border }}>
      <div className="oa-insight-icon" style={{ background: cfg.iconBg, color: cfg.color }}>
        <Icon size={17} />
      </div>
      <div style={{ minWidth: 0 }}>
        <p className="oa-insight-title">{insight.title}</p>
        <p className="oa-insight-action">{insight.action}</p>
        {insight.potentialRevenueGain > 0 && (
          <p className="oa-insight-gain" style={{ color: cfg.color }}>
            +{insight.potentialRevenueGain.toLocaleString()} MAD potential gain
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────────── */
export default function OwnerAnalytics() {
  const [analytics, setAnalytics]     = useState(null);
  const [insights, setInsights]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [period, setPeriod]           = useState("30d");
  const [chartCompact, setChartCompact] = useState(false);

  useEffect(() => {
    const q = () => setChartCompact(window.innerWidth < 640);
    q();
    window.addEventListener("resize", q);
    return () => window.removeEventListener("resize", q);
  }, []);

  useEffect(() => {
    setLoading(true);
    setInsightsLoading(true);

    getOwnerAnalytics(period)
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));

    getOwnerInsights(period)
      .then((d) => setInsights(d.insights || []))
      .catch(console.error)
      .finally(() => setInsightsLoading(false));
  }, [period]);

  if (loading) {
    return (
      <OwnerLayout>
        <style>{STYLES}</style>
        <div className="oa oa-loading">
          <div style={{ textAlign: "center" }}>
            <div className="oa-spin" />
            <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#5a5a72" }}>Loading analytics…</p>
          </div>
        </div>
      </OwnerLayout>
    );
  }

  if (!analytics) {
    return (
      <OwnerLayout>
        <style>{STYLES}</style>
        <div className="oa oa-loading">
          <p style={{ fontFamily: "'DM Mono',monospace", color: "#5a5a72" }}>No analytics data</p>
        </div>
      </OwnerLayout>
    );
  }

  const occupancyChart = [{ name: "occupancy", value: analytics.occupancyRate, fill: "#2af5c0" }];
  const growthPos = analytics.revenueGrowth >= 0;
  const xAxisTick = chartCompact ? { ...TICK, fontSize: 9 } : TICK;
  const fmt = (n) => (n || 0).toLocaleString("fr-MA");

  return (
    <OwnerLayout>
      <style>{STYLES}</style>

      <div className="oa">
        {/* ── HEADER ── */}
        <header className="oa-header oa-fade">
          <div>
            <span className="oa-label">Dashboard</span>
            <h1 className="oa-title">Owner Analytics</h1>
          </div>
          <div style={{ flexShrink: 0 }}>
            <TimeFilter period={period} setPeriod={setPeriod} />
          </div>
        </header>

        {/* ── 6 KPI CARDS ── */}
        <div className="oa-kpi-grid-6">
          <KpiCard label="Total Bookings"  value={analytics.totalBookings}               icon={Calendar}    color="#7c6cfc" delay={0} />
          <KpiCard label="Total Revenue"   value={`${fmt(analytics.totalRevenue)} MAD`}  icon={DollarSign}  color="#2af5c0" delay={60}
            sub={analytics.pendingRevenue > 0 ? `${fmt(analytics.pendingRevenue)} MAD unpaid` : undefined} />
          <KpiCard label="Collected"       value={`${fmt(analytics.collectedRevenue ?? 0)} MAD`} icon={TrendingUp} color="#34d399" delay={120}
            sub={analytics.totalMaintenanceCost > 0 ? `−${fmt(analytics.totalMaintenanceCost)} MAD costs` : undefined} />
          <KpiCard label="Avg Daily Rev"   value={`${fmt(analytics.avgDailyRevenue)} MAD`} icon={Zap}       color="#f5a623" delay={180} />
          <KpiCard label="Occupancy"       value={`${analytics.occupancyRate}%`}          icon={Car}        color="#60a5fa" delay={240} />
          <KpiCard label="Upcoming"        value={analytics.upcomingRentals?.length || 0} icon={Calendar}   color="#a78bfa" delay={300} />
        </div>

        {/* ── SMART INSIGHTS ── */}
        {!insightsLoading && insights.length > 0 && (
          <div className="oa-card oa-card-pad oa-fade" style={{ marginBottom: 20, animationDelay: "340ms" }}>
            <SH eyebrow="AI Advisor" title={
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Smart Insights
                <span style={{ background: "rgba(124,108,252,.15)", color: "#7c6cfc", borderRadius: 6, padding: "2px 8px", fontFamily: "'DM Mono',monospace", fontSize: 11 }}>
                  {insights.length} action{insights.length !== 1 ? "s" : ""}
                </span>
              </span>
            } />
            <div className="oa-insights-grid">
              {insights.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
            </div>
          </div>
        )}

        {/* ── CALENDAR ── */}
        <div className="oa-card oa-card-pad-sm oa-fade" style={{ marginBottom: 20, animationDelay: "380ms" }}>
          <SH eyebrow="Schedule" title="Booking Calendar" />
          <OwnerBookingCalendar />
        </div>

        {/* ── REVENUE CHART + OCCUPANCY RADIAL ── */}
        <div className="oa-split-2-1">
          <div className="oa-card oa-card-pad oa-fade" style={{ animationDelay: "420ms" }}>
            <div className="oa-rev-head">
              <div>
                <span className="oa-label">Performance</span>
                <p className="oa-rev-title">Revenue</p>
                <p className="oa-rev-amt">{fmt(analytics.totalRevenue)} MAD</p>
              </div>
              <div
                className="oa-growth-pill"
                style={{
                  background: growthPos ? "rgba(42,245,192,.1)" : "rgba(252,108,108,.1)",
                  color: growthPos ? "#2af5c0" : "#fc6c6c",
                  border: `1px solid ${growthPos ? "rgba(42,245,192,.22)" : "rgba(252,108,108,.22)"}`,
                }}
              >
                {growthPos ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {growthPos ? "+" : ""}{analytics.revenueGrowth}%
              </div>
            </div>

            <div className="oa-chart-h">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.monthlyRevenue || []} margin={{ top: 4, right: 4, bottom: chartCompact ? 4 : 0, left: chartCompact ? -8 : 0 }}>
                  <defs>
                    <linearGradient id="oaRg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7c6cfc" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#7c6cfc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid {...GRID} />
                  <XAxis dataKey="month" tick={xAxisTick} {...AX} interval={chartCompact ? "preserveStartEnd" : 0} />
                  <YAxis tick={xAxisTick} {...AX} width={chartCompact ? 32 : 40} />
                  <Tooltip content={<Tip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#7c6cfc" strokeWidth={2.5} fill="url(#oaRg)" dot={false} activeDot={{ r: 5, fill: "#7c6cfc", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="oa-card oa-card-pad oa-fade oa-radial-box" style={{ animationDelay: "450ms" }}>
            <span className="oa-label">Fleet Usage</span>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 0", letterSpacing: "-.015em" }}>Occupancy</p>
            <div className="oa-radial-chart">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="100%" data={occupancyChart} startAngle={90} endAngle={-270} barSize={12}>
                  <RadialBar minAngle={12} dataKey="value" cornerRadius={6} fill="#2af5c0" />
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 26, fontWeight: 800, fill: "#2af5c0", fontFamily: "'DM Mono',monospace" }}>
                    {analytics.occupancyRate}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Mono',monospace", fontSize: 11, color: "#5a5a72", marginTop: 4 }}>
              <span className="oa-dot" style={{ color: "#2af5c0", background: "#2af5c0" }} />
              of fleet active
            </div>
          </div>
        </div>

        {/* ── REVENUE PER CAR ── */}
        <div className="oa-card oa-card-pad oa-fade" style={{ marginBottom: 20, animationDelay: "480ms" }}>
          <SH eyebrow="Breakdown" title="Revenue per Car" />
          <RevenuePerCarChart data={analytics.fleetPerformance || []} />
        </div>

        {/* ── BOOKING STATUS ── */}
        <div className="oa-card oa-card-pad oa-fade" style={{ marginBottom: 20, animationDelay: "510ms" }}>
          <SH eyebrow="Overview" title="Booking Status" />
          <BookingStatusChart data={analytics.bookingStatusData || []} />
        </div>

        {/* ── BOOKING TRENDS ── */}
        <div className="oa-card oa-card-pad oa-fade" style={{ marginBottom: 20, animationDelay: "540ms" }}>
          <SH eyebrow="Activity" title="Booking Trends" />
          <div className="oa-chart-h">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.bookingTrends || []} margin={{ top: 4, right: 4, bottom: chartCompact ? 4 : 0, left: chartCompact ? -8 : 0 }}>
                <CartesianGrid {...GRID} />
                <XAxis dataKey="month" tick={xAxisTick} {...AX} interval={chartCompact ? "preserveStartEnd" : 0} />
                <YAxis tick={xAxisTick} {...AX} width={chartCompact ? 28 : 36} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="bookings" stroke="#f5a623" strokeWidth={2.5} dot={{ r: 4, fill: "#f5a623", strokeWidth: 0 }} activeDot={{ r: 7, fill: "#f5a623", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── UPCOMING + FLEET TABLE ── */}
        <div className="oa-split-eq">
          <div className="oa-card oa-card-pad oa-fade" style={{ animationDelay: "570ms" }}>
            <SH eyebrow="Scheduled" title="Upcoming Rentals" />
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {analytics.upcomingRentals?.length ? (
                analytics.upcomingRentals.map((b) => (
                  <div key={b._id} className="oa-rental">
                    <p style={{ fontWeight: 600, fontSize: 13.5, margin: "0 0 4px", lineHeight: 1.3 }}>{b.rentalId?.title}</p>
                    <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5, color: "#5a5a72", margin: 0, lineHeight: 1.4 }}>
                      {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "#5a5a72", margin: 0 }}>No upcoming rentals</p>
              )}
            </div>
          </div>

          <div className="oa-card oa-card-pad oa-fade" style={{ animationDelay: "600ms" }}>
            <SH eyebrow="Vehicles" title="Fleet Performance" />
            <div className="oa-table-scroll">
              <table className="oa-table">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>Revenue</th>
                    <th>Bookings</th>
                    <th>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.fleetPerformance?.map((car, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, maxWidth: 140 }}>{car.title}</td>
                      <td style={{ color: "#7c6cfc", fontFamily: "'DM Mono',monospace", fontWeight: 500 }}>{fmt(car.revenue)} MAD</td>
                      <td style={{ fontFamily: "'DM Mono',monospace", color: "#a0a0b8" }}>{car.bookings}</td>
                      <td>
                        <span style={{ background: "rgba(42,245,192,.1)", color: "#2af5c0", border: "1px solid rgba(42,245,192,.2)", borderRadius: 6, padding: "2px 8px", fontFamily: "'DM Mono',monospace", fontSize: 11.5, whiteSpace: "nowrap" }}>
                          {car.utilization}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── DEMAND HEATMAP ── */}
        <div className="oa-card oa-card-pad oa-fade" style={{ animationDelay: "630ms" }}>
          <SH eyebrow="Patterns" title="Demand Heatmap" />
          <DemandHeatmap data={analytics.demandHeatmap || []} />
        </div>
      </div>
    </OwnerLayout>
  );
}
