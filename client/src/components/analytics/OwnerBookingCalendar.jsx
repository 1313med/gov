import { useEffect, useState } from "react";
import {
  updateBookingStatus,
  updateBookingDates,
} from "../../api/booking";
import { getOwnerBookingsCalendar } from "../../api/rental";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const DragCalendar = withDragAndDrop(Calendar);
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const UI_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');

  .obc-root { position: relative; z-index: 1; }

  .obc-meta {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px; margin-bottom: 18px;
  }
  .obc-meta-left { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
  .obc-pill {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .08em; text-transform: uppercase;
    color: #7a7a92; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09);
    border-radius: 999px; padding: 7px 12px;
  }
  .obc-pill svg { width: 12px; height: 12px; opacity: .85; }
  .obc-count {
    font-family: 'DM Mono', monospace; font-size: 11px; color: #7c6cfc;
    background: rgba(124,108,252,.12); border: 1px solid rgba(124,108,252,.28);
    border-radius: 999px; padding: 6px 11px;
  }

  .obc-legend { display: flex; align-items: center; flex-wrap: wrap; gap: 14px; }
  .obc-leg { display: flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .06em; text-transform: uppercase; color: #5a5a72; }
  .obc-leg-dot { width: 7px; height: 7px; border-radius: 50%; box-shadow: 0 0 8px currentColor; }

  .obc-cal-surface {
    background: rgba(0,0,0,.22);
    border: 1px solid rgba(255,255,255,.07);
    border-radius: 16px;
    padding: 4px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
  }
  .obc-cal-inner { border-radius: 12px; overflow: hidden; }

  .obc-tb {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; flex-wrap: wrap; margin-bottom: 14px; padding: 4px 2px 2px;
  }
  .obc-tb-nav { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .obc-tb-btn {
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px;
    color: #a8a8c0;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    padding: 7px 13px;
    cursor: pointer;
    transition: background .2s, border-color .2s, color .2s, transform .15s;
  }
  .obc-tb-btn:hover {
    background: rgba(124,108,252,.16);
    border-color: rgba(124,108,252,.35);
    color: #e8e8f0;
  }
  .obc-tb-btn:active { transform: scale(0.98); }

  .obc-tb-label {
    font-family: 'Syne', sans-serif;
    font-size: clamp(15px, 2.5vw, 18px);
    font-weight: 700;
    letter-spacing: -.03em;
    color: #e8e8f0;
    text-align: center;
    flex: 1 1 auto;
    order: 2;
  }
  @media (min-width: 640px) { .obc-tb-label { order: 0; flex: 0 1 auto; } }

  .obc-tb-views { display: flex; gap: 5px; flex-wrap: wrap; }
  .obc-tb-view {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 9px;
    color: #6b6b82;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: .06em;
    padding: 6px 11px;
    cursor: pointer;
    text-transform: capitalize;
    transition: all .2s;
  }
  .obc-tb-view:hover { border-color: rgba(124,108,252,.3); color: #a0a0b8; }
  .obc-tb-view.on {
    background: rgba(124,108,252,.18);
    border-color: rgba(124,108,252,.45);
    color: #b8a8ff;
  }

  .obc-mobile-strip { display: flex; overflow-x: auto; gap: 8px; padding: 4px 2px 16px; margin-bottom: 8px; scrollbar-width: thin; }
  .obc-mobile-strip::-webkit-scrollbar { height: 4px; }
  .obc-mobile-strip::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 4px; }
  .obc-day-pill {
    display: flex; flex-direction: column; align-items: center;
    min-width: 54px; padding: 10px 6px;
    border-radius: 14px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.08);
    cursor: pointer;
    transition: all .2s;
    flex-shrink: 0;
  }
  .obc-day-pill:hover { border-color: rgba(124,108,252,.25); }
  .obc-day-pill.sel {
    background: rgba(124,108,252,.2);
    border-color: rgba(124,108,252,.5);
    box-shadow: 0 0 20px rgba(124,108,252,.12);
  }
  .obc-day-pill .w { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: .08em; text-transform: uppercase; color: #5a5a72; }
  .obc-day-pill.sel .w { color: #9b8cff; }
  .obc-day-pill .n { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #8a8a9e; margin-top: 4px; }
  .obc-day-pill.sel .n { color: #e8e8f0; }
  .obc-day-dot { width: 5px; height: 5px; border-radius: 50%; margin-top: 5px; background: #5a5a72; }
  .obc-day-pill.sel .obc-day-dot { background: #7c6cfc; box-shadow: 0 0 8px #7c6cfc; }

  .obc-mobile-list { display: flex; flex-direction: column; gap: 10px; }
  .obc-m-card {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 14px;
    padding: 15px 16px;
    cursor: pointer;
    transition: background .2s, border-color .2s, transform .2s;
  }
  .obc-m-card:hover { background: rgba(255,255,255,.07); border-color: rgba(124,108,252,.2); transform: translateY(-1px); }
  .obc-m-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .obc-m-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: #e8e8f0; }
  .obc-m-empty { text-align: center; padding: 44px 16px; font-family: 'DM Mono', monospace; font-size: 12px; color: #4a4a62; }

  .obc-modal-bg {
    position: fixed; inset: 0;
    background: rgba(4,4,10,.72);
    backdrop-filter: blur(10px);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
    padding: 16px;
    animation: obc-fade .25s ease;
  }
  @keyframes obc-fade { from { opacity: 0; } to { opacity: 1; } }
  .obc-modal {
    background: linear-gradient(165deg, #15151f 0%, #111118 45%);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 20px;
    padding: 28px 26px 26px;
    width: 100%; max-width: 440px;
    max-height: min(90vh, 640px); overflow-y: auto;
    box-shadow: 0 32px 90px rgba(0,0,0,.55), 0 0 0 1px rgba(124,108,252,.08) inset;
    position: relative;
  }
  .obc-modal::before {
    content: ''; position: absolute; top: 0; left: 24px; right: 24px; height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, transparent, rgba(124,108,252,.6), rgba(42,245,192,.4), transparent);
  }
  .obc-modal-x {
    position: absolute; top: 14px; right: 14px;
    width: 34px; height: 34px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.06);
    color: #7a7a92;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s, color .2s, border-color .2s;
  }
  .obc-modal-x:hover { background: rgba(124,108,252,.15); border-color: rgba(124,108,252,.3); color: #e8e8f0; }
  .obc-modal-x svg { width: 14px; height: 14px; }
  .obc-modal-k { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: #5a5a72; }
  .obc-modal-h { font-family: 'Syne', sans-serif; font-size: 21px; font-weight: 800; letter-spacing: -.03em; margin: 8px 0 0; color: #e8e8f0; line-height: 1.2; }
  .obc-modal-row {
    display: flex; align-items: baseline; gap: 12px;
    padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,.06);
  }
  .obc-modal-row .l {
    font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
    color: #5a5a72; width: 76px; flex-shrink: 0;
  }
  .obc-modal-row .v { font-family: 'DM Mono', monospace; font-size: 13px; color: #c8c8d8; line-height: 1.45; word-break: break-word; }
  .obc-modal-st { margin-top: 16px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .obc-modal-actions { display: flex; gap: 10px; margin-top: 22px; }
  .obc-btn {
    flex: 1; padding: 12px; border-radius: 12px; cursor: pointer;
    font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
    border: 1px solid transparent; transition: background .2s, transform .15s, box-shadow .2s;
  }
  .obc-btn:active { transform: scale(0.99); }
  .obc-btn-ok {
    background: rgba(42,245,192,.14);
    border-color: rgba(42,245,192,.32);
    color: #2af5c0;
  }
  .obc-btn-ok:hover { background: rgba(42,245,192,.24); box-shadow: 0 8px 24px rgba(42,245,192,.12); }
  .obc-btn-no {
    background: rgba(252,108,108,.12);
    border-color: rgba(252,108,108,.3);
    color: #fc6c6c;
  }
  .obc-btn-no:hover { background: rgba(252,108,108,.2); box-shadow: 0 8px 24px rgba(252,108,108,.1); }
`;

const CALENDAR_CSS = `
  .obc-wrap .rbc-calendar,
  .obc-wrap .rbc-month-view,
  .obc-wrap .rbc-time-view,
  .obc-wrap .rbc-agenda-view,
  .obc-wrap .rbc-header,
  .obc-wrap .rbc-month-row,
  .obc-wrap .rbc-day-bg,
  .obc-wrap .rbc-time-content,
  .obc-wrap .rbc-time-header,
  .obc-wrap .rbc-time-header-content,
  .obc-wrap .rbc-time-gutter,
  .obc-wrap .rbc-timeslot-group,
  .obc-wrap .rbc-time-slot,
  .obc-wrap .rbc-agenda-table,
  .obc-wrap .rbc-agenda-date-cell,
  .obc-wrap .rbc-agenda-time-cell,
  .obc-wrap .rbc-agenda-event-cell {
    background: transparent !important;
    color: #a0a0b8 !important;
  }

  .obc-wrap .rbc-month-view {
    border: none !important;
    border-radius: 12px;
    overflow: hidden;
  }

  .obc-wrap .rbc-header {
    padding: 12px 0 !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 10px !important;
    letter-spacing: .1em !important;
    text-transform: uppercase !important;
    color: #6b6b82 !important;
    border-bottom: 1px solid rgba(255,255,255,.07) !important;
  }

  .obc-wrap .rbc-header + .rbc-header {
    border-left: 1px solid rgba(255,255,255,.06) !important;
  }

  .obc-wrap .rbc-day-bg + .rbc-day-bg {
    border-left: 1px solid rgba(255,255,255,.05) !important;
  }

  .obc-wrap .rbc-month-row + .rbc-month-row {
    border-top: 1px solid rgba(255,255,255,.05) !important;
  }

  .obc-wrap .rbc-off-range-bg {
    background: rgba(0,0,0,.2) !important;
  }

  .obc-wrap .rbc-off-range .rbc-button-link {
    color: #3a3a52 !important;
  }

  .obc-wrap .rbc-today {
    background: rgba(124,108,252,.1) !important;
  }

  .obc-wrap .rbc-date-cell {
    padding: 8px 10px 5px !important;
  }

  .obc-wrap .rbc-button-link {
    font-family: 'DM Mono', monospace !important;
    font-size: 12px !important;
    color: #8a8a9e !important;
    transition: color .15s !important;
  }

  .obc-wrap .rbc-date-cell.rbc-now .rbc-button-link {
    color: #9b8cff !important;
    font-weight: 700 !important;
  }

  .obc-wrap .rbc-day-bg { transition: background .15s !important; }
  .obc-wrap .rbc-day-bg:hover {
    background: rgba(124,108,252,.05) !important;
  }

  .obc-wrap .rbc-event {
    border: none !important;
    border-radius: 8px !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 10px !important;
    padding: 3px 8px !important;
    line-height: 1.35 !important;
  }

  .obc-wrap .rbc-event.rbc-selected {
    box-shadow: 0 0 0 2px rgba(124,108,252,.45) !important;
  }

  .obc-wrap .rbc-show-more {
    font-family: 'DM Mono', monospace !important;
    font-size: 10px !important;
    color: #9b8cff !important;
    background: transparent !important;
    font-weight: 500 !important;
  }

  .obc-wrap .rbc-time-header.rbc-overflowing {
    border-right: 1px solid rgba(255,255,255,.06) !important;
  }

  .obc-wrap .rbc-timeslot-group {
    border-bottom: 1px solid rgba(255,255,255,.04) !important;
    min-height: 38px !important;
  }

  .obc-wrap .rbc-time-slot {
    font-family: 'DM Mono', monospace !important;
    font-size: 10px !important;
    color: #4a4a62 !important;
  }

  .obc-wrap .rbc-current-time-indicator {
    background: linear-gradient(90deg, #7c6cfc, #2af5c0) !important;
    height: 2px !important;
  }

  .obc-wrap .rbc-current-time-indicator::before {
    background: #7c6cfc !important;
  }

  .obc-wrap .rbc-agenda-view table.rbc-agenda-table {
    border: none !important;
  }

  .obc-wrap .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
    border-left: 1px solid rgba(255,255,255,.06) !important;
    padding: 12px 14px !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 12px !important;
  }

  .obc-wrap .rbc-agenda-view table.rbc-agenda-table tbody > tr {
    border-bottom: 1px solid rgba(255,255,255,.04) !important;
  }

  .obc-wrap .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
    border-bottom: 1px solid rgba(255,255,255,.08) !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 10px !important;
    letter-spacing: .1em !important;
    color: #5a5a72 !important;
    padding: 11px 14px !important;
    background: transparent !important;
  }

  .obc-wrap .rbc-agenda-empty {
    font-family: 'DM Mono', monospace !important;
    font-size: 13px !important;
    color: #5a5a72 !important;
    padding: 48px 24px !important;
    text-align: center !important;
  }

  .obc-wrap .rbc-addons-dnd-drag-preview {
    opacity: .8 !important;
    border-radius: 8px !important;
  }
  .obc-wrap .rbc-addons-dnd-resizable-month-event-anchor {
    background: rgba(255,255,255,.25) !important;
  }
`;

const CAR_COLORS = ["#7c6cfc", "#2af5c0", "#f5a623", "#fc6c6c", "#60a5fa", "#a78bfa"];

function getCarColor(car) {
  if (!car) return CAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < car.length; i++) {
    hash = car.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CAR_COLORS[Math.abs(hash % CAR_COLORS.length)];
}

const STATUS_STYLE = {
  confirmed: { bg: "rgba(42,245,192,.12)", color: "#2af5c0", border: "rgba(42,245,192,.25)", label: "Confirmed" },
  pending: { bg: "rgba(245,166,35,.12)", color: "#f5a623", border: "rgba(245,166,35,.25)", label: "Pending" },
  rejected: { bg: "rgba(252,108,108,.12)", color: "#fc6c6c", border: "rgba(252,108,108,.25)", label: "Rejected" },
  default: { bg: "rgba(124,108,252,.12)", color: "#7c6cfc", border: "rgba(124,108,252,.25)", label: "Booked" },
};

function statusStyle(status) {
  return STATUS_STYLE[status] || STATUS_STYLE.default;
}

function CustomToolbar({ label, onNavigate, onView, view }) {
  return (
    <div className="obc-tb">
      <div className="obc-tb-nav">
        <button type="button" className="obc-tb-btn" onClick={() => onNavigate("PREV")}>
          ←
        </button>
        <button type="button" className="obc-tb-btn" onClick={() => onNavigate("TODAY")}>
          Today
        </button>
        <button type="button" className="obc-tb-btn" onClick={() => onNavigate("NEXT")}>
          →
        </button>
      </div>
      <span className="obc-tb-label">{label}</span>
      <div className="obc-tb-views">
        {["month", "week", "day", "agenda"].map((v) => (
          <button
            key={v}
            type="button"
            className={`obc-tb-view${view === v ? " on" : ""}`}
            onClick={() => onView(v)}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

const ICON_GRIP = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01" strokeLinecap="round" />
  </svg>
);

const ICON_CLOSE = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const DESKTOP_CAL_HEIGHT = 640;

export default function OwnerBookingCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    loadBookings();
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const loadBookings = async () => {
    const res = await getOwnerBookingsCalendar();
    setEvents(
      res.data.map((b) => ({
        id: b._id,
        title: b.rentalId?.title,
        start: new Date(b.startDate),
        end: new Date(b.endDate),
        status: b.status,
        car: b.rentalId?.title,
        booking: b,
      }))
    );
  };

  const updateStatus = async (id, status) => {
    await updateBookingStatus(id, status);
    setSelectedBooking(null);
    loadBookings();
  };

  const moveEvent = async ({ event, start, end }) => {
    await updateBookingDates(event.id, { startDate: start, endDate: end });
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, start, end } : e)));
  };

  const resizeEvent = async ({ event, start, end }) => {
    await updateBookingDates(event.id, { startDate: start, endDate: end });
    setEvents((prev) => prev.map((e) => (e.id === event.id ? { ...e, start, end } : e)));
  };

  const eventStyleGetter = (event) => {
    const color = getCarColor(event.car);
    return {
      style: {
        background: `${color}24`,
        border: `1px solid ${color}50`,
        borderLeft: `3px solid ${color}`,
        borderRadius: "8px",
        color,
        padding: "3px 8px",
        fontFamily: "'DM Mono',monospace",
        fontWeight: 500,
        fontSize: "10px",
        backdropFilter: "blur(6px)",
      },
    };
  };

  const dayEvents = events.filter((event) => {
    const s = new Date(date);
    s.setHours(0, 0, 0, 0);
    const e = new Date(date);
    e.setHours(23, 59, 59, 999);
    return event.start <= e && event.end >= s;
  });

  return (
    <>
      <style>{UI_STYLES}</style>
      <style>{CALENDAR_CSS}</style>

      <div className="obc-root">
        <div className="obc-meta">
          <div className="obc-meta-left">
            <span className="obc-pill">
              {ICON_GRIP}
              Drag to reschedule
            </span>
            <span className="obc-count">{events.length} booking{events.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="obc-legend">
            <span className="obc-leg">
              <span className="obc-leg-dot" style={{ color: "#2af5c0", background: "#2af5c0" }} />
              Confirmed
            </span>
            <span className="obc-leg">
              <span className="obc-leg-dot" style={{ color: "#f5a623", background: "#f5a623" }} />
              Pending
            </span>
            <span className="obc-leg">
              <span className="obc-leg-dot" style={{ color: "#fc6c6c", background: "#fc6c6c" }} />
              Rejected
            </span>
          </div>
        </div>

        {!isMobile && (
          <div className="obc-cal-surface">
            <div className="obc-cal-inner">
              <div className="obc-wrap" style={{ height: DESKTOP_CAL_HEIGHT }}>
                <DragCalendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  date={date}
                  view={view}
                  onNavigate={(d) => setDate(d)}
                  onView={(v) => setView(v)}
                  views={["month", "week", "day", "agenda"]}
                  style={{ height: "100%" }}
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={(ev) => setSelectedBooking(ev.booking)}
                  onEventDrop={moveEvent}
                  onEventResize={resizeEvent}
                  resizable
                  components={{ toolbar: (props) => <CustomToolbar {...props} view={view} /> }}
                />
              </div>
            </div>
          </div>
        )}

        {isMobile && (
          <div>
            <div className="obc-mobile-strip">
              {Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(date);
                d.setDate(date.getDate() - date.getDay() + i);
                const isSelected = d.toDateString() === date.toDateString();
                const hasEvents = events.some((ev) => {
                  const s = new Date(d);
                  s.setHours(0, 0, 0, 0);
                  const eod = new Date(d);
                  eod.setHours(23, 59, 59, 999);
                  return ev.start <= eod && ev.end >= s;
                });
                return (
                  <button
                    key={i}
                    type="button"
                    className={`obc-day-pill${isSelected ? " sel" : ""}`}
                    onClick={() => setDate(d)}
                  >
                    <span className="w">{d.toLocaleDateString("en", { weekday: "short" })}</span>
                    <span className="n">{d.getDate()}</span>
                    {hasEvents ? <span className="obc-day-dot" /> : <span style={{ height: 10 }} />}
                  </button>
                );
              })}
            </div>

            <div className="obc-mobile-list">
              {dayEvents.map((event) => {
                const color = getCarColor(event.car);
                const ss = statusStyle(event.status);
                return (
                  <div
                    key={event.id}
                    role="button"
                    tabIndex={0}
                    className="obc-m-card"
                    onClick={() => setSelectedBooking(event.booking)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedBooking(event.booking);
                      }
                    }}
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div className="obc-m-top">
                      <span className="obc-m-title">{event.title}</span>
                      <span
                        style={{
                          fontFamily: "'DM Mono',monospace",
                          fontSize: 10,
                          letterSpacing: ".07em",
                          textTransform: "uppercase",
                          background: ss.bg,
                          color: ss.color,
                          border: `1px solid ${ss.border}`,
                          borderRadius: 8,
                          padding: "3px 9px",
                        }}
                      >
                        {ss.label}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 11,
                        color: "#5a5a72",
                        margin: "8px 0 0",
                      }}
                    >
                      {new Date(event.start).toLocaleDateString()} → {new Date(event.end).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}

              {dayEvents.length === 0 && <div className="obc-m-empty">No bookings this day</div>}
            </div>
          </div>
        )}
      </div>

      {selectedBooking && (
        <div
          className="obc-modal-bg"
          onClick={(e) => e.target === e.currentTarget && setSelectedBooking(null)}
          role="presentation"
        >
          <div className="obc-modal" role="dialog" aria-modal="true" aria-labelledby="obc-modal-title">
            <button type="button" className="obc-modal-x" onClick={() => setSelectedBooking(null)} aria-label="Close">
              {ICON_CLOSE}
            </button>

            <p className="obc-modal-k">Booking details</p>
            <h2 id="obc-modal-title" className="obc-modal-h">
              {selectedBooking.rentalId?.title}
            </h2>

            {[
              { label: "Vehicle", value: selectedBooking.rentalId?.title },
              {
                label: "Dates",
                value: `${new Date(selectedBooking.startDate).toDateString()} → ${new Date(selectedBooking.endDate).toDateString()}`,
              },
              { label: "Customer", value: selectedBooking.customerId?.name },
              { label: "Phone", value: selectedBooking.customerId?.phone },
            ].map(({ label, value }) => (
              <div key={label} className="obc-modal-row">
                <span className="l">{label}</span>
                <span className="v">{value ?? "—"}</span>
              </div>
            ))}

            <div className="obc-modal-st">
              <span className="obc-modal-k" style={{ margin: 0 }}>
                Status
              </span>
              {(() => {
                const ss = statusStyle(selectedBooking.status);
                return (
                  <span
                    style={{
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 11,
                      letterSpacing: ".07em",
                      textTransform: "uppercase",
                      background: ss.bg,
                      color: ss.color,
                      border: `1px solid ${ss.border}`,
                      borderRadius: 8,
                      padding: "4px 11px",
                    }}
                  >
                    {ss.label}
                  </span>
                );
              })()}
            </div>

            {selectedBooking.status === "pending" && (
              <div className="obc-modal-actions">
                <button type="button" className="obc-btn obc-btn-ok" onClick={() => updateStatus(selectedBooking._id, "confirmed")}>
                  Accept
                </button>
                <button type="button" className="obc-btn obc-btn-no" onClick={() => updateStatus(selectedBooking._id, "rejected")}>
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
