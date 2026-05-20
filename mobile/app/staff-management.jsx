import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../src/api/client";
import { useTheme } from "../src/context/ThemeContext";
import { useAppLang } from "../src/context/AppLangContext";

const PERM_KEYS = ["manageBookings", "manageMessages", "viewAnalytics", "managePricing"];
const PERM_LABELS_FR = { manageBookings: "Réservations", manageMessages: "Messages", viewAnalytics: "Analytics", managePricing: "Tarifs" };
const PERM_LABELS_EN = { manageBookings: "Bookings", manageMessages: "Messages", viewAnalytics: "Analytics", managePricing: "Pricing" };

export default function StaffManagementScreen() {
  const { colors: C } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const PERM_LABELS = fr ? PERM_LABELS_FR : PERM_LABELS_EN;

  const [data, setData] = useState({ staff: [], pendingInvites: [] });
  const [form, setForm] = useState({ phone: "", name: "", permissions: { manageBookings: true, manageMessages: true, viewAnalytics: false, managePricing: false } });
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  const load = () => {
    api.get("/staff/my-team")
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setFetching(false));
  };
  useEffect(load, []);

  const handleInvite = async () => {
    if (!form.phone || !form.name) {
      Alert.alert(fr ? "Erreur" : "Error", fr ? "Nom et téléphone requis." : "Name and phone required.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/staff/invite", form);
      Alert.alert(fr ? "Succès" : "Sent!", fr ? "Invitation envoyée." : "Invitation sent.");
      setForm({ phone: "", name: "", permissions: { manageBookings: true, manageMessages: true, viewAnalytics: false, managePricing: false } });
      load();
    } catch (e) {
      Alert.alert(fr ? "Erreur" : "Error", e?.response?.data?.message || (fr ? "Erreur réseau" : "Network error"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (userId) => {
    Alert.alert(
      fr ? "Confirmer" : "Confirm",
      fr ? "Retirer ce membre ?" : "Remove this member?",
      [
        { text: fr ? "Annuler" : "Cancel", style: "cancel" },
        { text: fr ? "Retirer" : "Remove", style: "destructive", onPress: async () => { await api.delete(`/staff/${userId}`); load(); } },
      ]
    );
  };

  const togglePerm = async (userId, perm, current) => {
    await api.put(`/staff/${userId}/permissions`, { permissions: { [perm]: !current } });
    load();
  };

  if (fetching) return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={C.primary} size="large" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, flexDirection: "row", alignItems: "center", gap: 12 }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={C.white} />
        </TouchableOpacity>
        <Text style={{ color: C.white, fontWeight: "800", fontSize: 16 }}>👥 {fr ? "Mon équipe" : "My Staff"}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>
        {data.staff.map((m) => (
          <View key={m._id} style={[s.memberCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={s.memberHeader}>
              <View style={[s.avatar, { backgroundColor: C.pillBg }]}>
                <Text style={[s.avatarText, { color: C.primary }]}>{m.name?.[0]?.toUpperCase() || "?"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.memberName, { color: C.white }]}>{m.name}</Text>
                <Text style={[s.memberPhone, { color: C.muted }]}>{m.phone}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(m._id)} style={s.removeBtn}>
                <Text style={s.removeBtnText}>{fr ? "Retirer" : "Remove"}</Text>
              </TouchableOpacity>
            </View>
            {PERM_KEYS.map((perm) => (
              <View key={perm} style={[s.permRow, { borderTopColor: C.border }]}>
                <Text style={[s.permLabel, { color: C.muted }]}>{PERM_LABELS[perm]}</Text>
                <Switch
                  value={!!m.staffPermissions?.[perm]}
                  onValueChange={() => togglePerm(m._id, perm, m.staffPermissions?.[perm])}
                  trackColor={{ true: C.primary, false: C.border }}
                />
              </View>
            ))}
          </View>
        ))}

        {data.pendingInvites.length > 0 && (
          <View style={[s.pendingBox, { backgroundColor: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.35)" }]}>
            <Text style={s.pendingTitle}>{fr ? "Invitations en attente" : "Pending invitations"}</Text>
            {data.pendingInvites.map((inv) => (
              <View key={inv._id} style={s.pendingItem}>
                <Text style={[s.pendingName, { color: C.white }]}>{inv.name}</Text>
                <Text style={[s.pendingPhone, { color: C.muted }]}>{inv.phone}</Text>
                <View style={s.pendingBadge}><Text style={s.pendingBadgeText}>{fr ? "⏳ En attente" : "⏳ Pending"}</Text></View>
              </View>
            ))}
          </View>
        )}

        <View style={[s.formBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.formTitle, { color: C.white }]}>{fr ? "Inviter un collaborateur" : "Invite a staff member"}</Text>
          <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
            value={form.name} onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
            placeholder={fr ? "Prénom & Nom" : "Full name"} placeholderTextColor={C.muted} />
          <TextInput style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
            value={form.phone} onChangeText={(v) => setForm((p) => ({ ...p, phone: v }))}
            placeholder={fr ? "Téléphone (06XXXXXXXX)" : "Phone (06XXXXXXXX)"} placeholderTextColor={C.muted} keyboardType="phone-pad" />
          <Text style={[s.permTitle, { color: C.muted }]}>{fr ? "Permissions" : "Permissions"}</Text>
          {PERM_KEYS.map((perm) => (
            <View key={perm} style={[s.permRow, { borderTopColor: C.border }]}>
              <Text style={[s.permLabel, { color: C.muted }]}>{PERM_LABELS[perm]}</Text>
              <Switch
                value={!!form.permissions[perm]}
                onValueChange={(v) => setForm((p) => ({ ...p, permissions: { ...p.permissions, [perm]: v } }))}
                trackColor={{ true: C.primary, false: C.border }}
              />
            </View>
          ))}
          <TouchableOpacity style={[s.btn, { backgroundColor: C.primary }, saving && { opacity: 0.6 }]} onPress={handleInvite} disabled={saving}>
            <Text style={s.btnText}>{saving ? "…" : (fr ? "Envoyer l'invitation" : "Send invitation")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  memberCard:      { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  memberHeader:    { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  avatar:          { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText:      { fontSize: 18, fontWeight: "700" },
  memberName:      { fontSize: 15, fontWeight: "600" },
  memberPhone:     { fontSize: 12 },
  removeBtn:       { borderWidth: 1, borderColor: "rgba(248,113,113,0.45)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  removeBtnText:   { color: "#f87171", fontSize: 12, fontWeight: "600" },
  permRow:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  permLabel:       { fontSize: 13 },
  pendingBox:      { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16 },
  pendingTitle:    { fontSize: 13, fontWeight: "700", color: "#fbbf24", marginBottom: 8 },
  pendingItem:     { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  pendingName:     { flex: 1, fontSize: 13, fontWeight: "600" },
  pendingPhone:    { fontSize: 11 },
  pendingBadge:    { backgroundColor: "rgba(245,158,11,0.15)", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  pendingBadgeText:{ fontSize: 11, color: "#fbbf24", fontWeight: "600" },
  formBox:         { borderWidth: 1, borderRadius: 16, padding: 16 },
  formTitle:       { fontSize: 15, fontWeight: "700", marginBottom: 12 },
  input:           { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  permTitle:       { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 4 },
  btn:             { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  btnText:         { color: "#fff", fontWeight: "700", fontSize: 14 },
});
