import { useState, useEffect, useMemo } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getRentalById, bookRental } from "../../src/api/rental";
import { startConversation } from "../../src/api/message";
import { addRentalFavorite, removeRentalFavorite, getRentalFavorites } from "../../src/api/user";
import ReviewSection from "../../src/components/ReviewSection";
import FavoriteHeartButton from "../../src/components/FavoriteHeartButton";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";
import { useTheme } from "../../src/context/ThemeContext";

const { width } = Dimensions.get("window");

/** Parse YYYY-MM-DD as UTC midnight; match server billing days. */
function utcMillisFromDateOnly(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/** Inclusive calendar days (start and end both count). */
function rentalBillableDays(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const a = utcMillisFromDateOnly(startStr);
  const b = utcMillisFromDateOnly(endStr);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.floor((b - a) / 86400000) + 1;
}

function formatMad(amount, locale) {
  const n = Math.round(Number(amount) || 0);
  return `${n.toLocaleString(locale === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: 0 })} MAD`;
}

/** Match server `createBooking` offer math (free_days, percent_discount only). */
function computeRentalOfferPricing(rental, days) {
  if (!rental || days <= 0) return { base: 0, saving: 0, total: 0, applied: null };
  const ppd = Number(rental.pricePerDay) || 0;
  const base = days * ppd;
  const now = new Date();
  const active = (rental.offers || []).filter(
    (o) => o.isActive && days >= (o.minDays || 1) && (!o.expiresAt || new Date(o.expiresAt) > now)
  );
  let bestSaving = 0;
  let applied = null;
  for (const o of active) {
    let saving = 0;
    if (o.type === "free_days") saving = (o.freeExtraDays || 0) * ppd;
    else if (o.type === "percent_discount") saving = base * ((o.discountPercent || 0) / 100);
    if (saving > bestSaving) {
      bestSaving = saving;
      applied = o;
    }
  }
  return { base, saving: bestSaving, total: Math.max(0, base - bestSaving), applied };
}

function listActiveOffers(rental) {
  if (!rental?.offers?.length) return [];
  const now = new Date();
  return rental.offers.filter((o) => o.isActive && (!o.expiresAt || new Date(o.expiresAt) > now));
}

function offerLineSummary(o, fr) {
  if (o.type === "free_days") {
    return fr
      ? `À partir de ${o.minDays || 1} j. · +${o.freeExtraDays || 0} j. offert(s)`
      : `From ${o.minDays || 1} days · +${o.freeExtraDays || 0} free day(s)`;
  }
  if (o.type === "percent_discount") {
    return fr
      ? `À partir de ${o.minDays || 1} j. · −${o.discountPercent || 0} %`
      : `From ${o.minDays || 1} days · −${o.discountPercent || 0}%`;
  }
  return o.description?.trim() || (fr ? "Offre personnalisée (voir détails)" : "Custom offer — see details");
}

function createRentalPickerStyles(C) {
  return StyleSheet.create({
    label: { color: C.muted, fontSize: 12, marginBottom: 4 },
    trigger: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center" },
    triggerText: { marginLeft: 8, fontSize: 13 },
    picker: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, marginTop: 8, padding: 12 },
    pickerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    col: { alignItems: "center" },
    colLabel: { color: C.muted, fontSize: 11, marginBottom: 4 },
    colCtrl: { flexDirection: "row", alignItems: "center" },
    ctrlBtn: { padding: 4 },
    colVal: { color: C.white, fontWeight: "700", minWidth: 40, textAlign: "center" },
    confirmBtn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 8, alignItems: "center" },
    confirmText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  });
}

function createRentalDetailScreenStyles(C) {
  return StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C.bg },
    white: { color: C.white, fontWeight: "700", fontSize: 16 },
    dotsRow: { position: "absolute", bottom: 12, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 },
    dot: { borderRadius: 4 },
    dotActive: { width: 16, height: 8, backgroundColor: C.primary },
    dotInactive: { width: 8, height: 8, backgroundColor: "rgba(255,255,255,0.4)" },
    favBtn: { position: "absolute", top: 14, right: 14, zIndex: 12 },
    priceBadge: { position: "absolute", bottom: 12, right: 16, backgroundColor: "rgba(124,107,255,0.9)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
    priceBadgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    body: { paddingHorizontal: 16, paddingVertical: 24 },
    title: { color: C.white, fontWeight: "700", fontSize: 22, marginBottom: 4 },
    metaRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    metaText: { color: C.muted, fontSize: 13, marginLeft: 4 },
    metaDot: { color: C.muted, marginHorizontal: 8 },
    card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 16 },
    cardTitle: { color: C.white, fontWeight: "700", fontSize: 15, marginBottom: 12 },
    specsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    specItem: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, width: "47%" },
    specLabelRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    specLabel: { color: C.muted, fontSize: 11, marginLeft: 4 },
    specValue: { color: C.white, fontWeight: "500", fontSize: 13 },
    descText: { color: C.slate, fontSize: 13, lineHeight: 20 },
    datesRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
    summaryBox: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 12, marginBottom: 16 },
    summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
    summaryLabel: { color: C.muted, fontSize: 13 },
    summaryVal: { color: C.white, fontSize: 13 },
    divider: { height: 1, backgroundColor: C.border, marginVertical: 8 },
    totalLabel: { color: C.white, fontWeight: "700" },
    totalVal: { color: C.primary, fontWeight: "700", fontSize: 18 },
    bookBtn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
    bookBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    loginBtn: { backgroundColor: C.pillBg, borderWidth: 1, borderColor: C.pillBorder, borderRadius: 12, paddingVertical: 16, alignItems: "center" },
    loginBtnText: { color: C.primary, fontWeight: "700" },
    contactBtn: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16 },
    contactBtnText: { color: C.primary, fontWeight: "700", marginLeft: 8 },
    offerItem: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: "rgba(251,191,36,0.28)",
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
    },
    offerItemHead: { flexDirection: "row", alignItems: "center", gap: 8 },
    offerItemTitle: { color: C.white, fontWeight: "700", fontSize: 14, flex: 1 },
    offerItemMeta: { color: "#fbbf24", fontSize: 12, fontWeight: "600", marginTop: 8, marginLeft: 24, lineHeight: 17 },
    offerItemDesc: { color: C.muted, fontSize: 12, marginTop: 6, marginLeft: 24, lineHeight: 18 },
    offerItemExp: { color: "#f87171", fontSize: 11, marginTop: 6, marginLeft: 24 },
    appliedOfferHint: { color: C.muted, fontSize: 11, marginTop: 4, fontStyle: "italic" },
  });
}

function useRentalDetailSheets() {
  const { colors: C } = useTheme();
  return useMemo(
    () => ({
      C,
      ds: createRentalPickerStyles(C),
      s: createRentalDetailScreenStyles(C),
    }),
    [C],
  );
}

function DatePicker({ label, value, onChange }) {
  const { C, ds } = useRentalDetailSheets();
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
  const { C, s } = useRentalDetailSheets();
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

  const days = rentalBillableDays(startDate, endDate);
  const pricing = useMemo(() => computeRentalOfferPricing(rental, days), [rental, days]);
  const activeOffersList = useMemo(() => listActiveOffers(rental), [rental]);

  const handleBook = async () => {
    if (!auth) return Alert.alert(t.needAuth);
    if (!startDate || !endDate) return Alert.alert(t.selectDatesError);
    if (days <= 0) return Alert.alert("End date must be on or after start date");
    setBooking(true);
    try {
      await bookRental(id, { startDate, endDate });
      Alert.alert("Success", t.bookSuccess);
      setStartDate(""); setEndDate("");
    } catch (e) {
      const code = e?.response?.data?.code;
      const msg = e?.response?.data?.message || t.datesFail;
      if (code === "BOOKING_DOCUMENTS_REQUIRED" || code === "DRIVER_LICENSE_REQUIRED") {
        Alert.alert(t.documentsTitle, msg, [
          { text: t.documentsLater, style: "cancel" },
          { text: t.documentsProfile, onPress: () => router.push("/(tabs)/profile") },
        ]);
      } else {
        Alert.alert(t.errorTitle || "Error", msg);
      }
    }
    setBooking(false);
  };

  const contactOwner = async () => {
    if (!auth) return Alert.alert(t.needAuth);
    const o = rental?.rentalOwnerId || rental?.owner;
    const oid = o?._id;
    if (!oid) return Alert.alert("Error", "Owner unavailable");
    setContacting(true);
    try {
      await startConversation({ recipientId: oid, listingId: id, listingModel: "RentalListing" });
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
            {images.map((img, i) => {
              const uri = resolveMediaUrl(img);
              return uri ? (
                <Image key={i} source={{ uri }} style={{ width, height: 280 }} resizeMode="cover" />
              ) : null;
            })}
          </ScrollView>
        ) : (
          <View style={[{ width, height: 280 }, s.center]}>
            <Ionicons name="car-sport-outline" size={72} color={C.muted} />
          </View>
        )}
        {images.length > 1 && (
          <View style={s.dotsRow}>
            {images.map((_, i) => (
              <View key={i} style={[s.dot, i === imgIndex ? s.dotActive : s.dotInactive]} />
            ))}
          </View>
        )}
        <FavoriteHeartButton active={isFav} onPress={toggleFav} size="lg" variant="overlay" style={s.favBtn} />
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

        {activeOffersList.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>{t.promotions}</Text>
            {activeOffersList.map((o, i) => (
              <View key={i} style={s.offerItem}>
                <View style={s.offerItemHead}>
                  <Ionicons name="pricetag-outline" size={18} color="#fbbf24" />
                  <Text style={s.offerItemTitle}>{o.title}</Text>
                </View>
                <Text style={s.offerItemMeta}>{offerLineSummary(o, lang === "fr")}</Text>
                {o.description ? <Text style={s.offerItemDesc}>{o.description}</Text> : null}
                {o.expiresAt ? (
                  <Text style={s.offerItemExp}>
                    {lang === "fr" ? "Expire le" : "Expires"} {new Date(o.expiresAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB")}
                  </Text>
                ) : null}
              </View>
            ))}
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
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>{t.pricePerDay}</Text>
                <Text style={s.summaryVal}>{rental.pricePerDay} MAD</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>{t.days}</Text>
                <Text style={s.summaryVal}>{days}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>{t.subtotal}</Text>
                <Text style={s.summaryVal}>{formatMad(pricing.base, lang)}</Text>
              </View>
              {pricing.saving > 0 && (
                <>
                  <View style={s.summaryRow}>
                    <Text style={s.summaryLabel}>{t.promotion}</Text>
                    <Text style={[s.summaryVal, { color: "#34d399" }]}>−{formatMad(pricing.saving, lang)}</Text>
                  </View>
                  {pricing.applied?.title ? (
                    <Text style={s.appliedOfferHint} numberOfLines={2}>
                      {t.appliedLabel}: {pricing.applied.title}
                    </Text>
                  ) : null}
                </>
              )}
              <View style={s.divider} />
              <View style={s.summaryRow}>
                <Text style={s.totalLabel}>{t.total}</Text>
                <Text style={s.totalVal}>{formatMad(pricing.total, lang)}</Text>
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
  days:"Days", subtotal:"Subtotal", promotion:"Promotion", appliedLabel:"Applied",
  promotions:"Promotions & deals", total:"Total", booking:"Booking…", bookNow:"Book Now",
  logIn:"Log in to book", needAuth:"Please login to continue.",
  bookSuccess:"Booking request sent! Waiting for owner confirmation.",
  datesFail:"Car unavailable for selected dates.", selectDatesError:"Please select both dates.",
  documentsTitle:"Documents required",
  documentsLater:"Not now",
  documentsProfile:"My profile",
  errorTitle:"Error",
};
const fr = {
  notFound:"Location introuvable.", specifications:"Caractéristiques",
  brand:"Marque", model:"Modèle", year:"Année", fuel:"Carburant",
  gearbox:"Boîte", city:"Ville", selectDates:"Choisir les dates",
  start:"Date début", end:"Date fin", pricePerDay:"Prix / jour",
  days:"Jours", subtotal:"Sous-total", promotion:"Promotion", appliedLabel:"Offre appliquée",
  promotions:"Promotions", total:"Total", booking:"Réservation…", bookNow:"Réserver",
  logIn:"Connexion pour réserver", needAuth:"Connectez-vous pour continuer.",
  bookSuccess:"Demande envoyée ! En attente de confirmation.",
  datesFail:"Véhicule indisponible sur ces dates.", selectDatesError:"Veuillez sélectionner les deux dates.",
  documentsTitle:"Documents requis",
  documentsLater:"Plus tard",
  documentsProfile:"Mon profil",
  errorTitle:"Erreur",
};


