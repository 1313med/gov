import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { PageLoader } from "../src/components/AppLoadingScreen";
import {
  View,
  Text,
  Image,
  ScrollView,
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
import {
  ANALYTICS_PERIODS,
  AnalyticsEliteHero,
  AnalyticsCommandCard,
  AnalyticsTrendFusion,
} from "../src/components/owner/OwnerAnalyticsEliteUI";

const { width: SCREEN_W } = Dimensions.get("window");
const CHART_PAD = 32;

const WEEKDAYS = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  ar: ["أحد", "إثن", "ثل", "أرب", "خم", "جم", "سب"],
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

const FLEET_BAR_MAX_W = SCREEN_W - 80;

/** Horizontal bars — fleet revenue share */
function FleetBars({ items, fmtMoney, C }) {
  const { pick } = useAppLang();
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
              {f.bookings} {pick("book.", "résa.", "حجز")} · {f.utilization}% {pick("util.", "occup.", "إشغال")}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

/** Stacked status pipeline */
function StatusPipeline({ rows, C }) {
  const { pick } = useAppLang();
  const statusLabel = (name) => {
    const map = {
      Confirmed: pick("Confirmed", "Confirmées"),
      Pending: pick("Pending", "En attente"),
      Rejected: pick("Rejected", "Refusées"),
      Cancelled: pick("Cancelled", "Annulées"),
      Completed: pick("Completed", "Terminées"),
    };
    return map[name] || name;
  };
  const positive = rows.filter((r) => r.value > 0);
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
                {statusLabel(r.name)} <Text style={{ color: C.white, fontWeight: "700" }}>{r.value}</Text>
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
  const labels = WEEKDAYS[lang === "fr" ? "fr" : lang === "ar" ? "ar" : "en"];
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
        <View
          style={{
            height: 3,
            borderRadius: 2,
            backgroundColor: accent || C.primary,
            marginHorizontal: 12,
            marginBottom: 12,
            opacity: 0.9,
          }}
        />
      </View>
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ color: C.white, fontWeight: "800", fontSize: 17, letterSpacing: -0.3 }}>{title}</Text>
        {subtitle ? (
          <Text style={{ color: C.muted, fontSize: 12, marginTop: 4, lineHeight: 18 }}>{subtitle}</Text>
        ) : null}
        <View style={{ marginTop: 16 }}>{children}</View>
      </View>
    </View>
  );
}

export default function OwnerAnalyticsScreen() {
  const { lang, pick, numberLocale, dateLocale } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const accent = isDark ? "#34d399" : "#059669";
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const chipScale = useMemo(
    () => Object.fromEntries(ANALYTICS_PERIODS.map((p) => [p.key, new Animated.Value(p.key === "30d" ? 1 : 0.96)])),
    [],
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
    ANALYTICS_PERIODS.forEach((p) => {
      Animated.spring(chipScale[p.key], {
        toValue: period === p.key ? 1 : 0.96,
        useNativeDriver: true,
        friction: 6,
      }).start();
    });
  }, [period, chipScale]);

  const fmtMoney = (n) => `${Number(n || 0).toLocaleString(numberLocale)} MAD`;

  const monthly = Array.isArray(data?.monthlyRevenue) ? data.monthlyRevenue : [];
  const trends = Array.isArray(data?.bookingTrends) ? data.bookingTrends : [];

  if (loading && !data) return <PageLoader />;

  if (!data) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg, padding: 24 }]}>
        <Ionicons name="analytics-outline" size={52} color={C.muted} />
        <Text style={{ color: C.white, textAlign: "center", marginTop: 16, fontSize: 16 }}>{pick("Could not load analytics.", "Impossible de charger les statistiques.")}</Text>
      </View>
    );
  }

  const growth = data.revenueGrowth;
  const growthStr = growth > 0 ? `+${growth}%` : growth < 0 ? `${growth}%` : "—";
  const growthPositive = growth > 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={accent} />}
    >
      <AnalyticsEliteHero
        fr={fr}
        isDark={isDark}
        insets={insets}
        period={period}
        onPeriodChange={setPeriod}
        chipScale={chipScale}
        titleColor={titleColor}
        subColor={subColor}
        accent={accent}
      />

      <AnalyticsCommandCard
        data={data}
        fr={fr}
        isDark={isDark}
        titleColor={titleColor}
        subColor={subColor}
        accent={accent}
        fmtMoney={fmtMoney}
      />

      <AnalyticsTrendFusion
        monthly={monthly}
        trends={trends}
        fr={fr}
        isDark={isDark}
        titleColor={titleColor}
        subColor={subColor}
        accent={accent}
        fmtMoney={fmtMoney}
      />

      {Array.isArray(data.bookingStatusData) && data.bookingStatusData.some((x) => x.value > 0) && (
        <SectionCard
          title={pick("Booking pipeline", "Pipeline réservations")}
          subtitle={pick("Status mix at a glance.", "Répartition des statuts — d’un coup d’œil.")}
          C={C}
          accent="#fbbf24"
        >
          <StatusPipeline rows={data.bookingStatusData} C={C} />
        </SectionCard>
      )}

      <SectionCard
        title={pick("Cash flow", "Trésorerie")}
        subtitle={pick("Collected, pending & costs.", "Encaissement, attente et coûts.")}
        C={C}
        accent="#34d399"
      >
        <View style={{ gap: 12 }}>
          {[
            { id: "collected", label: pick("Collected", "Encaissé", "محصّل"), val: fmtMoney(data.collectedRevenue), icon: "checkmark-circle-outline", col: "#34d399" },
            { id: "pending", label: pick("Pending", "En attente", "قيد الانتظار"), val: fmtMoney(data.pendingRevenue), icon: "time-outline", col: "#fbbf24" },
            { id: "maintenance", label: pick("Maintenance", "Entretien", "صيانة"), val: fmtMoney(data.totalMaintenanceCost), icon: "construct-outline", col: "#f87171" },
            {
              id: "growth",
              label: pick("Revenue vs prev.", "Évolution CA", "الإيرادات مقارنة بالفترة السابقة"),
              val: growthStr,
              icon: growthPositive ? "trending-up-outline" : "remove-outline",
              col: growthPositive ? "#34d399" : C.muted,
            },
            { id: "avg-daily", label: pick("Avg. daily", "CA moy. / jour", "متوسط يومي"), val: fmtMoney(data.avgDailyRevenue), icon: "bar-chart-outline", col: C.primary },
          ].map((row) => (
            <View
              key={row.id}
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
              <Ionicons name={row.icon} size={22} color={row.col} style={{ marginRight: 12 }} />
              <Text style={{ color: C.muted, fontSize: 13, flex: 1 }}>{row.label}</Text>
              <Text style={{ color: C.white, fontWeight: "800", fontSize: 14 }}>{row.val}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      {data.mostRentedCar && (
        <SectionCard
          title={pick("Star vehicle", "Véhicule star")}
          subtitle={pick("Most booked this period.", "Le plus réservé sur la période.")}
          C={C}
          accent="#f472b6"
        >
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
                  {data.mostRentedCar.count} {pick("bookings", "réservations")} · {pick("current period", "période actuelle")}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </SectionCard>
      )}

      {Array.isArray(data.fleetPerformance) && data.fleetPerformance.length > 0 && (
        <SectionCard
          title={pick("Fleet leaderboard", "Performance flotte")}
          subtitle={pick("Revenue share per vehicle (animated bars).", "Part du revenu par véhicule (barres animées).")}
          C={C}
          accent="#818cf8"
        >
          <FleetBars
            key={`fl-${period}-${data.fleetPerformance.map((f) => f.rentalId).join("-")}`}
            items={data.fleetPerformance}
            fmtMoney={fmtMoney}
            C={C}
          />
        </SectionCard>
      )}

      {Array.isArray(data.demandHeatmap) && data.demandHeatmap.length > 0 && (
        <SectionCard
          title={pick("Demand map", "Carte de demande")}
          subtitle={pick("Busiest weekdays (cumulative).", "Jours les plus sollicités (période cumulée).")}
          C={C}
          accent="#2dd4bf"
        >
          <HeatGrid heatmap={data.demandHeatmap} C={C} lang={lang} />
        </SectionCard>
      )}

      {Array.isArray(data.upcomingRentals) && data.upcomingRentals.length > 0 && (
        <SectionCard
          title={pick("Upcoming", "À venir")}
          subtitle={pick("Next confirmed trips.", "Prochains départs confirmés.")}
          C={C}
          accent="#94a3b8"
        >
          <View style={{ gap: 10 }}>
            {data.upcomingRentals.map((b, idx) => (
              <View
                key={b._id ? String(b._id) : `upcoming-${idx}`}
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
                  {new Date(b.startDate).toLocaleDateString(dateLocale)} → {new Date(b.endDate).toLocaleDateString(dateLocale)}
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>
      )}

      {insights.length > 0 && (
        <SectionCard
          title={pick("Goovoiture recommendation", "Recommandation Goovoiture")}
          subtitle={pick("Tailored tips for your fleet.", "Conseils adaptés à votre flotte.")}
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

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
