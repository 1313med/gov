import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
  Pressable,
  Dimensions,
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

const { width: SCREEN_W } = Dimensions.get("window");

function useStaggeredEntrance(count, enabled, startDelay = 100) {
  const anims = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translate: new Animated.Value(32),
    }))
  ).current;

  const run = useCallback(() => {
    anims.forEach((a) => {
      a.opacity.setValue(0);
      a.translate.setValue(32);
    });
    Animated.stagger(
      65,
      anims.map((a) =>
        Animated.parallel([
          Animated.timing(a.opacity, {
            toValue: 1,
            duration: 540,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(a.translate, {
            toValue: 0,
            friction: 8,
            tension: 48,
            useNativeDriver: true,
          }),
        ])
      )
    ).start();
  }, [anims]);

  useEffect(() => {
    if (!enabled) return;
    const t = setTimeout(run, startDelay);
    return () => clearTimeout(t);
  }, [enabled, run, startDelay]);

  return anims;
}

function GlowOrb({ colors, style, scaleAnim }) {
  return (
    <Animated.View style={[{ position: "absolute", borderRadius: 999, opacity: 0.5 }, style, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function ShimmerBar({ isDark }) {
  const x = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(x, { toValue: -1, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [x]);
  const translateX = x.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_W * 0.5, SCREEN_W * 0.5],
  });
  return (
    <View style={[s.shimmerTrack, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]}>
      <Animated.View
        style={[
          s.shimmerFill,
          {
            backgroundColor: isDark ? "rgba(52,211,153,0.45)" : "rgba(5,150,105,0.35)",
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

function AnimatedNumber({ value, formatter, textColor, duration = 900 }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    anim.setValue(0);
    const id = anim.addListener(({ value: v }) => setDisplay(v));
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value, anim, duration]);

  return <Text style={[s.heroRevenueValue, { color: textColor }]}>{formatter(display)}</Text>;
}

function OccupancyRing({ percent, accent, isDark, fr }) {
  const spin = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
      Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 12000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const p = Math.min(100, Math.max(0, percent));

  return (
    <Animated.View style={[s.ringOuter, { transform: [{ scale }] }]}>
      <Animated.View style={[s.ringGlow, { transform: [{ rotate }] }]}>
        <LinearGradient
          colors={[`${accent}00`, accent, "#a78bfa", `${accent}00`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={[s.ringInner, { backgroundColor: isDark ? "#0c1210" : "#f8fafc" }]}>
        <Text style={[s.ringPercent, { color: isDark ? "#f8fafc" : "#0f172a" }]}>{Math.round(p)}%</Text>
        <Text style={[s.ringLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>
          {fr ? "Occupation" : "Occupancy"}
        </Text>
      </View>
      <View style={[s.ringArc, { width: `${p}%`, backgroundColor: accent }]} />
    </Animated.View>
  );
}

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

function MiniSparkline({ data, valueKey, color, isDark, height = 52 }) {
  const maxVal = Math.max(1, ...data.map((d) => d[valueKey] || 0));
  const animsRef = useRef(null);
  if (!animsRef.current || animsRef.current.length !== data.length) {
    animsRef.current = (data.length ? data : [{ m: 0 }]).map(() => new Animated.Value(0));
  }
  const anims = animsRef.current;

  useEffect(() => {
    data.forEach((d, i) => {
      const target = maxVal > 0 ? (d[valueKey] || 0) / maxVal : 0;
      Animated.spring(anims[i], {
        toValue: target,
        friction: 7,
        tension: 44,
        delay: i * 40,
        useNativeDriver: false,
      }).start();
    });
  }, [data, valueKey, maxVal, anims]);

  if (!data.length) {
    return (
      <View style={[s.sparkEmpty, { height, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }]}>
        <Text style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: 11, fontWeight: "600" }}>—</Text>
      </View>
    );
  }

  return (
    <View style={[s.sparkRow, { height }]}>
      {data.map((d, i) => {
        const barH = anims[i].interpolate({ inputRange: [0, 1], outputRange: [4, height - 8] });
        return (
          <View key={`${d.month || i}`} style={s.sparkCol}>
            <View style={[s.sparkTrack, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]}>
              <Animated.View style={[s.sparkFill, { height: barH, backgroundColor: color }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function StatusPipelineBar({ rows, isDark }) {
  const positive = rows.filter((r) => r.value > 0);
  const total = positive.reduce((sum, r) => sum + r.value, 0);
  if (!total) {
    return (
      <Text style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: 12, fontWeight: "600" }}>
        —
      </Text>
    );
  }
  return (
    <View>
      <View style={[s.pipelineBar, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]}>
        {positive.map((r) => (
          <View key={r.name} style={{ flex: r.value, backgroundColor: statusColor(r.name) }} />
        ))}
      </View>
      <View style={s.pipelineLegend}>
        {rows.map((r) =>
          r.value > 0 ? (
            <View key={r.name} style={s.pipelineLegendItem}>
              <View style={[s.pipelineLegendDot, { backgroundColor: statusColor(r.name) }]} />
              <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 10, fontWeight: "700" }}>
                {r.name}{" "}
                <Text style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>{r.value}</Text>
              </Text>
            </View>
          ) : null
        )}
      </View>
    </View>
  );
}

function PremiumMetricCard({
  icon,
  kicker,
  label,
  value,
  sub,
  colors,
  anim,
  isDark,
  titleColor,
  glassBorder,
  wide,
  onPress,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.45, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const cardW = wide ? SCREEN_W - 40 : SCREEN_W * 0.72;

  const body = (
    <Animated.View
      style={[
        s.metricCardOuter,
        {
          width: cardW,
          opacity: anim?.opacity ?? 1,
          transform: [{ translateY: anim?.translate ?? 0 }, { scale }],
        },
      ]}
    >
      <Animated.View style={[s.metricGlowRing, { opacity: glow, borderColor: `${colors[0]}55` }]} />
      <LinearGradient
        colors={
          isDark
            ? [`${colors[0]}28`, `${colors[1] || colors[0]}10`, "rgba(255,255,255,0.04)"]
            : [`${colors[0]}20`, `${colors[1] || colors[0]}08`, "rgba(255,255,255,0.95)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[s.metricCard, { borderColor: `${colors[0]}40` }]}
      >
        <LinearGradient colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]} style={s.metricSheen} />
        <View style={s.metricTop}>
          <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.metricIconRing}>
            <Ionicons name={icon} size={22} color="#fff" />
          </LinearGradient>
          {kicker ? (
            <View style={[s.metricKicker, { borderColor: `${colors[0]}50`, backgroundColor: `${colors[0]}18` }]}>
              <Text style={{ color: colors[0], fontSize: 9, fontWeight: "800", letterSpacing: 1.2 }}>{kicker}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[s.metricLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>{label}</Text>
        <Text style={[s.metricValue, { color: titleColor }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
          {value}
        </Text>
        {sub ? <Text style={[s.metricSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>{sub}</Text> : null}
        <LinearGradient colors={[colors[0], "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.metricRule} />
      </LinearGradient>
    </Animated.View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start()}
    >
      {body}
    </Pressable>
  );
}

function MetricsElitePanel({
  stats,
  fr,
  isDark,
  titleColor,
  glassBorder,
  accent,
  violet,
  cyan,
  gold,
  kpiAnims,
  listingViewAttentionCount,
  pendingCount,
  formatMad,
  router,
}) {
  const netProfit = stats?.netProfit ?? 0;
  const collected = stats?.collectedRevenue ?? 0;
  const pendingRev = stats?.pendingRevenue ?? 0;
  const bookings = stats?.totalBookings ?? 0;
  const confirmed =
    stats?.bookingStatusData?.find((x) => String(x.name).toLowerCase() === "confirmed")?.value ?? 0;
  const monthly = stats?.monthlyRevenue ?? [];
  const statusRows = stats?.bookingStatusData ?? [];

  const deckGrad = isDark
    ? ["rgba(15,23,42,0.85)", "rgba(52,211,153,0.08)", "rgba(124,107,255,0.06)"]
    : ["rgba(255,255,255,0.95)", "rgba(209,250,229,0.5)", "rgba(224,242,254,0.45)"];

  return (
    <View style={s.metricsPanel}>
      <LinearGradient colors={deckGrad} style={[s.metricsDeck, { borderColor: glassBorder }]}>
        <View style={s.metricsDeckHead}>
          <View>
            <Text style={[s.metricsDeckEyebrow, { color: accent }]}>
              {fr ? "INTELLIGENCE FLOTTE" : "FLEET INTELLIGENCE"}
            </Text>
            <Text style={[s.metricsDeckTitle, { color: titleColor }]}>
              {fr ? "Performance & répartition" : "Performance & breakdown"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/owner-analytics")} style={[s.deckLink, { borderColor: `${accent}45` }]}>
            <Ionicons name="analytics" size={16} color={accent} />
          </TouchableOpacity>
        </View>

        <Text style={[s.deckChartLabel, { color: isDark ? "#64748b" : "#94a3b8" }]}>
          {fr ? "Revenus mensuels" : "Monthly revenue"}
        </Text>
        <MiniSparkline data={monthly} valueKey="revenue" color={accent} isDark={isDark} height={56} />

        <View style={[s.deckDivider, { backgroundColor: glassBorder }]} />

        <Text style={[s.deckChartLabel, { color: isDark ? "#64748b" : "#94a3b8", marginBottom: 10 }]}>
          {fr ? "Statuts des réservations" : "Booking status mix"}
        </Text>
        <StatusPipelineBar rows={statusRows} isDark={isDark} />
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.metricsCarousel}
        decelerationRate="fast"
      >
        <PremiumMetricCard
          wide
          anim={kpiAnims[0]}
          icon="wallet"
          kicker={fr ? "RÉSULTAT" : "BOTTOM LINE"}
          label={fr ? "Profit net (30 j.)" : "Net profit (30d)"}
          value={formatMad(netProfit)}
          sub={
            netProfit >= 0
              ? fr
                ? "Après coûts d'entretien"
                : "After maintenance costs"
              : fr
                ? "Entretien > revenus sur la période"
                : "Maintenance exceeded revenue"
          }
          colors={netProfit >= 0 ? ["#34d399", "#10b981"] : ["#f87171", "#ef4444"]}
          isDark={isDark}
          titleColor={titleColor}
          glassBorder={glassBorder}
          onPress={() => router.push("/owner-analytics")}
        />
        <PremiumMetricCard
          anim={kpiAnims[1]}
          icon="checkmark-circle"
          kicker={fr ? "ENCAISSÉ" : "COLLECTED"}
          label={fr ? "Revenus encaissés" : "Collected revenue"}
          value={formatMad(collected)}
          sub={fr ? "Réservations payées" : "Paid bookings"}
          colors={["#38bdf8", "#0ea5e9"]}
          isDark={isDark}
          titleColor={titleColor}
          glassBorder={glassBorder}
        />
        <PremiumMetricCard
          anim={kpiAnims[2]}
          icon="hourglass"
          kicker={fr ? "PIPELINE" : "PIPELINE"}
          label={fr ? "Revenus en attente" : "Pending revenue"}
          value={formatMad(pendingRev)}
          sub={fr ? "Confirmées, non payées" : "Confirmed, unpaid"}
          colors={[violet, "#5b4ddb"]}
          isDark={isDark}
          titleColor={titleColor}
          glassBorder={glassBorder}
        />
        <PremiumMetricCard
          anim={kpiAnims[3]}
          icon="calendar"
          kicker={fr ? "VOLUME" : "VOLUME"}
          label={fr ? "Réservations totales" : "Total bookings"}
          value={String(bookings)}
          sub={fr ? "Tous statuts confondus" : "All statuses combined"}
          colors={[violet, "#7c6bff"]}
          isDark={isDark}
          titleColor={titleColor}
          glassBorder={glassBorder}
          onPress={() => router.push("/owner-bookings")}
        />
        <PremiumMetricCard
          anim={kpiAnims[4]}
          icon="car-sport"
          kicker={fr ? "ACTIF" : "LIVE"}
          label={fr ? "Confirmées" : "Confirmed"}
          value={String(confirmed)}
          sub={fr ? "En cours ou à venir" : "Active or upcoming"}
          colors={[cyan, "#0284c7"]}
          isDark={isDark}
          titleColor={titleColor}
          glassBorder={glassBorder}
        />
        <PremiumMetricCard
          anim={kpiAnims[5]}
          icon="flash"
          kicker={listingViewAttentionCount > 0 ? (fr ? "SIGNAL" : "SIGNAL") : undefined}
          label={fr ? "Vues & demandes" : "Views & requests"}
          value={listingViewAttentionCount > 0 ? `+${listingViewAttentionCount}` : String(pendingCount)}
          sub={
            listingViewAttentionCount > 0
              ? fr
                ? "Nouvelles vues sur vos annonces"
                : "New listing views"
              : fr
                ? `${pendingCount} en attente d'approbation`
                : `${pendingCount} awaiting approval`
          }
          colors={[gold, "#f59e0b"]}
          isDark={isDark}
          titleColor={titleColor}
          glassBorder={glassBorder}
          onPress={() =>
            listingViewAttentionCount > 0
              ? router.push("/owner-listing-views")
              : router.push("/owner-bookings")
          }
        />
      </ScrollView>
    </View>
  );
}

function PipelineCard({ booking, onPress, anim, accent, isDark, C, fr }) {
  const title =
    booking.rentalId?.title ||
    `${booking.rentalId?.brand || ""} ${booking.rentalId?.model || ""}`.trim() ||
    "Rental";

  return (
    <Animated.View style={{ opacity: anim?.opacity ?? 1, transform: [{ translateY: anim?.translate ?? 0 }] }}>
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
        <LinearGradient
          colors={isDark ? ["rgba(251,191,36,0.12)", "rgba(255,255,255,0.04)"] : ["rgba(251,191,36,0.14)", "rgba(255,255,255,0.95)"]}
          style={[s.pipelineCard, { borderColor: isDark ? "rgba(251,191,36,0.28)" : "rgba(251,191,36,0.35)" }]}
        >
          <LinearGradient colors={["#fbbf24", "#f59e0b"]} style={s.pipelineStripe} />
          <View style={s.pipelineBody}>
            <View style={s.pipelineTop}>
              <View style={s.pipelinePulse}>
                <View style={s.pipelineDot} />
              </View>
              <Text style={[s.pipelineTitle, { color: isDark ? "#f8fafc" : "#0f172a" }]} numberOfLines={1}>
                {title}
              </Text>
            </View>
            <Text style={{ color: C.muted, fontSize: 12, fontWeight: "600", marginTop: 4 }}>
              {new Date(booking.startDate).toLocaleDateString(fr ? "fr-FR" : "en-GB")} →{" "}
              {new Date(booking.endDate).toLocaleDateString(fr ? "fr-FR" : "en-GB")}
            </Text>
          </View>
          <View style={s.pipelineEnd}>
            <Text style={[s.pipelineAmount, { color: accent }]}>
              {Number(booking.totalAmount).toLocaleString(fr ? "fr-FR" : "en-US")}
            </Text>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: "700" }}>MAD</Text>
            <Ionicons name="arrow-forward-circle" size={22} color={accent} style={{ marginTop: 6 }} />
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function DashboardSkeleton({ isDark, accent }) {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
      <View style={[s.skelHero, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)" }]}>
        <ShimmerBar isDark={isDark} />
      </View>
      <View style={s.statsGrid}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[s.skelTile, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(15,23,42,0.04)" }]}
          />
        ))}
      </View>
    </View>
  );
}

export default function RentalOwnerDashboard() {
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bookingAttentionCount = useOwnerBookingAttentionCount();
  const listingViewAttentionCount = useOwnerListingViewAttentionCount();

  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const orbPulse = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(36)).current;
  const livePulse = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  const kpiAnims = useStaggeredEntrance(6, !loading, 280);
  const pipelineAnims = useStaggeredEntrance(Math.max(pending.length, 1), !loading && pending.length > 0, 520);
  const quickAnims = useStaggeredEntrance(4, !loading, 640);

  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#475569";
  const glassBorder = isDark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.08)";

  const accent = isDark ? "#34d399" : "#059669";
  const accentDeep = isDark ? "#10b981" : "#047857";
  const violet = isDark ? "#a78bfa" : "#6248e8";
  const cyan = isDark ? "#38bdf8" : "#0284c7";
  const gold = "#fbbf24";

  const heroGrad = isDark
    ? ["#010806", "#041a12", "#0c1220", "#03040a"]
    : ["#ecfdf5", "#d1fae5", "#e0f2fe", "#f8fafc"];
  const ctaGrad = isDark ? ["#34d399", "#10b981", "#059669"] : ["#059669", "#10b981", "#047857"];
  const glassGrad = isDark
    ? ["rgba(52,211,153,0.18)", "rgba(124,107,255,0.1)", "rgba(255,255,255,0.04)"]
    : ["rgba(255,255,255,0.92)", "rgba(209,250,229,0.85)", "rgba(224,242,254,0.7)"];

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.14, duration: 4800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 4800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    const live = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, { toValue: 1.35, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(livePulse, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    pulse.start();
    live.start();
    return () => {
      pulse.stop();
      live.stop();
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const [analyticsData, bookingsRes] = await Promise.all([
        getOwnerAnalytics("30d").catch(() => null),
        getOwnerBookings({ status: "pending", limit: 5 }).catch(() => null),
      ]);
      setStats(analyticsData);
      const payload = bookingsRes?.data;
      const list = Array.isArray(payload?.bookings)
        ? payload.bookings
        : Array.isArray(payload)
          ? payload
          : [];
      setPending(list.slice(0, 5));
    } catch {
      setStats(null);
      setPending([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.parallel([
        Animated.timing(heroOpacity, { toValue: 1, duration: 620, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(heroSlide, { toValue: 0, friction: 8, tension: 42, useNativeDriver: true }),
        Animated.timing(contentFade, { toValue: 1, duration: 500, delay: 120, useNativeDriver: true }),
      ]).start();
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const revenue30d = stats?.totalRevenue ?? 0;
  const occupancy = stats?.occupancyRate ?? 0;
  const revenueGrowth = stats?.revenueGrowth ?? 0;
  const firstName = auth?.name?.split(" ")[0] || "";

  const heroParallax = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  const formatMad = (n) =>
    `${Math.round(n).toLocaleString(fr ? "fr-FR" : "en-US")} MAD`;

  if (loading && !stats) return <PageLoader />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 36 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={accent} />}
      >
        <Animated.View style={{ transform: [{ translateY: heroParallax }] }}>
          <LinearGradient colors={heroGrad} locations={[0, 0.35, 0.72, 1]} style={[s.hero, { paddingTop: insets.top + 10 }]}>
            <GlowOrb scaleAnim={orbPulse} colors={isDark ? ["rgba(52,211,153,0.55)", "rgba(52,211,153,0)"] : ["rgba(5,150,105,0.35)", "rgba(5,150,105,0)"]} style={{ width: 300, height: 300, top: -100, right: -110 }} />
            <GlowOrb scaleAnim={orbPulse} colors={isDark ? ["rgba(167,139,250,0.4)", "rgba(167,139,250,0)"] : ["rgba(98,72,232,0.28)", "rgba(98,72,232,0)"]} style={{ width: 240, height: 240, bottom: 20, left: -120 }} />
            <GlowOrb scaleAnim={orbPulse} colors={isDark ? ["rgba(56,189,248,0.25)", "rgba(56,189,248,0)"] : ["rgba(14,165,233,0.2)", "rgba(14,165,233,0)"]} style={{ width: 160, height: 160, top: 120, right: 40 }} />

            <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroSlide }] }}>
              <View style={s.heroTopRow}>
                <View style={s.brandRow}>
                  <LinearGradient colors={ctaGrad} style={s.brandIcon}>
                    <Ionicons name="business" size={18} color="#fff" />
                  </LinearGradient>
                  <View>
                    <Text style={[s.brandName, { color: titleColor }]}>
                      Goo<Text style={{ color: accent, fontStyle: "italic" }}>voiture</Text>
                    </Text>
                    <Text style={[s.brandTag, { color: subColor }]}>
                      {fr ? "Suite propriétaire loueur" : "Rental owner suite"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/notifications")}
                  activeOpacity={0.85}
                  style={[s.notifBtn, { borderColor: glassBorder, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.75)" }]}
                >
                  <Ionicons name="notifications-outline" size={20} color={titleColor} />
                  {(bookingAttentionCount > 0 || listingViewAttentionCount > 0) && (
                    <View style={s.notifBadge}>
                      <Text style={s.notifBadgeText}>
                        {bookingAttentionCount + listingViewAttentionCount > 99
                          ? "99+"
                          : bookingAttentionCount + listingViewAttentionCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <View style={s.liveRow}>
                <Animated.View style={[s.liveDotWrap, { transform: [{ scale: livePulse }] }]}>
                  <View style={[s.liveDot, { backgroundColor: accent }]} />
                </Animated.View>
                <Text style={[s.liveText, { color: accent }]}>{fr ? "Flotte en direct" : "Fleet live"}</Text>
                <View style={[s.liveDivider, { backgroundColor: glassBorder }]} />
                <Text style={[s.liveSub, { color: subColor }]}>{fr ? "30 derniers jours" : "Last 30 days"}</Text>
              </View>

              <Text style={[s.heroGreeting, { color: titleColor }]}>
                {fr ? "Bonjour" : "Welcome back"}
                {firstName ? `, ${firstName}` : ""}
              </Text>
              <Text style={[s.heroPitch, { color: subColor }]}>
                {fr
                  ? "Pilotez revenus, réservations et visibilité depuis un seul cockpit premium."
                  : "Command revenue, bookings, and visibility from one premium cockpit."}
              </Text>

              {!loading && (
                <LinearGradient colors={glassGrad} style={[s.revenueGlass, { borderColor: glassBorder }]}>
                  <View style={s.revenueRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.revenueEyebrow, { color: accent }]}>{fr ? "REVENUS" : "REVENUE"}</Text>
                      <AnimatedNumber value={revenue30d} formatter={formatMad} textColor={titleColor} />
                      <ShimmerBar isDark={isDark} />
                      <View style={s.revenueMeta}>
                        <Ionicons
                          name={revenueGrowth >= 0 ? "trending-up" : "trending-down"}
                          size={14}
                          color={revenueGrowth >= 0 ? accent : "#f87171"}
                        />
                        <Text style={{ color: subColor, fontSize: 12, fontWeight: "600", marginLeft: 6 }}>
                          {revenueGrowth >= 0 ? "+" : ""}
                          {revenueGrowth}% {fr ? "vs période préc." : "vs prior period"}
                        </Text>
                      </View>
                    </View>
                    <OccupancyRing percent={occupancy} accent={accent} isDark={isDark} fr={fr} />
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push("/owner-analytics")}
                    activeOpacity={0.88}
                    style={s.analyticsCta}
                  >
                    <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.analyticsCtaInner}>
                      <Ionicons name="analytics" size={18} color="#fff" />
                      <Text style={s.analyticsCtaText}>{fr ? "Ouvrir les analytiques" : "Open analytics"}</Text>
                      <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.9)" />
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              )}
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={{ opacity: contentFade, paddingHorizontal: 20, paddingTop: 4 }}>
            <Text style={[s.sectionEyebrow, { color: accent }]}>{fr ? "Indicateurs" : "Metrics"}</Text>
            <Text style={[s.sectionTitle, { color: titleColor, marginBottom: 12 }]}>
              {fr ? "Vue d'ensemble" : "At a glance"}
            </Text>

            <MetricsElitePanel
              stats={stats}
              fr={fr}
              isDark={isDark}
              titleColor={titleColor}
              glassBorder={glassBorder}
              accent={accent}
              violet={violet}
              cyan={cyan}
              gold={gold}
              C={C}
              kpiAnims={kpiAnims}
              listingViewAttentionCount={listingViewAttentionCount}
              pendingCount={pending.length}
              formatMad={formatMad}
              router={router}
            />

            <View style={s.sectionHead}>
              <View>
                <Text style={[s.sectionEyebrow, { color: gold, marginBottom: 4 }]}>
                  {fr ? "Pipeline" : "Pipeline"}
                </Text>
                <Text style={[s.sectionTitle, { color: titleColor, marginBottom: 0 }]}>
                  {fr ? "Demandes à valider" : "Awaiting approval"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/owner-bookings")} style={[s.seeAllBtn, { borderColor: glassBorder }]}>
                <Text style={{ color: accent, fontSize: 12, fontWeight: "800" }}>{fr ? "Tout voir" : "See all"}</Text>
              </TouchableOpacity>
            </View>

            {pending.length === 0 ? (
              <LinearGradient
                colors={isDark ? ["rgba(52,211,153,0.1)", "rgba(255,255,255,0.03)"] : ["rgba(209,250,229,0.5)", "rgba(255,255,255,0.9)"]}
                style={[s.emptyPipeline, { borderColor: `${accent}40` }]}
              >
                <LinearGradient colors={ctaGrad} style={s.emptyIcon}>
                  <Ionicons name="checkmark-done" size={28} color="#fff" />
                </LinearGradient>
                <Text style={[s.emptyTitle, { color: titleColor }]}>
                  {fr ? "Pipeline à jour" : "Pipeline clear"}
                </Text>
                <Text style={{ color: subColor, fontSize: 13, textAlign: "center", lineHeight: 20, marginTop: 6 }}>
                  {fr ? "Aucune réservation en attente — votre flotte tourne à plein régime." : "No pending bookings — your fleet is running smoothly."}
                </Text>
              </LinearGradient>
            ) : (
              pending.map((b, i) => (
                <PipelineCard
                  key={b._id}
                  booking={b}
                  anim={pipelineAnims[i]}
                  accent={accent}
                  isDark={isDark}
                  C={C}
                  fr={fr}
                  onPress={() =>
                    router.push({
                      pathname: "/(rental-owner)/bookings",
                      params: { openBookingId: b._id },
                    })
                  }
                />
              ))
            )}

            <Text style={[s.sectionEyebrow, { color: violet, marginTop: 28 }]}>{fr ? "Outils" : "Toolbox"}</Text>
            <Text style={[s.sectionTitle, { color: titleColor }]}>{fr ? "Boîte à outils" : "Fleet toolbox"}</Text>
            <Text style={{ color: subColor, fontSize: 13, marginBottom: 14, lineHeight: 20 }}>
              {fr
                ? "Calendrier, visibilité, entretien et nouvelles annonces — en un geste."
                : "Calendar, visibility, maintenance, and new listings — one tap away."}
            </Text>

            <View style={s.quickStack}>
              {[
                {
                  key: "cal",
                  node: (
                    <QuickActionCard
                      featured
                      featuredKicker={fr ? "PLANNING" : "SCHEDULE"}
                      featuredSubtitle={fr ? "Disponibilités & réservations" : "Availability & bookings"}
                      icon="calendar-outline"
                      label={fr ? "Calendrier" : "Calendar"}
                      onPress={() => router.push("/owner-booking-calendar")}
                      C={C}
                      isDark={isDark}
                      labelColor={titleColor}
                      color={accent}
                    />
                  ),
                },
                {
                  key: "views",
                  node: (
                    <QuickActionCard
                      elevated
                      elevatedKicker={fr ? "SIGNAL" : "SIGNAL"}
                      elevatedSubtitle={fr ? "Intérêt sur vos annonces" : "Interest on your listings"}
                      icon="pulse-outline"
                      label={fr ? "Vues des annonces" : "Listing views"}
                      onPress={() => router.push("/owner-listing-views")}
                      C={C}
                      isDark={isDark}
                      labelColor={titleColor}
                      attentionCount={listingViewAttentionCount}
                      attentionWeight="soft"
                    />
                  ),
                },
                {
                  key: "maint",
                  node: (
                    <QuickActionCard
                      icon="construct-outline"
                      label={fr ? "Maintenance" : "Maintenance"}
                      onPress={() => router.push("/maintenance")}
                      C={C}
                      isDark={isDark}
                      labelColor={titleColor}
                    />
                  ),
                },
                {
                  key: "add",
                  node: (
                    <QuickActionCard
                      icon="add-circle-outline"
                      label={fr ? "Ajouter location" : "Add rental"}
                      onPress={() => router.push("/add-rental")}
                      C={C}
                      isDark={isDark}
                      labelColor={titleColor}
                      color={accentDeep}
                    />
                  ),
                },
              ].map((item, i) => (
                <Animated.View
                  key={item.key}
                  style={{
                    opacity: quickAnims[i]?.opacity ?? 1,
                    transform: [{ translateY: quickAnims[i]?.translate ?? 0 }],
                  }}
                >
                  {item.node}
                </Animated.View>
              ))}
            </View>

            <LinearGradient
              colors={isDark ? ["rgba(124,107,255,0.12)", "rgba(52,211,153,0.08)"] : ["rgba(209,250,229,0.6)", "rgba(224,242,254,0.5)"]}
              style={[s.footerCard, { borderColor: glassBorder }]}
            >
              <Ionicons name="sparkles" size={20} color={violet} />
              <Text style={[s.footerText, { color: titleColor }]}>
                {fr ? "Flotte premium — vous êtes aux commandes." : "Premium fleet — you're in command."}
              </Text>
            </LinearGradient>
          </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 22, paddingBottom: 28, overflow: "hidden" },
  heroTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  brandName: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  brandTag: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notifBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notifBadgeText: { color: "#fff", fontSize: 10, fontWeight: "900" },
  liveRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  liveDotWrap: { marginRight: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase" },
  liveDivider: { width: 1, height: 12, marginHorizontal: 10 },
  liveSub: { fontSize: 11, fontWeight: "600" },
  heroGreeting: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, lineHeight: 34 },
  heroPitch: { fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 20, fontWeight: "500", maxWidth: 320 },
  revenueGlass: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  revenueRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  revenueEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 2, marginBottom: 6 },
  heroRevenueValue: { fontSize: 26, fontWeight: "900", letterSpacing: -0.8 },
  revenueMeta: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  analyticsCta: { marginTop: 18 },
  analyticsCtaInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  analyticsCtaText: { color: "#fff", fontWeight: "800", fontSize: 14, flex: 1, textAlign: "center" },
  ringOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    opacity: 0.85,
    padding: 3,
  },
  ringInner: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  ringPercent: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  ringLabel: { fontSize: 9, fontWeight: "700", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.6 },
  ringArc: { position: "absolute", bottom: 0, left: 0, height: 3, borderRadius: 2, zIndex: 3 },
  sectionEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.6, textTransform: "uppercase" },
  sectionTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5, marginBottom: 16 },
  sectionHead: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14, marginTop: 8 },
  seeAllBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  metricsPanel: { marginBottom: 20, marginHorizontal: -20 },
  metricsDeck: {
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  metricsDeckHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  metricsDeckEyebrow: { fontSize: 9, fontWeight: "800", letterSpacing: 2 },
  metricsDeckTitle: { fontSize: 18, fontWeight: "800", letterSpacing: -0.4, marginTop: 4 },
  deckLink: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  deckChartLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 },
  deckDivider: { height: 1, marginVertical: 16 },
  sparkRow: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  sparkCol: { flex: 1 },
  sparkTrack: { borderRadius: 6, height: "100%", justifyContent: "flex-end", overflow: "hidden" },
  sparkFill: { borderRadius: 6, width: "100%" },
  sparkEmpty: { borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pipelineBar: { flexDirection: "row", height: 12, borderRadius: 8, overflow: "hidden" },
  pipelineLegend: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  pipelineLegendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  pipelineLegendDot: { width: 7, height: 7, borderRadius: 4 },
  metricsCarousel: { paddingHorizontal: 20, gap: 14, paddingBottom: 4 },
  metricCardOuter: { position: "relative" },
  metricGlowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    borderWidth: 1.5,
    margin: -2,
  },
  metricCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    minHeight: 148,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  metricSheen: { position: "absolute", top: 0, left: 24, right: 24, height: 1 },
  metricTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  metricIconRing: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  metricKicker: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  metricLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  metricValue: { fontSize: 28, fontWeight: "900", letterSpacing: -0.8, marginTop: 6 },
  metricSub: { fontSize: 12, fontWeight: "600", marginTop: 8, lineHeight: 17 },
  metricRule: { height: 3, borderRadius: 2, marginTop: 14, width: 48 },
  pipelineCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  pipelineStripe: { width: 4, alignSelf: "stretch" },
  pipelineBody: { flex: 1, paddingVertical: 14, paddingHorizontal: 14 },
  pipelineTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  pipelinePulse: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(251,191,36,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  pipelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fbbf24" },
  pipelineTitle: { fontSize: 15, fontWeight: "800", flex: 1 },
  pipelineEnd: { alignItems: "flex-end", paddingRight: 14, paddingVertical: 12 },
  pipelineAmount: { fontSize: 17, fontWeight: "900", letterSpacing: -0.3 },
  emptyPipeline: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    marginBottom: 8,
  },
  emptyIcon: { width: 56, height: 56, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 17, fontWeight: "800", marginTop: 14 },
  quickStack: { gap: 0 },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 24,
  },
  footerText: { flex: 1, fontSize: 14, fontWeight: "700", lineHeight: 20 },
  shimmerTrack: { height: 2, borderRadius: 1, overflow: "hidden", marginTop: 12, marginBottom: 4 },
  shimmerFill: { width: "45%", height: "100%", borderRadius: 1 },
  skelHero: { height: 140, borderRadius: 24, marginBottom: 20, overflow: "hidden", padding: 20 },
  skelTile: { width: "47%", height: 108, borderRadius: 20 },
});
