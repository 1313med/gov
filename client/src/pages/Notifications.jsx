import { useEffect, useState } from "react";
import SellerLayout from "../components/seller/SellerLayout";
import { getNotifications, markAsRead } from "../api/notification";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleRead = async (id) => {
    await markAsRead(id);

    setItems((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <SellerLayout>
      <h1 className="text-2xl font-bold mb-6">
        Notifications
      </h1>

      {loading && (
        <div className="bg-white p-6 rounded-xl border shadow">
          Loading notifications...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="bg-white p-6 rounded-xl border shadow">
          No notifications yet.
        </div>
      )}

      <div className="space-y-4">
        {items.map((n) => (
          <div
            key={n._id}
            className={`p-5 rounded-xl border shadow bg-white transition ${
              n.read ? "opacity-60" : "border-blue-400"
            }`}
          >
            <p className="font-medium">{n.message}</p>

            <p className="text-xs text-gray-500 mt-2">
              {new Date(n.createdAt).toLocaleString()}
            </p>

            {!n.read && (
              <button
                onClick={() => handleRead(n._id)}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </SellerLayout>
  );
}
