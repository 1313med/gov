import { useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

/**
 * Bell icon for screen headers — badge from socket + refresh on focus.
 */
export default function NotificationHeaderButton({
  size = 40,
  iconColor,
  borderColor,
  backgroundColor,
  badgeColor = "#ef4444",
}) {
  const router = useRouter();
  const { isDark } = useTheme();
  const { unreadNotifications, refreshUnreadCount } = useSocket();
  const titleColor = iconColor ?? (isDark ? "#f8fafc" : "#0f172a");

  useFocusEffect(
    useCallback(() => {
      refreshUnreadCount?.();
    }, [refreshUnreadCount]),
  );

  const border =
    borderColor ?? (isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)");
  const bg =
    backgroundColor ?? (isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)");

  return (
    <TouchableOpacity
      onPress={() => router.push("/notifications")}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      style={[
        styles.btn,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: border,
          backgroundColor: bg,
        },
      ]}
    >
      <Ionicons name="notifications-outline" size={size >= 44 ? 20 : 18} color={titleColor} />
      {unreadNotifications > 0 ? (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor,
              borderColor: isDark ? "#0f172a" : "#fff",
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {unreadNotifications > 99 ? "99+" : unreadNotifications}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 2,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
});
