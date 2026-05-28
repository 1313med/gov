import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "../context/ThemeContext";
import { useActiveMode } from "../context/ActiveModeContext";
import { addMyRole } from "../api/user";
import { useAuth } from "../context/AuthContext";
import { shellForMode, isAdminOnlyUser } from "../utils/userRoles";
import { useAppLang } from "../context/AppLangContext";

const MODES = [
  { key: "customer", icon: "search-outline", colorLight: "#6248e8", colorDark: "#7c6bff", en: "Explore", fr: "Explorer", ar: "استكشف" },
  { key: "car_owner", icon: "car-sport-outline", colorLight: "#0284c7", colorDark: "#38bdf8", en: "My garage", fr: "Mon garage", ar: "كراجي" },
  { key: "rental_owner", icon: "business-outline", colorLight: "#059669", colorDark: "#34d399", en: "My fleet", fr: "Ma flotte", ar: "أسطولي" },
  { key: "admin", icon: "shield-outline", colorLight: "#dc2626", colorDark: "#f87171", en: "Admin", fr: "Admin", ar: "الإدارة" },
];

export default function RoleModeSwitcher() {
  const { pick } = useAppLang();
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
        pick("Error", "Erreur", "خطأ"),
        e?.response?.data?.message || pick("Could not enable this mode.", "Impossible d'activer ce mode.", "تعذّر تفعيل هذا الوضع.")
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
      car_owner: pick(
        "Track my car and sell when ready",
        "Suivre ma voiture et vendre plus tard",
        "تتبّع سيارتي والبيع لاحقاً"
      ),
      rental_owner: pick("Rent out my cars", "Louer mes voitures", "تأجير سياراتي"),
    };
    Alert.alert(
      pick("Enable this mode?", "Activer ce mode ?", "تفعيل هذا الوضع؟"),
      labels[key] || "",
      [
        { text: pick("Cancel", "Annuler", "إلغاء"), style: "cancel" },
        { text: pick("Enable", "Activer", "تفعيل"), onPress: () => enableRole(key) },
      ]
    );
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={[styles.section, { color: isDark ? "#94a3b8" : "#475569" }]}>
        {pick("YOUR GOOVOITURE SPACES", "VOS ESPACES GOOVOITURE", "مساحاتك في جوفويتور")}
      </Text>
      <View style={styles.grid}>
        {MODES.filter((m) => m.key !== "admin" || isAdminOnlyUser(auth)).map((m) => {
          const active = activeMode === m.key;
          const unlocked = canAccess(m.key);
          const color = isDark ? m.colorDark : m.colorLight;
          const copy = pick(m.en, m.fr, m.ar);
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
                <Text style={[styles.tileHint, { color: C.muted }]}>{pick("Enable", "Activer", "تفعيل")}</Text>
              ) : active ? (
                <Text style={[styles.tileHint, { color }]}>{pick("Active", "Actif", "نشط")}</Text>
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
