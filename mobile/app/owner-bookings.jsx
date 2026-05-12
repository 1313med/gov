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
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {
  getOwnerBookings,
  updateBookingStatus,
  markBookingPaid,
  updateBookingMedia,
  setOwnerBookingArchive,
} from "../src/api/booking";
import { uploadListingImages } from "../src/api/upload";
import { submitCustomerFeedback, getFeedbackForBooking, getFeedbackForCustomer } from "../src/api/customerFeedback";
import { useAppLang } from "../src/context/AppLangContext";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import { resolveMediaUrl } from "../src/utils/mediaUrl";
import { openExternalUrl } from "../src/utils/openExternalUrl";
import { shareBookingPdf } from "../src/utils/bookingPdf";

const PAGE_SIZE = 15;

function buildOwnerBookingParams(page, limit, filter, listScope) {
  const params = { page, limit };
  if (listScope === "archived") {
    params.archive = "only";
  } else {
    params.archive = "exclude";
    if (filter && filter !== "all") params.status = filter;
  }
  return params;
}

const DEFAULT_STATS = { total: 0, pending: 0, confirmed: 0, completed: 0, rejected: 0, cancelled: 0, revenue: 0 };

const STATUS = {
  pending: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#f59e0b", icon: "time-outline" },
  confirmed: { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", text: "#34d399", icon: "checkmark-circle-outline" },
  completed: { bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)", text: "#60a5fa", icon: "flag-outline" },
  rejected: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#f87171", icon: "close-circle-outline" },
  cancelled: { bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.3)", text: "#94a3b8", icon: "ban-outline" },
};

const FILTERS = ["all", "pending", "confirmed", "completed", "rejected", "cancelled"];

function filterChipLabel(key, fr) {
  const m = fr
    ? {
        all: "Tout",
        pending: "Attente",
        confirmed: "Confirmées",
        completed: "Terminées",
        rejected: "Refusées",
        cancelled: "Annulées",
      }
    : {
        all: "All",
        pending: "Pending",
        confirmed: "Confirmed",
        completed: "Done",
        rejected: "Rejected",
        cancelled: "Cancelled",
      };
  return m[key] || key;
}

function createOwnerBookingsStyles(C, isDark) {
  return {
    a: StyleSheet.create({
      btn: { flex: 1, minWidth: "30%", borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
      btnText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.2 },
    }),
    m: StyleSheet.create({
      wrap: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
      section: { color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
      tabs: { flexDirection: "row", gap: 8, marginBottom: 10 },
      tab: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.border, alignItems: "center", backgroundColor: C.surface },
      tabOn: { borderColor: "#34d399", backgroundColor: "rgba(52,211,153,0.08)" },
      tabOnAfter: { borderColor: "#f87171", backgroundColor: "rgba(248,113,113,0.08)" },
      tabText: { color: C.muted, fontSize: 12, fontWeight: "600" },
      tabTextOn: { color: C.white },
      grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
      thumb: { width: 72, height: 72, borderRadius: 10, overflow: "hidden" },
      img: { width: "100%", height: "100%" },
      rm: { position: "absolute", top: 2, right: 2, backgroundColor: "rgba(0,0,0,0.65)", borderRadius: 12, padding: 4 },
      add: { width: 72, height: 72, borderRadius: 10, borderWidth: 1, borderColor: "rgba(124,107,255,0.35)", borderStyle: "dashed", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(124,107,255,0.05)" },
      docRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
      docInput: { flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: C.white, fontSize: 13 },
      docBtn: { backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 14, justifyContent: "center" },
      docBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
      docItem: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: C.surface, borderRadius: 10, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: C.border },
      docName: { flex: 1, color: C.white, fontSize: 13 },
      docLink: { color: C.primary, fontSize: 12, fontWeight: "600" },
      save: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 14 },
      saveText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    }),
    f: StyleSheet.create({
      overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "center", padding: 20 },
      box: { backgroundColor: C.card, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border },
      title: { color: C.white, fontWeight: "800", fontSize: 18 },
      sub: { color: C.muted, fontSize: 12, marginBottom: 12 },
      lbl: { color: C.muted, fontSize: 11, marginTop: 10, marginBottom: 6, textTransform: "uppercase" },
      row: { flexDirection: "row", gap: 10, marginBottom: 12 },
      big: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border, alignItems: "center", backgroundColor: C.surface },
      bigGood: { borderColor: "#34d399", backgroundColor: "rgba(52,211,153,0.1)" },
      bigBad: { borderColor: "#f87171", backgroundColor: "rgba(248,113,113,0.1)" },
      bigT: { color: C.white, fontWeight: "700", fontSize: 13 },
      q: { marginBottom: 12 },
      qLabel: { color: C.slate, fontSize: 13, marginBottom: 6 },
      qBtns: { flexDirection: "row", gap: 8 },
      qBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: C.border, alignItems: "center", backgroundColor: C.surface },
      qBtnYes: { borderColor: "#34d399", backgroundColor: "rgba(52,211,153,0.1)" },
      qBtnNo: { borderColor: "#f87171", backgroundColor: "rgba(248,113,113,0.1)" },
      qBtnT: { color: C.muted, fontSize: 12, fontWeight: "600" },
      qBtnTOn: { color: C.white },
      note: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 10, color: C.white, minHeight: 72, textAlignVertical: "top" },
      actions: { flexDirection: "row", gap: 10, marginTop: 16 },
      cancel: { flex: 1, padding: 12, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: C.border },
      cancelT: { color: C.muted, fontWeight: "600" },
      ok: { flex: 1, padding: 12, alignItems: "center", borderRadius: 12, backgroundColor: C.primary },
      okT: { color: "#fff", fontWeight: "700" },
    }),
    cp: StyleSheet.create({
      overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 16 },
      box: {
        backgroundColor: C.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: C.border,
        maxHeight: "90%",
      },
      headRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
      title: { color: C.white, fontWeight: "800", fontSize: 18, flex: 1 },
      hint: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
        backgroundColor: "rgba(245,158,11,0.12)",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(245,158,11,0.35)",
      },
      hintText: { color: "#fde68a", fontSize: 13, flex: 1, lineHeight: 19 },
      warn: { color: C.amber, fontSize: 13, marginBottom: 8 },
      name: { color: C.white, fontWeight: "700", fontSize: 17 },
      meta: { color: C.muted, fontSize: 12, marginBottom: 14, lineHeight: 18 },
      section: {
        color: C.muted,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: 0.6,
        marginTop: 12,
        marginBottom: 6,
      },
      line: { color: C.slate, fontSize: 13, marginBottom: 8 },
      docImg: {
        width: "100%",
        height: 140,
        borderRadius: 12,
        backgroundColor: C.surface,
        marginBottom: 4,
      },
      tapHint: { color: C.primary, fontSize: 12, fontWeight: "600", marginBottom: 10 },
      missing: { color: C.muted, fontStyle: "italic", fontSize: 13, marginBottom: 8 },
      sum: { color: C.slate, fontSize: 12, marginBottom: 10, lineHeight: 18 },
      sumGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
      sumCard: { width: "48%", backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingVertical: 10, paddingHorizontal: 10 },
      sumNum: { color: C.white, fontWeight: "800", fontSize: 18 },
      sumLbl: { color: C.muted, fontSize: 11, marginTop: 2 },
      emptyFb: { color: C.muted, fontSize: 13, marginBottom: 8, lineHeight: 19 },
      err: { color: C.red, fontSize: 13, marginBottom: 8 },
      fbCard: {
        backgroundColor: C.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: C.border,
      },
      fbHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
      fbWho: { color: C.white, fontSize: 13, fontWeight: "700", flex: 1 },
      fbDate: { color: C.muted, fontSize: 11, marginTop: 2 },
      fbRental: { color: C.slate, fontSize: 12, marginTop: 4, marginBottom: 8 },
      fbOverallPill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
      fbOverallGood: { backgroundColor: "rgba(74,222,128,0.15)", borderWidth: 1, borderColor: "rgba(74,222,128,0.35)" },
      fbOverallBad: { backgroundColor: "rgba(248,113,113,0.15)", borderWidth: 1, borderColor: "rgba(248,113,113,0.35)" },
      fbOverallT: { color: C.white, fontSize: 12, fontWeight: "700" },
      fbGood: { color: "#4ade80" },
      fbBad: { color: "#f87171" },
      flagWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
      flagChip: { backgroundColor: C.card, borderRadius: 999, borderWidth: 1, borderColor: C.border, paddingHorizontal: 8, paddingVertical: 4 },
      flagChipT: { color: C.muted, fontSize: 11, fontWeight: "600" },
      fbNote: { color: C.slate, fontSize: 12, marginTop: 10, fontStyle: "italic", lineHeight: 18 },
      closeBtn: {
        marginTop: 14,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: C.primary,
        alignItems: "center",
      },
      closeBtnT: { color: "#fff", fontWeight: "700", fontSize: 15 },
    }),
    s: StyleSheet.create({
      center: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
      listHead: {
        paddingBottom: 4,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.border,
        marginHorizontal: -16,
        paddingHorizontal: 16,
        marginBottom: 12,
      },
      listHeadAccent: { height: 2, width: 36, borderRadius: 2, backgroundColor: C.primary, marginBottom: 12, opacity: 0.9 },
      listHeadTitle: { color: C.white, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
      listHeadSub: { color: C.muted, fontSize: 12, marginTop: 6, lineHeight: 17 },
      statsScroll: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, paddingRight: 4 },
      statPill: {
        borderRadius: 12,
        paddingVertical: 9,
        paddingHorizontal: 12,
        minWidth: 76,
        backgroundColor: C.inputBg,
        borderWidth: 1,
        borderColor: C.border,
      },
      statPillVal: { color: C.white, fontWeight: "800", fontSize: 15, letterSpacing: -0.3 },
      statPillLbl: { color: C.muted, fontSize: 9, marginTop: 3, fontWeight: "700", letterSpacing: 0.3 },
      filterBar: { marginTop: 2, marginBottom: 0, marginHorizontal: -16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
      filterScroll: { paddingHorizontal: 16, gap: 8, alignItems: "center" },
      filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: C.card,
        borderColor: C.border,
      },
      filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
      filterChipText: { color: C.muted, fontSize: 12, fontWeight: "700" },
      filterChipTextActive: { color: "#fff" },
      scopeRow: { flexDirection: "row", gap: 8, marginTop: 12, marginHorizontal: -16, paddingHorizontal: 16 },
      scopeChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.card,
        alignItems: "center",
      },
      scopeChipOn: { borderColor: C.primary, backgroundColor: "rgba(124,107,255,0.14)" },
      scopeChipText: { color: C.muted, fontSize: 13, fontWeight: "800" },
      scopeChipTextOn: { color: C.white },
      empty: { alignItems: "center", paddingVertical: 72, paddingHorizontal: 24 },
      emptyTitle: { color: C.white, fontWeight: "800", fontSize: 18, marginTop: 16, textAlign: "center" },
      emptySub: { color: C.muted, fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 20 },
      card: {
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 20,
        marginBottom: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: isDark ? 0.35 : 0.07,
        shadowRadius: 14,
        elevation: 4,
      },
      cardPad: { padding: 16 },
      cardTop: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
      thumb: { width: 80, height: 62, borderRadius: 14, backgroundColor: C.surface },
      thumbPh: { alignItems: "center", justifyContent: "center" },
      rentalTitle: { color: C.white, fontWeight: "700", fontSize: 15 },
      sub: { color: C.muted, fontSize: 12, marginTop: 2 },
      customerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
      customerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.pillBg, alignItems: "center", justifyContent: "center", marginRight: 8 },
      customerAvatarText: { color: C.primary, fontSize: 11, fontWeight: "700" },
      customerName: { color: C.white, fontWeight: "600", fontSize: 14 },
      customerContact: { color: C.muted, fontSize: 11, marginTop: 2 },
      profileLink: { color: C.primary, fontSize: 11, marginTop: 4, fontWeight: "600" },
      badge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12, gap: 4 },
      badgeText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
      datesRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
      dateBox: { flex: 1, backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12 },
      dateLabel: { color: C.muted, fontSize: 11, marginBottom: 2 },
      dateVal: { color: C.white, fontWeight: "500", fontSize: 12 },
      offer: { color: "#fbbf24", fontSize: 12, marginBottom: 8 },
      paidRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
      paidText: { color: C.green, fontSize: 12, fontWeight: "500", marginLeft: 4 },
      actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
      pages: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 8 },
      pageBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center", backgroundColor: C.card },
      pageBtnOn: { backgroundColor: C.pillBg, borderColor: C.primary },
      pageBtnT: { color: C.muted, fontWeight: "600" },
      pageBtnTOn: { color: C.primary },
      rated: { color: C.green, fontSize: 12, fontWeight: "600", paddingVertical: 10 },
      pdfRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginBottom: 12,
        backgroundColor: C.inputBg,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(124,107,255,0.35)",
        gap: 10,
      },
      pdfRowText: { flex: 1, color: C.white, fontSize: 13, fontWeight: "600" },
    }),
  };
}

function useOwnerBookingsStyles() {
  const { colors: C, isDark } = useTheme();
  return useMemo(() => ({ C, isDark, ...createOwnerBookingsStyles(C, isDark) }), [C, isDark]);
}

function ActionBtn({ label, variant, onPress }) {
  const { C, a } = useOwnerBookingsStyles();
  const colors = {
    green: { bg: "rgba(52,211,153,0.14)", border: "rgba(52,211,153,0.45)", text: "#34d399" },
    red: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.45)", text: "#f87171" },
    blue: { bg: "rgba(96,165,250,0.14)", border: "rgba(96,165,250,0.45)", text: "#60a5fa" },
    violet: { bg: "rgba(124,107,255,0.16)", border: "rgba(124,107,255,0.5)", text: C.primary },
  };
  const c = colors[variant] || colors.blue;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[a.btn, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[a.btnText, { color: c.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function BookingMediaPanel({ booking, fr, onUpdated }) {
  const { C, m } = useOwnerBookingsStyles();
  const [tab, setTab] = useState("before");
  const [before, setBefore] = useState(booking.conditionPhotos?.before || []);
  const [after, setAfter] = useState(booking.conditionPhotos?.after || []);
  const [docs, setDocs] = useState(booking.documents || []);
  const [docName, setDocName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setBefore(booking.conditionPhotos?.before || []);
    setAfter(booking.conditionPhotos?.after || []);
    setDocs(booking.documents || []);
    setTab("before");
  }, [booking._id]);

  const photos = tab === "before" ? before : after;
  const setPhotos = tab === "before" ? setBefore : setAfter;

  const pickPhotos = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(fr ? "Permission" : "Permission", fr ? "Accès photos requis" : "Photo access is required");
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.85,
    });
    if (r.canceled || !r.assets?.length) return;
    try {
      const files = r.assets.map((asset) => ({
        uri: asset.uri,
        name: "photo.jpg",
        type: asset.mimeType || "image/jpeg",
      }));
      const urls = await uploadListingImages(files);
      setPhotos((p) => [...p, ...urls]);
    } catch {
      Alert.alert("Error", fr ? "Échec envoi image" : "Upload failed");
    }
  };

  const removePhoto = (idx) => setPhotos((p) => p.filter((_, i) => i !== idx));

  const addDocImage = async () => {
    if (!docName.trim()) {
      Alert.alert(fr ? "Nom" : "Name", fr ? "Entrez un nom pour le document" : "Enter a document name");
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.85 });
    if (r.canceled || !r.assets?.[0]) return;
    try {
      const urls = await uploadListingImages([{ uri: r.assets[0].uri, name: "doc.jpg", type: r.assets[0].mimeType || "image/jpeg" }]);
      const url = urls[0];
      if (url) {
        setDocs((d) => [...d, { name: docName.trim(), url, fileType: "image", uploadedAt: new Date().toISOString() }]);
        setDocName("");
      }
    } catch {
      Alert.alert("Error", fr ? "Échec envoi" : "Upload failed");
    }
  };

  const removeDoc = (idx) => setDocs((d) => d.filter((_, i) => i !== idx));

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await updateBookingMedia(booking._id, {
        conditionPhotos: { before, after },
        documents: docs,
      });
      onUpdated(data);
      Alert.alert("", fr ? "Enregistré" : "Saved");
    } catch {
      Alert.alert("Error", fr ? "Échec enregistrement" : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={m.wrap}>
      <Text style={m.section}>{fr ? "Photos véhicule" : "Condition photos"}</Text>
      <View style={m.tabs}>
        <TouchableOpacity onPress={() => setTab("before")} style={[m.tab, tab === "before" && m.tabOn]}>
          <Text style={[m.tabText, tab === "before" && m.tabTextOn]}>{fr ? "Avant" : "Before"} ({before.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab("after")} style={[m.tab, tab === "after" && m.tabOnAfter]}>
          <Text style={[m.tabText, tab === "after" && m.tabTextOn]}>{fr ? "Après" : "After"} ({after.length})</Text>
        </TouchableOpacity>
      </View>
      <View style={m.grid}>
        {photos.map((url, i) => (
          <View key={`${url}-${i}`} style={m.thumb}>
            <Image source={{ uri: url }} style={m.img} />
            <TouchableOpacity onPress={() => removePhoto(i)} style={m.rm}>
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity onPress={pickPhotos} style={m.add}>
          <Ionicons name="add" size={28} color={C.primary} />
        </TouchableOpacity>
      </View>

      <Text style={[m.section, { marginTop: 16 }]}>{fr ? "Documents (images)" : "Documents (images)"}</Text>
      <View style={m.docRow}>
        <TextInput
          value={docName}
          onChangeText={setDocName}
          placeholder={fr ? "Nom du document" : "Document name"}
          placeholderTextColor={C.muted}
          style={m.docInput}
        />
        <TouchableOpacity onPress={addDocImage} style={m.docBtn}>
          <Text style={m.docBtnText}>{fr ? "Ajouter" : "Add"}</Text>
        </TouchableOpacity>
      </View>
      {docs.map((doc, i) => (
        <View key={i} style={m.docItem}>
          <Text style={m.docName} numberOfLines={1}>{doc.name}</Text>
          <TouchableOpacity onPress={() => openExternalUrl(doc.url, { fr })}>
            <Text style={m.docLink}>{fr ? "Ouvrir" : "Open"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeDoc(i)}>
            <Ionicons name="trash-outline" size={18} color={C.red} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity onPress={save} disabled={saving} style={[m.save, saving && { opacity: 0.6 }]}>
        <Text style={m.saveText}>{saving ? "…" : fr ? "Enregistrer fichiers" : "Save photos & docs"}</Text>
      </TouchableOpacity>
    </View>
  );
}

function FeedbackModal({ visible, booking, fr, onClose, onSaved }) {
  const { C, f } = useOwnerBookingsStyles();
  const [overall, setOverall] = useState(null);
  const [hadDamage, setHadDamage] = useState(null);
  const [returnedOnTime, setReturnedOnTime] = useState(null);
  const [carReturnedClean, setCarReturnedClean] = useState(null);
  const [wasRespectful, setWasRespectful] = useState(null);
  const [wouldRentAgain, setWouldRentAgain] = useState(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible || !booking) return;
    setLoading(true);
    getFeedbackForBooking(booking._id)
      .then(({ data }) => {
        if (data) {
          setOverall(data.overall);
          setHadDamage(data.hadDamage);
          setReturnedOnTime(data.returnedOnTime);
          setCarReturnedClean(data.carReturnedClean);
          setWasRespectful(data.wasRespectful);
          setWouldRentAgain(data.wouldRentAgain);
          setNote(data.note || "");
        } else {
          setOverall(null);
          setHadDamage(null);
          setReturnedOnTime(null);
          setCarReturnedClean(null);
          setWasRespectful(null);
          setWouldRentAgain(null);
          setNote("");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [visible, booking?._id]);

  const Q = ({ label, v, setV }) => (
    <View style={f.q}>
      <Text style={f.qLabel}>{label}</Text>
      <View style={f.qBtns}>
        <TouchableOpacity onPress={() => setV(true)} style={[f.qBtn, v === true && f.qBtnYes]}>
          <Text style={[f.qBtnT, v === true && f.qBtnTOn]}>{fr ? "Oui" : "Yes"}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setV(false)} style={[f.qBtn, v === false && f.qBtnNo]}>
          <Text style={[f.qBtnT, v === false && f.qBtnTOn]}>{fr ? "Non" : "No"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const submit = async () => {
    if (overall == null || [hadDamage, returnedOnTime, carReturnedClean, wasRespectful, wouldRentAgain].some((x) => x === null)) {
      Alert.alert(fr ? "Formulaire" : "Form", fr ? "Répondez à toutes les questions" : "Answer all questions");
      return;
    }
    setSaving(true);
    try {
      await submitCustomerFeedback({
        bookingId: booking._id,
        overall,
        hadDamage,
        returnedOnTime,
        carReturnedClean,
        wasRespectful,
        wouldRentAgain,
        note: note.trim(),
      });
      onSaved();
      onClose();
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={f.overlay}>
        <View style={f.box}>
          <Text style={f.title}>{fr ? "Avis client" : "Rate customer"}</Text>
          <Text style={f.sub}>{booking.customerId?.name || "—"}</Text>
          {loading ? (
            <ActivityIndicator color={C.primary} style={{ marginVertical: 24 }} />
          ) : (
            <ScrollView style={{ maxHeight: 420 }} keyboardShouldPersistTaps="handled">
              <Text style={f.lbl}>{fr ? "Impression globale" : "Overall"}</Text>
              <View style={f.row}>
                <TouchableOpacity onPress={() => setOverall("good")} style={[f.big, overall === "good" && f.bigGood]}>
                  <Text style={f.bigT}>👍 {fr ? "Bien" : "Good"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOverall("bad")} style={[f.big, overall === "bad" && f.bigBad]}>
                  <Text style={f.bigT}>👎 {fr ? "Mauvais" : "Bad"}</Text>
                </TouchableOpacity>
              </View>
              <Q label={fr ? "Dégâts constatés ?" : "Any damage?"} v={hadDamage} setV={setHadDamage} />
              <Q label={fr ? "Restitué à l'heure ?" : "Returned on time?"} v={returnedOnTime} setV={setReturnedOnTime} />
              <Q label={fr ? "Véhicule propre ?" : "Car returned clean?"} v={carReturnedClean} setV={setCarReturnedClean} />
              <Q label={fr ? "Client respectueux ?" : "Respectful customer?"} v={wasRespectful} setV={setWasRespectful} />
              <Q label={fr ? "Louer à nouveau ?" : "Would rent again?"} v={wouldRentAgain} setV={setWouldRentAgain} />
              <Text style={f.lbl}>{fr ? "Note (optionnel)" : "Note (optional)"}</Text>
              <TextInput value={note} onChangeText={setNote} multiline style={f.note} placeholderTextColor={C.muted} />
            </ScrollView>
          )}
          <View style={f.actions}>
            <TouchableOpacity onPress={onClose} style={f.cancel}><Text style={f.cancelT}>{fr ? "Fermer" : "Close"}</Text></TouchableOpacity>
            <TouchableOpacity onPress={submit} disabled={saving || loading} style={f.ok}>
              <Text style={f.okT}>{saving ? "…" : fr ? "Envoyer" : "Submit"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CustomerProfileModal({ visible, booking, fr, ownerId, onClose }) {
  const { C, cp } = useOwnerBookingsStyles();
  const customer = booking?.customerId;
  const cid =
    customer && typeof customer === "object" && customer._id != null
      ? String(customer._id)
      : null;

  const [loadingFb, setLoadingFb] = useState(false);
  const [fbPayload, setFbPayload] = useState(null);
  const [fbErr, setFbErr] = useState(null);

  useEffect(() => {
    if (!visible || !cid) {
      setFbPayload(null);
      setFbErr(null);
      return;
    }
    setLoadingFb(true);
    setFbErr(null);
    getFeedbackForCustomer(cid)
      .then(({ data }) => setFbPayload(data))
      .catch((e) => {
        setFbPayload(null);
        setFbErr(e?.response?.data?.message || (fr ? "Impossible de charger les avis" : "Could not load reviews"));
      })
      .finally(() => setLoadingFb(false));
  }, [visible, cid, fr]);

  const otherFeedbacks = useMemo(() => {
    const list = fbPayload?.feedbacks || [];
    if (!ownerId) return list;
    return list.filter((f) => String(f.ownerId?._id || f.ownerId) !== String(ownerId));
  }, [fbPayload, ownerId]);

  const otherSummary = useMemo(() => {
    const total = otherFeedbacks.length;
    if (!total) {
      return {
        total: 0,
        goodCount: 0,
        badCount: 0,
        damageCount: 0,
        lateCount: 0,
        wouldRentAgainCount: 0,
      };
    }
    return {
      total,
      goodCount: otherFeedbacks.filter((f) => f.overall === "good").length,
      badCount: otherFeedbacks.filter((f) => f.overall === "bad").length,
      damageCount: otherFeedbacks.filter((f) => f.hadDamage).length,
      lateCount: otherFeedbacks.filter((f) => !f.returnedOnTime).length,
      wouldRentAgainCount: otherFeedbacks.filter((f) => f.wouldRentAgain).length,
    };
  }, [otherFeedbacks]);

  if (!booking) return null;

  const dl = typeof customer === "object" ? customer?.driverLicense : null;
  const nid = typeof customer === "object" ? customer?.nationalId : null;
  const licExpiry =
    dl?.expiryDate != null
      ? new Date(dl.expiryDate).toLocaleDateString(fr ? "fr-FR" : "en-US")
      : "";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={cp.overlay}>
        <View style={cp.box}>
          <View style={cp.headRow}>
            <Text style={cp.title}>{fr ? "Profil client" : "Customer profile"}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={26} color={C.muted} />
            </TouchableOpacity>
          </View>

          {booking.status === "pending" && (
            <View style={cp.hint}>
              <Ionicons name="information-circle-outline" size={20} color="#fbbf24" />
              <Text style={cp.hintText}>
                {fr
                  ? "Vérifiez permis et CIN avant d'approuver ou de refuser."
                  : "Check license and national ID before you confirm or reject."}
              </Text>
            </View>
          )}

          {!cid && (
            <Text style={cp.warn}>
              {fr ? "Données client incomplètes. Tirez pour actualiser." : "Customer data missing. Pull to refresh."}
            </Text>
          )}

          <ScrollView style={{ maxHeight: 480 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {typeof customer === "object" && customer && (
              <>
                <Text style={cp.name}>{customer.name || "—"}</Text>
                <Text style={cp.meta}>
                  {[customer.phone, customer.email, customer.city].filter(Boolean).join(" · ")}
                </Text>

                <Text style={cp.section}>{fr ? "Permis de conduire" : "Driving license"}</Text>
                {dl?.number || dl?.imageUrl ? (
                  <>
                    <Text style={cp.line}>
                      {fr ? "N°" : "No."} {dl?.number || "—"}
                      {licExpiry ? ` · ${fr ? "Exp." : "Exp."} ${licExpiry}` : ""}
                      {dl?.verified ? ` · ${fr ? "Vérifié" : "Verified"}` : ""}
                    </Text>
                    {resolveMediaUrl(dl?.imageUrl) ? (
                      <TouchableOpacity
                        onPress={() => openExternalUrl(resolveMediaUrl(dl.imageUrl), { fr })}
                        activeOpacity={0.85}
                      >
                        <Image source={{ uri: resolveMediaUrl(dl.imageUrl) }} style={cp.docImg} resizeMode="cover" />
                        <Text style={cp.tapHint}>{fr ? "Ouvrir la photo" : "Open photo"}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={cp.missing}>{fr ? "Photo manquante" : "No photo"}</Text>
                    )}
                  </>
                ) : (
                  <Text style={cp.missing}>{fr ? "Non renseigné" : "Not provided"}</Text>
                )}

                <Text style={cp.section}>{fr ? "CIN (carte d'identité)" : "National ID (CIN)"}</Text>
                {nid?.number || nid?.imageUrl ? (
                  <>
                    <Text style={cp.line}>
                      {fr ? "N°" : "No."} {nid?.number || "—"}
                      {nid?.verified ? ` · ${fr ? "Vérifié" : "Verified"}` : ""}
                    </Text>
                    {resolveMediaUrl(nid?.imageUrl) ? (
                      <TouchableOpacity
                        onPress={() => openExternalUrl(resolveMediaUrl(nid.imageUrl), { fr })}
                        activeOpacity={0.85}
                      >
                        <Image source={{ uri: resolveMediaUrl(nid.imageUrl) }} style={cp.docImg} resizeMode="cover" />
                        <Text style={cp.tapHint}>{fr ? "Ouvrir la photo" : "Open photo"}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={cp.missing}>{fr ? "Photo manquante" : "No photo"}</Text>
                    )}
                  </>
                ) : (
                  <Text style={cp.missing}>{fr ? "Non renseigné" : "Not provided"}</Text>
                )}
              </>
            )}

            <Text style={cp.section}>
              {fr ? "Avis d'autres propriétaires" : "Feedback from other owners"}
            </Text>
            {loadingFb ? (
              <ActivityIndicator color={C.primary} style={{ marginVertical: 16 }} />
            ) : fbErr ? (
              <Text style={cp.err}>{fbErr}</Text>
            ) : otherSummary.total === 0 ? (
              <Text style={cp.emptyFb}>
                {fr
                  ? "Pas encore d'avis d'autres loueurs pour ce client."
                  : "No reviews from other rental owners yet."}
              </Text>
            ) : (
              <>
                <View style={cp.sumGrid}>
                  <View style={cp.sumCard}>
                    <Text style={cp.sumNum}>{otherSummary.total}</Text>
                    <Text style={cp.sumLbl}>{fr ? "Avis" : "Reviews"}</Text>
                  </View>
                  <View style={cp.sumCard}>
                    <Text style={[cp.sumNum, cp.fbGood]}>{otherSummary.goodCount}</Text>
                    <Text style={cp.sumLbl}>{fr ? "Positifs" : "Good"}</Text>
                  </View>
                  <View style={cp.sumCard}>
                    <Text style={[cp.sumNum, cp.fbBad]}>{otherSummary.badCount}</Text>
                    <Text style={cp.sumLbl}>{fr ? "Négatifs" : "Bad"}</Text>
                  </View>
                  <View style={cp.sumCard}>
                    <Text style={cp.sumNum}>{otherSummary.wouldRentAgainCount}</Text>
                    <Text style={cp.sumLbl}>{fr ? "Reloueraient" : "Would rent again"}</Text>
                  </View>
                </View>
                {(otherSummary.damageCount > 0 || otherSummary.lateCount > 0) && (
                  <Text style={cp.sum}>
                    {[
                      otherSummary.damageCount ? `${fr ? "Dégâts signalés" : "Damage reports"}: ${otherSummary.damageCount}` : null,
                      otherSummary.lateCount ? `${fr ? "Retards" : "Late returns"}: ${otherSummary.lateCount}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                )}
                {otherFeedbacks.map((f) => {
                  const when = f?.createdAt ? new Date(f.createdAt).toLocaleDateString(fr ? "fr-FR" : "en-US") : null;
                  const flags = [
                    f.hadDamage ? (fr ? "Dégâts" : "Damage") : null,
                    !f.returnedOnTime ? (fr ? "Retard" : "Late return") : null,
                    f.wasRespectful === false ? (fr ? "Peu respectueux" : "Not respectful") : null,
                    f.wouldRentAgain ? (fr ? "Relouerait" : "Would rent again") : (fr ? "Ne relouerait pas" : "Would not rent again"),
                  ].filter(Boolean);
                  return (
                    <View key={f._id} style={cp.fbCard}>
                      <View style={cp.fbHead}>
                        <Text style={cp.fbWho} numberOfLines={2}>{f.ownerId?.name || "—"}</Text>
                        {when ? <Text style={cp.fbDate}>{when}</Text> : null}
                      </View>
                      <Text style={cp.fbRental} numberOfLines={2}>{f.rentalId?.title || "—"}</Text>
                      <View style={[cp.fbOverallPill, f.overall === "good" ? cp.fbOverallGood : cp.fbOverallBad]}>
                        <Text style={cp.fbOverallT}>
                          {f.overall === "good" ? (fr ? "Bon locataire" : "Good renter") : (fr ? "Retour négatif" : "Poor experience")}
                        </Text>
                      </View>
                      <View style={cp.flagWrap}>
                        {flags.map((flag) => (
                          <View key={`${f._id}-${flag}`} style={cp.flagChip}>
                            <Text style={cp.flagChipT}>{flag}</Text>
                          </View>
                        ))}
                      </View>
                      {f.note ? <Text style={cp.fbNote}>{f.note}</Text> : null}
                    </View>
                  );
                })}
              </>
            )}
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={cp.closeBtn}>
            <Text style={cp.closeBtnT}>{fr ? "Fermer" : "Close"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function OwnerBookingsScreen() {
  const { lang } = useAppLang();
  const { auth } = useAuth();
  const { C, s, isDark } = useOwnerBookingsStyles();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState("all");
  const [listScope, setListScope] = useState("active");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [rated, setRated] = useState({});
  const [profileBooking, setProfileBooking] = useState(null);
  const [pdfForId, setPdfForId] = useState(null);

  const applyBookingsPayload = (data, p) => {
    setBookings(Array.isArray(data?.bookings) ? data.bookings : []);
    setStats(data?.stats || DEFAULT_STATS);
    setTotalPages(data?.pages ?? 0);
    setPage(data?.page ?? p);
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getOwnerBookings(buildOwnerBookingParams(1, PAGE_SIZE, filter, listScope))
      .then(({ data }) => {
        if (!alive) return;
        applyBookingsPayload(data, 1);
      })
      .catch(() => {
        if (!alive) return;
        Alert.alert("Error", fr ? "Échec chargement" : "Failed to load");
        setBookings([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => { alive = false; };
  }, [filter, fr, listScope]);

  const loadPage = (p) => {
    setLoading(true);
    getOwnerBookings(buildOwnerBookingParams(p, PAGE_SIZE, filter, listScope))
      .then(({ data }) => applyBookingsPayload(data, p))
      .catch(() => Alert.alert("Error", fr ? "Échec chargement" : "Failed to load"))
      .finally(() => setLoading(false));
  };

  const onRefresh = () => {
    setRefreshing(true);
    getOwnerBookings(buildOwnerBookingParams(page, PAGE_SIZE, filter, listScope))
      .then(({ data }) => applyBookingsPayload(data, page))
      .catch(() => {})
      .finally(() => setRefreshing(false));
  };

  const archivePress = (item, isRestore) => {
    Alert.alert(
      isRestore ? (fr ? "Restaurer ?" : "Restore?") : (fr ? "Archiver ?" : "Archive?"),
      isRestore
        ? (fr ? "La réservation réapparaîtra dans l'onglet actif." : "This booking will show again under active bookings.")
        : (fr ? "Masque cette réservation terminée de la liste principale." : "Hides this finished booking from your main list."),
      [
        { text: fr ? "Annuler" : "Cancel" },
        {
          text: "OK",
          onPress: async () => {
            try {
              const { data } = await setOwnerBookingArchive(item._id, { archived: !isRestore });
              mergeBooking(data);
              loadPage(page);
            } catch (e) {
              Alert.alert("Error", e?.response?.data?.message || (fr ? "Échec" : "Failed"));
            }
          },
        },
      ],
    );
  };

  const changeStatus = (id, status) => {
    const labels = {
      confirmed: fr ? "Confirmer cette réservation ?" : "Confirm this booking?",
      rejected: fr ? "Refuser cette demande ?" : "Reject this request?",
      completed: fr ? "Marquer comme terminée ?" : "Mark as completed?",
    };
    Alert.alert(labels[status] || "", "", [
      { text: fr ? "Non" : "No" },
      {
        text: fr ? "Oui" : "Yes",
        onPress: async () => {
          try {
            await updateBookingStatus(id, status);
            loadPage(page);
          } catch (e) {
            Alert.alert("Error", e?.response?.data?.message || (fr ? "Échec" : "Update failed"));
          }
        },
      },
    ]);
  };

  const handlePaid = (id) => {
    Alert.alert(fr ? "Paiement" : "Payment", fr ? "Basculer le statut payé ?" : "Toggle paid status?", [
      { text: fr ? "Annuler" : "Cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            const { data } = await markBookingPaid(id);
            setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, isPaid: data.isPaid, paidAt: data.paidAt } : b)));
          } catch {
            Alert.alert("Error", fr ? "Échec" : "Failed");
          }
        },
      },
    ]);
  };

  const mergeBooking = (updated) => {
    setBookings((prev) => prev.map((b) => (b._id === updated._id ? { ...b, ...updated } : b)));
  };

  const exportPdf = async (b) => {
    setPdfForId(b._id);
    try {
      await shareBookingPdf(b, { fr });
    } catch (e) {
      Alert.alert(
        fr ? "PDF" : "PDF",
        e?.message || (fr ? "Impossible de créer le PDF." : "Could not create the PDF."),
      );
    } finally {
      setPdfForId(null);
    }
  };

  const filterCount = (key) => {
    if (key === "all") return stats.total;
    return stats[key] ?? 0;
  };

  const listHeader = useCallback(
    () => (
      <View>
        <View style={[s.listHead, { paddingTop: insets.top + 10 }]}>
          <View style={s.listHeadAccent} />
          <Text style={s.listHeadTitle}>{fr ? "Réservations" : "Bookings"}</Text>
          <Text style={s.listHeadSub}>
            {fr ? "Chiffres clés et filtres — même défilement que vos cartes." : "Key stats and filters — one continuous scroll with your cards."}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.statsScroll} nestedScrollEnabled>
            {[
              ["total", fr ? "Total" : "Total", stats.total],
              ["pending", fr ? "Attente" : "Pending", stats.pending],
              ["confirmed", fr ? "Confirm." : "Live", stats.confirmed],
              ["completed", fr ? "Terminé" : "Done", stats.completed],
              ["revenue", fr ? "MAD" : "MAD", stats.revenue?.toLocaleString?.(fr ? "fr-FR" : "en-US") ?? stats.revenue],
            ].map(([k, label, val]) => (
              <View key={k} style={s.statPill}>
                <Text style={s.statPillVal}>{val}</Text>
                <Text style={s.statPillLbl}>{label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={s.scopeRow}>
          <TouchableOpacity
            onPress={() => {
              setListScope("active");
              setPage(1);
              setExpanded(null);
            }}
            activeOpacity={0.85}
            style={[s.scopeChip, listScope === "active" && s.scopeChipOn]}
          >
            <Text style={[s.scopeChipText, listScope === "active" && s.scopeChipTextOn]}>
              {fr ? "Actives" : "Active"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setListScope("archived");
              setPage(1);
              setExpanded(null);
            }}
            activeOpacity={0.85}
            style={[s.scopeChip, listScope === "archived" && s.scopeChipOn]}
          >
            <Text style={[s.scopeChipText, listScope === "archived" && s.scopeChipTextOn]}>
              {fr ? "Archives" : "Archive"}
            </Text>
          </TouchableOpacity>
        </View>
        {listScope === "active" ? (
          <View style={s.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll} nestedScrollEnabled>
              {FILTERS.map((item) => (
                <TouchableOpacity
                  key={item}
                  onPress={() => {
                    setFilter(item);
                    setExpanded(null);
                  }}
                  activeOpacity={0.85}
                  style={[s.filterChip, filter === item && s.filterChipActive]}
                >
                  <Text style={[s.filterChipText, filter === item && s.filterChipTextActive]}>
                    {filterChipLabel(item, fr)} · {filterCount(item)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : (
          <Text style={[s.listHeadSub, { marginTop: 10, marginBottom: 4 }]}>
            {fr
              ? "Réservations terminées que vous avez archivées."
              : "Completed bookings you moved out of your main list."}
          </Text>
        )}
      </View>
    ),
    [s, insets.top, fr, stats, filter, listScope]
  );

  if (loading && bookings.length === 0) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={{ color: C.muted, marginTop: 14, fontSize: 13 }}>
          {fr ? "Chargement des réservations…" : "Loading bookings…"}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        data={bookings}
        keyExtractor={(i) => i._id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 28,
                backgroundColor: isDark ? "rgba(124,107,255,0.12)" : "rgba(99,102,241,0.1)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="calendar-outline" size={40} color={C.primary} />
            </View>
            <Text style={s.emptyTitle}>{fr ? "Aucune réservation" : "No bookings here"}</Text>
            <Text style={s.emptySub}>
              {listScope === "archived"
                ? fr
                  ? "Aucune réservation archivée pour le moment."
                  : "No archived bookings yet. Archive a completed rental from the Active tab."
                : fr
                  ? "Changez de filtre ou attendez de nouvelles demandes."
                  : "Try another filter or check back for new requests."}
            </Text>
          </View>
        }
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={s.pages}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <TouchableOpacity key={p} onPress={() => loadPage(p)} style={[s.pageBtn, page === p && s.pageBtnOn]}>
                  <Text style={[s.pageBtnT, page === p && s.pageBtnTOn]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const st = STATUS[item.status] || STATUS.pending;
          const start = new Date(item.startDate).toLocaleDateString();
          const end = new Date(item.endDate).toLocaleDateString();
          const open = expanded === item._id;
          const carImg = resolveMediaUrl(item.rentalId?.images?.[0]);
          return (
            <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: st.text }]}>
              <View style={s.cardPad}>
              <TouchableOpacity onPress={() => setExpanded(open ? null : item._id)} activeOpacity={0.9}>
                <View style={s.cardTop}>
                  {carImg ? (
                    <Image source={{ uri: carImg }} style={s.thumb} />
                  ) : (
                    <View style={[s.thumb, s.thumbPh]}>
                      <Ionicons name="car-sport-outline" size={26} color={C.muted} />
                    </View>
                  )}
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={s.rentalTitle} numberOfLines={2}>
                      {item.rentalId?.title || `${item.rentalId?.brand || ""} ${item.rentalId?.model || ""}`.trim() || "—"}
                    </Text>
                    <Text style={s.sub}>{item.rentalId?.city || ""}</Text>
                  </View>
                  <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name={open ? "chevron-up" : "chevron-down"} size={22} color={C.muted} />
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.customerRow, { backgroundColor: C.inputBg, borderRadius: 14, padding: 12, marginBottom: 12 }]}
                onPress={() => setProfileBooking(item)}
                activeOpacity={0.85}
              >
                <View style={s.customerAvatar}>
                  <Text style={s.customerAvatarText}>{item.customerId?.name?.[0]?.toUpperCase() || "?"}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.customerName}>{item.customerId?.name || "Customer"}</Text>
                  {(item.customerId?.phone || item.customerId?.email) && (
                    <Text style={s.customerContact} numberOfLines={1}>
                      {[item.customerId?.phone, item.customerId?.email].filter(Boolean).join(" · ")}
                    </Text>
                  )}
                  <Text style={s.profileLink}>
                    {fr ? "Profil, permis, CIN & avis →" : "Profile, ID & owner reviews →"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={C.primary} />
              </TouchableOpacity>

              <View style={[s.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
                <Ionicons name={st.icon} size={14} color={st.text} />
                <Text style={[s.badgeText, { color: st.text }]}>{item.status}</Text>
              </View>

              <View style={s.datesRow}>
                <View style={s.dateBox}>
                  <Text style={s.dateLabel}>{fr ? "Début" : "Start"}</Text>
                  <Text style={s.dateVal}>{start}</Text>
                </View>
                <View style={s.dateBox}>
                  <Text style={s.dateLabel}>{fr ? "Fin" : "End"}</Text>
                  <Text style={s.dateVal}>{end}</Text>
                </View>
                <View style={s.dateBox}>
                  <Text style={s.dateLabel}>Total</Text>
                  <Text style={[s.dateVal, { color: C.primary }]}>{Number(item.totalAmount || 0).toLocaleString()} MAD</Text>
                </View>
              </View>

              {item.appliedOfferTitle ? (
                <Text style={s.offer}>🏷 {item.appliedOfferTitle}</Text>
              ) : null}

              {item.isPaid && (
                <View style={s.paidRow}>
                  <Ionicons name="checkmark-circle" size={14} color={C.green} />
                  <Text style={s.paidText}>{fr ? "Payé" : "Paid"}</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => exportPdf(item)}
                disabled={pdfForId === item._id}
                style={[s.pdfRow, pdfForId === item._id && { opacity: 0.7 }]}
                activeOpacity={0.85}
              >
                <Ionicons name="document-text-outline" size={20} color={C.primary} />
                <Text style={s.pdfRowText}>
                  {fr ? "Télécharger ou partager le PDF" : "Download or share PDF receipt"}
                </Text>
                {pdfForId === item._id ? (
                  <ActivityIndicator size="small" color={C.primary} />
                ) : (
                  <Ionicons name="share-outline" size={18} color={C.muted} />
                )}
              </TouchableOpacity>

              <View style={s.actionsRow}>
                {item.status === "pending" && (
                  <>
                    <ActionBtn label={fr ? "Confirmer" : "Confirm"} variant="green" onPress={() => changeStatus(item._id, "confirmed")} />
                    <ActionBtn label={fr ? "Refuser" : "Reject"} variant="red" onPress={() => changeStatus(item._id, "rejected")} />
                  </>
                )}
                {item.status === "confirmed" && (
                  <>
                    <ActionBtn label={fr ? "Terminer" : "Complete"} variant="blue" onPress={() => changeStatus(item._id, "completed")} />
                    <ActionBtn label={item.isPaid ? (fr ? "Paiement" : "Payment") : fr ? "Marquer payé" : "Mark paid"} variant="violet" onPress={() => handlePaid(item._id)} />
                  </>
                )}
                {item.status === "completed" && (
                  <>
                    {listScope === "active" &&
                      (rated[item._id] ? (
                        <Text style={s.rated}>{fr ? "Avis envoyé" : "Review submitted"}</Text>
                      ) : (
                        <ActionBtn label={fr ? "Noter le client" : "Rate customer"} variant="violet" onPress={() => setFeedbackBooking(item)} />
                      ))}
                    <ActionBtn
                      label={listScope === "archived" ? (fr ? "Désarchiver" : "Restore") : fr ? "Archiver" : "Archive"}
                      variant="blue"
                      onPress={() => archivePress(item, listScope === "archived")}
                    />
                  </>
                )}
              </View>

              {open && (
                <BookingMediaPanel key={item._id} booking={item} fr={fr} onUpdated={mergeBooking} />
              )}
              </View>
            </View>
          );
        }}
      />

      <CustomerProfileModal
        visible={!!profileBooking}
        booking={profileBooking}
        fr={fr}
        ownerId={auth?._id}
        onClose={() => setProfileBooking(null)}
      />

      <FeedbackModal
        visible={!!feedbackBooking}
        booking={feedbackBooking}
        fr={fr}
        onClose={() => setFeedbackBooking(null)}
        onSaved={() => {
          if (feedbackBooking) setRated((r) => ({ ...r, [feedbackBooking._id]: true }));
        }}
      />
    </View>
  );
}
