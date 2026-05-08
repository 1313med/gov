import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import * as Notifications from "expo-notifications";
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
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }, []);

  useEffect(() => {
    if (!auth?._id) return;
    Notifications.requestPermissionsAsync().catch(() => {});
    Notifications.setNotificationChannelAsync("bookings", {
      name: "Bookings",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    }).catch(() => {});
  }, [auth?._id]);

  useEffect(() => {
    if (!auth?.token || !auth?._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(SERVER_URL, {
      transports: ["websocket"],
      auth: { token: auth.token },
      extraHeaders: { Authorization: `Bearer ${auth.token}` },
    });
    socketRef.current = socket;

    socket.on("notification", (n) => {
      setUnreadNotifications((prev) => prev + 1);
      setLiveNotification(n);
      setTimeout(() => setLiveNotification(null), 4000);
      const body = n?.message || "You have a new notification";
      Notifications.scheduleNotificationAsync({
        content: {
          title: "Goovoiture",
          body,
          sound: "default",
          data: { type: n?.type || "notification" },
        },
        trigger: null,
      }).catch(() => {});
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
