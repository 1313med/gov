import { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getNotifications, markAsRead } from "../src/api/notification";
import { useSocket } from "../src/context/SocketContext";
import { useAppLang } from "../src/context/AppLangContext";
import { useTheme } from "../src/context/ThemeContext";

function timeAgo(date, fr) {
  const mins = Math.floor((Date.now() - new Date(date)) / 60000);
  const h = Math.floor(mins / 60);
  const d = Math.floor(h / 24);
  if (fr) {
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    if (h < 24) return `Il y a ${h} h`;
    return `Il y a ${d} j`;
  }
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

export default function NotificationsScreen() {
  const { clearNotificationBadge } = useSocket();
  const { lang } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";

  const ICONS = useMemo(
    () => ({
      booking: ["calendar", C.primary],
      message: ["chatbubble", C.accent],
      approval: ["checkmark-circle", C.green],
      rejection: ["close-circle", C.red],
      default: ["notifications", C.primary],
    }),
    [C],
  );

  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const listFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(16)).current;

  const load = async () => {
    try {
      const { data } = await getNotifications();
      setNotifs(data);
      clearNotificationBadge();
    } catch {
      /* silent */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (loading) return;
    listFade.setValue(0);
    heroSlide.setValue(16);
    Animated.parallel([
      Animated.timing(listFade, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(heroSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [loading, listFade, heroSlide]);

  const read = async (n) => {
    if (n.read) return;
    try {
      await markAsRead(n._id);
      setNotifs((p) => p.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    } catch {
      /* silent */
    }
  };

  const unreadCount = useMemo(() => notifs.filter((n) => !n.read).length, [notifs]);

  const bannerGrad = isDark
    ? ["#0a0618", "#15102a", "#0c1224"]
    : ["#f5f3ff", "#ecfeff", "#f8fafc"];
  const accentGrad = isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"];
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#64748b";

  const s = useMemo(() => createNotificationsStyles(C, isDark), [C, isDark]);

  if (loading) {
    return (
      <View style={[s.loaderScreen, { backgroundColor: C.bg }]}>
        <LinearGradient
          colors={isDark ? ["rgba(124,107,255,0.2)", "transparent"] : ["rgba(98,72,232,0.12)", "transparent"]}
          style={s.loaderGlow}
        />
        <View style={s.loaderRing}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
        <Text style={[s.loaderText, { color: subColor }]}>
          {fr ? "Synchronisation…" : "Syncing your inbox…"}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        data={notifs}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 28,
          paddingTop: 8,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />
        }
        ListHeaderComponent={
          <Animated.View style={{ opacity: listFade, transform: [{ translateY: heroSlide }] }}>
            <LinearGradient colors={bannerGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
              <View style={s.heroAccent} />
              <Text style={[s.heroEyebrow, { color: C.primary }]}>
                {fr ? "Centre d'activité" : "Activity hub"}
              </Text>
              <Text style={[s.heroTitle, { color: titleColor }]}>
                {fr ? "Vos alertes" : "Your alerts"}
              </Text>
              <Text style={[s.heroSub, { color: subColor }]}>
                {fr
                  ? "Réservations, messages et mises à jour — tout au même endroit."
                  : "Bookings, messages, and updates — distilled into one calm inbox."}
              </Text>
              <View style={s.heroStats}>
                <LinearGradient colors={accentGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.unreadPill}>
                  <Ionicons name="mail-unread-outline" size={16} color="#fff" />
                  <Text style={s.unreadPillText}>
                    {unreadCount === 0
                      ? fr
                        ? "Tout lu"
                        : "All read"
                      : `${unreadCount} ${fr ? "non lues" : "unread"}`}
                  </Text>
                </LinearGradient>
                <View style={[s.totalChip, { borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)" }]}>
                  <Text style={[s.totalChipText, { color: subColor }]}>
                    {notifs.length} {fr ? "au total" : "total"}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        }
        ListEmptyComponent={
          <Animated.View style={[s.emptyWrap, { opacity: listFade }]}>
            <LinearGradient
              colors={isDark ? ["rgba(124,107,255,0.15)", "rgba(56,189,248,0.08)"] : ["rgba(98,72,232,0.12)", "rgba(14,165,233,0.06)"]}
              style={s.emptyOrb}
            >
              <Ionicons name="notifications-off-outline" size={48} color={C.primary} />
            </LinearGradient>
            <Text style={[s.emptyTitle, { color: titleColor }]}>
              {fr ? "Aucune notification" : "Nothing new yet"}
            </Text>
            <Text style={[s.emptySub, { color: subColor }]}>
              {fr
                ? "Quand quelque chose arrive, vous le verrez ici — élégant et clair."
                : "When something happens, it will land here — clean and instant."}
            </Text>
          </Animated.View>
        }
        renderItem={({ item }) => {
          const [icon, color] = ICONS[item.type] || ICONS.default;
          const unread = !item.read;
          return (
            <Animated.View style={{ opacity: listFade }}>
              <Pressable onPress={() => read(item)} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.985 : 1 }] }]}>
                <LinearGradient
                  colors={
                    unread
                      ? isDark
                        ? ["rgba(124,107,255,0.14)", "rgba(20,21,40,0.95)"]
                        : ["rgba(98,72,232,0.1)", "#ffffff"]
                      : isDark
                        ? ["rgba(255,255,255,0.04)", "rgba(12,14,28,0.98)"]
                        : ["#ffffff", "#f8fafc"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    s.card,
                    {
                      borderColor: unread
                        ? isDark
                          ? "rgba(124,107,255,0.45)"
                          : "rgba(98,72,232,0.35)"
                        : isDark
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(15,23,42,0.08)",
                      borderLeftWidth: unread ? 4 : 1,
                      borderLeftColor: unread ? C.primary : undefined,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[`${color}40`, `${color}12`]}
                    style={s.iconOrb}
                  >
                    <Ionicons name={icon} size={22} color={color} />
                  </LinearGradient>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={[s.msg, unread && s.msgUnread, { color: unread ? titleColor : subColor }]}>
                      {item.message}
                    </Text>
                    <View style={s.timeRow}>
                      <Ionicons name="time-outline" size={12} color={C.muted} />
                      <Text style={s.time}>{timeAgo(item.createdAt, fr)}</Text>
                    </View>
                  </View>
                  {unread && (
                    <View style={s.dotWrap}>
                      <LinearGradient colors={accentGrad} style={s.dot} />
                    </View>
                  )}
                </LinearGradient>
              </Pressable>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

function createNotificationsStyles(C, isDark) {
  return StyleSheet.create({
    loaderScreen: { flex: 1, alignItems: "center", justifyContent: "center" },
    loaderGlow: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 280,
    },
    loaderRing: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: isDark ? "rgba(124,107,255,0.35)" : "rgba(98,72,232,0.3)",
      backgroundColor: isDark ? "rgba(124,107,255,0.06)" : "rgba(98,72,232,0.05)",
    },
    loaderText: { marginTop: 20, fontSize: 14, fontWeight: "600" },
    hero: {
      borderRadius: 22,
      padding: 20,
      marginBottom: 18,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: isDark ? "rgba(124,107,255,0.2)" : "rgba(98,72,232,0.15)",
    },
    heroAccent: {
      position: "absolute",
      left: 0,
      top: 16,
      bottom: 16,
      width: 4,
      borderRadius: 2,
      backgroundColor: C.primary,
      opacity: 0.9,
    },
    heroEyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 8,
      marginLeft: 8,
    },
    heroTitle: { fontSize: 26, fontWeight: "800", letterSpacing: -0.6, marginLeft: 8 },
    heroSub: { fontSize: 14, lineHeight: 21, marginTop: 10, marginLeft: 8, fontWeight: "500" },
    heroStats: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18, marginLeft: 8, flexWrap: "wrap" },
    unreadPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      shadowColor: "#7c6bff",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.4 : 0.25,
      shadowRadius: 10,
      elevation: 6,
    },
    unreadPillText: { color: "#fff", fontWeight: "800", fontSize: 13 },
    totalChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
    },
    totalChipText: { fontSize: 12, fontWeight: "700" },
    emptyWrap: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
    emptyOrb: {
      width: 112,
      height: 112,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDark ? "rgba(124,107,255,0.3)" : "rgba(98,72,232,0.2)",
    },
    emptyTitle: { fontWeight: "800", fontSize: 20, marginTop: 20, textAlign: "center" },
    emptySub: { fontSize: 14, marginTop: 10, textAlign: "center", lineHeight: 22, maxWidth: 300 },
    card: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 16,
      marginBottom: 12,
      borderRadius: 18,
      borderWidth: 1,
      gap: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.25 : 0.06,
      shadowRadius: 16,
      elevation: 4,
    },
    iconOrb: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    msg: { fontSize: 14, lineHeight: 21, fontWeight: "500" },
    msgUnread: { fontWeight: "700" },
    timeRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
    time: { color: C.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
    dotWrap: { paddingTop: 4 },
    dot: { width: 10, height: 10, borderRadius: 5 },
  });
}
