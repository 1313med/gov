import { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getMyProfile, updateMyProfile } from "../../src/api/user";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { C } from "../../src/theme";
import { SERVER_URL } from "../../src/config";

const ROLES = { customer:{en:"Customer",fr:"Client"}, seller:{en:"Seller",fr:"Vendeur"}, rental_owner:{en:"Rental Owner",fr:"Propriétaire"}, admin:{en:"Admin",fr:"Admin"} };

export default function ProfileScreen() {
  const { auth, logout } = useAuth();
  const { lang, setLang } = useAppLang();
  const router = useRouter();
  const fr = lang === "fr";
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", city:"", bio:"" });

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    getMyProfile().then(({ data }) => { setProfile(data); setForm({ name:data.name||"", city:data.city||"", bio:data.bio||"" }); }).catch(() => {}).finally(() => setLoading(false));
  }, [auth]);

  const pickAvatar = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing:true, aspect:[1,1], quality:0.7 });
    if (!r.canceled) {
      const fd = new FormData();
      fd.append("avatar", { uri: r.assets[0].uri, name:"avatar.jpg", type:"image/jpeg" });
      try { const { data } = await updateMyProfile(fd); setProfile(data); }
      catch { Alert.alert("Failed to update avatar"); }
    }
  };

  const save = async () => {
    setSaving(true);
    try { const { data } = await updateMyProfile(form); setProfile(data); setEditing(false); }
    catch { Alert.alert("Failed to save"); }
    setSaving(false);
  };

  const handleLogout = () => Alert.alert(fr?"Déconnexion":"Logout", fr?"Êtes-vous sûr ?":"Are you sure?",
    [{ text: fr?"Annuler":"Cancel" }, { text: fr?"Déconnexion":"Logout", style:"destructive", onPress: logout }]);

  if (!auth) return (
    <View style={s.center}>
      <Ionicons name="person-circle-outline" size={64} color="#4b5563" />
      <Text style={s.emptyTitle}>{fr?"Non connecté":"Not logged in"}</Text>
      <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={s.btn}>
        <Text style={s.btnText}>{fr?"Connexion":"Login"}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>;

  const avatarUrl = profile?.avatar ? { uri: `${SERVER_URL}/uploads/${profile.avatar}` } : null;

  return (
    <ScrollView style={{ flex:1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>
      <View style={s.hero}>
        <TouchableOpacity onPress={pickAvatar} style={{ position:"relative", marginBottom:16 }}>
          {avatarUrl
            ? <Image source={avatarUrl} style={s.avatar} />
            : <View style={s.avatarPlaceholder}><Text style={s.avatarText}>{profile?.name?.[0]?.toUpperCase()||"?"}</Text></View>
          }
          <View style={s.cameraBadge}><Ionicons name="camera" size={14} color="#fff" /></View>
        </TouchableOpacity>
        <Text style={s.name}>{profile?.name}</Text>
        <View style={s.roleBadge}><Text style={s.roleText}>{ROLES[profile?.role]?.[lang] || profile?.role}</Text></View>
        {profile?.city && <View style={s.cityRow}><Ionicons name="location-outline" size={14} color={C.muted} /><Text style={s.city}>{profile.city}</Text></View>}
        {profile?.bio && <Text style={s.bio}>{profile.bio}</Text>}
      </View>

      <View style={{ padding:16 }}>
        {editing
          ? <View style={s.card}>
              <Text style={s.cardTitle}>{fr?"Modifier le profil":"Edit Profile"}</Text>
              {[{k:"name",l:fr?"Nom":"Name",ic:"person-outline"},{k:"city",l:fr?"Ville":"City",ic:"location-outline"},{k:"bio",l:"Bio",ic:"document-text-outline",multi:true}].map(f => (
                <View key={f.k} style={{ marginBottom:12 }}>
                  <Text style={s.fieldLabel}>{f.l}</Text>
                  <View style={[s.inputRow, f.multi && { alignItems:"flex-start" }]}>
                    <Ionicons name={f.ic} size={16} color={C.muted} style={{ marginTop: f.multi ? 14 : 0 }} />
                    <TextInput value={form[f.k]} onChangeText={v => setForm(p => ({...p,[f.k]:v}))} multiline={f.multi} numberOfLines={f.multi?3:1}
                      style={[s.input, f.multi && { textAlignVertical:"top", height:80 }]} placeholderTextColor={C.muted} />
                  </View>
                </View>
              ))}
              <View style={s.editBtns}>
                <TouchableOpacity onPress={() => setEditing(false)} style={s.cancelBtn}><Text style={s.cancelText}>{fr?"Annuler":"Cancel"}</Text></TouchableOpacity>
                <TouchableOpacity onPress={save} disabled={saving} style={s.saveBtn}><Text style={s.saveBtnText}>{saving?"...":fr?"Sauvegarder":"Save"}</Text></TouchableOpacity>
              </View>
            </View>
          : <TouchableOpacity onPress={() => setEditing(true)} style={s.navItem}>
              <Ionicons name="create-outline" size={20} color={C.primary} />
              <Text style={s.navLabel}>{fr?"Modifier le profil":"Edit Profile"}</Text>
              <Ionicons name="chevron-forward" size={16} color={C.muted} />
            </TouchableOpacity>
        }

        <Text style={s.sectionLabel}>{fr?"Mon compte":"My Account"}</Text>
        <NavItem icon="notifications-outline" label={fr?"Notifications":"Notifications"} onPress={() => router.push("/notifications")} />
        {auth.role==="customer" && <NavItem icon="calendar-outline" label={fr?"Mes réservations":"My Bookings"} onPress={() => router.push("/my-bookings")} />}
        {auth.role==="seller" && <>
          <NavItem icon="list-outline"       label={fr?"Mes annonces":"My Sales"}     onPress={() => router.push("/my-sales")} />
          <NavItem icon="add-circle-outline" label={fr?"Nouvelle annonce":"New Listing"} onPress={() => router.push("/new-sale")} />
        </>}
        {auth.role==="rental_owner" && <>
          <NavItem icon="car-outline"        label={fr?"Mon parc":"My Fleet"}         onPress={() => router.push("/my-fleet")} />
          <NavItem icon="clipboard-outline"  label={fr?"Réservations":"Bookings"}     onPress={() => router.push("/owner-bookings")} />
          <NavItem icon="add-circle-outline" label={fr?"Ajouter location":"Add Rental"} onPress={() => router.push("/add-rental")} />
        </>}

        <Text style={s.sectionLabel}>{fr?"Langue":"Language"}</Text>
        <View style={s.langRow}>
          {["en","fr"].map(l => (
            <TouchableOpacity key={l} onPress={() => setLang(l)} style={[s.langBtn, lang===l && s.langBtnActive]}>
              <Text style={[s.langText, lang===l && s.langTextActive]}>{l==="en"?"English":"Français"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={C.red} />
          <Text style={s.logoutText}>{fr?"Déconnexion":"Logout"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function NavItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.navItem}>
      <Ionicons name={icon} size={18} color={C.primary} />
      <Text style={s.navLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={C.muted} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  center: { flex:1, backgroundColor: C.bg, alignItems:"center", justifyContent:"center", padding:24 },
  emptyTitle: { color: C.white, fontWeight:"700", fontSize:20, marginTop:16, marginBottom:16 },
  btn: { backgroundColor: C.primary, borderRadius:12, paddingHorizontal:24, paddingVertical:12 },
  btnText: { color:"#fff", fontWeight:"700" },
  hero: { backgroundColor: C.surface, borderBottomWidth:1, borderBottomColor: C.border, alignItems:"center", paddingTop:56, paddingBottom:32, paddingHorizontal:16 },
  avatar: { width:96, height:96, borderRadius:48 },
  avatarPlaceholder: { width:96, height:96, borderRadius:48, backgroundColor:"rgba(124,107,255,0.2)", borderWidth:2, borderColor: C.primary, alignItems:"center", justifyContent:"center" },
  avatarText: { color: C.primary, fontWeight:"700", fontSize:36 },
  cameraBadge: { position:"absolute", bottom:0, right:0, backgroundColor: C.primary, borderRadius:12, padding:4 },
  name: { color: C.white, fontWeight:"700", fontSize:22, marginBottom:6 },
  roleBadge: { backgroundColor:"rgba(124,107,255,0.1)", borderWidth:1, borderColor:"rgba(124,107,255,0.3)", borderRadius:20, paddingHorizontal:12, paddingVertical:4, marginBottom:8 },
  roleText: { color: C.primary, fontSize:12, fontWeight:"600", textTransform:"capitalize" },
  cityRow: { flexDirection:"row", alignItems:"center" },
  city: { color: C.muted, fontSize:13, marginLeft:4 },
  bio: { color: "#cbd5e1", fontSize:13, textAlign:"center", marginTop:12, lineHeight:20, paddingHorizontal:16 },
  card: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:16, padding:16, marginBottom:16 },
  cardTitle: { color: C.white, fontWeight:"700", fontSize:16, marginBottom:16 },
  fieldLabel: { color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 },
  inputRow: { backgroundColor: C.surface, borderRadius:12, borderWidth:1, borderColor: C.border, flexDirection:"row", alignItems:"center", paddingHorizontal:12 },
  input: { flex:1, color: C.white, paddingVertical:12, marginLeft:8 },
  editBtns: { flexDirection:"row", gap:12, marginTop:4 },
  cancelBtn: { flex:1, backgroundColor: C.surface, borderRadius:12, paddingVertical:12, alignItems:"center", borderWidth:1, borderColor: C.border },
  cancelText: { color: C.muted, fontWeight:"500" },
  saveBtn: { flex:1, backgroundColor: C.primary, borderRadius:12, paddingVertical:12, alignItems:"center" },
  saveBtnText: { color:"#fff", fontWeight:"700" },
  sectionLabel: { color: C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:0.5, marginTop:16, marginBottom:8 },
  navItem: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:14, marginBottom:8, gap:12 },
  navLabel: { color: C.white, fontWeight:"500", flex:1 },
  langRow: { flexDirection:"row", gap:12, marginBottom:8 },
  langBtn: { flex:1, backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, paddingVertical:12, alignItems:"center" },
  langBtnActive: { backgroundColor:"rgba(124,107,255,0.15)", borderColor: C.primary },
  langText: { color: C.muted, fontWeight:"700" },
  langTextActive: { color: C.primary },
  logoutBtn: { backgroundColor:"rgba(239,68,68,0.08)", borderWidth:1, borderColor:"rgba(239,68,68,0.25)", borderRadius:16, flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:16, marginTop:8, marginBottom:32, gap:12 },
  logoutText: { color: C.red, fontWeight:"500" },
});
