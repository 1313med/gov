import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getOwnerAnalytics } from "../../src/api/analytics";
import { getOwnerBookings } from "../../src/api/booking";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import QuickActionCard from "../../src/components/QuickActionCard";
import { useOwnerBookingAttentionCount } from "../../src/hooks/useOwnerBookingAttentionCount";
import { useOwnerListingViewAttentionCount } from "../../src/hooks/useOwnerListingViewAttentionCount";

export default function RentalOwnerDashboard() {
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bookingAttentionCount = useOwnerBookingAttentionCount();
  const listingViewAttentionCount = useOwnerListingViewAttentionCount();
  const titleColor = isDark ? "#f8fafc" : "#0f172a";

  const [stats, setStats]         = useState(null);
  const [pending, setPending]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const orbPulse = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.12, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const load = useCallback(async () => {
    try {
      const [analyticsRes, bookingsRes] = await Promise.all([
        getOwnerAnalytics("30d").catch(() => ({ data: null })),
        getOwnerBookings({ status: "pending", limit: 5 }).catch(() => ({ data: [] })),
      ]);
      setStats(analyticsRes.data);
      const list = Array.isArray(bookingsRes.data) ? bookingsRes.data : (Array.isArray(bookingsRes.data?.bookings) ? bookingsRes.data.bookings : []);
      setPending(list.slice(0, 5));
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(heroOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const accent = isDark ? "#34d399" : "#059669";
  const heroGrad = isDark
    ? ["#03040a", "#04160e", "#05060f"]
    : ["#f0fdf4", "#dcfce7", "#f8fafc"];
  const ctaGrad = isDark ? ["#34d399", "#10b981"] : ["#059669", "#047857"];

  const revenue30d = stats?.totalRevenue ?? 0;
  const bookingsCount = stats?.totalBookings ?? 0;
  const activeCount = stats?.activeBookings ?? 0;
  const occupancy = stats?.occupancyRate ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
    >
      {/* Hero Header */}
      <LinearGradient colors={heroGrad} style={{ paddingTop: insets.top + 12, paddingBottom: 24, paddingHorizontal: 22, overflow: "hidden" }}>
        <Animated.View style={{ position: "absolute", width: 240, height: 240, top: -80, right: -80, borderRadius: 999, opacity: 0.4, transform: [{ scale: orbPulse }] }}>
          <LinearGradient
            colors={isDark ? ["rgba(52,211,153,0.5)", "rgba(52,211,153,0)"] : ["rgba(5,150,105,0.25)", "rgba(5,150,105,0)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View style={{ opacity: heroOpacity }}>
          <Text style={{ fontSize: 12, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 4 }}>
            {fr ? "TABLEAU DE BORD" : "DASHBOARD"}
          </Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", letterSpacing: -0.5, marginBottom: 4 }}>
            {fr ? "Bonjour" : "Hello"}{auth?.name ? `, ${auth.name.split(" ")[0]}` : ""}
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? "#94a3b8" : "#475569", fontWeight: "500" }}>
            {fr ? "Voici l'état de votre flotte en temps réel." : "Here's your fleet status in real time."}
          </Text>
        </Animated.View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ActivityIndicator color={accent} size="large" />
            <Text style={{ color: C.muted, marginTop: 12, fontSize: 13, fontWeight: "500" }}>
              {fr ? "Chargement…" : "Loading…"}
            </Text>
          </View>
        ) : (
          <>
            {/* KPI Stats Grid */}
            <Text style={[s.sectionTitle, { color: isDark ? "#94a3b8" : "#475569" }]}>
              {fr ? "30 DERNIERS JOURS" : "LAST 30 DAYS"}
            </Text>
            <View style={s.statsGrid}>
              <StatCard
                icon="trending-up-outline"
                label={fr ? "Revenus" : "Revenue"}
                value={`${Number(revenue30d).toLocaleString(fr ? "fr-FR" : "en-US")} MAD`}
                gradient={ctaGrad}
                isDark={isDark}
                C={C}
              />
              <StatCard
                icon="calendar-outline"
                label={fr ? "Réservations" : "Bookings"}
                value={String(bookingsCount)}
                gradient={isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"]}
                isDark={isDark}
                C={C}
              />
              <StatCard
                icon="car-sport-outline"
                label={fr ? "Actives" : "Active"}
                value={String(activeCount)}
                gradient={isDark ? ["#38bdf8", "#0ea5e9"] : ["#0284c7", "#0369a1"]}
                isDark={isDark}
                C={C}
              />
              <StatCard
                icon="pie-chart-outline"
                label={fr ? "Occupation" : "Occupancy"}
                value={`${Math.round(occupancy)}%`}
                gradient={isDark ? ["#f59e0b", "#d97706"] : ["#d97706", "#b45309"]}
                isDark={isDark}
                C={C}
              />
            </View>

            {/* Pending Bookings Triage */}
            <View style={s.sectionRow}>
              <Text style={[s.sectionTitle, { color: isDark ? "#94a3b8" : "#475569" }]}>
                {fr ? "EN ATTENTE D'APPROBATION" : "PENDING APPROVAL"}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(rental-owner)/bookings")} activeOpacity={0.8}>
                <Text style={{ color: accent, fontSize: 12, fontWeight: "800" }}>{fr ? "Tout voir" : "See all"}</Text>
              </TouchableOpacity>
            </View>

            {pending.length === 0 ? (
              <View style={[s.emptyCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <Ionicons name="checkmark-circle-outline" size={32} color={accent} />
                <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "700", fontSize: 15, marginTop: 10 }}>
                  {fr ? "Aucune demande en attente" : "No pending requests"}
                </Text>
                <Text style={{ color: C.muted, fontSize: 12, marginTop: 6, textAlign: "center" }}>
                  {fr ? "Toutes vos réservations sont à jour." : "All your bookings are up to date."}
                </Text>
              </View>
            ) : (
              pending.map((b) => (
                <TouchableOpacity
                  key={b._id}
                  onPress={() => router.push({ pathname: "/(rental-owner)/bookings", params: { openBookingId: b._id } })}
                  activeOpacity={0.85}
                  style={[s.bookingCard, { backgroundColor: C.card, borderColor: C.border }]}
                >
                  <View style={[s.statusDot, { backgroundColor: "#f59e0b" }]} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "700", fontSize: 14 }} numberOfLines={1}>
                      {b.rentalId?.title || `${b.rentalId?.brand || ""} ${b.rentalId?.model || ""}`.trim() || "Rental"}
                    </Text>
                    <Text style={{ color: C.muted, fontSize: 12, marginTop: 2, fontWeight: "500" }}>
                      {new Date(b.startDate).toLocaleDateString(fr ? "fr-FR" : "en-GB")} → {new Date(b.endDate).toLocaleDateString(fr ? "fr-FR" : "en-GB")}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: accent, fontWeight: "800", fontSize: 15 }}>
                      {Number(b.totalAmount).toLocaleString(fr ? "fr-FR" : "en-US")} MAD
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color={C.muted} style={{ marginTop: 4 }} />
                  </View>
                </TouchableOpacity>
              ))
            )}

            {/* Quick Actions */}
            <Text style={[s.sectionTitle, { color: isDark ? "#94a3b8" : "#475569", marginTop: 8 }]}>
              {fr ? "ACTIONS RAPIDES" : "QUICK ACTIONS"}
            </Text>
            <View style={s.quickActionsStack}>
              <QuickActionCard
                icon="notifications-outline"
                label={fr ? "Notifications" : "Notifications"}
                onPress={() => router.push("/notifications")}
                C={C}
                isDark={isDark}
                labelColor={titleColor}
              />
              <QuickActionCard
                featured
                featuredKicker={fr ? "APERÇU" : "INSIGHTS"}
                featuredSubtitle={fr ? "Performance & tendances" : "Performance & trends"}
                icon="analytics-outline"
                label={fr ? "Analytiques" : "Analytics"}
                onPress={() => router.push("/owner-analytics")}
                C={C}
                isDark={isDark}
                labelColor={titleColor}
                color={accent}
              />
              <QuickActionCard
                icon="calendar-outline"
                label={fr ? "Calendrier" : "Calendar"}
                onPress={() => router.push("/owner-booking-calendar")}
                C={C}
                isDark={isDark}
                labelColor={titleColor}
              />
              <QuickActionCard
                elevated
                elevatedKicker={fr ? "À SUIVRE" : "PIPELINE"}
                elevatedSubtitle={fr ? "Demandes, statuts et planning" : "Requests, status & schedule"}
                icon="clipboard-outline"
                label={fr ? "Réservations" : "Bookings"}
                onPress={() => router.push("/owner-bookings")}
                C={C}
                isDark={isDark}
                labelColor={titleColor}
                attentionCount={bookingAttentionCount}
              />
              <QuickActionCard
                icon="car-sport-outline"
                label={fr ? "Ma flotte" : "Fleet"}
                onPress={() => router.push("/(rental-owner)/fleet")}
                C={C}
                isDark={isDark}
                labelColor={titleColor}
              />
              <QuickActionCard
                icon="pulse-outline"
                label={fr ? "Vues des annonces" : "Listing views"}
                onPress={() => router.push("/owner-listing-views")}
                C={C}
                isDark={isDark}
                labelColor={titleColor}
                attentionCount={listingViewAttentionCount}
                attentionWeight="soft"
              />
              <QuickActionCard
                icon="construct-outline"
                label={fr ? "Maintenance" : "Maintenance"}
                onPress={() => router.push("/maintenance")}
                C={C}
                isDark={isDark}
                labelColor={titleColor}
              />
              <QuickActionCard
                icon="add-circle-outline"
                label={fr ? "Ajouter location" : "Add rental"}
                onPress={() => router.push("/add-rental")}
                C={C}
                isDark={isDark}
                labelColor={titleColor}
                color={accent}
              />
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, gradient, isDark, C }) {
  return (
    <LinearGradient
      colors={[`${gradient[0]}18`, `${gradient[0]}08`]}
      style={[s.statCard, { borderColor: `${gradient[0]}30`, backgroundColor: "transparent" }]}
    >
      <LinearGradient colors={gradient} style={s.statIcon}>
        <Ionicons name={icon} size={16} color="#fff" />
      </LinearGradient>
      <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "800", fontSize: 18, marginTop: 10, letterSpacing: -0.4 }}>
        {value}
      </Text>
      <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 11, fontWeight: "700", marginTop: 2 }}>{label}</Text>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  sectionTitle: {
    fontSize: 10, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase",
    marginBottom: 10,
  },
  sectionRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statCard: {
    width: "47%", borderRadius: 18, padding: 16, borderWidth: 1,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  bookingCard: {
    flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1,
    padding: 14, marginBottom: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  emptyCard: {
    borderRadius: 18, borderWidth: 1, padding: 24, alignItems: "center", marginBottom: 20,
  },
  quickActionsStack: { marginTop: 4 },
});
