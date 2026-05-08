import { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { verifyEmail } from "../../../src/api/auth";
import { useTheme } from "../../../src/context/ThemeContext";
import { getApiErrorMessage } from "../../../src/utils/apiErrorMessage";

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);
  const [state, setState] = useState({ loading: true, ok: false, message: "Verifying your email..." });

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const tokenValue = Array.isArray(token) ? token[0] : token;
        if (!tokenValue) throw new Error("Missing verification token.");
        const { data } = await verifyEmail(tokenValue);
        if (!mounted) return;
        setState({ loading: false, ok: true, message: data?.message || "Email verified successfully." });
      } catch (e) {
        if (!mounted) return;
        setState({
          loading: false,
          ok: false,
          message: getApiErrorMessage(e, "Invalid or expired verification link."),
        });
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [token]);

  return (
    <View style={s.screen}>
      <View style={s.card}>
        {state.loading ? (
          <ActivityIndicator color={C.primary} size="large" />
        ) : (
          <Ionicons
            name={state.ok ? "checkmark-circle" : "close-circle"}
            size={54}
            color={state.ok ? "#16a34a" : "#dc2626"}
          />
        )}
        <Text style={s.title}>{state.ok ? "Email verification complete" : "Verification failed"}</Text>
        <Text style={s.message}>{state.message}</Text>
        <TouchableOpacity onPress={() => router.replace("/(auth)/login")} style={s.btn}>
          <Text style={s.btnText}>Go to login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(C) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: 24 },
    card: {
      width: "100%",
      backgroundColor: C.card,
      borderColor: C.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
    },
    title: { color: C.white, fontSize: 20, fontWeight: "800", marginTop: 12, textAlign: "center" },
    message: { color: C.muted, fontSize: 14, textAlign: "center", marginTop: 8, marginBottom: 20 },
    btn: { backgroundColor: C.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10 },
    btnText: { color: "#fff", fontWeight: "700" },
  });
}
