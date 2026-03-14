import { useEffect, useState } from "react";
import {
  getOwnerBookings,
  updateBookingStatus,
  updateBookingDates,
} from "../../api/booking";

import {
  Calendar,
  dateFnsLocalizer
} from "react-big-calendar";

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

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function OwnerBookingCalendar() {

  const [events, setEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {

    loadBookings();

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);

  }, []);

  const loadBookings = async () => {

    const res = await getOwnerBookings();

    const calendarEvents = res.data.map((b) => ({
      id: b._id,
      title: b.rentalId?.title,
      start: new Date(b.startDate),
      end: new Date(b.endDate),
      status: b.status,
      car: b.rentalId?.title,
      booking: b,
    }));

    setEvents(calendarEvents);
  };

  const updateStatus = async (id, status) => {

    await updateBookingStatus(id, status);

    setSelectedBooking(null);

    loadBookings();
  };

  const moveEvent = async ({ event, start, end }) => {

    await updateBookingDates(event.id, {
      startDate: start,
      endDate: end
    });

    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id ? { ...e, start, end } : e
      )
    );
  };

  const resizeEvent = async ({ event, start, end }) => {

    await updateBookingDates(event.id, {
      startDate: start,
      endDate: end
    });

    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id ? { ...e, start, end } : e
      )
    );
  };

  const getCarColor = (car) => {

    const colors = [
      "#6366f1",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#06b6d4",
      "#8b5cf6",
    ];

    let hash = 0;

    for (let i = 0; i < car.length; i++) {
      hash = car.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash % colors.length);

    return colors[index];
  };

  const eventStyleGetter = (event) => {

    const color = getCarColor(event.car);

    return {
      style: {
        background: color,
        borderRadius: "10px",
        border: "none",
        color: "white",
        padding: "6px 10px",
        fontWeight: "500",
        fontSize: "13px",
      }
    };
  };

  const CustomToolbar = ({ label, onNavigate, onView }) => (

    <div className="flex items-center justify-between mb-4">

      <div className="flex items-center gap-2">

        <button
          onClick={() => onNavigate("PREV")}
          className="px-3 py-1 border rounded-lg hover:bg-gray-100"
        >
          ←
        </button>

        <button
          onClick={() => onNavigate("TODAY")}
          className="px-3 py-1 border rounded-lg hover:bg-gray-100"
        >
          Today
        </button>

        <button
          onClick={() => onNavigate("NEXT")}
          className="px-3 py-1 border rounded-lg hover:bg-gray-100"
        >
          →
        </button>

      </div>

      <h2 className="text-lg font-semibold">{label}</h2>

      <div className="flex gap-2">

        {["month","week","day","agenda"].map((v)=>(
          <button
            key={v}
            onClick={()=>onView(v)}
            className="px-3 py-1 border rounded-lg hover:bg-gray-100"
          >
            {v}
          </button>
        ))}

      </div>

    </div>

  );

  return (

    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">

      <div className="flex items-center justify-between mb-4">

        <h2 className="text-lg font-semibold">
          Booking Calendar
        </h2>

        <span className="text-sm text-gray-400">
          Drag bookings to reschedule
        </span>

      </div>

      {/* Desktop Calendar */}

      {!isMobile && (

        <div className="h-[620px]">

          <DragCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={date}
            view={view}
            onNavigate={(newDate) => setDate(newDate)}
            onView={(newView) => setView(newView)}
            views={["month", "week", "day", "agenda"]}
            style={{ height: "100%" }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedBooking(event.booking)}
            onEventDrop={moveEvent}
            onEventResize={resizeEvent}
            resizable
            components={{ toolbar: CustomToolbar }}
          />

        </div>

      )}

      {/* MOBILE AIRBNB STYLE CALENDAR */}

      {isMobile && (

        <div>

          {/* WEEK SELECTOR */}

          <div className="flex overflow-x-auto gap-2 pb-4 mb-4">

            {Array.from({ length: 7 }).map((_,i)=>{

              const d = new Date(date);
              d.setDate(date.getDate() - date.getDay() + i);

              const isSelected =
                d.toDateString() === date.toDateString();

              return(

                <button
                  key={i}
                  onClick={()=>setDate(d)}
                  className={`flex flex-col items-center min-w-[60px] py-2 rounded-xl border transition
                  ${isSelected
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white border-gray-200"
                  }`}
                >

                  <span className="text-xs">
                    {d.toLocaleDateString("en",{weekday:"short"})}
                  </span>

                  <span className="text-sm font-semibold">
                    {d.getDate()}
                  </span>

                </button>

              );

            })}

          </div>


          {/* BOOKINGS OF SELECTED DAY */}

          <div className="space-y-3">

            {events
            .filter(event => {

              const dayStart = new Date(date);
              dayStart.setHours(0,0,0,0);

              const dayEnd = new Date(date);
              dayEnd.setHours(23,59,59,999);

              return (
                event.start <= dayEnd &&
                event.end >= dayStart
              );

            })
            .map(event => (

              <div
                key={event.id}
                onClick={()=>setSelectedBooking(event.booking)}
                className="bg-white border rounded-xl p-4 shadow-sm"
              >

                <div className="flex justify-between items-center">

                  <h3 className="font-semibold">
                    {event.title}
                  </h3>

                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background:getCarColor(event.car),
                      color:"white"
                    }}
                  >
                    booked
                  </span>

                </div>

                <p className="text-sm text-gray-500 mt-1">

                  {new Date(event.start).toLocaleDateString()}
                  {" → "}
                  {new Date(event.end).toLocaleDateString()}

                </p>

              </div>

            ))}

            {events.filter(event => {

              const dayStart = new Date(date);
              dayStart.setHours(0,0,0,0);

              const dayEnd = new Date(date);
              dayEnd.setHours(23,59,59,999);

              return (
                event.start <= dayEnd &&
                event.end >= dayStart
              );

            }).length === 0 && (

              <div className="text-center text-gray-400 py-10">
                No bookings this day
              </div>

            )}

          </div>

        </div>

      )}

      {/* MODAL */}

      {selectedBooking && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-xl p-8 w-[420px]">

            <h2 className="text-lg font-semibold mb-4">
              Booking Details
            </h2>

            <p><strong>Car:</strong> {selectedBooking.rentalId?.title}</p>

            <p>
              <strong>Dates:</strong>{" "}
              {new Date(selectedBooking.startDate).toDateString()}
              {" → "}
              {new Date(selectedBooking.endDate).toDateString()}
            </p>

            <p>
              <strong>Customer:</strong>{" "}
              {selectedBooking.customerId?.name}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {selectedBooking.customerId?.phone}
            </p>

            {selectedBooking.status === "pending" && (

              <div className="flex gap-3 mt-6">

                <button
                  onClick={() =>
                    updateStatus(selectedBooking._id, "confirmed")
                  }
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg"
                >
                  Accept
                </button>

                <button
                  onClick={() =>
                    updateStatus(selectedBooking._id, "rejected")
                  }
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg"
                >
                  Reject
                </button>

              </div>

            )}

            <button
              onClick={() => setSelectedBooking(null)}
              className="mt-4 text-sm text-gray-500"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  );

}