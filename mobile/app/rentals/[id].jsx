import { useState, useEffect, useMemo } from "react";
import { PageLoader } from '../../src/components/AppLoadingScreen';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getRentalById, bookRental, getRentalBookings, recordRentalView } from "../../src/api/rental";
import { profileDocumentsHref, messagesHref } from "../../src/utils/appNavigation";
import { isOwnRentalListing } from "../../src/utils/listingOwnership";
import RentalBookingCalendar from "../../src/components/RentalBookingCalendar";
import { startConversation } from "../../src/api/message";
import { addRentalFavorite, removeRentalFavorite, getRentalFavorites } from "../../src/api/user";
import ReviewSection from "../../src/components/ReviewSection";
import FavoriteHeartButton from "../../src/components/FavoriteHeartButton";
import { useAuth } from "../../src/context/AuthContext";
import { useAppLang } from "../../src/context/AppLangContext";
import { useTheme } from "../../src/context/ThemeContext";
import { resolveMediaUrl } from "../../src/utils/mediaUrl";

const { width } = Dimensions.get("window");

/** Parse YYYY-MM-DD as UTC midnight; match server billing days. */
function utcMillisFromDateOnly(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function ymdFromUtcMs(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** Confirmed bookings + owner availability → set of blocked YYYY-MM-DD (UTC day). */
function buildBlockedDaySet(rental, confirmedBookings) {
  const set = new Set();
  const addRange = (isoStart, isoEnd) => {
    const a = new Date(isoStart);
    const b = new Date(isoEnd);
    if (Number.isNaN(+a) || Number.isNaN(+b)) return;
    let t = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
    const end = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
    if (end < t) return;
    for (; t <= end; t += 86400000) set.add(ymdFromUtcMs(t));
  };
  (confirmedBookings || []).forEach((b) => addRange(b.startDate, b.endDate));
  (rental?.availability || []).forEach((r) => addRange(r.startDate, r.endDate));
  return set;
}

function rangeIncludesBlockedDay(startStr, endStr, blockedSet) {
  const a = utcMillisFromDateOnly(startStr);
  const b = utcMillisFromDateOnly(endStr);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return false;
  for (let t = a; t <= b; t += 86400000) {
    if (blockedSet.has(ymdFromUtcMs(t))) return true;
  }
  return false;
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
      s: createRentalDetailScreenStyles(C),
    }),
    [C],
  );
}

export default function RentalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { auth } = useAuth();
  const { lang } = useAppLang();
  const { C, s } = useRentalDetailSheets();
  const { isDark } = useTheme();
  const router = useRouter();
  const t = lang === "fr" ? fr : en;

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIndex, setImgIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [booking, setBooking] = useState(false);
  const [contacting, setContacting] = useState(false);

  const blockedDaySet = useMemo(
    () => buildBlockedDaySet(rental, confirmedBookings),
    [rental, confirmedBookings],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getRentalById(id), getRentalBookings(id).catch(() => ({ data: [] }))])
      .then(([rentRes, bookRes]) => {
        if (cancelled) return;
        setRental(rentRes.data);
        setConfirmedBookings(Array.isArray(bookRes.data) ? bookRes.data : []);
        recordRentalView(String(id)).catch(() => {});
      })
      .catch(() => {
        if (!cancelled) Alert.alert("Error", "Failed to load rental");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!auth) {
      setIsFav(false);
      return;
    }
    getRentalFavorites()
      .then(({ data }) => setIsFav(data.some((f) => (f._id || f) === id)))
      .catch(() => {});
  }, [auth, id]);

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
  const isOwnListing = useMemo(
    () => isOwnRentalListing(rental, auth?._id),
    [rental, auth?._id]
  );

  const handleBook = async () => {
    if (!auth) return Alert.alert(t.needAuth);
    if (isOwnListing) {
      return Alert.alert(
        lang === "fr" ? "Votre annonce" : "Your listing",
        lang === "fr"
          ? "Vous ne pouvez pas louer votre propre véhicule. Gérez-la depuis Ma flotte."
          : "You cannot rent your own car. Manage it from My fleet."
      );
    }
    if (!startDate || !endDate) return Alert.alert(t.selectDatesError);
    if (days <= 0) return Alert.alert("End date must be on or after start date");
    if (rangeIncludesBlockedDay(startDate, endDate, blockedDaySet)) {
      return Alert.alert(t.errorTitle || "Error", t.unavailableRange);
    }
    setBooking(true);
    try {
      const { data: booking } = await bookRental(id, { startDate, endDate });
      setStartDate("");
      setEndDate("");
      router.replace({
        pathname: "/(customer)/bookings",
        params: {
          highlight: String(booking?._id || ""),
          booked: "1",
        },
      });
    } catch (e) {
      const code = e?.response?.data?.code;
      const msg = e?.response?.data?.message || t.datesFail;
      if (code === "BOOKING_DOCUMENTS_REQUIRED" || code === "DRIVER_LICENSE_REQUIRED" || code === "CIN_REQUIRED") {
        Alert.alert(t.documentsTitle, msg, [
          { text: t.documentsLater, style: "cancel" },
          {
            text: t.documentsProfile,
            onPress: () => router.push(profileDocumentsHref(`/rentals/${id}`)),
          },
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
      router.push(messagesHref("customer"));
    } catch { Alert.alert("Failed to open conversation"); }
    setContacting(false);
  };

  if (loading) return <PageLoader />;
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
          {activeOffersList.length > 0 && (
            <Text style={{ color: "#fde68a", fontSize: 10, fontWeight: "800", marginTop: 2 }}>
              {lang === "fr" ? `${activeOffersList.length} promo(s)` : `${activeOffersList.length} deal(s)`}
            </Text>
          )}
        </View>
      </View>

      <View style={s.body}>
        <Text style={s.title}>{rental.title || `${rental.brand} ${rental.model}`}</Text>
        <View style={s.metaRow}>
          <Ionicons name="location-outline" size={14} color={C.muted} />
          <Text style={s.metaText}>{rental.city || "Unknown city"}</Text>
          {rental.year && <><Text style={s.metaDot}>·</Text><Text style={s.metaText}>{rental.year}</Text></>}
        </View>

        {rental.airportDeliveryOffered && Number(rental.airportDeliveryFeeMad) > 0 && (
          <View style={[s.card, { flexDirection: "row", alignItems: "center", gap: 12 }]}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "rgba(56,189,248,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="airplane-outline" size={22} color="#38bdf8" />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.cardTitle}>{t.airportTitle}</Text>
              <Text style={s.descText}>
                {t.airportBody(Number(rental.airportDeliveryFeeMad).toLocaleString(lang === "fr" ? "fr-FR" : "en-US"))}
              </Text>
            </View>
          </View>
        )}

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

        {isOwnListing ? (
          <View style={[s.card, { borderColor: "rgba(245,158,11,0.35)", backgroundColor: isDark ? "rgba(245,158,11,0.1)" : "rgba(245,158,11,0.06)" }]}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <Ionicons name="information-circle-outline" size={26} color="#f59e0b" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: isDark ? "#fcd34d" : "#92400e", fontWeight: "800", fontSize: 15, marginBottom: 6 }}>
                  {lang === "fr" ? "C'est votre annonce" : "This is your listing"}
                </Text>
                <Text style={{ color: C.muted, fontSize: 13, lineHeight: 20 }}>
                  {lang === "fr"
                    ? "Vous ne pouvez pas réserver votre propre voiture. Modifiez-la dans Ma flotte ou via vos annonces."
                    : "You cannot book your own rental. Edit it from My fleet or your listings."}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/my-fleet")}
              style={[s.bookBtn, { marginTop: 16, backgroundColor: isDark ? "#38bdf8" : "#0284c7" }]}
            >
              <Text style={s.bookBtnText}>{lang === "fr" ? "Gérer ma flotte" : "Manage my fleet"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <View style={s.card}>
          <Text style={s.cardTitle}>{t.selectDates}</Text>
          <RentalBookingCalendar
            blockedDays={blockedDaySet}
            startDate={startDate}
            endDate={endDate}
            fr={lang === "fr"}
            onRangeChange={({ startDate: s, endDate: e }) => {
              setStartDate(s);
              setEndDate(e);
            }}
          />
          {(startDate || endDate) ? (
            <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: C.muted, fontSize: 12 }}>
                {startDate ? `${t.start}: ${startDate}` : ""}
                {startDate && endDate ? "  ·  " : ""}
                {endDate ? `${t.end}: ${endDate}` : ""}
              </Text>
              <TouchableOpacity onPress={() => { setStartDate(""); setEndDate(""); }}>
                <Text style={{ color: C.primary, fontSize: 12, fontWeight: "700" }}>{t.clearDates}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

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
        )}

        {auth && !isOwnListing && (
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
  unavailableRange:"This car is not available on the selected dates (already booked or blocked). Please choose different dates.",
  clearDates:"Clear",
  airportTitle:"Airport delivery",
  airportBody:(fee) => `The owner can bring the car to the airport. One-time add-on: ${fee} MAD — confirm with the owner when you book.`,
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
  unavailableRange:"Ce véhicule n'est pas disponible sur ces dates (déjà réservé ou bloqué). Choisissez d'autres dates.",
  clearDates:"Effacer",
  airportTitle:"Livraison aéroport",
  airportBody:(fee) => `Le propriétaire peut amener le véhicule à l'aéroport. Supplément unique : ${fee} MAD — à confirmer avec lui lors de la réservation.`,
};


