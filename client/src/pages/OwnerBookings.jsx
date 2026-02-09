import { useEffect, useState } from "react";
import {
  getOwnerBookings,
  updateBookingStatus,
} from "../api/booking";
import SellerLayout from "../components/seller/SellerLayout";

const badgeStyle = (status) => {
  if (status === "confirmed")
    return "bg-green-100 text-green-700";
  if (status === "rejected")
    return "bg-red-100 text-red-700";
  return "bg-orange-100 text-orange-700";
};

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnerBookings()
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === id ? { ...b, status } : b
        )
      );
    } catch {
      alert("Failed to update booking");
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
      <h1 className="text-3xl font-bold mb-6">
        Booking Requests
      </h1>

      {bookings.length === 0 && (
        <p className="text-gray-600">
          No booking requests yet.
        </p>
      )}

      <div className="space-y-4">
       {bookings.map((b) => {
  const status = (b.status || "").toLowerCase();

  return (
    <div
      key={b._id}
      className="bg-white rounded-2xl p-6 shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold text-lg">
            {b.rentalId?.title}
          </h2>

          <p className="text-sm text-gray-600">
            {new Date(b.startDate).toDateString()} →{" "}
            {new Date(b.endDate).toDateString()}
          </p>

          <p className="text-sm mt-2">
            Customer:{" "}
            <strong>{b.customerId?.name}</strong>{" "}
            ({b.customerId?.phone})
          </p>
        </div>

        {/* STATUS BADGE */}
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            status === "confirmed"
              ? "bg-green-100 text-green-700"
              : status === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {status}
        </span>
      </div>

      {/* ACTIONS */}
      {status === "pending" && (
        <div className="flex gap-3 mt-4">
          <button
            onClick={() =>
              updateStatus(b._id, "confirmed")
            }
            className="px-4 py-2 bg-green-600 text-white rounded-xl"
          >
            Accept
          </button>

          <button
            onClick={() =>
              updateStatus(b._id, "rejected")
            }
            className="px-4 py-2 bg-red-600 text-white rounded-xl"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
})}

      </div>
    </SellerLayout>
  );
}
