import { buildTrackItems } from "./garageStatus";

const MS_DAY = 86400000;

function toDateOnly(d) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

/** Events in the next `windowDays` for timeline UI. */
export function buildGarageTimeline(car, statuses, fr, windowDays = 30) {
  if (!car || !statuses) return { buckets: [], flat: [] };

  const now = toDateOnly(new Date());
  const end = new Date(now.getTime() + windowDays * MS_DAY);
  const items = buildTrackItems(car, statuses, fr);
  const events = [];

  for (const item of items) {
    let dueDate = null;
    let subtitle = "";

    if (item.type === "days" && item.expiry) {
      dueDate = toDateOnly(item.expiry);
      subtitle = formatShortDate(item.expiry, fr);
    } else if (item.type === "km" && item.value != null) {
      const km = item.value;
      if (km <= windowDays * 50) {
        dueDate = toDateOnly(new Date(now.getTime() + Math.min(windowDays, Math.max(1, Math.ceil(km / 50))) * MS_DAY));
        subtitle = fr ? `~${km.toLocaleString()} km restants` : `~${km.toLocaleString()} km left`;
      }
    }

    if (!dueDate || dueDate > end) continue;
    if (dueDate < now && item.tier !== "critical") continue;

    const daysUntil = Math.ceil((dueDate - now) / MS_DAY);
    events.push({
      id: item.id,
      label: item.label,
      icon: item.icon,
      color: item.color,
      tier: item.tier,
      daysUntil,
      dueDate: dueDate.toISOString(),
      subtitle,
      category: item.category,
      trackId: item.id,
    });
  }

  events.sort((a, b) => a.daysUntil - b.daysUntil);

  const buckets = [
    { key: "today", label: fr ? "Aujourd'hui" : "Today", emoji: "🔥", events: [] },
    { key: "week", label: fr ? "Cette semaine" : "This week", emoji: "📅", events: [] },
    { key: "month", label: fr ? "Ce mois-ci" : "This month", emoji: "🗓️", events: [] },
    { key: "later", label: fr ? "Plus tard" : "Later", emoji: "✨", events: [] },
  ];

  for (const ev of events) {
    if (ev.daysUntil <= 0) buckets[0].events.push(ev);
    else if (ev.daysUntil <= 7) buckets[1].events.push(ev);
    else if (ev.daysUntil <= 30) buckets[2].events.push(ev);
    else buckets[3].events.push(ev);
  }

  return { buckets: buckets.filter((b) => b.events.length > 0), flat: events };
}

function formatShortDate(dateStr, fr) {
  return new Date(dateStr).toLocaleDateString(fr ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "short",
  });
}
