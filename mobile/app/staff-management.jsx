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

const DEFAULT_PERMS = { manageBookings: true, manageMessages: true, viewAnalytics: false, managePricing: false };

export default function StaffManagementScreen() {
  const { colors: C } = useTheme();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const PERM_LABELS = fr ? PERM_LABELS_FR : PERM_LABELS_EN;

  const [data, setData] = useState({ staff: [], pendingInvites: [] });
  const [form, setForm] = useState({ email: "", name: "", permissions: { ...DEFAULT_PERMS } });
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const load = () => {
    api.get("/staff/my-team")
      .then(({ data: d }) => setData(d))
      .catch(() => {})
      .finally(() => setFetching(false));
  };
  useEffect(load, []);

  const handleInvite = async () => {
    if (!form.email || !form.name) {
      Alert.alert(fr ? "Erreur" : "Error", fr ? "Nom et email requis." : "Name and email required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      Alert.alert(fr ? "Erreur" : "Error", fr ? "Adresse email invalide." : "Invalid email address.");
      return;
    }
    setSaving(true);
    try {
      const { data: res } = await api.post("/staff/invite", form);
      Alert.alert(
        res.direct ? (fr ? "Membre ajouté !" : "Member added!") : (fr ? "Invitation envoyée !" : "Invitation sent!"),
        res.direct
          ? (fr ? `${form.name} a été ajouté à votre équipe directement.` : `${form.name} was added to your team directly.`)
          : (fr ? `Un email a été envoyé à ${form.email}.` : `An email was sent to ${form.email}.`)
      );
      setForm({ email: "", name: "", permissions: { ...DEFAULT_PERMS } });
      load();
    } catch (e) {
      Alert.alert(fr ? "Erreur" : "Error", e?.response?.data?.message || (fr ? "Erreur réseau" : "Network error"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (userId, memberName) => {
    Alert.alert(
      fr ? "Retirer ce membre ?" : "Remove this member?",
      fr ? `${memberName} perdra l'accès immédiatement.` : `${memberName} will lose access immediately.`,
      [
        { text: fr ? "Annuler" : "Cancel", style: "cancel" },
        {
          text: fr ? "Retirer" : "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/staff/${userId}`);
              load();
            } catch (e) {
              Alert.alert(fr ? "Erreur" : "Error", e?.response?.data?.message || (fr ? "Erreur réseau" : "Network error"));
            }
          },
        },
      ]
    );
  };

  const handleCancelInvite = (inviteId, inviteName) => {
    Alert.alert(
      fr ? "Annuler l'invitation ?" : "Cancel invitation?",
      fr ? `L'invitation envoyée à ${inviteName} sera révoquée.` : `The invite sent to ${inviteName} will be revoked.`,
      [
        { text: fr ? "Non" : "No", style: "cancel" },
        {
          text: fr ? "Annuler l'invitation" : "Cancel invite",
          style: "destructive",
          onPress: async () => {
            setCancelling(inviteId);
            try {
              await api.delete(`/staff/invite/${inviteId}`);
              load();
            } catch (e) {
              Alert.alert(fr ? "Erreur" : "Error", e?.response?.data?.message || (fr ? "Erreur réseau" : "Network error"));
            } finally {
              setCancelling(null);
            }
          },
        },
      ]
    );
  };

  const togglePerm = async (userId, perm, current) => {
    try {
      await api.put(`/staff/${userId}/permissions`, { permissions: { [perm]: !current } });
      load();
    } catch {}
  };

  if (fetching) return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color={C.primary} size="large" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={C.white} />
        </TouchableOpacity>
        <Text style={{ color: C.white, fontWeight: "800", fontSize: 16 }}>👥 {fr ? "Mon équipe" : "My Staff"}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}>

        {/* ── Active staff ── */}
        {data.staff.length === 0 && data.pendingInvites.length === 0 && (
          <View style={[s.emptyBox, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>👤</Text>
            <Text style={{ color: C.white, fontWeight: "700", fontSize: 15, marginBottom: 4 }}>
              {fr ? "Aucun membre" : "No staff yet"}
            </Text>
            <Text style={{ color: C.muted, fontSize: 13, textAlign: "center" }}>
              {fr ? "Invitez un collaborateur par email ci-dessous." : "Invite a collaborator by email below."}
            </Text>
          </View>
        )}

        {data.staff.map((m) => (
          <View key={m._id} style={[s.memberCard, { backgroundColor: C.card, borderColor: C.border }]}>
            <View style={s.memberHeader}>
              <View style={[s.avatar, { backgroundColor: C.pillBg }]}>
                <Text style={[s.avatarText, { color: C.primary }]}>{m.name?.[0]?.toUpperCase() || "?"}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.memberName, { color: C.white }]}>{m.name}</Text>
                <Text style={[s.memberSub, { color: C.muted }]}>{m.email || "—"}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemove(m._id, m.name)} style={s.removeBtn}>
                <Ionicons name="trash-outline" size={14} color="#f87171" />
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

        {/* ── Pending invites ── */}
        {data.pendingInvites.length > 0 && (
          <View style={[s.pendingBox, { backgroundColor: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.35)" }]}>
            <Text style={s.pendingTitle}>{fr ? "⏳ Invitations en attente" : "⏳ Pending invitations"}</Text>
            {data.pendingInvites.map((inv) => (
              <View key={inv._id} style={[s.pendingItem, { borderTopColor: "rgba(245,158,11,0.2)" }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.pendingName, { color: C.white }]}>{inv.name}</Text>
                  <Text style={[s.pendingEmail, { color: C.muted }]}>{inv.email}</Text>
                  <Text style={[s.pendingExpiry, { color: "rgba(245,158,11,0.7)" }]}>
                    {fr ? "Expire le" : "Expires"} {new Date(inv.expiresAt).toLocaleDateString(fr ? "fr-FR" : "en-GB")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCancelInvite(inv._id, inv.name)}
                  style={s.cancelInviteBtn}
                  disabled={cancelling === inv._id}
                >
                  {cancelling === inv._id
                    ? <ActivityIndicator size="small" color="#f87171" />
                    : <Ionicons name="close-circle-outline" size={20} color="#f87171" />
                  }
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ── Invite form ── */}
        <View style={[s.formBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[s.formTitle, { color: C.white }]}>
            {fr ? "✉️ Inviter un collaborateur" : "✉️ Invite a staff member"}
          </Text>
          <Text style={[s.formHint, { color: C.muted }]}>
            {fr
              ? "Un email d'invitation sera envoyé avec un lien d'acceptation (valable 7 jours)."
              : "An invitation email will be sent with an accept link (valid 7 days)."}
          </Text>

          <TextInput
            style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
            value={form.name}
            onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
            placeholder={fr ? "Prénom & Nom" : "Full name"}
            placeholderTextColor={C.muted}
          />
          <TextInput
            style={[s.input, { color: C.white, borderColor: C.border, backgroundColor: C.inputBg }]}
            value={form.email}
            onChangeText={(v) => setForm((p) => ({ ...p, email: v.toLowerCase() }))}
            placeholder="email@exemple.com"
            placeholderTextColor={C.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={[s.permTitle, { color: C.muted }]}>{fr ? "Permissions initiales" : "Initial permissions"}</Text>
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

          <TouchableOpacity
            style={[s.btn, { backgroundColor: C.primary }, saving && { opacity: 0.6 }]}
            onPress={handleInvite}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.btnText}>{fr ? "Envoyer l'invitation" : "Send invitation"}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  emptyBox:      { borderWidth: 1, borderRadius: 16, padding: 24, marginBottom: 16, alignItems: "center" },
  memberCard:    { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  memberHeader:  { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  avatar:        { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText:    { fontSize: 18, fontWeight: "700" },
  memberName:    { fontSize: 15, fontWeight: "600" },
  memberSub:     { fontSize: 12, marginTop: 1 },
  removeBtn:     { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "rgba(248,113,113,0.45)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  removeBtnText: { color: "#f87171", fontSize: 12, fontWeight: "600" },
  permRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  permLabel:     { fontSize: 13 },
  pendingBox:    { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16 },
  pendingTitle:  { fontSize: 13, fontWeight: "700", color: "#fbbf24", marginBottom: 10 },
  pendingItem:   { flexDirection: "row", alignItems: "center", paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, gap: 8 },
  pendingName:   { fontSize: 13, fontWeight: "600", marginBottom: 2 },
  pendingEmail:  { fontSize: 12 },
  pendingExpiry: { fontSize: 11, marginTop: 2 },
  cancelInviteBtn: { padding: 4 },
  formBox:       { borderWidth: 1, borderRadius: 16, padding: 16 },
  formTitle:     { fontSize: 15, fontWeight: "700", marginBottom: 6 },
  formHint:      { fontSize: 12, lineHeight: 17, marginBottom: 14 },
  input:         { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  permTitle:     { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 4 },
  btn:           { borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  btnText:       { color: "#fff", fontWeight: "700", fontSize: 14 },
});
