import { useState, useEffect, useCallback, useMemo } from "react";
import { PageLoader } from '../../src/components/AppLoadingScreen';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CarCard from "../components/CarCard";
import RentalCard from "../components/RentalCard";
import {
  getFavorites,
  removeFavorite,
  getRentalFavorites,
  removeRentalFavorite,
} from "../api/user";
import { useAuth } from "../context/AuthContext";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";

export default function SavedScreen() {
  const { auth } = useAuth();
  const { lang, pick } = useAppLang();
  const fr = lang === "fr";
  const { colors: C, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = useMemo(() => createStyles(C, isDark), [C, isDark]);

  const [segment, setSegment] = useState("rentals");
  const [rentals, setRentals] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!auth) {
      setRentals([]);
      setSales([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.all([
        getRentalFavorites().catch(() => ({ data: [] })),
        getFavorites().catch(() => ({ data: [] })),
      ]);
      const rList = Array.isArray(rRes.data) ? rRes.data : [];
      const sList = Array.isArray(sRes.data) ? sRes.data : [];
      setRentals(rList.filter((x) => x && x._id));
      setSales(sList.filter((x) => x && x._id));
    } catch {
      Alert.alert("Error", pick("Failed to load saved items", "Échec du chargement"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [auth, fr]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const removeRentalFav = async (id) => {
    try {
      await removeRentalFavorite(id);
      setRentals((p) => p.filter((x) => String(x._id) !== String(id)));
    } catch {
      Alert.alert("Error", pick("Could not remove", "Échec de la suppression"));
    }
  };

  const removeSaleFav = async (id) => {
    try {
      await removeFavorite(id);
      setSales((p) => p.filter((x) => String(x._id) !== String(id)));
    } catch {
      Alert.alert("Error", pick("Could not remove", "Échec de la suppression"));
    }
  };

  const list = segment === "rentals" ? rentals : sales;

  if (!auth) {
    return (
      <View style={[s.flex, { backgroundColor: C.bg, paddingTop: insets.top + 48 }]}>
        <View style={s.headerInner}>
          <View style={s.titleRow}>
            <View style={s.accent} />
            <Text style={s.title}>{pick("Saved", "Favoris")}</Text>
          </View>
          <Text style={s.sub}>
            {pick("Sign in to save rental listings and cars for sale in one place.", "Connectez-vous pour enregistrer des locations et des voitures à acheter.")}
          </Text>
        </View>
        <View style={s.emptyWrap}>
          <View style={s.emptyIcon}>
            <Ionicons name="heart-dislike-outline" size={44} color={C.primary} />
          </View>
          <Text style={s.emptyTitle}>{pick("Not signed in", "Aucun compte")}</Text>
          <Text style={s.emptySub}>
            {pick("Open the Profile tab to log in.", "Ouvrez l'onglet Profil pour vous connecter.")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[s.flex, { backgroundColor: C.bg }]}>
      <View style={[s.header, { paddingTop: insets.top + 48 }]}>
        <View style={s.headerInner}>
          <View style={s.titleRow}>
            <View style={s.accent} />
            <Text style={s.title}>{pick("Saved", "Favoris")}</Text>
          </View>
          <Text style={s.sub}>
            {pick("Two lists: cars to rent and cars to buy. Tap the heart on any listing to add it here.", "Deux listes distinctes : véhicules à louer et à acheter. Touchez le cœur sur une fiche pour l'ajouter ici.")}
          </Text>
        </View>

        <View style={s.segment}>
          <TouchableOpacity
            onPress={() => setSegment("rentals")}
            activeOpacity={0.85}
            style={[s.segBtn, segment === "rentals" && s.segBtnOn]}
          >
            <Ionicons
              name="car-sport-outline"
              size={16}
              color={segment === "rentals" ? "#fff" : C.muted}
            />
            <Text style={[s.segLabel, segment === "rentals" && s.segLabelOn]}>
              {pick("Rentals", "À louer")}
            </Text>
            {rentals.length > 0 && (
              <View style={[s.count, segment === "rentals" && s.countOn]}>
                <Text style={[s.countT, segment === "rentals" && s.countTOn]}>{rentals.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSegment("sales")}
            activeOpacity={0.85}
            style={[s.segBtn, segment === "sales" && s.segBtnOnSale]}
          >
            <Ionicons
              name="pricetag-outline"
              size={16}
              color={segment === "sales" ? "#fff" : C.muted}
            />
            <Text style={[s.segLabel, segment === "sales" && s.segLabelOn]}>
              {pick("For sale", "À vendre")}
            </Text>
            {sales.length > 0 && (
              <View style={[s.count, segment === "sales" && s.countOnSale]}>
                <Text style={[s.countT, segment === "sales" && s.countTOn]}>{sales.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={s.hint}>
          <Ionicons name="information-circle-outline" size={18} color={C.primary} />
          <Text style={s.hintText}>
            {segment === "rentals"
              ? pick("Rentals: per-day pricing — open a card to book.", "Locations : prix par jour, réservation depuis l'annonce.")
              : pick("Purchase listings: full price shown — open a card for details.", "Achat : prix total affiché, contact vendeur sur la fiche.")}
          </Text>
        </View>
      </View>

      {loading && list.length === 0 ? (
        <PageLoader />
      ) : (
        <FlatList
          key={segment}
          data={list}
          keyExtractor={(item) => String(item._id)}
          renderItem={({ item }) =>
            segment === "rentals" ? (
              <RentalCard
                rental={item}
                onPress={() => router.push(`/rentals/${item._id}`)}
                onFavorite={() => removeRentalFav(item._id)}
                isFavorite
              />
            ) : (
              <CarCard
                car={item}
                onPress={() => router.push(`/cars/${item._id}`)}
                onFavorite={() => removeSaleFav(item._id)}
                isFavorite
              />
            )
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: insets.bottom + 28,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
          }
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <View style={s.emptyIcon}>
                <Ionicons name="heart-outline" size={44} color={C.primary} />
              </View>
              <Text style={s.emptyTitle}>
                {segment === "rentals"
                  ? pick("No saved rentals yet", "Aucune location en favoris")
                  : pick("No saved cars for sale yet", "Aucune voiture à vendre en favoris")}
              </Text>
              <Text style={s.emptySub}>
                {segment === "rentals"
                  ? pick("Browse the Rentals tab and tap the heart on listings you like.", "Parcourez l'onglet Locations et touchez le cœur sur les annonces qui vous intéressent.")
                  : pick("Browse the Cars tab and save vehicles you might want to buy.", "Parcourez l'onglet Cars et enregistrez les véhicules à acheter.")}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function createStyles(C, isDark) {
  return StyleSheet.create({
    flex: { flex: 1 },
    header: {
      paddingBottom: 14,
      backgroundColor: C.surface,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    headerInner: { paddingHorizontal: 16 },
    titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    accent: {
      width: 4,
      height: 22,
      borderRadius: 2,
      backgroundColor: C.primary,
    },
    title: { color: C.white, fontWeight: "800", fontSize: 22, letterSpacing: -0.4 },
    sub: { color: C.muted, fontSize: 13, marginTop: 10, lineHeight: 19 },
    segment: {
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 16,
      marginTop: 16,
    },
    segBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
    },
    segBtnOn: {
      backgroundColor: C.primary,
      borderColor: C.primary,
      shadowColor: C.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    segBtnOnSale: {
      backgroundColor: "#0d9488",
      borderColor: "#0d9488",
      shadowColor: "#0d9488",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    segLabel: { color: C.muted, fontSize: 13, fontWeight: "700" },
    segLabelOn: { color: "#fff" },
    count: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.border,
    },
    countOn: { backgroundColor: "rgba(255,255,255,0.25)", borderColor: "transparent" },
    countOnSale: { backgroundColor: "rgba(255,255,255,0.25)", borderColor: "transparent" },
    countT: { color: C.muted, fontSize: 11, fontWeight: "800" },
    countTOn: { color: "#fff" },
    hint: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginHorizontal: 16,
      marginTop: 14,
      padding: 12,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(124,107,255,0.1)" : "rgba(99,102,241,0.08)",
      borderWidth: 1,
      borderColor: isDark ? "rgba(124,107,255,0.28)" : "rgba(99,102,241,0.22)",
    },
    hintText: { flex: 1, color: C.slate, fontSize: 12, lineHeight: 17 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    loadingText: { color: C.muted, marginTop: 12, fontSize: 13 },
    emptyWrap: { alignItems: "center", paddingVertical: 56, paddingHorizontal: 20 },
    emptyIcon: {
      width: 88,
      height: 88,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDark ? "rgba(124,107,255,0.12)" : "rgba(99,102,241,0.1)",
    },
    emptyTitle: {
      color: C.white,
      fontWeight: "800",
      fontSize: 18,
      marginTop: 16,
      textAlign: "center",
    },
    emptySub: {
      color: C.muted,
      fontSize: 13,
      marginTop: 10,
      textAlign: "center",
      lineHeight: 20,
    },
  });
}
