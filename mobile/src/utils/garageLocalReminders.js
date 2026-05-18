import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { buildTrackItems, computeStatuses } from "./garageStatus";

const CHANNEL_ID = "garage";
const PREFIX = "goovoiture-garage-";

export async function ensureGarageNotificationChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Mon Garage",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 200, 120, 200],
  }).catch(() => {});
}

export async function cancelGarageLocalReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync().catch(() => []);
  for (const n of scheduled) {
    const id = n.identifier;
    if (id?.startsWith?.(PREFIX)) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    }
  }
}

/**
 * Schedule friendly local reminders (7 days & 1 day before) for papers/mechanical deadlines.
 */
export async function syncGarageLocalReminders(car, fr, enabled = true) {
  await cancelGarageLocalReminders();
  if (!enabled || !car) return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const req = await Notifications.requestPermissionsAsync();
    if (req.status !== "granted") return;
  }

  await ensureGarageNotificationChannel();

  const statuses = computeStatuses(car);
  const items = buildTrackItems(car, statuses, fr);
  const now = Date.now();

  for (const item of items) {
    if (item.type !== "days" || !item.expiry || item.value == null) continue;
    if (item.value > 30 || item.value < 0) continue;

    const expiry = new Date(item.expiry).getTime();
    for (const daysBefore of [7, 1]) {
      const triggerDate = new Date(expiry - daysBefore * 86400000);
      triggerDate.setHours(9, 30, 0, 0);
      if (triggerDate.getTime() <= now) continue;

      const title = fr ? "Mon Garage Goovoiture" : "Goovoiture My Garage";
      const body =
        daysBefore === 1
          ? fr
            ? `Demain : ${item.label} — pensez-y !`
            : `Tomorrow: ${item.label} — don't forget!`
          : fr
            ? `Dans ${daysBefore} jours : ${item.label}`
            : `In ${daysBefore} days: ${item.label}`;

      await Notifications.scheduleNotificationAsync({
        identifier: `${PREFIX}${item.id}-${daysBefore}`,
        content: {
          title,
          body,
          sound: "default",
          data: { screen: "garage", trackId: item.id },
          ...(Platform.OS === "android" ? { android: { channelId: CHANNEL_ID } } : {}),
        },
        trigger: triggerDate,
      }).catch(() => {});
    }
  }

  if (car.vidange?.lastKm && car.currentMileage != null) {
    const kmLeft = car.vidange.lastKm + (car.vidange.intervalKm || 10000) - car.currentMileage;
    if (kmLeft > 0 && kmLeft <= 1500) {
      await Notifications.scheduleNotificationAsync({
        identifier: `${PREFIX}vidange-km`,
        content: {
          title: fr ? "Vidange bientôt" : "Oil change soon",
          body: fr
            ? `Plus que ${kmLeft.toLocaleString()} km avant la vidange — ${car.brand} ${car.model}`
            : `${kmLeft.toLocaleString()} km until oil change — ${car.brand} ${car.model}`,
          sound: "default",
          data: { screen: "garage", trackId: "vidange" },
          ...(Platform.OS === "android" ? { android: { channelId: CHANNEL_ID } } : {}),
        },
        trigger: { seconds: 86400 },
      }).catch(() => {});
    }
  }
}
