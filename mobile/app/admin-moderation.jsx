import { useCallback, useEffect, useMemo, useState } from "react";
import { PageLoader } from '../src/components/AppLoadingScreen';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getAdminSales, updateSaleStatus } from "../src/api/sale";
import { getAdminRentals, updateRentalStatus } from "../src/api/rental";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import { resolveMediaUrl } from "../src/utils/mediaUrl";

const TABS = ["sales", "rentals"];

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.listings)) return data.listings;
  if (Array.isArray(data?.sales)) return data.sales;
  if (Array.isArray(data?.rentals)) return data.rentals;
  return [];
}

export default function AdminModerationScreen() {
  const { auth } = useAuth();
  const { colors: C } = useTheme();
  const s = useMemo(() => createAdminModerationStyles(C), [C]);
  const router = useRouter();

  const [tab, setTab] = useState("sales");
  const [sales, setSales] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyKey, setBusyKey] = useState(null);

  const load = useCallback(async () => {
    try {
      const [saleRes, rentalRes] = await Promise.all([getAdminSales(), getAdminRentals()]);
      setSales(normalizeList(saleRes?.data));
      setRentals(normalizeList(rentalRes?.data));
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to load moderation data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const list = tab === "sales" ? sales : rentals;
  const pendingCount = list.filter((item) => item?.status === "pending").length;

  const applyStatus = async (item, status) => {
    const itemId = String(item?._id || "");
    if (!itemId) return;
    const key = `${tab}:${itemId}:${status}`;
    setBusyKey(key);
    try {
      if (tab === "sales") await updateSaleStatus(itemId, status);
      else await updateRentalStatus(itemId, status);
      if (tab === "sales") {
        setSales((prev) => prev.map((x) => (String(x?._id) === itemId ? { ...x, status } : x)));
      } else {
        setRentals((prev) => prev.map((x) => (String(x?._id) === itemId ? { ...x, status } : x)));
      }
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to update status");
    } finally {
      setBusyKey(null);
    }
  };

  if (auth?.role !== "admin") {
    return (
      <View style={s.center}>
        <Ionicons name="shield-outline" size={56} color={C.muted} />
        <Text style={s.emptyTitle}>Admin access required</Text>
        <TouchableOpacity onPress={() => router.replace("/(admin)/profile")} style={s.backBtn}>
          <Text style={s.backBtnText}>Back to profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) return <PageLoader />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={s.header}>
        <Text style={s.title}>Admin Moderation</Text>
        <Text style={s.subtitle}>Review and approve or reject listings</Text>
        <View style={s.tabsRow}>
          {TABS.map((k) => (
            <TouchableOpacity key={k} onPress={() => setTab(k)} style={[s.tabBtn, tab === k && s.tabBtnActive]}>
              <Text style={[s.tabText, tab === k && s.tabTextActive]}>{k === "sales" ? "Cars" : "Rentals"}</Text>
            </TouchableOpacity>
          ))}
          <View style={s.countPill}>
            <Text style={s.countText}>{pendingCount} pending</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item, idx) => String(item?._id || idx)}
        contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Ionicons name="checkmark-done-outline" size={56} color={C.green} />
            <Text style={s.emptyTitle}>No items to moderate</Text>
          </View>
        }
        renderItem={({ item }) => {
          const id = String(item?._id || "");
          const isBusyApprove = busyKey === `${tab}:${id}:approved`;
          const isBusyReject = busyKey === `${tab}:${id}:rejected`;
          const img = resolveMediaUrl(item?.images?.[0]);
          return (
            <View style={s.card}>
              {img ? (
                <Image source={{ uri: img }} style={s.thumb} resizeMode="cover" />
              ) : (
                <View style={[s.thumb, s.thumbPh]}>
                  <Ionicons name={tab === "sales" ? "car-outline" : "car-sport-outline"} size={28} color={C.muted} />
                </View>
              )}
              <View style={s.body}>
                <View style={s.row}>
                  <Text style={s.name} numberOfLines={1}>{item?.title || `${item?.brand || ""} ${item?.model || ""}`.trim() || "Untitled"}</Text>
                  <Text style={[s.status, item?.status === "approved" ? s.statusOk : item?.status === "rejected" ? s.statusBad : s.statusPending]}>
                    {item?.status || "pending"}
                  </Text>
                </View>
                <Text style={s.meta}>{item?.city || "Unknown city"} · {item?.year || "N/A"}</Text>
                <Text style={s.price}>
                  {tab === "sales"
                    ? `${Number(item?.price || 0).toLocaleString()} MAD`
                    : `${Number(item?.pricePerDay || 0).toLocaleString()} MAD/day`}
                </Text>

                <View style={s.actions}>
                  <TouchableOpacity
                    disabled={isBusyApprove}
                    onPress={() => applyStatus(item, "approved")}
                    style={[s.actionBtn, s.approveBtn, isBusyApprove && { opacity: 0.6 }]}
                  >
                    <Text style={s.approveText}>{isBusyApprove ? "..." : "Approve"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={isBusyReject}
                    onPress={() => applyStatus(item, "rejected")}
                    style={[s.actionBtn, s.rejectBtn, isBusyReject && { opacity: 0.6 }]}
                  >
                    <Text style={s.rejectText}>{isBusyReject ? "..." : "Reject"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function createAdminModerationStyles(C) {
  return StyleSheet.create({
    center: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: 24 },
    header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
    title: { color: C.white, fontWeight: "800", fontSize: 22 },
    subtitle: { color: C.muted, fontSize: 13, marginTop: 4 },
    tabsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
    tabBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
    tabBtnActive: { borderColor: C.primary, backgroundColor: C.pillBg },
    tabText: { color: C.muted, fontSize: 12, fontWeight: "700" },
    tabTextActive: { color: C.primary },
    countPill: { marginLeft: "auto", backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, paddingVertical: 6 },
    countText: { color: C.muted, fontSize: 12, fontWeight: "700" },
    emptyWrap: { alignItems: "center", paddingVertical: 72 },
    emptyTitle: { color: C.white, fontWeight: "700", fontSize: 17, marginTop: 14 },
    backBtn: { marginTop: 14, backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 18, paddingVertical: 10 },
    backBtnText: { color: "#fff", fontWeight: "700" },
    card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, overflow: "hidden", marginBottom: 14 },
    thumb: { width: "100%", height: 160, backgroundColor: C.surface },
    thumbPh: { alignItems: "center", justifyContent: "center" },
    body: { padding: 14 },
    row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 4 },
    name: { color: C.white, fontWeight: "700", fontSize: 15, flex: 1 },
    status: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
    statusPending: { color: C.amber },
    statusOk: { color: C.green },
    statusBad: { color: C.red },
    meta: { color: C.muted, fontSize: 12 },
    price: { color: C.primary, fontWeight: "700", marginTop: 6, marginBottom: 10 },
    actions: { flexDirection: "row", gap: 8 },
    actionBtn: { flex: 1, borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
    approveBtn: { backgroundColor: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.45)" },
    rejectBtn: { backgroundColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.45)" },
    approveText: { color: C.green, fontWeight: "700" },
    rejectText: { color: C.red, fontWeight: "700" },
  });
}
