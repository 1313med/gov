import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { SERVER_URL } from "../config";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { auth } = useAuth();
  const socketRef = useRef(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [liveNotification, setLiveNotification] = useState(null);

  useEffect(() => {
    if (!auth?.token || !auth?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SERVER_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", auth._id);
    });

    socket.on("notification", (n) => {
      setUnreadNotifications((prev) => prev + 1);
      setLiveNotification(n);
      setTimeout(() => setLiveNotification(null), 4000);
    });

    socket.on("new_message", () => {
      setUnreadMessages((prev) => prev + 1);
    });

    return () => socket.disconnect();
  }, [auth]);

  const clearNotificationBadge = () => setUnreadNotifications(0);
  const clearMessageBadge = () => setUnreadMessages(0);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        unreadNotifications,
        unreadMessages,
        liveNotification,
        clearNotificationBadge,
        clearMessageBadge,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
