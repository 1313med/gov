import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAppLang } from "../context/AppLangContext";
import { LANG_LABELS, LANG_SHORT, SUPPORTED_LANGS } from "../utils/i18n";

/**
 * Three-way language control: English · Français · العربية
 * @param {"compact"|"full"} variant compact = short codes (EN/FR/AR), full = labels
 */
export default function LanguageSwitcher({ variant = "compact", accent, isDark, style }) {
  const { lang, setLang } = useAppLang();
  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const muted = isDark ? "#64748b" : "#94a3b8";
  const activeColor = accent || (isDark ? "#a78bfa" : "#6248e8");

  return (
    <View style={[styles.row, style]}>
      {SUPPORTED_LANGS.map((code) => {
        const active = lang === code;
        const label = variant === "full" ? LANG_LABELS[code] : LANG_SHORT[code];
        return (
          <TouchableOpacity
            key={code}
            onPress={() => setLang(code)}
            activeOpacity={0.88}
            style={[
              styles.chip,
              {
                borderColor: active ? activeColor : border,
                backgroundColor: active
                  ? `${activeColor}22`
                  : isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.85)",
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={LANG_LABELS[code]}
          >
            <Text
              style={[
                styles.chipTxt,
                {
                  color: active ? activeColor : muted,
                  fontWeight: active ? "800" : "600",
                  fontSize: code === "ar" && variant === "full" ? 11 : 12,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    minWidth: 40,
    alignItems: "center",
  },
  chipTxt: {
    letterSpacing: 0.2,
  },
});
