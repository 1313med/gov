import { useState, useEffect, useCallback, useMemo } from "react";
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppLang } from "../src/context/AppLangContext";
import { useTheme } from "../src/context/ThemeContext";
import { getOwnerListingViews } from "../src/api/rental";
import { resolveMediaUrl } from "../src/utils/mediaUrl";

const { width: W } = Dimensions.get("window");

function statusLabel(status, fr) {
  const s = String(status || "").toLowerCase();
  if (s === "approved") return fr ? "En ligne" : "Live";
  if (s === "pending") return fr ? "En attente" : "Pending";
  if (s === "rejected") return fr ? "Refusé" : "Rejected";
  if (s === "unavailable") return fr ? "Indisponible" : "Unavailable";
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
  });
}

export default function OwnerListingViewsScreen() {
  const { lang } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";
  const s = useMemo(() => createStyles(C, isDark), [C, isDark]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data: d } = await getOwnerListingViews();
      setData(d && typeof d === "object" ? d : null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const maxViews = useMemo(() => {
    const v = data?.vehicles;
    if (!Array.isArray(v) || !v.length) return 1;
    return Math.max(1, ...v.map((x) => x.views || 0));
  }, [data]);

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={{ color: C.muted, marginTop: 12, fontSize: 14 }}>
          {fr ? "Chargement des statistiques…" : "Loading visibility stats…"}
        </Text>
      </View>
    );
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
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />
      }
    >
      <View style={[s.board, { backgroundColor: C.surface }]}>
        <View style={[s.orb, { width: 220, height: 220, top: -90, right: -70, backgroundColor: C.primary }]} />
        <View style={[s.orb, { width: 160, height: 160, bottom: -50, left: -40, backgroundColor: C.accent }]} />
        <LinearGradient
          colors={isDark ? ["rgba(15,17,35,0.97)", "rgba(8,9,18,0.99)"] : ["rgba(255,255,255,0.97)", "rgba(241,245,249,0.99)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.boardInner}>
          <View style={s.boardHeader}>
            <Text style={s.kicker}>{fr ? "INSIGHT" : "INSIGHT"}</Text>
            <Text style={s.h1}>{fr ? "Portée de vos annonces" : "Listing reach"}</Text>
            <Text style={s.sub}>
              {fr
                ? "Les vues comptent une ouverture de fiche (dédupliquée par visiteur sur quelques minutes)."
                : "Views count a detail-page open, deduplicated per visitor within a short window."}
            </Text>
          </View>

          <View style={s.metricRow}>
            <LinearGradient
              colors={[`${C.primary}33`, `${C.primary}08`]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[s.metricCell, { borderColor: C.primary + "44" }]}
            >
              <Text style={[s.metricVal, { color: C.white }]}>{total.toLocaleString(fr ? "fr-FR" : "en-US")}</Text>
              <Text style={s.metricLab}>{fr ? "VUES" : "VIEWS"}</Text>
            </LinearGradient>
            <View style={[s.metricCell, { borderColor: C.border, backgroundColor: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.6)" }]}>
              <Text style={s.metricVal}>{String(count)}</Text>
              <Text style={s.metricLab}>{fr ? "ANNONCES" : "LISTINGS"}</Text>
            </View>
            <View style={[s.metricCell, { borderColor: C.border, backgroundColor: isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.6)" }]}>
              <Text style={s.metricVal}>{String(avg)}</Text>
              <Text style={s.metricLab}>{fr ? "MOY." : "AVG"}</Text>
            </View>
          </View>

          <Text style={s.footnote}>
            {fr
              ? "Les onglets ou rafraîchissements rapides ne gonflent plus le total grâce à la déduplication."
              : "Rapid tab switches or refreshes no longer inflate totals thanks to deduplication."}
          </Text>
        </View>
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>{fr ? "Classement" : "Leaderboard"}</Text>
        <Text style={s.sectionMeta}>{fr ? "par vues" : "by views"}</Text>
      </View>

      {vehicles.length === 0 ? (
        <View style={[s.empty, { borderColor: C.border }]}>
          <Ionicons name="analytics-outline" size={36} color={C.muted} />
          <Text style={{ color: C.white, fontWeight: "800", marginTop: 14, textAlign: "center", fontSize: 16 }}>
            {fr ? "Aucune donnée encore" : "No data yet"}
          </Text>
          <Text style={{ color: C.muted, fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 19 }}>
            {fr ? "Publiez une annonce approuvée pour voir les vues ici." : "Publish an approved listing to see views here."}
          </Text>
        </View>
      ) : (
        <View style={s.table}>
          <View style={s.th}>
            <Text style={[s.thTxt, { width: 36, textAlign: "center" }]}>#</Text>
            <View style={{ width: 44 }} />
            <Text style={[s.thTxt, { flex: 1 }]}>{fr ? "Véhicule" : "Vehicle"}</Text>
            <Text style={[s.thTxt, { width: 56, textAlign: "right" }]}>{fr ? "Vues" : "Views"}</Text>
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
                    <Text style={[s.pillTxt, { color: stColor }]}>{statusLabel(v.status, fr)}</Text>
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
                  <Text style={s.viewsLab}>{fr ? "vues" : "views"}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
