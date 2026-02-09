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

  useEffect(() => {
    const loadRental = async () => {
      try {
        const res = await api.get(`/rental/${id}`);
        setRental(res.data);
        setActiveImage(0);
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
      alert("Please select start and end dates");
      return;
    }

    try {
      setBookingLoading(true);

      await api.post(`/rental/${id}/book`, {
        startDate,
        endDate,
      });

      alert("✅ Booking confirmed!");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "❌ Car is not available for selected dates"
      );
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

            <button
              onClick={handleBooking}
              disabled={bookingLoading}
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
