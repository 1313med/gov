import { useState, useEffect } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getRenterTrustPassport } from "../api/kyc";
import { useTheme } from "../context/ThemeContext";
import { useAppLang } from "../context/AppLangContext";

const LEVEL_COLORS = {
  high:   { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.4)", text: "#22c55e" },
  medium: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)", text: "#f59e0b" },
  low:    { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)", text: "#f87171" },
};

const LEVEL_LABEL = {
  fr: { high: "Confiance élevée", medium: "Confiance moyenne", low: "Faible confiance" },
  en: { high: "High trust", medium: "Medium trust", low: "Low trust" },
};

export default function TrustPassportCard({ userId }) {
  const { colors: C } = useTheme();
  const { lang, pick, dateLocale } = useAppLang();
  const fr = lang === "fr";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getRenterTrustPassport(userId)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <ActivityIndicator color={C.primary} />
      </View>
    );
  }
  if (!data) {
    return (
      <Text style={{ color: C.muted, fontSize: 13, textAlign: "center", paddingVertical: 16 }}>
        {pick("Data unavailable.", "Données indisponibles.")}
      </Text>
    );
  }

  const lvl = LEVEL_COLORS[data.trustLevel] || LEVEL_COLORS.medium;
  const lvlLabel = (LEVEL_LABEL[pick("en", "fr")])[data.trustLevel] || "";

  return (
    <View style={[s.wrap, { backgroundColor: lvl.bg, borderColor: lvl.border }]}>
      {/* header row */}
      <View style={s.headerRow}>
        {data.avatar
          ? <Image source={{ uri: data.avatar }} style={s.avatar} />
          : (
            <View style={[s.avatar, s.avatarPh]}>
              <Text style={s.avatarLetter}>{(data.name || "?")[0].toUpperCase()}</Text>
            </View>
          )
        }
        <View style={{ flex: 1, minWidth: 0, marginLeft: 12 }}>
          <Text style={[s.name, { color: lvl.text }]} numberOfLines={1}>{data.name}</Text>
          <Text style={s.since}>
            {pick("Member since ", "Membre depuis ")}
            {new Date(data.memberSince).toLocaleDateString(dateLocale, { month: "short", year: "numeric" })}
          </Text>
        </View>
        <View style={s.scoreWrap}>
          <Text style={[s.score, { color: lvl.text }]}>{data.trustScore}</Text>
          <Text style={s.scoreMax}>/100</Text>
          <Text style={[s.lvlLabel, { color: lvl.text }]}>{lvlLabel}</Text>
        </View>
      </View>

      {/* verification chips */}
      <View style={s.chipsRow}>
        <View style={[s.chip, data.verification.cinVerified ? s.chipOk : s.chipOff]}>
          <Ionicons name={data.verification.cinVerified ? "checkmark-circle" : "ellipse-outline"} size={13}
            color={data.verification.cinVerified ? "#22c55e" : "#94a3b8"} />
          <Text style={[s.chipTxt, { color: data.verification.cinVerified ? "#22c55e" : "#94a3b8" }]}>
            CIN {data.verification.cinVerified ? (pick("verified", "vérifiée")) : data.verification.cinSubmitted ? (pick("(pending)", "(en attente)")) : (pick("not submitted", "non soumise"))}
          </Text>
        </View>
        <View style={[s.chip, data.verification.permisVerified ? s.chipOk : s.chipOff]}>
          <Ionicons name={data.verification.permisVerified ? "checkmark-circle" : "ellipse-outline"} size={13}
            color={data.verification.permisVerified ? "#22c55e" : "#94a3b8"} />
          <Text style={[s.chipTxt, { color: data.verification.permisVerified ? "#22c55e" : "#94a3b8" }]}>
            {pick("License ", "Permis ")}{data.verification.permisVerified ? (pick("verified", "vérifié")) : data.verification.permisSubmitted ? (pick("(pending)", "(en attente)")) : (pick("not submitted", "non soumis"))}
          </Text>
        </View>
      </View>

      {/* stats */}
      <View style={s.statsRow}>
        <Text style={s.statTxt}>
          <Text style={s.statNum}>{data.stats.completedRentals}</Text>
          {pick(" completed trips", " loc. complétées")}
        </Text>
        <Text style={s.statTxt}>
          <Text style={s.statNum}>{data.stats.cancelledRentals}</Text>
          {pick(" cancellation(s)", " annulation(s)")}
        </Text>
        {data.stats.platformFlags > 0 && (
          <Text style={[s.statTxt, { color: "#f87171" }]}>
            ⚠ {data.stats.platformFlags} {pick("flag(s)", "signalement(s)")}
          </Text>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 16, padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#334155" },
  avatarPh: { alignItems: "center", justifyContent: "center" },
  avatarLetter: { color: "#fff", fontWeight: "800", fontSize: 18 },
  name: { fontSize: 15, fontWeight: "800" },
  since: { color: "#94a3b8", fontSize: 11, marginTop: 2 },
  scoreWrap: { alignItems: "flex-end" },
  score: { fontSize: 24, fontWeight: "900", lineHeight: 28 },
  scoreMax: { color: "#94a3b8", fontSize: 11 },
  lvlLabel: { fontSize: 10, fontWeight: "700", marginTop: 2 },
  chipsRow: { flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  chipOk: { backgroundColor: "rgba(34,197,94,0.12)" },
  chipOff: { backgroundColor: "rgba(148,163,184,0.1)" },
  chipTxt: { fontSize: 11, fontWeight: "600" },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statTxt: { color: "#94a3b8", fontSize: 12 },
  statNum: { color: "#e2e8f0", fontWeight: "800" },
});
