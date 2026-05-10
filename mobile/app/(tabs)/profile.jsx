import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getMyProfile, updateMyProfile, updateDriverLicense, updateNationalId } from "../../src/api/user";
import { uploadAvatarFile, uploadListingImages } from "../../src/api/upload";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import ThemeToggle from "../../src/components/ThemeToggle";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";

const ROLES = { customer:{en:"Customer",fr:"Client"}, seller:{en:"Seller",fr:"Vendeur"}, rental_owner:{en:"Rental Owner",fr:"Propriétaire"}, admin:{en:"Admin",fr:"Admin"} };

export default function ProfileScreen() {
  const { auth, logout } = useAuth();
  const { lang, setLang } = useAppLang();
  const { colors: C } = useTheme();
  const router = useRouter();
  const fr = lang === "fr";
  const s = useMemo(() => createProfileStyles(C), [C]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name:"", city:"", bio:"" });
  const [licForm, setLicForm] = useState({ number:"", expiryDate:"", imageUrl:"" });
  const [cinForm, setCinForm] = useState({ number:"", imageUrl:"" });
  const [licSaving, setLicSaving] = useState(false);
  const [cinSaving, setCinSaving] = useState(false);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    getMyProfile().then(({ data }) => { setProfile(data); setForm({ name:data.name||"", city:data.city||"", bio:data.bio||"" }); }).catch(() => {}).finally(() => setLoading(false));
  }, [auth]);

  useEffect(() => {
    if (!profile) return;
    const dl = profile.driverLicense;
    setLicForm({
      number: dl?.number || "",
      expiryDate: dl?.expiryDate ? String(dl.expiryDate).slice(0, 10) : "",
      imageUrl: dl?.imageUrl || "",
    });
    const ni = profile.nationalId;
    setCinForm({
      number: ni?.number || "",
      imageUrl: ni?.imageUrl || "",
    });
  }, [profile]);

  const pickAvatar = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsEditing:true, aspect:[1,1], quality:0.7 });
    if (r.canceled) return;
    try {
      const asset = r.assets[0];
      const url = await uploadAvatarFile({ uri: asset.uri, name: "avatar.jpg", type: asset.mimeType || "image/jpeg" });
      const { data } = await updateMyProfile({ avatar: url });
      setProfile(data);
    } catch { Alert.alert(fr ? "Échec" : "Failed to update avatar"); }
  };

  const save = async () => {
    setSaving(true);
    try { const { data } = await updateMyProfile(form); setProfile(data); setEditing(false); }
    catch { Alert.alert("Failed to save"); }
    setSaving(false);
  };

  const handleLogout = () => Alert.alert(fr?"Déconnexion":"Logout", fr?"Êtes-vous sûr ?":"Are you sure?",
    [{ text: fr?"Annuler":"Cancel" }, { text: fr?"Déconnexion":"Logout", style:"destructive", onPress: logout }]);

  const pickDoc = async (applyUrl) => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 0.85,
    });
    if (r.canceled) return;
    try {
      const asset = r.assets[0];
      const [url] = await uploadListingImages([
        { uri: asset.uri, name: "doc.jpg", type: asset.mimeType || "image/jpeg" },
      ]);
      applyUrl(url);
    } catch (e) {
      const serverMsg = e?.response?.data?.message;
      Alert.alert(
        fr ? "Échec" : "Failed",
        serverMsg || (fr ? "Envoi de l'image impossible" : "Could not upload image")
      );
    }
  };

  const saveLicenseDoc = async () => {
    if (!licForm.number?.trim() || !licForm.imageUrl) {
      Alert.alert(fr ? "Permis incomplet" : "License incomplete", fr ? "Numéro et photo requis." : "Number and photo required.");
      return;
    }
    setLicSaving(true);
    try {
      const { data } = await updateDriverLicense({
        number: licForm.number.trim(),
        expiryDate: licForm.expiryDate || null,
        imageUrl: licForm.imageUrl,
      });
      setProfile(data);
      Alert.alert(fr ? "Enregistré" : "Saved", fr ? "Permis mis à jour." : "License updated.");
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || (fr ? "Échec" : "Failed"));
    }
    setLicSaving(false);
  };

  const saveCinDoc = async () => {
    if (!cinForm.number?.trim() || !cinForm.imageUrl) {
      Alert.alert(fr ? "CIN incomplet" : "ID incomplete", fr ? "Numéro et photo requis." : "Number and photo required.");
      return;
    }
    setCinSaving(true);
    try {
      const { data } = await updateNationalId({
        number: cinForm.number.trim(),
        imageUrl: cinForm.imageUrl,
      });
      setProfile(data);
      Alert.alert(fr ? "Enregistré" : "Saved", fr ? "CIN mis à jour." : "National ID updated.");
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || (fr ? "Échec" : "Failed"));
    }
    setCinSaving(false);
  };

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

  const avatarUri = resolveMediaUrl(profile?.avatar);
  const avatarUrl = avatarUri ? { uri: avatarUri } : null;

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

        <Text style={s.sectionLabel}>{fr ? "Location — documents" : "Rentals — documents"}</Text>
        <Text style={s.docHint}>
          {fr
            ? "Téléversez votre permis et votre CIN pour réserver un véhicule."
            : "Upload your license and national ID (CIN) to book a rental car."}
        </Text>

        <View style={s.card}>
          <Text style={s.cardTitle}>{fr ? "Permis de conduire" : "Driving license"}</Text>
          {!!profile?.driverLicense?.verified && (
            <Text style={s.docVerified}>{fr ? "✓ Vérifié" : "✓ Verified"}</Text>
          )}
          {!profile?.driverLicense?.verified && profile?.driverLicense?.number ? (
            <Text style={s.docPending}>{fr ? "Vérification en attente" : "Pending verification"}</Text>
          ) : null}
          <Text style={s.fieldLabel}>{fr ? "Numéro" : "Number"}</Text>
          <View style={s.inputRow}>
            <Ionicons name="card-outline" size={16} color={C.muted} />
            <TextInput
              value={licForm.number}
              onChangeText={(v) => setLicForm((p) => ({ ...p, number: v }))}
              style={s.input}
              placeholderTextColor={C.muted}
              placeholder={fr ? "ex. B-123456" : "e.g. B-123456"}
            />
          </View>
          <Text style={[s.fieldLabel, { marginTop: 12 }]}>{fr ? "Expiration (optionnel)" : "Expiry (optional)"}</Text>
          <View style={s.inputRow}>
            <Ionicons name="calendar-outline" size={16} color={C.muted} />
            <TextInput
              value={licForm.expiryDate}
              onChangeText={(v) => setLicForm((p) => ({ ...p, expiryDate: v }))}
              style={s.input}
              placeholderTextColor={C.muted}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <Text style={[s.fieldLabel, { marginTop: 12 }]}>{fr ? "Photo du permis" : "License photo"}</Text>
          <TouchableOpacity onPress={() => pickDoc((url) => setLicForm((p) => ({ ...p, imageUrl: url })))} style={s.docPick}>
            {licForm.imageUrl ? (
              <Image source={{ uri: resolveMediaUrl(licForm.imageUrl) }} style={s.docThumb} />
            ) : (
              <Text style={s.docPickText}>{fr ? "Choisir une photo" : "Choose photo"}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={saveLicenseDoc} disabled={licSaving} style={[s.saveBtn, { marginTop: 12 }]}>
            <Text style={s.saveBtnText}>{licSaving ? "…" : fr ? "Enregistrer le permis" : "Save license"}</Text>
          </TouchableOpacity>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{fr ? "CIN (carte d'identité)" : "National ID (CIN)"}</Text>
          {!!profile?.nationalId?.verified && (
            <Text style={s.docVerified}>{fr ? "✓ Vérifié" : "✓ Verified"}</Text>
          )}
          {!profile?.nationalId?.verified && profile?.nationalId?.number ? (
            <Text style={s.docPending}>{fr ? "Vérification en attente" : "Pending verification"}</Text>
          ) : null}
          <Text style={s.fieldLabel}>{fr ? "Numéro CIN" : "ID number"}</Text>
          <View style={s.inputRow}>
            <Ionicons name="id-card-outline" size={16} color={C.muted} />
            <TextInput
              value={cinForm.number}
              onChangeText={(v) => setCinForm((p) => ({ ...p, number: v }))}
              style={s.input}
              placeholderTextColor={C.muted}
              placeholder={fr ? "ex. AB123456" : "e.g. AB123456"}
            />
          </View>
          <Text style={[s.fieldLabel, { marginTop: 12 }]}>{fr ? "Photo recto / CIN" : "ID photo"}</Text>
          <TouchableOpacity onPress={() => pickDoc((url) => setCinForm((p) => ({ ...p, imageUrl: url })))} style={s.docPick}>
            {cinForm.imageUrl ? (
              <Image source={{ uri: resolveMediaUrl(cinForm.imageUrl) }} style={s.docThumb} />
            ) : (
              <Text style={s.docPickText}>{fr ? "Choisir une photo" : "Choose photo"}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={saveCinDoc} disabled={cinSaving} style={[s.saveBtn, { marginTop: 12 }]}>
            <Text style={s.saveBtnText}>{cinSaving ? "…" : fr ? "Enregistrer le CIN" : "Save national ID"}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.sectionLabel}>{fr?"Mon compte":"My Account"}</Text>
        <NavItem s={s} C={C} icon="notifications-outline" label={fr?"Notifications":"Notifications"} onPress={() => router.push("/notifications")} />
        {auth.role==="customer" && <NavItem s={s} C={C} icon="calendar-outline" label={fr?"Mes réservations":"My Bookings"} onPress={() => router.push("/my-bookings")} />}
        {auth.role==="seller" && <>
          <NavItem s={s} C={C} icon="list-outline"       label={fr?"Mes annonces":"My Sales"}     onPress={() => router.push("/my-sales")} />
          <NavItem s={s} C={C} icon="add-circle-outline" label={fr?"Nouvelle annonce":"New Listing"} onPress={() => router.push("/new-sale")} />
        </>}
        {auth.role==="rental_owner" && <>
          <NavItem s={s} C={C} icon="analytics-outline"  label={fr?"Statistiques & analyses":"Analytics & insights"} onPress={() => router.push("/owner-analytics")} />
          <NavItem s={s} C={C} icon="car-outline"        label={fr?"Mon parc":"My Fleet"}         onPress={() => router.push("/my-fleet")} />
          <NavItem s={s} C={C} icon="construct-outline" label={fr?"Maintenance":"Maintenance"} onPress={() => router.push("/maintenance")} />
          <NavItem s={s} C={C} icon="clipboard-outline"  label={fr?"Réservations":"Bookings"}     onPress={() => router.push("/owner-bookings")} />
          <NavItem s={s} C={C} icon="add-circle-outline" label={fr?"Ajouter location":"Add Rental"} onPress={() => router.push("/add-rental")} />
        </>}
        {auth.role==="admin" && (
          <NavItem s={s} C={C} icon="shield-checkmark-outline" label={fr?"Modération admin":"Admin Moderation"} onPress={() => router.push("/admin-moderation")} />
        )}

        <Text style={s.sectionLabel}>{fr ? "Langue & apparence" : "Language & appearance"}</Text>
        <View style={s.themeLangRow}>
          <ThemeToggle />
          <View style={s.langRowInner}>
            {["en", "fr"].map((l) => (
              <TouchableOpacity key={l} onPress={() => setLang(l)} style={[s.langBtn, lang === l && s.langBtnActive]}>
                <Text style={[s.langText, lang === l && s.langTextActive]}>{l === "en" ? "English" : "Français"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={C.red} />
          <Text style={s.logoutText}>{fr?"Déconnexion":"Logout"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function NavItem({ icon, label, onPress, s, C }) {
  return (
    <TouchableOpacity onPress={onPress} style={s.navItem}>
      <Ionicons name={icon} size={18} color={C.primary} />
      <Text style={s.navLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={C.muted} />
    </TouchableOpacity>
  );
}

function createProfileStyles(C) {
  const styles = StyleSheet.create({
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
  docHint: { color:"#94a3b8", fontSize:13, lineHeight:20, marginBottom:12 },
  docVerified: { color:"#4ade80", fontSize:12, fontWeight:"600", marginBottom:8 },
  docPending: { color:"#fbbf24", fontSize:12, marginBottom:8 },
  docPick: { backgroundColor: C.surface, borderWidth:1, borderColor: C.border, borderRadius:12, minHeight:120, alignItems:"center", justifyContent:"center", overflow:"hidden" },
  docPickText: { color: C.muted, fontSize:14 },
  docThumb: { width:"100%", height:160, resizeMode:"cover" },
  navItem: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:14, marginBottom:8, gap:12 },
  navLabel: { color: C.white, fontWeight:"500", flex:1 },
  themeLangRow: { gap:12, marginBottom:8 },
  langRowInner: { flexDirection:"row", gap:12 },
  langBtn: { flex:1, backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, paddingVertical:12, alignItems:"center" },
  langBtnActive: { backgroundColor:"rgba(124,107,255,0.15)", borderColor: C.primary },
  langText: { color: C.muted, fontWeight:"700" },
  langTextActive: { color: C.primary },
  logoutBtn: { backgroundColor:"rgba(239,68,68,0.08)", borderWidth:1, borderColor:"rgba(239,68,68,0.25)", borderRadius:16, flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:16, marginTop:8, marginBottom:32, gap:12 },
  logoutText: { color: C.red, fontWeight:"500" },
  });
  return styles;
}
