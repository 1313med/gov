import { buildTrackItems } from "./garageStatus";
import { pickLang, dateLocaleTag, formatNumber } from "./i18n";
import { arOverrides } from "../locales/arOverrides";

const p = (lang, en, fr, ar) => pickLang(lang, en, fr, ar, arOverrides);

const MS_DAY = 86400000;

function toDateOnly(d) {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  return x;
}

/** Events in the next `windowDays` for timeline UI. */
export function buildGarageTimeline(car, statuses, lang, windowDays = 30) {
  if (!car || !statuses) return { buckets: [], flat: [] };

  const now = toDateOnly(new Date());
  const end = new Date(now.getTime() + windowDays * MS_DAY);
  const items = buildTrackItems(car, statuses, lang);
  const events = [];

  for (const item of items) {
    let dueDate = null;
    let subtitle = "";

    if (item.type === "days" && item.expiry) {
      dueDate = toDateOnly(item.expiry);
      subtitle = formatShortDate(item.expiry, lang);
    } else if (item.type === "km" && item.value != null) {
      const km = item.value;
      if (km <= windowDays * 50) {
        dueDate = toDateOnly(new Date(now.getTime() + Math.min(windowDays, Math.max(1, Math.ceil(km / 50))) * MS_DAY));
        subtitle = p(
          lang,
          `~${formatNumber(km, lang)} km left`,
          `~${formatNumber(km, lang)} km restants`,
          `~${formatNumber(km, lang)} كم متبقية`
        );
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
    { key: "today", label: p(lang, "Today", "Aujourd'hui", "Lyoum"), emoji: "🔥", events: [] },
    { key: "week", label: p(lang, "This week", "Cette semaine", "Had simana"), emoji: "📅", events: [] },
    { key: "month", label: p(lang, "This month", "Ce mois-ci", "Had chhar"), emoji: "🗓️", events: [] },
    { key: "later", label: p(lang, "Later", "Plus tard", "Mn ba3d"), emoji: "✨", events: [] },
  ];

  for (const ev of events) {
    if (ev.daysUntil <= 0) buckets[0].events.push(ev);
    else if (ev.daysUntil <= 7) buckets[1].events.push(ev);
    else if (ev.daysUntil <= 30) buckets[2].events.push(ev);
    else buckets[3].events.push(ev);
  }

  return { buckets: buckets.filter((b) => b.events.length > 0), flat: events };
}

function formatShortDate(dateStr, lang) {
  return new Date(dateStr).toLocaleDateString(dateLocaleTag(lang), {
    day: "numeric",
    month: "short",
  });
}
