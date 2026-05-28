import { useMemo } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

const permSt = StyleSheet.create({
  badge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1,
  },
  label: { fontSize: 13, fontWeight: "600" },
});

function PermBadge({ label, granted, C, isDark }) {
  return (
    <View style={[
      permSt.badge,
      {
        backgroundColor: granted
          ? (isDark ? "rgba(52,211,153,0.15)" : "rgba(52,211,153,0.1)")
          : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
        borderColor: granted
          ? (isDark ? "rgba(52,211,153,0.3)" : "rgba(52,211,153,0.25)")
          : C.border,
      },
    ]}>
      <Ionicons
        name={granted ? "checkmark-circle" : "close-circle-outline"}
        size={14}
        color={granted ? "#34d399" : C.muted}
      />
      <Text style={[permSt.label, { color: granted ? (isDark ? "#6ee7b7" : "#065f46") : C.muted }]}>
        {label}
      </Text>
    </View>
  );
}

export default function StaffProfile() {
  const { auth, logout } = useAuth();
  const { lang, setLang, pick } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";

  const perms = auth?.staffPermissions || {};

  const styles = useMemo(() => createStyles(C, isDark), [C, isDark]);

  const heroGrad = isDark
    ? ["#03040a", "#120a24", "#0a1628", "#05060f"]
    : ["#faf5ff", "#e0f2fe", "#f0f9ff", "#f8fafc"];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient colors={heroGrad} style={[styles.hero, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroRow}>
          <LinearGradient colors={["#7c3aed", "#5b21b6"]} style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{(auth?.name || "S")[0].toUpperCase()}</Text>
          </LinearGradient>

          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={[styles.name, { color: isDark ? "#f8fafc" : "#0f172a" }]} numberOfLines={1}>
              {auth?.name || "—"}
            </Text>
            <Text style={[styles.email, { color: isDark ? "#94a3b8" : "#64748b" }]} numberOfLines={1}>
              {auth?.email || "—"}
            </Text>
            <LinearGradient colors={["#7c3aed", "#5b21b6"]} style={styles.staffBadge}>
              <Ionicons name="people-outline" size={11} color="#fff" />
              <Text style={styles.staffBadgeText}>STAFF</Text>
            </LinearGradient>
          </View>

          <ThemeToggle />
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Text style={[styles.section, { color: isDark ? "#94a3b8" : "#475569" }]}>
          {pick("Granted access", "Accès accordés")}
        </Text>
        <View style={styles.permsGrid}>
          <PermBadge label={pick("Bookings", "Réservations")} granted={perms.manageBookings} C={C} isDark={isDark} />
          <PermBadge label={pick("Messages", "Messages")} granted={perms.manageMessages} C={C} isDark={isDark} />
          <PermBadge label={pick("Analytics", "Analytique")} granted={perms.viewAnalytics} C={C} isDark={isDark} />
          <PermBadge label={pick("Pricing", "Tarification")} granted={perms.managePricing} C={C} isDark={isDark} />
        </View>

        <Text style={[styles.section, { color: isDark ? "#94a3b8" : "#475569", marginTop: 8 }]}>
          {pick("Preferences", "Préférences")}
        </Text>
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: isDark ? "rgba(124,107,255,0.15)" : "rgba(98,72,232,0.1)" }]}>
              <Ionicons name="moon-outline" size={18} color={C.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>
              {pick("Dark mode", "Thème sombre")}
            </Text>
            <ThemeToggle />
          </View>
          <View style={[styles.row, styles.rowLast, { flexDirection: "column", alignItems: "stretch", gap: 10 }]}>
            <Text style={[styles.rowLabel, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>
              {pick("Language", "Langue", "اللغة")}
            </Text>
            <LanguageSwitcher variant="full" accent={C.primary} isDark={isDark} />
          </View>
        </View>

        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              pick("Log out", "Déconnexion"),
              pick("Are you sure you want to log out?", "Voulez-vous vous déconnecter ?"),
              [
                { text: pick("Cancel", "Annuler"), style: "cancel" },
                { text: pick("Log out", "Déconnecter"), style: "destructive", onPress: logout },
              ]
            )
          }
          activeOpacity={0.85}
          style={styles.logoutBtn}
        >
          <Ionicons name="log-out-outline" size={18} color="#f87171" />
          <Text style={styles.logoutText}>{pick("Log out", "Déconnexion")}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function createStyles(C, isDark) {
  return StyleSheet.create({
    hero: { paddingBottom: 24, paddingHorizontal: 20, overflow: "hidden" },
    heroRow: { flexDirection: "row", alignItems: "center", gap: 14 },
    avatarCircle: {
      width: 72, height: 72, borderRadius: 36,
      alignItems: "center", justifyContent: "center",
    },
    avatarInitial: { color: "#fff", fontSize: 28, fontWeight: "800" },
    name: { fontSize: 18, fontWeight: "800", letterSpacing: -0.3, marginBottom: 2 },
    email: { fontSize: 13, fontWeight: "500", marginBottom: 8 },
    staffBadge: {
      flexDirection: "row", alignItems: "center", gap: 5,
      alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999,
    },
    staffBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
    section: {
      fontSize: 11, fontWeight: "800", letterSpacing: 1.2,
      textTransform: "uppercase", marginBottom: 10,
    },
    permsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
    card: { borderRadius: 18, borderWidth: 1, marginBottom: 20, overflow: "hidden" },
    row: {
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingVertical: 14, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border,
    },
    rowLast: { borderBottomWidth: 0 },
    rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    rowLabel: { flex: 1, fontSize: 15, fontWeight: "600" },
    logoutBtn: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 10, paddingVertical: 16, borderRadius: 16, borderWidth: 1,
      borderColor: "rgba(248,113,113,0.3)",
      backgroundColor: isDark ? "rgba(248,113,113,0.08)" : "rgba(248,113,113,0.05)",
    },
    logoutText: { color: "#f87171", fontWeight: "800", fontSize: 15 },
  });
}
