import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  StyleSheet,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { updateDriverLicense, updateNationalId } from "../api/user";
import { uploadListingImages } from "../api/upload";
import { resolveMediaUrl } from "../utils/mediaUrl";
import { userHasCinOnFile, userHasLicenseOnFile } from "../utils/profileDocuments";
import { useAppLang } from "../context/AppLangContext";

export default function ProfileDocumentsSection({
  profile,
  onProfileChange,
  C,
  isDark,
  showLicense = true,
  showCin = true,
  expandLicense = false,
  expandCin = false,
}) {
  const { pick } = useAppLang();
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#64748b";
  const ctaGrad = isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"];

  const [licForm, setLicForm] = useState({ number: "", expiryDate: "", imageUrl: "" });
  const [cinForm, setCinForm] = useState({ number: "", imageUrl: "" });
  const [licenseExpanded, setLicenseExpanded] = useState(expandLicense);
  const [cinExpanded, setCinExpanded] = useState(expandCin);
  const [licSaving, setLicSaving] = useState(false);
  const [cinSaving, setCinSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const dl = profile.driverLicense;
    setLicForm({
      number: dl?.number || "",
      expiryDate: dl?.expiryDate ? String(dl.expiryDate).slice(0, 10) : "",
      imageUrl: dl?.imageUrl || "",
    });
    const ni = profile.nationalId;
    setCinForm({
      number: ni?.number || "",
      imageUrl: ni?.imageUrl || "",
    });
  }, [profile]);

  const chooseDocImage = async (applyUrl) => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.85,
    });
    if (r.canceled) return;
    try {
      const asset = r.assets[0];
      const [url] = await uploadListingImages([
        { uri: asset.uri, name: "doc.jpg", type: asset.mimeType || "image/jpeg" },
      ]);
      applyUrl(url);
    } catch (e) {
      Alert.alert(
        pick("Failed", "Échec", "فشل"),
        e?.response?.data?.message || pick("Upload failed", "Envoi impossible", "تعذّر الرفع")
      );
    }
  };

  const saveLicenseDoc = async () => {
    if (!licForm.number?.trim() || !licForm.imageUrl) {
      Alert.alert(
        pick("License incomplete", "Permis incomplet", "رخصة غير مكتملة"),
        pick("Number and photo required.", "Numéro et photo requis.", "الرقم والصورة مطلوبان.")
      );
      return;
    }
    setLicSaving(true);
    try {
      const { data } = await updateDriverLicense({
        number: licForm.number.trim(),
        expiryDate: licForm.expiryDate || null,
        imageUrl: licForm.imageUrl,
      });
      onProfileChange?.(data);
      Alert.alert(
        pick("Saved", "Enregistré", "تم الحفظ"),
        pick("License saved.", "Permis enregistré.", "تم حفظ الرخصة.")
      );
    } catch (e) {
      Alert.alert(
        pick("Error", "Erreur", "خطأ"),
        e?.response?.data?.message || pick("Failed", "Échec", "فشل")
      );
    }
    setLicSaving(false);
  };

  const saveCinDoc = async () => {
    if (!cinForm.number?.trim() || !cinForm.imageUrl) {
      Alert.alert(
        pick("ID incomplete", "CIN incomplet", "البطاقة غير مكتملة"),
        pick("Number and photo required.", "Numéro et photo requis.", "الرقم والصورة مطلوبان.")
      );
      return;
    }
    setCinSaving(true);
    try {
      const { data } = await updateNationalId({
        number: cinForm.number.trim(),
        imageUrl: cinForm.imageUrl,
      });
      onProfileChange?.(data);
      Alert.alert(
        pick("Saved", "Enregistré", "تم الحفظ"),
        pick("National ID saved.", "CIN enregistré.", "تم حفظ البطاقة الوطنية.")
      );
    } catch (e) {
      Alert.alert(
        pick("Error", "Erreur", "خطأ"),
        e?.response?.data?.message || pick("Failed", "Échec", "فشل")
      );
    }
    setCinSaving(false);
  };

  if (!profile) return null;

  return (
    <View>
      {showLicense && (
        <View style={[styles.card, { borderColor: C.border, backgroundColor: C.card }]}>
          <Pressable onPress={() => setLicenseExpanded((v) => !v)} style={styles.cardHead}>
            <View style={[styles.iconWrap, { backgroundColor: "rgba(56,189,248,0.15)" }]}>
              <Ionicons name="card-outline" size={22} color={C.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: titleColor }]}>
                {pick("Driving license", "Permis de conduire", "رخصة القيادة")}
              </Text>
              <Text style={[styles.cardSub, { color: subColor }]}>
                {userHasLicenseOnFile(profile)
                  ? pick("On file — tap to edit", "Ajouté — touchez pour modifier", "مسجّلة — اضغط للتعديل")
                  : pick("Required to rent", "Requis pour louer", "مطلوبة للتأجير")}
              </Text>
            </View>
            <Ionicons name={licenseExpanded ? "chevron-up" : "chevron-down"} size={22} color={C.muted} />
          </Pressable>
          {licenseExpanded && (
            <View style={styles.cardBody}>
              <Text style={[styles.label, { color: C.label }]}>{pick("Number", "Numéro", "الرقم")}</Text>
              <TextInput
                value={licForm.number}
                onChangeText={(v) => setLicForm((p) => ({ ...p, number: v }))}
                style={[styles.input, { color: titleColor, borderColor: C.border, backgroundColor: C.inputBg }]}
                placeholder={pick("e.g. B-123456", "ex. B-123456", "مثال: B-123456")}
                placeholderTextColor={C.muted}
              />
              <Text style={[styles.label, { color: C.label, marginTop: 10 }]}>
                {pick("Expiry (optional)", "Expiration (optionnel)", "تاريخ الانتهاء (اختياري)")}
              </Text>
              <TextInput
                value={licForm.expiryDate}
                onChangeText={(v) => setLicForm((p) => ({ ...p, expiryDate: v }))}
                style={[styles.input, { color: titleColor, borderColor: C.border, backgroundColor: C.inputBg }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={C.muted}
              />
              <Text style={[styles.label, { color: C.label, marginTop: 10 }]}>
                {pick("License photo", "Photo du permis", "صورة الرخصة")}
              </Text>
              <TouchableOpacity
                onPress={() => chooseDocImage((url) => setLicForm((p) => ({ ...p, imageUrl: url })))}
                style={[styles.photoPick, { borderColor: C.border, backgroundColor: C.surface }]}
              >
                {licForm.imageUrl ? (
                  <Image source={{ uri: resolveMediaUrl(licForm.imageUrl) }} style={styles.photo} />
                ) : (
                  <Text style={{ color: subColor }}>{pick("Choose photo", "Choisir une photo", "اختر صورة")}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={saveLicenseDoc} disabled={licSaving} activeOpacity={0.9}>
                <LinearGradient colors={ctaGrad} style={[styles.saveBtn, licSaving && { opacity: 0.65 }]}>
                  <Text style={styles.saveBtnText}>
                    {licSaving ? "…" : pick("Save license", "Enregistrer le permis", "حفظ الرخصة")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {showCin && (
        <View style={[styles.card, { borderColor: C.border, backgroundColor: C.card, marginTop: showLicense ? 12 : 0 }]}>
          <Pressable onPress={() => setCinExpanded((v) => !v)} style={styles.cardHead}>
            <View style={[styles.iconWrap, { backgroundColor: "rgba(167,139,250,0.15)" }]}>
              <Ionicons name="id-card-outline" size={22} color="#a78bfa" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: titleColor }]}>
                {pick("National ID (CIN)", "Carte nationale (CIN)", "البطاقة الوطنية (CIN)")}
              </Text>
              <Text style={[styles.cardSub, { color: subColor }]}>
                {userHasCinOnFile(profile)
                  ? profile?.nationalId?.verified
                    ? pick("Verified", "Vérifié", "موثّقة")
                    : pick("Pending admin review", "En attente de validation", "قيد المراجعة")
                  : pick("Required to rent or sell", "Requis pour louer ou vendre", "مطلوبة للتأجير أو البيع")}
              </Text>
            </View>
            <Ionicons name={cinExpanded ? "chevron-up" : "chevron-down"} size={22} color={C.muted} />
          </Pressable>
          {cinExpanded && (
            <View style={styles.cardBody}>
              <Text style={[styles.label, { color: C.label }]}>{pick("ID number", "Numéro CIN", "رقم البطاقة")}</Text>
              <TextInput
                value={cinForm.number}
                onChangeText={(v) => setCinForm((p) => ({ ...p, number: v }))}
                style={[styles.input, { color: titleColor, borderColor: C.border, backgroundColor: C.inputBg }]}
                placeholder={pick("e.g. AB123456", "ex. AB123456", "مثال: AB123456")}
                placeholderTextColor={C.muted}
                autoCapitalize="characters"
              />
              <Text style={[styles.label, { color: C.label, marginTop: 10 }]}>
                {pick("ID photo", "Photo CIN", "صورة البطاقة")}
              </Text>
              <TouchableOpacity
                onPress={() => chooseDocImage((url) => setCinForm((p) => ({ ...p, imageUrl: url })))}
                style={[styles.photoPick, { borderColor: C.border, backgroundColor: C.surface }]}
              >
                {cinForm.imageUrl ? (
                  <Image source={{ uri: resolveMediaUrl(cinForm.imageUrl) }} style={styles.photo} />
                ) : (
                  <Text style={{ color: subColor }}>{pick("Choose photo", "Choisir une photo", "اختر صورة")}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCinDoc} disabled={cinSaving} activeOpacity={0.9}>
                <LinearGradient colors={ctaGrad} style={[styles.saveBtn, cinSaving && { opacity: 0.65 }]}>
                  <Text style={styles.saveBtnText}>
                    {cinSaving ? "…" : pick("Save national ID", "Enregistrer le CIN", "حفظ البطاقة")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 4 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(128,128,128,0.2)",
  },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontWeight: "800", fontSize: 16 },
  cardSub: { fontSize: 12, marginTop: 4, fontWeight: "600" },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },
  photoPick: { borderRadius: 12, borderWidth: 1, borderStyle: "dashed", minHeight: 120, alignItems: "center", justifyContent: "center" },
  photo: { width: "100%", height: 140, borderRadius: 10 },
  saveBtn: { marginTop: 14, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
