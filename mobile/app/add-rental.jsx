import { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { createRental } from "../src/api/rental";
import { uploadListingImages } from "../src/api/upload";
import { useAppLang } from "../src/context/AppLangContext";
import { useTheme } from "../src/context/ThemeContext";
import { useAuth } from "../src/context/AuthContext";
import { hasUserRole } from "../src/utils/userRoles";
import { getMyProfile } from "../src/api/user";

function userHasCinOnFile(profile) {
  const nid = profile?.nationalId;
  return !!(nid?.imageUrl || nid?.number);
}

const { width: W } = Dimensions.get("window");

const FIELD_GROUPS = [
  {
    key: "vehicle",
    icon: "car-sport-outline",
    accent: "#a78bfa",
    fields: [
      { key: "title", label: { en: "Title", fr: "Titre" }, ph: { en: "e.g. BMW X5 Premium", fr: "ex. BMW X5 Premium" } },
      { key: "brand", label: { en: "Brand", fr: "Marque" }, ph: { en: "BMW", fr: "BMW" } },
      { key: "model", label: { en: "Model", fr: "Modèle" }, ph: { en: "X5", fr: "X5" } },
      { key: "year", label: { en: "Year", fr: "Année" }, ph: { en: "2022", fr: "2022" }, keyboard: "numeric" },
    ],
  },
  {
    key: "rate",
    icon: "pricetag-outline",
    accent: "#38bdf8",
    fields: [
      { key: "pricePerDay", label: { en: "Price / day (MAD)", fr: "Prix / jour (MAD)" }, ph: { en: "500", fr: "500" }, keyboard: "numeric" },
      { key: "city", label: { en: "City", fr: "Ville" }, ph: { en: "Casablanca", fr: "Casablanca" }, gps: true },
    ],
  },
  {
    key: "specs",
    icon: "settings-outline",
    accent: "#34d399",
    fields: [
      { key: "fuel", label: { en: "Fuel", fr: "Carburant" }, ph: { en: "Gasoline / Diesel", fr: "Essence / Diesel" } },
      { key: "gearbox", label: { en: "Gearbox", fr: "Boîte" }, ph: { en: "Automatic", fr: "Automatique" } },
      { key: "description", label: { en: "Description", fr: "Description" }, ph: { en: "Describe the car…", fr: "Décrivez le véhicule…" }, multi: true },
    ],
  },
];

export default function AddRentalScreen() {
  const { auth } = useAuth();
  const { lang, pick } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createAddRentalStyles(C, isDark), [C, isDark]);
  const router = useRouter();
  const fr = lang === "fr";

  useEffect(() => {
    if (!auth) return;
    if (!hasUserRole(auth, "rental_owner")) {
      Alert.alert(
        pick("Rental owners only", "Réservé aux loueurs"),
        pick("Only rental owners can list cars for rent. Enable “My fleet” mode from your profile.", "Seuls les propriétaires de flotte peuvent proposer une location. Activez le mode « Ma flotte » dans votre profil."),
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }
    getMyProfile()
      .then((r) => {
        if (!userHasCinOnFile(r.data)) {
          Alert.alert(
            pick("CIN required", "CIN requis"),
            pick("You must submit your national ID (CIN) before listing a car for rent.", "Vous devez soumettre votre carte d'identité (CIN) avant de proposer une voiture à la location."),
            [
              {
                text: pick("Verify CIN", "Vérifier mon CIN"),
                onPress: () => router.replace({ pathname: "/profile-documents", params: { return: "add-rental" } }),
              },
              { text: pick("Cancel", "Annuler"), style: "cancel", onPress: () => router.back() },
            ]
          );
        }
      })
      .catch(() => {});
  }, [auth, fr, router]);

  const [form, setForm] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
    pricePerDay: "",
    fuel: "",
    gearbox: "",
    city: "",
    description: "",
    airportDeliveryOffered: false,
    airportDeliveryFeeMad: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsMultipleSelection: true,
      quality: 0.75,
      selectionLimit: 8,
    });
    if (!result.canceled) setImages((prev) => [...prev, ...result.assets].slice(0, 8));
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert("Camera permission required");
    const result = await ImagePicker.launchCameraAsync({ quality: 0.75, allowsEditing: true });
    if (!result.canceled) setImages((prev) => [...prev, result.assets[0]].slice(0, 8));
  };

  const detectLocation = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return Alert.alert("Location permission required");
      const loc = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo[0]) set("city", geo[0].city || geo[0].region || geo[0].subregion || "");
    } catch {
      Alert.alert("Could not detect location");
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title?.trim() || !form.pricePerDay || !form.brand?.trim() || !form.model?.trim()) {
      return Alert.alert(
        pick("Required fields", "Champs requis"),
        pick("Fill in title, brand, model and price per day.", "Remplissez titre, marque, modèle et prix/jour.")
      );
    }
    if (!form.city?.trim()) {
      return Alert.alert(pick("City", "Ville"), pick("City is required.", "La ville est requise."));
    }
    const yearNum = parseInt(String(form.year), 10);
    const ppd = parseFloat(String(form.pricePerDay));
    if (!Number.isFinite(yearNum) || yearNum < 1900) {
      return Alert.alert(pick("Year", "Année"), pick("Invalid year", "Année invalide"));
    }
    if (!Number.isFinite(ppd) || ppd <= 0) {
      return Alert.alert(pick("Price", "Prix"), pick("Invalid price per day", "Prix / jour invalide"));
    }
    const adOffered = !!form.airportDeliveryOffered;
    const adFee = Math.max(0, parseFloat(String(form.airportDeliveryFeeMad).replace(",", ".")) || 0);
    if (adOffered && adFee <= 0) {
      return Alert.alert(
        pick("Airport", "Aéroport"),
        pick("Enter an airport service fee greater than 0 MAD.", "Indiquez un tarif supérieur à 0 MAD pour la livraison à l'aéroport."),
      );
    }
    setLoading(true);
    try {
      let imageUrls = [];
      if (images.length) {
        const files = images.map((img, i) => ({
          uri: img.uri,
          name: `photo_${i}.jpg`,
          type: img.mimeType || "image/jpeg",
        }));
        imageUrls = await uploadListingImages(files);
      }
      const payload = {
        title: form.title.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: yearNum,
        pricePerDay: ppd,
        city: form.city.trim(),
        description: form.description?.trim() || undefined,
        fuel: form.fuel?.trim() || undefined,
        gearbox: form.gearbox?.trim() || undefined,
        images: imageUrls,
        airportDeliveryOffered: adOffered,
        airportDeliveryFeeMad: adOffered ? adFee : 0,
      };
      await createRental(payload);
      Alert.alert(pick("Success", "Succès"), pick("Rental submitted for approval.", "Location soumise pour approbation."), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to create rental";
      const code = e?.response?.data?.code;
      if (code === "CIN_REQUIRED" || String(msg).toLowerCase().includes("cin")) {
        Alert.alert(pick("CIN required", "CIN requis"), msg, [
          { text: pick("Later", "Plus tard"), style: "cancel" },
          { text: pick("Documents", "Documents"), onPress: () => router.push("/profile-documents") },
        ]);
      } else {
        Alert.alert("Error", msg);
      }
    }
    setLoading(false);
  };

  const heroColors = isDark ? ["#1e1040", "#12101c", C.surface] : ["#eef2ff", "#f8fafc", C.surface];
  const photoCardBg = isDark ? C.card : "#ffffff";

  const renderField = (f) => {
    const label = f.label[lang] || f.label.en;
    const ph = f.ph[lang] || f.ph.en;
    if (f.gps) {
      return (
        <View key={f.key} style={s.fieldWrap}>
          <Text style={s.fieldLabel}>{label}</Text>
          <View style={s.cityRow}>
            <TextInput
              value={form[f.key]}
              onChangeText={(v) => set(f.key, v)}
              placeholder={ph}
              placeholderTextColor={C.muted}
              style={s.cityInput}
            />
            <TouchableOpacity onPress={detectLocation} disabled={locating} style={s.gpsBtn}>
              {locating ? (
                <ActivityIndicator size="small" color={C.primary} />
              ) : (
                <Ionicons name="navigate" size={18} color={C.primary} />
              )}
              <Text style={s.gpsBtnText}>GPS</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View key={f.key} style={s.fieldWrap}>
        <Text style={s.fieldLabel}>{label}</Text>
        <TextInput
          value={form[f.key]}
          onChangeText={(v) => set(f.key, v)}
          placeholder={ph}
          placeholderTextColor={C.muted}
          keyboardType={f.keyboard || "default"}
          multiline={f.multi}
          numberOfLines={f.multi ? 4 : 1}
          style={[s.input, f.multi && s.inputMulti]}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      >
        <LinearGradient
          colors={heroColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: Math.max(insets.top, 8) + 4, paddingBottom: 28, paddingHorizontal: 20 }}
        >
          <View style={s.heroBadge}>
            <Ionicons name="sparkles" size={14} color={C.primary} />
            <Text style={s.heroBadgeText}>{pick("FLEET", "FLOTTE")}</Text>
          </View>
          <Text style={s.heroTitle}>{pick("New listing", "Nouvelle annonce")}</Text>
          <Text style={s.heroSub}>
            {pick("Sharp photos and clear details help renters book with confidence.", "Photos nettes, détails précis — vos clients réservent plus vite.")}
          </Text>
        </LinearGradient>

        <View style={[s.floatCard, { backgroundColor: photoCardBg, marginTop: -18 }]}>
          <View style={[s.cardAccent, { backgroundColor: "#f472b6" }]} />
          <View style={s.cardInner}>
            <View style={s.sectionHead}>
              <View style={[s.sectionIconWrap, { backgroundColor: "#f472b628" }]}>
                <Ionicons name="images-outline" size={22} color="#f472b6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionTitle}>{pick("Gallery", "Galerie")}</Text>
                <Text style={s.sectionHint}>
                  {pick("Up to 8 photos · first is the cover", "Jusqu'à 8 photos · première = couverture")}
                </Text>
              </View>
              <Text style={s.photoCount}>
                {images.length}/8
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.photosRow}>
              {images.map((img, i) => (
                <View key={i} style={s.photoWrap}>
                  <Image source={{ uri: img.uri }} style={s.photoThumb} resizeMode="cover" />
                  <TouchableOpacity onPress={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} style={s.removeBtn}>
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                  {i === 0 && (
                    <View style={s.coverTag}>
                      <Text style={s.coverTagText}>{pick("Cover", "Couverture")}</Text>
                    </View>
                  )}
                </View>
              ))}
              {images.length < 8 && (
                <>
                  <TouchableOpacity onPress={pickImages} style={s.addPhotoBtn} activeOpacity={0.85}>
                    <LinearGradient colors={[`${C.primary}33`, `${C.primary}12`]} style={s.addPhotoGrad}>
                      <Ionicons name="images-outline" size={26} color={C.primary} />
                      <Text style={s.addPhotoBtnText}>{pick("Library", "Importer")}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={takePhoto} style={s.addPhotoBtn} activeOpacity={0.85}>
                    <LinearGradient colors={["rgba(56,189,248,0.2)", "rgba(56,189,248,0.08)"]} style={s.addPhotoGrad}>
                      <Ionicons name="camera-outline" size={26} color="#38bdf8" />
                      <Text style={[s.addPhotoBtnText, { color: "#38bdf8" }]}>{pick("Camera", "Caméra")}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>

        {FIELD_GROUPS.map((group) => (
          <View key={group.key} style={[s.groupCard, { backgroundColor: photoCardBg }]}>
            <View style={[s.cardAccent, { backgroundColor: group.accent }]} />
            <View style={s.cardInner}>
              <View style={s.sectionHead}>
                <View style={[s.sectionIconWrap, { backgroundColor: group.accent + "28" }]}>
                  <Ionicons name={group.icon} size={20} color={group.accent} />
                </View>
                <View>
                  <Text style={s.sectionTitle}>
                    {group.key === "vehicle" && (pick("Vehicle", "Véhicule"))}
                    {group.key === "rate" && (pick("Rate & location", "Tarif & lieu"))}
                    {group.key === "specs" && (pick("Specs", "Équipement"))}
                  </Text>
                  <Text style={s.sectionHint}>
                    {group.key === "vehicle" && (pick("Model identity", "Identité du modèle"))}
                    {group.key === "rate" && (pick("Daily price and city", "Prix journalier et ville"))}
                    {group.key === "specs" && (pick("Engine, gearbox, story", "Moteur, boîte, description"))}
                  </Text>
                </View>
              </View>
              {group.fields.map((f) => renderField(f))}
            </View>
          </View>
        ))}

        <View style={[s.groupCard, { backgroundColor: photoCardBg }]}>
          <View style={[s.cardAccent, { backgroundColor: "#38bdf8" }]} />
          <View style={s.cardInner}>
            <View style={s.sectionHead}>
              <View style={[s.sectionIconWrap, { backgroundColor: "#38bdf828" }]}>
                <Ionicons name="airplane-outline" size={20} color="#38bdf8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionTitle}>{pick("Airport delivery", "Livraison aéroport")}</Text>
                <Text style={s.sectionHint}>
                  {pick("You bring the car to the airport for the client (one-time fee in MAD).", "Vous amenez le véhicule à l'aéroport pour le client (frais unique en MAD).")}
                </Text>
              </View>
              <Switch
                value={!!form.airportDeliveryOffered}
                onValueChange={(v) => set("airportDeliveryOffered", v)}
                trackColor={{ false: C.border, true: "rgba(56,189,248,0.35)" }}
                thumbColor={form.airportDeliveryOffered ? "#38bdf8" : C.muted}
              />
            </View>
            {form.airportDeliveryOffered ? (
              <View style={s.fieldWrap}>
                <Text style={s.fieldLabel}>{pick("Airport service fee (MAD)", "Tarif service aéroport (MAD)")}</Text>
                <TextInput
                  value={form.airportDeliveryFeeMad}
                  onChangeText={(v) => set("airportDeliveryFeeMad", v)}
                  placeholder="250"
                  placeholderTextColor={C.muted}
                  keyboardType="decimal-pad"
                  style={s.input}
                />
              </View>
            ) : null}
          </View>
        </View>

        <TouchableOpacity onPress={handleSubmit} disabled={loading} activeOpacity={0.9} style={s.submitOuter}>
          <LinearGradient
            colors={loading ? [C.muted, C.muted] : [C.primary, "#6366f1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[s.submitBtn, loading && { opacity: 0.85 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={s.submitBtnText}>{pick("Publish rental", "Publier la location")}</Text>
                <Ionicons name="arrow-forward-circle" size={22} color="rgba(255,255,255,0.95)" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <Text style={s.footerNote}>
          {pick("Submitted for review before going live.", "Soumis pour modération avant mise en ligne.")}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createAddRentalStyles(C, isDark) {
  return StyleSheet.create({
    heroBadge: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      gap: 6,
      backgroundColor: isDark ? "rgba(124,107,255,0.2)" : "rgba(99,102,241,0.12)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      marginBottom: 12,
    },
    heroBadgeText: { color: C.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
    heroTitle: {
      color: C.white,
      fontSize: 28,
      fontWeight: "900",
      letterSpacing: -0.8,
      lineHeight: 34,
    },
    heroSub: { color: C.muted, fontSize: 14, marginTop: 10, lineHeight: 21, maxWidth: W - 40 },
    floatCard: {
      marginHorizontal: 16,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: C.border,
      overflow: "hidden",
      marginBottom: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isDark ? 0.35 : 0.08,
      shadowRadius: 20,
      elevation: 6,
    },
    groupCard: {
      marginHorizontal: 16,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: C.border,
      overflow: "hidden",
      marginBottom: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.25 : 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    cardAccent: { height: 3, borderRadius: 2, marginHorizontal: 14, marginTop: 10, opacity: 0.95 },
    cardInner: { paddingHorizontal: 16, paddingBottom: 18, paddingTop: 4 },
    sectionHead: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
    sectionIconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    sectionTitle: { color: C.white, fontWeight: "800", fontSize: 17, letterSpacing: -0.3 },
    sectionHint: { color: C.muted, fontSize: 12, marginTop: 2, lineHeight: 17 },
    photoCount: { color: C.muted, fontWeight: "700", fontSize: 13 },
    photosRow: { flexDirection: "row", gap: 12, paddingVertical: 4 },
    photoWrap: { position: "relative" },
    photoThumb: { width: 108, height: 80, borderRadius: 16, backgroundColor: C.inputBg },
    coverTag: {
      position: "absolute",
      bottom: 6,
      left: 6,
      backgroundColor: "rgba(0,0,0,0.65)",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    coverTagText: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
    removeBtn: {
      position: "absolute",
      top: -6,
      right: -6,
      backgroundColor: "#ef4444",
      borderRadius: 14,
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: C.card,
    },
    addPhotoBtn: { borderRadius: 16, overflow: "hidden" },
    addPhotoGrad: {
      width: 108,
      height: 80,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: C.border,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
    },
    addPhotoBtnText: { color: C.primary, fontSize: 11, fontWeight: "700", marginTop: 6 },
    fieldWrap: { marginBottom: 14 },
    fieldLabel: { color: C.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.6, marginBottom: 8, textTransform: "uppercase" },
    input: {
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 14,
      color: C.white,
      paddingVertical: 14,
      paddingHorizontal: 16,
      fontSize: 15,
    },
    inputMulti: { textAlignVertical: "top", minHeight: 112, paddingTop: 14 },
    cityRow: {
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 14,
      flexDirection: "row",
      alignItems: "center",
      paddingRight: 10,
    },
    cityInput: { flex: 1, color: C.white, paddingVertical: 14, paddingHorizontal: 16, fontSize: 15 },
    gpsBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: isDark ? "rgba(124,107,255,0.15)" : "rgba(99,102,241,0.1)",
      borderWidth: 1,
      borderColor: C.primary + "44",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    gpsBtnText: { color: C.primary, fontSize: 12, fontWeight: "800" },
    submitOuter: { marginHorizontal: 16, marginTop: 8 },
    submitBtn: {
      borderRadius: 16,
      paddingVertical: 17,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    submitBtnText: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: -0.2 },
    footerNote: { textAlign: "center", color: C.muted, fontSize: 12, marginTop: 14, marginHorizontal: 28, lineHeight: 18 },
  });
}
