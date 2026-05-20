import { useState, useEffect, useMemo } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  Alert, StyleSheet, ActivityIndicator, TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";
import { getMyCar, patchDocuments } from "../src/api/userCar";
import { uploadListingImages } from "../src/api/upload";

const PRESETS_FR = ["Carte Grise", "Assurance", "Vignette", "Visite Technique", "Permis de Conduire", "Autre"];
const PRESETS_EN = ["Registration", "Insurance", "Tax Disc", "Technical Inspection", "Driver's License", "Other"];

export default function DocScannerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const PRESETS = fr ? PRESETS_FR : PRESETS_EN;

  const [car, setCar] = useState(null);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [labelInput, setLabelInput] = useState("");
  const [showPresets, setShowPresets] = useState(false);

  const s = useMemo(() => createStyles(C, isDark), [C, isDark]);

  useEffect(() => {
    getMyCar()
      .then((r) => {
        setCar(r.data);
        setDocs(r.data?.scannedDocuments || []);
      })
      .catch(() => Alert.alert(fr ? "Erreur" : "Error", fr ? "Impossible de charger le véhicule." : "Could not load vehicle."))
      .finally(() => setLoading(false));
  }, []);

  const pickAndUpload = async (fromCamera) => {
    const label = labelInput.trim();
    if (!label) {
      Alert.alert(fr ? "Nom requis" : "Label required", fr ? "Entrez un nom pour ce document." : "Enter a label for this document.");
      return;
    }
    if (!car?._id) {
      Alert.alert(fr ? "Aucun véhicule" : "No vehicle", fr ? "Enregistrez d'abord un véhicule dans Mon Garage." : "Register a vehicle in My Garage first.");
      return;
    }

    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(fr ? "Permission requise" : "Permission required");
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.88 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.88 });
    if (result.canceled || !result.assets?.[0]) return;

    setUploading(true);
    try {
      const urls = await uploadListingImages([{
        uri: result.assets[0].uri,
        name: "doc.jpg",
        type: result.assets[0].mimeType || "image/jpeg",
      }]);
      const url = urls[0];
      if (url) {
        setDocs((prev) => [...prev, { label, url, fileType: "image", uploadedAt: new Date().toISOString() }]);
        setLabelInput("");
        setShowPresets(false);
      }
    } catch {
      Alert.alert("Error", fr ? "Échec de l'envoi." : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const removeDoc = (idx) => {
    Alert.alert(
      fr ? "Supprimer ?" : "Delete?",
      fr ? "Supprimer ce document ?" : "Remove this document?",
      [
        { text: fr ? "Non" : "No", style: "cancel" },
        { text: fr ? "Oui" : "Yes", style: "destructive", onPress: () => setDocs((p) => p.filter((_, i) => i !== idx)) },
      ]
    );
  };

  const save = async () => {
    if (!car?._id) return;
    setSaving(true);
    try {
      await patchDocuments(car._id, docs);
      Alert.alert(fr ? "Enregistré" : "Saved", fr ? "Documents mis à jour." : "Documents updated.", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || (fr ? "Échec." : "Failed."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={C.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 14 }}>
          <Text style={s.headerTitle}>{fr ? "Scanner de documents" : "Document Scanner"}</Text>
          <Text style={s.headerSub}>{car ? `${car.brand} ${car.model} ${car.year || ""}`.trim() : (fr ? "Aucun véhicule" : "No vehicle")}</Text>
        </View>
        <TouchableOpacity onPress={save} disabled={saving || !car} style={s.saveBtn} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnTxt}>{fr ? "Sauv." : "Save"}</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 32 }]}>
        {/* Intro */}
        <View style={s.infoBox}>
          <Ionicons name="document-text-outline" size={20} color={C.primary} />
          <Text style={s.infoTxt}>
            {fr
              ? "Scannez vos documents importants : carte grise, assurance, vignette… Ils seront attachés à votre véhicule."
              : "Scan your important documents: registration, insurance, tax disc… They'll be attached to your vehicle."}
          </Text>
        </View>

        {/* Label input */}
        <Text style={s.label}>{fr ? "Nom du document" : "Document label"}</Text>
        <TouchableOpacity onPress={() => setShowPresets((v) => !v)} style={s.presetToggle} activeOpacity={0.8}>
          <Text style={s.presetToggleTxt}>{fr ? "Choisir un type" : "Choose a type"}</Text>
          <Ionicons name={showPresets ? "chevron-up" : "chevron-down"} size={16} color={C.muted} />
        </TouchableOpacity>
        {showPresets && (
          <View style={s.presetsWrap}>
            {PRESETS.map((p) => (
              <TouchableOpacity key={p} onPress={() => { setLabelInput(p); setShowPresets(false); }} style={s.presetChip} activeOpacity={0.8}>
                <Text style={s.presetChipTxt}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TextInput
          value={labelInput}
          onChangeText={setLabelInput}
          placeholder={fr ? "ex. Carte Grise" : "e.g. Registration"}
          placeholderTextColor={C.muted}
          style={s.input}
        />

        {/* Upload buttons */}
        <View style={s.actionsRow}>
          <TouchableOpacity onPress={() => pickAndUpload(true)} disabled={uploading} style={s.actionBtn} activeOpacity={0.85}>
            {uploading
              ? <ActivityIndicator color={C.primary} size="small" />
              : <Ionicons name="camera-outline" size={22} color={C.primary} />}
            <Text style={s.actionTxt}>{fr ? "Prendre une photo" : "Take photo"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => pickAndUpload(false)} disabled={uploading} style={s.actionBtn} activeOpacity={0.85}>
            <Ionicons name="images-outline" size={22} color={C.primary} />
            <Text style={s.actionTxt}>{fr ? "Depuis la galerie" : "From gallery"}</Text>
          </TouchableOpacity>
        </View>

        {/* Document list */}
        <Text style={[s.label, { marginTop: 20 }]}>{fr ? "Documents enregistrés" : "Saved documents"} ({docs.length})</Text>
        {docs.length === 0 ? (
          <Text style={s.emptyTxt}>{fr ? "Aucun document ajouté." : "No documents added yet."}</Text>
        ) : (
          docs.map((doc, idx) => (
            <View key={idx} style={s.docCard}>
              {doc.url ? (
                <Image source={{ uri: doc.url }} style={s.docThumb} resizeMode="cover" />
              ) : (
                <View style={[s.docThumb, s.docThumbPh]}>
                  <Ionicons name="document-outline" size={24} color={C.muted} />
                </View>
              )}
              <View style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
                <Text style={s.docLabel} numberOfLines={1}>{doc.label}</Text>
                <Text style={s.docDate}>
                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString(fr ? "fr-FR" : "en-GB") : ""}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeDoc(idx)} hitSlop={10}>
                <Ionicons name="trash-outline" size={20} color="#f87171" />
              </TouchableOpacity>
            </View>
          ))
        )}
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
    body: { padding: 20 },
    infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: isDark ? "rgba(124,107,255,0.1)" : "rgba(99,102,241,0.08)", borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: isDark ? "rgba(124,107,255,0.3)" : "rgba(99,102,241,0.2)" },
    infoTxt: { flex: 1, color: C.muted, fontSize: 13, lineHeight: 19 },
    label: { color: C.muted, fontSize: 12, fontWeight: "800", marginBottom: 8, letterSpacing: 0.3 },
    presetToggle: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8, backgroundColor: C.surface },
    presetToggleTxt: { color: C.primary, fontWeight: "700", fontSize: 13 },
    presetsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
    presetChip: { backgroundColor: isDark ? "rgba(124,107,255,0.12)" : "rgba(99,102,241,0.1)", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
    presetChipTxt: { color: C.primary, fontWeight: "600", fontSize: 13 },
    input: { borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: C.white, fontSize: 14, backgroundColor: C.inputBg, marginBottom: 16 },
    actionsRow: { flexDirection: "row", gap: 10 },
    actionBtn: { flex: 1, flexDirection: "column", alignItems: "center", gap: 6, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 16, backgroundColor: C.card },
    actionTxt: { color: C.white, fontWeight: "700", fontSize: 12, textAlign: "center" },
    emptyTxt: { color: C.muted, fontSize: 13, textAlign: "center", marginVertical: 16 },
    docCard: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.border },
    docThumb: { width: 56, height: 48, borderRadius: 10, backgroundColor: C.surface },
    docThumbPh: { alignItems: "center", justifyContent: "center" },
    docLabel: { color: C.white, fontWeight: "700", fontSize: 14 },
    docDate: { color: C.muted, fontSize: 11, marginTop: 3 },
  });
}
