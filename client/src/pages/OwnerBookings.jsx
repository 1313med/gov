import { useEffect, useState } from "react";
import {
  getOwnerBookings,
  updateBookingStatus,
  updateBookingDates,
} from "../api/booking";
import SellerLayout from "../components/seller/SellerLayout";
import "../styles/ownerCalendar.css";

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

export default function OwnerBookings() {

  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
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
    } catch {
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);

      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status } : b
        )
      );

      setSelectedBooking(null);
      loadBookings();
    } catch {
      alert("Failed to update booking");
    }
  };

  /* Car color generator */
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

  /* Event style */
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

  /* Drag booking → update DB */
  const moveEvent = async ({ event, start, end }) => {

    try {

      await updateBookingDates(event.id, {
        startDate: start,
        endDate: end
      });

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, start, end } : e
        )
      );

    } catch (err) {

      alert(
        err?.response?.data?.message ||
        "Failed to update booking dates"
      );

      loadBookings();
    }
  };

  /* Resize booking → update DB */
  const resizeEvent = async ({ event, start, end }) => {

    try {

      await updateBookingDates(event.id, {
        startDate: start,
        endDate: end
      });

      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, start, end } : e
        )
      );

    } catch (err) {

      alert(
        err?.response?.data?.message ||
        "Failed to update booking duration"
      );

      loadBookings();
    }
  };

  if (loading)
    return (
      <SellerLayout>
        <p>Loading bookings...</p>
      </SellerLayout>
    );

  return (
    <SellerLayout>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Booking Calendar
        </h1>

        <p className="text-sm text-gray-500">
          Drag or resize bookings to adjust dates
        </p>
      </div>

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

      </div>

      {/* Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl shadow-xl p-8 w-[400px]">

            <h2 className="text-xl font-bold mb-4">
              Booking Details
            </h2>

            <div className="space-y-2 text-sm">

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

              <p>
                <strong>Status:</strong>{" "}
                {selectedBooking.status}
              </p>

            </div>

            {selectedBooking.status === "pending" && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => updateStatus(selectedBooking._id, "confirmed")}
                  className="flex-1 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
                >
                  Accept
                </button>
                <button
                  onClick={() => updateStatus(selectedBooking._id, "rejected")}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}

            {selectedBooking.status === "confirmed" && (
              <div className="mt-6">
                <button
                  onClick={() => updateStatus(selectedBooking._id, "completed")}
                  className="w-full bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700"
                >
                  ✓ Mark as Completed
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedBooking(null)}
              className="mt-4 text-sm text-gray-500 hover:text-black"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </SellerLayout>
  );
}