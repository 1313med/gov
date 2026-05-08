import { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { resetPassword } from "../../../src/api/auth";
import { useTheme } from "../../../src/context/ThemeContext";
import { getApiErrorMessage } from "../../../src/utils/apiErrorMessage";

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const tokenValue = Array.isArray(token) ? token[0] : token;
    if (!tokenValue) return Alert.alert("Error", "Missing reset token.");
    if (!password || password.length < 6) return Alert.alert("Error", "Password must be at least 6 characters.");
    if (password !== confirmPassword) return Alert.alert("Error", "Passwords do not match.");

    setLoading(true);
    try {
      const { data } = await resetPassword(tokenValue, password);
      Alert.alert("Success", data?.message || "Password reset successfully.", [
        { text: "OK", onPress: () => router.replace("/(auth)/login") },
      ]);
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e, "Failed to reset password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.screen}>
      <TouchableOpacity onPress={() => router.back()} style={s.backRow}>
        <Ionicons name="arrow-back" size={18} color={C.primary} />
        <Text style={s.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={s.title}>Create new password</Text>
      <Text style={s.sub}>Enter your new password to secure your account.</Text>

      <View style={s.inputRow}>
        <Ionicons name="lock-closed-outline" size={18} color={C.muted} />
        <TextInput
          style={s.input}
          value={password}
          onChangeText={setPassword}
          placeholder="New password"
          placeholderTextColor={C.label}
          secureTextEntry
        />
      </View>

      <View style={s.inputRow}>
        <Ionicons name="lock-closed-outline" size={18} color={C.muted} />
        <TextInput
          style={s.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          placeholderTextColor={C.label}
          secureTextEntry
        />
      </View>

      <TouchableOpacity disabled={loading} onPress={handleSubmit} style={[s.btn, { opacity: loading ? 0.7 : 1 }]}>
        <Text style={s.btnText}>{loading ? "Updating..." : "Reset password"}</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(C) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg, padding: 24, paddingTop: 64 },
    backRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
    backText: { color: C.primary, marginLeft: 6, fontWeight: "600" },
    title: { color: C.white, fontSize: 28, fontWeight: "800", marginBottom: 6 },
    sub: { color: C.muted, fontSize: 14, marginBottom: 24 },
    inputRow: {
      backgroundColor: C.inputBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      marginBottom: 14,
    },
    input: { flex: 1, color: C.white, paddingVertical: 14, marginLeft: 10 },
    btn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 4 },
    btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  });
}
