/**
 * Mon Garage expiry cron.
 * Runs daily at 09:00 — checks papers and mechanical items that will expire
 * within 30 days (first alert) or 7 days (urgent alert) and notifies the user.
 * alertSentAt is stamped per item so we don't spam the same alert twice.
 */
const cron             = require("node-cron");
const UserCar          = require("../models/UserCar");
const User             = require("../models/User");
const emailService     = require("./emailService");
const whatsappService  = require("./whatsappService");
const logger           = require("./logger");

const ALERT_WINDOW_DAYS  = 30; // first alert when ≤ 30 days remaining
const RESEND_AFTER_DAYS  = 7;  // re-alert if still not renewed after 7 more days

function daysLeft(date) {
  if (!date) return null;
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

function shouldAlert(expiryDate, alertSentAt) {
  const d = daysLeft(expiryDate);
  if (d === null) return false;
  if (d > ALERT_WINDOW_DAYS) return false;
  if (!alertSentAt) return true;
  const daysSinceLastAlert = Math.floor((new Date() - new Date(alertSentAt)) / (1000 * 60 * 60 * 24));
  return daysSinceLastAlert >= RESEND_AFTER_DAYS;
}

function vidangeKmLeft(car) {
  if (!car.vidange?.lastKm || !car.vidange?.intervalKm || !car.currentMileage) return null;
  return car.vidange.lastKm + car.vidange.intervalKm - car.currentMileage;
}

function shouldAlertVidange(car) {
  const kmLeft = vidangeKmLeft(car);
  if (kmLeft === null) return false;
  if (kmLeft > 1500) return false; // alert within 1500 km remaining
  const alertSentAt = car.vidange?.alertSentAt;
  if (!alertSentAt) return true;
  const daysSince = Math.floor((new Date() - new Date(alertSentAt)) / (1000 * 60 * 60 * 24));
  return daysSince >= RESEND_AFTER_DAYS;
}

function start() {
  cron.schedule("0 9 * * *", async () => {
    try {
      const cars = await UserCar.find({ deletedAt: null }).lean();

      for (const car of cars) {
        const user = await User.findOne({ _id: car.userId, deletedAt: null, isBanned: false }).select("name email").lean();
        if (!user?.email) continue;

        const carName = `${car.brand} ${car.model} ${car.year}`;
        const alerts  = [];

        // Papers
        const paperItems = [
          { key: "assurance",       label: "Assurance",         expiry: car.assurance?.expiryDate,      sent: car.assurance?.alertSentAt },
          { key: "visiteTechnique", label: "Visite technique",  expiry: car.visiteTechnique?.expiryDate, sent: car.visiteTechnique?.alertSentAt },
          { key: "vignette",        label: "Vignette",          expiry: car.vignette?.expiryDate,        sent: car.vignette?.alertSentAt },
          { key: "permis",          label: "Permis de conduire", expiry: car.permis?.expiryDate,         sent: car.permis?.alertSentAt },
        ];

        for (const item of paperItems) {
          if (shouldAlert(item.expiry, item.sent)) {
            const d = daysLeft(item.expiry);
            alerts.push({
              key:        item.key,
              label:      item.label,
              daysLeft:   d,
              expiryDate: new Date(item.expiry).toLocaleDateString("fr-FR"),
              carName,
            });
            await UserCar.updateOne({ _id: car._id }, { $set: { [`${item.key}.alertSentAt`]: new Date() } });
          }
        }

        // Vidange by km
        if (shouldAlertVidange(car)) {
          const kmLeft = vidangeKmLeft(car);
          alerts.push({
            key:        "vidange",
            label:      "Vidange (kilométrage)",
            daysLeft:   null,
            kmLeft,
            expiryDate: `${car.currentMileage?.toLocaleString()} km actuels`,
            carName,
          });
          await UserCar.updateOne({ _id: car._id }, { $set: { "vidange.alertSentAt": new Date() } });
        }

        if (alerts.length > 0) {
          await emailService.sendCarExpiryReminder(user, alerts).catch(() => {});
          if (user.phone) {
            await whatsappService.sendCarExpiryAlert(user, carName, alerts).catch(() => {});
          }
          logger.info(`Mon Garage alert sent to ${user.email} (${alerts.length} item(s)) — ${carName}`);
        }
      }
    } catch (err) {
      logger.error("userCarCron error: " + err.message);
    }
  });

  logger.info("Mon Garage expiry cron scheduled (daily at 09:00)");
}

module.exports = { start };
