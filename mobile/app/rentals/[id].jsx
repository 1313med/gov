import { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getRentalById, bookRental } from "../../src/api/rental";
import { startConversation } from "../../src/api/message";
import { addRentalFavorite, removeRentalFavorite, getRentalFavorites } from "../../src/api/user";
import ReviewSection from "../../src/components/ReviewSection";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { SERVER_URL } from "../../src/config";
import { C } from "../../src/theme";

const { width } = Dimensions.get("window");

function DatePicker({ label, value, onChange }) {
  const today = new Date();
  const [show, setShow] = useState(false);
  const [day, setDay] = useState(today.getDate());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const confirm = () => {
    const d = new Date(year, month - 1, day);
    onChange(d.toISOString().split("T")[0]);
    setShow(false);
  };

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <View style={{ flex:1 }}>
      <Text style={ds.label}>{label}</Text>
      <TouchableOpacity onPress={() => setShow(!show)} style={ds.trigger}>
        <Ionicons name="calendar-outline" size={16} color={C.muted} />
        <Text style={[ds.triggerText, value ? { color: C.white } : { color: C.muted }]}>{value || "Select"}</Text>
      </TouchableOpacity>
      {show && (
        <View style={ds.picker}>
          <View style={ds.pickerRow}>
            {[
              { label:"Day", val:day, min:1, max:31, set:setDay },
              { label:"Month", val:months[month-1], rawVal:month, min:1, max:12, set:setMonth },
              { label:"Year", val:year, set:setYear },
            ].map((col, idx) => (
              <View key={idx} style={ds.col}>
                <Text style={ds.colLabel}>{col.label}</Text>
                <View style={ds.colCtrl}>
                  <TouchableOpacity onPress={() => col.set(v => col.min !== undefined ? Math.max(col.min, v - 1) : v - 1)} style={ds.ctrlBtn}>
                    <Ionicons name="remove" size={16} color={C.primary} />
                  </TouchableOpacity>
                  <Text style={ds.colVal}>{col.val}</Text>
                  <TouchableOpacity onPress={() => col.set(v => col.max !== undefined ? Math.min(col.max, v + 1) : v + 1)} style={ds.ctrlBtn}>
                    <Ionicons name="add" size={16} color={C.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity onPress={confirm} style={ds.confirmBtn}>
            <Text style={ds.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function RentalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const router = useRouter();
  const t = lang === "fr" ? fr : en;

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [booking, setBooking] = useState(false);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    getRentalById(id)
      .then(({ data }) => setRental(data))
      .catch(() => Alert.alert("Error", "Failed to load rental"))
      .finally(() => setLoading(false));
    if (auth) {
      getRentalFavorites().then(({ data }) => setIsFav(data.some(f => (f._id||f) === id))).catch(() => {});
    }
  }, [id]);

  const toggleFav = async () => {
    if (!auth) return Alert.alert(t.needAuth);
    try {
      if (isFav) { await removeRentalFavorite(id); setIsFav(false); }
      else { await addRentalFavorite(id); setIsFav(true); }
    } catch {}
  };

  const days = (() => {
    if (!startDate || !endDate) return 0;
    const diff = (new Date(endDate) - new Date(startDate)) / 86400000;
    return diff > 0 ? diff : 0;
  })();
  const total = days * (rental?.pricePerDay || 0);

  const handleBook = async () => {
    if (!auth) return Alert.alert(t.needAuth);
    if (!startDate || !endDate) return Alert.alert(t.selectDatesError);
    if (days <= 0) return Alert.alert("End date must be after start date");
    setBooking(true);
    try {
      await bookRental(id, { startDate, endDate });
      Alert.alert("Success", t.bookSuccess);
      setStartDate(""); setEndDate("");
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || t.datesFail);
    }
    setBooking(false);
  };

  const contactOwner = async () => {
    if (!auth) return Alert.alert(t.needAuth);
    setContacting(true);
    try {
      await startConversation({ participantId: rental.owner?._id });
      router.push("/(tabs)/messages");
    } catch { Alert.alert("Failed to open conversation"); }
    setContacting(false);
  };

  if (loading) return <View style={s.center}><ActivityIndicator color={C.primary} size="large" /></View>;
  if (!rental) return <View style={s.center}><Text style={s.white}>{t.notFound}</Text></View>;

  const images = rental.images || [];

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
            <Ionicons name="car-sport-outline" size={72} color="#4b5563" />
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
        <View style={s.priceBadge}>
          <Text style={s.priceBadgeText}>{rental.pricePerDay} MAD/day</Text>
        </View>
      </View>

      <View style={s.body}>
        <Text style={s.title}>{rental.title || `${rental.brand} ${rental.model}`}</Text>
        <View style={s.metaRow}>
          <Ionicons name="location-outline" size={14} color={C.muted} />
          <Text style={s.metaText}>{rental.city || "Unknown city"}</Text>
          {rental.year && <><Text style={s.metaDot}>·</Text><Text style={s.metaText}>{rental.year}</Text></>}
        </View>

        {/* Specs */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t.specifications}</Text>
          <View style={s.specsGrid}>
            {[
              { icon:"business-outline", label:t.brand, value:rental.brand },
              { icon:"car-outline", label:t.model, value:rental.model },
              { icon:"calendar-outline", label:t.year, value:rental.year },
              { icon:"flame-outline", label:t.fuel, value:rental.fuel },
              { icon:"settings-outline", label:t.gearbox, value:rental.gearbox },
              { icon:"location-outline", label:t.city, value:rental.city },
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

        {rental.description && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Description</Text>
            <Text style={s.descText}>{rental.description}</Text>
          </View>
        )}

        {/* Booking card */}
        <View style={s.card}>
          <Text style={s.cardTitle}>{t.selectDates}</Text>
          <View style={s.datesRow}>
            <DatePicker label={t.start} value={startDate} onChange={setStartDate} />
            <DatePicker label={t.end} value={endDate} onChange={setEndDate} />
          </View>

          {days > 0 && (
            <View style={s.summaryBox}>
              <View style={s.summaryRow}><Text style={s.summaryLabel}>{t.pricePerDay}</Text><Text style={s.summaryVal}>{rental.pricePerDay} MAD</Text></View>
              <View style={s.summaryRow}><Text style={s.summaryLabel}>{t.days}</Text><Text style={s.summaryVal}>{days}</Text></View>
              <View style={s.divider} />
              <View style={s.summaryRow}>
                <Text style={s.totalLabel}>{t.total}</Text>
                <Text style={s.totalVal}>{total.toLocaleString()} MAD</Text>
              </View>
            </View>
          )}

          {auth ? (
            <TouchableOpacity onPress={handleBook} disabled={booking} style={[s.bookBtn, booking && { opacity:0.7 }]}>
              <Text style={s.bookBtnText}>{booking ? t.booking : t.bookNow}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={s.loginBtn}>
              <Text style={s.loginBtnText}>{t.logIn}</Text>
            </TouchableOpacity>
          )}
        </View>

        {auth && (
          <TouchableOpacity onPress={contactOwner} disabled={contacting} style={[s.contactBtn, contacting && { opacity:0.7 }]}>
            <Ionicons name="chatbubble-outline" size={18} color={C.primary} />
            <Text style={s.contactBtnText}>{contacting ? "Opening…" : lang === "fr" ? "Contacter le propriétaire" : "Contact Owner"}</Text>
          </TouchableOpacity>
        )}

        <ReviewSection targetModel="RentalListing" targetId={id} />
      </View>
    </ScrollView>
  );
}

const en = {
  notFound:"Rental not found.", specifications:"Specifications",
  brand:"Brand", model:"Model", year:"Year", fuel:"Fuel",
  gearbox:"Gearbox", city:"City", selectDates:"Select Dates",
  start:"Start Date", end:"End Date", pricePerDay:"Price / day",
  days:"Days", total:"Total", booking:"Booking…", bookNow:"Book Now",
  logIn:"Log in to book", needAuth:"Please login to continue.",
  bookSuccess:"Booking request sent! Waiting for owner confirmation.",
  datesFail:"Car unavailable for selected dates.", selectDatesError:"Please select both dates.",
};
const fr = {
  notFound:"Location introuvable.", specifications:"Caractéristiques",
  brand:"Marque", model:"Modèle", year:"Année", fuel:"Carburant",
  gearbox:"Boîte", city:"Ville", selectDates:"Choisir les dates",
  start:"Date début", end:"Date fin", pricePerDay:"Prix / jour",
  days:"Jours", total:"Total", booking:"Réservation…", bookNow:"Réserver",
  logIn:"Connexion pour réserver", needAuth:"Connectez-vous pour continuer.",
  bookSuccess:"Demande envoyée ! En attente de confirmation.",
  datesFail:"Véhicule indisponible sur ces dates.", selectDatesError:"Veuillez sélectionner les deux dates.",
};

const ds = StyleSheet.create({
  label: { color: C.muted, fontSize:12, marginBottom:4 },
  trigger: { backgroundColor: C.surface, borderWidth:1, borderColor: C.border, borderRadius:12, paddingHorizontal:12, paddingVertical:12, flexDirection:"row", alignItems:"center" },
  triggerText: { marginLeft:8, fontSize:13 },
  picker: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, marginTop:8, padding:12 },
  pickerRow: { flexDirection:"row", justifyContent:"space-between", marginBottom:12 },
  col: { alignItems:"center" },
  colLabel: { color: C.muted, fontSize:11, marginBottom:4 },
  colCtrl: { flexDirection:"row", alignItems:"center" },
  ctrlBtn: { padding:4 },
  colVal: { color: C.white, fontWeight:"700", minWidth:40, textAlign:"center" },
  confirmBtn: { backgroundColor: C.primary, borderRadius:12, paddingVertical:8, alignItems:"center" },
  confirmText: { color:"#fff", fontWeight:"700", fontSize:13 },
});

const s = StyleSheet.create({
  center: { flex:1, alignItems:"center", justifyContent:"center", backgroundColor: C.bg },
  white: { color: C.white, fontWeight:"700", fontSize:16 },
  dotsRow: { position:"absolute", bottom:12, left:0, right:0, flexDirection:"row", justifyContent:"center", gap:6 },
  dot: { borderRadius:4 },
  dotActive: { width:16, height:8, backgroundColor: C.primary },
  dotInactive: { width:8, height:8, backgroundColor:"rgba(255,255,255,0.4)" },
  favBtn: { position:"absolute", top:16, right:16, backgroundColor:"rgba(5,6,15,0.8)", borderRadius:20, padding:10 },
  priceBadge: { position:"absolute", bottom:12, right:16, backgroundColor:"rgba(124,107,255,0.9)", borderRadius:20, paddingHorizontal:12, paddingVertical:4 },
  priceBadgeText: { color:"#fff", fontSize:12, fontWeight:"700" },
  body: { paddingHorizontal:16, paddingVertical:24 },
  title: { color: C.white, fontWeight:"700", fontSize:22, marginBottom:4 },
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
  datesRow: { flexDirection:"row", gap:12, marginBottom:16 },
  summaryBox: { backgroundColor: C.surface, borderWidth:1, borderColor: C.border, borderRadius:12, padding:12, marginBottom:16 },
  summaryRow: { flexDirection:"row", justifyContent:"space-between", marginBottom:4 },
  summaryLabel: { color: C.muted, fontSize:13 },
  summaryVal: { color: C.white, fontSize:13 },
  divider: { height:1, backgroundColor: C.border, marginVertical:8 },
  totalLabel: { color: C.white, fontWeight:"700" },
  totalVal: { color: C.primary, fontWeight:"700", fontSize:18 },
  bookBtn: { backgroundColor: C.primary, borderRadius:12, paddingVertical:16, alignItems:"center" },
  bookBtnText: { color:"#fff", fontWeight:"700", fontSize:15 },
  loginBtn: { backgroundColor:"rgba(124,107,255,0.15)", borderWidth:1, borderColor:"rgba(124,107,255,0.4)", borderRadius:12, paddingVertical:16, alignItems:"center" },
  loginBtnText: { color: C.primary, fontWeight:"700" },
  contactBtn: { backgroundColor: C.card, borderWidth:1, borderColor: C.border, borderRadius:12, paddingVertical:16, flexDirection:"row", alignItems:"center", justifyContent:"center", marginBottom:16 },
  contactBtnText: { color: C.primary, fontWeight:"700", marginLeft:8 },
});
