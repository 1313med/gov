import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
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

function statusColor(status) {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed") return "#34d399";
  if (s === "pending") return "#fbbf24";
  if (s === "completed") return "#818cf8";
  if (s === "rejected") return "#f87171";
  if (s === "cancelled") return "#64748b";
  return "#94a3b8";
}

function bookingTitle(b) {
  return b.rentalId?.title || `${b.rentalId?.brand || ""} ${b.rentalId?.model || ""}`.trim() || "—";
}

/** Build Monday-first weeks covering the month (cells include prev/next month days). */
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

/** Segments of bookings visible in one week row (inclusive column indices 0–6). */
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

/**
 * Greedy lane assignment for overlapping [startCol,endCol] segments (inclusive).
 * Mutates segments with `.lane` (0-based). Returns lane count.
 */
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

const BAR_H = 17;
const BAR_GAP = 3;
const MAX_VISIBLE_LANES = 5;

function createStyles(C) {
  return StyleSheet.create({
    wrap: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: C.border,
      overflow: "hidden",
      backgroundColor: C.surface,
    },
    bar: { height: 2, width: "100%" },
    head: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 8,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      backgroundColor: C.card,
    },
    monthLabel: { color: C.white, fontWeight: "800", fontSize: 14 },
    navBtn: { padding: 6, borderRadius: 10, backgroundColor: C.surface },
    dowRow: { flexDirection: "row", paddingHorizontal: 2, paddingTop: 6, paddingBottom: 2 },
    dowCell: { flex: 1, alignItems: "center" },
    dowText: { color: C.muted, fontSize: 9, fontWeight: "700" },
    weekBlock: {
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      paddingBottom: 6,
    },
    dayRow: { flexDirection: "row", paddingHorizontal: 2, paddingTop: 4 },
    dayCell: { flex: 1, alignItems: "center", minWidth: 0 },
    dayBtn: {
      width: "100%",
      maxWidth: 48,
      alignSelf: "center",
      alignItems: "center",
      paddingVertical: 6,
      borderRadius: 10,
    },
    dayNum: { color: C.white, fontSize: 12, fontWeight: "700" },
    dayNumMuted: { color: C.muted, opacity: 0.55 },
    dayToday: { borderWidth: 1.5, borderColor: C.primary },
    daySel: { backgroundColor: "rgba(124,107,255,0.22)" },
    laneArea: {
      position: "relative",
      marginTop: 2,
      marginHorizontal: 2,
    },
    eventBar: {
      position: "absolute",
      borderRadius: 5,
      paddingHorizontal: 4,
      justifyContent: "center",
      borderWidth: 1,
      overflow: "hidden",
    },
    eventBarSelected: {
      borderWidth: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.25,
      shadowRadius: 2,
      elevation: 3,
    },
    eventBarText: { fontSize: 9, fontWeight: "800", letterSpacing: -0.2 },
    moreLine: { textAlign: "center", fontSize: 9, fontWeight: "700", marginTop: 2, paddingHorizontal: 4 },
    legend: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 10, paddingVertical: 8, justifyContent: "center" },
    legItem: { flexDirection: "row", alignItems: "center", gap: 4 },
    legTxt: { color: C.muted, fontSize: 9, fontWeight: "600" },
    dot: { width: 6, height: 6, borderRadius: 3 },
    detail: {
      borderTopWidth: 1,
      borderTopColor: C.border,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
      backgroundColor: C.card,
    },
    detailTitle: { color: C.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 },
    row: {
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.border,
      marginBottom: 8,
    },
    rowTitle: { color: C.white, fontWeight: "700", fontSize: 13 },
    rowMeta: { color: C.muted, fontSize: 11, marginTop: 4 },
    pill: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    pillTxt: { fontSize: 10, fontWeight: "800", textTransform: "capitalize" },
    emptyHint: { color: C.muted, fontSize: 12, textAlign: "center", paddingVertical: 8 },
  });
}

/**
 * Month grid with multi-day booking bars (web-style duration within the grid).
 * @param {{ bookings: object[], fr: boolean }} props
 */
export default function OwnerAnalyticsMiniCalendar({ bookings, fr }) {
  const { colors: C } = useTheme();
  const s = useMemo(() => createStyles(C), [C]);
  const now = new Date();
  const [vy, setVy] = useState(now.getUTCFullYear());
  const [vm, setVm] = useState(now.getUTCMonth());
  const [selectedYmd, setSelectedYmd] = useState(null);
  /** When set, detail panel shows this booking only (bar tap). Day tap clears this. */
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

  return (
    <View style={s.wrap}>
      <LinearGradient colors={[C.primary, "#22d3ee"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.bar} />
      <View style={s.head}>
        <TouchableOpacity onPress={prevMonth} style={s.navBtn} accessibilityLabel={fr ? "Mois précédent" : "Previous month"}>
          <Ionicons name="chevron-back" size={20} color={C.primary} />
        </TouchableOpacity>
        <Text style={s.monthLabel}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>
        <TouchableOpacity onPress={nextMonth} style={s.navBtn} accessibilityLabel={fr ? "Mois suivant" : "Next month"}>
          <Ionicons name="chevron-forward" size={20} color={C.primary} />
        </TouchableOpacity>
      </View>
      <View style={s.dowRow}>
        {dow.map((w) => (
          <View key={w} style={s.dowCell}>
            <Text style={s.dowText}>{w}</Text>
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
                const isFuture = cell.ymd > todayYmd;
                const hasBookings = (byDay.get(cell.ymd) || []).length > 0;
                return (
                  <View key={cell.ymd} style={s.dayCell}>
                    <TouchableOpacity
                      onPress={() => onSelectDay(cell.ymd)}
                      activeOpacity={0.85}
                      style={[
                        s.dayBtn,
                        isToday && !isSel && s.dayToday,
                        isSel && s.daySel,
                      ]}
                    >
                      <Text
                        style={[
                          s.dayNum,
                          !cell.inMonth && s.dayNumMuted,
                          isFuture && cell.inMonth && !hasBookings && s.dayNumMuted,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </TouchableOpacity>
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
                            backgroundColor: col + "2a",
                            borderColor: barSel ? col : col + "88",
                          },
                        ]}
                      >
                        <Text style={[s.eventBarText, { color: C.white }]} numberOfLines={1}>
                          {title}
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

      <View style={s.legend}>
        {[
          ["pending", fr ? "Attente" : "Pending", "#fbbf24"],
          ["confirmed", fr ? "Confirmé" : "Confirmed", "#34d399"],
          ["completed", fr ? "Terminé" : "Done", "#818cf8"],
          ["rejected", fr ? "Refusé" : "Rejected", "#f87171"],
        ].map(([k, lab, col]) => (
          <View key={k} style={s.legItem}>
            <View style={[s.dot, { backgroundColor: col }]} />
            <Text style={s.legTxt}>{lab}</Text>
          </View>
        ))}
      </View>

      {selectedYmd || selectedBookingId ? (
        <View style={s.detail}>
          <Text style={s.detailTitle}>
            {selectedBookingId
              ? fr
                ? "Détail de la réservation"
                : "Booking detail"
              : `${fr ? "Réservations le" : "Bookings on"} ${selectedYmd}`}
          </Text>
          {detailBookings.length === 0 ? (
            <Text style={s.emptyHint}>
              {selectedBookingId
                ? fr
                  ? "Réservation introuvable."
                  : "Booking not found."
                : fr
                  ? "Aucune réservation ce jour."
                  : "No booking on this day."}
            </Text>
          ) : (
            <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
              {detailBookings.map((b) => {
                const st = String(b.status || "");
                const col = statusColor(st);
                const title = bookingTitle(b);
                const sd = new Date(b.startDate).toLocaleDateString(fr ? "fr-FR" : "en-GB");
                const ed = new Date(b.endDate).toLocaleDateString(fr ? "fr-FR" : "en-GB");
                return (
                  <View key={String(b._id)} style={s.row}>
                    <Text style={s.rowTitle} numberOfLines={2}>
                      {title}
                    </Text>
                    <Text style={s.rowMeta}>
                      {sd} → {ed}
                    </Text>
                    <View style={[s.pill, { borderColor: col + "66", backgroundColor: col + "18" }]}>
                      <Text style={[s.pillTxt, { color: col }]}>{st}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      ) : (
        <Text style={[s.emptyHint, { paddingBottom: 12 }]}>
          {fr
            ? "Touchez un jour pour la liste, ou une réservation pour son détail."
            : "Tap a day for all bookings that day, or a bar for that booking only."}
        </Text>
      )}
    </View>
  );
}
