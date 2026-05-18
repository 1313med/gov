import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { useActiveMode } from "../context/ActiveModeContext";
import { addMyRole } from "../api/user";
import { useAuth } from "../context/AuthContext";
import { shellForMode, isAdminOnlyUser } from "../utils/userRoles";

const MODES = [
  { key: "customer", icon: "search-outline", colorLight: "#6248e8", colorDark: "#7c6bff", en: "Explore", fr: "Explorer" },
  { key: "car_owner", icon: "car-sport-outline", colorLight: "#0284c7", colorDark: "#38bdf8", en: "My garage", fr: "Mon garage" },
  { key: "rental_owner", icon: "business-outline", colorLight: "#059669", colorDark: "#34d399", en: "My fleet", fr: "Ma flotte" },
  { key: "admin", icon: "shield-outline", colorLight: "#dc2626", colorDark: "#f87171", en: "Admin", fr: "Admin" },
];

export default function RoleModeSwitcher({ fr = false }) {
  const { colors: C, isDark } = useTheme();
  const { roles, activeMode, setActiveMode, ensureCarOwnerLanding, canAccess } = useActiveMode();
  const { login, auth } = useAuth();
  const router = useRouter();

  const enableRole = async (roleKey) => {
    try {
      const { data } = await addMyRole(roleKey);
      await login({ ...auth, ...data }, { remember: true });
      if (roleKey === "car_owner") {
        await ensureCarOwnerLanding();
      } else {
        await setActiveMode(roleKey);
      }
      router.replace(shellForMode(roleKey));
    } catch (e) {
      Alert.alert(
        fr ? "Erreur" : "Error",
        e?.response?.data?.message || (fr ? "Impossible d'activer ce mode." : "Could not enable this mode.")
      );
    }
  };

  const onPressMode = async (key) => {
    if (canAccess(key)) {
      await setActiveMode(key);
      router.replace(shellForMode(key));
      return;
    }
    if (key === "admin") return;
    const labels = {
      car_owner: fr ? "Suivre ma voiture et vendre plus tard" : "Track my car and sell when ready",
      rental_owner: fr ? "Louer mes voitures" : "Rent out my cars",
    };
    Alert.alert(
      fr ? "Activer ce mode ?" : "Enable this mode?",
      labels[key] || "",
      [
        { text: fr ? "Annuler" : "Cancel", style: "cancel" },
        { text: fr ? "Activer" : "Enable", onPress: () => enableRole(key) },
      ]
    );
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.section, { color: isDark ? "#94a3b8" : "#475569" }]}>
        {fr ? "VOS ESPACES GOOVOITURE" : "YOUR GOOVOITURE SPACES"}
      </Text>
      <View style={styles.grid}>
        {MODES.filter((m) => m.key !== "admin" || isAdminOnlyUser(auth)).map((m) => {
          const active = activeMode === m.key;
          const unlocked = canAccess(m.key);
          const color = isDark ? m.colorDark : m.colorLight;
          const copy = fr ? m.fr : m.en;
          return (
            <TouchableOpacity
              key={m.key}
              onPress={() => onPressMode(m.key)}
              activeOpacity={0.85}
              style={[
                styles.tile,
                {
                  borderColor: active ? color : C.border,
                  backgroundColor: active ? `${color}14` : C.card,
                  opacity: unlocked || m.key === "customer" ? 1 : 0.92,
                },
              ]}
            >
              <LinearGradient
                colors={active ? [color, `${color}99`] : [`${color}22`, `${color}08`]}
                style={styles.iconWrap}
              >
                <Ionicons name={m.icon} size={20} color={active ? "#fff" : color} />
              </LinearGradient>
              <Text style={[styles.tileLabel, { color: isDark ? "#f1f5f9" : "#0f172a" }]} numberOfLines={1}>
                {copy}
              </Text>
              {!unlocked && m.key !== "customer" ? (
                <Text style={[styles.tileHint, { color: C.muted }]}>{fr ? "Activer" : "Enable"}</Text>
              ) : active ? (
                <Text style={[styles.tileHint, { color }]}>{fr ? "Actif" : "Active"}</Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    minHeight: 96,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  tileLabel: { fontSize: 14, fontWeight: "800" },
  tileHint: { fontSize: 11, fontWeight: "600", marginTop: 4 },
});
