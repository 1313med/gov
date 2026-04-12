import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { register as registerApi } from "../../src/api/auth";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { C } from "../../src/theme";

const ROLES = [
  { key: "customer", icon: "person-outline" },
  { key: "seller", icon: "pricetag-outline" },
  { key: "rental_owner", icon: "car-outline" },
];

export default function RegisterScreen() {
  const { login } = useAuth();
  const { copy } = useAppLang();
  const c = copy.register;
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", city: "", password: "", role: "customer" });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const roleLabels = { customer: c.roleCustomer, seller: c.roleSeller, rental_owner: c.roleRental };

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.city || !form.password) return Alert.alert("Please fill all fields");
    setLoading(true);
    try { const { data } = await registerApi(form); await login(data); }
    catch (e) { Alert.alert("Error", e?.response?.data?.message || c.regFail); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={C.primary} />
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={s.title}>{c.joinTitle}</Text>
          <Text style={s.sub}>{c.joinSub}</Text>
        </View>

        <View style={s.form}>
          <Text style={s.formTitle}>{c.createTitle}</Text>
          <Text style={s.formSub}>{c.createSub}</Text>

          {[
            { key: "name",     label: c.fullName, icon: "person-outline",   ph: "John Doe",      kb: "default" },
            { key: "phone",    label: c.phone,    icon: "call-outline",     ph: "06XXXXXXXX",    kb: "phone-pad" },
            { key: "city",     label: c.city,     icon: "location-outline", ph: "Casablanca",    kb: "default" },
            { key: "password", label: c.password, icon: "lock-closed-outline", ph: "••••••••",   kb: "default", secure: true },
          ].map((f) => (
            <View key={f.key}>
              <Text style={s.label}>{f.label}</Text>
              <View style={s.inputRow}>
                <Ionicons name={f.icon} size={18} color={C.muted} />
                <TextInput value={form[f.key]} onChangeText={(v) => set(f.key, v)}
                  placeholder={f.ph} placeholderTextColor="#4b5563"
                  keyboardType={f.kb} secureTextEntry={f.secure}
                  style={s.input} autoCapitalize="none" />
              </View>
            </View>
          ))}

          <Text style={s.label}>{c.accountType}</Text>
          <View style={s.roleRow}>
            {ROLES.map((r) => {
              const active = form.role === r.key;
              return (
                <TouchableOpacity key={r.key} onPress={() => set("role", r.key)}
                  style={[s.roleBtn, active && s.roleBtnActive]}>
                  <Ionicons name={r.icon} size={20} color={active ? C.primary : C.muted} />
                  <Text style={[s.roleText, active && s.roleTextActive]} numberOfLines={2}>
                    {roleLabels[r.key]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity onPress={handleRegister} disabled={loading}
            style={[s.btn, { opacity: loading ? 0.7 : 1 }]}>
            <Text style={s.btnText}>{loading ? c.creating : c.createBtn}</Text>
          </TouchableOpacity>

          <View style={s.footerRow}>
            <Text style={s.footerQ}>{c.footerQ} </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={s.footerLink}>{c.footerLogin}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header: { paddingTop: 64, paddingBottom: 32, paddingHorizontal: 24, backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  backBtn: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  backText: { color: C.primary, marginLeft: 6 },
  title: { color: C.white, fontSize: 24, fontWeight: "700" },
  sub: { color: C.muted, fontSize: 13, marginTop: 4 },
  form: { padding: 24 },
  formTitle: { color: C.white, fontSize: 20, fontWeight: "700", marginBottom: 4 },
  formSub: { color: C.muted, fontSize: 13, marginBottom: 24 },
  label: { color: "#94a3b8", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, marginTop: 4 },
  inputRow: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginBottom: 16 },
  input: { flex: 1, color: C.white, paddingVertical: 16, marginLeft: 10 },
  roleRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  roleBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center", backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  roleBtnActive: { backgroundColor: "rgba(124,107,255,0.15)", borderColor: C.primary },
  roleText: { color: C.muted, fontSize: 11, marginTop: 4, textAlign: "center" },
  roleTextActive: { color: C.primary, fontWeight: "700" },
  btn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 16 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  footerRow: { flexDirection: "row", justifyContent: "center", paddingBottom: 32 },
  footerQ: { color: C.muted, fontSize: 14 },
  footerLink: { color: C.primary, fontWeight: "700", fontSize: 14 },
});
