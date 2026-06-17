import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";

export default function SocialAuthButtons({
  copy,
  config,
  busy,
  onGoogle,
  onFacebook,
  onApple,
  appleAvailable,
  accent = "#7c6cfc",
  isDark = true,
  disabled = false,
}) {
  const googleEnabled = config?.google?.enabled;
  const facebookEnabled = config?.facebook?.enabled;
  const appleEnabled = config?.apple?.enabled && appleAvailable;

  if (!googleEnabled && !facebookEnabled && !appleEnabled) {
    return null;
  }

  const border = isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)";
  const bg = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.92)";
  const text = isDark ? "#e2e8f0" : "#0f172a";
  const mut = isDark ? "#64748b" : "#94a3b8";

  const buttons = [
    googleEnabled && {
      key: "google",
      label: copy?.google || "Google",
      onPress: onGoogle,
    },
    facebookEnabled && {
      key: "facebook",
      label: copy?.facebook || "Facebook",
      onPress: onFacebook,
    },
    appleEnabled && {
      key: "apple",
      label: copy?.apple || "Apple",
      onPress: onApple,
    },
  ].filter(Boolean);

  return (
    <View style={styles.wrap}>
      <View style={styles.dividerRow}>
        <View style={[styles.line, { backgroundColor: border }]} />
        <Text style={[styles.dividerText, { color: mut }]}>
          {copy?.socialDivider || "or continue with"}
        </Text>
        <View style={[styles.line, { backgroundColor: border }]} />
      </View>

      <View style={styles.grid}>
        {buttons.map((btn) => (
          <Pressable
            key={btn.key}
            onPress={btn.onPress}
            disabled={disabled || !!busy}
            style={({ pressed }) => [
              styles.btn,
              {
                borderColor: border,
                backgroundColor: bg,
                opacity: pressed || disabled || busy ? 0.7 : 1,
              },
            ]}
          >
            {busy === btn.key ? (
              <ActivityIndicator size="small" color={accent} />
            ) : (
              <Text style={[styles.btnText, { color: text }]}>{btn.label}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  line: { flex: 1, height: 1 },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  grid: { flexDirection: "row", gap: 8 },
  btn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  btnText: { fontSize: 12, fontWeight: "700" },
});
