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

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function OwnerBookingCalendar() {

  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {

    const res = await getOwnerBookings();

    setBookings(res.data);

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

  const getCarColor = (car) => {

    const colors = [
      "#60a5fa",
      "#34d399",
      "#c084fc",
      "#fb923c",
      "#f87171",
      "#22d3ee",
    ];

    let hash = 0;

    for (let i = 0; i < car.length; i++) {
      hash = car.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash % colors.length);

    return colors[index];
  };

  const eventStyleGetter = (event) => {

    const backgroundColor = getCarColor(event.car);

    return {
      style: {
        backgroundColor,
        borderRadius: "10px",
        border: "none",
        color: "white",
        padding: "5px 8px",
        fontWeight: "500",
      },
    };
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

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 mb-10 h-[680px] border border-gray-100">

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
      />

      {selectedBooking && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-xl p-8 w-[400px]">

            <h2 className="text-xl font-bold mb-4">
              Booking Details
            </h2>

            <p>
              <strong>Car:</strong>{" "}
              {selectedBooking.rentalId?.title}
            </p>

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
                  className="flex-1 bg-green-600 text-white py-2 rounded-xl"
                >
                  Accept
                </button>

                <button
                  onClick={() =>
                    updateStatus(selectedBooking._id, "rejected")
                  }
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl"
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