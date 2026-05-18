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
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

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
    if (!perm.granted) { Alert.alert(fr ? "Permission caméra requise" : "Camera permission required"); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true });
    if (!result.canceled) setCinImage(result.assets[0]);
  }, [fr]);

  const handleSubmit = useCallback(async () => {
    if (!cinNumber.trim()) {
      Alert.alert(fr ? "Numéro CIN requis" : "CIN number required");
      return;
    }
    if (!cinImage) {
      Alert.alert(fr ? "Photo CIN requise" : "CIN photo required");
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
        fr ? "Demande envoyée ✓" : "Request sent ✓",
        fr
          ? "Votre CIN a été soumis. Notre équipe le vérifiera sous 24–48h. Vous pourrez vendre dès validation."
          : "Your CIN has been submitted. Our team will verify it within 24–48h.",
        [{
          text: fr ? "Créer l'annonce quand même" : "Post listing anyway",
          onPress: () => router.push({ pathname: "/new-sale", params }),
        }, { text: "OK" }]
      );
    } catch (e) {
      Alert.alert("Erreur", e?.response?.data?.message || "Impossible de soumettre");
    } finally {
      setSaving(false);
    }
  }, [cinNumber, cinImage, fr, router, params]);

  const goToSell = useCallback(() => {
    router.push({ pathname: "/new-sale", params });
  }, [router, params]);

  if (loading) {
    return (
      <PageLoader />
    );
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
              {fr ? "Confiance & sécurité" : "Trust & safety"}
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: titleColor, letterSpacing: -0.4 }}>
              {fr ? "Vendeur vérifié" : "Verified seller"}
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
                  ? (fr ? "Vous êtes vérifié ✓" : "You are verified ✓")
                  : isSubmitted
                    ? (fr ? "Vérification en cours…" : "Verification in progress…")
                    : (fr ? "Badge Vendeur Vérifié" : "Verified Seller Badge")}
              </Text>
              <Text style={{ fontSize: 13, color: subColor, marginTop: 3, lineHeight: 19 }}>
                {isVerified
                  ? (fr ? "Votre badge apparaît sur toutes vos annonces. Les acheteurs vous font davantage confiance." : "Your badge appears on all your listings. Buyers trust you more.")
                  : isSubmitted
                    ? (fr ? "Notre équipe vérifie votre CIN sous 24–48h." : "Our team is reviewing your CIN within 24–48h.")
                    : (fr ? "Augmentez vos chances de vente de 40% avec un badge CIN vérifié." : "Increase your sale chances by 40% with a verified CIN badge.")}
              </Text>
            </View>
          </View>

          {!isVerified && (
            <View style={{ gap: 8 }}>
              {[
                { icon: "eye-outline", text: fr ? "Votre annonce remonte en haut des résultats" : "Your listing ranks higher in results" },
                { icon: "chatbubble-outline", text: fr ? "Les acheteurs contactent plus les vendeurs vérifiés" : "Buyers contact verified sellers more" },
                { icon: "lock-closed-outline", text: fr ? "Votre numéro CIN reste confidentiel" : "Your CIN number stays private" },
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
                {fr ? "Publier mon annonce" : "Post my listing"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : isSubmitted ? (
          <>
            <View style={[s.card, { backgroundColor: "rgba(234,179,8,0.08)", borderColor: "rgba(234,179,8,0.3)", marginBottom: 16 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="time-outline" size={20} color="#eab308" />
                <Text style={{ fontSize: 14, color: "#eab308", fontWeight: "700", flex: 1 }}>
                  {fr ? "Vérification en attente — 24 à 48h" : "Verification pending — 24 to 48h"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={goToSell} activeOpacity={0.85}>
              <View style={{ borderRadius: 16, paddingVertical: 14, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: isDark ? "rgba(124,107,255,0.4)" : "rgba(98,72,232,0.3)", backgroundColor: isDark ? "rgba(124,107,255,0.08)" : "rgba(98,72,232,0.05)" }}>
                <Ionicons name="pricetag-outline" size={18} color={C.primary} />
                <Text style={{ color: C.primary, fontWeight: "800", fontSize: 15 }}>
                  {fr ? "Publier sans badge (pour l'instant)" : "Post without badge (for now)"}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* CIN upload form */}
            <View style={[s.card, { backgroundColor: cardBg, borderColor: cardBorder, marginBottom: 16 }]}>
              <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1.2, textTransform: "uppercase", color: isDark ? "#94a3b8" : "#64748b", marginBottom: 14 }}>
                {fr ? "Votre CIN" : "Your CIN"}
              </Text>

              <Text style={{ fontSize: 12, fontWeight: "700", color: subColor, marginBottom: 6 }}>
                {fr ? "Numéro CIN *" : "CIN number *"}
              </Text>
              <TextInput
                value={cinNumber}
                onChangeText={setCinNumber}
                placeholder={fr ? "Ex: AB123456" : "e.g. AB123456"}
                placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                autoCapitalize="characters"
                style={[s.input, { backgroundColor: inputBg, borderColor: inputBorder, color: titleColor, marginBottom: 16 }]}
              />

              <Text style={{ fontSize: 12, fontWeight: "700", color: subColor, marginBottom: 10 }}>
                {fr ? "Photo recto du CIN *" : "CIN front photo *"}
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
                    <Text style={{ fontSize: 12, color: subColor, fontWeight: "600" }}>{fr ? "Galerie" : "Gallery"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={takeCinPhoto} activeOpacity={0.8} style={{ flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.12)", borderStyle: "dashed", paddingVertical: 18, alignItems: "center", gap: 6 }}>
                    <Ionicons name="camera-outline" size={24} color={subColor} />
                    <Text style={{ fontSize: 12, color: subColor, fontWeight: "600" }}>{fr ? "Caméra" : "Camera"}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={{ fontSize: 11, color: isDark ? "#475569" : "#94a3b8", marginTop: 10, lineHeight: 16 }}>
                {fr
                  ? "Votre CIN est chiffré et uniquement visible par notre équipe de vérification. Il ne sera jamais partagé publiquement."
                  : "Your CIN is encrypted and only visible to our verification team. It will never be shared publicly."}
              </Text>
            </View>

            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} disabled={saving}>
              <LinearGradient colors={["#6248e8", "#4f46e5", "#4338ca"]} style={{ borderRadius: 16, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 12 }}>
                {saving ? <ActivityIndicator color="#fff" />
                  : <>
                      <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
                        {fr ? "Soumettre pour vérification" : "Submit for verification"}
                      </Text>
                    </>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={goToSell} activeOpacity={0.85}>
              <View style={{ borderRadius: 16, paddingVertical: 13, alignItems: "center" }}>
                <Text style={{ color: subColor, fontSize: 14, fontWeight: "600" }}>
                  {fr ? "Passer pour l'instant →" : "Skip for now →"}
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
