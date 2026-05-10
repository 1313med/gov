import { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMyBookings, cancelBooking } from "../src/api/booking";
import { useAppLang } from "../src/context/AppLangContext";
import { useTheme } from "../src/context/ThemeContext";
import { resolveMediaUrl } from "../src/utils/mediaUrl";

const SCREEN_W = Dimensions.get("window").width;

const ST = {
  pending: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)", text: "#f59e0b", icon: "time-outline" },
  confirmed: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.4)", text: "#34d399", icon: "checkmark-circle-outline" },
  completed: { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.4)", text: "#60a5fa", icon: "flag-outline" },
  cancelled: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)", text: "#f87171", icon: "close-circle-outline" },
};

export default function MyBookingsScreen() {
  const { lang } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createMyBookingsStyles(C, isDark), [C, isDark]);
  const router = useRouter();
  const fr = lang === "fr";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await getMyBookings();
      setBookings(data);
    } catch {
      Alert.alert("Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const handleCancel = (id) =>
    Alert.alert(fr ? "Annuler la réservation" : "Cancel Booking", fr ? "Êtes-vous sûr ?" : "Are you sure?", [
      { text: fr ? "Non" : "No" },
      {
        text: fr ? "Oui, annuler" : "Yes, cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelBooking(id);
            load();
          } catch {
            Alert.alert("Failed");
          }
        },
      },
    ]);

  const listHeader = useCallback(
    () => (
      <View style={[s.listHead, { paddingTop: insets.top + 10 }]}>
        <View style={s.listHeadAccent} />
        <Text style={s.listHeadTitle}>{fr ? "Mes réservations" : "My bookings"}</Text>
        <Text style={s.listHeadSub}>
          {fr ? "Dates, montants et statuts de vos locations." : "Dates, totals, and status for each trip."}
        </Text>
      </View>
    ),
    [s, insets.top, fr]
  );

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={{ color: C.muted, marginTop: 14, fontSize: 13 }}>{fr ? "Chargement…" : "Loading…"}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        data={bookings}
        keyExtractor={(i) => i._id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="car-outline" size={44} color={C.primary} />
            </View>
            <Text style={s.emptyTitle}>{fr ? "Aucune réservation" : "No bookings yet"}</Text>
            <Text style={s.emptyHint}>{fr ? "Explorez le catalogue et réservez votre prochaine voiture." : "Browse the fleet and book your next drive."}</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/rentals")} activeOpacity={0.9} style={s.cta}>
              <LinearGradient colors={[C.primary, "#6366f1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.ctaGrad}>
                <Text style={s.ctaText}>{fr ? "Voir les locations" : "Browse rentals"}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const st = ST[item.status] || ST.pending;
          const canCancel = item.status === "pending" || item.status === "confirmed";
          const img = resolveMediaUrl(item.rentalId?.images?.[0]);
          const title = item.rentalId?.title || `${item.rentalId?.brand || ""} ${item.rentalId?.model || ""}`.trim() || "Rental";
          return (
            <View style={[s.card, { borderLeftColor: st.text }]}>
              <TouchableOpacity
                onPress={() => router.push(`/rentals/${item.rentalId?._id || item.rentalId}`)}
                activeOpacity={0.9}
                style={s.cardHero}
              >
                {img ? (
                  <Image source={{ uri: img }} style={s.cardImg} resizeMode="cover" />
                ) : (
                  <View style={[s.cardImg, s.cardImgPh]}>
                    <Ionicons name="car-sport-outline" size={32} color={C.muted} />
                  </View>
                )}
                <View style={s.cardHeroText}>
                  <Text style={s.cardTitle} numberOfLines={2}>
                    {title}
                  </Text>
                  {item.rentalId?.city ? <Text style={s.cardCity}>{item.rentalId.city}</Text> : null}
                </View>
              </TouchableOpacity>

              <View style={s.cardBody}>
                <View style={[s.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
                  <Ionicons name={st.icon} size={14} color={st.text} />
                  <Text style={[s.badgeText, { color: st.text }]}>{item.status}</Text>
                </View>

                <View style={s.datesRow}>
                  <View style={s.dateBox}>
                    <Text style={s.dateLabel}>{fr ? "Début" : "Start"}</Text>
                    <Text style={s.dateVal}>{new Date(item.startDate).toLocaleDateString(fr ? "fr-FR" : "en-GB")}</Text>
                  </View>
                  <View style={s.dateBox}>
                    <Text style={s.dateLabel}>{fr ? "Fin" : "End"}</Text>
                    <Text style={s.dateVal}>{new Date(item.endDate).toLocaleDateString(fr ? "fr-FR" : "en-GB")}</Text>
                  </View>
                </View>

                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>{fr ? "Total" : "Total"}</Text>
                  <Text style={s.totalVal}>
                    {Number(item.totalAmount).toLocaleString(fr ? "fr-FR" : "en-US")} MAD
                  </Text>
                </View>

                {canCancel && (
                  <TouchableOpacity onPress={() => handleCancel(item._id)} style={s.cancelBtn} activeOpacity={0.85}>
                    <Text style={s.cancelText}>{fr ? "Annuler la réservation" : "Cancel booking"}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function createMyBookingsStyles(C, isDark) {
  return StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: C.bg },
    listHead: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
      paddingBottom: 14,
      marginBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    listHeadAccent: { height: 2, width: 36, borderRadius: 2, backgroundColor: C.primary, marginBottom: 12, opacity: 0.9 },
    listHeadTitle: { color: C.white, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
    listHeadSub: { color: C.muted, fontSize: 12, marginTop: 6, lineHeight: 17, maxWidth: SCREEN_W - 48 },
    empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 20 },
    emptyIconWrap: {
      width: 88,
      height: 88,
      borderRadius: 28,
      backgroundColor: isDark ? "rgba(124,107,255,0.12)" : "rgba(99,102,241,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: { color: C.white, fontWeight: "800", fontSize: 18, marginTop: 20, textAlign: "center" },
    emptyHint: { color: C.muted, fontSize: 13, marginTop: 10, textAlign: "center", lineHeight: 20, maxWidth: Math.min(280, SCREEN_W - 48) },
    cta: { marginTop: 24, borderRadius: 14, overflow: "hidden", width: "100%", maxWidth: 300 },
    ctaGrad: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 15,
      paddingHorizontal: 22,
    },
    ctaText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    card: {
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 20,
      marginBottom: 14,
      borderLeftWidth: 4,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.35 : 0.07,
      shadowRadius: 14,
      elevation: 4,
    },
    cardHero: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, paddingBottom: 10 },
    cardImg: { width: 88, height: 68, borderRadius: 14, backgroundColor: C.surface },
    cardImgPh: { alignItems: "center", justifyContent: "center" },
    cardHeroText: { flex: 1, minWidth: 0 },
    cardTitle: { color: C.white, fontWeight: "800", fontSize: 16, letterSpacing: -0.2 },
    cardCity: { color: C.muted, fontSize: 12, marginTop: 4 },
    cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
    badge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, marginBottom: 12, gap: 6 },
    badgeText: { fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
    datesRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
    dateBox: { flex: 1, backgroundColor: C.inputBg, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 12 },
    dateLabel: { color: C.muted, fontSize: 11, fontWeight: "700", marginBottom: 4, letterSpacing: 0.3 },
    dateVal: { color: C.white, fontWeight: "600", fontSize: 13 },
    totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4 },
    totalLabel: { color: C.muted, fontSize: 13, fontWeight: "600" },
    totalVal: { color: C.primary, fontWeight: "900", fontSize: 18, letterSpacing: -0.3 },
    cancelBtn: {
      marginTop: 14,
      borderWidth: 1,
      borderColor: "rgba(248,113,113,0.45)",
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: "rgba(248,113,113,0.06)",
    },
    cancelText: { color: "#f87171", fontWeight: "700", fontSize: 13 },
  });
}
