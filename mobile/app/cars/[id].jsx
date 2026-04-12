import { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Linking, Dimensions, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getSaleById } from "../../src/api/sale";
import { startConversation } from "../../src/api/message";
import { addFavorite, removeFavorite, getFavorites } from "../../src/api/user";
import ReviewSection from "../../src/components/ReviewSection";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { SERVER_URL } from "../../src/config";
import { C } from "../../src/theme";

const { width } = Dimensions.get("window");

export default function CarDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const router = useRouter();
  const t = lang === "fr" ? fr : en;

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    getSaleById(id)
      .then(({ data }) => setCar(data))
      .catch(() => Alert.alert("Error", "Failed to load car"))
      .finally(() => setLoading(false));
    if (auth) {
      getFavorites().then(({ data }) => setIsFav(data.some(f => (f._id||f) === id))).catch(() => {});
    }
  }, [id]);

  const toggleFav = async () => {
    if (!auth) return Alert.alert(t.favLogin);
    try {
      if (isFav) { await removeFavorite(id); setIsFav(false); }
      else { await addFavorite(id); setIsFav(true); }
    } catch { Alert.alert(t.favFail); }
  };

  const contactSeller = async () => {
    if (!auth) return Alert.alert(t.signInContact);
    setContacting(true);
    try {
      await startConversation({ participantId: car.seller?._id });
      router.push("/(tabs)/messages");
    } catch { Alert.alert("Failed to open conversation"); }
    setContacting(false);
  };

  if (loading) return <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>;
  if (!car) return (
    <View style={s.center}>
      <Ionicons name="car-outline" size={56} color="#4b5563" />
      <Text style={s.notFoundText}>{t.notFound}</Text>
    </View>
  );

  const images = car.images || [];

  return (
    <ScrollView style={{ flex:1, backgroundColor: C.bg }} showsVerticalScrollIndicator={false}>
      {/* Image gallery */}
      <View style={{ backgroundColor: C.surface }}>
        {images.length > 0 ? (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onScroll={e => setImgIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
            scrollEventThrottle={16}>
            {images.map((img, i) => (
              <Image key={i} source={{ uri: `${SERVER_URL}/uploads/${img}` }} style={{ width, height: 280 }} resizeMode="cover" />
            ))}
          </ScrollView>
        ) : (
          <View style={[{ width, height: 280 }, s.center]}>
            <Ionicons name="car-outline" size={72} color="#4b5563" />
            <Text style={s.muted}>{t.noImage}</Text>
          </View>
        )}

        {images.length > 1 && (
          <View style={s.dotsRow}>
            {images.map((_, i) => (
              <View key={i} style={[s.dot, i === imgIndex ? s.dotActive : s.dotInactive]} />
            ))}
          </View>
        )}

        <TouchableOpacity onPress={toggleFav} style={s.favBtn}>
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? C.red : C.white} />
        </TouchableOpacity>

        {car.status === "sold" && (
          <View style={s.soldBadge}><Text style={s.badgeText}>SOLD</Text></View>
        )}
        {car.status === "approved" && (
          <View style={s.approvedBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#fff" />
            <Text style={[s.badgeText, { marginLeft:4 }]}>{t.approved}</Text>
          </View>
        )}
      </View>

      <View style={s.body}>
        {/* Title & Price */}
        <View style={s.titleRow}>
          <Text style={s.title}>{car.title || `${car.brand} ${car.model}`}</Text>
          <Text style={s.price}>{car.price ? `${Number(car.price).toLocaleString()} MAD` : "—"}</Text>
        </View>
        <View style={s.metaRow}>
          <Ionicons name="location-outline" size={14} color={C.muted} />
          <Text style={s.metaText}>{car.city || t.unknownCity}</Text>
          <Text style={s.metaDot}>·</Text>
          <Text style={s.metaText}>{car.year || t.yearNA}</Text>
        </View>

        {/* Specs */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t.specifications}</Text>
          <View style={s.specsGrid}>
            {[
              { icon:"business-outline", label:t.brand, value:car.brand },
              { icon:"car-outline", label:t.model, value:car.model },
              { icon:"calendar-outline", label:t.year, value:car.year },
              { icon:"speedometer-outline", label:t.mileage, value:car.mileage ? `${Number(car.mileage).toLocaleString()} ${t.km}` : null },
              { icon:"flame-outline", label:t.fuel, value:car.fuel },
              { icon:"settings-outline", label:t.gearbox, value:car.gearbox },
            ].filter(spec => spec.value).map(spec => (
              <View key={spec.label} style={s.specItem}>
                <View style={s.specLabelRow}>
                  <Ionicons name={spec.icon} size={13} color={C.muted} />
                  <Text style={s.specLabel}>{spec.label}</Text>
                </View>
                <Text style={s.specValue}>{spec.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description */}
        {car.description && (
          <View style={s.card}>
            <Text style={s.cardTitle}>{t.description}</Text>
            <Text style={s.descText}>{car.description}</Text>
          </View>
        )}

        {/* Seller */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t.seller}</Text>
          <TouchableOpacity onPress={() => router.push(`/seller/${car.seller?._id}`)} style={s.sellerRow}>
            <View style={s.sellerAvatar}>
              <Text style={s.sellerAvatarText}>{car.seller?.name?.[0]?.toUpperCase() || "?"}</Text>
            </View>
            <View style={{ flex:1 }}>
              <Text style={s.sellerName}>{car.seller?.name || t.unknownSeller}</Text>
              <View style={{ flexDirection:"row", alignItems:"center", marginTop:2 }}>
                <Ionicons name="shield-checkmark" size={12} color={C.green} />
                <Text style={s.verifiedText}>{t.verifiedSeller}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>
        </View>

        {/* Contact */}
        {auth ? (
          <View style={s.actionsGap}>
            {car.seller?.phone && (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${car.seller.phone}`)} style={s.callBtn}>
                <Ionicons name="call" size={18} color="#fff" />
                <Text style={s.actionBtnText}>{t.callSeller}</Text>
              </TouchableOpacity>
            )}
            {car.seller?.phone && (
              <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${car.seller.phone}`)} style={s.waBtn}>
                <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                <Text style={s.actionBtnText}>{t.whatsapp}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={contactSeller} disabled={contacting} style={[s.msgBtn, contacting && { opacity:0.7 }]}>
              <Ionicons name="chatbubble-outline" size={18} color={C.primary} />
              <Text style={s.msgBtnText}>{contacting ? "Opening…" : lang === "fr" ? "Envoyer un message" : "Send Message"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[s.card, s.loginPrompt]}>
            <Ionicons name="lock-closed-outline" size={28} color={C.muted} />
            <Text style={s.loginPromptText}>
              <Text style={s.loginLink} onPress={() => router.push("/(auth)/login")}>{t.signInContact}</Text>
              {" "}{t.signInContactRest}
            </Text>
          </View>
        )}

        <ReviewSection targetModel="SaleListing" targetId={id} />
      </View>
    </ScrollView>
  );
}

const en = {
  notFound:"Vehicle not found.", noImage:"No image available",
  specifications:"Specifications", brand:"Brand", model:"Model",
  year:"Year", mileage:"Mileage", fuel:"Fuel", gearbox:"Gearbox",
  description:"Description", approved:"Approved", seller:"Seller",
  unknownSeller:"Unknown Seller", verifiedSeller:"Verified Seller",
  callSeller:"Call Seller", whatsapp:"WhatsApp",
  signInContact:"Sign in", signInContactRest:"to contact the seller.",
  km:"km", unknownCity:"Unknown city", yearNA:"Year N/A",
  favLogin:"Please login to save favorites", favFail:"Failed to update favorites",
};
const fr = {
  notFound:"Véhicule introuvable.", noImage:"Aucune image",
  specifications:"Caractéristiques", brand:"Marque", model:"Modèle",
  year:"Année", mileage:"Kilométrage", fuel:"Carburant", gearbox:"Boîte",
  description:"Description", approved:"Approuvée", seller:"Vendeur",
  unknownSeller:"Vendeur inconnu", verifiedSeller:"Vendeur vérifié",
  callSeller:"Appeler", whatsapp:"WhatsApp",
  signInContact:"Connectez-vous", signInContactRest:"pour contacter le vendeur.",
  km:"km", unknownCity:"Ville inconnue", yearNA:"Année N/A",
  favLogin:"Connectez-vous pour sauvegarder", favFail:"Impossible de mettre à jour",
};

const s = StyleSheet.create({
  center: { flex:1, alignItems:"center", justifyContent:"center", padding:24, backgroundColor: C.bg },
  notFoundText: { color: C.white, fontWeight:"700", fontSize:18, marginTop:16 },
  muted: { color: C.muted, marginTop:8 },
  dotsRow: { position:"absolute", bottom:12, left:0, right:0, flexDirection:"row", justifyContent:"center", gap:6 },
  dot: { borderRadius:4 },
  dotActive: { width:16, height:8, backgroundColor: C.primary },
  dotInactive: { width:8, height:8, backgroundColor:"rgba(255,255,255,0.4)" },
  favBtn: { position:"absolute", top:16, right:16, backgroundColor:"rgba(5,6,15,0.8)", borderRadius:20, padding:10 },
  soldBadge: { position:"absolute", top:16, left:16, backgroundColor:"#dc2626", borderRadius:20, paddingHorizontal:12, paddingVertical:4 },
  approvedBadge: { position:"absolute", top:16, left:16, backgroundColor:"rgba(22,163,74,0.9)", borderRadius:20, paddingHorizontal:12, paddingVertical:4, flexDirection:"row", alignItems:"center" },
  badgeText: { color:"#fff", fontSize:12, fontWeight:"700" },
  body: { paddingHorizontal:16, paddingVertical:24 },
  titleRow: { flexDirection:"row", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 },
  title: { color: C.white, fontWeight:"700", fontSize:22, flex:1, marginRight:8 },
  price: { color: C.primary, fontWeight:"700", fontSize:20 },
  metaRow: { flexDirection:"row", alignItems:"center", marginBottom:16 },
  metaText: { color: C.muted, fontSize:13, marginLeft:4 },
  metaDot: { color: C.muted, marginHorizontal:8 },
  card: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:16, padding:16, marginBottom:16 },
  cardTitle: { color: C.white, fontWeight:"700", fontSize:15, marginBottom:12 },
  specsGrid: { flexDirection:"row", flexWrap:"wrap", gap:12 },
  specItem: { backgroundColor: C.surface, borderWidth:1, borderColor: C.border, borderRadius:12, paddingHorizontal:12, paddingVertical:10, width:"47%" },
  specLabelRow: { flexDirection:"row", alignItems:"center", marginBottom:4 },
  specLabel: { color: C.muted, fontSize:11, marginLeft:4 },
  specValue: { color: C.white, fontWeight:"500", fontSize:13 },
  descText: { color:"#cbd5e1", fontSize:13, lineHeight:20 },
  sellerRow: { flexDirection:"row", alignItems:"center" },
  sellerAvatar: { width:48, height:48, borderRadius:24, backgroundColor:"rgba(124,107,255,0.2)", alignItems:"center", justifyContent:"center", marginRight:12 },
  sellerAvatarText: { color: C.primary, fontWeight:"700", fontSize:18 },
  sellerName: { color: C.white, fontWeight:"700" },
  verifiedText: { color: C.green, fontSize:12, marginLeft:4 },
  actionsGap: { gap:12, marginBottom:24 },
  callBtn: { backgroundColor:"#16a34a", borderRadius:12, paddingVertical:16, flexDirection:"row", alignItems:"center", justifyContent:"center" },
  waBtn: { backgroundColor:"#25d366", borderRadius:12, paddingVertical:16, flexDirection:"row", alignItems:"center", justifyContent:"center" },
  msgBtn: { backgroundColor:"rgba(124,107,255,0.15)", borderWidth:1, borderColor:"rgba(124,107,255,0.4)", borderRadius:12, paddingVertical:16, flexDirection:"row", alignItems:"center", justifyContent:"center" },
  actionBtnText: { color:"#fff", fontWeight:"700", marginLeft:8 },
  msgBtnText: { color: C.primary, fontWeight:"700", marginLeft:8 },
  loginPrompt: { alignItems:"center", marginBottom:24 },
  loginPromptText: { color:"#cbd5e1", fontSize:13, textAlign:"center", marginTop:8 },
  loginLink: { color: C.primary, fontWeight:"700" },
});
