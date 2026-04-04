import { useEffect, useState } from "react";
import {
  getOwnerBookings,
  updateBookingStatus,
  updateBookingDates,
} from "../../api/booking";

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

/* ─── Dark calendar CSS override ──────────────────────────────────────── */
const CALENDAR_CSS = `
  /* ── Kill all white backgrounds ── */
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
    border: 1px solid rgba(255,255,255,.06) !important;
    border-radius: 12px;
    overflow: hidden;
  }

  .obc-wrap .rbc-header {
    padding: 10px 0 !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 10px !important;
    letter-spacing: .1em !important;
    text-transform: uppercase !important;
    color: #5a5a72 !important;
    border-bottom: 1px solid rgba(255,255,255,.06) !important;
  }

  .obc-wrap .rbc-header + .rbc-header {
    border-left: 1px solid rgba(255,255,255,.06) !important;
  }

  .obc-wrap .rbc-day-bg + .rbc-day-bg {
    border-left: 1px solid rgba(255,255,255,.04) !important;
  }

  .obc-wrap .rbc-month-row + .rbc-month-row {
    border-top: 1px solid rgba(255,255,255,.04) !important;
  }

  .obc-wrap .rbc-off-range-bg {
    background: rgba(0,0,0,.18) !important;
  }

  .obc-wrap .rbc-off-range .rbc-button-link {
    color: #3a3a52 !important;
  }

  .obc-wrap .rbc-today {
    background: rgba(124,108,252,.08) !important;
  }

  .obc-wrap .rbc-date-cell {
    padding: 6px 8px 4px !important;
  }

  .obc-wrap .rbc-button-link {
    font-family: 'DM Mono', monospace !important;
    font-size: 12px !important;
    color: #6b6b82 !important;
  }

  .obc-wrap .rbc-date-cell.rbc-now .rbc-button-link {
    color: #7c6cfc !important;
    font-weight: 700 !important;
  }

  /* Events */
  .obc-wrap .rbc-event {
    border: none !important;
    border-radius: 6px !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 11px !important;
    padding: 2px 7px !important;
  }

  .obc-wrap .rbc-event.rbc-selected {
    box-shadow: 0 0 0 2px rgba(124,108,252,.5) !important;
  }

  .obc-wrap .rbc-show-more {
    font-family: 'DM Mono', monospace !important;
    font-size: 10px !important;
    color: #7c6cfc !important;
    background: transparent !important;
  }

  /* Time view */
  .obc-wrap .rbc-time-header.rbc-overflowing {
    border-right: 1px solid rgba(255,255,255,.06) !important;
  }

  .obc-wrap .rbc-timeslot-group {
    border-bottom: 1px solid rgba(255,255,255,.04) !important;
    min-height: 36px !important;
  }

  .obc-wrap .rbc-time-slot {
    font-family: 'DM Mono', monospace !important;
    font-size: 10px !important;
    color: #3a3a52 !important;
  }

  .obc-wrap .rbc-current-time-indicator {
    background: #7c6cfc !important;
    height: 2px !important;
  }

  .obc-wrap .rbc-current-time-indicator::before {
    background: #7c6cfc !important;
  }

  /* Agenda */
  .obc-wrap .rbc-agenda-view table.rbc-agenda-table {
    border: none !important;
  }

  .obc-wrap .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
    border-left: 1px solid rgba(255,255,255,.06) !important;
    padding: 10px 14px !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 12px !important;
  }

  .obc-wrap .rbc-agenda-view table.rbc-agenda-table tbody > tr {
    border-bottom: 1px solid rgba(255,255,255,.04) !important;
  }

  .obc-wrap .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
    border-bottom: 1px solid rgba(255,255,255,.06) !important;
    font-family: 'DM Mono', monospace !important;
    font-size: 10px !important;
    letter-spacing: .1em !important;
    color: #5a5a72 !important;
    padding: 10px 14px !important;
    background: transparent !important;
  }

  .obc-wrap .rbc-agenda-empty {
    font-family: 'DM Mono', monospace !important;
    font-size: 13px !important;
    color: #5a5a72 !important;
    padding: 40px !important;
    text-align: center !important;
  }

  /* DnD drag ghost */
  .obc-wrap .rbc-addons-dnd-drag-preview {
    opacity: .75 !important;
  }
  .obc-wrap .rbc-addons-dnd-resizable-month-event-anchor {
    background: rgba(255,255,255,.2) !important;
  }
`;

/* ─── Car color hash (same logic as original) ─────────────────────────── */
const CAR_COLORS = ["#7c6cfc","#2af5c0","#f5a623","#fc6c6c","#60a5fa","#a78bfa"];

function getCarColor(car) {
  if (!car) return CAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < car.length; i++) {
    hash = car.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CAR_COLORS[Math.abs(hash % CAR_COLORS.length)];
}

/* ─── Status badge config ──────────────────────────────────────────────── */
const STATUS_STYLE = {
  confirmed: { bg:"rgba(42,245,192,.12)", color:"#2af5c0", border:"rgba(42,245,192,.25)", label:"Confirmed" },
  pending:   { bg:"rgba(245,166,35,.12)",  color:"#f5a623", border:"rgba(245,166,35,.25)",  label:"Pending"   },
  rejected:  { bg:"rgba(252,108,108,.12)", color:"#fc6c6c", border:"rgba(252,108,108,.25)", label:"Rejected"  },
  default:   { bg:"rgba(124,108,252,.12)", color:"#7c6cfc", border:"rgba(124,108,252,.25)", label:"Booked"    },
};

function statusStyle(status) {
  return STATUS_STYLE[status] || STATUS_STYLE.default;
}

/* ─── Custom Toolbar ───────────────────────────────────────────────────── */
function CustomToolbar({ label, onNavigate, onView, view }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      marginBottom: 16,
      flexWrap: "wrap", gap: 10,
    }}>
      {/* Nav buttons */}
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        {[["PREV","←"],["TODAY","Today"],["NEXT","→"]].map(([action, lbl]) => (
          <button key={action} onClick={() => onNavigate(action)} style={{
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.09)",
            borderRadius: 8,
            color: "#a0a0b8",
            fontFamily: "'DM Mono',monospace",
            fontSize: 12,
            padding: "5px 12px",
            cursor: "pointer",
            transition: "background .15s, color .15s",
          }}
          onMouseEnter={e => { e.target.style.background="rgba(124,108,252,.15)"; e.target.style.color="#e8e8f0"; }}
          onMouseLeave={e => { e.target.style.background="rgba(255,255,255,.05)"; e.target.style.color="#a0a0b8"; }}
          >
            {lbl}
          </button>
        ))}
      </div>

      {/* Month label */}
      <span style={{
        fontFamily: "'Syne',sans-serif",
        fontSize: 16, fontWeight: 700,
        letterSpacing: "-.02em",
        color: "#e8e8f0",
      }}>
        {label}
      </span>

      {/* View switcher */}
      <div style={{ display:"flex", gap:4 }}>
        {["month","week","day","agenda"].map((v) => (
          <button key={v} onClick={() => onView(v)} style={{
            background: view === v ? "rgba(124,108,252,.2)" : "rgba(255,255,255,.04)",
            border: `1px solid ${view === v ? "rgba(124,108,252,.4)" : "rgba(255,255,255,.08)"}`,
            borderRadius: 7,
            color: view === v ? "#7c6cfc" : "#5a5a72",
            fontFamily: "'DM Mono',monospace",
            fontSize: 11,
            letterSpacing: ".06em",
            padding: "5px 11px",
            cursor: "pointer",
            textTransform: "capitalize",
            transition: "all .15s",
          }}>
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function OwnerBookingCalendar() {

  const [events,          setEvents         ] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [date,            setDate           ] = useState(new Date());
  const [view,            setView           ] = useState("month");
  const [isMobile,        setIsMobile       ] = useState(false);

  useEffect(() => {
    loadBookings();
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const loadBookings = async () => {
    const res = await getOwnerBookings();
    setEvents(res.data.map((b) => ({
      id:     b._id,
      title:  b.rentalId?.title,
      start:  new Date(b.startDate),
      end:    new Date(b.endDate),
      status: b.status,
      car:    b.rentalId?.title,
      booking: b,
    })));
  };

  const updateStatus = async (id, status) => {
    await updateBookingStatus(id, status);
    setSelectedBooking(null);
    loadBookings();
  };

  const moveEvent = async ({ event, start, end }) => {
    await updateBookingDates(event.id, { startDate: start, endDate: end });
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, start, end } : e));
  };

  const resizeEvent = async ({ event, start, end }) => {
    await updateBookingDates(event.id, { startDate: start, endDate: end });
    setEvents(prev => prev.map(e => e.id === event.id ? { ...e, start, end } : e));
  };

  const eventStyleGetter = (event) => {
    const color = getCarColor(event.car);
    return {
      style: {
        background: `${color}22`,
        border: `1px solid ${color}55`,
        borderLeft: `3px solid ${color}`,
        borderRadius: "6px",
        color: color,
        padding: "2px 7px",
        fontFamily: "'DM Mono',monospace",
        fontWeight: 500,
        fontSize: "11px",
        backdropFilter: "blur(4px)",
      }
    };
  };

  /* ── Day events for mobile ── */
  const dayEvents = events.filter(event => {
    const s = new Date(date); s.setHours(0,0,0,0);
    const e = new Date(date); e.setHours(23,59,59,999);
    return event.start <= e && event.end >= s;
  });

  return (
    <>
      <style>{CALENDAR_CSS}</style>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <div className="obc-wrap">

        {/* ── Header ── */}
        <div style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          marginBottom: 20,
        }}>
          <div>
            <span style={{
              fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:".12em",
              textTransform:"uppercase", color:"#5a5a72",
            }}>
              Schedule
            </span>
            <p style={{
              fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:700,
              letterSpacing:"-.025em", margin:"4px 0 0", color:"#e8e8f0",
            }}>
              Booking Calendar
            </p>
          </div>
          <span style={{
            fontFamily:"'DM Mono',monospace", fontSize:11,
            color:"#5a5a72",
            background:"rgba(255,255,255,.04)",
            border:"1px solid rgba(255,255,255,.07)",
            borderRadius:8, padding:"5px 11px",
          }}>
            ↕ Drag to reschedule
          </span>
        </div>

        {/* ── Desktop Calendar ── */}
        {!isMobile && (
          <div style={{ height: 600 }}>
            <DragCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              date={date}
              view={view}
              onNavigate={(d) => setDate(d)}
              onView={(v) => setView(v)}
              views={["month","week","day","agenda"]}
              style={{ height:"100%" }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={(event) => setSelectedBooking(event.booking)}
              onEventDrop={moveEvent}
              onEventResize={resizeEvent}
              resizable
              components={{ toolbar: (props) => <CustomToolbar {...props} view={view}/> }}
            />
          </div>
        )}

        {/* ── Mobile view ── */}
        {isMobile && (
          <div>
            {/* Week strip */}
            <div style={{ display:"flex", overflowX:"auto", gap:8, paddingBottom:16, marginBottom:16 }}>
              {Array.from({ length: 7 }).map((_,i) => {
                const d = new Date(date);
                d.setDate(date.getDate() - date.getDay() + i);
                const isSelected = d.toDateString() === date.toDateString();
                const hasEvents  = events.some(ev => {
                  const s = new Date(d); s.setHours(0,0,0,0);
                  const e = new Date(d); e.setHours(23,59,59,999);
                  return ev.start <= e && ev.end >= s;
                });
                return (
                  <button key={i} onClick={() => setDate(d)} style={{
                    display:"flex", flexDirection:"column", alignItems:"center",
                    minWidth:54, padding:"10px 6px",
                    borderRadius:12,
                    background: isSelected ? "rgba(124,108,252,.2)"  : "rgba(255,255,255,.04)",
                    border:     isSelected ? "1px solid rgba(124,108,252,.45)" : "1px solid rgba(255,255,255,.07)",
                    cursor:"pointer", position:"relative", transition:"all .15s",
                  }}>
                    <span style={{
                      fontFamily:"'DM Mono',monospace", fontSize:9,
                      letterSpacing:".08em", textTransform:"uppercase",
                      color: isSelected ? "#7c6cfc" : "#5a5a72",
                    }}>
                      {d.toLocaleDateString("en",{ weekday:"short" })}
                    </span>
                    <span style={{
                      fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:700,
                      color: isSelected ? "#e8e8f0" : "#6b6b82",
                      marginTop:3,
                    }}>
                      {d.getDate()}
                    </span>
                    {hasEvents && (
                      <span style={{
                        width:5, height:5, borderRadius:"50%",
                        background: isSelected ? "#7c6cfc" : "#5a5a72",
                        marginTop:4,
                        boxShadow: isSelected ? "0 0 6px #7c6cfc" : "none",
                      }}/>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Day bookings */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {dayEvents.map(event => {
                const color = getCarColor(event.car);
                const ss    = statusStyle(event.status);
                return (
                  <div key={event.id} onClick={() => setSelectedBooking(event.booking)} style={{
                    background:"rgba(255,255,255,.04)",
                    border:`1px solid rgba(255,255,255,.07)`,
                    borderLeft:`3px solid ${color}`,
                    borderRadius:12,
                    padding:"14px 16px",
                    cursor:"pointer",
                    transition:"border-color .2s, background .2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,.07)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,.04)"}
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <span style={{
                        fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#e8e8f0",
                      }}>
                        {event.title}
                      </span>
                      <span style={{
                        fontFamily:"'DM Mono',monospace", fontSize:10,
                        letterSpacing:".07em", textTransform:"uppercase",
                        background:ss.bg, color:ss.color,
                        border:`1px solid ${ss.border}`,
                        borderRadius:6, padding:"2px 8px",
                      }}>
                        {ss.label}
                      </span>
                    </div>
                    <p style={{
                      fontFamily:"'DM Mono',monospace", fontSize:11,
                      color:"#5a5a72", margin:"6px 0 0",
                    }}>
                      {new Date(event.start).toLocaleDateString()} → {new Date(event.end).toLocaleDateString()}
                    </p>
                  </div>
                );
              })}

              {dayEvents.length === 0 && (
                <div style={{
                  textAlign:"center", padding:"40px 0",
                  fontFamily:"'DM Mono',monospace", fontSize:12, color:"#3a3a52",
                }}>
                  No bookings this day
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Booking Detail Modal ── */}
      {selectedBooking && (
        <div
          onClick={(e) => e.target === e.currentTarget && setSelectedBooking(null)}
          style={{
            position:"fixed", inset:0,
            background:"rgba(0,0,0,.65)",
            backdropFilter:"blur(6px)",
            display:"flex", alignItems:"center", justifyContent:"center",
            zIndex:50,
          }}
        >
          <div style={{
            background:"#111118",
            border:"1px solid rgba(255,255,255,.1)",
            borderRadius:20,
            padding:"32px",
            width:440, maxWidth:"90vw",
            boxShadow:"0 24px 80px rgba(0,0,0,.6)",
            position:"relative",
          }}>
            {/* Close */}
            <button onClick={() => setSelectedBooking(null)} style={{
              position:"absolute", top:16, right:16,
              background:"rgba(255,255,255,.06)",
              border:"1px solid rgba(255,255,255,.1)",
              borderRadius:8, width:30, height:30,
              color:"#5a5a72", cursor:"pointer",
              fontFamily:"'DM Mono',monospace", fontSize:14,
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>✕</button>

            {/* Header */}
            <div style={{ marginBottom:24 }}>
              <span style={{
                fontFamily:"'DM Mono',monospace", fontSize:10,
                letterSpacing:".12em", textTransform:"uppercase", color:"#5a5a72",
              }}>
                Booking Details
              </span>
              <h2 style={{
                fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800,
                letterSpacing:"-.03em", margin:"6px 0 0", color:"#e8e8f0",
              }}>
                {selectedBooking.rentalId?.title}
              </h2>
            </div>

            {/* Info rows */}
            {[
              { label:"Car",      value: selectedBooking.rentalId?.title },
              { label:"Dates",    value: `${new Date(selectedBooking.startDate).toDateString()} → ${new Date(selectedBooking.endDate).toDateString()}` },
              { label:"Customer", value: selectedBooking.customerId?.name },
              { label:"Phone",    value: selectedBooking.customerId?.phone },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display:"flex", alignItems:"baseline", gap:12,
                padding:"10px 0",
                borderBottom:"1px solid rgba(255,255,255,.06)",
              }}>
                <span style={{
                  fontFamily:"'DM Mono',monospace", fontSize:10,
                  letterSpacing:".1em", textTransform:"uppercase",
                  color:"#5a5a72", width:72, flexShrink:0,
                }}>
                  {label}
                </span>
                <span style={{
                  fontFamily:"'DM Mono',monospace", fontSize:13,
                  color:"#c8c8d8", lineHeight:1.5,
                }}>
                  {value}
                </span>
              </div>
            ))}

            {/* Status badge */}
            <div style={{ margin:"16px 0 0", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{
                fontFamily:"'DM Mono',monospace", fontSize:10,
                letterSpacing:".1em", textTransform:"uppercase", color:"#5a5a72",
              }}>
                Status
              </span>
              {(() => {
                const ss = statusStyle(selectedBooking.status);
                return (
                  <span style={{
                    fontFamily:"'DM Mono',monospace", fontSize:11,
                    letterSpacing:".07em", textTransform:"uppercase",
                    background:ss.bg, color:ss.color,
                    border:`1px solid ${ss.border}`,
                    borderRadius:7, padding:"3px 10px",
                  }}>
                    {ss.label}
                  </span>
                );
              })()}
            </div>

            {/* Action buttons — only when pending */}
            {selectedBooking.status === "pending" && (
              <div style={{ display:"flex", gap:10, marginTop:24 }}>
                <button
                  onClick={() => updateStatus(selectedBooking._id, "confirmed")}
                  style={{
                    flex:1, padding:"11px 0",
                    background:"rgba(42,245,192,.12)",
                    border:"1px solid rgba(42,245,192,.3)",
                    borderRadius:11, color:"#2af5c0",
                    fontFamily:"'DM Mono',monospace", fontSize:12,
                    fontWeight:600, letterSpacing:".08em",
                    cursor:"pointer", transition:"all .15s",
                  }}
                  onMouseEnter={e => e.target.style.background="rgba(42,245,192,.22)"}
                  onMouseLeave={e => e.target.style.background="rgba(42,245,192,.12)"}
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => updateStatus(selectedBooking._id, "rejected")}
                  style={{
                    flex:1, padding:"11px 0",
                    background:"rgba(252,108,108,.12)",
                    border:"1px solid rgba(252,108,108,.3)",
                    borderRadius:11, color:"#fc6c6c",
                    fontFamily:"'DM Mono',monospace", fontSize:12,
                    fontWeight:600, letterSpacing:".08em",
                    cursor:"pointer", transition:"all .15s",
                  }}
                  onMouseEnter={e => e.target.style.background="rgba(252,108,108,.22)"}
                  onMouseLeave={e => e.target.style.background="rgba(252,108,108,.12)"}
                >
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
