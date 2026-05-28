import { useState, useEffect, useCallback } from "react";
import { PageLoader } from '../src/components/AppLoadingScreen';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Alert, Platform, StyleSheet, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";
import { getMyProfile, updateNationalId } from "../src/api/user";
import { uploadListingImages } from "../src/api/upload";

export default function VerifyCinScreen() {
  const { colors: C, isDark } = useTheme();
  const { lang, pick } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const purpose = params?.purpose === "rent" ? "rent" : "sell";
  const returnPath =
    params?.return === "add-rental"
      ? "/add-rental"
      : params?.return === "new-sale" || params?.return === "sell"
        ? "/new-sale"
        : "/new-sale";

  useEffect(() => {
    if (purpose === "rent") {
      router.replace({
        pathname: "/profile-documents",
        params: params?.return ? { return: String(params.return) } : {},
      });
    }
  }, [purpose, params?.return, router]);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [cinNumber, setCinNumber] = useState("");
  const [cinImage, setCinImage]   = useState(null);

  const titleColor  = isDark ? "#f8fafc" : "#0f172a";
  const subColor    = isDark ? "#94a3b8" : "#475569";
  const cardBg      = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.95)";
  const cardBorder  = isDark ? "rgba(124,107,255,0.22)" : "rgba(98,72,232,0.14)";
  const inputBg     = isDark ? "rgba(255,255,255,0.07)" : "#f8fafc";
  const inputBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)";

  useEffect(() => {
    getMyProfile()
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pickCinImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", quality: 0.8, allowsEditing: true });
    if (!result.canceled) setCinImage(result.assets[0]);
  }, []);

  const takeCinPhoto = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert(pick("Camera permission required", "Permission caméra requise")); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true });
    if (!result.canceled) setCinImage(result.assets[0]);
  }, [fr]);

  const handleSubmit = useCallback(async () => {
    if (!cinNumber.trim()) {
      Alert.alert(pick("CIN number required", "Numéro CIN requis"));
      return;
    }
    if (!cinImage) {
      Alert.alert(pick("CIN photo required", "Photo CIN requise"));
      return;
    }
    setSaving(true);
    try {
      const [imageUrl] = await uploadListingImages([{
        uri: cinImage.uri,
        name: "cin.jpg",
        type: cinImage.mimeType || "image/jpeg",
      }]);
      await updateNationalId({ number: cinNumber.trim(), imageUrl });
      Alert.alert(
        pick("Request sent ✓", "Demande envoyée ✓"),
        pick("ID saved. You can fill in the sale form; your listing will be reviewed by our team.", "CIN enregistré. Vous pouvez remplir le formulaire de vente ; l'annonce sera validée par l'équipe."),
        [{
          text: pick("Post listing anyway", "Créer l'annonce quand même"),
          onPress: () => router.push({ pathname: returnPath, params }),
        }, { text: "OK" }]
      );
    } catch (e) {
      Alert.alert("Erreur", e?.response?.data?.message || "Impossible de soumettre");
    } finally {
      setSaving(false);
    }
  }, [cinNumber, cinImage, fr, router, params, returnPath]);

  const goToSell = useCallback(() => {
    router.push({ pathname: returnPath, params });
  }, [router, params, returnPath]);

  if (purpose === "rent" || loading) {
    return <PageLoader />;
  }

  const isVerified  = profile?.nationalId?.verified === true;
  const isSubmitted = !!profile?.nationalId?.imageUrl && !isVerified;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg ?? (isDark ? "#05060f" : "#f8fafc") }}>
      <LinearGradient
        colors={isDark ? ["#03040a", "#120a24", "#05060f"] : ["#faf5ff", "#e0f2fe", "#f8fafc"]}
        style={{ paddingTop: insets.top + 8, paddingBottom: 20, paddingHorizontal: 22 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}
            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.7)" }}
          >
            <Ionicons name="arrow-back" size={20} color={titleColor} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", color: C.primary, marginBottom: 2 }}>
              {pick("Trust & safety", "Confiance & sécurité")}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: titleColor, letterSpacing: -0.4 }}>
              {pick("Sell my car", "Vendre ma voiture")}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 20, paddingBottom: insets.bottom + 40 }}
      >
        {/* Badge info */}
        <View style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder, marginBottom: 16 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <LinearGradient colors={isVerified ? ["#22c55e", "#16a34a"] : ["#6248e8", "#4338ca"]} style={{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={isVerified ? "shield-checkmark" : "shield-outline"} size={26} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: titleColor }}>
                {isVerified
                  ? (pick("ID verified ✓", "CIN vérifié ✓"))
                  : isSubmitted
                    ? (pick("ID under review…", "CIN en cours de validation…"))
                    : (pick("ID to sell your car", "CIN pour vendre"))}
              </Text>
              <Text style={{ fontSize: 13, color: subColor, marginTop: 3, lineHeight: 19 }}>
                {isVerified
                  ? (pick("You can post a car for sale.", "Vous pouvez publier une annonce de vente."))
                  : isSubmitted
                    ? (pick("Our team reviews your ID within 24–48h. You can still submit a listing.", "Notre équipe vérifie votre CIN sous 24–48h. Vous pouvez déjà soumettre une annonce."))
                    : (pick("Only your national ID is required to sell (not your license).", "Seul le CIN est requis pour vendre (pas le permis)."))}
              </Text>
            </View>
          </View>

          {!isVerified && !isSubmitted && (
            <View style={{ gap: 8 }}>
              {[
                { icon: "document-text-outline", text: pick("One document: your national ID", "Une seule pièce : votre CIN") },
                { icon: "time-outline", text: pick("Listing waits for admin approval", "Annonce en attente d'approbation admin") },
                { icon: "lock-closed-outline", text: pick("Your ID stays private", "Votre CIN reste confidentiel") },
              ].map((item, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Ionicons name={item.icon} size={16} color={C.primary} />
                  <Text style={{ fontSize: 13, color: subColor, flex: 1 }}>{item.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {isVerified ? (
          <TouchableOpacity onPress={goToSell} activeOpacity={0.85}>
            <LinearGradient colors={["#22c55e", "#16a34a"]} style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10 }}>
              <Ionicons name="pricetag-outline" size={20} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                {pick("Post my listing", "Publier mon annonce")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : isSubmitted ? (
          <>
            <View style={[s.card, { backgroundColor: "rgba(234,179,8,0.08)", borderColor: "rgba(234,179,8,0.3)", marginBottom: 16 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="time-outline" size={20} color="#eab308" />
                <Text style={{ fontSize: 14, color: "#eab308", fontWeight: "700", flex: 1 }}>
                  {pick("Verification pending — 24 to 48h", "Vérification en attente — 24 à 48h")}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={goToSell} activeOpacity={0.85}>
              <View style={{ borderRadius: 16, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: isDark ? "rgba(124,107,255,0.4)" : "rgba(98,72,232,0.3)", backgroundColor: isDark ? "rgba(124,107,255,0.08)" : "rgba(98,72,232,0.05)" }}>
                <Ionicons name="pricetag-outline" size={18} color={C.primary} />
                <Text style={{ color: C.primary, fontWeight: "800", fontSize: 15 }}>
                  {pick("Post without badge (for now)", "Publier sans badge (pour l'instant)")}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* CIN upload form */}
            <View style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder, marginBottom: 16 }]}>
              <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", color: isDark ? "#94a3b8" : "#64748b", marginBottom: 14 }}>
                {pick("Your CIN", "Votre CIN")}
              </Text>

              <Text style={{ fontSize: 12, fontWeight: "700", color: subColor, marginBottom: 6 }}>
                {pick("CIN number *", "Numéro CIN *")}
              </Text>
              <TextInput
                value={cinNumber}
                onChangeText={setCinNumber}
                placeholder={pick("e.g. AB123456", "Ex: AB123456")}
                placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                autoCapitalize="characters"
                style={[s.input, { backgroundColor: inputBg, borderColor: inputBorder, color: titleColor, marginBottom: 16 }]}
              />

              <Text style={{ fontSize: 12, fontWeight: "700", color: subColor, marginBottom: 10 }}>
                {pick("CIN front photo *", "Photo recto du CIN *")}
              </Text>

              {cinImage ? (
                <View style={{ position: "relative", marginBottom: 12 }}>
                  <Image source={{ uri: cinImage.uri }} style={{ width: "100%", height: 180, borderRadius: 12 }} resizeMode="cover" />
                  <TouchableOpacity onPress={() => setCinImage(null)}
                    style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" }}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity onPress={pickCinImage} activeOpacity={0.8} style={{ flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)", borderStyle: "dashed", paddingVertical: 18, alignItems: "center", gap: 6 }}>
                    <Ionicons name="image-outline" size={24} color={subColor} />
                    <Text style={{ fontSize: 12, color: subColor, fontWeight: "600" }}>{pick("Gallery", "Galerie")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={takeCinPhoto} activeOpacity={0.8} style={{ flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)", borderStyle: "dashed", paddingVertical: 18, alignItems: "center", gap: 6 }}>
                    <Ionicons name="camera-outline" size={24} color={subColor} />
                    <Text style={{ fontSize: 12, color: subColor, fontWeight: "600" }}>{pick("Camera", "Caméra")}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={{ fontSize: 11, color: isDark ? "#475569" : "#94a3b8", marginTop: 10, lineHeight: 16 }}>
                {pick("Your CIN is encrypted and only visible to our verification team. It will never be shared publicly.", "Votre CIN est chiffré et uniquement visible par notre équipe de vérification. Il ne sera jamais partagé publiquement.")}
              </Text>
            </View>

            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} disabled={saving}>
              <LinearGradient colors={["#6248e8", "#4f46e5", "#4338ca"]} style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 12 }}>
                {saving ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                        {pick("Submit for verification", "Soumettre pour vérification")}
                      </Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={goToSell} activeOpacity={0.85}>
              <View style={{ borderRadius: 16, paddingVertical: 13, alignItems: "center" }}>
                <Text style={{ color: subColor, fontSize: 14, fontWeight: "600" }}>
                  {pick("Skip for now →", "Passer pour l'instant →")}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 18, padding: 16, borderWidth: 1, ...(Platform.OS === "ios" ? { borderCurve: "continuous" } : {}) },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, fontWeight: "600" },
});
