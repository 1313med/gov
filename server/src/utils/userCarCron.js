/**
 * Mon Garage expiry cron — papers, mechanical, vidange + in-app notifications.
 */
const cron = require("node-cron");
const UserCar = require("../models/UserCar");
const User = require("../models/User");
const Notification = require("../models/Notification");
const emailService = require("./emailService");
const whatsappService = require("./whatsappService");
const { collectGarageAlerts } = require("./garageAlerts");
const { emitNotification } = require("./socketManager");
const logger = require("./logger");

function start() {
  cron.schedule("0 9 * * *", async () => {
    try {
      const cars = await UserCar.find({ deletedAt: null }).lean();

      for (const car of cars) {
        if (car.garageSettings?.remindersEnabled === false) continue;

        const user = await User.findOne({ _id: car.userId, deletedAt: null, isBanned: false })
          .select("name email phone")
          .lean();
        if (!user?.email) continue;

        const alerts = collectGarageAlerts(car);
        if (!alerts.length) continue;

        for (const alert of alerts) {
          const type = alert.category === "papers" ? "garage_expiry" : "garage_maintenance";
          const n = await Notification.create({
            user: car.userId,
            message: alert.message,
            type,
          });
          emitNotification(car.userId.toString(), n);

          const pathKey =
            alert.key === "assurance"
              ? "assurance"
              : alert.key === "visiteTechnique"
                ? "visiteTechnique"
                : alert.key === "vignette"
                  ? "vignette"
                  : alert.key === "permis"
                    ? "permis"
                    : alert.key;

          if (alert.key === "vidange") {
            await UserCar.updateOne({ _id: car._id }, { $set: { "vidange.alertSentAt": new Date() } });
          } else if (["pneus", "batterie", "freins", "chainDistribution"].includes(alert.key)) {
            await UserCar.updateOne({ _id: car._id }, { $set: { [`${alert.key}.alertSentAt`]: new Date() } });
          } else {
            await UserCar.updateOne({ _id: car._id }, { $set: { [`${pathKey}.alertSentAt`]: new Date() } });
          }
        }

        await emailService.sendCarExpiryReminder(user, alerts).catch(() => {});
        if (user.phone) {
          const carName = alerts[0]?.carName || `${car.brand} ${car.model}`;
          await whatsappService.sendCarExpiryAlert(user, carName, alerts).catch(() => {});
        }
        logger.info(`Mon Garage: ${alerts.length} alert(s) → ${user.email}`);
      }
    } catch (err) {
      logger.error("userCarCron error: " + err.message);
    }
  });

  logger.info("Mon Garage expiry cron scheduled (daily at 09:00)");
}

module.exports = { start };
