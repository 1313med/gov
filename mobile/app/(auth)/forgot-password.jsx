import { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { forgotPassword } from "../../src/api/auth";
import { useTheme } from "../../src/context/ThemeContext";
import { getApiErrorMessage } from "../../src/utils/apiErrorMessage";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors: C } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const s = useMemo(() => createStyles(C), [C]);

  const handleSubmit = async () => {
    if (!email.trim()) return Alert.alert("Error", "Please enter your email.");
    setLoading(true);
    try {
      const { data } = await forgotPassword(email.trim());
      Alert.alert("Email sent", data?.message || "If the account exists, a reset email has been sent.");
      router.back();
    } catch (e) {
      Alert.alert("Error", getApiErrorMessage(e, "Failed to send reset email."));
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
      <Text style={s.title}>Forgot Password</Text>
      <Text style={s.sub}>Enter your email and we will send you a reset link.</Text>
      <View style={s.inputRow}>
        <Ionicons name="mail-outline" size={18} color={C.muted} />
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={C.label}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <TouchableOpacity disabled={loading} onPress={handleSubmit} style={[s.btn, { opacity: loading ? 0.7 : 1 }]}>
        <Text style={s.btnText}>{loading ? "Sending..." : "Send reset link"}</Text>
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
      marginBottom: 18,
    },
    input: { flex: 1, color: C.white, paddingVertical: 14, marginLeft: 10 },
    btn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  });
}
