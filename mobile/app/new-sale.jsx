import { useState, useMemo } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { createSale } from "../src/api/sale";
import { uploadListingImages } from "../src/api/upload";
import { useAppLang } from "../src/context/AppLangContext";
import { useTheme } from "../src/context/ThemeContext";

const FIELDS = [
  { key:"title",       label:{ en:"Title", fr:"Titre" },                 ph:{ en:"e.g. Toyota Corolla 2020", fr:"ex. Toyota Corolla 2020" } },
  { key:"brand",       label:{ en:"Brand", fr:"Marque" },                ph:{ en:"Toyota", fr:"Toyota" } },
  { key:"model",       label:{ en:"Model", fr:"Modèle" },                ph:{ en:"Corolla", fr:"Corolla" } },
  { key:"year",        label:{ en:"Year", fr:"Année" },                  ph:{ en:"2020", fr:"2020" }, keyboard:"numeric" },
  { key:"mileage",     label:{ en:"Mileage (km)", fr:"Km" },             ph:{ en:"50000", fr:"50000" }, keyboard:"numeric" },
  { key:"price",       label:{ en:"Price (MAD)", fr:"Prix (MAD)" },      ph:{ en:"150000", fr:"150000" }, keyboard:"numeric" },
  { key:"fuel",        label:{ en:"Fuel", fr:"Carburant" },              ph:{ en:"Gasoline / Diesel / Electric", fr:"Essence / Diesel / Électrique" } },
  { key:"gearbox",     label:{ en:"Gearbox", fr:"Boîte" },              ph:{ en:"Manual / Automatic", fr:"Manuelle / Automatique" } },
  { key:"city",        label:{ en:"City", fr:"Ville" },                  ph:{ en:"Casablanca", fr:"Casablanca" } },
  { key:"description", label:{ en:"Description", fr:"Description" },     ph:{ en:"Describe the car…", fr:"Décrivez la voiture…" }, multi:true },
];

export default function NewSaleScreen() {
  const { lang } = useAppLang();
  const { colors: C } = useTheme();
  const s = useMemo(() => createNewSaleStyles(C), [C]);
  const router = useRouter();
  const fr = lang === "fr";

  const [form, setForm] = useState({ title:"", brand:"", model:"", year:"", mileage:"", price:"", fuel:"", gearbox:"", city:"", description:"" });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: "images", allowsMultipleSelection:true, quality:0.75, selectionLimit:6 });
    if (!result.canceled) setImages(prev => [...prev, ...result.assets].slice(0, 6));
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return Alert.alert("Camera permission required");
    const result = await ImagePicker.launchCameraAsync({ quality:0.75, allowsEditing:true });
    if (!result.canceled) setImages(prev => [...prev, result.assets[0]].slice(0, 6));
  };

  const detectLocation = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) return Alert.alert("Location permission required");
      const loc = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(loc.coords);
      if (geo[0]) set("city", geo[0].city || geo[0].region || geo[0].subregion || "");
    } catch { Alert.alert("Could not detect location"); }
    finally { setLocating(false); }
  };

  const handleSubmit = async () => {
    if (!form.title?.trim() || !form.price || !form.brand?.trim() || !form.model?.trim()) {
      return Alert.alert(fr ? "Champs requis" : "Required fields", fr ? "Remplissez titre, marque, modèle et prix." : "Fill in title, brand, model and price.");
    }
    if (!form.city?.trim()) {
      return Alert.alert(fr ? "Ville" : "City", fr ? "La ville est requise." : "City is required.");
    }
    const yearNum = parseInt(String(form.year), 10);
    const priceNum = parseFloat(String(form.price));
    if (!Number.isFinite(yearNum) || yearNum < 1900) {
      return Alert.alert(fr ? "Année" : "Year", fr ? "Année invalide" : "Invalid year");
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return Alert.alert(fr ? "Prix" : "Price", fr ? "Prix invalide" : "Invalid price");
    }
    setLoading(true);
    try {
      let imageUrls = [];
      if (images.length) {
        const files = images.map((img, i) => ({
          uri: img.uri,
          name: `photo_${i}.jpg`,
          type: img.mimeType || "image/jpeg",
        }));
        imageUrls = await uploadListingImages(files);
      }
      const payload = {
        title: form.title.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: yearNum,
        price: priceNum,
        city: form.city.trim(),
        description: form.description?.trim() || undefined,
        mileage: form.mileage ? parseInt(String(form.mileage), 10) : undefined,
        fuel: form.fuel?.trim() || undefined,
        gearbox: form.gearbox?.trim() || undefined,
        images: imageUrls,
      };
      await createSale(payload);
      Alert.alert(fr ? "Succès" : "Success", fr ? "Annonce soumise pour approbation." : "Listing submitted for approval.", [{ text:"OK", onPress:() => router.back() }]);
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to create listing");
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex:1, backgroundColor: C.bg }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={{ padding:16 }} keyboardShouldPersistTaps="handled">

        {/* Photos */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            {fr ? "Photos" : "Photos"} <Text style={s.sectionSub}>({images.length}/6)</Text>
          </Text>
          <View style={s.photosGrid}>
            {images.map((img, i) => (
              <View key={i} style={{ position:"relative" }}>
                <Image source={{ uri: img.uri }} style={s.photoThumb} resizeMode="cover" />
                <TouchableOpacity onPress={() => setImages(prev => prev.filter((_, idx) => idx !== i))} style={s.removeBtn}>
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 6 && (
              <View style={{ flexDirection:"row", gap:8 }}>
                <TouchableOpacity onPress={pickImages} style={s.addPhotoBtn}>
                  <Ionicons name="image-outline" size={28} color={C.muted} />
                  <Text style={s.addPhotoBtnText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhoto} style={s.addPhotoBtn}>
                  <Ionicons name="camera-outline" size={28} color={C.muted} />
                  <Text style={s.addPhotoBtnText}>Camera</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Fields */}
        {FIELDS.map(f => (
          <View key={f.key} style={s.fieldWrap}>
            <Text style={s.fieldLabel}>{f.label[lang] || f.label.en}</Text>
            {f.key === "city" ? (
              <View style={s.cityRow}>
                <TextInput
                  value={form[f.key]} onChangeText={v => set(f.key, v)}
                  placeholder={f.ph[lang] || f.ph.en} placeholderTextColor={C.muted}
                  style={s.cityInput}
                />
                <TouchableOpacity onPress={detectLocation} disabled={locating} style={s.gpsBtn}>
                  {locating ? <ActivityIndicator size="small" color={C.primary} /> : <Ionicons name="locate" size={15} color={C.primary} />}
                  <Text style={s.gpsBtnText}>GPS</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TextInput
                value={form[f.key]} onChangeText={v => set(f.key, v)}
                placeholder={f.ph[lang] || f.ph.en} placeholderTextColor={C.muted}
                keyboardType={f.keyboard || "default"} multiline={f.multi}
                numberOfLines={f.multi ? 4 : 1}
                style={[s.input, f.multi && { textAlignVertical:"top", height:100 }]}
              />
            )}
          </View>
        ))}

        <TouchableOpacity onPress={handleSubmit} disabled={loading} style={[s.submitBtn, loading && { opacity:0.7 }]}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.submitBtnText}>{fr ? "Publier l'annonce" : "Publish Listing"}</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createNewSaleStyles(C) {
  return StyleSheet.create({
    section: { marginBottom:24 },
    sectionTitle: { color: C.white, fontWeight:"700", fontSize:15, marginBottom:12 },
    sectionSub: { color: C.muted, fontWeight:"400", fontSize:13 },
    photosGrid: { flexDirection:"row", flexWrap:"wrap", gap:12 },
    photoThumb: { width:96, height:96, borderRadius:12 },
    removeBtn: { position:"absolute", top:-8, right:-8, backgroundColor:"#ef4444", borderRadius:10, padding:3 },
    addPhotoBtn: { width:96, height:96, backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderStyle:"dashed", borderRadius:12, alignItems:"center", justifyContent:"center" },
    addPhotoBtnText: { color: C.muted, fontSize:11, marginTop:4 },
    fieldWrap: { marginBottom:16 },
    fieldLabel: { color: C.label, fontSize:11, textTransform:"uppercase", letterSpacing:0.5, marginBottom:6 },
    input: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, color: C.white, paddingVertical:12, paddingHorizontal:16 },
    cityRow: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, flexDirection:"row", alignItems:"center", paddingRight:8 },
    cityInput: { flex:1, color: C.white, paddingVertical:12, paddingHorizontal:16 },
    gpsBtn: { backgroundColor: C.pillBg, borderWidth:1, borderColor: C.pillBorder, borderRadius:8, paddingHorizontal:8, paddingVertical:6, flexDirection:"row", alignItems:"center" },
    gpsBtnText: { color: C.primary, fontSize:12, marginLeft:4 },
    submitBtn: { backgroundColor: C.primary, borderRadius:12, paddingVertical:16, alignItems:"center", marginTop:8, marginBottom:32 },
    submitBtnText: { color:"#fff", fontWeight:"700", fontSize:15 },
  });
}
