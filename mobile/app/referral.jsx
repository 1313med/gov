import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Share, Linking, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../src/api/client";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";

export default function ReferralScreen() {
  const { colors: C } = useTheme();
  const { lang, pick } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const load = () => {
    api.get("/referral/me")
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setFetching(false));
  };
  useEffect(load, []);

  const handleShare = async () => {
    if (!data) return;
    try {
      const txt = pick(`Join Goovoiture with my code ${data.referralCode} and get ${data.rewards.refereeCreditMad} MAD credit! 🚗`, `Rejoins Goovoiture avec mon code ${data.referralCode} et gagne ${data.rewards.refereeCreditMad} MAD de crédit ! 🚗`);
      await Share.share({ message: txt });
    } catch {}
  };

  const handleWhatsApp = () => {
    if (!data) return;
    const txt = pick(`Join Goovoiture with my code ${data.referralCode} and get ${data.rewards.refereeCreditMad} MAD credit! 🚗`, `Rejoins Goovoiture avec mon code ${data.referralCode} et gagne ${data.rewards.refereeCreditMad} MAD de crédit ! 🚗`);
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(txt)}`);
  };

  const handleApply = async () => {
    if (!code) return;
    setLoading(true);
    setMsg(null);
    try {
      const { data: res } = await api.post("/referral/apply", { code: code.toUpperCase() });
      setMsg({ type: "success", text: res.message || (pick("Code applied!", "Code appliqué !")) });
      load();
    } catch (e) {
      setMsg({ type: "error", text: e?.response?.data?.message || (pick("Invalid code", "Code invalide")) });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={C.primary} size="large" /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, flexDirection: "row", alignItems: "center", gap: 12 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={C.white} />
        </TouchableOpacity>
        <Text style={{ color: C.white, fontWeight: "800", fontSize: 16 }}>{pick("Referral Program", "Programme de parrainage")}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        <Text style={{ color: C.muted, fontSize: 13, marginBottom: 20, lineHeight: 20 }}>
          {pick("Invite friends and earn credits.", "Invitez vos amis et gagnez des crédits.")}
        </Text>

        {data && (
          <>
            {/* Credits card */}
            <View style={[s.card, { backgroundColor: C.primary }]}>
              <Text style={s.creditLabel}>{pick("My credits", "Mes crédits")}</Text>
              <Text style={s.creditAmount}>{data.referralCredits} MAD</Text>
              <View style={s.statsRow}>
                <View style={s.statPill}><Text style={s.statNum}>{data.referredUsersCount}</Text><Text style={s.statLabel}>{pick("Friends", "Amis")}</Text></View>
                <View style={s.statPill}><Text style={s.statNum}>{data.rewards.referrerCreditMad} MAD</Text><Text style={s.statLabel}>{pick("You earn", "Vous gagnez")}</Text></View>
                <View style={s.statPill}><Text style={s.statNum}>{data.rewards.refereeCreditMad} MAD</Text><Text style={s.statLabel}>{pick("They earn", "Ils gagnent")}</Text></View>
              </View>
            </View>

            {/* Code */}
            <View style={[s.codeBox, { borderColor: C.primary, backgroundColor: C.card }]}>
              <Text style={[s.codeLabel, { color: C.muted }]}>{pick("Your code", "Votre code")}</Text>
              <Text style={[s.codeText, { color: C.primary }]}>{data.referralCode}</Text>
            </View>
            <View style={s.shareRow}>
              <TouchableOpacity style={[s.shareBtn, { backgroundColor: C.primary }]} onPress={handleShare}>
                <Text style={s.shareBtnText}>{pick("📤 Share", "📤 Partager")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.shareBtn, { backgroundColor: "#25D366" }]} onPress={handleWhatsApp}>
                <Text style={s.shareBtnText}>📲 WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Apply code */}
        <View style={[s.applyBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.applyLabel, { color: C.white }]}>{pick("Use a friend's code", "Utiliser un code ami")}</Text>
          <View style={s.inputRow}>
            <TextInput
              style={[s.codeInput, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              placeholder="XXXXXXXX"
              maxLength={8}
              autoCapitalize="characters"
              placeholderTextColor={C.muted}
            />
            <TouchableOpacity style={[s.applyBtn, { backgroundColor: C.primary }, (!code || loading) && { opacity: 0.4 }]} onPress={handleApply} disabled={!code || loading}>
              <Text style={s.applyBtnText}>{loading ? "…" : (pick("Apply", "Appliquer"))}</Text>
            </TouchableOpacity>
          </View>
          {msg && <Text style={[s.msgText, msg.type === "success" ? s.msgGreen : s.msgRed]}>{msg.text}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card:         { borderRadius: 20, padding: 20, marginBottom: 20 },
  creditLabel:  { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 4 },
  creditAmount: { color: "#fff", fontSize: 36, fontWeight: "700", marginBottom: 12 },
  statsRow:     { flexDirection: "row", gap: 8 },
  statPill:     { flex: 1, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 8, alignItems: "center" },
  statNum:      { color: "#fff", fontSize: 14, fontWeight: "700" },
  statLabel:    { color: "rgba(255,255,255,0.7)", fontSize: 10, marginTop: 2 },
  codeBox:      { borderWidth: 2, borderRadius: 16, padding: 16, alignItems: "center", marginBottom: 12 },
  codeLabel:    { fontSize: 12, marginBottom: 4 },
  codeText:     { fontSize: 28, fontWeight: "800", letterSpacing: 4 },
  shareRow:     { flexDirection: "row", gap: 12, marginBottom: 20 },
  shareBtn:     { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  shareBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  applyBox:     { borderWidth: 1, borderRadius: 16, padding: 16 },
  applyLabel:   { fontSize: 14, fontWeight: "600", marginBottom: 10 },
  inputRow:     { flexDirection: "row", gap: 8 },
  codeInput:    { flex: 1, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  applyBtn:     { borderRadius: 10, paddingHorizontal: 16, justifyContent: "center" },
  applyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  msgText:      { fontSize: 12, marginTop: 8 },
  msgGreen:     { color: "#22c55e" },
  msgRed:       { color: "#f87171" },
});
