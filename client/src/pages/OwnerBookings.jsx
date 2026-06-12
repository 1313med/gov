import { useEffect, useState } from "react";
import {
  updateBookingStatus,
  updateBookingDates,
  markBookingPaid,
} from "../api/booking";
import { getOwnerBookingsCalendar } from "../api/rental";
import OwnerLayout from "../components/owner/OwnerLayout";
import { useAppLang } from "../context/AppLangContext";
import "../styles/ownerCalendar.css";

const PAGE_CSS = `
  .ob-page {
    padding: clamp(16px, 4vw, 32px) clamp(14px, 3.5vw, 32px) clamp(24px, 4vw, 40px);
    max-width: 100%;
    box-sizing: border-box;
  }
  .ob-head {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: clamp(16px, 4vw, 28px);
  }
  @media (min-width: 640px) {
    .ob-head {
      flex-direction: row;
      align-items: flex-end;
      justify-content: space-between;
    }
  }
  .ob-title {
    font-size: clamp(22px, 5.5vw, 30px);
    font-weight: 800;
    letter-spacing: -0.03em;
    margin: 0;
  }
  .ob-calendar-wrap {
    background: var(--ob-card, #fff);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08);
    padding: clamp(12px, 3vw, 24px);
    margin-bottom: 24px;
    height: clamp(420px, 62vh, 680px);
    border: 1px solid rgba(15, 23, 42, 0.08);
    overflow: hidden;
  }
  html.dark .ob-calendar-wrap {
    --ob-card: #0f172a;
    border-color: rgba(255, 255, 255, 0.08);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  }
  .ob-modal-panel {
    width: min(400px, calc(100vw - 32px));
    max-height: min(88vh, 640px);
    overflow-y: auto;
    margin: 16px;
  }
`;

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
import fr from "date-fns/locale/fr";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

const DragCalendar = withDragAndDrop(Calendar);

const locales = {
  "en-US": enUS,
  fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function OwnerBookings() {
  const { copy, lang } = useAppLang();
  const t = copy.ownerBookings;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";
  const numLocale = lang === "fr" ? "fr-FR" : "en-US";

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
      const res = await getOwnerBookingsCalendar();
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
      alert(t.loadFail);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setSelectedBooking(null);
      loadBookings();
    } catch {
      alert(t.updateFail);
    }
  };

  const togglePaid = async (booking) => {
    try {
      const res = await markBookingPaid(booking._id);
      setSelectedBooking(res.data);
      loadBookings();
    } catch {
      alert(t.paymentFail);
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
        t.datesUpdateFail
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
        t.durationUpdateFail
      );

      loadBookings();
    }
  };

  if (loading)
    return (
      <OwnerLayout>
        <p className="text-slate-600 dark:text-slate-400">{t.loading}</p>
      </OwnerLayout>
    );

  return (
    <OwnerLayout>
      <style>{PAGE_CSS}</style>
      <div className="ob-page">
      <div className="ob-head">
        <h1 className="ob-title text-slate-900 dark:text-white">
          {t.pageTitle}
        </h1>

        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t.pageSub}
        </p>
      </div>

      <div className="ob-calendar-wrap">

        <DragCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={date}
          view={view}
          culture={lang === "fr" ? "fr" : "en-US"}
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

          <div className="ob-modal-panel bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-700">

            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
              {t.modalTitle}
            </h2>

            <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">

              <p>
                <strong>{t.car}:</strong>{" "}
                {selectedBooking.rentalId?.title}
              </p>

              <p>
                <strong>{t.dates}:</strong>{" "}
                {new Date(selectedBooking.startDate).toLocaleDateString(dateLocale)}
                {" → "}
                {new Date(selectedBooking.endDate).toLocaleDateString(dateLocale)}
              </p>

              <p>
                <strong>{t.customer}:</strong>{" "}
                {selectedBooking.customerId?.name}
              </p>

              <p>
                <strong>{t.phone}:</strong>{" "}
                {selectedBooking.customerId?.phone}
              </p>

              <p>
                <strong>{t.email}:</strong>{" "}
                {selectedBooking.customerId?.email || t.none}
              </p>

              <p>
                <strong>{t.status}:</strong>{" "}
                {copy.myBookings.status[selectedBooking.status] || selectedBooking.status}
              </p>

              <p>
                <strong>{t.amount}:</strong>{" "}
                {selectedBooking.totalAmount != null
                  ? `${Number(selectedBooking.totalAmount).toLocaleString(numLocale)} MAD`
                  : t.none}
              </p>

              <p>
                <strong>{t.payment}:</strong>{" "}
                <span style={{ color: selectedBooking.isPaid ? "#34d399" : "#f5a623" }}>
                  {selectedBooking.isPaid ? `${t.paid}${selectedBooking.paidAt ? ` ${t.paidOn} ${new Date(selectedBooking.paidAt).toLocaleDateString(dateLocale)}` : ""}` : t.unpaid}
                </span>
              </p>

            </div>

            {selectedBooking.status === "pending" && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => updateStatus(selectedBooking._id, "confirmed")}
                  className="flex-1 bg-green-600 text-white py-2 rounded-xl hover:bg-green-700"
                >
                  {t.accept}
                </button>
                <button
                  onClick={() => updateStatus(selectedBooking._id, "rejected")}
                  className="flex-1 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700"
                >
                  {t.reject}
                </button>
              </div>
            )}

            {selectedBooking.status === "confirmed" && (
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => updateStatus(selectedBooking._id, "completed")}
                  className="w-full bg-purple-600 text-white py-2 rounded-xl hover:bg-purple-700"
                >
                  {t.markCompleted}
                </button>
                <button
                  onClick={() => togglePaid(selectedBooking)}
                  className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedBooking.isPaid
                      ? "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {selectedBooking.isPaid ? t.markUnpaid : t.markPaid}
                </button>
              </div>
            )}

            <button
              onClick={() => setSelectedBooking(null)}
              className="mt-4 text-sm text-gray-500 dark:text-slate-400 hover:text-black dark:hover:text-white"
            >
              {t.close}
            </button>

          </div>

        </div>
      )}
      </div>
    </OwnerLayout>
  );
}