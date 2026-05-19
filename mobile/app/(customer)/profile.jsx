import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
import { useRouter, useFocusEffect } from "expo-router";
import { getMyProfile } from "../../src/api/user";
import { getMySales } from "../../src/api/sale";
import { uploadAvatarFile } from "../../src/api/upload";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import ThemeToggle from "../../src/components/ThemeToggle";
import ProfileDocumentsSection from "../../src/components/ProfileDocumentsSection";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";
import RoleModeSwitcher from "../../src/components/RoleModeSwitcher";
import { profileDocumentsHref, messagesHref } from "../../src/utils/appNavigation";
import { useActiveMode } from "../../src/context/ActiveModeContext";
import {
  userCanRentWithDocuments,
  userHasCinOnFile,
  userHasApprovedSale,
} from "../../src/utils/profileDocuments";

export default function CustomerProfileScreen() {
  const { auth, logout } = useAuth();
  const { lang, setLang } = useAppLang();
  const toggleLang = () => setLang(lang === "fr" ? "en" : "fr");
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { activeMode } = useActiveMode();
  const s = useMemo(() => createStyles(C, isDark), [C, isDark]);

  const [profile, setProfile] = useState(null);
  const [sales, setSales] = useState([]);
  const orbPulse = useRef(new Animated.Value(1)).current;

  const load = () => {
    getMyProfile()
      .then((r) => setProfile(r.data))
      .catch(() => {});
    getMySales()
      .then((r) => setSales(Array.isArray(r.data) ? r.data : []))
      .catch(() => setSales([]));
  };

  useFocusEffect(useCallback(() => {
    load();
  }, []));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [orbPulse]);

  const canRent = userCanRentWithDocuments(profile);
  const hasApprovedSale = userHasApprovedSale(sales);
  const hasPendingSale = sales.some((x) => x?.status === "pending");
  const hasAnySale = sales.length > 0;

  const pickAvatar = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled && result.assets?.[0]) {
      try {
        await uploadAvatarFile(result.assets[0]);
        load();
      } catch {
        Alert.alert(fr ? "Échec du téléchargement" : "Upload failed");
      }
    }
  };

  const startSellFlow = () => {
    if (!userHasCinOnFile(profile)) {
      router.push({ pathname: "/verify-cin", params: { purpose: "sell", return: "new-sale" } });
      return;
    }
    router.push("/new-sale");
  };

  const avatarUrl = resolveMediaUrl(profile?.avatar);
  const heroGrad = isDark
    ? ["#03040a", "#120a24", "#0a1628", "#05060f"]
    : ["#faf5ff", "#e0f2fe", "#f0f9ff", "#f8fafc"];
  const ctaGrad = isDark ? ["#7c6bff", "#5b4ddb"] : ["#6248e8", "#4f46e5"];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={heroGrad} style={[s.hero, { paddingTop: insets.top + 12 }]}>
        <Animated.View style={{ position: "absolute", width: 200, height: 200, top: -60, right: -60, borderRadius: 999, opacity: 0.4, transform: [{ scale: orbPulse }] }}>
          <LinearGradient
            colors={isDark ? ["rgba(124,107,255,0.5)", "rgba(124,107,255,0)"] : ["rgba(98,72,232,0.25)", "rgba(98,72,232,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <View style={s.heroRow}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85} style={s.avatarWrap}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={s.avatar} />
            ) : (
              <LinearGradient colors={ctaGrad} style={s.avatar}>
                <Text style={s.avatarInitial}>{(profile?.name || auth?.name || "?")[0].toUpperCase()}</Text>
              </LinearGradient>
            )}
            <View style={[s.avatarEditBadge, { backgroundColor: C.primary }]}>
              <Ionicons name="camera-outline" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={s.name} numberOfLines={1}>{profile?.name || auth?.name || "—"}</Text>
            <Text style={s.email} numberOfLines={1}>{profile?.email || auth?.email || "—"}</Text>
            <View style={s.roleBadge}>
              <LinearGradient colors={ctaGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.roleBadgeInner}>
                <Ionicons name="person-outline" size={11} color="#fff" />
                <Text style={s.roleBadgeText}>{fr ? "CLIENT" : "CUSTOMER"}</Text>
              </LinearGradient>
            </View>
          </View>

          <ThemeToggle />
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <RoleModeSwitcher fr={fr} />

        {!canRent && (
          <TouchableOpacity
            onPress={() => router.push(profileDocumentsHref())}
            activeOpacity={0.88}
            style={[s.verifyBanner, { borderColor: isDark ? "rgba(245,158,11,0.5)" : "rgba(245,158,11,0.4)", backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.07)" }]}
          >
            <Ionicons name="car-outline" size={24} color="#f59e0b" />
            <View style={{ flex: 1 }}>
              <Text style={[s.verifyTitle, { color: "#f59e0b" }]}>
                {fr ? "Pour louer une voiture" : "To rent a car"}
              </Text>
              <Text style={[s.verifySub, { color: isDark ? "#fcd34d" : "#92400e" }]}>
                {fr
                  ? "Ajoutez votre permis de conduire et votre CIN (carte d'identité)."
                  : "Add your driving license and national ID (CIN)."}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#f59e0b" />
          </TouchableOpacity>
        )}

        {canRent && (
          <View style={[s.verifyBanner, { borderColor: isDark ? "rgba(52,211,153,0.4)" : "rgba(52,211,153,0.3)", backgroundColor: isDark ? "rgba(52,211,153,0.1)" : "rgba(52,211,153,0.06)" }]}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#34d399" />
            <View style={{ flex: 1 }}>
              <Text style={[s.verifyTitle, { color: "#34d399" }]}>
                {fr ? "Prêt à louer" : "Ready to rent"}
              </Text>
              <Text style={[s.verifySub, { color: isDark ? "#6ee7b7" : "#065f46" }]}>
                {fr ? "Permis et CIN enregistrés." : "License and ID on file."}
              </Text>
            </View>
          </View>
        )}

        <Text style={s.sectionTitle}>{fr ? "Mes documents" : "My documents"}</Text>
        <Text style={[s.sectionHint, { color: isDark ? "#94a3b8" : "#64748b" }]}>
          {fr
            ? "Vous pouvez les remplir maintenant, avant de louer ou de vendre."
            : "You can upload them anytime, before renting or selling."}
        </Text>
        <ProfileDocumentsSection
          profile={profile}
          onProfileChange={(data) => {
            setProfile(data);
            load();
          }}
          fr={fr}
          C={C}
          isDark={isDark}
        />

        <Text style={[s.sectionTitle, { marginTop: 8 }]}>{fr ? "Vendre ma voiture" : "Sell my car"}</Text>
        <TouchableOpacity onPress={startSellFlow} activeOpacity={0.9} style={{ marginBottom: 12 }}>
          <LinearGradient colors={ctaGrad} style={s.sellCta}>
            <Ionicons name="pricetag-outline" size={22} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={s.sellCtaTitle}>{fr ? "Publier une annonce de vente" : "Post a car for sale"}</Text>
              <Text style={s.sellCtaSub}>
                {fr ? "CIN uniquement · validation admin sous 24–48h" : "CIN only · admin approval within 24–48h"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {hasPendingSale && !hasApprovedSale && (
          <Text style={[s.pendingHint, { color: C.amber || "#f59e0b" }]}>
            {fr
              ? "Votre annonce est en attente d'approbation. L'onglet « Mes ventes » apparaîtra une fois validée."
              : "Your listing is pending approval. The « My cars » tab will appear once approved."}
          </Text>
        )}

        {hasAnySale && (
          <View style={s.card}>
            <Row
              icon="list-outline"
              label={fr ? "Mes voitures en vente" : "My cars for sale"}
              onPress={() => (hasApprovedSale ? router.push("/(customer)/my-cars") : router.push("/my-sales"))}
              C={C}
              badge={hasApprovedSale ? "ok" : "warn"}
            />
          </View>
        )}

        <Text style={s.sectionTitle}>{fr ? "Réservations" : "Bookings"}</Text>
        <View style={s.card}>
          <Row icon="calendar-outline" label={fr ? "Mes réservations" : "My bookings"} onPress={() => router.push("/(customer)/bookings")} C={C} />
          <Row icon="chatbubble-outline" label={fr ? "Messages" : "Messages"} onPress={() => router.push(messagesHref(activeMode))} C={C} last />
        </View>

        <Text style={s.sectionTitle}>{fr ? "Préférences" : "Preferences"}</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View style={[s.rowIcon, { backgroundColor: isDark ? "rgba(124,107,255,0.15)" : "rgba(98,72,232,0.1)" }]}>
              <Ionicons name="moon-outline" size={18} color={C.primary} />
            </View>
            <Text style={s.rowLabel}>{fr ? "Thème sombre" : "Dark mode"}</Text>
            <ThemeToggle />
          </View>
          <TouchableOpacity onPress={toggleLang} style={[s.row, s.rowLast]} activeOpacity={0.8}>
            <View style={[s.rowIcon, { backgroundColor: isDark ? "rgba(56,189,248,0.15)" : "rgba(2,132,199,0.1)" }]}>
              <Ionicons name="language-outline" size={18} color={isDark ? "#38bdf8" : "#0284c7"} />
            </View>
            <Text style={s.rowLabel}>{fr ? "Langue" : "Language"}</Text>
            <Text style={[s.rowValue, { color: isDark ? "#94a3b8" : "#64748b" }]}>{fr ? "Français" : "English"}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(fr ? "Déconnexion" : "Log out", fr ? "Voulez-vous vous déconnecter ?" : "Are you sure you want to log out?", [
              { text: fr ? "Annuler" : "Cancel", style: "cancel" },
              { text: fr ? "Déconnecter" : "Log out", style: "destructive", onPress: logout },
            ])
          }
          activeOpacity={0.85}
          style={s.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={18} color="#f87171" />
          <Text style={s.logoutText}>{fr ? "Déconnexion" : "Log out"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Row({ icon, label, onPress, C, badge, last }) {
  const { isDark } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: C.border,
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(124,107,255,0.12)" : "rgba(99,102,241,0.08)" }}>
        <Ionicons name={icon} size={18} color={C.primary} />
      </View>
      <Text style={{ flex: 1, color: isDark ? "#f1f5f9" : "#0f172a", fontSize: 15, fontWeight: "600" }}>{label}</Text>
      {badge === "ok" && <Ionicons name="checkmark-circle" size={18} color="#34d399" />}
      {badge === "warn" && <Ionicons name="time-outline" size={18} color="#f59e0b" />}
      <Ionicons name="chevron-forward" size={16} color={C.muted} />
    </TouchableOpacity>
  );
}

function createStyles(C, isDark) {
  return StyleSheet.create({
    hero: { paddingBottom: 24, paddingHorizontal: 20, overflow: "hidden" },
    heroRow: { flexDirection: "row", alignItems: "center", gap: 14 },
    avatarWrap: { position: "relative" },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.surface,
      borderWidth: 2,
      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
    },
    avatarInitial: { color: "#fff", fontSize: 28, fontWeight: "800" },
    avatarEditBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: isDark ? "#0a0a0a" : "#fff",
    },
    name: { color: isDark ? "#f8fafc" : "#0f172a", fontSize: 18, fontWeight: "800", letterSpacing: -0.3, marginBottom: 2 },
    email: { color: isDark ? "#94a3b8" : "#64748b", fontSize: 13, fontWeight: "500", marginBottom: 8 },
    roleBadge: {},
    roleBadgeInner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    roleBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
    verifyBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 20,
    },
    verifyTitle: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
    verifySub: { fontSize: 12, lineHeight: 17, fontWeight: "500" },
    sectionTitle: {
      color: isDark ? "#94a3b8" : "#475569",
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1.2,
      textTransform: "uppercase",
      marginBottom: 8,
    },
    sectionHint: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
    sellCta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      padding: 18,
      borderRadius: 16,
    },
    sellCtaTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },
    sellCtaSub: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 4 },
    pendingHint: { fontSize: 12, marginBottom: 16, lineHeight: 17 },
    card: {
      backgroundColor: C.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 20,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    rowLast: { borderBottomWidth: 0 },
    rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    rowLabel: { flex: 1, color: isDark ? "#f1f5f9" : "#0f172a", fontSize: 15, fontWeight: "600" },
    rowValue: { fontSize: 14, fontWeight: "600" },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(248,113,113,0.3)",
      backgroundColor: isDark ? "rgba(248,113,113,0.08)" : "rgba(248,113,113,0.05)",
    },
    logoutText: { color: "#f87171", fontWeight: "800", fontSize: 15 },
  });
}
