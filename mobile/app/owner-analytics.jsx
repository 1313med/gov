import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { PageLoader } from '../src/components/AppLoadingScreen';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppLang } from "../src/context/AppLangContext";
import { useTheme } from "../src/context/ThemeContext";
import { getOwnerAnalytics, getOwnerInsights } from "../src/api/analytics";
import { resolveMediaUrl } from "../src/utils/mediaUrl";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_PAD = 32;
const BAR_AREA_H = 112;

const PERIODS = [
  { key: "today", en: "Today", fr: "Aujourd'hui" },
  { key: "7d", en: "7d", fr: "7 j." },
  { key: "30d", en: "30d", fr: "30 j." },
  { key: "3m", en: "3 mo", fr: "3 m." },
  { key: "1y", en: "1y", fr: "1 an" },
];

const WEEKDAYS = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
};

const STATUS_COLORS = {
  Confirmed: "#34d399",
  Pending: "#fbbf24",
  Rejected: "#f87171",
  Cancelled: "#64748b",
  Completed: "#818cf8",
};

function statusColor(name) {
  return STATUS_COLORS[name] || STATUS_COLORS.Pending;
}

/** Animated vertical bars (revenue / bookings trend) */
function AnimatedColumnChart({ data, valueKey, maxVal, barColor, mutedColor, labelKey = "month", C }) {
  const animsRef = useRef(null);
  if (!animsRef.current || animsRef.current.length !== data.length) {
    animsRef.current = data.map(() => new Animated.Value(0));
  }
  const anims = animsRef.current;

  useEffect(() => {
    data.forEach((d, i) => {
      const target = maxVal > 0 ? d[valueKey] / maxVal : 0;
      Animated.spring(anims[i], {
        toValue: target,
        useNativeDriver: false,
        friction: 7,
        tension: 42,
        delay: i * 65,
      }).start();
    });
  }, [data, valueKey, maxVal, anims]);

  if (!data.length) return null;

  return (
    <View style={chartStyles.row}>
      {data.map((d, i) => {
        const h = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [4, BAR_AREA_H],
        });
        return (
          <View key={`${d[labelKey]}-${i}`} style={chartStyles.col}>
            <View style={[chartStyles.barTrack, { backgroundColor: C.inputBg }]}>
              <Animated.View
                style={[
                  chartStyles.barFill,
                  {
                    height: h,
                    backgroundColor: barColor,
                  },
                ]}
              />
            </View>
            <Text style={[chartStyles.barLabel, { color: mutedColor }]} numberOfLines={1}>
              {d[labelKey]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const FLEET_BAR_MAX_W = SCREEN_W - 80;

/** Horizontal bars — fleet revenue share */
function FleetBars({ items, fmtMoney, C, fr }) {
  const maxRev = Math.max(1, ...items.map((f) => f.revenue));
  const slice = items.slice(0, 6);
  const animsRef = useRef(null);
  if (!animsRef.current || animsRef.current.length !== slice.length) {
    animsRef.current = slice.map(() => new Animated.Value(0));
  }
  const anims = animsRef.current;

  useEffect(() => {
    slice.forEach((f, i) => {
      Animated.spring(anims[i], {
        toValue: f.revenue / maxRev,
        useNativeDriver: false,
        friction: 8,
        tension: 40,
        delay: i * 55,
      }).start();
    });
  }, [slice, maxRev, anims]);

  return (
    <View style={{ gap: 14 }}>
      {slice.map((f, i) => {
        const w = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [4, FLEET_BAR_MAX_W * (f.revenue / maxRev)],
        });
        return (
          <View key={String(f.rentalId)}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ color: C.white, fontWeight: "600", fontSize: 13, flex: 1 }} numberOfLines={1}>
                {f.title}
              </Text>
              <Text style={{ color: C.primary, fontWeight: "700", fontSize: 12, marginLeft: 8 }}>
                {fmtMoney(f.revenue)}
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: C.inputBg, borderRadius: 4, overflow: "hidden" }}>
              <Animated.View
                style={{
                  height: 8,
                  width: w,
                  borderRadius: 4,
                  backgroundColor: C.primary,
                  opacity: 0.85,
                }}
              />
            </View>
            <Text style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>
              {f.bookings} {fr ? "résa." : "book."} · {f.utilization}% {fr ? "occup." : "util."}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** Stacked status pipeline */
function StatusPipeline({ rows, C }) {
  const positive = rows.filter((r) => r.value > 0);
  const total = positive.reduce((s, r) => s + r.value, 0) || 1;
  return (
    <View>
      <View style={{ flexDirection: "row", height: 14, borderRadius: 8, overflow: "hidden", backgroundColor: C.inputBg }}>
        {positive.map((r) => (
          <View key={r.name} style={{ flex: r.value, backgroundColor: statusColor(r.name) }} />
        ))}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 14 }}>
        {rows.map((r) =>
          r.value > 0 ? (
            <View key={r.name} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor(r.name) }} />
              <Text style={{ color: C.muted, fontSize: 11 }}>
                {r.name} <Text style={{ color: C.white, fontWeight: "700" }}>{r.value}</Text>
              </Text>
            </View>
          ) : null
        )}
      </View>
    </View>
  );
}

function HeatGrid({ heatmap, C, lang }) {
  const enDays = WEEKDAYS.en;
  const labels = WEEKDAYS[lang === "fr" ? "fr" : "en"];
  const maxD = Math.max(1, ...heatmap.map((h) => h.demand));
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" }}>
      {heatmap.map((h) => {
        const idx = enDays.indexOf(h.day);
        const dayLabel = idx >= 0 ? labels[idx] : h.day;
        const intensity = h.demand / maxD;
        return (
          <View
            key={h.day}
            style={{
              width: (SCREEN_W - CHART_PAD - 48) / 4 - 6,
              paddingVertical: 12,
              borderRadius: 14,
              alignItems: "center",
              backgroundColor: C.inputBg,
              borderWidth: 1,
              borderColor: intensity > 0.5 ? C.primary + "55" : C.border,
            }}
          >
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: "600" }}>{dayLabel}</Text>
            <Text style={{ color: C.white, fontWeight: "800", fontSize: 18, marginTop: 6 }}>{h.demand}</Text>
            <View
              style={{
                marginTop: 8,
                height: 3,
                width: "70%",
                borderRadius: 2,
                backgroundColor: C.border,
                overflow: "hidden",
              }}
            >
              <View style={{ height: 3, width: `${intensity * 100}%`, backgroundColor: C.primary, borderRadius: 2 }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function KpiHero({ label, value, sub, icon, colors, delay, C }) {
  const op = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.spring(y, { toValue: 0, delay, useNativeDriver: true, friction: 8 }),
    ]).start();
  }, [delay, op, y]);

  return (
    <Animated.View style={{ opacity: op, transform: [{ translateY: y }], width: "48%", marginBottom: 12 }}>
      <LinearGradient
        colors={[colors[0] + "22", colors[1] + "08"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 18,
          padding: 14,
          borderWidth: 1,
          borderColor: colors[0] + "35",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: colors[0] + "28", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={icon} size={18} color={colors[0]} />
          </View>
        </View>
        <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", fontWeight: "700" }}>{label}</Text>
        <Text style={{ color: C.white, fontSize: 20, fontWeight: "800", marginTop: 6, letterSpacing: -0.5 }} numberOfLines={1}>
          {value}
        </Text>
        {sub ? <Text style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>{sub}</Text> : null}
      </LinearGradient>
    </Animated.View>
  );
}

function SectionCard({ title, subtitle, children, C, accent }) {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
      }}
    >
      <View style={{ paddingHorizontal: 4, paddingTop: 4 }}>
        <View style={{ height: 3, borderRadius: 2, backgroundColor: accent || C.primary, marginHorizontal: 12, marginBottom: 12, opacity: 0.9 }} />
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ color: C.white, fontWeight: "800", fontSize: 17, letterSpacing: -0.3 }}>{title}</Text>
        {subtitle ? <Text style={{ color: C.muted, fontSize: 12, marginTop: 4, lineHeight: 18 }}>{subtitle}</Text> : null}
        <View style={{ marginTop: 16 }}>{children}</View>
      </View>
    </View>
  );
}

export default function OwnerAnalyticsScreen() {
  const { lang } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const chipScale = useMemo(
    () => Object.fromEntries(PERIODS.map((p) => [p.key, new Animated.Value(p.key === "30d" ? 1 : 0.96)])),
    []
  );

  const load = useCallback(async () => {
    try {
      const [a, i] = await Promise.all([
        getOwnerAnalytics(period),
        getOwnerInsights(period, lang),
      ]);
      setData(a);
      setInsights(Array.isArray(i?.insights) ? i.insights : []);
    } catch {
      setData(null);
      setInsights([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, lang]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    PERIODS.forEach((p) => {
      Animated.spring(chipScale[p.key], {
        toValue: period === p.key ? 1 : 0.96,
        useNativeDriver: true,
        friction: 6,
      }).start();
    });
  }, [period, chipScale]);

  const fmtMoney = (n) => `${Number(n || 0).toLocaleString(fr ? "fr-FR" : "en-US")} MAD`;

  const monthly = Array.isArray(data?.monthlyRevenue) ? data.monthlyRevenue : [];
  const trends = Array.isArray(data?.bookingTrends) ? data.bookingTrends : [];
  const maxMonthly = Math.max(1, ...monthly.map((m) => m.revenue));
  const maxTrend = Math.max(1, ...trends.map((m) => m.bookings));

  if (loading && !data) return <PageLoader />;

  if (!data) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg, padding: 24 }]}>
        <Ionicons name="analytics-outline" size={52} color={C.muted} />
        <Text style={{ color: C.white, textAlign: "center", marginTop: 16, fontSize: 16 }}>{fr ? "Impossible de charger les statistiques." : "Could not load analytics."}</Text>
      </View>
    );
  }

  const growth = data.revenueGrowth;
  const growthStr = growth > 0 ? `+${growth}%` : growth < 0 ? `${growth}%` : "—";
  const growthPositive = growth > 0;

  const heroColors = isDark ? ["#1e1040", "#0f0f14", C.surface] : ["#eef2ff", "#f8fafc", C.surface];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
    >
      <LinearGradient colors={heroColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: Math.max(insets.top, 12) + 8, paddingBottom: 28, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <View style={{ backgroundColor: C.primary + "28", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: C.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1 }}>INSIGHTS</Text>
          </View>
          <Text style={{ color: C.muted, fontSize: 12 }}>{fr ? "Temps réel" : "Live"}</Text>
        </View>
        <Text style={{ color: C.white, fontSize: 28, fontWeight: "900", letterSpacing: -1, lineHeight: 34 }}>{fr ? "Performance" : "Performance"}</Text>
        <Text style={{ color: C.muted, fontSize: 14, marginTop: 8, lineHeight: 20, maxWidth: SCREEN_W - 40 }}>
          {fr ? "Revenus, réservations et occupation — visualisés pour décider vite." : "Revenue, bookings & occupancy — visualized for faster decisions."}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 20 }} contentContainerStyle={{ gap: 10, paddingRight: 8 }}>
          {PERIODS.map((p) => (
            <Animated.View key={p.key} style={{ transform: [{ scale: chipScale[p.key] }] }}>
              <TouchableOpacity
                onPress={() => setPeriod(p.key)}
                activeOpacity={0.85}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: period === p.key ? C.primary : C.card,
                  borderWidth: 1,
                  borderColor: period === p.key ? C.primary : C.border,
                }}
              >
                <Text style={{ color: period === p.key ? "#fff" : C.muted, fontWeight: "800", fontSize: 13 }}>{fr ? p.fr : p.en}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </LinearGradient>

      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16, marginTop: 8 }}>
        <KpiHero
          label={fr ? "Chiffre d'affaires" : "Total revenue"}
          value={fmtMoney(data.totalRevenue)}
          sub={fr ? "Période" : "Period"}
          icon="cash-outline"
          colors={["#a78bfa", "#7c6bff"]}
          delay={0}
          C={C}
        />
        <KpiHero
          label={fr ? "Réservations" : "Bookings"}
          value={String(data.totalBookings ?? 0)}
          sub={fr ? "Tous statuts" : "All statuses"}
          icon="calendar-outline"
          colors={["#38bdf8", "#0ea5e9"]}
          delay={80}
          C={C}
        />
        <KpiHero
          label={fr ? "Occupation" : "Occupancy"}
          value={`${data.occupancyRate ?? 0}%`}
          sub={fr ? "Flotte" : "Fleet"}
          icon="speedometer-outline"
          colors={["#34d399", "#10b981"]}
          delay={160}
          C={C}
        />
        <KpiHero
          label={fr ? "Net" : "Net"}
          value={fmtMoney(data.netProfit)}
          sub={fr ? "Après entretien" : "After maintenance"}
          icon="trending-up-outline"
          colors={data.netProfit >= 0 ? ["#34d399", "#22c55e"] : ["#f87171", "#ef4444"]}
          delay={240}
          C={C}
        />
      </View>

      {monthly.length > 0 && (
        <SectionCard
          title={fr ? "Pulse revenus" : "Revenue pulse"}
          subtitle={fr ? "Volume encaissé par mois sur la période." : "Revenue volume by month in this period."}
          C={C}
          accent="#a78bfa"
        >
          <AnimatedColumnChart
            key={`rev-${period}-${monthly.map((m) => `${m.month}-${m.revenue}`).join("|")}`}
            data={monthly}
            valueKey="revenue"
            maxVal={maxMonthly}
            barColor="#7c6bff"
            mutedColor={C.muted}
            C={C}
          />
        </SectionCard>
      )}

      {trends.length > 0 && (
        <SectionCard
          title={fr ? "Rythme des réservations" : "Booking rhythm"}
          subtitle={fr ? "Nombre de réservations confirmées / terminées par mois." : "Confirmed & completed bookings per month."}
          C={C}
          accent="#38bdf8"
        >
          <AnimatedColumnChart
            key={`tr-${period}-${trends.map((m) => `${m.month}-${m.bookings}`).join("|")}`}
            data={trends}
            valueKey="bookings"
            maxVal={maxTrend}
            barColor="#0ea5e9"
            mutedColor={C.muted}
            labelKey="month"
            C={C}
          />
        </SectionCard>
      )}

      {Array.isArray(data.bookingStatusData) && data.bookingStatusData.some((x) => x.value > 0) && (
        <SectionCard
          title={fr ? "Pipeline réservations" : "Booking pipeline"}
          subtitle={fr ? "Répartition des statuts — d’un coup d’œil." : "Status mix at a glance."}
          C={C}
          accent="#fbbf24"
        >
          <StatusPipeline rows={data.bookingStatusData} C={C} />
        </SectionCard>
      )}

      <SectionCard title={fr ? "Trésorerie" : "Cash flow"} subtitle={fr ? "Encaissement, attente et coûts." : "Collected, pending & costs."} C={C} accent="#34d399">
        <View style={{ gap: 12 }}>
          {[
            [fr ? "Encaissé" : "Collected", fmtMoney(data.collectedRevenue), "checkmark-circle-outline", "#34d399"],
            [fr ? "En attente" : "Pending", fmtMoney(data.pendingRevenue), "time-outline", "#fbbf24"],
            [fr ? "Entretien" : "Maintenance", fmtMoney(data.totalMaintenanceCost), "construct-outline", "#f87171"],
            [fr ? "Évolution CA" : "Revenue vs prev.", growthStr, growthPositive ? "trending-up-outline" : "remove-outline", growthPositive ? "#34d399" : C.muted],
            [fr ? "CA moy. / jour" : "Avg. daily", fmtMoney(data.avgDailyRevenue), "bar-chart-outline", C.primary],
          ].map(([label, val, icon, col]) => (
            <View
              key={label}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 12,
                backgroundColor: C.inputBg,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <Ionicons name={icon} size={22} color={col} style={{ marginRight: 12 }} />
              <Text style={{ color: C.muted, fontSize: 13, flex: 1 }}>{label}</Text>
              <Text style={{ color: C.white, fontWeight: "800", fontSize: 14 }}>{val}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      {data.mostRentedCar && (
        <SectionCard title={fr ? "Véhicule star" : "Star vehicle"} subtitle={fr ? "Le plus réservé sur la période." : "Most booked this period."} C={C} accent="#f472b6">
          <LinearGradient colors={["#f472b622", "#a78bfa12"]} style={{ borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#f472b644" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              {resolveMediaUrl(data.mostRentedCar.image) ? (
                <Image
                  source={{ uri: resolveMediaUrl(data.mostRentedCar.image) }}
                  style={{ width: 72, height: 52, borderRadius: 12, backgroundColor: C.inputBg }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: 72,
                    height: 52,
                    borderRadius: 12,
                    backgroundColor: C.inputBg,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: C.border,
                  }}
                >
                  <Ionicons name="car-sport-outline" size={28} color={C.muted} />
                </View>
              )}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ color: C.white, fontSize: 20, fontWeight: "900" }} numberOfLines={2}>
                  {data.mostRentedCar.title}
                </Text>
                <Text style={{ color: C.muted, marginTop: 8, fontSize: 14 }}>
                  {data.mostRentedCar.count} {fr ? "réservations" : "bookings"} · {fr ? "période actuelle" : "current period"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </SectionCard>
      )}

      {Array.isArray(data.fleetPerformance) && data.fleetPerformance.length > 0 && (
        <SectionCard
          title={fr ? "Performance flotte" : "Fleet leaderboard"}
          subtitle={fr ? "Part du revenu par véhicule (barres animées)." : "Revenue share per vehicle (animated bars)."}
          C={C}
          accent="#818cf8"
        >
          <FleetBars
            key={`fl-${period}-${data.fleetPerformance.map((f) => f.rentalId).join("-")}`}
            items={data.fleetPerformance}
            fmtMoney={fmtMoney}
            C={C}
            fr={fr}
          />
        </SectionCard>
      )}

      {Array.isArray(data.demandHeatmap) && data.demandHeatmap.length > 0 && (
        <SectionCard
          title={fr ? "Carte de demande" : "Demand map"}
          subtitle={fr ? "Jours les plus sollicités (période cumulée)." : "Busiest weekdays (cumulative)."}
          C={C}
          accent="#2dd4bf"
        >
          <HeatGrid heatmap={data.demandHeatmap} C={C} lang={lang} />
        </SectionCard>
      )}

      {Array.isArray(data.upcomingRentals) && data.upcomingRentals.length > 0 && (
        <SectionCard title={fr ? "À venir" : "Upcoming"} subtitle={fr ? "Prochains départs confirmés." : "Next confirmed trips."} C={C} accent="#94a3b8">
          <View style={{ gap: 10 }}>
            {data.upcomingRentals.map((b) => (
              <View
                key={b._id}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: C.inputBg,
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <Text style={{ color: C.white, fontWeight: "700", fontSize: 14 }} numberOfLines={1}>
                  {b.rentalId?.title || "—"}
                </Text>
                <Text style={{ color: C.muted, fontSize: 12, marginTop: 6 }}>
                  {new Date(b.startDate).toLocaleDateString(fr ? "fr-FR" : "en-GB")} → {new Date(b.endDate).toLocaleDateString(fr ? "fr-FR" : "en-GB")}
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>
      )}

      {insights.length > 0 && (
        <SectionCard
          title={fr ? "Recommandation Goovoiture" : "Goovoiture recommendation"}
          subtitle={fr ? "Conseils adaptés à votre flotte." : "Tailored tips for your fleet."}
          C={C}
          accent="#fb923c"
        >
          <View style={{ gap: 12 }}>
            {insights.map((ins, idx) => {
              const icon =
                ins.type === "alert" ? "alert-circle-outline" : ins.type === "warning" ? "warning-outline" : "rocket-outline";
              const border =
                ins.type === "alert" ? "#f87171" : ins.type === "warning" ? "#fbbf24" : "#34d399";
              return (
                <View
                  key={idx}
                  style={{
                    borderRadius: 16,
                    padding: 14,
                    backgroundColor: C.surface,
                    borderWidth: 1,
                    borderColor: C.border,
                    borderLeftWidth: 4,
                    borderLeftColor: border,
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
                    <Ionicons name={icon} size={22} color={border} style={{ marginTop: 2 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.white, fontWeight: "800", fontSize: 14, lineHeight: 20 }}>{ins.title}</Text>
                      <Text style={{ color: C.muted, fontSize: 12, marginTop: 8, lineHeight: 18 }}>{ins.action}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </SectionCard>
      )}
    </ScrollView>
  );
}

const chartStyles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", minHeight: BAR_AREA_H + 28, paddingHorizontal: 4 },
  col: { flex: 1, alignItems: "center", maxWidth: 72 },
  barTrack: { width: "78%", height: BAR_AREA_H, borderRadius: 10, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: "100%", borderTopLeftRadius: 8, borderTopRightRadius: 8, minHeight: 4 },
  barLabel: { fontSize: 10, marginTop: 8, fontWeight: "700", textAlign: "center" },
});

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
