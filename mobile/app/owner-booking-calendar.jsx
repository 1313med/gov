import { useState, useEffect, useCallback } from "react";
import { View, ScrollView, ActivityIndicator, RefreshControl, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppLang } from "../src/context/AppLangContext";
import { useTheme } from "../src/context/ThemeContext";
import { getOwnerBookings } from "../src/api/rental";
import OwnerAnalyticsMiniCalendar from "../src/components/OwnerAnalyticsMiniCalendar";

export default function OwnerBookingCalendarScreen() {
  const { lang } = useAppLang();
  const { colors: C } = useTheme();
  const insets = useSafeAreaInsets();
  const fr = lang === "fr";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await getOwnerBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: C.bg }]}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={{ color: C.muted, marginTop: 12, fontSize: 14 }}>
          {fr ? "Chargement du calendrier…" : "Loading calendar…"}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: insets.bottom + 28 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />
      }
    >
      <OwnerAnalyticsMiniCalendar bookings={bookings} fr={fr} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
