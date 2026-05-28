import { useState, useMemo } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  Alert, StyleSheet, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";
import { uploadListingImages } from "../src/api/upload";
import { updateBookingMedia } from "../src/api/booking";

const CHECKPOINTS_FR = [
  { id: "front",    icon: "car-outline",           label: "Avant" },
  { id: "rear",     icon: "car-outline",           label: "Arrière" },
  { id: "left",     icon: "reorder-three-outline", label: "Côté gauche" },
  { id: "right",    icon: "reorder-three-outline", label: "Côté droit" },
  { id: "interior", icon: "person-outline",        label: "Intérieur avant" },
  { id: "rear_in",  icon: "person-outline",        label: "Intérieur arrière" },
  { id: "dash",     icon: "speedometer-outline",   label: "Tableau de bord / km" },
  { id: "trunk",    icon: "cube-outline",          label: "Coffre" },
  { id: "tires",    icon: "radio-button-off-outline", label: "Pneus" },
];
const CHECKPOINTS_EN = [
  { id: "front",    icon: "car-outline",           label: "Front" },
  { id: "rear",     icon: "car-outline",           label: "Rear" },
  { id: "left",     icon: "reorder-three-outline", label: "Left side" },
  { id: "right",    icon: "reorder-three-outline", label: "Right side" },
  { id: "interior", icon: "person-outline",        label: "Interior front" },
  { id: "rear_in",  icon: "person-outline",        label: "Interior rear" },
  { id: "dash",     icon: "speedometer-outline",   label: "Dashboard / mileage" },
  { id: "trunk",    icon: "cube-outline",          label: "Trunk" },
  { id: "tires",    icon: "radio-button-off-outline", label: "Tires" },
];

export default function ConditionChecklistScreen() {
  const { bookingId, phase = "before", existingBefore, existingAfter } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: C, isDark } = useTheme();
  const { lang, pick } = useAppLang();
  const fr = lang === "fr";
  const CHECKPOINTS = fr ? CHECKPOINTS_FR : CHECKPOINTS_EN;

  const [photos, setPhotos] = useState(() => {
    const initial = {};
    CHECKPOINTS.forEach((cp) => { initial[cp.id] = []; });
    return initial;
  });
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const s = useMemo(() => createStyles(C, isDark), [C, isDark]);
  const current = CHECKPOINTS[step];
  const isLast = step === CHECKPOINTS.length - 1;

  const pickPhoto = async (fromCamera = false) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(pick("Permission required", "Permission requise"), pick("Camera/gallery access is required.", "Accès caméra/galerie requis."));
      return;
    }
    const r = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsMultipleSelection: true, quality: 0.85 });
    if (r.canceled || !r.assets?.length) return;
    try {
      const files = r.assets.map((a) => ({ uri: a.uri, name: "photo.jpg", type: a.mimeType || "image/jpeg" }));
      const urls = await uploadListingImages(files);
      setPhotos((prev) => ({ ...prev, [current.id]: [...(prev[current.id] || []), ...urls] }));
    } catch {
      Alert.alert("Error", pick("Upload failed.", "Échec de l'envoi."));
    }
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => ({ ...prev, [current.id]: prev[current.id].filter((_, i) => i !== idx) }));
  };

  const allPhotos = useMemo(() => Object.values(photos).flat(), [photos]);

  const save = async () => {
    if (!bookingId) { router.back(); return; }
    setSaving(true);
    try {
      let before = existingBefore ? JSON.parse(existingBefore) : [];
      let after = existingAfter ? JSON.parse(existingAfter) : [];
      if (phase === "before") before = [...before, ...allPhotos];
      else after = [...after, ...allPhotos];
      await updateBookingMedia(bookingId, { conditionPhotos: { before, after } });
      Alert.alert(
        pick("Saved", "Enregistré"),
        pick("Condition photos saved.", "Photos de condition enregistrées."),
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || (pick("Failed.", "Échec.")));
    } finally {
      setSaving(false);
    }
  };

  const doneCount = CHECKPOINTS.filter((cp) => (photos[cp.id] || []).length > 0).length;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={C.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 14 }}>
          <Text style={s.headerTitle}>
            {fr ? (phase === "before" ? "Checklist départ" : "Checklist retour") : (phase === "before" ? "Pre-rental checklist" : "Post-rental checklist")}
          </Text>
          <Text style={s.headerSub}>
            {doneCount}/{CHECKPOINTS.length} {pick("completed", "complétés")}
          </Text>
        </View>
        <TouchableOpacity onPress={save} disabled={saving} style={s.saveBtn} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnTxt}>{pick("Save", "Enreg.")}</Text>}
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${((step + 1) / CHECKPOINTS.length) * 100}%` }]} />
      </View>

      {/* Step tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.stepsRow}>
        {CHECKPOINTS.map((cp, i) => {
          const done = (photos[cp.id] || []).length > 0;
          const active = i === step;
          return (
            <TouchableOpacity key={cp.id} onPress={() => setStep(i)} activeOpacity={0.8} style={[s.stepPill, active && s.stepPillActive, done && !active && s.stepPillDone]}>
              <Ionicons name={done ? "checkmark-circle" : cp.icon} size={14} color={active ? "#fff" : done ? "#22c55e" : C.muted} />
              <Text style={[s.stepLabel, active && { color: "#fff" }, done && !active && { color: "#22c55e" }]} numberOfLines={1}>{cp.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Current step */}
      <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 32 }]}>
        <View style={s.stepHeader}>
          <Ionicons name={current.icon} size={28} color={C.primary} />
          <Text style={s.stepTitle}>{current.label}</Text>
        </View>
        <Text style={s.stepHint}>
          {pick(`Photograph: ${current.label.toLowerCase()}. Tap a button below to add a photo.`, `Photographiez : ${current.label.toLowerCase()}. Appuyez sur un bouton ci-dessous pour ajouter une photo.`)}
        </Text>

        {/* Photo grid */}
        <View style={s.grid}>
          {(photos[current.id] || []).map((url, idx) => (
            <View key={idx} style={s.thumb}>
              <Image source={{ uri: url }} style={s.img} />
              <TouchableOpacity onPress={() => removePhoto(idx)} style={s.rmBtn}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity onPress={() => pickPhoto(true)} style={s.actionBtn} activeOpacity={0.85}>
            <Ionicons name="camera-outline" size={20} color={C.primary} />
            <Text style={s.actionTxt}>{pick("Take photo", "Prendre une photo")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickPhoto(false)} style={s.actionBtn} activeOpacity={0.85}>
            <Ionicons name="images-outline" size={20} color={C.primary} />
            <Text style={s.actionTxt}>{pick("Choose from gallery", "Choisir depuis galerie")}</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation */}
        <View style={s.navRow}>
          {step > 0 ? (
            <TouchableOpacity onPress={() => setStep((p) => p - 1)} style={s.navBtn} activeOpacity={0.85}>
              <Ionicons name="arrow-back" size={18} color={C.white} />
              <Text style={s.navTxt}>{pick("Previous", "Précédent")}</Text>
            </TouchableOpacity>
          ) : <View style={{ flex: 1 }} />}
          {isLast ? (
            <TouchableOpacity onPress={save} disabled={saving} style={[s.navBtnPrimary, saving && { opacity: 0.6 }]} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={s.navTxtPrimary}>{pick("Finish & save", "Terminer & enregistrer")}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setStep((p) => p + 1)} style={s.navBtnPrimary} activeOpacity={0.85}>
              <Text style={s.navTxtPrimary}>{pick("Next", "Suivant")}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(C, isDark) {
  return StyleSheet.create({
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
    headerTitle: { color: C.white, fontWeight: "800", fontSize: 16 },
    headerSub: { color: C.muted, fontSize: 12, marginTop: 2 },
    saveBtn: { backgroundColor: C.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
    saveBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 13 },
    progressTrack: { height: 3, backgroundColor: C.border },
    progressFill: { height: 3, backgroundColor: C.primary, borderRadius: 2 },
    stepsRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: "row", alignItems: "center" },
    stepPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
    stepPillActive: { backgroundColor: C.primary, borderColor: C.primary },
    stepPillDone: { borderColor: "#22c55e" },
    stepLabel: { color: C.muted, fontSize: 12, fontWeight: "600", maxWidth: 90 },
    body: { padding: 20 },
    stepHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
    stepTitle: { color: C.white, fontSize: 20, fontWeight: "900" },
    stepHint: { color: C.muted, fontSize: 13, lineHeight: 19, marginBottom: 20 },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
    thumb: { width: 96, height: 80, borderRadius: 12, overflow: "hidden", position: "relative" },
    img: { width: "100%", height: "100%" },
    rmBtn: { position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 10, padding: 3 },
    actions: { gap: 10, marginBottom: 28 },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: C.card },
    actionTxt: { color: C.white, fontWeight: "700", fontSize: 14 },
    navRow: { flexDirection: "row", gap: 12 },
    navBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 14, backgroundColor: C.card },
    navTxt: { color: C.white, fontWeight: "800", fontSize: 14 },
    navBtnPrimary: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, backgroundColor: C.primary },
    navTxtPrimary: { color: "#fff", fontWeight: "800", fontSize: 14 },
  });
}
