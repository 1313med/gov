import { useState, useEffect, useCallback, useMemo } from "react";
import { PageLoader, InlineLogoLoader } from '../src/components/AppLoadingScreen';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppLang } from "../src/context/AppLangContext";
import { useTheme } from "../src/context/ThemeContext";
import { getOwnerListingViews, markOwnerListingViewsSeen } from "../src/api/rental";
import { getListingViewQueryParams } from "../src/utils/listingViewPeriodRange";
import { resolveMediaUrl } from "../src/utils/mediaUrl";

const { width: W } = Dimensions.get("window");

const PERIODS = [
  { id: "all", en: "All time", fr: "Total", ar: "كل الوقت" },
  { id: "today", en: "Today", fr: "Aujourd'hui", ar: "اليوم" },
  { id: "yesterday", en: "Yesterday", fr: "Hier", ar: "أمس" },
  { id: "last_week", en: "Last 7 days", fr: "7 derniers j.", ar: "آخر 7 أيام" },
  { id: "last_month", en: "Last month", fr: "Mois dernier", ar: "الشهر الماضي" },
  { id: "year", en: "This year", fr: "Cette année", ar: "هذه السنة" },
];

function statusLabel(status, pick) {
  const s = String(status || "").toLowerCase();
  if (s === "approved") return pick("Live", "En ligne", "منشور");
  if (s === "pending") return pick("Pending", "En attente", "قيد الانتظار");
  if (s === "rejected") return pick("Rejected", "Refusé", "مرفوض");
  if (s === "unavailable") return pick("Unavailable", "Indisponible", "غير متاح");
  return s;
}

function statusColor(status, C) {
  const s = String(status || "").toLowerCase();
  if (s === "approved") return C.green;
  if (s === "pending") return "#fbbf24";
  if (s === "rejected") return C.red;
  return C.muted;
}

function createStyles(C, isDark) {
  const curve = Platform.OS === "ios" ? { borderCurve: "continuous" } : {};
  return StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    board: {
      borderRadius: 28,
      overflow: "hidden",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)",
      ...curve,
    },
    boardInner: { paddingBottom: 22, paddingTop: 8 },
    orb: { position: "absolute", borderRadius: 999, opacity: isDark ? 0.45 : 0.35 },
    boardHeader: { paddingHorizontal: 22, paddingTop: 18, zIndex: 1 },
    kicker: {
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 3,
      color: C.primary,
      marginBottom: 6,
    },
    h1: {
      fontSize: 26,
      fontWeight: "900",
      letterSpacing: -0.8,
      color: C.white,
      lineHeight: 30,
      maxWidth: W - 72,
    },
    sub: { fontSize: 12, lineHeight: 17, color: C.muted, marginTop: 10, maxWidth: W - 48 },
    metricRow: {
      flexDirection: "row",
      marginTop: 22,
      marginHorizontal: 16,
      gap: 10,
      zIndex: 1,
    },
    metricCell: {
      flex: 1,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 14,
      borderWidth: 1,
      overflow: "hidden",
      ...curve,
    },
    metricVal: { fontSize: 22, fontWeight: "900", letterSpacing: -0.5, color: C.white },
    metricLab: { fontSize: 10, fontWeight: "800", color: C.muted, marginTop: 4, letterSpacing: 0.8 },
    footnote: {
      marginHorizontal: 22,
      marginTop: 14,
      fontSize: 10,
      lineHeight: 15,
      color: C.muted,
      fontWeight: "600",
      opacity: 0.85,
    },
    sectionHead: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      marginBottom: 12,
      paddingHorizontal: 2,
    },
    sectionTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 1.6, color: C.muted, textTransform: "uppercase" },
    sectionMeta: { fontSize: 11, fontWeight: "700", color: C.primary },
    table: {
      borderRadius: 22,
      borderWidth: 1,
      borderColor: C.border,
      overflow: "hidden",
      backgroundColor: C.card,
      ...curve,
    },
    th: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(248,250,252,0.9)",
    },
    thTxt: { fontSize: 10, fontWeight: "900", letterSpacing: 1, color: C.muted, textTransform: "uppercase" },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    rankWrap: { width: 36, alignItems: "center", justifyContent: "center" },
    rank: {
      width: 28,
      height: 28,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      ...curve,
    },
    rankTxt: { fontSize: 12, fontWeight: "900", color: "#fff" },
    thumb: { width: 44, height: 44, borderRadius: 12, marginRight: 10 },
    thumbPh: { alignItems: "center", justifyContent: "center", borderWidth: 1 },
    rowBody: { flex: 1, minWidth: 0 },
    rowTitle: { color: C.white, fontWeight: "800", fontSize: 14, letterSpacing: -0.2 },
    rowSub: { color: C.muted, fontSize: 11, marginTop: 3, fontWeight: "600" },
    viewsCol: { alignItems: "flex-end", minWidth: 56 },
    viewsNum: { fontSize: 20, fontWeight: "900", letterSpacing: -0.6, color: C.white },
    viewsLab: { fontSize: 9, fontWeight: "800", color: C.muted, marginTop: 2, letterSpacing: 0.5 },
    shareTrack: { height: 3, borderRadius: 2, marginTop: 10, overflow: "hidden", backgroundColor: C.inputBg },
    pill: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
    pillTxt: { fontSize: 9, fontWeight: "900" },
    empty: { borderRadius: 22, borderWidth: 1, padding: 32, alignItems: "center", marginTop: 4, borderColor: C.border, backgroundColor: C.card },
    chipRow: { marginTop: 16, marginBottom: 2, paddingHorizontal: 4 },
    chipScroll: { flexGrow: 0 },
    chipScrollContent: { flexDirection: "row", gap: 8, paddingVertical: 4, paddingRight: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: isDark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.85)",
      ...curve,
    },
    chipActive: {
      borderColor: C.primary + "aa",
      backgroundColor: C.primary + "22",
    },
    chipTxt: { fontSize: 12, fontWeight: "800", color: C.muted },
    chipTxtActive: { color: C.white },
    headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
  });
}

export default function OwnerListingViewsScreen() {
  const { pick, numberLocale } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createStyles(C, isDark), [C, isDark]);
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("all");

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const { data: d } = await getOwnerListingViews(getListingViewQueryParams(period));
      setData(d && typeof d === "object" ? d : null);
    } catch {
      setData(null);
    } finally {
      setFetching(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      markOwnerListingViewsSeen().catch(() => {});
    }, [])
  );

  const maxViews = useMemo(() => {
    const v = data?.vehicles;
    if (!Array.isArray(v) || !v.length) return 1;
    return Math.max(1, ...v.map((x) => x.views || 0));
  }, [data]);

  if (fetching && data === null) {
    return <PageLoader message={pick("Loading visibility stats…", "Chargement des statistiques…")} />;
  }

  const total = data?.totalViews ?? 0;
  const count = data?.listingCount ?? 0;
  const avg = data?.avgViewsPerListing ?? 0;
  const vehicles = Array.isArray(data?.vehicles) ? data.vehicles : [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 36 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          tintColor={C.primary}
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.chipScroll}
        contentContainerStyle={s.chipRow}
      >
        <View style={s.chipScrollContent}>
          {PERIODS.map((p) => {
            const active = period === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPeriod(p.id)}
                style={[s.chip, active && s.chipActive]}
                disabled={fetching}
              >
                <Text style={[s.chipTxt, active && s.chipTxtActive]}>{pick(p.en, p.fr, p.ar)}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[s.board, { backgroundColor: C.surface }]}>
        <View style={[s.orb, { width: 220, height: 220, top: -90, right: -70, backgroundColor: C.primary }]} />
        <View style={[s.orb, { width: 160, height: 160, bottom: -50, left: -40, backgroundColor: C.accent }]} />
        <LinearGradient
          colors={isDark ? ["rgba(15,17,35,0.97)", "rgba(8,9,18,0.99)"] : ["rgba(255,255,255,0.97)", "rgba(241,245,249,0.99)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.boardInner}>
          <View style={s.boardHeader}>
            <View style={s.headerRow}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.kicker}>{pick("INSIGHT", "INSIGHT")}</Text>
                <Text style={s.h1}>{pick("Listing reach", "Portée de vos annonces")}</Text>
              </View>
              {fetching && data ? <InlineLogoLoader /> : null}
            </View>
            <Text style={s.sub}>
              {pick("Views count a detail-page open, deduplicated per visitor within a short window.", "Les vues comptent une ouverture de fiche (dédupliquée par visiteur sur quelques minutes).")}
            </Text>
          </View>

          <View style={s.metricRow}>
            <LinearGradient
              colors={[`${C.primary}33`, `${C.primary}08`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.metricCell, { borderColor: C.primary + "44" }]}
            >
              <Text style={[s.metricVal, { color: C.white }]}>{total.toLocaleString(numberLocale)}</Text>
              <Text style={s.metricLab}>{pick("VIEWS", "VUES")}</Text>
            </LinearGradient>
            <View style={[s.metricCell, { borderColor: C.border, backgroundColor: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.6)" }]}>
              <Text style={s.metricVal}>{String(count)}</Text>
              <Text style={s.metricLab}>{pick("LISTINGS", "ANNONCES")}</Text>
            </View>
            <View style={[s.metricCell, { borderColor: C.border, backgroundColor: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.6)" }]}>
              <Text style={s.metricVal}>{String(avg)}</Text>
              <Text style={s.metricLab}>{pick("AVG", "MOY.")}</Text>
            </View>
          </View>

          <Text style={s.footnote}>
            {period === "all"
              ? pick("Rapid tab switches or refreshes no longer inflate totals thanks to deduplication.", "Les onglets ou rafraîchissements rapides ne gonflent plus le total grâce à la déduplication.")
              : pick("Periods use your device’s time zone. Totals count timestamped views since tracking shipped; “All time” still uses each listing’s lifetime counter.", "Les périodes utilisent le fuseau de votre appareil. Les totaux comptent les vues enregistrées depuis le suivi horodaté (le « Total » reste le cumul sur l’annonce).")}
          </Text>
        </View>
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{pick("Leaderboard", "Classement")}</Text>
        <Text style={s.sectionMeta}>{pick("by views", "par vues")}</Text>
      </View>

      {vehicles.length === 0 ? (
        <View style={[s.empty, { borderColor: C.border }]}>
          <Ionicons name="analytics-outline" size={36} color={C.muted} />
          <Text style={{ color: C.white, fontWeight: "800", marginTop: 14, textAlign: "center", fontSize: 16 }}>
            {pick("No data yet", "Aucune donnée encore")}
          </Text>
          <Text style={{ color: C.muted, fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 19 }}>
            {pick("Publish an approved listing to see views here.", "Publiez une annonce approuvée pour voir les vues ici.")}
          </Text>
        </View>
      ) : (
        <View style={s.table}>
          <View style={s.th}>
            <Text style={[s.thTxt, { width: 36, textAlign: "center" }]}>#</Text>
            <View style={{ width: 44 }} />
            <Text style={[s.thTxt, { flex: 1 }]}>{pick("Vehicle", "Véhicule")}</Text>
            <Text style={[s.thTxt, { width: 56, textAlign: "right" }]}>{pick("Views", "Vues")}</Text>
          </View>
          {vehicles.map((v, idx) => {
            const rank = idx + 1;
            const pct = maxViews > 0 ? ((v.views || 0) / maxViews) * 100 : 0;
            const uri = resolveMediaUrl(v.image);
            const stColor = statusColor(v.status, C);
            const top3 = rank <= 3;
            return (
              <View key={String(v.rentalId)} style={s.row}>
                <View style={s.rankWrap}>
                  <LinearGradient
                    colors={top3 ? [C.primary, "#5b4ddb"] : ["rgba(148,163,184,0.35)", "rgba(71,85,105,0.25)"]}
                    style={s.rank}
                  >
                    <Text style={s.rankTxt}>{rank}</Text>
                  </LinearGradient>
                </View>
                {uri ? (
                  <Image source={{ uri }} style={[s.thumb, { borderColor: C.border }]} resizeMode="cover" />
                ) : (
                  <View style={[s.thumb, s.thumbPh, { backgroundColor: C.inputBg, borderColor: C.border }]}>
                    <Ionicons name="car-sport-outline" size={20} color={C.muted} />
                  </View>
                )}
                <View style={s.rowBody}>
                  <Text style={s.rowTitle} numberOfLines={2}>
                    {v.title}
                  </Text>
                  <Text style={s.rowSub} numberOfLines={1}>
                    {v.subtitle || "—"} · {v.city || ""}
                  </Text>
                  <View style={[s.pill, { borderColor: stColor + "55", backgroundColor: stColor + "14" }]}>
                    <Text style={[s.pillTxt, { color: stColor }]}>{statusLabel(v.status, pick)}</Text>
                  </View>
                  <View style={s.shareTrack}>
                    <LinearGradient
                      colors={[C.accent, C.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ width: `${Math.max(6, pct)}%`, height: "100%", borderRadius: 2 }}
                    />
                  </View>
                </View>
                <View style={s.viewsCol}>
                  <Text style={s.viewsNum}>{v.views ?? 0}</Text>
                  <Text style={s.viewsLab}>{pick("views", "vues")}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
