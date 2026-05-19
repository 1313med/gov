import { useEffect, useRef, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_W } = Dimensions.get("window");

export const ANALYTICS_PERIODS = [
  { key: "today", en: "Today", fr: "Aujourd'hui" },
  { key: "7d", en: "7d", fr: "7 j." },
  { key: "30d", en: "30d", fr: "30 j." },
  { key: "3m", en: "3 mo", fr: "3 m." },
  { key: "1y", en: "1y", fr: "1 an" },
];

function GlowOrb({ scaleAnim, colors, style }) {
  return (
    <Animated.View pointerEvents="none" style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

function mergeMonthlySeries(monthly, trends) {
  const map = new Map();
  monthly.forEach((m) => map.set(m.month, { month: m.month, revenue: m.revenue || 0, bookings: 0 }));
  trends.forEach((t) => {
    const row = map.get(t.month) || { month: t.month, revenue: 0, bookings: 0 };
    row.bookings = t.bookings || 0;
    map.set(t.month, row);
  });
  return Array.from(map.values());
}

function StatTile({ icon, label, value, tint, isDark, titleColor }) {
  return (
    <View
      style={[
        st.statTile,
        {
          backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.55)",
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)",
        },
      ]}
    >
      <View style={[st.statTileIcon, { backgroundColor: `${tint}22` }]}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={[st.statTileLabel, { color: isDark ? "#94a3b8" : "#64748b" }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={[st.statTileValue, { color: titleColor }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
      </Text>
    </View>
  );
}

export function AnimatedMetricNumber({ value, formatter, textColor, duration = 900, style }) {
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

  return <Text style={[st.heroRevenueValue, { color: textColor }, style]}>{formatter(display)}</Text>;
}

/** Gradient area columns with peak dot */
function AreaTrendChart({ data, valueKey, color, isDark, height = 148, formatPeak }) {
  const maxVal = Math.max(1, ...data.map((d) => d[valueKey] || 0));
  const peakIdx = data.findIndex((d) => (d[valueKey] || 0) === maxVal);
  const animsRef = useRef(null);
  if (!animsRef.current || animsRef.current.length !== data.length) {
    animsRef.current = (data.length ? data : [{ month: "—" }]).map(() => new Animated.Value(0));
  }
  const anims = animsRef.current;

  useEffect(() => {
    data.forEach((d, i) => {
      const target = maxVal > 0 ? (d[valueKey] || 0) / maxVal : 0;
      Animated.spring(anims[i], {
        toValue: target,
        friction: 8,
        tension: 48,
        delay: i * 55,
        useNativeDriver: false,
      }).start();
    });
  }, [data, valueKey, maxVal, anims]);

  if (!data.length) {
    return (
      <View style={[st.chartEmpty, { height, backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(15,23,42,0.04)" }]}>
        <Text style={{ color: isDark ? "#64748b" : "#94a3b8", fontWeight: "600" }}>—</Text>
      </View>
    );
  }

  const chartH = height - 28;

  return (
    <View>
      <View style={[st.areaChart, { height }]}>
        <View style={[st.areaGridLine, { top: "25%", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]} />
        <View style={[st.areaGridLine, { top: "50%", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]} />
        <View style={[st.areaGridLine, { top: "75%", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)" }]} />
        <View style={[st.areaCols, { height: chartH }]}>
          {data.map((d, i) => {
            const barH = anims[i].interpolate({ inputRange: [0, 1], outputRange: [4, chartH] });
            const isPeak = i === peakIdx && maxVal > 0;
            return (
              <View key={`${d.month}-${i}`} style={st.areaCol}>
                <View style={[st.areaColTrack, { height: chartH }]}>
                  <Animated.View style={{ width: "100%", height: barH, justifyContent: "flex-end", alignItems: "center" }}>
                    {isPeak ? <View style={[st.peakDot, { backgroundColor: color, shadowColor: color }]} /> : null}
                    <LinearGradient
                      colors={isPeak ? [color, `${color}55`] : [`${color}BB`, `${color}22`]}
                      style={[st.areaBar, { flex: 1, width: "100%" }, isPeak && st.areaBarPeak]}
                    />
                  </Animated.View>
                </View>
              </View>
            );
          })}
        </View>
      </View>
      <View style={st.areaLabels}>
        {data.map((d, i) => (
          <Text key={`lbl-${d.month}-${i}`} style={[st.areaLabel, { color: isDark ? "#64748b" : "#94a3b8" }]} numberOfLines={1}>
            {d.month}
          </Text>
        ))}
      </View>
      {peakIdx >= 0 && formatPeak ? (
        <View style={[st.peakBanner, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
          <Ionicons name="trophy-outline" size={14} color={color} />
          <Text style={[st.peakBannerText, { color: isDark ? "#e2e8f0" : "#0f172a" }]}>
            {formatPeak(data[peakIdx])}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function PremiumMetricCard({ icon, kicker, label, value, sub, colors, anim, isDark, titleColor, wide }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.45, duration: 2800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [glow]);

  const cardW = wide ? SCREEN_W - 40 : SCREEN_W * 0.74;

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start()}
    >
      <Animated.View
        style={[
          st.metricCardOuter,
          {
            width: cardW,
            opacity: anim?.opacity ?? 1,
            transform: [{ translateY: anim?.translate ?? 0 }, { scale }],
          },
        ]}
      >
        <Animated.View style={[st.metricGlowRing, { opacity: glow, borderColor: `${colors[0]}55` }]} />
        <LinearGradient
          colors={
            isDark
              ? [`${colors[0]}30`, `${colors[1] || colors[0]}12`, "rgba(255,255,255,0.04)"]
              : [`${colors[0]}22`, `${colors[1] || colors[0]}10`, "rgba(255,255,255,0.98)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[st.metricCard, { borderColor: `${colors[0]}45` }]}
        >
          <LinearGradient colors={["rgba(255,255,255,0.4)", "rgba(255,255,255,0)"]} style={st.metricSheen} />
          <View style={st.metricTop}>
            <LinearGradient colors={colors} style={st.metricIconRing}>
              <Ionicons name={icon} size={22} color="#fff" />
            </LinearGradient>
            {kicker ? (
              <View style={[st.metricKicker, { borderColor: `${colors[0]}50`, backgroundColor: `${colors[0]}18` }]}>
                <Text style={{ color: colors[0], fontSize: 9, fontWeight: "800", letterSpacing: 1.2 }}>{kicker}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[st.metricLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}>{label}</Text>
          <Text style={[st.metricValue, { color: titleColor }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.65}>
            {value}
          </Text>
          {sub ? <Text style={[st.metricSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>{sub}</Text> : null}
          <LinearGradient colors={[colors[0], "transparent"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.metricRule} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

/** Hero + period selector */
export function AnalyticsEliteHero({
  fr,
  isDark,
  insets,
  period,
  onPeriodChange,
  chipScale,
  titleColor,
  subColor,
  accent,
}) {
  const orbPulse = useRef(new Animated.Value(1)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.08, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, friction: 8, tension: 42, useNativeDriver: true }),
    ]).start();
    return () => loop.stop();
  }, [orbPulse, heroOpacity, heroSlide]);

  const heroGrad = isDark
    ? ["#030806", "#0a1f16", "#051210", "#030806"]
    : ["#ecfdf5", "#d1fae5", "#f0fdf4", "#f8fafc"];

  return (
    <LinearGradient colors={heroGrad} locations={[0, 0.35, 0.7, 1]} style={[st.hero, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <GlowOrb
        scaleAnim={orbPulse}
        colors={isDark ? ["rgba(52,211,153,0.55)", "rgba(52,211,153,0)"] : ["rgba(5,150,105,0.35)", "rgba(5,150,105,0)"]}
        style={st.orbA}
      />
      <GlowOrb
        scaleAnim={orbPulse}
        colors={isDark ? ["rgba(167,139,250,0.35)", "rgba(167,139,250,0)"] : ["rgba(98,72,232,0.2)", "rgba(98,72,232,0)"]}
        style={st.orbB}
      />

      <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroSlide }] }}>
        <View style={st.liveRow}>
          <View style={[st.liveDot, { backgroundColor: accent }]} />
          <Text style={[st.liveText, { color: accent }]}>{fr ? "ANALYTIQUE LIVE" : "LIVE ANALYTICS"}</Text>
        </View>
        <Text style={[st.heroTitle, { color: titleColor }]}>
          {fr ? "Cockpit" : "Cockpit"}
          <Text style={{ color: accent, fontStyle: "italic" }}> {fr ? "revenus" : "revenue"}</Text>
        </Text>
        <Text style={[st.heroSub, { color: subColor }]}>
          {fr
            ? "Décisions premium — revenus, volume et occupation en un coup d'œil."
            : "Premium decisions — revenue, volume & occupancy at a glance."}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 22 }} contentContainerStyle={{ gap: 10, paddingRight: 12 }}>
          {ANALYTICS_PERIODS.map((p) => (
            <Animated.View key={p.key} style={{ transform: [{ scale: chipScale[p.key] }] }}>
              <TouchableOpacity
                onPress={() => onPeriodChange(p.key)}
                activeOpacity={0.88}
                style={[
                  st.periodChip,
                  period === p.key
                    ? { backgroundColor: accent, borderColor: accent }
                    : {
                        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.85)",
                        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)",
                      },
                ]}
              >
                <Text style={{ color: period === p.key ? "#fff" : subColor, fontWeight: "800", fontSize: 13 }}>
                  {fr ? p.fr : p.en}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

/** Bold revenue centerpiece — no occupancy ring */
export function AnalyticsCommandCard({
  data,
  fr,
  isDark,
  titleColor,
  subColor,
  accent,
  fmtMoney,
}) {
  const growth = data.revenueGrowth ?? 0;
  const growthPositive = growth > 0;
  const growthLabel = growth > 0 ? `+${growth}%` : growth < 0 ? `${growth}%` : "—";

  const cardGrad = isDark
    ? ["#022c22", "#064e3b", "#0f172a"]
    : ["#ecfdf5", "#d1fae5", "#ffffff"];
  const borderGrad = isDark
    ? ["#34d399", "#10b981", "#059669"]
    : ["#6ee7b7", "#34d399", "#059669"];

  const revenueNum = Number(data.totalRevenue || 0);

  return (
    <View style={{ paddingHorizontal: 20, marginTop: -14 }}>
      <LinearGradient colors={borderGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={st.revenueBorder}>
        <LinearGradient colors={cardGrad} style={st.revenueInner}>
          <Ionicons
            name="cash"
            size={120}
            color={accent}
            style={[st.revenueWatermark, { opacity: isDark ? 0.07 : 0.06 }]}
          />
          <View style={[st.revenueBadge, { backgroundColor: `${accent}22`, borderColor: `${accent}45` }]}>
            <Ionicons name="sparkles" size={12} color={accent} />
            <Text style={[st.revenueBadgeText, { color: accent }]}>
              {fr ? "PÉRIODE SÉLECTIONNÉE" : "SELECTED PERIOD"}
            </Text>
          </View>

          <View style={st.revenueAmountRow}>
            <AnimatedMetricNumber
              value={revenueNum}
              formatter={(n) => Math.round(n).toLocaleString(fr ? "fr-FR" : "en-US")}
              textColor={titleColor}
              style={st.revenueAmount}
            />
            <Text style={[st.revenueCurrency, { color: subColor }]}>MAD</Text>
          </View>
          <Text style={[st.revenueCaption, { color: subColor }]}>
            {fr ? "Chiffre d'affaires total" : "Total revenue"}
          </Text>

          <View style={st.statGrid}>
            <StatTile
              icon="speedometer-outline"
              label={fr ? "Occupation" : "Occupancy"}
              value={`${data.occupancyRate ?? 0}%`}
              tint={accent}
              isDark={isDark}
              titleColor={titleColor}
            />
            <StatTile
              icon={growthPositive ? "trending-up" : growth < 0 ? "trending-down" : "remove-outline"}
              label={fr ? "Évolution" : "Growth"}
              value={growthLabel}
              tint={growthPositive ? accent : growth < 0 ? "#f87171" : subColor}
              isDark={isDark}
              titleColor={titleColor}
            />
            <StatTile
              icon="calendar-outline"
              label={fr ? "Réservations" : "Bookings"}
              value={String(data.totalBookings ?? 0)}
              tint="#a78bfa"
              isDark={isDark}
              titleColor={titleColor}
            />
            <StatTile
              icon="flash-outline"
              label={fr ? "Moy. / jour" : "Avg / day"}
              value={fmtMoney(data.avgDailyRevenue ?? 0)}
              tint="#38bdf8"
              isDark={isDark}
              titleColor={titleColor}
            />
          </View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}

/** Horizontal premium KPI cards */
export function AnalyticsMetricsRail({ data, fr, isDark, titleColor, glassBorder, fmtMoney, kpiAnims }) {
  const netProfit = data.netProfit ?? 0;
  const violet = isDark ? "#a78bfa" : "#6248e8";
  const cyan = isDark ? "#38bdf8" : "#0ea5e9";

  return (
    <View style={{ marginTop: 20, marginBottom: 8 }}>
      <Text style={[st.railEyebrow, { color: isDark ? "#34d399" : "#059669" }]}>
        {fr ? "INDICATEURS CLÉS" : "KEY SIGNALS"}
      </Text>
      <Text style={[st.railTitle, { color: titleColor }]}>{fr ? "Vue exécutive" : "Executive view"}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.metricsCarousel} decelerationRate="fast">
        <PremiumMetricCard
          wide
          anim={kpiAnims[0]}
          icon="wallet"
          kicker={fr ? "RÉSULTAT" : "BOTTOM LINE"}
          label={fr ? "Profit net" : "Net profit"}
          value={fmtMoney(netProfit)}
          sub={fr ? "Après entretien" : "After maintenance"}
          colors={netProfit >= 0 ? ["#34d399", "#10b981"] : ["#f87171", "#ef4444"]}
          isDark={isDark}
          titleColor={titleColor}
        />
        <PremiumMetricCard
          anim={kpiAnims[1]}
          icon="calendar"
          kicker={fr ? "VOLUME" : "VOLUME"}
          label={fr ? "Réservations" : "Bookings"}
          value={String(data.totalBookings ?? 0)}
          sub={fr ? "Tous statuts" : "All statuses"}
          colors={[violet, "#7c6bff"]}
          isDark={isDark}
          titleColor={titleColor}
        />
        <PremiumMetricCard
          anim={kpiAnims[2]}
          icon="checkmark-circle"
          kicker={fr ? "ENCAISSÉ" : "COLLECTED"}
          label={fr ? "Encaissé" : "Collected"}
          value={fmtMoney(data.collectedRevenue)}
          sub={fr ? "Payé sur la période" : "Paid in period"}
          colors={[cyan, "#0284c7"]}
          isDark={isDark}
          titleColor={titleColor}
        />
        <PremiumMetricCard
          anim={kpiAnims[3]}
          icon="hourglass"
          kicker={fr ? "PIPELINE" : "PIPELINE"}
          label={fr ? "En attente" : "Pending"}
          value={fmtMoney(data.pendingRevenue)}
          sub={fr ? "Confirmé, non payé" : "Confirmed, unpaid"}
          colors={["#fbbf24", "#f59e0b"]}
          isDark={isDark}
          titleColor={titleColor}
        />
      </ScrollView>
    </View>
  );
}

/** Tabbed area chart — revenue vs bookings */
export function AnalyticsTrendFusion({ monthly, trends, fr, isDark, titleColor, subColor, accent, fmtMoney }) {
  const [tab, setTab] = useState("revenue");
  const merged = useMemo(() => mergeMonthlySeries(monthly, trends), [monthly, trends]);

  if (!merged.length) return null;

  const isRevenue = tab === "revenue";
  const chartColor = isRevenue ? accent : "#818cf8";
  const valueKey = isRevenue ? "revenue" : "bookings";

  const formatPeak = useCallback(
    (row) =>
      isRevenue
        ? `${fr ? "Meilleur mois" : "Best month"} · ${row.month} · ${fmtMoney(row.revenue)}`
        : `${fr ? "Pic réservations" : "Booking peak"} · ${row.month} · ${row.bookings} ${fr ? "résa." : "bk."}`,
    [fr, fmtMoney, isRevenue],
  );

  const panelBg = isDark ? "#0c1018" : "#f8fafc";
  const panelBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";

  return (
    <View style={{ paddingHorizontal: 20, marginTop: 12, marginBottom: 8 }}>
      <View style={[st.trendPanel, { backgroundColor: panelBg, borderColor: panelBorder }]}>
        <View style={st.trendHead}>
          <View style={{ flex: 1 }}>
            <Text style={[st.trendEyebrow, { color: accent }]}>{fr ? "ÉVOLUTION MENSUELLE" : "MONTHLY EVOLUTION"}</Text>
            <Text style={[st.trendTitle, { color: titleColor }]}>
              {fr ? "Courbe de performance" : "Performance curve"}
            </Text>
          </View>
        </View>

        <View style={[st.tabBar, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.05)" }]}>
          <TouchableOpacity
            onPress={() => setTab("revenue")}
            activeOpacity={0.88}
            style={[st.tabBtn, tab === "revenue" && { backgroundColor: isDark ? "rgba(52,211,153,0.2)" : "rgba(5,150,105,0.12)" }]}
          >
            <View style={[st.tabDot, { backgroundColor: accent }]} />
            <Text style={[st.tabText, { color: tab === "revenue" ? titleColor : subColor }]}>
              {fr ? "Revenus" : "Revenue"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("bookings")}
            activeOpacity={0.88}
            style={[st.tabBtn, tab === "bookings" && { backgroundColor: isDark ? "rgba(129,140,248,0.2)" : "rgba(99,102,241,0.1)" }]}
          >
            <View style={[st.tabDot, { backgroundColor: "#818cf8" }]} />
            <Text style={[st.tabText, { color: tab === "bookings" ? titleColor : subColor }]}>
              {fr ? "Réservations" : "Bookings"}
            </Text>
          </TouchableOpacity>
        </View>

        <AreaTrendChart
          key={`${tab}-${merged.map((m) => m.month).join("-")}`}
          data={merged}
          valueKey={valueKey}
          color={chartColor}
          isDark={isDark}
          formatPeak={formatPeak}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.monthChips}>
          {merged.map((row) => {
            const val = isRevenue ? fmtMoney(row.revenue) : String(row.bookings);
            return (
              <View
                key={row.month}
                style={[
                  st.monthChip,
                  {
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)",
                    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff",
                  },
                ]}
              >
                <Text style={[st.monthChipLabel, { color: subColor }]}>{row.month}</Text>
                <Text style={[st.monthChipValue, { color: chartColor }]}>{val}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

export function useKpiEntranceAnims(count = 4) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        opacity: new Animated.Value(0),
        translate: new Animated.Value(22),
        delay: i * 90,
      })),
    [count],
  );
}

export function runKpiEntrance(anims) {
  anims.forEach((a) => {
    Animated.parallel([
      Animated.timing(a.opacity, { toValue: 1, duration: 480, delay: a.delay, useNativeDriver: true }),
      Animated.spring(a.translate, { toValue: 0, delay: a.delay, friction: 8, tension: 42, useNativeDriver: true }),
    ]).start();
  });
}

const st = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 28, overflow: "hidden" },
  orbA: { position: "absolute", width: 280, height: 280, borderRadius: 140, top: -90, right: -100, opacity: 0.55 },
  orbB: { position: "absolute", width: 200, height: 200, borderRadius: 100, bottom: -30, left: -80, opacity: 0.4 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  heroTitle: { fontSize: 32, fontWeight: "900", letterSpacing: -1.2, lineHeight: 38 },
  heroSub: { fontSize: 14, lineHeight: 22, marginTop: 10, fontWeight: "500", maxWidth: 320 },
  periodChip: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, borderWidth: 1 },
  heroRevenueValue: { fontSize: 30, fontWeight: "900", letterSpacing: -1 },
  revenueBorder: { borderRadius: 28, padding: 1.5, shadowColor: "#10b981", shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 12 },
  revenueInner: { borderRadius: 26, padding: 22, overflow: "hidden", minHeight: 200 },
  revenueWatermark: { position: "absolute", right: -8, top: 20 },
  revenueBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 16,
  },
  revenueBadgeText: { fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  revenueAmountRow: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  revenueAmount: { fontSize: 42, fontWeight: "900", letterSpacing: -2, lineHeight: 46 },
  revenueCurrency: { fontSize: 16, fontWeight: "800", marginBottom: 8, letterSpacing: 0.5 },
  revenueCaption: { fontSize: 13, fontWeight: "600", marginTop: 6, marginBottom: 20 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statTile: { width: "48%", flexGrow: 1, borderRadius: 16, borderWidth: 1, padding: 12 },
  statTileIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statTileLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
  statTileValue: { fontSize: 17, fontWeight: "900", marginTop: 4, letterSpacing: -0.3 },
  trendPanel: { borderRadius: 26, borderWidth: 1, padding: 18, overflow: "hidden" },
  trendHead: { marginBottom: 14 },
  trendEyebrow: { fontSize: 9, fontWeight: "800", letterSpacing: 2 },
  trendTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.4, marginTop: 4 },
  tabBar: { flexDirection: "row", gap: 8, padding: 4, borderRadius: 14, marginBottom: 16 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 11, borderRadius: 11 },
  tabDot: { width: 7, height: 7, borderRadius: 4 },
  tabText: { fontSize: 13, fontWeight: "800" },
  areaChart: { position: "relative", marginBottom: 6 },
  areaGridLine: { position: "absolute", left: 0, right: 0, height: 1 },
  areaCols: { flexDirection: "row", alignItems: "flex-end", gap: 5, paddingHorizontal: 2 },
  areaCol: { flex: 1 },
  areaColTrack: { justifyContent: "flex-end" },
  areaBar: { borderTopLeftRadius: 8, borderTopRightRadius: 8, minHeight: 4 },
  areaBarPeak: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
  peakDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 6, elevation: 6 },
  areaLabels: { flexDirection: "row", gap: 5, paddingHorizontal: 2 },
  areaLabel: { flex: 1, fontSize: 9, fontWeight: "700", textAlign: "center" },
  peakBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  peakBannerText: { fontSize: 12, fontWeight: "700", flex: 1 },
  chartEmpty: { borderRadius: 16, alignItems: "center", justifyContent: "center" },
  monthChips: { gap: 8, paddingTop: 14 },
  monthChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, minWidth: 88 },
  monthChipLabel: { fontSize: 10, fontWeight: "700", marginBottom: 4 },
  monthChipValue: { fontSize: 14, fontWeight: "900", letterSpacing: -0.3 },
  railEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 1.6, paddingHorizontal: 20, marginBottom: 4 },
  railTitle: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5, paddingHorizontal: 20, marginBottom: 14 },
  metricsCarousel: { paddingHorizontal: 20, gap: 14, paddingBottom: 4 },
  metricCardOuter: { position: "relative" },
  metricGlowRing: { ...StyleSheet.absoluteFillObject, borderRadius: 26, borderWidth: 1.5, margin: -2 },
  metricCard: { borderRadius: 24, padding: 20, borderWidth: 1, minHeight: 152, overflow: "hidden" },
  metricSheen: { position: "absolute", top: 0, left: 24, right: 24, height: 1 },
  metricTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  metricIconRing: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  metricKicker: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
  metricLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  metricValue: { fontSize: 28, fontWeight: "900", letterSpacing: -0.8, marginTop: 6 },
  metricSub: { fontSize: 12, fontWeight: "600", marginTop: 8, lineHeight: 17 },
  metricRule: { height: 3, borderRadius: 2, marginTop: 14, width: 48 },
});
