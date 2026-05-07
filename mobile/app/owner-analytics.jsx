import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppLang } from "../src/context/AppLangContext";
import { getOwnerAnalytics, getOwnerInsights } from "../src/api/analytics";
import { C } from "../src/theme";

const PERIODS = [
  { key: "today", en: "Today", fr: "Aujourd'hui" },
  { key: "7d", en: "7 days", fr: "7 j." },
  { key: "30d", en: "30 days", fr: "30 j." },
  { key: "3m", en: "3 months", fr: "3 mois" },
  { key: "1y", en: "1 year", fr: "1 an" },
];

function Kpi({ label, value, sub, color = C.primary }) {
  return (
    <View style={k.card}>
      <Text style={k.label}>{label}</Text>
      <Text style={[k.value, { color }]} numberOfLines={1}>{value}</Text>
      {sub ? <Text style={k.sub}>{sub}</Text> : null}
    </View>
  );
}

export default function OwnerAnalyticsScreen() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [a, i] = await Promise.all([getOwnerAnalytics(period), getOwnerInsights(period)]);
      setData(a);
      setInsights(Array.isArray(i?.insights) ? i.insights : []);
    } catch {
      setData(null);
      setInsights([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  const fmtMoney = (n) => `${Number(n || 0).toLocaleString()} MAD`;

  if (loading && !data) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={C.primary} size="large" />
        <Text style={s.muted}>{fr ? "Chargement…" : "Loading…"}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={s.center}>
        <Ionicons name="analytics-outline" size={48} color={C.muted} />
        <Text style={s.err}>{fr ? "Impossible de charger les statistiques." : "Could not load analytics."}</Text>
      </View>
    );
  }

  const growth = data.revenueGrowth;
  const growthStr = growth > 0 ? `+${growth}%` : growth < 0 ? `${growth}%` : "—";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={C.primary} />}
    >
      <View style={s.header}>
        <Text style={s.title}>{fr ? "Tableau de bord" : "Owner dashboard"}</Text>
        <Text style={s.sub}>{fr ? "Revenus, réservations et parc" : "Revenue, bookings & fleet"}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity key={p.key} onPress={() => setPeriod(p.key)} style={[s.periodChip, period === p.key && s.periodChipOn]}>
              <Text style={[s.periodText, period === p.key && s.periodTextOn]}>{fr ? p.fr : p.en}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={s.kpiGrid}>
        <Kpi label={fr ? "Chiffre d'affaires" : "Total revenue"} value={fmtMoney(data.totalRevenue)} sub={fr ? "Période sélectionnée" : "Selected period"} />
        <Kpi label={fr ? "Réservations" : "Bookings"} value={String(data.totalBookings ?? 0)} color={C.accent} />
        <Kpi label={fr ? "Occupation" : "Occupancy"} value={`${data.occupancyRate ?? 0}%`} sub={fr ? "Flotte" : "Fleet-wide"} color={C.green} />
        <Kpi label={fr ? "Marge nette" : "Net (after maintenance)"} value={fmtMoney(data.netProfit)} color={data.netProfit >= 0 ? C.green : C.red} />
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>{fr ? "Encaissement" : "Payments"}</Text>
        <Row label={fr ? "Encaissé" : "Collected"} value={fmtMoney(data.collectedRevenue)} />
        <Row label={fr ? "En attente" : "Pending"} value={fmtMoney(data.pendingRevenue)} />
        <Row label={fr ? "Coût entretien" : "Maintenance"} value={fmtMoney(data.totalMaintenanceCost)} />
        <Row label={fr ? "Évolution CA" : "Revenue vs prev."} value={growthStr} bold />
        <Row label={fr ? "CA moy. / jour" : "Avg. daily revenue"} value={fmtMoney(data.avgDailyRevenue)} />
      </View>

      {data.mostRentedCar && (
        <View style={s.card}>
          <Text style={s.cardTitle}>{fr ? "Véhicule le plus réservé" : "Most booked vehicle"}</Text>
          <Text style={s.highlight}>{data.mostRentedCar.title}</Text>
          <Text style={s.muted}>{fr ? "Réservations (période)" : "Bookings (period)"}: {data.mostRentedCar.count}</Text>
        </View>
      )}

      {Array.isArray(data.bookingStatusData) && data.bookingStatusData.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>{fr ? "Statut des réservations" : "Booking status"}</Text>
          {data.bookingStatusData.map((row) => (
            <Row key={row.name} label={row.name} value={String(row.value)} />
          ))}
        </View>
      )}

      {Array.isArray(data.fleetPerformance) && data.fleetPerformance.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>{fr ? "Performance par véhicule" : "Fleet performance"}</Text>
          {data.fleetPerformance.map((f) => (
            <View key={String(f.rentalId)} style={s.fleetRow}>
              <Text style={s.fleetTitle} numberOfLines={1}>{f.title}</Text>
              <Text style={s.fleetMeta}>
                {f.bookings} {fr ? "résa." : "book."} · {fmtMoney(f.revenue)} · {f.utilization}% {fr ? "occup." : "util."}
              </Text>
            </View>
          ))}
        </View>
      )}

      {Array.isArray(data.demandHeatmap) && data.demandHeatmap.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>{fr ? "Demande par jour" : "Demand by weekday"}</Text>
          <View style={s.heatRow}>
            {data.demandHeatmap.map((d) => (
              <View key={d.day} style={s.heatCell}>
                <Text style={s.heatDay}>{d.day}</Text>
                <Text style={s.heatVal}>{d.demand}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {Array.isArray(data.upcomingRentals) && data.upcomingRentals.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>{fr ? "À venir" : "Upcoming"}</Text>
          {data.upcomingRentals.map((b) => (
            <View key={b._id} style={s.upRow}>
              <Text style={s.upTitle} numberOfLines={1}>{b.rentalId?.title || "—"}</Text>
              <Text style={s.muted}>
                {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {insights.length > 0 && (
        <View style={s.card}>
          <Text style={s.cardTitle}>{fr ? "Recommandations" : "Insights"}</Text>
          {insights.map((ins, idx) => (
            <View key={idx} style={[s.insight, ins.type === "alert" && s.insightAlert, ins.type === "warning" && s.insightWarn]}>
              <Text style={s.insightTitle}>{ins.title}</Text>
              <Text style={s.insightAction}>{ins.action}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function Row({ label, value, bold }) {
  return (
    <View style={r.row}>
      <Text style={r.label}>{label}</Text>
      <Text style={[r.val, bold && r.valBold]}>{value}</Text>
    </View>
  );
}

const r = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  label: { color: C.muted, fontSize: 13, flex: 1 },
  val: { color: C.white, fontSize: 13, fontWeight: "600" },
  valBold: { color: C.primary },
});

const k = StyleSheet.create({
  card: { width: "48%", backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 12, marginBottom: 10 },
  label: { color: C.muted, fontSize: 10, textTransform: "uppercase", marginBottom: 6 },
  value: { fontSize: 16, fontWeight: "700" },
  sub: { color: C.muted, fontSize: 11, marginTop: 4 },
});

const s = StyleSheet.create({
  center: { flex: 1, backgroundColor: C.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: C.muted, marginTop: 12, fontSize: 13 },
  err: { color: C.white, textAlign: "center", marginTop: 12 },
  header: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 8 },
  title: { color: C.white, fontSize: 22, fontWeight: "800" },
  sub: { color: C.muted, fontSize: 13, marginTop: 4 },
  periodRow: { flexDirection: "row", gap: 8, marginTop: 16, paddingBottom: 4 },
  periodChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  periodChipOn: { backgroundColor: "rgba(124,107,255,0.2)", borderColor: C.primary },
  periodText: { color: C.muted, fontSize: 12, fontWeight: "600" },
  periodTextOn: { color: C.primary },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16 },
  card: { marginHorizontal: 16, marginBottom: 14, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16 },
  cardTitle: { color: C.white, fontWeight: "700", fontSize: 16, marginBottom: 8 },
  highlight: { color: C.primary, fontWeight: "700", fontSize: 15 },
  fleetRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  fleetTitle: { color: C.white, fontWeight: "600", fontSize: 14 },
  fleetMeta: { color: C.muted, fontSize: 12, marginTop: 4 },
  heatRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  heatCell: { backgroundColor: C.surface, borderRadius: 10, padding: 10, minWidth: 52, alignItems: "center", borderWidth: 1, borderColor: C.border },
  heatDay: { color: C.muted, fontSize: 10 },
  heatVal: { color: C.white, fontWeight: "700", marginTop: 4 },
  upRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  upTitle: { color: C.white, fontWeight: "600" },
  insight: { backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  insightAlert: { borderColor: "rgba(239,68,68,0.4)" },
  insightWarn: { borderColor: "rgba(245,158,11,0.4)" },
  insightTitle: { color: C.white, fontWeight: "700", fontSize: 13, marginBottom: 6 },
  insightAction: { color: C.slate, fontSize: 12, lineHeight: 18 },
});
