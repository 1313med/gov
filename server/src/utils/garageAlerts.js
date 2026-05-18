/** Shared Mon Garage alert rules (cron + API). */

const ALERT_WINDOW_DAYS = 30;
const RESEND_AFTER_DAYS = 7;
const VIDANGE_KM_ALERT = 1500;

const MECHANICAL_INTERVALS_YEARS = {
  pneus: 2,
  batterie: 3,
  freins: 2,
  chainDistribution: 5,
};

function daysLeft(date) {
  if (!date) return null;
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

function mechanicalExpiryDate(car, key) {
  const block = car[key];
  if (!block?.lastChangeDate) return null;
  const years = MECHANICAL_INTERVALS_YEARS[key];
  if (!years) return null;
  const d = new Date(block.lastChangeDate);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function vidangeKmLeft(car) {
  if (!car.vidange?.lastKm || !car.vidange?.intervalKm || car.currentMileage == null) return null;
  return car.vidange.lastKm + car.vidange.intervalKm - car.currentMileage;
}

function shouldAlert(expiryDate, alertSentAt) {
  const d = daysLeft(expiryDate);
  if (d === null) return false;
  if (d > ALERT_WINDOW_DAYS) return false;
  if (!alertSentAt) return true;
  const daysSince = Math.floor((new Date() - new Date(alertSentAt)) / (1000 * 60 * 60 * 24));
  return daysSince >= RESEND_AFTER_DAYS;
}

function shouldAlertVidange(car) {
  const kmLeft = vidangeKmLeft(car);
  if (kmLeft === null) return false;
  if (kmLeft > VIDANGE_KM_ALERT) return false;
  const alertSentAt = car.vidange?.alertSentAt;
  if (!alertSentAt) return true;
  const daysSince = Math.floor((new Date() - new Date(alertSentAt)) / (1000 * 60 * 60 * 24));
  return daysSince >= RESEND_AFTER_DAYS;
}

/** Build pending alerts for a car (does not mutate DB). */
function collectGarageAlerts(car) {
  const carName = `${car.brand || ""} ${car.model || ""} ${car.year || ""}`.trim();
  const alerts = [];

  const papers = [
    { key: "assurance", label: "Assurance", expiry: car.assurance?.expiryDate, sent: car.assurance?.alertSentAt },
    { key: "visiteTechnique", label: "Visite technique", expiry: car.visiteTechnique?.expiryDate, sent: car.visiteTechnique?.alertSentAt },
    { key: "vignette", label: "Vignette", expiry: car.vignette?.expiryDate, sent: car.vignette?.alertSentAt },
    { key: "permis", label: "Permis de conduire", expiry: car.permis?.expiryDate, sent: car.permis?.alertSentAt },
  ];

  for (const item of papers) {
    if (shouldAlert(item.expiry, item.sent)) {
      const d = daysLeft(item.expiry);
      alerts.push({
        key: item.key,
        category: "papers",
        label: item.label,
        daysLeft: d,
        kmLeft: null,
        expiryDate: item.expiry,
        carName,
        message: d <= 0
          ? `${item.label} expiré(e) — ${carName}`
          : `${item.label} dans ${d} jour(s) — ${carName}`,
      });
    }
  }

  const mechanical = [
    { key: "pneus", label: "Pneus" },
    { key: "batterie", label: "Batterie" },
    { key: "freins", label: "Freins" },
    { key: "chainDistribution", label: "Chaîne de distribution" },
  ];

  for (const item of mechanical) {
    const expiry = mechanicalExpiryDate(car, item.key);
    const sent = car[item.key]?.alertSentAt;
    if (shouldAlert(expiry, sent)) {
      const d = daysLeft(expiry);
      alerts.push({
        key: item.key,
        category: "mechanical",
        label: item.label,
        daysLeft: d,
        kmLeft: null,
        expiryDate: expiry,
        carName,
        message: d <= 0
          ? `${item.label} à prévoir — ${carName}`
          : `${item.label} dans ${d} jour(s) — ${carName}`,
      });
    }
  }

  if (shouldAlertVidange(car)) {
    const kmLeft = vidangeKmLeft(car);
    alerts.push({
      key: "vidange",
      category: "mechanical",
      label: "Vidange",
      daysLeft: null,
      kmLeft,
      expiryDate: null,
      carName,
      message: `Vidange bientôt (${kmLeft?.toLocaleString()} km restants) — ${carName}`,
    });
  }

  return alerts;
}

module.exports = {
  ALERT_WINDOW_DAYS,
  daysLeft,
  vidangeKmLeft,
  mechanicalExpiryDate,
  collectGarageAlerts,
  shouldAlert,
  shouldAlertVidange,
};
