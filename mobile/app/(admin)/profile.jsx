import { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import ThemeToggle from "../../src/components/ThemeToggle";

export default function AdminProfileScreen() {
  const { auth, logout } = useAuth();
  const { lang, setLang } = useAppLang();
  const toggleLang = () => setLang(lang === "fr" ? "en" : "fr");
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = useMemo(() => createStyles(C, isDark), [C, isDark]);

  const orbPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(orbPulse, { toValue: 1.12, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(orbPulse, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const accent = isDark ? "#f87171" : "#dc2626";
  const heroGrad = isDark
    ? ["#0a0406", "#110305", "#05060f"]
    : ["#fff1f2", "#ffe4e6", "#f8fafc"];

  const name = auth?.name || auth?.email?.split("@")[0] || "Admin";
  const email = auth?.email || "—";
  const initials = name.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    Alert.alert(
      fr ? "Déconnexion" : "Log out",
      fr ? "Voulez-vous vraiment vous déconnecter ?" : "Are you sure you want to log out?",
      [
        { text: fr ? "Annuler" : "Cancel", style: "cancel" },
        { text: fr ? "Déconnexion" : "Log out", style: "destructive", onPress: logout },
      ]
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient colors={heroGrad} style={{ paddingTop: insets.top + 12, paddingBottom: 28, paddingHorizontal: 22, overflow: "hidden" }}>
        <Animated.View style={{ position: "absolute", width: 220, height: 220, top: -70, right: -70, borderRadius: 999, opacity: 0.3, transform: [{ scale: orbPulse }] }}>
          <LinearGradient
            colors={isDark ? ["rgba(248,113,113,0.5)", "rgba(248,113,113,0)"] : ["rgba(220,38,38,0.2)", "rgba(220,38,38,0)"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Avatar */}
        <View style={[s.avatarWrap, { borderColor: `${accent}40` }]}>
          <LinearGradient colors={isDark ? ["#f87171", "#ef4444"] : ["#dc2626", "#b91c1c"]} style={s.avatarGrad}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 26 }}>{initials}</Text>
          </LinearGradient>
        </View>

        <Text style={{ fontSize: 20, fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", marginTop: 14, letterSpacing: -0.3 }}>
          {name}
        </Text>
        <Text style={{ fontSize: 13, color: isDark ? "#94a3b8" : "#475569", marginTop: 2, fontWeight: "500" }}>
          {email}
        </Text>

        {/* Role badge */}
        <View style={[s.roleBadge, { backgroundColor: `${accent}18`, borderColor: `${accent}35` }]}>
          <Ionicons name="shield-checkmark-outline" size={12} color={accent} />
          <Text style={{ color: accent, fontWeight: "800", fontSize: 10, letterSpacing: 1.2 }}>
            {fr ? "ADMINISTRATEUR" : "ADMINISTRATOR"}
          </Text>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 20 }}>
        {/* Moderation section */}
        <SectionCard title={fr ? "MODÉRATION" : "MODERATION"} isDark={isDark} C={C}>
          <Row
            icon="list-outline"
            label={fr ? "Modérer les annonces" : "Moderate listings"}
            accent={accent}
            C={C} isDark={isDark}
            onPress={() => router.push("/(admin)/listings")}
          />
          <Row
            icon="people-outline"
            label={fr ? "Gérer les utilisateurs" : "Manage users"}
            accent={accent}
            C={C} isDark={isDark}
            onPress={() => router.push("/(admin)/users")}
          />
        </SectionCard>

        {/* Stats / platform section */}
        <SectionCard title={fr ? "PLATEFORME" : "PLATFORM"} isDark={isDark} C={C}>
          <Row
            icon="stats-chart-outline"
            label={fr ? "Statistiques" : "Platform stats"}
            accent={accent}
            C={C} isDark={isDark}
            onPress={() => router.push("/(admin)")}
          />
        </SectionCard>

        {/* Preferences */}
        <SectionCard title={fr ? "PRÉFÉRENCES" : "PREFERENCES"} isDark={isDark} C={C}>
          <View style={s.prefRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[s.iconWrap, { backgroundColor: `${accent}15` }]}>
                <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={16} color={accent} />
              </View>
              <Text style={[s.rowLabel, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>
                {fr ? "Thème sombre" : "Dark mode"}
              </Text>
            </View>
            <ThemeToggle />
          </View>

          <View style={[s.separator, { backgroundColor: C.border }]} />

          <TouchableOpacity onPress={toggleLang} activeOpacity={0.75} style={s.prefRow}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={[s.iconWrap, { backgroundColor: `${accent}15` }]}>
                <Ionicons name="language-outline" size={16} color={accent} />
              </View>
              <Text style={[s.rowLabel, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>
                {fr ? "Langue" : "Language"}
              </Text>
            </View>
            <View style={[s.langBadge, { backgroundColor: `${accent}15`, borderColor: `${accent}30` }]}>
              <Text style={{ color: accent, fontWeight: "800", fontSize: 11 }}>{lang === "fr" ? "FR" : "EN"}</Text>
            </View>
          </TouchableOpacity>
        </SectionCard>

        {/* Account info */}
        <SectionCard title={fr ? "COMPTE" : "ACCOUNT"} isDark={isDark} C={C}>
          <View style={s.infoRow}>
            <Text style={[s.infoLabel, { color: C.muted }]}>{fr ? "Nom" : "Name"}</Text>
            <Text style={[s.infoValue, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>{auth?.name || "—"}</Text>
          </View>
          <View style={[s.separator, { backgroundColor: C.border }]} />
          <View style={s.infoRow}>
            <Text style={[s.infoLabel, { color: C.muted }]}>Email</Text>
            <Text style={[s.infoValue, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>{auth?.email || "—"}</Text>
          </View>
          <View style={[s.separator, { backgroundColor: C.border }]} />
          <View style={s.infoRow}>
            <Text style={[s.infoLabel, { color: C.muted }]}>{fr ? "Rôle" : "Role"}</Text>
            <Text style={[s.infoValue, { color: accent, fontWeight: "800" }]}>
              {fr ? "Administrateur" : "Administrator"}
            </Text>
          </View>
        </SectionCard>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} activeOpacity={0.8} style={[s.logoutBtn, { borderColor: `${accent}35` }]}>
          <Ionicons name="log-out-outline" size={18} color={accent} />
          <Text style={{ color: accent, fontWeight: "800", fontSize: 14 }}>
            {fr ? "Déconnexion" : "Log out"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function SectionCard({ title, isDark, C, children }) {
  return (
    <View>
      <Text style={{ fontSize: 10, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase", color: isDark ? "#94a3b8" : "#475569", marginBottom: 8 }}>
        {title}
      </Text>
      <View style={{ borderRadius: 18, borderWidth: 1, borderColor: C.border, backgroundColor: C.card, overflow: "hidden" }}>
        {children}
      </View>
    </View>
  );
}

function Row({ icon, label, accent, C, isDark, onPress, badge }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: `${accent}15`, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: isDark ? "#f1f5f9" : "#0f172a" }}>{label}</Text>
      {badge ? (
        <View style={{ backgroundColor: `${accent}15`, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ color: accent, fontWeight: "800", fontSize: 11 }}>{badge}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={C.muted} />
      )}
    </TouchableOpacity>
  );
}

function createStyles(C, isDark) {
  return StyleSheet.create({
    avatarWrap: {
      width: 80, height: 80, borderRadius: 40, borderWidth: 2,
      shadowColor: "#dc2626", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
    },
    avatarGrad: {
      width: "100%", height: "100%", borderRadius: 40, alignItems: "center", justifyContent: "center",
    },
    roleBadge: {
      flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start",
      borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, marginTop: 10,
    },
    prefRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 16, paddingVertical: 14,
    },
    iconWrap: {
      width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center",
    },
    rowLabel: { fontSize: 14, fontWeight: "600" },
    separator: { height: 1, marginLeft: 58 },
    langBadge: {
      borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4,
    },
    infoRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      paddingHorizontal: 16, paddingVertical: 13,
    },
    infoLabel: { fontSize: 13, fontWeight: "500" },
    infoValue: { fontSize: 13, fontWeight: "600", maxWidth: "60%", textAlign: "right" },
    logoutBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
      borderRadius: 16, borderWidth: 1, paddingVertical: 15,
    },
  });
}
