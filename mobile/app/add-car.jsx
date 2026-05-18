import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";
import { getMyCar, createCar, updateCar } from "../src/api/userCar";
import { uploadListingImages } from "../src/api/upload";
import { useAuth } from "../src/context/AuthContext";
import { deferGarageSetup, clearGarageSetupDefer } from "../src/utils/garageSetupStorage";

const STEPS = [
  { key: "identity",     icon: "car-sport-outline",   color: "#a78bfa" },
  { key: "papers",       icon: "document-text-outline", color: "#f97316" },
  { key: "mecanique",    icon: "construct-outline",    color: "#38bdf8" },
];

const FUEL_OPTIONS    = ["essence", "diesel", "hybride", "electrique"];
const GEARBOX_OPTIONS = ["manuelle", "automatique"];

function pill(label, active, onPress, activeColor, isDark) {
  return (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 999,
        borderWidth: 1.5,
        borderColor: active ? activeColor : (isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)"),
        backgroundColor: active ? `${activeColor}18` : "transparent",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: "700", color: active ? activeColor : (isDark ? "#94a3b8" : "#64748b"), textTransform: "capitalize" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function FieldLabel({ text, isDark }) {
  return <Text style={{ fontSize: 12, fontWeight: "700", color: isDark ? "#64748b" : "#94a3b8", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6, marginTop: 16 }}>{text}</Text>;
}

function DateField({ label, value, onChange, isDark, C, fr }) {
  const [show, setShow] = useState(false);
  const formatted = value ? new Date(value).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }) : (fr ? "Non renseigné" : "Not set");

  return (
    <View>
      <FieldLabel text={label} isDark={isDark} />
      <TouchableOpacity
        onPress={() => setShow(true)}
        activeOpacity={0.75}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingVertical: 13,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)",
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
        }}
      >
        <Text style={{ fontSize: 14, fontWeight: "600", color: value ? (isDark ? "#f1f5f9" : "#0f172a") : (isDark ? "#475569" : "#94a3b8") }}>
          {formatted}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={isDark ? "#475569" : "#94a3b8"} />
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, d) => {
            setShow(Platform.OS === "ios");
            if (d) onChange(d.toISOString());
          }}
        />
      )}
    </View>
  );
}

function StepIndicator({ step, total, colors, isDark }) {
  return (
    <View style={{ flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{ width: i === step ? 28 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? colors[i] : (isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)"), transition: "width 0.3s" }} />
      ))}
    </View>
  );
}

export default function AddCarScreen() {
  const { colors: C, isDark } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { id } = params;
  const isEdit = !!id;
  const isRequired = params.required === "1" || params.required === 1;
  const { auth } = useAuth();

  const [step, setStep]       = useState(0);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [imageUri, setImageUri]   = useState(null);   // local picked URI
  const [imageUrl, setImageUrl]   = useState(null);   // already-uploaded Cloudinary URL

  const slideAnim = useRef(new Animated.Value(0)).current;

  // ── form state ──────────────────────────────────────────────────────────────
  const [identity, setIdentity] = useState({
    brand: "", model: "", year: "", firstOwner: true,
    fuelType: "essence", gearbox: "manuelle", currentMileage: "", color: "",
  });

  const [papers, setPapers] = useState({
    assuranceStart: null, assuranceExpiry: null,
    visiteTechniqueExpiry: null,
    vignetteExpiry: null,
    permisExpiry: null,
  });

  const [mecanique, setMecanique] = useState({
    vidangeDate: null, vidangeKm: "", vidangeIntervalKm: "10000", vidangeBrand: "",
    pneusDate: null, pneusBrand: "",
    batterieDate: null, batterieBrand: "",
    chainDate: null, chainKm: "",
    freinsDate: null, freinsBrand: "",
  });

  // Load existing car for edit mode
  useEffect(() => {
    if (!isEdit) return;
    getMyCar()
      .then(({ data }) => {
        if (!data) return;
        setIdentity({
          brand:          data.brand          ?? "",
          model:          data.model          ?? "",
          year:           data.year?.toString() ?? "",
          firstOwner:     data.firstOwner     ?? true,
          fuelType:       data.fuelType       ?? "essence",
          gearbox:        data.gearbox        ?? "manuelle",
          currentMileage: data.currentMileage?.toString() ?? "",
          color:          data.color          ?? "",
        });
        if (data.image) setImageUrl(data.image);
        setPapers({
          assuranceStart:       data.assurance?.startDate   ?? null,
          assuranceExpiry:      data.assurance?.expiryDate  ?? null,
          visiteTechniqueExpiry: data.visiteTechnique?.expiryDate ?? null,
          vignetteExpiry:       data.vignette?.expiryDate   ?? null,
          permisExpiry:         data.permis?.expiryDate     ?? null,
        });
        setMecanique({
          vidangeDate:      data.vidange?.lastDate      ?? null,
          vidangeKm:        data.vidange?.lastKm?.toString()      ?? "",
          vidangeIntervalKm: data.vidange?.intervalKm?.toString() ?? "10000",
          vidangeBrand:     data.vidange?.brand         ?? "",
          pneusDate:        data.pneus?.lastChangeDate  ?? null,
          pneusBrand:       data.pneus?.brand           ?? "",
          batterieDate:     data.batterie?.lastChangeDate ?? null,
          batterieBrand:    data.batterie?.brand         ?? "",
          chainDate:        data.chainDistribution?.lastChangeDate ?? null,
          chainKm:          data.chainDistribution?.lastKm?.toString() ?? "",
          freinsDate:       data.freins?.lastChangeDate  ?? null,
          freinsBrand:      data.freins?.brand           ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isEdit]);

  const animateNext = useCallback((direction = 1) => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -20 * direction, duration: 100, useNativeDriver: true, easing: Easing.in(Easing.cubic) }),
      Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, [slideAnim]);

  const goNext = useCallback(() => {
    if (step === 0 && !identity.brand.trim()) {
      Alert.alert(fr ? "Champ requis" : "Required field", fr ? "La marque est obligatoire." : "Brand is required.");
      return;
    }
    animateNext(1);
    setStep((s) => s + 1);
  }, [step, identity, fr, animateNext]);

  const goLater = useCallback(async () => {
    if (auth?._id) await deferGarageSetup(auth._id);
    router.replace("/(car-owner)");
  }, [auth?._id, router]);

  const goBack = useCallback(() => {
    if (step === 0) {
      if (isRequired && !isEdit) {
        goLater();
        return;
      }
      router.back();
      return;
    }
    animateNext(-1);
    setStep((s) => s - 1);
  }, [step, router, animateNext, isRequired, isEdit, goLater]);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        fr ? "Permission refusée" : "Permission denied",
        fr ? "Accès à la galerie requis." : "Gallery access is required."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setImageUri(result.assets[0].uri);
      setImageUrl(null); // clear old URL so we re-upload
    }
  }, [fr]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      let finalImageUrl = imageUrl;
      if (imageUri) {
        const urls = await uploadListingImages([{ uri: imageUri, name: "car.jpg", type: "image/jpeg" }]);
        finalImageUrl = urls[0] || null;
      }

      const payload = {
        brand:          identity.brand.trim(),
        model:          identity.model.trim()          || undefined,
        year:           identity.year ? Number(identity.year) : undefined,
        firstOwner:     identity.firstOwner,
        fuelType:       identity.fuelType              || undefined,
        gearbox:        identity.gearbox               || undefined,
        currentMileage: identity.currentMileage ? Number(identity.currentMileage) : undefined,
        color:          identity.color.trim()          || undefined,
        image:          finalImageUrl                  || undefined,
        assurance: {
          startDate:  papers.assuranceStart  || null,
          expiryDate: papers.assuranceExpiry || null,
        },
        visiteTechnique: { expiryDate: papers.visiteTechniqueExpiry || null },
        vignette:        { expiryDate: papers.vignetteExpiry        || null },
        permis:          { expiryDate: papers.permisExpiry          || null },
        vidange: {
          lastDate:    mecanique.vidangeDate || null,
          lastKm:      mecanique.vidangeKm       ? Number(mecanique.vidangeKm)       : null,
          intervalKm:  mecanique.vidangeIntervalKm ? Number(mecanique.vidangeIntervalKm) : 10000,
          brand:       mecanique.vidangeBrand.trim() || undefined,
        },
        pneus: {
          lastChangeDate: mecanique.pneusDate || null,
          brand:          mecanique.pneusBrand.trim() || undefined,
        },
        batterie: {
          lastChangeDate: mecanique.batterieDate || null,
          brand:          mecanique.batterieBrand.trim() || undefined,
        },
        chainDistribution: {
          lastChangeDate: mecanique.chainDate || null,
          lastKm:         mecanique.chainKm ? Number(mecanique.chainKm) : null,
        },
        freins: {
          lastChangeDate: mecanique.freinsDate || null,
          brand:          mecanique.freinsBrand.trim() || undefined,
        },
      };

      if (isEdit) {
        await updateCar(id, payload);
      } else {
        await createCar(payload);
      }
      if (auth?._id) await clearGarageSetupDefer(auth._id);
      router.replace("/(car-owner)");
    } catch (e) {
      Alert.alert(fr ? "Erreur" : "Error", e?.response?.data?.message || (fr ? "Impossible de sauvegarder." : "Could not save."));
    } finally {
      setSaving(false);
    }
  }, [identity, papers, mecanique, isEdit, id, fr, router]);

  // ── style helpers ────────────────────────────────────────────────────────────
  const primaryGrad = isDark ? ["#7c6bff", "#5b4ddb", "#4338ca"] : ["#6248e8", "#4f46e5", "#4338ca"];
  const bgColor     = C.bg ?? (isDark ? "#05060f" : "#f8fafc");
  const titleColor  = isDark ? "#f8fafc" : "#0f172a";
  const subColor    = isDark ? "#94a3b8" : "#475569";

  const inputStyle = useMemo(() => ({
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)",
    backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
    color: isDark ? "#f1f5f9" : "#0f172a",
  }), [isDark]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: bgColor, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  const stepColor = STEPS[step].color;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: bgColor }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ["#03040a", "#120a24", "#05060f"] : ["#faf5ff", "#e0f2fe", "#f8fafc"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 22 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <TouchableOpacity onPress={goBack} activeOpacity={0.8}
            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)" }}
          >
            <Ionicons name="arrow-back" size={20} color={titleColor} />
          </TouchableOpacity>
          <Text style={{ fontSize: 16, fontWeight: "800", color: titleColor }}>
            {isEdit ? (fr ? "Modifier ma voiture" : "Edit my car") : (fr ? "Ajouter ma voiture" : "Add my car")}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <StepIndicator step={step} total={STEPS.length} colors={STEPS.map((s) => s.color)} isDark={isDark} />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <LinearGradient colors={[`${stepColor}30`, `${stepColor}10`]} style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={STEPS[step].icon} size={18} color={stepColor} />
          </LinearGradient>
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1.6, textTransform: "uppercase", color: stepColor }}>
              {fr ? `Étape ${step + 1} / ${STEPS.length}` : `Step ${step + 1} / ${STEPS.length}`}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: titleColor, letterSpacing: -0.3, marginTop: 2 }}>
              {step === 0 ? (fr ? "Identité du véhicule" : "Vehicle identity")
                : step === 1 ? (fr ? "Papiers administratifs" : "Administrative papers")
                : (fr ? "Mécanique" : "Maintenance")}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        style={{ transform: [{ translateY: slideAnim }] }}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: insets.bottom + 80 }}
      >
        {isRequired && !isEdit && step === 0 ? (
          <View
            style={{
              marginBottom: 20,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: isDark ? "rgba(56,189,248,0.35)" : "rgba(2,132,199,0.25)",
              backgroundColor: isDark ? "rgba(56,189,248,0.1)" : "rgba(2,132,199,0.06)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <Ionicons name="car-sport" size={28} color={isDark ? "#38bdf8" : "#0284c7"} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: titleColor, marginBottom: 6 }}>
                  {fr ? "Ajoutez votre voiture pour commencer" : "Add your car to get started"}
                </Text>
                <Text style={{ fontSize: 13, color: subColor, lineHeight: 20 }}>
                  {fr
                    ? "C'est la fonction principale de GooVoiture pour vous : suivi des papiers, alertes et entretien. Seule la marque est obligatoire pour démarrer."
                    : "This is your main GooVoiture feature: track papers, get alerts, and manage maintenance. Only the brand is required to start."}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={goLater} activeOpacity={0.85} style={{ marginTop: 14, alignSelf: "flex-start" }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b" }}>
                {fr ? "Plus tard" : "I'll do this later"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── Step 0: Identity ───────────────────────────────────────────────── */}
        {step === 0 && (
          <View>
            {/* Car photo picker */}
            <FieldLabel text={fr ? "Photo de la voiture" : "Car photo"} isDark={isDark} />
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              {imageUri || imageUrl ? (
                <View style={{ borderRadius: 16, overflow: "hidden", height: 180, marginBottom: 4 }}>
                  <Image
                    source={{ uri: imageUri || imageUrl }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                  <View style={{ position: "absolute", bottom: 10, right: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                    <Ionicons name="camera-outline" size={14} color="#fff" />
                    <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{fr ? "Changer" : "Change"}</Text>
                  </View>
                </View>
              ) : (
                <View style={{ height: 130, borderRadius: 16, borderWidth: 1.5, borderStyle: "dashed", borderColor: isDark ? "rgba(167,139,250,0.35)" : "rgba(98,72,232,0.25)", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: isDark ? "rgba(167,139,250,0.05)" : "rgba(98,72,232,0.03)", marginBottom: 4 }}>
                  <LinearGradient colors={["#a78bfa30", "#a78bfa10"]} style={{ width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="camera-outline" size={24} color="#a78bfa" />
                  </LinearGradient>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b" }}>
                    {fr ? "Ajouter une photo (optionnel)" : "Add a photo (optional)"}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <FieldLabel text={fr ? "Marque *" : "Brand *"} isDark={isDark} />
            <TextInput
              style={inputStyle}
              placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
              placeholder={fr ? "ex. Dacia" : "e.g. Dacia"}
              value={identity.brand}
              onChangeText={(v) => setIdentity((p) => ({ ...p, brand: v }))}
            />
            <FieldLabel text={fr ? "Modèle *" : "Model *"} isDark={isDark} />
            <TextInput
              style={inputStyle}
              placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
              placeholder={fr ? "ex. Sandero" : "e.g. Sandero"}
              value={identity.model}
              onChangeText={(v) => setIdentity((p) => ({ ...p, model: v }))}
            />
            <FieldLabel text={fr ? "Année *" : "Year *"} isDark={isDark} />
            <TextInput
              style={inputStyle}
              placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
              placeholder="2018"
              value={identity.year}
              onChangeText={(v) => setIdentity((p) => ({ ...p, year: v }))}
              keyboardType="numeric"
            />
            <FieldLabel text={fr ? "Kilométrage actuel" : "Current mileage"} isDark={isDark} />
            <TextInput
              style={inputStyle}
              placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
              placeholder="130000"
              value={identity.currentMileage}
              onChangeText={(v) => setIdentity((p) => ({ ...p, currentMileage: v }))}
              keyboardType="numeric"
            />
            <FieldLabel text={fr ? "Couleur" : "Color"} isDark={isDark} />
            <TextInput
              style={inputStyle}
              placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
              placeholder={fr ? "ex. Blanc" : "e.g. White"}
              value={identity.color}
              onChangeText={(v) => setIdentity((p) => ({ ...p, color: v }))}
            />
            <FieldLabel text={fr ? "Carburant *" : "Fuel type *"} isDark={isDark} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
              {FUEL_OPTIONS.map((f) => pill(f, identity.fuelType === f, () => setIdentity((p) => ({ ...p, fuelType: f })), stepColor, isDark))}
            </View>
            <FieldLabel text={fr ? "Boîte de vitesse" : "Gearbox"} isDark={isDark} />
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
              {GEARBOX_OPTIONS.map((g) => pill(g, identity.gearbox === g, () => setIdentity((p) => ({ ...p, gearbox: g })), stepColor, isDark))}
            </View>
            <FieldLabel text={fr ? "Première main" : "First owner"} isDark={isDark} />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)" }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: isDark ? "#f1f5f9" : "#0f172a" }}>
                {identity.firstOwner ? (fr ? "Oui, 1ère main" : "Yes, first owner") : (fr ? "Non, 2ème main" : "No, 2nd hand")}
              </Text>
              <Switch
                value={identity.firstOwner}
                onValueChange={(v) => setIdentity((p) => ({ ...p, firstOwner: v }))}
                trackColor={{ false: isDark ? "#1e293b" : "#e2e8f0", true: `${stepColor}60` }}
                thumbColor={identity.firstOwner ? stepColor : (isDark ? "#475569" : "#94a3b8")}
              />
            </View>
          </View>
        )}

        {/* ── Step 1: Papers ─────────────────────────────────────────────────── */}
        {step === 1 && (
          <View>
            <Text style={{ fontSize: 13, color: subColor, lineHeight: 20, marginBottom: 8 }}>
              {fr ? "Renseignez vos dates d'expiration pour recevoir des rappels automatiques." : "Enter your expiry dates to receive automatic reminders."}
            </Text>
            <DateField label={fr ? "Assurance — début" : "Insurance — start"} value={papers.assuranceStart} onChange={(v) => setPapers((p) => ({ ...p, assuranceStart: v }))} isDark={isDark} C={C} fr={fr} />
            <DateField label={fr ? "Assurance — expiration *" : "Insurance — expiry *"} value={papers.assuranceExpiry} onChange={(v) => setPapers((p) => ({ ...p, assuranceExpiry: v }))} isDark={isDark} C={C} fr={fr} />
            <DateField label={fr ? "Visite technique — expiration" : "Car inspection — expiry"} value={papers.visiteTechniqueExpiry} onChange={(v) => setPapers((p) => ({ ...p, visiteTechniqueExpiry: v }))} isDark={isDark} C={C} fr={fr} />
            <DateField label={fr ? "Vignette — expiration" : "Road tax — expiry"} value={papers.vignetteExpiry} onChange={(v) => setPapers((p) => ({ ...p, vignetteExpiry: v }))} isDark={isDark} C={C} fr={fr} />
            <DateField label={fr ? "Permis de conduire — expiration" : "Driving licence — expiry"} value={papers.permisExpiry} onChange={(v) => setPapers((p) => ({ ...p, permisExpiry: v }))} isDark={isDark} C={C} fr={fr} />
          </View>
        )}

        {/* ── Step 2: Mécanique ───────────────────────────────────────────────── */}
        {step === 2 && (
          <View>
            <Text style={{ fontSize: 13, color: subColor, lineHeight: 20, marginBottom: 8 }}>
              {fr ? "Ces informations permettent d'estimer les prochaines échéances mécaniques." : "This information helps estimate upcoming maintenance deadlines."}
            </Text>
            {/* Vidange */}
            <View style={sectionBox(isDark)}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#38bdf8", letterSpacing: 0.6, marginBottom: 4 }}>
                {fr ? "Vidange" : "Oil change"}
              </Text>
              <DateField label={fr ? "Date dernière vidange" : "Last oil change date"} value={mecanique.vidangeDate} onChange={(v) => setMecanique((p) => ({ ...p, vidangeDate: v }))} isDark={isDark} C={C} fr={fr} />
              <FieldLabel text={fr ? "Km à la dernière vidange" : "Mileage at last change"} isDark={isDark} />
              <TextInput style={inputStyle} placeholderTextColor={isDark ? "#475569" : "#94a3b8"} placeholder="120000" value={mecanique.vidangeKm} onChangeText={(v) => setMecanique((p) => ({ ...p, vidangeKm: v }))} keyboardType="numeric" />
              <FieldLabel text={fr ? "Intervalle (km)" : "Interval (km)"} isDark={isDark} />
              <TextInput style={inputStyle} placeholderTextColor={isDark ? "#475569" : "#94a3b8"} placeholder="10000" value={mecanique.vidangeIntervalKm} onChangeText={(v) => setMecanique((p) => ({ ...p, vidangeIntervalKm: v }))} keyboardType="numeric" />
              <FieldLabel text={fr ? "Marque huile" : "Oil brand"} isDark={isDark} />
              <TextInput style={inputStyle} placeholderTextColor={isDark ? "#475569" : "#94a3b8"} placeholder="Castrol, Total…" value={mecanique.vidangeBrand} onChangeText={(v) => setMecanique((p) => ({ ...p, vidangeBrand: v }))} />
            </View>

            {/* Pneus */}
            <View style={sectionBox(isDark)}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#38bdf8", letterSpacing: 0.6, marginBottom: 4 }}>{fr ? "Pneus" : "Tyres"}</Text>
              <DateField label={fr ? "Date dernier changement" : "Last change date"} value={mecanique.pneusDate} onChange={(v) => setMecanique((p) => ({ ...p, pneusDate: v }))} isDark={isDark} C={C} fr={fr} />
              <FieldLabel text={fr ? "Marque" : "Brand"} isDark={isDark} />
              <TextInput style={inputStyle} placeholderTextColor={isDark ? "#475569" : "#94a3b8"} placeholder="Michelin, Bridgestone…" value={mecanique.pneusBrand} onChangeText={(v) => setMecanique((p) => ({ ...p, pneusBrand: v }))} />
            </View>

            {/* Batterie */}
            <View style={sectionBox(isDark)}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#38bdf8", letterSpacing: 0.6, marginBottom: 4 }}>{fr ? "Batterie" : "Battery"}</Text>
              <DateField label={fr ? "Date dernier changement" : "Last change date"} value={mecanique.batterieDate} onChange={(v) => setMecanique((p) => ({ ...p, batterieDate: v }))} isDark={isDark} C={C} fr={fr} />
              <FieldLabel text={fr ? "Marque" : "Brand"} isDark={isDark} />
              <TextInput style={inputStyle} placeholderTextColor={isDark ? "#475569" : "#94a3b8"} placeholder="Varta, Bosch…" value={mecanique.batterieBrand} onChangeText={(v) => setMecanique((p) => ({ ...p, batterieBrand: v }))} />
            </View>

            {/* Chaîne distribution */}
            <View style={sectionBox(isDark)}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#38bdf8", letterSpacing: 0.6, marginBottom: 4 }}>{fr ? "Chaîne de distribution" : "Timing chain / belt"}</Text>
              <DateField label={fr ? "Date dernier changement" : "Last change date"} value={mecanique.chainDate} onChange={(v) => setMecanique((p) => ({ ...p, chainDate: v }))} isDark={isDark} C={C} fr={fr} />
              <FieldLabel text={fr ? "Km au dernier changement" : "Mileage at last change"} isDark={isDark} />
              <TextInput style={inputStyle} placeholderTextColor={isDark ? "#475569" : "#94a3b8"} placeholder="100000" value={mecanique.chainKm} onChangeText={(v) => setMecanique((p) => ({ ...p, chainKm: v }))} keyboardType="numeric" />
            </View>

            {/* Freins */}
            <View style={sectionBox(isDark)}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: "#38bdf8", letterSpacing: 0.6, marginBottom: 4 }}>{fr ? "Freins" : "Brakes"}</Text>
              <DateField label={fr ? "Date dernier changement" : "Last change date"} value={mecanique.freinsDate} onChange={(v) => setMecanique((p) => ({ ...p, freinsDate: v }))} isDark={isDark} C={C} fr={fr} />
              <FieldLabel text={fr ? "Marque plaquettes" : "Brake pad brand"} isDark={isDark} />
              <TextInput style={inputStyle} placeholderTextColor={isDark ? "#475569" : "#94a3b8"} placeholder="Brembo, Ferodo…" value={mecanique.freinsBrand} onChangeText={(v) => setMecanique((p) => ({ ...p, freinsBrand: v }))} />
            </View>
          </View>
        )}
      </Animated.ScrollView>

      {/* Footer nav */}
      <View style={{ paddingHorizontal: 22, paddingBottom: insets.bottom + 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)", backgroundColor: bgColor, flexDirection: "row", gap: 12 }}>
        {step > 0 && (
          <TouchableOpacity onPress={goBack} activeOpacity={0.8}
            style={{ flex: 1, paddingVertical: 15, borderRadius: 14, borderWidth: 1.5, borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.12)", alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)" }}
          >
            <Text style={{ fontSize: 15, fontWeight: "800", color: isDark ? "#94a3b8" : "#64748b" }}>{fr ? "Retour" : "Back"}</Text>
          </TouchableOpacity>
        )}

        {step < STEPS.length - 1 ? (
          <TouchableOpacity onPress={goNext} activeOpacity={0.85} style={{ flex: 2 }}>
            <LinearGradient colors={isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"]} style={{ borderRadius: 14, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "#7c6bff", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>{fr ? "Suivant" : "Next"}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSave} disabled={saving} activeOpacity={0.85} style={{ flex: 2 }}>
            <LinearGradient colors={isDark ? ["#22c55e", "#16a34a"] : ["#16a34a", "#15803d"]} style={{ borderRadius: 14, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, shadowColor: "#22c55e", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8, opacity: saving ? 0.7 : 1 }}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />}
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>{fr ? "Enregistrer" : "Save"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function sectionBox(isDark) {
  return {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? "rgba(56,189,248,0.15)" : "rgba(14,165,233,0.12)",
    backgroundColor: isDark ? "rgba(56,189,248,0.04)" : "rgba(14,165,233,0.03)",
  };
}
