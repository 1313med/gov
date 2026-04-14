import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { loadAuth } from "../utils/authStorage";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [liveNotification, setLiveNotification] = useState(null);

  useEffect(() => {
    const auth = loadAuth();
    if (!auth?._id) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    // Join personal room
    socket.on("connect", () => {
      socket.emit("join", auth._id);
    });

    // Real-time notification badge
    socket.on("notification", (n) => {
      setUnreadNotifications((prev) => prev + 1);
      setLiveNotification(n);
      // Auto-clear toast after 4s
      setTimeout(() => setLiveNotification(null), 4000);
    });

    // Real-time message badge
    socket.on("new_message", () => {
      setUnreadMessages((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  const clearNotificationBadge = () => setUnreadNotifications(0);
  const clearMessageBadge = () => setUnreadMessages(0);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      unreadNotifications,
      unreadMessages,
      liveNotification,
      clearNotificationBadge,
      clearMessageBadge,
    }}>
      {children}

      {/* Global live notification toast */}
      {liveNotification && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: "#141412", color: "#f9f7f4",
          padding: "14px 20px", borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          fontFamily: "sans-serif", fontSize: 13,
          maxWidth: 320, lineHeight: 1.5,
          animation: "slideIn 0.3s ease",
        }}>
          <style>{`@keyframes slideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
          <strong style={{ display: "block", marginBottom: 4 }}>New notification</strong>
          {liveNotification.message}
        </div>
      )}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
