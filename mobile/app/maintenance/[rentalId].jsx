import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { getOwnerRentals } from "../../src/api/rental";
import { getMaintenanceForRental, deleteMaintenanceRecord } from "../../src/api/maintenance";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";
import { getApiErrorMessage } from "../../src/utils/apiErrorMessage";

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const diff = (d - new Date()) / 86400000;
  return diff >= 0 && diff <= 7;
}

function fmtDate(d, lang) {
  if (!d) return "—";
  const locale = lang === "fr" ? "fr-FR" : "en-GB";
  return new Date(d).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" });
}

export default function MaintenanceDetailScreen() {
  const { rentalId: rid } = useLocalSearchParams();
  const rentalId = Array.isArray(rid) ? rid[0] : rid;
  const { auth } = useAuth();
  const { lang, copy } = useAppLang();
  const t = copy.maintenance;
  const { colors: C } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const fr = lang === "fr";
  const numLocale = fr ? "fr-FR" : "en-US";
  const s = useMemo(() => createStyles(C), [C]);

  const [car, setCar] = useState(null);
  const [records, setRecords] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!rentalId) return;
    try {
      const [carRes, mainRes] = await Promise.all([getOwnerRentals(), getMaintenanceForRental(rentalId)]);
      const raw = carRes.data;
      const list = Array.isArray(raw) ? raw : raw?.rentals || [];
      const found = list.find((c) => String(c._id) === String(rentalId));
      setCar(found || null);
      const { records: recs, totalCost: tc } = mainRes.data || {};
      setRecords(Array.isArray(recs) ? recs : []);
      setTotalCost(tc || 0);
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e, t.saveFail));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rentalId, t.saveFail]);

  useEffect(() => {
    load();
  }, [load]);

  useLayoutEffect(() => {
    const title = car?.title || car?.brand ? `${car?.brand || ""} ${car?.model || ""}`.trim() : t.detailTitle;
    navigation.setOptions({ headerTitle: title || t.screenTitle });
  }, [navigation, car, t.detailTitle, t.screenTitle]);

  const handleDelete = (id) => {
    Alert.alert(t.delete, t.confirmDelete, [
      { text: fr ? "Annuler" : "Cancel", style: "cancel" },
      {
        text: t.delete,
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMaintenanceRecord(id);
            await load();
          } catch {
            Alert.alert("Error", t.deleteFail);
          }
        },
      },
    ]);
  };

  if (auth?.role !== "rental_owner") {
    return (
      <View style={s.center}>
        <Text style={s.denied}>{t.accessDenied}</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backBtnText}>{t.backProfile}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  if (!car) {
    return (
      <View style={s.center}>
        <Text style={s.denied}>{fr ? "Véhicule introuvable." : "Vehicle not found."}</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backBtnText}>{fr ? "Retour" : "Go back"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const uri = resolveMediaUrl(car.images?.[0]);

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={s.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
    >
      {uri ? (
        <Image source={{ uri }} style={s.heroImg} resizeMode="cover" />
      ) : (
        <View style={s.heroPh}>
          <Ionicons name="car-sport-outline" size={48} color={C.muted} />
        </View>
      )}
      <View style={s.block}>
        <Text style={s.carTitle}>{car.title || `${car.brand} ${car.model}`}</Text>
        <Text style={s.carMeta}>
          {car.brand} {car.model} · {car.year} · {car.city}
        </Text>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>{t.detailTotal}</Text>
          <Text style={s.totalValue}>
            {Number(totalCost).toLocaleString(numLocale)} {t.mad}
          </Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>{t.detailTitle}</Text>

      {records.length === 0 ? (
        <View style={s.emptyBox}>
          <Text style={s.emptyText}>{t.detailEmpty}</Text>
        </View>
      ) : (
        records.map((r) => (
          <View key={r._id} style={s.recordCard}>
            <View style={s.recordTop}>
              <Text style={s.recordType}>{t.types[r.type] || r.type}</Text>
              <TouchableOpacity onPress={() => handleDelete(r._id)} hitSlop={12}>
                <Ionicons name="trash-outline" size={20} color={C.muted} />
              </TouchableOpacity>
            </View>
            <View style={s.row}>
              <Text style={s.lbl}>{t.lblServiceDate}</Text>
              <Text style={s.val}>{fmtDate(r.date, lang)}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.lbl}>{t.lblCost}</Text>
              <Text style={s.val}>{Number(r.cost).toLocaleString(numLocale)} {t.mad}</Text>
            </View>
            {r.mileageAtService != null && r.mileageAtService !== "" && (
              <View style={s.row}>
                <Text style={s.lbl}>{t.lblMileage}</Text>
                <Text style={s.val}>{Number(r.mileageAtService).toLocaleString(numLocale)} km</Text>
              </View>
            )}
            {r.provider ? (
              <View style={s.row}>
                <Text style={s.lbl}>{t.lblProvider}</Text>
                <Text style={s.val}>{r.provider}</Text>
              </View>
            ) : null}
            {r.nextServiceDate ? (
              <View style={s.row}>
                <Text style={[s.lbl, isDueSoon(r.nextServiceDate) && { color: "#f59e0b" }]}>{t.lblNextDate}</Text>
                <Text style={[s.val, isDueSoon(r.nextServiceDate) && { color: "#f59e0b", fontWeight: "700" }]}>
                  {fmtDate(r.nextServiceDate, lang)}
                </Text>
              </View>
            ) : null}
            {r.nextServiceMileage != null && r.nextServiceMileage !== "" ? (
              <View style={s.row}>
                <Text style={s.lbl}>{t.lblNextMileage}</Text>
                <Text style={s.val}>{Number(r.nextServiceMileage).toLocaleString(numLocale)} km</Text>
              </View>
            ) : null}
            {r.notes ? (
              <View style={s.notesBlock}>
                <Text style={s.lbl}>{t.lblNotes}</Text>
                <Text style={s.notes}>{r.notes}</Text>
              </View>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

function createStyles(C) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    scrollContent: { paddingBottom: 32 },
    center: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: 24 },
    denied: { color: C.white, fontSize: 16, textAlign: "center" },
    backBtn: { marginTop: 16, backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    backBtnText: { color: "#fff", fontWeight: "700" },
    heroImg: { width: "100%", height: 200, backgroundColor: C.inputBg },
    heroPh: { width: "100%", height: 200, backgroundColor: C.inputBg, alignItems: "center", justifyContent: "center" },
    block: { padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
    carTitle: { color: C.white, fontSize: 20, fontWeight: "800" },
    carMeta: { color: C.muted, fontSize: 13, marginTop: 6 },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 16,
      padding: 14,
      backgroundColor: C.pillBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
    },
    totalLabel: { color: C.muted, fontSize: 13 },
    totalValue: { color: C.primary, fontSize: 18, fontWeight: "800" },
    sectionTitle: { color: C.white, fontSize: 16, fontWeight: "700", paddingHorizontal: 16, marginTop: 20, marginBottom: 10 },
    emptyBox: { marginHorizontal: 16, padding: 24, backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border },
    emptyText: { color: C.muted, fontSize: 14, textAlign: "center" },
    recordCard: {
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      backgroundColor: C.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: C.border,
    },
    recordTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    recordType: { color: C.primary, fontSize: 13, fontWeight: "800", textTransform: "uppercase", flex: 1 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8, gap: 12 },
    lbl: { color: C.muted, fontSize: 12, flex: 1 },
    val: { color: C.white, fontSize: 14, fontWeight: "600", flex: 1, textAlign: "right" },
    notesBlock: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
    notes: { color: C.white, fontSize: 14, marginTop: 6, lineHeight: 20 },
  });
}
