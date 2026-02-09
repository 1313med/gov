import { useEffect, useState } from "react";
import SellerLayout from "../components/seller/SellerLayout";
import { api } from "../api/axios";

export default function MyRentals() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/rental/owner/bookings");
        setBookings(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <SellerLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold">My Rental Bookings</h1>
        <p className="text-gray-600 mt-1">
          Track who booked your cars and when
        </p>
      </div>

      {loading && (
        <div className="bg-white p-6 rounded-xl shadow">
          Loading bookings...
        </div>
      )}

      {error && (
        <div className="bg-white p-6 rounded-xl shadow text-red-600">
          {error}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <p className="text-xl font-semibold">No bookings yet</p>
          <p className="text-gray-600 mt-2">
            Your rentals haven’t been booked yet
          </p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="grid gap-6">
          {bookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-2xl border shadow-sm p-6"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {b.rentalId?.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {b.rentalId?.city} • {b.rentalId?.pricePerDay} MAD / day
                  </p>
                </div>

                <div className="text-sm">
                  <p>
                    <strong>From:</strong>{" "}
                    {new Date(b.startDate).toDateString()}
                  </p>
                  <p>
                    <strong>To:</strong>{" "}
                    {new Date(b.endDate).toDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-700">
                <strong>Customer:</strong> {b.customerId?.name} (
                {b.customerId?.phone})
              </div>
            </div>
          ))}
        </div>
      )}
    </SellerLayout>
  );
}
