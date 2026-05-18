import { useState, useEffect, useCallback, useRef } from "react";
import { PageLoader } from '../../src/components/AppLoadingScreen';
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
import { getAdminStats } from "../../src/api/analytics";
import { getAdminSales } from "../../src/api/sale";
import { getAdminRentals } from "../../src/api/rental";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.listings)) return data.listings;
  if (Array.isArray(data?.sales)) return data.sales;
  if (Array.isArray(data?.rentals)) return data.rentals;
  return [];
}

export default function AdminDashboard() {
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [stats, setStats]       = useState(null);
  const [pendingSales, setPendingSales]     = useState([]);
  const [pendingRentals, setPendingRentals] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const orbPulse   = useRef(new Animated.Value(1)).current;
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
      const [statsRes, salesRes, rentalsRes] = await Promise.all([
        getAdminStats().catch(() => ({ data: null })),
        getAdminSales().catch(() => ({ data: [] })),
        getAdminRentals().catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      const sales = normalizeList(salesRes?.data).filter((x) => x.status === "pending").slice(0, 3);
      const rentals = normalizeList(rentalsRes?.data).filter((x) => x.status === "pending").slice(0, 3);
      setPendingSales(sales);
      setPendingRentals(rentals);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(heroOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const accent = isDark ? "#f87171" : "#dc2626";
  const heroGrad = isDark
    ? ["#03040a", "#160a0a", "#05060f"]
    : ["#fff1f2", "#ffe4e6", "#f8fafc"];
  const ctaGrad = isDark ? ["#f87171", "#ef4444"] : ["#dc2626", "#b91c1c"];

  const totalUsers   = stats?.totalUsers   ?? 0;
  const totalListings = stats?.totalListings ?? 0;
  const totalSales   = stats?.totalSales   ?? 0;
  const totalRentals = stats?.totalRentals ?? 0;

  const pendingCount = pendingSales.length + pendingRentals.length;

  if (loading && !stats) return <PageLoader />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
    >
      <LinearGradient colors={heroGrad} style={{ paddingTop: insets.top + 12, paddingBottom: 24, paddingHorizontal: 22, overflow: "hidden" }}>
        <Animated.View style={{ position: "absolute", width: 240, height: 240, top: -80, right: -80, borderRadius: 999, opacity: 0.35, transform: [{ scale: orbPulse }] }}>
          <LinearGradient
            colors={isDark ? ["rgba(248,113,113,0.5)", "rgba(248,113,113,0)"] : ["rgba(220,38,38,0.2)", "rgba(220,38,38,0)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <Animated.View style={{ opacity: heroOpacity }}>
          <Text style={{ fontSize: 12, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: accent, marginBottom: 4 }}>
            {fr ? "ADMINISTRATION" : "ADMINISTRATION"}
          </Text>
          <Text style={{ fontSize: 26, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", letterSpacing: -0.5, marginBottom: 4 }}>
            {fr ? "Tableau de bord" : "Dashboard"}
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? "#94a3b8" : "#475569", fontWeight: "500" }}>
            {fr ? "Vue d'ensemble de la plateforme." : "Platform overview at a glance."}
          </Text>
        </Animated.View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <>
            {/* Platform KPIs */}
            <Text style={[s.sectionTitle, { color: isDark ? "#94a3b8" : "#475569" }]}>
              {fr ? "STATISTIQUES PLATEFORME" : "PLATFORM STATS"}
            </Text>
            <View style={s.statsGrid}>
              <StatCard
                icon="people-outline"
                label={fr ? "Utilisateurs" : "Users"}
                value={String(totalUsers)}
                gradient={ctaGrad}
                isDark={isDark}
              />
              <StatCard
                icon="storefront-outline"
                label={fr ? "Annonces" : "Listings"}
                value={String(totalListings)}
                gradient={isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"]}
                isDark={isDark}
              />
              <StatCard
                icon="pricetag-outline"
                label={fr ? "Ventes" : "Sales"}
                value={String(totalSales)}
                gradient={isDark ? ["#38bdf8", "#0ea5e9"] : ["#0284c7", "#0369a1"]}
                isDark={isDark}
              />
              <StatCard
                icon="car-sport-outline"
                label={fr ? "Locations" : "Rentals"}
                value={String(totalRentals)}
                gradient={isDark ? ["#34d399", "#10b981"] : ["#059669", "#047857"]}
                isDark={isDark}
              />
            </View>

            {/* Pending Moderation Queue */}
            <View style={s.sectionRow}>
              <Text style={[s.sectionTitle, { color: isDark ? "#94a3b8" : "#475569" }]}>
                {fr ? "EN ATTENTE DE MODÉRATION" : "PENDING MODERATION"}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(admin)/listings")} activeOpacity={0.8}>
                <Text style={{ color: accent, fontSize: 12, fontWeight: "800" }}>{fr ? "Tout voir" : "See all"}</Text>
              </TouchableOpacity>
            </View>

            {pendingCount === 0 ? (
              <View style={[s.emptyCard, { backgroundColor: C.card, borderColor: C.border }]}>
                <Ionicons name="checkmark-circle-outline" size={32} color={isDark ? "#34d399" : "#059669"} />
                <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "700", fontSize: 15, marginTop: 10 }}>
                  {fr ? "Aucune annonce en attente" : "No pending listings"}
                </Text>
              </View>
            ) : (
              [...pendingSales.map((x) => ({ ...x, _type: "sale" })), ...pendingRentals.map((x) => ({ ...x, _type: "rental" }))].map((item) => (
                <TouchableOpacity
                  key={`${item._type}-${item._id}`}
                  onPress={() => router.push("/(admin)/listings")}
                  activeOpacity={0.85}
                  style={[s.listingCard, { backgroundColor: C.card, borderColor: C.border }]}
                >
                  <View style={[s.typeBadge, { backgroundColor: item._type === "sale" ? (isDark ? "rgba(56,189,248,0.15)" : "rgba(2,132,199,0.1)") : (isDark ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.1)") }]}>
                    <Ionicons
                      name={item._type === "sale" ? "pricetag-outline" : "car-sport-outline"}
                      size={14}
                      color={item._type === "sale" ? (isDark ? "#38bdf8" : "#0284c7") : (isDark ? "#34d399" : "#059669")}
                    />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "700", fontSize: 14 }} numberOfLines={1}>
                      {item.title || `${item.brand || ""} ${item.model || ""}`.trim() || "—"}
                    </Text>
                    <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>
                      {item._type === "sale" ? (fr ? "Vente" : "For sale") : (fr ? "Location" : "Rental")} · {item.city || "—"}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={C.muted} />
                </TouchableOpacity>
              ))
            )}

            {/* Quick nav */}
            <Text style={[s.sectionTitle, { color: isDark ? "#94a3b8" : "#475569", marginTop: 8 }]}>
              {fr ? "NAVIGATION RAPIDE" : "QUICK NAVIGATION"}
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <QuickAction
                icon="list-outline"
                label={fr ? "Modérer" : "Moderate"}
                onPress={() => router.push("/(admin)/listings")}
                gradient={ctaGrad}
              />
              <QuickAction
                icon="people-outline"
                label={fr ? "Utilisateurs" : "Users"}
                onPress={() => router.push("/(admin)/users")}
                gradient={isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"]}
              />
            </View>
          </>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, gradient, isDark }) {
  return (
    <LinearGradient
      colors={[`${gradient[0]}18`, `${gradient[0]}08`]}
      style={[s.statCard, { borderColor: `${gradient[0]}30` }]}
    >
      <LinearGradient colors={gradient} style={s.statIcon}>
        <Ionicons name={icon} size={16} color="#fff" />
      </LinearGradient>
      <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a", fontWeight: "800", fontSize: 20, marginTop: 10, letterSpacing: -0.4 }}>
        {value}
      </Text>
      <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 11, fontWeight: "700", marginTop: 2 }}>{label}</Text>
    </LinearGradient>
  );
}

function QuickAction({ icon, label, onPress, gradient }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={{ flex: 1 }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
      >
        <Ionicons name={icon} size={22} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12, marginTop: 6 }}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  sectionTitle: {
    fontSize: 10, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 10,
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
  listingCard: {
    flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1,
    padding: 14, marginBottom: 10,
  },
  typeBadge: {
    width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  emptyCard: {
    borderRadius: 18, borderWidth: 1, padding: 24, alignItems: "center", marginBottom: 20,
  },
});
