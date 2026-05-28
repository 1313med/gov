import { useState, useEffect, useCallback, useMemo } from "react";
import { PageLoader } from '../src/components/AppLoadingScreen';
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppLang } from "../src/context/AppLangContext";
import { useTheme } from "../src/context/ThemeContext";
import { getOwnerBookings as getOwnerBookingsRental } from "../src/api/rental";
import { getOwnerBookings as getOwnerBookingsHub } from "../src/api/booking";
import OwnerAnalyticsMiniCalendar from "../src/components/OwnerAnalyticsMiniCalendar";

function normalizeBookingsList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.bookings)) return data.bookings;
  return [];
}

export default function OwnerBookingCalendarScreen() {
  const { lang, pick } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const fr = lang === "fr";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const accent = isDark ? "#34d399" : "#059669";
  const heroGrad = isDark
    ? ["#010806", "#041a12", "#0c1220"]
    : ["#ecfdf5", "#d1fae5", "#f8fafc"];
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";

  const load = useCallback(async () => {
    try {
      let list = [];
      try {
        const { data } = await getOwnerBookingsRental();
        list = normalizeBookingsList(data);
      } catch {
        const { data } = await getOwnerBookingsHub({ limit: 200, archive: "include" });
        list = normalizeBookingsList(data);
      }
      setBookings(list);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const fleetSummary = useMemo(() => {
    const now = new Date();
    const vy = now.getUTCFullYear();
    const vm = now.getUTCMonth();
    const monthStart = Date.UTC(vy, vm, 1);
    const monthEnd = Date.UTC(vy, vm + 1, 0, 23, 59, 59);
    let pending = 0;
    let upcoming = 0;
    let revenue = 0;
    bookings.forEach((b) => {
      const st = String(b.status || "").toLowerCase();
      if (st === "pending") pending += 1;
      const start = new Date(b.startDate).getTime();
      if (st === "confirmed" && start >= Date.now()) upcoming += 1;
      if (["confirmed", "completed"].includes(st)) {
        const s = new Date(b.startDate).getTime();
        if (s >= monthStart && s <= monthEnd) revenue += Number(b.totalAmount) || 0;
      }
    });
    return { pending, upcoming, revenue, total: bookings.length };
  }, [bookings]);

  const onManageBooking = useCallback(
    (booking) => {
      if (!booking?._id) return;
      router.push({
        pathname: "/(rental-owner)/bookings",
        params: { openBookingId: String(booking._id) },
      });
    },
    [router]
  );

  if (loading) return <PageLoader />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={accent} />
        }
      >
        <LinearGradient colors={heroGrad} style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <LinearGradient colors={isDark ? ["#34d399", "#10b981"] : ["#059669", "#047857"]} style={styles.heroIcon}>
              <Ionicons name="calendar" size={22} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={[styles.heroEyebrow, { color: accent }]}>
            {pick("FLEET SCHEDULE", "PLANNING FLOTTE")}
          </Text>
          <Text style={[styles.heroTitle, { color: titleColor }]}>
            {pick("Booking calendar", "Calendrier des réservations")}
          </Text>
          <Text style={[styles.heroSub, { color: subColor }]}>
            {pick("See rentals across time, filter by day, and open any booking in one tap.", "Visualisez les locations sur la durée, filtrez par jour et ouvrez une réservation en un geste.")}
          </Text>

          <View style={styles.summaryRow}>
            <SummaryChip
              icon="layers-outline"
              label={pick("All", "Total")}
              value={String(fleetSummary.total)}
              color={isDark ? "#a78bfa" : "#6248e8"}
              isDark={isDark}
            />
            <SummaryChip
              icon="time-outline"
              label={pick("Pending", "Attente")}
              value={String(fleetSummary.pending)}
              color="#fbbf24"
              isDark={isDark}
            />
            <SummaryChip
              icon="airplane-outline"
              label={pick("Upcoming", "À venir")}
              value={String(fleetSummary.upcoming)}
              color={accent}
              isDark={isDark}
            />
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <OwnerAnalyticsMiniCalendar
            bookings={bookings}
            fr={fr}
            variant="elite"
            onManageBooking={onManageBooking}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function SummaryChip({ icon, label, value, color, isDark }) {
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: isDark ? `${color}18` : `${color}12`,
          borderColor: `${color}40`,
        },
      ]}
    >
      <Ionicons name={icon} size={14} color={color} />
      <Text style={{ color, fontSize: 16, fontWeight: "900", letterSpacing: -0.3 }}>{value}</Text>
      <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 9, fontWeight: "700", textTransform: "uppercase" }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  hero: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, overflow: "hidden" },
  heroIconWrap: { marginBottom: 12 },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 2, marginBottom: 4 },
  heroTitle: { fontSize: 24, fontWeight: "800", letterSpacing: -0.6, marginBottom: 8 },
  heroSub: { fontSize: 13, lineHeight: 20, fontWeight: "500", marginBottom: 16 },
  summaryRow: { flexDirection: "row", gap: 10 },
  chip: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 4,
  },
});
