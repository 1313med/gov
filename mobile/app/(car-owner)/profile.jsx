import { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getMyProfile } from "../../src/api/user";
import { uploadAvatarFile } from "../../src/api/upload";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import ThemeToggle from "../../src/components/ThemeToggle";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";

export default function CarOwnerProfileScreen() {
  const { auth, logout } = useAuth();
  const { lang, setLang } = useAppLang();
  const fr = lang === "fr";
  const toggleLang = () => setLang(lang === "fr" ? "en" : "fr");
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const orbPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    getMyProfile().then((r) => setProfile(r.data)).catch(() => {});
  }, []);

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) {
      try {
        await uploadAvatarFile(result.assets[0]);
        const r = await getMyProfile();
        setProfile(r.data);
      } catch {
        Alert.alert(fr ? "Échec du téléchargement" : "Upload failed");
      }
    }
  };

  const avatarUrl = resolveMediaUrl(profile?.avatar);
  const heroGrad = isDark
    ? ["#03040a", "#0a1628", "#05060f"]
    : ["#f0f9ff", "#e0f2fe", "#f8fafc"];
  const ctaGrad = isDark ? ["#38bdf8", "#0ea5e9"] : ["#0284c7", "#0369a1"];
  const accent = isDark ? "#38bdf8" : "#0284c7";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={heroGrad} style={{ paddingTop: insets.top + 12, paddingBottom: 24, paddingHorizontal: 20, overflow: "hidden" }}>
        <Animated.View style={{ position: "absolute", width: 200, height: 200, top: -50, right: -60, borderRadius: 999, opacity: 0.35, transform: [{ scale: orbPulse }] }}>
          <LinearGradient
            colors={isDark ? ["rgba(56,189,248,0.5)", "rgba(56,189,248,0)"] : ["rgba(2,132,199,0.25)", "rgba(2,132,199,0)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85} style={{ position: "relative" }}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={[s.avatar, { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }]} />
            ) : (
              <LinearGradient colors={ctaGrad} style={s.avatar}>
                <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800" }}>
                  {(profile?.name || auth?.name || "?")[0].toUpperCase()}
                </Text>
              </LinearGradient>
            )}
            <View style={[s.editBadge, { backgroundColor: accent }]}>
              <Ionicons name="camera-outline" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ color: isDark ? "#f8fafc" : "#0f172a", fontSize: 18, fontWeight: "800", letterSpacing: -0.3, marginBottom: 2 }} numberOfLines={1}>
              {profile?.name || auth?.name || "—"}
            </Text>
            <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 13, fontWeight: "500", marginBottom: 8 }} numberOfLines={1}>
              {profile?.email || auth?.email || "—"}
            </Text>
            <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
              <Ionicons name="car-sport-outline" size={11} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 }}>
                {fr ? "PROPRIÉTAIRE" : "CAR OWNER"}
              </Text>
            </LinearGradient>
          </View>

          <ThemeToggle />
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Text style={[s.sectionTitle, { color: isDark ? "#94a3b8" : "#475569" }]}>{fr ? "Ma voiture" : "My car"}</Text>
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <Row icon="car-sport-outline" label={fr ? "Mon garage" : "My garage"} onPress={() => {}} accent={accent} C={C} isDark={isDark} />
          <Row icon="add-circle-outline" label={fr ? "Ajouter ma voiture" : "Add my car"} onPress={() => router.push("/add-car")} accent={accent} C={C} isDark={isDark} />
          <Row icon="calculator-outline" label={fr ? "Estimer la valeur" : "Estimate value"} onPress={() => router.push("/estimate")} accent={accent} C={C} isDark={isDark} />
          <Row icon="notifications-outline" label={fr ? "Alertes prix" : "Price alerts"} onPress={() => router.push("/price-alerts")} accent={accent} C={C} isDark={isDark} last />
        </View>

        <Text style={[s.sectionTitle, { color: isDark ? "#94a3b8" : "#475569" }]}>{fr ? "Annonces" : "Listings"}</Text>
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <Row icon="pricetag-outline" label={fr ? "Mes annonces de vente" : "My sales listings"} onPress={() => router.push("/my-sales")} accent={accent} C={C} isDark={isDark} />
          <Row icon="car-outline" label={fr ? "Mes locations" : "My rentals"} onPress={() => router.push("/my-fleet")} accent={accent} C={C} isDark={isDark} last />
        </View>

        <Text style={[s.sectionTitle, { color: isDark ? "#94a3b8" : "#475569" }]}>{fr ? "Préférences" : "Preferences"}</Text>
        <View style={[s.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(56,189,248,0.15)" : "rgba(2,132,199,0.1)" }}>
              <Ionicons name="moon-outline" size={18} color={accent} />
            </View>
            <Text style={{ flex: 1, color: isDark ? "#f1f5f9" : "#0f172a", fontSize: 15, fontWeight: "600" }}>{fr ? "Thème sombre" : "Dark mode"}</Text>
            <ThemeToggle />
          </View>
          <TouchableOpacity onPress={toggleLang} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 16 }} activeOpacity={0.8}>
            <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(56,189,248,0.15)" : "rgba(2,132,199,0.1)" }}>
              <Ionicons name="language-outline" size={18} color={accent} />
            </View>
            <Text style={{ flex: 1, color: isDark ? "#f1f5f9" : "#0f172a", fontSize: 15, fontWeight: "600" }}>{fr ? "Langue" : "Language"}</Text>
            <Text style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: 14, fontWeight: "600" }}>{fr ? "Français" : "English"}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => Alert.alert(fr ? "Déconnexion" : "Log out", fr ? "Voulez-vous vous déconnecter ?" : "Are you sure?", [
            { text: fr ? "Annuler" : "Cancel", style: "cancel" },
            { text: fr ? "Déconnecter" : "Log out", style: "destructive", onPress: logout },
          ])}
          activeOpacity={0.85}
          style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: "rgba(248,113,113,0.3)", backgroundColor: isDark ? "rgba(248,113,113,0.08)" : "rgba(248,113,113,0.05)" }}
        >
          <Ionicons name="log-out-outline" size={18} color="#f87171" />
          <Text style={{ color: "#f87171", fontWeight: "800", fontSize: 15 }}>{fr ? "Déconnexion" : "Log out"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Row({ icon, label, onPress, accent, C, isDark, last }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: C.border }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(56,189,248,0.12)" : "rgba(2,132,199,0.08)" }}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text style={{ flex: 1, color: isDark ? "#f1f5f9" : "#0f172a", fontSize: 15, fontWeight: "600" }}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={C.muted} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "#1e293b", borderWidth: 2,
  },
  editBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#0a0a0a",
  },
  sectionTitle: {
    fontSize: 11, fontWeight: "800", letterSpacing: 1.2,
    textTransform: "uppercase", marginBottom: 8, marginTop: 4,
  },
  card: {
    borderRadius: 18, borderWidth: 1, marginBottom: 20,
    overflow: "hidden", shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
});
