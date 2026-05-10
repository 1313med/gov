import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getOwnerRentals } from "../../src/api/rental";
import { getAllMaintenance, createMaintenanceRecord } from "../../src/api/maintenance";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";
import { getApiErrorMessage } from "../../src/utils/apiErrorMessage";

const TYPE_OPTIONS = ["oil_change", "tire_rotation", "inspection", "repair", "cleaning", "other"];

const BLANK = {
  rentalId: "",
  type: "oil_change",
  cost: "",
  date: "",
  mileageAtService: "",
  provider: "",
  notes: "",
  nextServiceDate: "",
  nextServiceMileage: "",
};

function isDueSoon(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const diff = (d - new Date()) / 86400000;
  return diff >= 0 && diff <= 7;
}

export default function MaintenanceScreen() {
  const { auth } = useAuth();
  const { lang, copy } = useAppLang();
  const t = copy.maintenance;
  const { colors: C } = useTheme();
  const router = useRouter();
  const fr = lang === "fr";
  const numLocale = fr ? "fr-FR" : "en-US";
  const s = useMemo(() => createStyles(C), [C]);

  const [cars, setCars] = useState([]);
  const [records, setRecords] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCar, setModalCar] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const [mainRes, carRes] = await Promise.all([getAllMaintenance(), getOwnerRentals()]);
      const data = mainRes.data;
      const allRecords = (data.byRental || []).flatMap((g) =>
        (g.records || []).map((r) => ({ ...r, _rentalTitle: g.rental?.title }))
      );
      setRecords(allRecords);
      setTotalCost(data.totalCost || 0);
      const raw = carRes.data;
      setCars(Array.isArray(raw) ? raw : raw?.rentals || []);
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e, t.saveFail));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const byCarId = useMemo(() => {
    return records.reduce((acc, r) => {
      const id = (r.rentalId?._id || r.rentalId)?.toString();
      if (id) (acc[id] = acc[id] || []).push(r);
      return acc;
    }, {});
  }, [records]);

  const dueSoonCount = useMemo(() => records.filter((r) => isDueSoon(r.nextServiceDate)).length, [records]);

  const openModal = (car) => {
    setModalCar(car);
    setForm({ ...BLANK, rentalId: car._id });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalCar(null);
    setForm(BLANK);
  };

  const handleSave = async () => {
    if (!form.rentalId || !form.date || form.cost === "" || form.cost === undefined) {
      Alert.alert("Error", fr ? "Date et coût requis." : "Date and cost are required.");
      return;
    }
    const costNum = Number(form.cost);
    if (Number.isNaN(costNum) || costNum < 0) {
      Alert.alert("Error", fr ? "Coût invalide." : "Invalid cost.");
      return;
    }
    setSaving(true);
    try {
      await createMaintenanceRecord({
        rentalId: form.rentalId,
        type: form.type,
        cost: costNum,
        date: form.date,
        mileageAtService: form.mileageAtService ? Number(form.mileageAtService) : undefined,
        nextServiceMileage: form.nextServiceMileage ? Number(form.nextServiceMileage) : undefined,
        nextServiceDate: form.nextServiceDate || undefined,
        provider: form.provider || undefined,
        notes: form.notes || undefined,
      });
      closeModal();
      await load();
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e, t.saveFail));
    } finally {
      setSaving(false);
    }
  };

  if (auth?.role !== "rental_owner") {
    return (
      <View style={s.center}>
        <Ionicons name="construct-outline" size={56} color={C.muted} />
        <Text style={s.deniedTitle}>{t.accessDenied}</Text>
        <TouchableOpacity onPress={() => router.replace("/(tabs)/profile")} style={s.backBtn}>
          <Text style={s.backBtnText}>{t.backProfile}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={s.loadingText}>{t.loading}</Text>
      </View>
    );
  }

  const SummaryHeader = (
    <View style={s.headerBlock}>
      <Text style={s.eyebrow}>{t.eyebrow}</Text>
      <Text style={s.pageTitle}>{t.title}</Text>
      <Text style={s.pageSub}>{t.sub}</Text>
      <View style={s.summaryRow}>
        {[
          [cars.length, t.summary.cars],
          [records.length, t.summary.records],
          [Number(totalCost).toLocaleString(numLocale), t.summary.total],
          [dueSoonCount, t.summary.dueSoon],
        ].map(([val, label], i) => (
          <View key={label} style={[s.sumCell, i === 2 && { borderColor: C.primary + "40" }]}>
            <Text style={[s.sumNum, i === 3 && dueSoonCount > 0 && { color: "#f59e0b" }]}>{val}</Text>
            <Text style={s.sumLabel}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={s.screen}>
      <FlatList
        data={cars}
        keyExtractor={(item) => item._id}
        contentContainerStyle={s.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListHeaderComponent={
          <>
            {SummaryHeader}
            {cars.length === 0 && (
              <View style={s.emptyFleet}>
                <Ionicons name="car-outline" size={48} color={C.muted} />
                <Text style={s.emptyFleetText}>{t.emptyFleet}</Text>
                <TouchableOpacity onPress={() => router.push("/add-rental")} style={s.emptyFleetBtn}>
                  <Text style={s.emptyFleetBtnText}>{fr ? "Ajouter une location" : "Add rental"}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        renderItem={({ item: car }) => {
          const carRecords = byCarId[car._id] || [];
          const carCost = carRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
          const uri = resolveMediaUrl(car.images?.[0]);
          return (
            <View style={s.card}>
              <Pressable
                onPress={() => router.push(`/maintenance/${car._id}`)}
                style={({ pressed }) => [s.cardPressable, pressed && { opacity: 0.92 }]}
                android_ripple={{ color: "rgba(124,107,255,0.15)" }}
              >
                {uri ? (
                  <Image source={{ uri }} style={s.cardImg} resizeMode="cover" />
                ) : (
                  <View style={s.cardImgPh}>
                    <Ionicons name="car-sport-outline" size={40} color={C.muted} />
                  </View>
                )}
                <View style={s.cardHead}>
                  <Text style={s.cardTitle} numberOfLines={2}>{car.title || `${car.brand} ${car.model}`}</Text>
                  <Text style={s.cardMeta}>
                    {car.brand} {car.model} · {car.year} · {car.city}
                  </Text>
                  <Text style={s.listHint}>{t.listHint}</Text>
                  <View style={s.cardSummaryRow}>
                    <Text style={s.cardSummaryText}>
                      {carRecords.length} {t.listRecordsCount}
                      {carRecords.length > 0 ? ` · ${Number(carCost).toLocaleString(numLocale)} ${t.mad}` : ""}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={C.primary} />
                  </View>
                </View>
              </Pressable>
              <TouchableOpacity onPress={() => openModal(car)} style={s.addBtn}>
                <Ionicons name="add-circle-outline" size={18} color={C.primary} />
                <Text style={s.addBtnText}>{t.addBtn}</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={s.modalRoot}>
          <Pressable style={s.modalBackdrop} onPress={closeModal} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.modalKb}>
            <View style={s.modalSheet}>
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <View style={s.modalGrab}>
                  <View style={s.modalGrabBar} />
                </View>
                <Text style={s.modalTitle}>{t.modal.title}</Text>
                {modalCar && <Text style={s.modalSub}>{modalCar.title}</Text>}

                <Text style={s.fieldLabel}>{t.modal.serviceType}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.typeScroll}>
                  {TYPE_OPTIONS.map((typ) => {
                    const active = form.type === typ;
                    return (
                      <TouchableOpacity
                        key={typ}
                        onPress={() => setForm((p) => ({ ...p, type: typ }))}
                        style={[s.typeChip, active && { backgroundColor: C.pillBg, borderColor: C.primary }]}
                      >
                        <Text style={[s.typeChipText, active && { color: C.primary, fontWeight: "700" }]}>{t.types[typ]}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <Text style={s.fieldLabel}>{t.modal.date}</Text>
                <TextInput
                  style={s.input}
                  value={form.date}
                  onChangeText={(v) => setForm((p) => ({ ...p, date: v }))}
                  placeholder="2025-06-01"
                  placeholderTextColor={C.label}
                />

                <View style={s.row2}>
                  <View style={s.row2Item}>
                    <Text style={s.fieldLabel}>{t.modal.cost}</Text>
                    <TextInput
                      style={s.input}
                      value={String(form.cost)}
                      onChangeText={(v) => setForm((p) => ({ ...p, cost: v }))}
                      placeholder={t.modal.costPh}
                      placeholderTextColor={C.label}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={s.row2Item}>
                    <Text style={s.fieldLabel}>{t.modal.mileage}</Text>
                    <TextInput
                      style={s.input}
                      value={String(form.mileageAtService)}
                      onChangeText={(v) => setForm((p) => ({ ...p, mileageAtService: v }))}
                      placeholder={t.modal.mileagePh}
                      placeholderTextColor={C.label}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <Text style={s.fieldLabel}>{t.modal.provider}</Text>
                <TextInput
                  style={s.input}
                  value={form.provider}
                  onChangeText={(v) => setForm((p) => ({ ...p, provider: v }))}
                  placeholder={t.modal.providerPh}
                  placeholderTextColor={C.label}
                />

                <View style={s.row2}>
                  <View style={s.row2Item}>
                    <Text style={s.fieldLabel}>{t.modal.nextDate}</Text>
                    <TextInput
                      style={s.input}
                      value={form.nextServiceDate}
                      onChangeText={(v) => setForm((p) => ({ ...p, nextServiceDate: v }))}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={C.label}
                    />
                  </View>
                  <View style={s.row2Item}>
                    <Text style={s.fieldLabel}>{t.modal.nextMileage}</Text>
                    <TextInput
                      style={s.input}
                      value={String(form.nextServiceMileage)}
                      onChangeText={(v) => setForm((p) => ({ ...p, nextServiceMileage: v }))}
                      placeholder={t.modal.nextMileagePh}
                      placeholderTextColor={C.label}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <Text style={s.fieldLabel}>{t.modal.notes}</Text>
                <TextInput
                  style={[s.input, s.textArea]}
                  value={form.notes}
                  onChangeText={(v) => setForm((p) => ({ ...p, notes: v }))}
                  placeholder={t.modal.notesPh}
                  placeholderTextColor={C.label}
                  multiline
                />

                <TouchableOpacity onPress={handleSave} disabled={saving} style={[s.saveBtn, saving && { opacity: 0.7 }]}>
                  <Text style={s.saveBtnText}>{saving ? t.modal.saving : t.modal.save}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeModal} style={s.cancelBtn}>
                  <Text style={s.cancelBtnText}>{fr ? "Annuler" : "Cancel"}</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(C) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    center: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: 24 },
    loadingText: { color: C.muted, marginTop: 12, fontSize: 13 },
    deniedTitle: { color: C.white, fontSize: 18, fontWeight: "700", marginTop: 16, textAlign: "center" },
    backBtn: { marginTop: 20, backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    backBtnText: { color: "#fff", fontWeight: "700" },
    listContent: { padding: 16, paddingBottom: 40 },
    headerBlock: { marginBottom: 20 },
    eyebrow: { color: C.muted, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 },
    pageTitle: { color: C.white, fontSize: 24, fontWeight: "800" },
    pageSub: { color: C.muted, fontSize: 13, marginTop: 6, marginBottom: 16, lineHeight: 20 },
    summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    sumCell: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 12,
      padding: 14,
    },
    sumNum: { color: C.white, fontSize: 20, fontWeight: "700" },
    sumLabel: { color: C.muted, fontSize: 10, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.5 },
    emptyFleet: {
      alignItems: "center",
      padding: 32,
      backgroundColor: C.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 16,
    },
    emptyFleetText: { color: C.muted, fontSize: 14, textAlign: "center", marginTop: 12 },
    emptyFleetBtn: { marginTop: 16, backgroundColor: C.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
    emptyFleetBtnText: { color: "#fff", fontWeight: "700" },
    card: {
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 16,
      marginBottom: 16,
      overflow: "hidden",
    },
    cardImg: { width: "100%", height: 140 },
    cardImgPh: { width: "100%", height: 140, backgroundColor: C.inputBg, alignItems: "center", justifyContent: "center" },
    cardHead: { padding: 14, borderBottomWidth: 1, borderBottomColor: C.border },
    cardTitle: { color: C.white, fontSize: 16, fontWeight: "700" },
    cardMeta: { color: C.muted, fontSize: 12, marginTop: 4 },
    cardPressable: {},
    listHint: { color: C.muted, fontSize: 11, marginTop: 10, fontStyle: "italic" },
    cardSummaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: C.border,
    },
    cardSummaryText: { color: C.white, fontSize: 14, fontWeight: "600", flex: 1 },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 14,
      backgroundColor: C.pillBg,
      borderTopWidth: 1,
      borderTopColor: C.border,
    },
    addBtnText: { color: C.primary, fontWeight: "700", fontSize: 14 },
    modalRoot: { flex: 1, justifyContent: "flex-end" },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)" },
    modalKb: { maxHeight: "92%", width: "100%" },
    modalSheet: {
      backgroundColor: C.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingBottom: 28,
      maxHeight: "92%",
      borderWidth: 1,
      borderColor: C.border,
    },
    modalGrab: { alignItems: "center", paddingVertical: 10 },
    modalGrabBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border },
    modalTitle: { color: C.white, fontSize: 18, fontWeight: "800" },
    modalSub: { color: C.muted, fontSize: 13, marginBottom: 12, marginTop: 4 },
    fieldLabel: { color: C.label, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 6, marginTop: 10 },
    typeScroll: { marginBottom: 4, maxHeight: 44 },
    typeChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.border,
      marginRight: 8,
      backgroundColor: C.inputBg,
    },
    typeChipText: { color: C.muted, fontSize: 12 },
    input: {
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: C.white,
      fontSize: 15,
    },
    textArea: { minHeight: 72, textAlignVertical: "top" },
    row2: { flexDirection: "row", gap: 12 },
    row2Item: { flex: 1 },
    saveBtn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 16 },
    saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    cancelBtn: { paddingVertical: 14, alignItems: "center" },
    cancelBtnText: { color: C.muted, fontWeight: "600" },
  });
}
