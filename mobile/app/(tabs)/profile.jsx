import { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getMyProfile, updateMyProfile, updateDriverLicense, updateNationalId } from "../../src/api/user";
import { uploadAvatarFile, uploadListingImages } from "../../src/api/upload";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import ThemeToggle from "../../src/components/ThemeToggle";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";
import { alpha } from "../../src/theme";

const { width: SCREEN_W } = Dimensions.get("window");

const ROLES = {
  customer: { en: "Customer", fr: "Client" },
  seller: { en: "Seller", fr: "Vendeur" },
  rental_owner: { en: "Rental Owner", fr: "Propriétaire" },
  admin: { en: "Admin", fr: "Admin" },
};

function GlowOrb({ style, colors, scaleAnim }) {
  return (
    <Animated.View style={[{ position: "absolute", borderRadius: 999, opacity: 0.5 }, style, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
    </Animated.View>
  );
}

/** Soft rotating accent ring + breathing halo behind avatar */
function AvatarBackdrop({ C, spin, spinReverse, haloScale }) {
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const rotateRev = spinReverse.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] });
  return (
    <View style={{ position: "absolute", width: 124, height: 124, alignItems: "center", justifyContent: "center" }} pointerEvents="none">
      <Animated.View
        style={{
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: 60,
          transform: [{ rotate }, { scale: haloScale }],
          opacity: 0.9,
        }}
      >
        <LinearGradient
          colors={[`${C.primary}99`, `${C.accent}66`, `${C.primary}40`, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 120, height: 120, borderRadius: 60 }}
        />
      </Animated.View>
      <Animated.View
        style={{
          position: "absolute",
          width: 112,
          height: 112,
          borderRadius: 56,
          borderWidth: 2,
          borderColor: "rgba(255,255,255,0.06)",
          borderTopColor: C.primary,
          borderRightColor: C.accent,
          transform: [{ rotate: rotateRev }],
        }}
      />
    </View>
  );
}

function ProfileShimmer({ color, trackColor }) {
  const x = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(x, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(x, { toValue: -1, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [x]);
  const translateX = x.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_W * 0.45, SCREEN_W * 0.45],
  });
  return (
    <View style={{ height: 2, borderRadius: 1, overflow: "hidden", marginTop: 12, backgroundColor: trackColor }}>
      <Animated.View
        style={{
          width: "38%",
          height: "100%",
          backgroundColor: color,
          opacity: 0.85,
          borderRadius: 1,
          transform: [{ translateX }],
        }}
      />
    </View>
  );
}

/** Dark cards: no white glass gradient — slow primary/accent sweep */
function CardAmbientSheen({ C, progress }) {
  const tx = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_W * 0.62, SCREEN_W * 0.62],
  });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Animated.View
        style={{
          position: "absolute",
          top: -32,
          bottom: -32,
          width: SCREEN_W * 0.48,
          marginLeft: -(SCREEN_W * 0.24),
          left: "50%",
          opacity: 0.92,
          transform: [{ translateX: tx }, { rotate: "14deg" }],
        }}
      >
        <LinearGradient
          colors={["transparent", alpha(C.primary, 0.1), alpha(C.accent, 0.07), "transparent"]}
          locations={[0, 0.36, 0.64, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

function ProfileGlassCard({ isDark, C, sheenProgress, style, children, lightColors = ["#ffffff", "#f8fafc"] }) {
  if (isDark) {
    return (
      <View style={[style, { backgroundColor: C.card }]}>
        <CardAmbientSheen C={C} progress={sheenProgress} />
        {children}
      </View>
    );
  }
  return (
    <LinearGradient colors={lightColors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={style}>
      {children}
    </LinearGradient>
  );
}

function NavItem({ icon, label, onPress, C, isDark, titleColor, subColor, accent }) {
  const scale = useRef(new Animated.Value(1)).current;
  const c = accent || C.primary;
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start()}
    >
      <Animated.View
        style={[
          {
            transform: [{ scale }],
            borderRadius: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.85)",
            overflow: "hidden",
          },
        ]}
      >
        <LinearGradient
          colors={isDark ? ["rgba(124,107,255,0.1)", "transparent"] : ["rgba(98,72,232,0.06)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16, gap: 14 }}>
          <LinearGradient colors={[`${c}35`, `${c}12`]} style={{ width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={icon} size={20} color={c} />
          </LinearGradient>
          <Text style={{ color: titleColor, fontWeight: "600", flex: 1, fontSize: 15 }}>{label}</Text>
          <Ionicons name="chevron-forward" size={18} color={subColor} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { auth, logout } = useAuth();
  const { lang, setLang } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const subColor = isDark ? "#94a3b8" : "#64748b";
  const heroGrad = isDark ? ["#03040a", "#120a24", "#0a1628", "#05060f"] : ["#faf5ff", "#e0f2fe", "#f0f9ff", "#f8fafc"];
  const ctaGrad = isDark ? ["#7c6bff", "#5b4ddb", "#4338ca"] : ["#6248e8", "#4f46e5", "#4338ca"];
  const orbA = isDark ? ["rgba(124,107,255,0.5)", "rgba(124,107,255,0)"] : ["rgba(98,72,232,0.35)", "rgba(98,72,232,0)"];
  const orbB = isDark ? ["rgba(56,189,248,0.32)", "rgba(56,189,248,0)"] : ["rgba(14,165,233,0.28)", "rgba(14,165,233,0)"];

  const s = useMemo(() => createProfileStyles(C, isDark), [C, isDark]);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", bio: "" });
  const [licForm, setLicForm] = useState({ number: "", expiryDate: "", imageUrl: "" });
  const [cinForm, setCinForm] = useState({ number: "", imageUrl: "" });
  const [licSaving, setLicSaving] = useState(false);
  const [cinSaving, setCinSaving] = useState(false);
  const [licenseExpanded, setLicenseExpanded] = useState(false);
  const [cinExpanded, setCinExpanded] = useState(false);

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(18)).current;
  const orbPulse = useRef(new Animated.Value(1)).current;
  const avatarSpin = useRef(new Animated.Value(0)).current;
  const avatarSpinRev = useRef(new Animated.Value(0)).current;
  const avatarHalo = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    getMyProfile()
      .then(({ data }) => {
        setProfile(data);
        setForm({ name: data.name || "", city: data.city || "", bio: data.bio || "" });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [auth]);

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

  useEffect(() => {
    if (!profile || loading) return;
    heroOpacity.setValue(0);
    heroSlide.setValue(18);
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [profile, loading, heroOpacity, heroSlide]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.08, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 4500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [orbPulse]);

  useEffect(() => {
    const a = Animated.loop(Animated.timing(avatarSpin, { toValue: 1, duration: 14000, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [avatarSpin]);

  useEffect(() => {
    const b = Animated.loop(Animated.timing(avatarSpinRev, { toValue: 1, duration: 22000, easing: Easing.linear, useNativeDriver: true }));
    b.start();
    return () => b.stop();
  }, [avatarSpinRev]);

  useEffect(() => {
    const h = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarHalo, { toValue: 1.06, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(avatarHalo, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    h.start();
    return () => h.stop();
  }, [avatarHalo]);

  const cardSheen = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isDark) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cardSheen, { toValue: 1, duration: 5600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(cardSheen, { toValue: 0, duration: 5600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isDark, cardSheen]);

  const pickAvatar = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (r.canceled) return;
    try {
      const asset = r.assets[0];
      const url = await uploadAvatarFile({ uri: asset.uri, name: "avatar.jpg", type: asset.mimeType || "image/jpeg" });
      const { data } = await updateMyProfile({ avatar: url });
      setProfile(data);
    } catch {
      Alert.alert(fr ? "Échec" : "Failed to update avatar");
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await updateMyProfile(form);
      setProfile(data);
      setEditing(false);
    } catch {
      Alert.alert("Failed to save");
    }
    setSaving(false);
  };

  const handleLogout = () =>
    Alert.alert(fr ? "Déconnexion" : "Logout", fr ? "Êtes-vous sûr ?" : "Are you sure?", [
      { text: fr ? "Annuler" : "Cancel" },
      { text: fr ? "Déconnexion" : "Logout", style: "destructive", onPress: logout },
    ]);

  const pickDoc = async (applyUrl) => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.85,
    });
    if (r.canceled) return;
    try {
      const asset = r.assets[0];
      const [url] = await uploadListingImages([{ uri: asset.uri, name: "doc.jpg", type: asset.mimeType || "image/jpeg" }]);
      applyUrl(url);
    } catch (e) {
      const serverMsg = e?.response?.data?.message;
      Alert.alert(fr ? "Échec" : "Failed", serverMsg || (fr ? "Envoi de l'image impossible" : "Could not upload image"));
    }
  };

  const saveLicenseDoc = async () => {
    if (!licForm.number?.trim() || !licForm.imageUrl) {
      Alert.alert(fr ? "Permis incomplet" : "License incomplete", fr ? "Numéro et photo requis." : "Number and photo required.");
      return;
    }
    setLicSaving(true);
    try {
      const { data } = await updateDriverLicense({
        number: licForm.number.trim(),
        expiryDate: licForm.expiryDate || null,
        imageUrl: licForm.imageUrl,
      });
      setProfile(data);
      Alert.alert(fr ? "Enregistré" : "Saved", fr ? "Permis mis à jour." : "License updated.");
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || (fr ? "Échec" : "Failed"));
    }
    setLicSaving(false);
  };

  const saveCinDoc = async () => {
    if (!cinForm.number?.trim() || !cinForm.imageUrl) {
      Alert.alert(fr ? "CIN incomplet" : "ID incomplete", fr ? "Numéro et photo requis." : "Number and photo required.");
      return;
    }
    setCinSaving(true);
    try {
      const { data } = await updateNationalId({
        number: cinForm.number.trim(),
        imageUrl: cinForm.imageUrl,
      });
      setProfile(data);
      Alert.alert(fr ? "Enregistré" : "Saved", fr ? "CIN mis à jour." : "National ID updated.");
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || (fr ? "Échec" : "Failed"));
    }
    setCinSaving(false);
  };

  if (!auth) {
    return (
      <View style={[s.screenBg, { backgroundColor: C.bg }]}>
        <LinearGradient colors={heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.guestHero, { paddingTop: insets.top + 40 }]}>
          <GlowOrb scaleAnim={orbPulse} colors={orbA} style={{ width: 260, height: 260, top: -60, right: -70 }} />
          <GlowOrb scaleAnim={orbPulse} colors={orbB} style={{ width: 200, height: 200, bottom: 20, left: -80 }} />
          <Text style={[s.guestEyebrow, { color: C.primary }]}>{fr ? "Espace membre" : "Member space"}</Text>
          <Text style={[s.guestTitle, { color: titleColor }]}>Goo<Text style={{ fontStyle: "italic", color: C.primary, fontWeight: "800" }}>voiture</Text></Text>
          <Text style={[s.guestSub, { color: subColor }]}>
            {fr ? "Connectez-vous pour gérer profil, documents et préférences." : "Sign in to manage your profile, documents, and preferences."}
          </Text>
          <ProfileShimmer color={C.primary} trackColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"} />
          <View style={{ width: 100, height: 100, borderRadius: 36, alignItems: "center", justifyContent: "center", marginTop: 32, borderWidth: 2, borderColor: isDark ? "rgba(124,107,255,0.35)" : "rgba(98,72,232,0.28)", backgroundColor: isDark ? "rgba(124,107,255,0.08)" : "rgba(98,72,232,0.06)" }}>
            <Ionicons name="person-outline" size={48} color={C.primary} />
          </View>
        </LinearGradient>
        <View style={{ padding: 24, paddingBottom: insets.bottom + 24 }}>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")} activeOpacity={0.92}>
            <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.loginBtn}>
              <Text style={s.loginBtnText}>{fr ? "Connexion" : "Login"}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[s.center, { backgroundColor: C.bg }]}>
        <View style={s.loaderRing}>
          <ActivityIndicator color={C.primary} size="large" />
        </View>
        <Text style={[s.loaderText, { color: subColor }]}>{fr ? "Chargement du profil…" : "Loading profile…"}</Text>
      </View>
    );
  }

  const avatarUri = resolveMediaUrl(profile?.avatar);
  const avatarUrl = avatarUri ? { uri: avatarUri } : null;
  const shimmerTrack = isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)";

  const glassCard = {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? "rgba(124,107,255,0.2)" : "rgba(98,72,232,0.14)",
    overflow: "hidden",
    marginBottom: 14,
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 36 }}>
      <LinearGradient colors={heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingTop: insets.top + 8, paddingBottom: 16, overflow: "hidden" }}>
        <GlowOrb scaleAnim={orbPulse} colors={orbA} style={{ width: 200, height: 200, top: -70, right: -60 }} />
        <GlowOrb scaleAnim={orbPulse} colors={orbB} style={{ width: 160, height: 160, bottom: -20, left: -70 }} />
        <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroSlide }], alignItems: "center", paddingHorizontal: 20 }}>
          <Text style={{ color: C.primary, fontSize: 9, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
            {fr ? "Votre identité" : "Your identity"}
          </Text>
          <View style={{ width: 124, height: 124, alignItems: "center", justifyContent: "center", marginBottom: 2 }}>
            <AvatarBackdrop C={C} spin={avatarSpin} spinReverse={avatarSpinRev} haloScale={avatarHalo} />
            <Pressable onPress={pickAvatar} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1, zIndex: 2 }]}>
              <LinearGradient colors={ctaGrad} style={{ padding: 2, borderRadius: 46 }}>
                {avatarUrl ? (
                  <Image source={avatarUrl} style={{ width: 84, height: 84, borderRadius: 42 }} />
                ) : (
                  <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: isDark ? "#0f1123" : "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ color: C.primary, fontWeight: "800", fontSize: 32 }}>{profile?.name?.[0]?.toUpperCase() || "?"}</Text>
                  </View>
                )}
              </LinearGradient>
              <View style={[s.cameraBadge, { borderColor: isDark ? "#0a0c18" : "#fff", bottom: 2, right: 2 }]}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            </Pressable>
          </View>
          <Text style={{ color: titleColor, fontWeight: "800", fontSize: 20, marginTop: 10, letterSpacing: -0.4, textAlign: "center" }}>{profile?.name}</Text>
          <LinearGradient
            colors={isDark ? ["rgba(124,107,255,0.22)", "rgba(124,107,255,0.08)"] : ["rgba(98,72,232,0.18)", "rgba(98,72,232,0.06)"]}
            style={{ marginTop: 8, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: isDark ? "rgba(124,107,255,0.35)" : "rgba(98,72,232,0.25)" }}
          >
            <Text style={{ color: C.primary, fontSize: 11, fontWeight: "800", textTransform: "capitalize" }}>
              {ROLES[profile?.role]?.[lang] || profile?.role}
            </Text>
          </LinearGradient>
          {profile?.city ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 }}>
              <Ionicons name="location-outline" size={14} color={C.accent} />
              <Text style={{ color: subColor, fontSize: 13, fontWeight: "600" }}>{profile.city}</Text>
            </View>
          ) : null}
          {profile?.bio ? (
            <Text style={{ color: subColor, fontSize: 13, textAlign: "center", marginTop: 10, lineHeight: 19, maxWidth: 300, fontWeight: "500" }} numberOfLines={3}>
              {profile.bio}
            </Text>
          ) : null}
          <ProfileShimmer color={C.primary} trackColor={shimmerTrack} />
        </Animated.View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 18, marginTop: 4 }}>
        {editing ? (
          <ProfileGlassCard isDark={isDark} C={C} sheenProgress={cardSheen} style={[glassCard, { padding: 18 }]}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 10 }}>
              <LinearGradient colors={[`${C.primary}40`, `${C.primary}15`]} style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="create-outline" size={22} color={C.primary} />
              </LinearGradient>
              <Text style={{ color: titleColor, fontWeight: "800", fontSize: 17 }}>{fr ? "Modifier le profil" : "Edit profile"}</Text>
            </View>
            {[
              { k: "name", l: fr ? "Nom" : "Name", ic: "person-outline" },
              { k: "city", l: fr ? "Ville" : "City", ic: "location-outline" },
              { k: "bio", l: "Bio", ic: "document-text-outline", multi: true },
            ].map((f) => (
              <View key={f.k} style={{ marginBottom: 14 }}>
                <Text style={[s.fieldLabel, { color: C.label }]}>{f.l}</Text>
                <View style={[s.inputRow, { borderColor: C.border, backgroundColor: C.inputBg }, f.multi && { alignItems: "flex-start" }]}>
                  <Ionicons name={f.ic} size={16} color={C.muted} style={{ marginTop: f.multi ? 14 : 0 }} />
                  <TextInput
                    value={form[f.k]}
                    onChangeText={(v) => setForm((p) => ({ ...p, [f.k]: v }))}
                    multiline={f.multi}
                    numberOfLines={f.multi ? 3 : 1}
                    style={[s.input, { color: titleColor }, f.multi && { textAlignVertical: "top", minHeight: 80 }]}
                    placeholderTextColor={C.muted}
                  />
                </View>
              </View>
            ))}
            <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
              <TouchableOpacity onPress={() => setEditing(false)} style={[s.cancelBtn, { borderColor: C.border, backgroundColor: C.surface }]}>
                <Text style={[s.cancelText, { color: subColor }]}>{fr ? "Annuler" : "Cancel"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} disabled={saving} style={{ flex: 1 }}>
                <LinearGradient colors={ctaGrad} style={[s.saveBtnGrad, { flex: 1 }, saving && { opacity: 0.65 }]}>
                  <Text style={s.saveBtnText}>{saving ? "…" : fr ? "Sauvegarder" : "Save"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ProfileGlassCard>
        ) : (
          <NavItem
            icon="create-outline"
            label={fr ? "Modifier le profil" : "Edit profile"}
            onPress={() => setEditing(true)}
            C={C}
            isDark={isDark}
            titleColor={titleColor}
            subColor={subColor}
          />
        )}

        <Text style={[s.sectionEyebrow, { color: C.primary }]}>{fr ? "Documents location" : "Rental documents"}</Text>
        <Text style={[s.docHint, { color: subColor }]}>
          {fr
            ? "Appuyez sur une carte pour afficher le formulaire (permis et CIN)."
            : "Tap a card to show the form for your license and national ID."}
        </Text>

        <ProfileGlassCard isDark={isDark} C={C} sheenProgress={cardSheen} style={glassCard}>
          <Pressable
            onPress={() => setLicenseExpanded((v) => !v)}
            style={({ pressed }) => [{ padding: 16, opacity: pressed ? 0.92 : 1 }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <LinearGradient colors={["rgba(56,189,248,0.35)", "rgba(56,189,248,0.1)"]} style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="card-outline" size={22} color={C.accent} />
              </LinearGradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ color: titleColor, fontWeight: "800", fontSize: 16 }}>{fr ? "Permis de conduire" : "Driving license"}</Text>
                <Text style={{ color: subColor, fontSize: 12, marginTop: 4, fontWeight: "600" }}>
                  {profile?.driverLicense?.verified
                    ? fr
                      ? "Vérifié — touchez pour modifier"
                      : "Verified — tap to edit"
                    : profile?.driverLicense?.number
                      ? fr
                        ? "En attente — touchez pour compléter"
                        : "Pending — tap to update"
                      : fr
                        ? "Non renseigné — touchez pour remplir"
                        : "Not added — tap to fill in"}
                </Text>
              </View>
              <Ionicons name={licenseExpanded ? "chevron-up" : "chevron-down"} size={22} color={C.muted} />
            </View>
          </Pressable>
          {licenseExpanded ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingBottom: 18,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
              }}
            >
              {!!profile?.driverLicense?.verified && <Text style={[s.docVerified, { marginTop: 14 }]}>{fr ? "✓ Vérifié" : "✓ Verified"}</Text>}
              {!profile?.driverLicense?.verified && profile?.driverLicense?.number ? (
                <Text style={[s.docPending, { marginTop: 14 }]}>{fr ? "Vérification en attente" : "Pending verification"}</Text>
              ) : null}
              <Text style={[s.fieldLabel, { color: C.label, marginTop: 14 }]}>{fr ? "Numéro" : "Number"}</Text>
              <View style={[s.inputRow, { borderColor: C.border, backgroundColor: C.inputBg }]}>
                <Ionicons name="card-outline" size={16} color={C.muted} />
                <TextInput value={licForm.number} onChangeText={(v) => setLicForm((p) => ({ ...p, number: v }))} style={[s.input, { color: titleColor }]} placeholderTextColor={C.muted} placeholder={fr ? "ex. B-123456" : "e.g. B-123456"} />
              </View>
              <Text style={[s.fieldLabel, { color: C.label, marginTop: 12 }]}>{fr ? "Expiration (optionnel)" : "Expiry (optional)"}</Text>
              <View style={[s.inputRow, { borderColor: C.border, backgroundColor: C.inputBg }]}>
                <Ionicons name="calendar-outline" size={16} color={C.muted} />
                <TextInput value={licForm.expiryDate} onChangeText={(v) => setLicForm((p) => ({ ...p, expiryDate: v }))} style={[s.input, { color: titleColor }]} placeholderTextColor={C.muted} placeholder="YYYY-MM-DD" />
              </View>
              <Text style={[s.fieldLabel, { color: C.label, marginTop: 12 }]}>{fr ? "Photo du permis" : "License photo"}</Text>
              <TouchableOpacity onPress={() => pickDoc((url) => setLicForm((p) => ({ ...p, imageUrl: url })))} style={[s.docPick, { borderColor: C.border, backgroundColor: C.surface }]}>
                {licForm.imageUrl ? (
                  <Image source={{ uri: resolveMediaUrl(licForm.imageUrl) }} style={s.docThumb} />
                ) : (
                  <View style={{ alignItems: "center", padding: 24 }}>
                    <Ionicons name="image-outline" size={32} color={C.muted} />
                    <Text style={[s.docPickText, { color: subColor, marginTop: 8 }]}>{fr ? "Choisir une photo" : "Choose photo"}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={saveLicenseDoc} disabled={licSaving} activeOpacity={0.9}>
                <LinearGradient colors={ctaGrad} style={[s.saveBtnGrad, { marginTop: 14 }, licSaving && { opacity: 0.65 }]}>
                  <Text style={s.saveBtnText}>{licSaving ? "…" : fr ? "Enregistrer le permis" : "Save license"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : null}
        </ProfileGlassCard>

        <ProfileGlassCard isDark={isDark} C={C} sheenProgress={cardSheen} style={glassCard}>
          <Pressable
            onPress={() => setCinExpanded((v) => !v)}
            style={({ pressed }) => [{ padding: 16, opacity: pressed ? 0.92 : 1 }]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <LinearGradient colors={["rgba(167,139,250,0.35)", "rgba(167,139,250,0.1)"]} style={{ width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="id-card-outline" size={22} color="#a78bfa" />
              </LinearGradient>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ color: titleColor, fontWeight: "800", fontSize: 16 }}>{fr ? "CIN (carte d'identité)" : "National ID (CIN)"}</Text>
                <Text style={{ color: subColor, fontSize: 12, marginTop: 4, fontWeight: "600" }}>
                  {profile?.nationalId?.verified
                    ? fr
                      ? "Vérifié — touchez pour modifier"
                      : "Verified — tap to edit"
                    : profile?.nationalId?.number
                      ? fr
                        ? "En attente — touchez pour compléter"
                        : "Pending — tap to update"
                      : fr
                        ? "Non renseigné — touchez pour remplir"
                        : "Not added — tap to fill in"}
                </Text>
              </View>
              <Ionicons name={cinExpanded ? "chevron-up" : "chevron-down"} size={22} color={C.muted} />
            </View>
          </Pressable>
          {cinExpanded ? (
            <View
              style={{
                paddingHorizontal: 16,
                paddingBottom: 18,
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
              }}
            >
              {!!profile?.nationalId?.verified && <Text style={[s.docVerified, { marginTop: 14 }]}>{fr ? "✓ Vérifié" : "✓ Verified"}</Text>}
              {!profile?.nationalId?.verified && profile?.nationalId?.number ? (
                <Text style={[s.docPending, { marginTop: 14 }]}>{fr ? "Vérification en attente" : "Pending verification"}</Text>
              ) : null}
              <Text style={[s.fieldLabel, { color: C.label, marginTop: 14 }]}>{fr ? "Numéro CIN" : "ID number"}</Text>
              <View style={[s.inputRow, { borderColor: C.border, backgroundColor: C.inputBg }]}>
                <Ionicons name="id-card-outline" size={16} color={C.muted} />
                <TextInput value={cinForm.number} onChangeText={(v) => setCinForm((p) => ({ ...p, number: v }))} style={[s.input, { color: titleColor }]} placeholderTextColor={C.muted} placeholder={fr ? "ex. AB123456" : "e.g. AB123456"} />
              </View>
              <Text style={[s.fieldLabel, { color: C.label, marginTop: 12 }]}>{fr ? "Photo CIN" : "ID photo"}</Text>
              <TouchableOpacity onPress={() => pickDoc((url) => setCinForm((p) => ({ ...p, imageUrl: url })))} style={[s.docPick, { borderColor: C.border, backgroundColor: C.surface }]}>
                {cinForm.imageUrl ? (
                  <Image source={{ uri: resolveMediaUrl(cinForm.imageUrl) }} style={s.docThumb} />
                ) : (
                  <View style={{ alignItems: "center", padding: 24 }}>
                    <Ionicons name="image-outline" size={32} color={C.muted} />
                    <Text style={[s.docPickText, { color: subColor, marginTop: 8 }]}>{fr ? "Choisir une photo" : "Choose photo"}</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCinDoc} disabled={cinSaving} activeOpacity={0.9}>
                <LinearGradient colors={ctaGrad} style={[s.saveBtnGrad, { marginTop: 14 }, cinSaving && { opacity: 0.65 }]}>
                  <Text style={s.saveBtnText}>{cinSaving ? "…" : fr ? "Enregistrer le CIN" : "Save national ID"}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : null}
        </ProfileGlassCard>

        <Text style={[s.sectionEyebrow, { color: C.accent, marginTop: 8 }]}>{fr ? "Navigation" : "Shortcuts"}</Text>
        <NavItem icon="notifications-outline" label={fr ? "Notifications" : "Notifications"} onPress={() => router.push("/notifications")} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} />
        {auth.role === "customer" && (
          <NavItem icon="calendar-outline" label={fr ? "Mes réservations" : "My Bookings"} onPress={() => router.push("/my-bookings")} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} />
        )}
        {auth.role === "seller" && (
          <>
            <NavItem icon="list-outline" label={fr ? "Mes annonces" : "My Sales"} onPress={() => router.push("/my-sales")} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} />
            <NavItem icon="add-circle-outline" label={fr ? "Nouvelle annonce" : "New Listing"} onPress={() => router.push("/new-sale")} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} accent={C.accent} />
          </>
        )}
        {auth.role === "rental_owner" && (
          <>
            <NavItem icon="analytics-outline" label={fr ? "Statistiques & analyses" : "Analytics & insights"} onPress={() => router.push("/owner-analytics")} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} accent={C.accent} />
            <NavItem icon="car-outline" label={fr ? "Mon parc" : "My Fleet"} onPress={() => router.push("/my-fleet")} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} />
            <NavItem icon="construct-outline" label={fr ? "Maintenance" : "Maintenance"} onPress={() => router.push("/maintenance")} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} />
            <NavItem icon="clipboard-outline" label={fr ? "Réservations" : "Bookings"} onPress={() => router.push("/owner-bookings")} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} />
            <NavItem icon="add-circle-outline" label={fr ? "Ajouter location" : "Add Rental"} onPress={() => router.push("/add-rental")} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} accent={C.accent} />
          </>
        )}
        {auth.role === "admin" && (
          <NavItem icon="shield-checkmark-outline" label={fr ? "Modération admin" : "Admin Moderation"} onPress={() => router.push("/admin-moderation")} C={C} isDark={isDark} titleColor={titleColor} subColor={subColor} accent={C.accent} />
        )}

        <Text style={[s.sectionEyebrow, { color: C.primary, marginTop: 10 }]}>{fr ? "Langue & apparence" : "Language & appearance"}</Text>
        <ProfileGlassCard
          isDark={isDark}
          C={C}
          sheenProgress={cardSheen}
          style={[glassCard, { padding: 16, marginBottom: 12 }]}
          lightColors={["#ffffff", "#f1f5f9"]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Text style={{ color: titleColor, fontWeight: "700", fontSize: 14 }}>{fr ? "Thème" : "Theme"}</Text>
            <View style={{ borderRadius: 14, borderWidth: 1, borderColor: isDark ? "rgba(124,107,255,0.25)" : "rgba(98,72,232,0.2)", backgroundColor: isDark ? "rgba(124,107,255,0.08)" : "rgba(98,72,232,0.06)" }}>
              <ThemeToggle />
            </View>
          </View>
          <Text style={{ color: subColor, fontSize: 12, marginBottom: 10, fontWeight: "600" }}>{fr ? "Langue" : "Language"}</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {["en", "fr"].map((l) => {
              const on = lang === l;
              return (
                <TouchableOpacity key={l} onPress={() => setLang(l)} style={{ flex: 1 }} activeOpacity={0.88}>
                  {on ? (
                    <LinearGradient colors={ctaGrad} style={{ borderRadius: 14, paddingVertical: 14, alignItems: "center" }}>
                      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>{l === "en" ? "English" : "Français"}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={{ borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: C.border, backgroundColor: C.inputBg }}>
                      <Text style={{ color: subColor, fontWeight: "700", fontSize: 14 }}>{l === "en" ? "English" : "Français"}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ProfileGlassCard>

        <TouchableOpacity onPress={handleLogout} activeOpacity={0.9} style={{ marginTop: 6 }}>
          <LinearGradient
            colors={["rgba(239,68,68,0.12)", "rgba(239,68,68,0.04)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.35)",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 16,
              gap: 10,
            }}
          >
            <Ionicons name="log-out-outline" size={22} color={C.red} />
            <Text style={{ color: C.red, fontWeight: "800", fontSize: 15 }}>{fr ? "Déconnexion" : "Logout"}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function createProfileStyles(C, isDark) {
  return StyleSheet.create({
    screenBg: { flex: 1 },
    guestHero: { paddingHorizontal: 24, paddingBottom: 28, overflow: "hidden", minHeight: 340 },
    guestEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
    guestTitle: { fontSize: 32, fontWeight: "800", letterSpacing: -0.8 },
    guestSub: { fontSize: 15, lineHeight: 23, marginTop: 12, fontWeight: "500", maxWidth: 320 },
    loginBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 16,
      borderRadius: 16,
      shadowColor: "#7c6bff",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.4 : 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    loginBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
    loaderRing: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: isDark ? "rgba(124,107,255,0.3)" : "rgba(98,72,232,0.25)",
      backgroundColor: isDark ? "rgba(124,107,255,0.05)" : "rgba(98,72,232,0.04)",
    },
    loaderText: { marginTop: 16, fontSize: 14, fontWeight: "600" },
    cameraBadge: {
      position: "absolute",
      bottom: 4,
      right: 4,
      backgroundColor: C.primary,
      borderRadius: 14,
      padding: 6,
      borderWidth: 2,
    },
    fieldLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8, fontWeight: "700" },
    inputRow: { borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
    input: { flex: 1, paddingVertical: 14, marginLeft: 8, fontSize: 15 },
    cancelBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1 },
    cancelText: { fontWeight: "700", fontSize: 15 },
    saveBtnGrad: { borderRadius: 14, paddingVertical: 15, alignItems: "center" },
    saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    sectionEyebrow: {
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 2,
      textTransform: "uppercase",
      marginTop: 20,
      marginBottom: 10,
    },
    docHint: { fontSize: 13, lineHeight: 20, marginBottom: 14, fontWeight: "500" },
    docVerified: { color: "#4ade80", fontSize: 12, fontWeight: "800", marginBottom: 10 },
    docPending: { color: "#fbbf24", fontSize: 12, fontWeight: "700", marginBottom: 10 },
    docPick: { borderWidth: 1, borderRadius: 16, minHeight: 120, overflow: "hidden" },
    docPickText: { fontSize: 14, fontWeight: "600" },
    docThumb: { width: "100%", height: 168, resizeMode: "cover" },
  });
}
