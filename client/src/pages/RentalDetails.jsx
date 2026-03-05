import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";

export default function RentalDetails() {
  const { id } = useParams();

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Booking state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  // 🔹 Booked periods
  const [bookedDates, setBookedDates] = useState([]);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diff =
      (end.getTime() - start.getTime()) /
      (1000 * 60 * 60 * 24);

    return diff > 0 ? diff : 0;
  };

  const days = calculateDays();

  const totalPrice =
    rental && days > 0 ? days * rental.pricePerDay : 0;

  // 🔹 Check if selected dates overlap with confirmed bookings
  const isDateConflict = () => {
    if (!startDate || !endDate) return false;

    const start = new Date(startDate);
    const end = new Date(endDate);

    return bookedDates.some((booking) => {
      const bookedStart = new Date(booking.startDate);
      const bookedEnd = new Date(booking.endDate);

      return start < bookedEnd && end > bookedStart;
    });
  };

  const hasConflict = isDateConflict();

  useEffect(() => {
    const loadRental = async () => {
      try {
        const res = await api.get(`/rental/${id}`);
        setRental(res.data);
        setActiveImage(0);

        const bookingsRes = await api.get(`/rental/${id}/bookings`);

        const confirmed = bookingsRes.data.filter(
          (b) => b.status === "confirmed"
        );

        setBookedDates(confirmed);
      } catch {
        setRental(null);
      } finally {
        setLoading(false);
      }
    };

    loadRental();
  }, [id]);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!rental) return <p className="p-6 text-red-600">Rental not found</p>;

  const images = rental.images || [];

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setBookingMessage({
        type: "error",
        text: "Please select start and end dates",
      });
      return;
    }

    if (hasConflict) {
      setBookingMessage({
        type: "error",
        text: "Car already booked during these dates",
      });
      return;
    }

    try {
      setBookingLoading(true);

      await api.post(`/rental/${id}/book`, {
        startDate,
        endDate,
      });

      setBookingMessage({
        type: "success",
        text: "Booking request sent! Waiting for owner confirmation.",
      });
    } catch (err) {
  if (err?.response?.status === 403 || err?.response?.status === 401) {
    setBookingMessage({
      type: "error",
      text: "Please create an account or login to book this car.",
    });
    return;
  }

  setBookingMessage({
    type: "error",
    text:
      err?.response?.data?.message ||
      "Car is not available for selected dates",
  });
} finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 grid lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* Image */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                className="w-full h-[400px] object-cover"
                alt={rental.title}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">
              Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Spec label="Brand" value={rental.brand} />
              <Spec label="Model" value={rental.model} />
              <Spec label="Year" value={rental.year} />
              <Spec label="Fuel" value={rental.fuel} />
              <Spec label="Gearbox" value={rental.gearbox} />
              <Spec label="City" value={rental.city} />
            </div>
          </div>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* Price */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h1 className="text-2xl font-bold">
              {rental.title}
            </h1>

            <p className="text-3xl font-extrabold mt-2">
              {rental.pricePerDay} MAD / day
            </p>
          </div>

          {/* Booking */}
          <div className="bg-white p-6 rounded-2xl shadow space-y-4">
            <h2 className="text-lg font-semibold">
              Book this car
            </h2>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-xl p-3"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-xl p-3"
            />

            {days > 0 && (
              <div className="border rounded-xl p-4 bg-gray-50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Price per day</span>
                  <span>{rental.pricePerDay} MAD</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Days</span>
                  <span>{days}</span>
                </div>

                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{totalPrice} MAD</span>
                </div>
              </div>
            )}

            {/* Conflict message */}
            {hasConflict && (
              <div className="p-3 rounded-xl bg-red-100 text-red-700 text-sm">
                Car already booked during these dates
              </div>
            )}

            {/* Booking message */}
            {bookingMessage && (
  <div
    className={`p-3 rounded-xl text-sm font-medium space-y-2 ${
      bookingMessage.type === "success"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
    }`}
  >
    <p>{bookingMessage.text}</p>

    {/* Show login button if user not authenticated */}
    {bookingMessage.text.includes("login") && (
      <Link
        to="/login"
        className="text-blue-600 underline text-sm"
      >
        Login now
      </Link>
    )}
  </div>
)}

            <button
              onClick={handleBooking}
              disabled={bookingLoading || days === 0 || hasConflict}
              className="w-full py-3 bg-black text-white rounded-xl disabled:opacity-50"
            >
              {bookingLoading ? "Booking..." : "Book now"}
            </button>

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <Link
          to="/rentals"
          className="text-blue-600 hover:underline"
        >
          ← Back to rentals
        </Link>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="border rounded-xl p-3 bg-gray-50">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value || "-"}</p>
    </div>
  );
}