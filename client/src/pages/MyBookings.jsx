import { useEffect, useState } from "react";
import { getMyBookings } from "../api/booking";
import { Link } from "react-router-dom";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        My Bookings
      </h1>

      {bookings.length === 0 && (
        <p className="text-gray-600">
          You have no bookings yet.
        </p>
      )}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="bg-white rounded-2xl p-6 shadow"
          >
            <h2 className="font-semibold text-lg">
              {b.rentalId?.title}
            </h2>

            <p className="text-sm text-gray-600">
              {new Date(b.startDate).toDateString()} →{" "}
              {new Date(b.endDate).toDateString()}
            </p>

            <p className="mt-2 font-medium">
              Status:{" "}
              <span className="capitalize">
                {b.status}
              </span>
            </p>

            <Link
              to={`/rentals/${b.rentalId?._id}`}
              className="text-blue-600 hover:underline text-sm mt-2 inline-block"
            >
              View rental
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
