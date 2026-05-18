import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";

function ymdFromUtcMs(ms) {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function utcFirstWeekday(year, month0) {
  return new Date(Date.UTC(year, month0, 1)).getUTCDay();
}

function expandBookingToYmds(b) {
  const a = new Date(b.startDate);
  const e = new Date(b.endDate);
  if (Number.isNaN(+a) || Number.isNaN(+e)) return [];
  let t = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const end = Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
  if (end < t) return [];
  const out = [];
  for (; t <= end; t += 86400000) out.push(ymdFromUtcMs(t));
  return out;
}

function bookingUtcRange(b) {
  const a = new Date(b.startDate);
  const e = new Date(b.endDate);
  if (Number.isNaN(+a) || Number.isNaN(+e)) return null;
  const start = ymdFromUtcMs(Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate()));
  const end = ymdFromUtcMs(Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()));
  if (end < start) return null;
  return { start, end };
}

function bookingOverlapsMonth(b, vy, vm) {
  const r = bookingUtcRange(b);
  if (!r) return false;
  const monthStart = ymdFromUtcMs(Date.UTC(vy, vm, 1));
  const monthEnd = ymdFromUtcMs(Date.UTC(vy, vm + 1, 0));
  return r.end >= monthStart && r.start <= monthEnd;
}

function statusColor(status) {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed") return "#34d399";
  if (s === "pending") return "#fbbf24";
  if (s === "completed") return "#818cf8";
  if (s === "rejected") return "#f87171";
  if (s === "cancelled") return "#64748b";
  return "#94a3b8";
}

function statusLabel(status, fr) {
  const s = String(status || "").toLowerCase();
  const map = {
    pending: fr ? "En attente" : "Pending",
    confirmed: fr ? "Confirmée" : "Confirmed",
    completed: fr ? "Terminée" : "Completed",
    rejected: fr ? "Refusée" : "Rejected",
    cancelled: fr ? "Annulée" : "Cancelled",
  };
  return map[s] || s;
}

function bookingTitle(b) {
  return b.rentalId?.title || `${b.rentalId?.brand || ""} ${b.rentalId?.model || ""}`.trim() || "—";
}

function buildCalendarWeeks(vy, vm) {
  const first = utcFirstWeekday(vy, vm);
  const startOffset = first === 0 ? 6 : first - 1;
  const daysInMonth = new Date(Date.UTC(vy, vm + 1, 0)).getUTCDate();
  const gridStartMs = Date.UTC(vy, vm, 1 - startOffset);
  const totalDays = startOffset + daysInMonth;
  const numWeeks = Math.ceil(totalDays / 7);
  const nCells = numWeeks * 7;

  const cells = [];
  for (let i = 0; i < nCells; i++) {
    const ms = gridStartMs + i * 86400000;
    const ymd = ymdFromUtcMs(ms);
    const ud = new Date(ms);
    const inMonth = ud.getUTCMonth() === vm && ud.getUTCFullYear() === vy;
    cells.push({ ymd, inMonth, day: ud.getUTCDate() });
  }

  const weeks = [];
  for (let w = 0; w < numWeeks; w++) weeks.push(cells.slice(w * 7, w * 7 + 7));
  return weeks;
}

function weekSegments(weekCells, bookings) {
  const weekYmds = weekCells.map((c) => c.ymd);
  const ws = weekYmds[0];
  const we = weekYmds[6];
  const segments = [];

  for (const b of bookings || []) {
    const r = bookingUtcRange(b);
    if (!r) continue;
    if (r.end < ws || r.start > we) continue;
    const segStart = r.start > ws ? r.start : ws;
    const segEnd = r.end < we ? r.end : we;
    const startCol = weekYmds.indexOf(segStart);
    const endCol = weekYmds.indexOf(segEnd);
    if (startCol === -1 || endCol === -1) continue;
    segments.push({
      booking: b,
      startCol,
      endCol,
      key: `${String(b._id)}-${ws}`,
    });
  }
  return segments;
}

function assignLanes(segments) {
  if (!segments.length) return 0;
  const sorted = [...segments].sort(
    (a, b) => a.startCol - b.startCol || b.endCol - b.startCol - (a.endCol - a.startCol)
  );
  const laneEnds = [];
  for (const seg of sorted) {
    let lane = 0;
    for (; lane < laneEnds.length; lane++) {
      if (laneEnds[lane] < seg.startCol) break;
    }
    if (lane === laneEnds.length) laneEnds.push(seg.endCol);
    else laneEnds[lane] = Math.max(laneEnds[lane], seg.endCol);
    seg.lane = lane;
  }
  return laneEnds.length;
}

const BAR_H = 20;
const BAR_GAP = 4;
const MAX_VISIBLE_LANES = 4;

function computeMonthStats(bookings, vy, vm, fr) {
  const monthStart = ymdFromUtcMs(Date.UTC(vy, vm, 1));
  const monthEnd = ymdFromUtcMs(Date.UTC(vy, vm + 1, 0));
  const bookedDays = new Set();
  let revenue = 0;
  let pending = 0;
  let confirmed = 0;
  let inMonthCount = 0;

  for (const b of bookings || []) {
    if (!bookingOverlapsMonth(b, vy, vm)) continue;
    inMonthCount += 1;
    const st = String(b.status || "").toLowerCase();
    if (st === "pending") pending += 1;
    if (st === "confirmed") confirmed += 1;
    if (st === "confirmed" || st === "completed") {
      revenue += Number(b.totalAmount) || 0;
    }
    for (const ymd of expandBookingToYmds(b)) {
      if (ymd >= monthStart && ymd <= monthEnd) bookedDays.add(ymd);
    }
  }

  return {
    bookedDays: bookedDays.size,
    revenue,
    pending,
    confirmed,
    inMonthCount,
    revenueLabel: `${Math.round(revenue).toLocaleString(fr ? "fr-FR" : "en-US")} MAD`,
  };
}

/**
 * @param {{ bookings: object[], fr: boolean, variant?: 'elite'|'default', onManageBooking?: (b: object) => void }} props
 */
export default function OwnerAnalyticsMiniCalendar({ bookings, fr, variant = "default", onManageBooking }) {
  const { colors: C, isDark } = useTheme();
  const elite = variant === "elite";
  const accent = isDark ? "#34d399" : "#059669";
  const titleColor = isDark ? "#f8fafc" : "#0f172a";
  const glassBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.08)";

  const s = useMemo(() => createStyles(C, isDark, elite), [C, isDark, elite]);

  const now = new Date();
  const [vy, setVy] = useState(now.getUTCFullYear());
  const [vm, setVm] = useState(now.getUTCMonth());
  const [selectedYmd, setSelectedYmd] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const todayYmd = useMemo(() => {
    const n = new Date();
    return ymdFromUtcMs(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()));
  }, []);

  const byDay = useMemo(() => {
    const map = new Map();
    for (const b of bookings || []) {
      for (const ymd of expandBookingToYmds(b)) {
        if (!map.has(ymd)) map.set(ymd, []);
        const arr = map.get(ymd);
        if (!arr.some((x) => String(x._id) === String(b._id))) arr.push(b);
      }
    }
    return map;
  }, [bookings]);

  const weeks = useMemo(() => buildCalendarWeeks(vy, vm), [vy, vm]);
  const monthStats = useMemo(() => computeMonthStats(bookings, vy, vm, fr), [bookings, vy, vm, fr]);

  const monthLabel = useMemo(() => {
    const d = new Date(Date.UTC(vy, vm, 1));
    return d.toLocaleDateString(fr ? "fr-FR" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" });
  }, [vy, vm, fr]);

  const dow = fr ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const detailBookings = useMemo(() => {
    if (selectedBookingId) {
      const b = (bookings || []).find((x) => String(x?._id) === selectedBookingId);
      return b ? [b] : [];
    }
    if (selectedYmd) return byDay.get(selectedYmd) || [];
    return [];
  }, [selectedBookingId, selectedYmd, bookings, byDay]);

  const goToday = () => {
    const n = new Date();
    setVy(n.getUTCFullYear());
    setVm(n.getUTCMonth());
    setSelectedYmd(todayYmd);
    setSelectedBookingId(null);
  };

  const onSelectDay = (ymd) => {
    setSelectedBookingId(null);
    setSelectedYmd((cur) => (cur === ymd ? null : ymd));
  };

  const onSelectBooking = (booking) => {
    const id = String(booking?._id ?? "");
    if (!id) return;
    setSelectedYmd(null);
    setSelectedBookingId((cur) => (cur === id ? null : id));
  };

  const prevMonth = () => {
    if (vm === 0) {
      setVm(11);
      setVy((y) => y - 1);
    } else setVm((m) => m - 1);
    setSelectedYmd(null);
    setSelectedBookingId(null);
  };

  const nextMonth = () => {
    if (vm === 11) {
      setVm(0);
      setVy((y) => y + 1);
    } else setVm((m) => m + 1);
    setSelectedYmd(null);
    setSelectedBookingId(null);
  };

  const barColors = elite
    ? [accent, "#a78bfa", "#38bdf8"]
    : [C.primary, "#22d3ee"];

  return (
    <View style={s.wrap}>
      <LinearGradient colors={barColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.bar} />

      {elite ? (
        <View style={s.monthKpiRow}>
          <MonthKpi
            label={fr ? "Jours loués" : "Booked days"}
            value={String(monthStats.bookedDays)}
            icon="calendar-outline"
            color={accent}
            isDark={isDark}
          />
          <MonthKpi
            label={fr ? "Réservations" : "Bookings"}
            value={String(monthStats.inMonthCount)}
            icon="layers-outline"
            color={isDark ? "#a78bfa" : "#6248e8"}
            isDark={isDark}
          />
          <MonthKpi
            label={fr ? "Revenus" : "Revenue"}
            value={monthStats.revenueLabel}
            icon="cash-outline"
            color={isDark ? "#38bdf8" : "#0284c7"}
            isDark={isDark}
            compact
          />
        </View>
      ) : null}

      <View style={s.head}>
        <TouchableOpacity onPress={prevMonth} style={s.navBtn} accessibilityLabel={fr ? "Mois précédent" : "Previous month"}>
          <Ionicons name="chevron-back" size={22} color={elite ? accent : C.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 8 }}>
          <Text style={[s.monthLabel, { color: titleColor }]} numberOfLines={1}>
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          </Text>
          {elite ? (
            <Text style={[s.monthSub, { color: isDark ? "#64748b" : "#94a3b8" }]}>
              {monthStats.pending > 0
                ? `${monthStats.pending} ${fr ? "en attente" : "pending"} · ${monthStats.confirmed} ${fr ? "confirmées" : "confirmed"}`
                : `${monthStats.confirmed} ${fr ? "confirmées ce mois" : "confirmed this month"}`}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={nextMonth} style={s.navBtn} accessibilityLabel={fr ? "Mois suivant" : "Next month"}>
          <Ionicons name="chevron-forward" size={22} color={elite ? accent : C.primary} />
        </TouchableOpacity>
      </View>

      {elite ? (
        <TouchableOpacity onPress={goToday} activeOpacity={0.88} style={[s.todayBtn, { borderColor: `${accent}45` }]}>
          <Ionicons name="today-outline" size={16} color={accent} />
          <Text style={{ color: accent, fontWeight: "800", fontSize: 12 }}>
            {fr ? "Aujourd'hui" : "Today"}
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={s.dowRow}>
        {dow.map((w) => (
          <View key={w} style={s.dowCell}>
            <Text style={[s.dowText, elite && { color: isDark ? "#64748b" : "#94a3b8" }]}>{w}</Text>
          </View>
        ))}
      </View>

      {weeks.map((weekCells, wi) => {
        const segments = weekSegments(weekCells, bookings);
        const laneCount = assignLanes(segments);
        const visibleLanes = laneCount === 0 ? 0 : Math.min(laneCount, MAX_VISIBLE_LANES);
        const hiddenInWeek = segments.filter((seg) => seg.lane >= MAX_VISIBLE_LANES).length;
        const areaH = visibleLanes === 0 ? 0 : visibleLanes * (BAR_H + BAR_GAP) + BAR_GAP;

        return (
          <View key={`w-${wi}`} style={s.weekBlock}>
            <View style={s.dayRow}>
              {weekCells.map((cell) => {
                const isToday = cell.ymd === todayYmd;
                const isSel = selectedYmd === cell.ymd;
                const dayBookings = byDay.get(cell.ymd) || [];
                const hasBookings = dayBookings.length > 0;
                const statuses = [...new Set(dayBookings.map((b) => String(b.status || "").toLowerCase()))].slice(0, 3);

                return (
                  <View key={cell.ymd} style={s.dayCell}>
                    <Pressable
                      onPress={() => onSelectDay(cell.ymd)}
                      style={({ pressed }) => [
                        s.dayBtn,
                        isToday && !isSel && [s.dayToday, { borderColor: accent }],
                        isSel && [s.daySel, { backgroundColor: `${accent}28`, borderColor: accent }],
                        pressed && { opacity: 0.88 },
                        !cell.inMonth && { opacity: 0.45 },
                      ]}
                    >
                      <Text
                        style={[
                          s.dayNum,
                          { color: titleColor },
                          !cell.inMonth && s.dayNumMuted,
                          isToday && { color: accent, fontWeight: "900" },
                        ]}
                      >
                        {cell.day}
                      </Text>
                      {hasBookings ? (
                        <View style={s.dotRow}>
                          {statuses.map((st) => (
                            <View key={st} style={[s.statusDot, { backgroundColor: statusColor(st) }]} />
                          ))}
                          {dayBookings.length > 1 ? (
                            <Text style={[s.dotMore, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                              {dayBookings.length}
                            </Text>
                          ) : null}
                        </View>
                      ) : (
                        <View style={s.dotRow} />
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </View>

            {areaH > 0 ? (
              <View style={[s.laneArea, { height: areaH }]}>
                {segments
                  .filter((seg) => seg.lane < MAX_VISIBLE_LANES)
                  .map((seg) => {
                    const col = statusColor(seg.booking.status);
                    const span = seg.endCol - seg.startCol + 1;
                    const leftPct = (seg.startCol / 7) * 100;
                    const widthPct = (span / 7) * 100;
                    const title = bookingTitle(seg.booking);
                    const bid = String(seg.booking._id ?? "");
                    const barSel = selectedBookingId === bid;
                    const amount = Number(seg.booking.totalAmount) || 0;
                    return (
                      <TouchableOpacity
                        key={seg.key}
                        activeOpacity={0.88}
                        onPress={() => onSelectBooking(seg.booking)}
                        accessibilityLabel={title}
                        style={[
                          s.eventBar,
                          barSel && s.eventBarSelected,
                          {
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                            top: seg.lane * (BAR_H + BAR_GAP) + BAR_GAP,
                            height: BAR_H,
                            backgroundColor: col + (elite ? "35" : "2a"),
                            borderColor: barSel ? col : col + "99",
                          },
                        ]}
                      >
                        <Text style={[s.eventBarText, { color: "#fff" }]} numberOfLines={1}>
                          {elite && amount > 0
                            ? `${title} · ${amount.toLocaleString(fr ? "fr-FR" : "en-US")}`
                            : title}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            ) : null}

            {hiddenInWeek > 0 ? (
              <Text style={[s.moreLine, { color: C.muted }]}>
                {fr ? `+${hiddenInWeek} autre(s) cette semaine` : `+${hiddenInWeek} more this week`}
              </Text>
            ) : null}
          </View>
        );
      })}

      <View style={[s.legend, elite && s.legendElite]}>
        {[
          ["pending", fr ? "Attente" : "Pending", "#fbbf24"],
          ["confirmed", fr ? "Confirmé" : "Confirmed", "#34d399"],
          ["completed", fr ? "Terminé" : "Done", "#818cf8"],
          ["rejected", fr ? "Refusé" : "Rejected", "#f87171"],
          ["cancelled", fr ? "Annulé" : "Cancelled", "#64748b"],
        ].map(([k, lab, col]) => (
          <View key={k} style={s.legItem}>
            <View style={[s.dot, { backgroundColor: col }]} />
            <Text style={s.legTxt}>{lab}</Text>
          </View>
        ))}
      </View>

      <View style={[s.detail, elite && s.detailElite]}>
        <View style={s.detailHead}>
          <Ionicons
            name={selectedBookingId ? "document-text-outline" : "list-outline"}
            size={18}
            color={elite ? accent : C.primary}
          />
          <Text style={[s.detailTitle, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            {selectedBookingId
              ? fr
                ? "Détail réservation"
                : "Booking detail"
              : selectedYmd
                ? `${fr ? "Journée" : "Day"} · ${selectedYmd}`
                : fr
                  ? "Sélectionnez un jour ou une barre"
                  : "Select a day or booking bar"}
          </Text>
        </View>

        {detailBookings.length === 0 ? (
          <Text style={s.emptyHint}>
            {selectedBookingId || selectedYmd
              ? fr
                ? "Aucune réservation à afficher."
                : "No bookings to show."
              : fr
                ? "Les barres colorées sont la durée de chaque location. Touchez pour le détail."
                : "Colored bars show rental duration. Tap for details."}
          </Text>
        ) : (
          <ScrollView style={{ maxHeight: elite ? 320 : 220 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {detailBookings.map((b) => {
              const st = String(b.status || "");
              const col = statusColor(st);
              const title = bookingTitle(b);
              const sd = new Date(b.startDate).toLocaleDateString(fr ? "fr-FR" : "en-GB", {
                day: "numeric",
                month: "short",
              });
              const ed = new Date(b.endDate).toLocaleDateString(fr ? "fr-FR" : "en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const customer = b.customerId?.name || b.customer?.name || (fr ? "Client" : "Guest");
              const amount = Number(b.totalAmount) || 0;
              const city = b.rentalId?.city || "";

              return (
                <View key={String(b._id)} style={[s.detailCard, { borderColor: `${col}44` }]}>
                  <LinearGradient
                    colors={[`${col}22`, `${col}06`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={s.detailCardInner}>
                    <Text style={[s.rowTitle, { color: titleColor }]} numberOfLines={2}>
                      {title}
                    </Text>
                    {city ? (
                      <View style={s.metaRow}>
                        <Ionicons name="location-outline" size={13} color={C.muted} />
                        <Text style={[s.rowMeta, { color: C.muted }]}>{city}</Text>
                      </View>
                    ) : null}
                    <View style={s.metaRow}>
                      <Ionicons name="person-outline" size={13} color={C.muted} />
                      <Text style={[s.rowMeta, { color: C.muted }]}>{customer}</Text>
                    </View>
                    <View style={s.metaRow}>
                      <Ionicons name="calendar-outline" size={13} color={C.muted} />
                      <Text style={[s.rowMeta, { color: C.muted }]}>
                        {sd} → {ed}
                      </Text>
                    </View>
                    <View style={s.detailFooter}>
                      <View style={[s.pill, { borderColor: col + "66", backgroundColor: col + "18" }]}>
                        <Text style={[s.pillTxt, { color: col }]}>{statusLabel(st, fr)}</Text>
                      </View>
                      <Text style={[s.amountTxt, { color: accent }]}>
                        {amount.toLocaleString(fr ? "fr-FR" : "en-US")} MAD
                      </Text>
                    </View>
                    {b.isPaid ? (
                      <View style={[s.paidBadge, { backgroundColor: `${accent}18`, borderColor: `${accent}40` }]}>
                        <Ionicons name="checkmark-circle" size={14} color={accent} />
                        <Text style={{ color: accent, fontSize: 11, fontWeight: "700" }}>
                          {fr ? "Payé" : "Paid"}
                        </Text>
                      </View>
                    ) : st === "confirmed" ? (
                      <View style={[s.paidBadge, { backgroundColor: "rgba(251,191,36,0.12)", borderColor: "rgba(251,191,36,0.35)" }]}>
                        <Ionicons name="time-outline" size={14} color="#fbbf24" />
                        <Text style={{ color: "#fbbf24", fontSize: 11, fontWeight: "700" }}>
                          {fr ? "Paiement en attente" : "Payment pending"}
                        </Text>
                      </View>
                    ) : null}
                    {onManageBooking ? (
                      <TouchableOpacity
                        onPress={() => onManageBooking(b)}
                        activeOpacity={0.88}
                        style={s.manageBtn}
                      >
                        <LinearGradient
                          colors={isDark ? ["#34d399", "#10b981"] : ["#059669", "#047857"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={s.manageBtnInner}
                        >
                          <Text style={s.manageBtnText}>{fr ? "Gérer la réservation" : "Manage booking"}</Text>
                          <Ionicons name="arrow-forward" size={16} color="#fff" />
                        </LinearGradient>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function MonthKpi({ label, value, icon, color, isDark, compact }) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: `${color}35`,
        backgroundColor: isDark ? `${color}12` : `${color}08`,
        paddingVertical: compact ? 10 : 12,
        paddingHorizontal: 8,
        alignItems: "center",
        gap: 4,
      }}
    >
      <Ionicons name={icon} size={15} color={color} />
      <Text
        style={{ color: isDark ? "#f8fafc" : "#0f172a", fontWeight: "900", fontSize: compact ? 11 : 14, letterSpacing: -0.3 }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={{ color: isDark ? "#64748b" : "#94a3b8", fontSize: 8, fontWeight: "700", textTransform: "uppercase", textAlign: "center" }}>
        {label}
      </Text>
    </View>
  );
}

function createStyles(C, isDark, elite) {
  return StyleSheet.create({
    wrap: {
      borderRadius: elite ? 24 : 16,
      borderWidth: 1,
      borderColor: elite ? (isDark ? "rgba(255,255,255,0.1)" : "rgba(15,23,42,0.08)") : C.border,
      overflow: "hidden",
      backgroundColor: elite ? (isDark ? "rgba(255,255,255,0.03)" : "#fff") : C.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: elite ? 14 : 4 },
      shadowOpacity: elite ? 0.14 : 0.06,
      shadowRadius: elite ? 22 : 8,
      elevation: elite ? 8 : 3,
    },
    bar: { height: elite ? 3 : 2, width: "100%" },
    monthKpiRow: {
      flexDirection: "row",
      gap: 8,
      paddingHorizontal: 12,
      paddingTop: 14,
      paddingBottom: 4,
    },
    head: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      paddingVertical: elite ? 10 : 8,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    monthLabel: { fontWeight: "800", fontSize: elite ? 17 : 14, letterSpacing: -0.3 },
    monthSub: { fontSize: 11, fontWeight: "600", marginTop: 3, textAlign: "center" },
    navBtn: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.04)",
    },
    todayBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginHorizontal: 12,
      marginTop: 10,
      marginBottom: 4,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: isDark ? "rgba(52,211,153,0.08)" : "rgba(5,150,105,0.06)",
    },
    dowRow: { flexDirection: "row", paddingHorizontal: 4, paddingTop: 10, paddingBottom: 4 },
    dowCell: { flex: 1, alignItems: "center" },
    dowText: { color: C.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
    weekBlock: {
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
      paddingBottom: 8,
    },
    dayRow: { flexDirection: "row", paddingHorizontal: 2, paddingTop: 4 },
    dayCell: { flex: 1, alignItems: "center", minWidth: 0 },
    dayBtn: {
      width: "100%",
      maxWidth: 50,
      alignSelf: "center",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 2,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "transparent",
      minHeight: 52,
    },
    dayNum: { fontSize: 13, fontWeight: "700" },
    dayNumMuted: { opacity: 0.4 },
    dayToday: { borderWidth: 1.5 },
    daySel: { borderWidth: 1.5 },
    dotRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      marginTop: 5,
      minHeight: 8,
    },
    statusDot: { width: 5, height: 5, borderRadius: 3 },
    dotMore: { fontSize: 8, fontWeight: "800", marginLeft: 2 },
    laneArea: {
      position: "relative",
      marginTop: 4,
      marginHorizontal: 3,
    },
    eventBar: {
      position: "absolute",
      borderRadius: 6,
      paddingHorizontal: 5,
      justifyContent: "center",
      borderWidth: 1,
      overflow: "hidden",
    },
    eventBarSelected: {
      borderWidth: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    eventBarText: { fontSize: 9, fontWeight: "800", letterSpacing: -0.2 },
    moreLine: { textAlign: "center", fontSize: 9, fontWeight: "700", marginTop: 4, paddingHorizontal: 4 },
    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      justifyContent: "center",
    },
    legendElite: {
      borderTopWidth: 1,
      borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
    },
    legItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    legTxt: { color: C.muted, fontSize: 10, fontWeight: "600" },
    dot: { width: 7, height: 7, borderRadius: 4 },
    detail: {
      borderTopWidth: 1,
      borderTopColor: C.border,
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 16,
      backgroundColor: C.card,
    },
    detailElite: {
      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(248,250,252,0.9)",
    },
    detailHead: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
    detailTitle: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      flex: 1,
    },
    detailCard: {
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 12,
      overflow: "hidden",
    },
    detailCardInner: { padding: 14 },
    rowTitle: { fontWeight: "800", fontSize: 16, letterSpacing: -0.3 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
    rowMeta: { fontSize: 12, fontWeight: "600", flex: 1 },
    detailFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 14,
    },
    pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
    pillTxt: { fontSize: 11, fontWeight: "800" },
    amountTxt: { fontSize: 17, fontWeight: "900", letterSpacing: -0.4 },
    paidBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      alignSelf: "flex-start",
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
    },
    manageBtn: { marginTop: 14, borderRadius: 12, overflow: "hidden" },
    manageBtnInner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 13,
    },
    manageBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
    emptyHint: { color: C.muted, fontSize: 13, textAlign: "center", lineHeight: 20, paddingVertical: 8 },
  });
}
