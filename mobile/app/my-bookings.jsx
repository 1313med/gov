import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Image,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  TextInput,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMyBookings, cancelBooking, rescheduleMyBooking, getAlternativeRentalsForBooking, chooseVehicleResolution, submitBookingCustomerReview } from "../src/api/booking";
import { useAppLang } from "../src/context/AppLangContext";
import { useTheme } from "../src/context/ThemeContext";
import { resolveMediaUrl } from "../src/utils/mediaUrl";

const SCREEN_W = Dimensions.get("window").width;

const HOURS_REFUND_CANCEL_MIN = 48;
/** Same idea as server: refund cancel if pickup local date is at least this many days after today (e.g. Mercedes when wall-clock is just under 48h). */
const CALENDAR_DAYS_REFUND_CANCEL_MIN = 2;
const TX_FEE_PERCENT = 4;

function hoursUntilStart(iso) {
  return (new Date(iso).getTime() - Date.now()) / 3600000;
}

function estimateRefundMad(totalAmount) {
  const paid = Math.max(0, Number(totalAmount) || 0);
  return Math.max(0, Math.round(paid * (1 - TX_FEE_PERCENT / 100) * 100) / 100);
}

function formatYMD(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

function parseYMDToLocalNoon(s) {
  const parts = String(s).trim().split("-").map((n) => parseInt(n, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [y, m, day] = parts;
  return new Date(y, m - 1, day, 12, 0, 0, 0);
}

/** Local calendar days from today to pickup day (0 = today, 1 = tomorrow). */
function calendarDaysUntilPickupDay(iso) {
  const s = new Date(iso);
  const startDay = new Date(s.getFullYear(), s.getMonth(), s.getDate());
  const n = new Date();
  const today = new Date(n.getFullYear(), n.getMonth(), n.getDate());
  return Math.round((startDay.getTime() - today.getTime()) / 86400000);
}

/** API / UI helper for vehicle-unavailable flow. */
function vehiclePhase(b) {
  return b?.vehicleResolutionPhase || "none";
}

function startOfLocalTodayMidnight() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0);
}

const ST = {
  pending: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.4)", text: "#f59e0b", icon: "time-outline" },
  confirmed: { bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.4)", text: "#34d399", icon: "checkmark-circle-outline" },
  completed: { bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.4)", text: "#60a5fa", icon: "flag-outline" },
  expired: { bg: "rgba(148,163,184,0.18)", border: "rgba(148,163,184,0.45)", text: "#94a3b8", icon: "hourglass-outline" },
  cancelled: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)", text: "#f87171", icon: "close-circle-outline" },
};

export default function MyBookingsScreen() {
  const { lang } = useAppLang();
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createMyBookingsStyles(C, isDark), [C, isDark]);
  const router = useRouter();
  const params = useLocalSearchParams();
  const fr = lang === "fr";
  const [bookings, setBookings] = useState([]);
  const [highlightId, setHighlightId] = useState(null);
  const [pinnedBookingId, setPinnedBookingId] = useState(null);
  const highlightTimerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [rStart, setRStart] = useState("");
  const [rEnd, setREnd] = useState("");
  const [rSubmitting, setRSubmitting] = useState(false);
  const [activePicker, setActivePicker] = useState(null);
  const [swapModalBooking, setSwapModalBooking] = useState(null);
  const [swapAlternatives, setSwapAlternatives] = useState([]);
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapSubmitting, setSwapSubmitting] = useState(false);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [fbOverall, setFbOverall] = useState(null);
  const [fbNote, setFbNote] = useState("");
  const [fbSubmitting, setFbSubmitting] = useState(false);

  const load = async () => {
    try {
      const { data } = await getMyBookings();
      setBookings(data);
    } catch {
      Alert.alert("Failed to load bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  useEffect(
    () => () => {
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    },
    []
  );

  const rawHighlight = params.highlight;
  const highlightParam = rawHighlight
    ? String(Array.isArray(rawHighlight) ? rawHighlight[0] : rawHighlight)
    : null;

  useEffect(() => {
    if (!highlightParam || !bookings.length) return;
    const id = highlightParam;
    setHighlightId(id);
    setPinnedBookingId(id);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    highlightTimerRef.current = setTimeout(() => {
      setHighlightId(null);
      setPinnedBookingId(null);
      highlightTimerRef.current = null;
    }, 5000);
    try {
      router.setParams({ highlight: undefined });
    } catch {
      /* noop */
    }
  }, [highlightParam, bookings.length, router]);

  const displayBookings = useMemo(() => {
    if (!pinnedBookingId || !bookings.length) return bookings;
    const ix = bookings.findIndex((b) => String(b._id) === pinnedBookingId);
    if (ix <= 0) return bookings;
    const next = [...bookings];
    const [row] = next.splice(ix, 1);
    return [row, ...next];
  }, [bookings, pinnedBookingId]);

  const openReschedule = (item) => {
    setRescheduleTarget(item);
    setRStart(formatYMD(item.startDate));
    setREnd(formatYMD(item.endDate));
    setActivePicker(null);
  };

  const closeReschedule = () => {
    if (rSubmitting) return;
    setRescheduleTarget(null);
    setActivePicker(null);
  };

  const minEndForDatePicker = useMemo(() => {
    const st = parseYMDToLocalNoon(rStart);
    const floor = startOfLocalTodayMidnight();
    if (!st) return floor;
    const d = new Date(st.getFullYear(), st.getMonth(), st.getDate(), 0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d.getTime() < floor.getTime() ? floor : d;
  }, [rStart]);

  const onModalDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      if (event?.type === "dismissed") {
        setActivePicker(null);
        return;
      }
      setActivePicker(null);
    }
    if (!selectedDate || !activePicker) return;
    const ymd = formatYMD(selectedDate);
    if (activePicker === "start") {
      setRStart(ymd);
      const nextStart = parseYMDToLocalNoon(ymd);
      const endD = parseYMDToLocalNoon(rEnd);
      if (nextStart && (!endD || endD <= nextStart)) {
        const nx = new Date(nextStart);
        nx.setDate(nx.getDate() + 1);
        setREnd(formatYMD(nx));
      }
    } else {
      setREnd(ymd);
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleTarget) return;
    const start = parseYMDToLocalNoon(rStart);
    const end = parseYMDToLocalNoon(rEnd);
    if (!start || !end || end <= start) {
      Alert.alert(
        fr ? "Dates invalides" : "Invalid dates",
        fr ? "Choisissez une date de fin après le début." : "Pick an end date after the start date."
      );
      return;
    }
    setRSubmitting(true);
    try {
      await rescheduleMyBooking(rescheduleTarget._id, {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
      setRescheduleTarget(null);
      await load();
    } catch (e) {
      Alert.alert(
        fr ? "Impossible" : "Could not update",
        e?.response?.data?.message || (fr ? "Réessayez plus tard." : "Try again later.")
      );
    } finally {
      setRSubmitting(false);
    }
  };

  const openSwapAlternatives = async (item) => {
    setSwapModalBooking(item);
    setSwapAlternatives([]);
    setSwapLoading(true);
    try {
      const { data } = await getAlternativeRentalsForBooking(item._id);
      setSwapAlternatives(Array.isArray(data?.alternatives) ? data.alternatives : []);
    } catch (e) {
      Alert.alert(fr ? "Impossible" : "Error", e?.response?.data?.message || (fr ? "Réessayez." : "Try again."));
      setSwapModalBooking(null);
    } finally {
      setSwapLoading(false);
    }
  };

  const pickRefundFromVehicleIssue = (item) => {
    Alert.alert(
      fr ? "Remboursement" : "Refund",
      fr
        ? "Demander le remboursement intégral ? Le propriétaire confirmera une fois le virement effectué."
        : "Request a full refund? The owner will confirm after paying you back.",
      [
        { text: fr ? "Non" : "No", style: "cancel" },
        {
          text: fr ? "Oui" : "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await chooseVehicleResolution(item._id, { choice: "refund" });
              await load();
            } catch (e) {
              Alert.alert(fr ? "Impossible" : "Error", e?.response?.data?.message || "");
            }
          },
        },
      ],
    );
  };

  const runSwapVehicle = (booking, replacementId) => {
    setSwapSubmitting(true);
    chooseVehicleResolution(booking._id, { choice: "swap", replacementRentalId: replacementId })
      .then(async () => {
        setSwapModalBooking(null);
        await load();
      })
      .catch((e) => {
        Alert.alert(fr ? "Impossible" : "Error", e?.response?.data?.message || "");
      })
      .finally(() => setSwapSubmitting(false));
  };

  const confirmSwapVehicle = (booking, replacementId) => {
    Alert.alert(
      fr ? "Changer de voiture" : "Switch car",
      fr
        ? "Remplacer cette réservation par le véhicule choisi aux mêmes dates ?"
        : "Replace this booking with the selected vehicle for the same dates?",
      [
        { text: fr ? "Non" : "No", style: "cancel" },
        { text: fr ? "Oui" : "Yes", onPress: () => runSwapVehicle(booking, replacementId) },
      ],
    );
  };

  const closeFeedbackModal = () => {
    if (fbSubmitting) return;
    setFeedbackBooking(null);
    setFbOverall(null);
    setFbNote("");
  };

  const submitTripFeedback = async () => {
    if (!feedbackBooking || !fbOverall) {
      Alert.alert(fr ? "Choix requis" : "Required", fr ? "Indiquez si l’expérience était bonne ou mauvaise." : "Pick good or bad overall.");
      return;
    }
    setFbSubmitting(true);
    try {
      await submitBookingCustomerReview(feedbackBooking._id, { overall: fbOverall, note: fbNote });
      closeFeedbackModal();
      await load();
    } catch (e) {
      Alert.alert(fr ? "Impossible" : "Error", e?.response?.data?.message || (fr ? "Réessayez." : "Try again."));
    } finally {
      setFbSubmitting(false);
    }
  };

  const promptCancelBooking = (item) => {
    if (item.customerDateChangeUsed) {
      Alert.alert(
        fr ? "Annulation indisponible" : "Cancellation unavailable",
        fr
          ? "Vous avez déjà utilisé votre modification de dates unique. L’annulation en ligne n’est plus possible."
          : "You already used your one-time date change. Online cancellation is no longer available."
      );
      return;
    }
    const id = item._id;
    const h = hoursUntilStart(item.startDate);
    const calDays = calendarDaysUntilPickupDay(item.startDate);
    const runCancel = async () => {
      try {
        await cancelBooking(id);
        await load();
      } catch (e) {
        Alert.alert(
          fr ? "Annulation" : "Cancellation",
          e?.response?.data?.message || (fr ? "Échec." : "Failed.")
        );
      }
    };

    if (item.status === "pending") {
      Alert.alert(fr ? "Annuler la réservation" : "Cancel booking", fr ? "Retirer cette demande ?" : "Withdraw this request?", [
        { text: fr ? "Non" : "No", style: "cancel" },
        { text: fr ? "Oui" : "Yes", style: "destructive", onPress: runCancel },
      ]);
      return;
    }

    if (item.status === "confirmed" && (h >= HOURS_REFUND_CANCEL_MIN || calDays >= CALENDAR_DAYS_REFUND_CANCEL_MIN)) {
      const paid = Number(item.totalAmount) || 0;
      const est = estimateRefundMad(item.totalAmount);
      const body = fr
        ? `Moins ${TX_FEE_PERCENT}% de frais de transaction sur ${paid.toLocaleString("fr-FR")} MAD : remboursement estimé environ ${est.toLocaleString("fr-FR")} MAD. Continuer ?`
        : `${TX_FEE_PERCENT}% transaction fee on ${paid.toLocaleString("en-US")} MAD paid — estimated refund about ${est.toLocaleString("en-US")} MAD. Continue?`;
      Alert.alert(fr ? "Annuler la réservation" : "Cancel booking", body, [
        { text: fr ? "Non" : "No", style: "cancel" },
        { text: fr ? "Oui, annuler" : "Yes, cancel", style: "destructive", onPress: runCancel },
      ]);
    }
  };

  const listHeader = useCallback(
    () => (
      <View style={[s.listHead, { paddingTop: insets.top + 10 }]}>
        <View style={s.listHeadAccent} />
        <Text style={s.listHeadTitle}>{fr ? "Mes réservations" : "My bookings"}</Text>
        <Text style={s.listHeadSub}>
          {fr ? "Dates, montants et statuts de vos locations." : "Dates, totals, and status for each trip."}
        </Text>
      </View>
    ),
    [s, insets.top, fr]
  );

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={{ color: C.muted, marginTop: 14, fontSize: 13 }}>{fr ? "Chargement…" : "Loading…"}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <FlatList
        data={displayBookings}
        keyExtractor={(i) => i._id}
        ListHeaderComponent={listHeader}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <View style={s.emptyIconWrap}>
              <Ionicons name="car-outline" size={44} color={C.primary} />
            </View>
            <Text style={s.emptyTitle}>{fr ? "Aucune réservation" : "No bookings yet"}</Text>
            <Text style={s.emptyHint}>{fr ? "Explorez le catalogue et réservez votre prochaine voiture." : "Browse the fleet and book your next drive."}</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/rentals")} activeOpacity={0.9} style={s.cta}>
              <LinearGradient colors={[C.primary, "#6366f1"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.ctaGrad}>
                <Text style={s.ctaText}>{fr ? "Voir les locations" : "Browse rentals"}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const st = ST[item.status] || ST.pending;
          const h = hoursUntilStart(item.startDate);
          const calDays = calendarDaysUntilPickupDay(item.startDate);
          const usedChange = !!item.customerDateChangeUsed;
          const vPhase = vehiclePhase(item);
          /** After the one-time reschedule, customer may not cancel online (any pickup date). */
          const bookingLockedNoFurther =
            usedChange && ["pending", "confirmed"].includes(item.status) && h > 0;
          const canCancelBooking =
            !bookingLockedNoFurther &&
            (item.status === "pending" ||
              (item.status === "confirmed" &&
                (h >= HOURS_REFUND_CANCEL_MIN || calDays >= CALENDAR_DAYS_REFUND_CANCEL_MIN)));
          const canOpenReschedule =
            (item.status === "pending" || item.status === "confirmed") &&
            !usedChange &&
            h > 0 &&
            calDays === 1;

          const showTripFeedbackCta =
            (item.status === "expired" || item.status === "completed") && !item.hasCustomerBookingReview;

          const img = resolveMediaUrl(item.rentalId?.images?.[0]);
          const title =
            item.rentalId?.title || `${item.rentalId?.brand || ""} ${item.rentalId?.model || ""}`.trim() || "Rental";

          let policyEl = null;
          if (bookingLockedNoFurther) {
            policyEl = (
              <Text style={s.policyLocked}>
                {fr
                  ? "Vous avez utilisé votre unique changement de dates. L’annulation en ligne n’est plus disponible ; la réservation reste ferme jusqu’au départ."
                  : "You used your one-time date change. Online cancellation is no longer available; the booking stands until pickup."}
              </Text>
            );
          } else if (item.status === "confirmed" && h > 0) {
            const canRefundCancel = h >= HOURS_REFUND_CANCEL_MIN || calDays >= CALENDAR_DAYS_REFUND_CANCEL_MIN;
            if (canRefundCancel) {
              policyEl = (
                <Text style={s.policyHint}>
                  {fr
                    ? `Annulation remboursable : plus de 48h avant le départ, ou date de départ au calendrier dans au moins 2 jours — remboursement estimé ≈ ${estimateRefundMad(item.totalAmount).toLocaleString("fr-FR")} MAD (frais ${TX_FEE_PERCENT}%).`
                    : `Refundable cancel: more than 48h before pickup, or pickup is at least two calendar days away — estimated refund ≈ ${estimateRefundMad(item.totalAmount).toLocaleString("en-US")} MAD after ${TX_FEE_PERCENT}% fee.`}
                </Text>
              );
            } else {
              const offerReschedule = calDays === 1 && !usedChange;
              policyEl = (
                <Text style={s.policyWarn}>
                  {fr
                    ? h <= 24
                      ? offerReschedule
                        ? "Moins de 24h avant le départ : annulation non remboursable. Vous pouvez changer les dates une seule fois si le véhicule est libre."
                        : "Moins de 24h avant le départ : annulation non remboursable."
                      : offerReschedule
                        ? "Moins de 48h avant le départ : annulation en ligne indisponible. Vous pouvez changer les dates une seule fois si le véhicule est libre."
                        : "Moins de 48h avant le départ : annulation en ligne indisponible."
                    : h <= 24
                      ? offerReschedule
                        ? "Within 24h of pickup: not refundable. You may change dates once if the car is available."
                        : "Within 24h of pickup: not refundable."
                      : offerReschedule
                        ? "Within 48h of pickup: online cancellation unavailable. You may change dates once if the car is available."
                        : "Within 48h of pickup: online cancellation unavailable."}
                </Text>
              );
            }
          }

          return (
            <View
              style={[
                s.card,
                { borderLeftColor: st.text },
                highlightId && String(item._id) === highlightId
                  ? {
                      borderWidth: 2,
                      borderColor: C.primary,
                      shadowColor: C.primary,
                      shadowOpacity: isDark ? 0.35 : 0.2,
                      shadowRadius: 12,
                    }
                  : null,
              ]}
            >
              <TouchableOpacity
                onPress={() => router.push(`/rentals/${item.rentalId?._id || item.rentalId}`)}
                activeOpacity={0.9}
                style={s.cardHero}
              >
                {img ? (
                  <Image source={{ uri: img }} style={s.cardImg} resizeMode="cover" />
                ) : (
                  <View style={[s.cardImg, s.cardImgPh]}>
                    <Ionicons name="car-sport-outline" size={32} color={C.muted} />
                  </View>
                )}
                <View style={s.cardHeroText}>
                  <Text style={s.cardTitle} numberOfLines={2}>
                    {title}
                  </Text>
                  {item.rentalId?.city ? <Text style={s.cardCity}>{item.rentalId.city}</Text> : null}
                </View>
              </TouchableOpacity>

              <View style={s.cardBody}>
                <View style={[s.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
                  <Ionicons name={st.icon} size={14} color={st.text} />
                  <Text style={[s.badgeText, { color: st.text }]}>{item.status}</Text>
                </View>

                <View style={s.datesRow}>
                  <View style={s.dateBox}>
                    <Text style={s.dateLabel}>{fr ? "Début" : "Start"}</Text>
                    <Text style={s.dateVal}>{new Date(item.startDate).toLocaleDateString(fr ? "fr-FR" : "en-GB")}</Text>
                  </View>
                  <View style={s.dateBox}>
                    <Text style={s.dateLabel}>{fr ? "Fin" : "End"}</Text>
                    <Text style={s.dateVal}>{new Date(item.endDate).toLocaleDateString(fr ? "fr-FR" : "en-GB")}</Text>
                  </View>
                </View>

                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>{fr ? "Total" : "Total"}</Text>
                  <Text style={s.totalVal}>
                    {Number(item.totalAmount).toLocaleString(fr ? "fr-FR" : "en-US")} MAD
                  </Text>
                </View>

                {policyEl}

                {vPhase === "awaiting_customer" && (item.status === "pending" || item.status === "confirmed") ? (
                  <View style={s.vehicleIssueBox}>
                    <Text style={s.vehicleIssueTitle}>{fr ? "Véhicule indisponible" : "Vehicle unavailable"}</Text>
                    <Text style={s.vehicleIssueBody}>
                      {item.ownerVehicleIssueNote
                        ? item.ownerVehicleIssueNote
                        : fr
                          ? "Le propriétaire a signalé un problème avec la voiture. Vous pouvez demander un remboursement ou choisir une autre voiture libre aux mêmes dates dans sa flotte."
                          : "The owner reported an issue with the car. You can request a refund or pick another available car from their fleet for the same dates."}
                    </Text>
                    <TouchableOpacity style={s.vehicleIssueBtn} onPress={() => pickRefundFromVehicleIssue(item)} activeOpacity={0.85}>
                      <Text style={s.vehicleIssueBtnTxt}>{fr ? "Demander le remboursement" : "Request full refund"}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.vehicleIssueBtn, s.vehicleIssueBtnAlt]}
                      onPress={() => openSwapAlternatives(item)}
                      activeOpacity={0.85}
                    >
                      <Text style={s.vehicleIssueBtnTxt}>{fr ? "Choisir une autre voiture" : "Pick another car"}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {vPhase === "awaiting_owner_refund" ? (
                  <Text style={[s.policyWarn, { marginTop: 8 }]}>
                    {fr
                      ? "Remboursement demandé — en attente de confirmation du propriétaire après virement."
                      : "Refund requested — waiting for the owner to confirm after they pay you back."}
                  </Text>
                ) : null}

                {vPhase === "awaiting_owner_diff_refund" ? (
                  <Text style={[s.policyWarn, { marginTop: 8 }]}>
                    {fr
                      ? `Le propriétaire doit vous rembourser la différence : ${Number(item.vehicleResolutionRefundMad || 0).toLocaleString("fr-FR")} MAD.`
                      : `The owner should refund you the difference: ${Number(item.vehicleResolutionRefundMad || 0).toLocaleString("en-US")} MAD.`}
                  </Text>
                ) : null}

                {vPhase === "resolved_refund" ? (
                  <Text style={[s.policyHint, { marginTop: 8 }]}>
                    {fr ? "Remboursement confirmé par le propriétaire." : "Refund confirmed by the owner."}
                  </Text>
                ) : null}

                {canOpenReschedule ? (
                  <TouchableOpacity onPress={() => openReschedule(item)} style={s.secondaryBtn} activeOpacity={0.85}>
                    <Text style={s.secondaryBtnText}>{fr ? "Changer les dates (1×)" : "Change dates (once)"}</Text>
                  </TouchableOpacity>
                ) : null}

                {canCancelBooking ? (
                  <TouchableOpacity onPress={() => promptCancelBooking(item)} style={s.cancelBtn} activeOpacity={0.85}>
                    <Text style={s.cancelText}>{fr ? "Annuler la réservation" : "Cancel booking"}</Text>
                  </TouchableOpacity>
                ) : null}

                {showTripFeedbackCta ? (
                  <TouchableOpacity
                    onPress={() => {
                      setFeedbackBooking(item);
                      setFbOverall(null);
                      setFbNote("");
                    }}
                    style={[s.secondaryBtn, { marginTop: canCancelBooking ? 10 : 0 }]}
                    activeOpacity={0.85}
                  >
                    <Text style={s.secondaryBtnText}>{fr ? "Donner un avis sur la location" : "Rate this rental"}</Text>
                  </TouchableOpacity>
                ) : null}
                {item.hasCustomerBookingReview ? (
                  <Text style={[s.policyHint, { marginTop: 10 }]}>
                    {fr ? "Merci pour votre avis sur cette location." : "Thanks for your rental feedback."}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        }}
      />
      <Modal visible={!!rescheduleTarget} transparent animationType="fade" onRequestClose={closeReschedule}>
        <View style={s.modalBackdrop}>
          <View style={[s.modalCard, { alignSelf: "center", width: Math.min(SCREEN_W - 32, 400) }]}>
            <Text style={s.modalTitle}>{fr ? "Nouvelles dates" : "New dates"}</Text>
            <Text style={s.modalSub}>
              {fr
                ? "Une seule modification par réservation. Touchez une ligne pour ouvrir le calendrier. Les créneaux libres sont vérifiés à l’enregistrement."
                : "One change per booking. Tap a row to open the calendar. Free slots are checked when you save."}
            </Text>
            <Text style={s.modalLabel}>{fr ? "Début" : "Start"}</Text>
            <TouchableOpacity
              style={s.modalDateBtn}
              onPress={() => setActivePicker("start")}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={20} color={C.primary} />
              <Text style={s.modalDateBtnTxt}>
                {rStart ? new Date(parseYMDToLocalNoon(rStart)).toLocaleDateString(fr ? "fr-FR" : "en-GB") : "—"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={C.muted} />
            </TouchableOpacity>
            <Text style={s.modalLabel}>{fr ? "Fin" : "End"}</Text>
            <TouchableOpacity
              style={s.modalDateBtn}
              onPress={() => setActivePicker("end")}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={20} color={C.primary} />
              <Text style={s.modalDateBtnTxt}>
                {rEnd ? new Date(parseYMDToLocalNoon(rEnd)).toLocaleDateString(fr ? "fr-FR" : "en-GB") : "—"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={C.muted} />
            </TouchableOpacity>
            {activePicker ? (
              <View style={s.modalPickerWrap}>
                <DateTimePicker
                  value={
                    activePicker === "start"
                      ? parseYMDToLocalNoon(rStart) || new Date()
                      : parseYMDToLocalNoon(rEnd) || new Date()
                  }
                  mode="date"
                  display={Platform.OS === "ios" ? "inline" : "default"}
                  themeVariant={isDark ? "dark" : "light"}
                  locale={fr ? "fr-FR" : "en-GB"}
                  minimumDate={activePicker === "start" ? startOfLocalTodayMidnight() : minEndForDatePicker}
                  onChange={onModalDateChange}
                />
                {Platform.OS === "ios" ? (
                  <TouchableOpacity style={s.modalPickerDone} onPress={() => setActivePicker(null)} activeOpacity={0.85}>
                    <Text style={s.modalPickerDoneTxt}>OK</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
            <View style={s.modalBtnRow}>
              <TouchableOpacity onPress={closeReschedule} style={s.modalSecondary} disabled={rSubmitting}>
                <Text style={s.modalSecondaryTxt}>{fr ? "Fermer" : "Close"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitReschedule}
                style={[s.modalPrimary, rSubmitting && { opacity: 0.6 }]}
                disabled={rSubmitting}
              >
                <Text style={s.modalPrimaryTxt}>{rSubmitting ? "…" : fr ? "Enregistrer" : "Save"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!swapModalBooking} transparent animationType="fade" onRequestClose={() => !swapSubmitting && setSwapModalBooking(null)}>
        <View style={s.modalBackdrop}>
          <View style={[s.modalCard, { alignSelf: "center", width: Math.min(SCREEN_W - 24, 420), maxHeight: "80%" }]}>
            <Text style={s.modalTitle}>{fr ? "Autres voitures disponibles" : "Other available cars"}</Text>
            <Text style={s.modalSub}>
              {fr
                ? "Même propriétaire, mêmes dates. Touchez une ligne pour remplacer votre réservation."
                : "Same owner, same dates. Tap a row to move your booking to that car."}
            </Text>
            {swapLoading ? (
              <ActivityIndicator color={C.primary} style={{ marginVertical: 24 }} />
            ) : (
              <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
                {swapAlternatives.length === 0 ? (
                  <Text style={{ color: C.muted, fontSize: 13, marginBottom: 12 }}>
                    {fr ? "Aucune autre voiture libre sur ces dates." : "No other car is free on these dates."}
                  </Text>
                ) : (
                  swapAlternatives.map((row) => {
                    const alt = row.rental;
                    const img = resolveMediaUrl(alt?.images?.[0]);
                    const tid = alt?._id || alt;
                    return (
                      <TouchableOpacity
                        key={String(tid)}
                        style={s.altRow}
                        disabled={swapSubmitting}
                        onPress={() => swapModalBooking && confirmSwapVehicle(swapModalBooking, String(tid))}
                        activeOpacity={0.88}
                      >
                        {img ? (
                          <Image source={{ uri: img }} style={s.altImg} resizeMode="cover" />
                        ) : (
                          <View style={[s.altImg, s.altImgPh]}>
                            <Ionicons name="car-outline" size={22} color={C.muted} />
                          </View>
                        )}
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text style={s.altTitle} numberOfLines={2}>
                            {alt?.title || `${alt?.brand || ""} ${alt?.model || ""}`.trim()}
                          </Text>
                          <Text style={s.altMeta}>
                            {Number(row.totalAmount || 0).toLocaleString(fr ? "fr-FR" : "en-US")} MAD
                            {row.appliedOfferTitle ? ` · ${row.appliedOfferTitle}` : ""}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={C.muted} />
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            )}
            <TouchableOpacity
              onPress={() => !swapSubmitting && setSwapModalBooking(null)}
              style={[s.modalSecondary, { marginTop: 12 }]}
              disabled={swapSubmitting}
            >
              <Text style={s.modalSecondaryTxt}>{fr ? "Fermer" : "Close"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={!!feedbackBooking} transparent animationType="fade" onRequestClose={closeFeedbackModal}>
        <View style={s.modalBackdrop}>
          <View style={[s.modalCard, { alignSelf: "center", width: Math.min(SCREEN_W - 32, 400) }]}>
            <Text style={s.modalTitle}>{fr ? "Votre avis" : "Your feedback"}</Text>
            <Text style={s.modalSub}>
              {fr
                ? "Comment s’est passée la location ? Un seul envoi par réservation."
                : "How was the trip? You can submit once per booking."}
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
              <TouchableOpacity
                onPress={() => setFbOverall("good")}
                style={[
                  s.modalSecondary,
                  { flex: 1, borderColor: fbOverall === "good" ? "#34d399" : undefined, backgroundColor: fbOverall === "good" ? "rgba(52,211,153,0.12)" : undefined },
                ]}
              >
                <Text style={[s.modalSecondaryTxt, fbOverall === "good" && { color: "#34d399" }]}>{fr ? "Bien" : "Good"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFbOverall("bad")}
                style={[
                  s.modalSecondary,
                  { flex: 1, borderColor: fbOverall === "bad" ? "#f87171" : undefined, backgroundColor: fbOverall === "bad" ? "rgba(248,113,113,0.12)" : undefined },
                ]}
              >
                <Text style={[s.modalSecondaryTxt, fbOverall === "bad" && { color: "#f87171" }]}>{fr ? "Moins bien" : "Poor"}</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.modalLabel}>{fr ? "Commentaire (optionnel)" : "Comment (optional)"}</Text>
            <TextInput
              style={[s.fbNoteInput, { color: C.white }]}
              placeholderTextColor={C.muted}
              placeholder={fr ? "Détails…" : "Details…"}
              value={fbNote}
              onChangeText={setFbNote}
              multiline
              maxLength={1500}
            />
            <View style={s.modalBtnRow}>
              <TouchableOpacity onPress={closeFeedbackModal} style={s.modalSecondary} disabled={fbSubmitting}>
                <Text style={s.modalSecondaryTxt}>{fr ? "Fermer" : "Close"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitTripFeedback}
                style={[s.modalPrimary, fbSubmitting && { opacity: 0.6 }]}
                disabled={fbSubmitting}
              >
                <Text style={s.modalPrimaryTxt}>{fbSubmitting ? "…" : fr ? "Envoyer" : "Send"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createMyBookingsStyles(C, isDark) {
  return StyleSheet.create({
    center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: C.bg },
    listHead: {
      marginHorizontal: -16,
      paddingHorizontal: 16,
      paddingBottom: 14,
      marginBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    listHeadAccent: { height: 2, width: 36, borderRadius: 2, backgroundColor: C.primary, marginBottom: 12, opacity: 0.9 },
    listHeadTitle: { color: C.white, fontSize: 22, fontWeight: "800", letterSpacing: -0.5 },
    listHeadSub: { color: C.muted, fontSize: 12, marginTop: 6, lineHeight: 17, maxWidth: SCREEN_W - 48 },
    empty: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 20 },
    emptyIconWrap: {
      width: 88,
      height: 88,
      borderRadius: 28,
      backgroundColor: isDark ? "rgba(124,107,255,0.12)" : "rgba(99,102,241,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    emptyTitle: { color: C.white, fontWeight: "800", fontSize: 18, marginTop: 20, textAlign: "center" },
    emptyHint: { color: C.muted, fontSize: 13, marginTop: 10, textAlign: "center", lineHeight: 20, maxWidth: Math.min(280, SCREEN_W - 48) },
    cta: { marginTop: 24, borderRadius: 14, overflow: "hidden", width: "100%", maxWidth: 300 },
    ctaGrad: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 15,
      paddingHorizontal: 22,
    },
    ctaText: { color: "#fff", fontWeight: "800", fontSize: 15 },
    card: {
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 20,
      marginBottom: 14,
      borderLeftWidth: 4,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: isDark ? 0.35 : 0.07,
      shadowRadius: 14,
      elevation: 4,
    },
    cardHero: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, paddingBottom: 10 },
    cardImg: { width: 88, height: 68, borderRadius: 14, backgroundColor: C.surface },
    cardImgPh: { alignItems: "center", justifyContent: "center" },
    cardHeroText: { flex: 1, minWidth: 0 },
    cardTitle: { color: C.white, fontWeight: "800", fontSize: 16, letterSpacing: -0.2 },
    cardCity: { color: C.muted, fontSize: 12, marginTop: 4 },
    cardBody: { paddingHorizontal: 14, paddingBottom: 14 },
    badge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, marginBottom: 12, gap: 6 },
    badgeText: { fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
    datesRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
    dateBox: { flex: 1, backgroundColor: C.inputBg, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 12 },
    dateLabel: { color: C.muted, fontSize: 11, fontWeight: "700", marginBottom: 4, letterSpacing: 0.3 },
    dateVal: { color: C.white, fontWeight: "600", fontSize: 13 },
    totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4 },
    totalLabel: { color: C.muted, fontSize: 13, fontWeight: "600" },
    totalVal: { color: C.primary, fontWeight: "900", fontSize: 18, letterSpacing: -0.3 },
    cancelBtn: {
      marginTop: 14,
      borderWidth: 1,
      borderColor: "rgba(248,113,113,0.45)",
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: "rgba(248,113,113,0.06)",
    },
    cancelText: { color: "#f87171", fontWeight: "700", fontSize: 13 },
    policyHint: { fontSize: 11, lineHeight: 16, color: C.muted, marginTop: 10, fontWeight: "600" },
    policyLocked: {
      fontSize: 12,
      lineHeight: 18,
      color: C.muted,
      marginTop: 10,
      fontWeight: "700",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.inputBg,
      textAlign: "center",
    },
    policyWarn: { fontSize: 11, lineHeight: 16, color: "#fbbf24", marginTop: 10, fontWeight: "700" },
    secondaryBtn: {
      marginTop: 12,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: C.inputBg,
    },
    secondaryBtnText: { color: C.white, fontWeight: "800", fontSize: 13 },
    modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 20 },
    modalCard: { backgroundColor: C.card, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: C.border },
    modalTitle: { color: C.white, fontSize: 18, fontWeight: "900", marginBottom: 6 },
    modalSub: { color: C.muted, fontSize: 12, lineHeight: 17, marginBottom: 14 },
    modalLabel: { color: C.muted, fontSize: 11, fontWeight: "800", marginBottom: 6 },
    modalDateBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 14,
      marginBottom: 12,
      backgroundColor: C.inputBg,
    },
    modalDateBtnTxt: { flex: 1, color: C.white, fontSize: 15, fontWeight: "700" },
    modalPickerWrap: { marginBottom: 8, alignItems: "stretch" },
    modalPickerDone: {
      marginTop: 8,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.border,
    },
    modalPickerDoneTxt: { color: C.white, fontWeight: "800", fontSize: 14 },
    modalBtnRow: { flexDirection: "row", gap: 10, marginTop: 8 },
    modalSecondary: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: C.border },
    modalSecondaryTxt: { color: C.muted, fontWeight: "800" },
    modalPrimary: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: "center", backgroundColor: C.primary },
    modalPrimaryTxt: { color: "#fff", fontWeight: "800" },
    vehicleIssueBox: {
      marginTop: 12,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(245,158,11,0.45)",
      backgroundColor: "rgba(245,158,11,0.1)",
    },
    vehicleIssueTitle: { color: "#fde68a", fontWeight: "900", fontSize: 14, marginBottom: 8 },
    vehicleIssueBody: { color: C.muted, fontSize: 12, lineHeight: 18, marginBottom: 12 },
    vehicleIssueBtn: {
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      backgroundColor: "rgba(248,113,113,0.15)",
      borderWidth: 1,
      borderColor: "rgba(248,113,113,0.45)",
    },
    vehicleIssueBtnAlt: {
      marginTop: 8,
      backgroundColor: "rgba(124,107,255,0.15)",
      borderColor: "rgba(124,107,255,0.45)",
    },
    vehicleIssueBtnTxt: { color: C.white, fontWeight: "800", fontSize: 13 },
    altRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
      paddingHorizontal: 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    altImg: { width: 56, height: 44, borderRadius: 10, backgroundColor: C.surface },
    altImgPh: { alignItems: "center", justifyContent: "center" },
    altTitle: { color: C.white, fontWeight: "700", fontSize: 14 },
    altMeta: { color: C.muted, fontSize: 12, marginTop: 4 },
    fbNoteInput: {
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 12,
      padding: 12,
      minHeight: 88,
      textAlignVertical: "top",
      backgroundColor: C.inputBg,
      marginBottom: 8,
      fontSize: 14,
    },
  });
}
