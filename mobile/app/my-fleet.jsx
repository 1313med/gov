import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getOwnerRentals, deleteRental, updateRental } from "../src/api/rental";
import { useAppLang } from "../src/context/AppLangContext";
import { resolveMediaUrl } from "../src/utils/mediaUrl";
import { useTheme } from "../src/context/ThemeContext";

const STATUS = {
  pending: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#f59e0b" },
  approved: { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", text: "#34d399" },
  rejected: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#ef4444" },
};

const BLANK_OFFER = {
  type: "free_days",
  title: "",
  description: "",
  minDays: 3,
  freeExtraDays: 1,
  discountPercent: 10,
  expiresAt: "",
};

function offerSummary(o, fr) {
  if (o.type === "free_days") {
    return fr
      ? `À partir de ${o.minDays} j. · +${o.freeExtraDays} j. offert(s)`
      : `From ${o.minDays} days · +${o.freeExtraDays} free day(s)`;
  }
  if (o.type === "percent_discount") {
    return fr
      ? `À partir de ${o.minDays} j. · −${o.discountPercent} %`
      : `From ${o.minDays} days · −${o.discountPercent}%`;
  }
  return o.description?.trim() || (fr ? "Offre personnalisée" : "Custom offer");
}

function normalizeOffersForApi(offers) {
  return offers.map((o) => {
    const exp = o.expiresAt && String(o.expiresAt).trim();
    return {
      type: o.type,
      title: String(o.title || "").trim(),
      description: o.description?.trim() || undefined,
      minDays: Math.max(1, parseInt(String(o.minDays), 10) || 1),
      freeExtraDays: Math.max(0, parseInt(String(o.freeExtraDays), 10) || 0),
      discountPercent: Math.min(100, Math.max(0, parseFloat(String(o.discountPercent)) || 0)),
      isActive: !!o.isActive,
      expiresAt: exp ? new Date(`${exp}T23:59:59.999Z`).toISOString() : null,
    };
  });
}

export default function MyFleetScreen() {
  const { lang } = useAppLang();
  const { colors: C } = useTheme();
  const s = useMemo(() => createMyFleetStyles(C), [C]);
  const router = useRouter();
  const fr = lang === "fr";
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [promoRental, setPromoRental] = useState(null);
  const [offers, setOffers] = useState([]);
  const [newOffer, setNewOffer] = useState(BLANK_OFFER);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [savingPromos, setSavingPromos] = useState(false);

  const [airportRental, setAirportRental] = useState(null);
  const [airportOffered, setAirportOffered] = useState(false);
  const [airportFee, setAirportFee] = useState("");
  const [savingAirport, setSavingAirport] = useState(false);

  const load = async () => {
    try {
      const { data } = await getOwnerRentals();
      setRentals(Array.isArray(data) ? data : data.rentals || []);
    } catch {
      Alert.alert("Failed to load fleet");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const openPromos = (car) => {
    setPromoRental(car);
    setOffers((car.offers || []).map((o) => ({ ...o, expiresAt: o.expiresAt ? String(o.expiresAt).slice(0, 10) : "" })));
    setNewOffer({ ...BLANK_OFFER });
    setShowOfferForm(false);
  };

  const closePromos = () => {
    setPromoRental(null);
    setOffers([]);
    setShowOfferForm(false);
  };

  const addOffer = () => {
    if (!newOffer.title?.trim()) {
      Alert.alert(fr ? "Titre requis" : "Title required", fr ? "Donnez un titre à l’offre." : "Give the offer a title.");
      return;
    }
    setOffers((p) => [...p, { ...newOffer, isActive: true, title: newOffer.title.trim() }]);
    setNewOffer({ ...BLANK_OFFER });
    setShowOfferForm(false);
  };

  const removeOffer = (idx) => setOffers((p) => p.filter((_, i) => i !== idx));
  const toggleOffer = (idx) => setOffers((p) => p.map((o, i) => (i === idx ? { ...o, isActive: !o.isActive } : o)));

  const savePromos = async () => {
    if (!promoRental) return;
    for (const o of offers) {
      if (!String(o.title || "").trim()) {
        Alert.alert(fr ? "Titre manquant" : "Missing title", fr ? "Chaque offre doit avoir un titre." : "Each offer needs a title.");
        return;
      }
    }
    setSavingPromos(true);
    try {
      const body = normalizeOffersForApi(offers);
      const { data } = await updateRental(promoRental._id, { offers: body });
      setRentals((p) => p.map((c) => (c._id === data._id ? data : c)));
      Alert.alert("", fr ? "Promotions enregistrées." : "Promotions saved.");
      closePromos();
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || (fr ? "Échec de l’enregistrement" : "Save failed"));
    } finally {
      setSavingPromos(false);
    }
  };

  const openAirport = (car) => {
    setAirportRental(car);
    setAirportOffered(!!car.airportDeliveryOffered);
    setAirportFee(
      car.airportDeliveryFeeMad != null && Number(car.airportDeliveryFeeMad) > 0
        ? String(car.airportDeliveryFeeMad)
        : "",
    );
  };

  const closeAirport = () => {
    setAirportRental(null);
    setAirportFee("");
    setAirportOffered(false);
  };

  const saveAirport = async () => {
    if (!airportRental) return;
    const fee = Math.max(0, parseFloat(String(airportFee).replace(",", ".")) || 0);
    if (airportOffered && fee <= 0) {
      Alert.alert(fr ? "Tarif" : "Fee", fr ? "Entrez un montant supérieur à 0 MAD." : "Enter a fee greater than 0 MAD.");
      return;
    }
    setSavingAirport(true);
    try {
      const { data } = await updateRental(airportRental._id, {
        airportDeliveryOffered: airportOffered,
        airportDeliveryFeeMad: airportOffered ? fee : 0,
      });
      setRentals((p) => p.map((c) => (c._id === data._id ? data : c)));
      Alert.alert("", fr ? "Service aéroport enregistré." : "Airport service saved.");
      closeAirport();
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || (fr ? "Échec" : "Save failed"));
    } finally {
      setSavingAirport(false);
    }
  };

  const handleDelete = (id) =>
    Alert.alert(fr ? "Supprimer" : "Delete", fr ? "Êtes-vous sûr ?" : "Are you sure?", [
      { text: fr ? "Annuler" : "Cancel" },
      {
        text: fr ? "Supprimer" : "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRental(id);
            load();
          } catch {
            Alert.alert("Failed to delete rental");
          }
        },
      },
    ]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <TouchableOpacity onPress={() => router.push("/add-rental")} style={s.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <FlatList
        data={rentals}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="car-outline" size={56} color={C.muted} />
            <Text style={s.emptyTitle}>{fr ? "Parc vide" : "No vehicles yet"}</Text>
            <TouchableOpacity onPress={() => router.push("/add-rental")} style={s.emptyBtn}>
              <Ionicons name="add-circle-outline" size={18} color="#fff" />
              <Text style={s.emptyBtnText}>{fr ? "Ajouter un véhicule" : "Add Vehicle"}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const st = STATUS[item.status] || STATUS.pending;
          const uri = resolveMediaUrl(item.images?.[0]);
          const activeOffers = (item.offers || []).filter((o) => o.isActive);
          return (
            <View style={s.card}>
              {uri ? (
                <Image source={{ uri }} style={s.cardImg} resizeMode="cover" />
              ) : (
                <View style={s.cardImgPlaceholder}>
                  <Ionicons name="car-sport-outline" size={48} color={C.muted} />
                </View>
              )}
              <View style={s.cardBody}>
                <View style={s.topRow}>
                  <Text style={s.cardTitle} numberOfLines={1}>
                    {item.title || `${item.brand} ${item.model}`}
                  </Text>
                  <Text style={s.cardPrice}>{item.pricePerDay} MAD/day</Text>
                </View>
                <View style={s.metaRow}>
                  <View style={[s.badge, { backgroundColor: st.bg, borderColor: st.border }]}>
                    <Text style={[s.badgeText, { color: st.text }]}>{item.status}</Text>
                  </View>
                  {activeOffers.length > 0 && (
                    <View style={s.promoBadge}>
                      <Ionicons name="pricetag" size={11} color="#fbbf24" />
                      <Text style={s.promoBadgeText}>
                        {activeOffers.length} {fr ? "promo act." : "active"}
                      </Text>
                    </View>
                  )}
                  {item.airportDeliveryOffered && Number(item.airportDeliveryFeeMad) > 0 && (
                    <View style={s.airBadge}>
                      <Ionicons name="airplane-outline" size={11} color="#38bdf8" />
                      <Text style={s.airBadgeText}>{item.airportDeliveryFeeMad} MAD</Text>
                    </View>
                  )}
                  {item.city && (
                    <View style={s.cityRow}>
                      <Ionicons name="location-outline" size={12} color={C.muted} />
                      <Text style={s.cityText}>{item.city}</Text>
                    </View>
                  )}
                </View>
                <View style={s.actionsRow}>
                  <TouchableOpacity onPress={() => openPromos(item)} style={[s.actionBtn, s.actionPromo]}>
                    <Ionicons name="pricetag-outline" size={15} color="#fbbf24" />
                    <Text style={[s.actionBtnText, { color: "#fbbf24" }]}>{fr ? "Promos" : "Deals"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openAirport(item)} style={[s.actionBtn, s.actionAirport]}>
                    <Ionicons name="airplane-outline" size={15} color="#38bdf8" />
                    <Text style={[s.actionBtnText, { color: "#38bdf8" }]}>{fr ? "Aéroport" : "Airport"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push("/owner-bookings")}
                    style={[s.actionBtn, { backgroundColor: "rgba(124,107,255,0.1)", borderColor: "rgba(124,107,255,0.3)" }]}
                  >
                    <Ionicons name="calendar-outline" size={15} color={C.primary} />
                    <Text style={[s.actionBtnText, { color: C.primary }]}>{fr ? "Résa." : "Bookings"}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item._id)}
                    style={[s.actionBtn, { backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)" }]}
                  >
                    <Ionicons name="trash-outline" size={15} color={C.red} />
                    <Text style={[s.actionBtnText, { color: C.red }]}>{fr ? "Suppr." : "Delete"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={!!promoRental} animationType="slide" transparent onRequestClose={closePromos}>
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={closePromos} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.modalSheetWrap}>
            <View style={s.modalBox}>
              <View style={s.modalHead}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={s.modalTitle} numberOfLines={2}>
                  {fr ? "Promotions" : "Promotions"}
                </Text>
                <Text style={s.modalSub} numberOfLines={1}>
                  {promoRental?.title}
                </Text>
              </View>
                <TouchableOpacity onPress={closePromos} hitSlop={12} style={s.modalClose}>
                  <Ionicons name="close" size={22} color={C.muted} />
                </TouchableOpacity>
              </View>

              <Text style={s.modalHint}>
              {fr
                ? "Réductions ou jours offerts quand la location atteint une durée minimum (comme sur le web)."
                : "Discounts or free days when the rental meets a minimum length (same as web)."}
              </Text>

              <ScrollView style={s.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {offers.map((o, i) => (
                  <View key={i} style={[s.offerRow, o.isActive && s.offerRowActive]}>
                    <View style={s.offerRowTop}>
                      <Ionicons name="pricetag-outline" size={18} color={o.isActive ? "#fbbf24" : C.muted} />
                      <Text style={s.offerTitle} numberOfLines={2}>
                        {o.title}
                      </Text>
                      <Switch
                        value={!!o.isActive}
                        onValueChange={() => toggleOffer(i)}
                        trackColor={{ false: C.border, true: "rgba(251,191,36,0.35)" }}
                        thumbColor={o.isActive ? "#fbbf24" : C.muted}
                      />
                      <TouchableOpacity onPress={() => removeOffer(i)} hitSlop={8}>
                        <Ionicons name="trash-outline" size={18} color={C.red} />
                      </TouchableOpacity>
                    </View>
                    <Text style={s.offerMeta}>{offerSummary(o, fr)}</Text>
                    {o.expiresAt ? (
                      <Text style={s.offerExp}>
                        {fr ? "Expire" : "Expires"}: {String(o.expiresAt).slice(0, 10)}
                      </Text>
                    ) : null}
                    {o.description ? <Text style={s.offerDesc}>{o.description}</Text> : null}
                  </View>
                ))}

                {showOfferForm ? (
                  <View style={s.formBox}>
                  <Text style={s.formLabel}>{fr ? "Type" : "Type"}</Text>
                  <View style={s.typeRow}>
                    {[
                      ["free_days", fr ? "Jours offerts" : "Free days"],
                      ["percent_discount", fr ? "−%" : "−%"],
                      ["custom", fr ? "Perso." : "Custom"],
                    ].map(([key, label]) => (
                      <TouchableOpacity
                        key={key}
                        onPress={() => setNewOffer((p) => ({ ...p, type: key }))}
                        style={[s.typePill, newOffer.type === key && s.typePillOn]}
                      >
                        <Text style={[s.typePillText, newOffer.type === key && s.typePillTextOn]}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={s.formLabel}>{fr ? "Titre" : "Title"}</Text>
                  <TextInput
                    value={newOffer.title}
                    onChangeText={(t) => setNewOffer((p) => ({ ...p, title: t }))}
                    placeholder={fr ? "ex. Semaine en or" : "e.g. Week special"}
                    placeholderTextColor={C.muted}
                    style={s.input}
                  />

                  <Text style={s.formLabel}>{fr ? "Description (optionnel)" : "Description (optional)"}</Text>
                  <TextInput
                    value={newOffer.description}
                    onChangeText={(t) => setNewOffer((p) => ({ ...p, description: t }))}
                    placeholder="…"
                    placeholderTextColor={C.muted}
                    style={s.input}
                  />

                  {newOffer.type !== "custom" && (
                    <View style={s.formRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.formLabel}>{fr ? "Jours min." : "Min days"}</Text>
                        <TextInput
                          value={String(newOffer.minDays)}
                          onChangeText={(t) => setNewOffer((p) => ({ ...p, minDays: parseInt(t, 10) || 1 }))}
                          keyboardType="number-pad"
                          style={s.input}
                        />
                      </View>
                      {newOffer.type === "free_days" && (
                        <View style={{ flex: 1 }}>
                          <Text style={s.formLabel}>{fr ? "J. offerts" : "Free days"}</Text>
                          <TextInput
                            value={String(newOffer.freeExtraDays)}
                            onChangeText={(t) => setNewOffer((p) => ({ ...p, freeExtraDays: parseInt(t, 10) || 0 }))}
                            keyboardType="number-pad"
                            style={s.input}
                          />
                        </View>
                      )}
                      {newOffer.type === "percent_discount" && (
                        <View style={{ flex: 1 }}>
                          <Text style={s.formLabel}>{fr ? "%" : "% off"}</Text>
                          <TextInput
                            value={String(newOffer.discountPercent)}
                            onChangeText={(t) => setNewOffer((p) => ({ ...p, discountPercent: parseInt(t, 10) || 0 }))}
                            keyboardType="number-pad"
                            style={s.input}
                          />
                        </View>
                      )}
                    </View>
                  )}

                  <Text style={s.formLabel}>{fr ? "Expire le (AAAA-MM-JJ, vide = jamais)" : "Expires (YYYY-MM-DD, empty = never)"}</Text>
                  <TextInput
                    value={newOffer.expiresAt}
                    onChangeText={(t) => setNewOffer((p) => ({ ...p, expiresAt: t }))}
                    placeholder="2026-12-31"
                    placeholderTextColor={C.muted}
                    style={s.input}
                    autoCapitalize="none"
                  />

                    <View style={s.formActions}>
                      <TouchableOpacity onPress={() => setShowOfferForm(false)} style={s.btnGhost}>
                        <Text style={s.btnGhostText}>{fr ? "Annuler" : "Cancel"}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={addOffer} style={s.btnPrimary}>
                        <Text style={s.btnPrimaryText}>{fr ? "Ajouter" : "Add"}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => setShowOfferForm(true)} style={s.addOfferBtn}>
                    <Ionicons name="add-circle-outline" size={20} color={C.primary} />
                    <Text style={s.addOfferBtnText}>{fr ? "Nouvelle promotion" : "New promotion"}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              <TouchableOpacity
                onPress={savePromos}
                disabled={savingPromos}
                style={[s.saveBtn, savingPromos && { opacity: 0.7 }]}
              >
                {savingPromos ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.saveBtnText}>{fr ? "Enregistrer les promotions" : "Save promotions"}</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={!!airportRental} animationType="slide" transparent onRequestClose={closeAirport}>
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={closeAirport} />
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={s.modalSheetWrap}>
            <View style={s.modalBox}>
              <View style={s.modalHead}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={s.modalTitle}>{fr ? "Livraison aéroport" : "Airport delivery"}</Text>
                  <Text style={s.modalSub} numberOfLines={1}>
                    {airportRental?.title}
                  </Text>
                </View>
                <TouchableOpacity onPress={closeAirport} hitSlop={12} style={s.modalClose}>
                  <Ionicons name="close" size={22} color={C.muted} />
                </TouchableOpacity>
              </View>
              <Text style={s.modalHint}>
                {fr
                  ? "Proposez de déposer le véhicule à l'aéroport pour le client. Tarif unique en MAD."
                  : "Offer to bring the car to the airport for your renter. One-time fee in MAD."}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <Text style={{ color: C.white, fontWeight: "700", fontSize: 15 }}>{fr ? "Activer" : "Enabled"}</Text>
                <Switch
                  value={airportOffered}
                  onValueChange={setAirportOffered}
                  trackColor={{ false: C.border, true: "rgba(56,189,248,0.35)" }}
                  thumbColor={airportOffered ? "#38bdf8" : C.muted}
                />
              </View>
              {airportOffered ? (
                <>
                  <Text style={s.formLabel}>{fr ? "Tarif (MAD)" : "Fee (MAD)"}</Text>
                  <TextInput
                    value={airportFee}
                    onChangeText={setAirportFee}
                    placeholder="250"
                    placeholderTextColor={C.muted}
                    keyboardType="decimal-pad"
                    style={s.input}
                  />
                </>
              ) : null}
              <TouchableOpacity
                onPress={saveAirport}
                disabled={savingAirport}
                style={[s.saveBtn, savingAirport && { opacity: 0.7 }]}
              >
                {savingAirport ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.saveBtnText}>{fr ? "Enregistrer" : "Save"}</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

function createMyFleetStyles(C) {
  return StyleSheet.create({
    center: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      zIndex: 10,
      backgroundColor: C.primary,
      borderRadius: 28,
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
      elevation: 8,
    },
    empty: { alignItems: "center", paddingVertical: 64 },
    emptyTitle: { color: C.white, fontWeight: "700", fontSize: 18, marginTop: 16, marginBottom: 20 },
    emptyBtn: {
      backgroundColor: C.primary,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    emptyBtnText: { color: "#fff", fontWeight: "700" },
    card: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, marginBottom: 16, overflow: "hidden" },
    cardImg: { width: "100%", height: 160 },
    cardImgPlaceholder: { width: "100%", height: 160, backgroundColor: C.surface, alignItems: "center", justifyContent: "center" },
    cardBody: { padding: 16 },
    topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 },
    cardTitle: { color: C.white, fontWeight: "700", fontSize: 15, flex: 1, marginRight: 8 },
    cardPrice: { color: C.accent, fontWeight: "700" },
    metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    badge: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
    badgeText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
    promoBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "rgba(251,191,36,0.12)",
      borderWidth: 1,
      borderColor: "rgba(251,191,36,0.28)",
    },
    promoBadgeText: { color: "#fbbf24", fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
    airBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "rgba(56,189,248,0.12)",
      borderWidth: 1,
      borderColor: "rgba(56,189,248,0.28)",
    },
    airBadgeText: { color: "#38bdf8", fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
    cityRow: { flexDirection: "row", alignItems: "center" },
    cityText: { color: C.muted, fontSize: 12, marginLeft: 4 },
    actionsRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    actionBtn: {
      flex: 1,
      minWidth: "28%",
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    actionPromo: { backgroundColor: "rgba(251,191,36,0.1)", borderColor: "rgba(251,191,36,0.35)" },
    actionAirport: { backgroundColor: "rgba(56,189,248,0.1)", borderColor: "rgba(56,189,248,0.35)" },
    actionBtnText: { fontSize: 12, fontWeight: "600" },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.72)",
    },
    modalSheetWrap: {
      width: "100%",
      maxHeight: "92%",
    },
    modalBox: {
      backgroundColor: C.card,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      borderWidth: 1,
      borderColor: C.border,
      maxHeight: "88%",
      paddingBottom: 20,
    },
    modalHead: { flexDirection: "row", alignItems: "flex-start", padding: 18, paddingBottom: 8, gap: 12 },
    modalTitle: { color: C.white, fontSize: 18, fontWeight: "800", letterSpacing: -0.3 },
    modalSub: { color: C.muted, fontSize: 12, marginTop: 4 },
    modalClose: { padding: 4 },
    modalHint: { color: C.muted, fontSize: 12, lineHeight: 17, paddingHorizontal: 18, marginBottom: 8 },
    modalScroll: { maxHeight: 420, paddingHorizontal: 18 },
    offerRow: {
      backgroundColor: C.inputBg,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: C.border,
      padding: 12,
      marginBottom: 10,
    },
    offerRowActive: { borderColor: "rgba(251,191,36,0.35)" },
    offerRowTop: { flexDirection: "row", alignItems: "center", gap: 8 },
    offerTitle: { flex: 1, color: C.white, fontWeight: "700", fontSize: 14 },
    offerMeta: { color: "#fbbf24", fontSize: 11, fontWeight: "600", marginTop: 6, marginLeft: 26 },
    offerExp: { color: "#f87171", fontSize: 11, marginTop: 4, marginLeft: 26 },
    offerDesc: { color: C.muted, fontSize: 12, marginTop: 6, marginLeft: 26, lineHeight: 17 },
    formBox: {
      backgroundColor: "rgba(124,107,255,0.08)",
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(124,107,255,0.22)",
      padding: 14,
      marginBottom: 16,
    },
    formLabel: { color: C.muted, fontSize: 10, fontWeight: "700", letterSpacing: 0.5, marginBottom: 6, marginTop: 10, textTransform: "uppercase" },
    formRow: { flexDirection: "row", gap: 10 },
    input: {
      backgroundColor: C.surface,
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 12,
      color: C.white,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
    },
    typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    typePill: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surface,
    },
    typePillOn: { borderColor: C.primary, backgroundColor: "rgba(124,107,255,0.15)" },
    typePillText: { color: C.muted, fontSize: 12, fontWeight: "600" },
    typePillTextOn: { color: C.primary },
    formActions: { flexDirection: "row", gap: 10, marginTop: 14 },
    btnGhost: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, borderWidth: 1, borderColor: C.border },
    btnGhostText: { color: C.muted, fontWeight: "700" },
    btnPrimary: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: C.primary },
    btnPrimaryText: { color: "#fff", fontWeight: "800" },
    addOfferBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: C.primary + "44",
      borderRadius: 14,
      borderStyle: "dashed",
    },
    addOfferBtnText: { color: C.primary, fontWeight: "700", fontSize: 14 },
    saveBtn: {
      marginHorizontal: 18,
      marginTop: 8,
      backgroundColor: C.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
    },
    saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  });
}
