/**
 * Price alert cron — runs daily at 08:00.
 * Checks listings approved in the last 24 h against all active alerts.
 * Fires email + WhatsApp for each alert that has at least one match.
 */
const cron         = require("node-cron");
const PriceAlert   = require("../models/PriceAlert");
const SaleListing  = require("../models/SaleListing");
const User         = require("../models/User");
const emailService = require("./emailService");
const whatsappService = require("./whatsappService");
const logger       = require("./logger");

function start() {
  cron.schedule("0 8 * * *", async () => {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newListings = await SaleListing.find({
        status: "approved",
        deletedAt: null,
        createdAt: { $gte: since },
      }).lean();

      if (!newListings.length) return;

      const alerts = await PriceAlert.find({ active: true }).lean();

      for (const alert of alerts) {
        const matches = newListings.filter((l) => {
          if ((l.brand || "").toLowerCase() !== alert.brand.toLowerCase()) return false;
          if (alert.model && !(l.model || "").toLowerCase().includes(alert.model.toLowerCase())) return false;
          if (l.price > alert.maxPrice) return false;
          if (alert.minYear && l.year < alert.minYear) return false;
          if (alert.fuelType && (l.fuel || "").toLowerCase() !== alert.fuelType.toLowerCase()) return false;
          if (alert.city && (l.city || "").toLowerCase() !== alert.city.toLowerCase()) return false;
          return true;
        });

        if (!matches.length) continue;

        const user = await User.findById(alert.userId).select("name email phone").lean();
        if (!user?.email) continue;

        await emailService.sendPriceAlert(user, alert, matches).catch(() => {});
        if (user.phone) {
          await whatsappService.sendPriceAlert(user, alert, matches).catch(() => {});
        }

        await PriceAlert.updateOne({ _id: alert._id }, { $set: { lastNotifiedAt: new Date() } });
        logger.info(`Price alert → ${user.email} | ${matches.length} match(es) for ${alert.brand}`);
      }
    } catch (err) {
      logger.error("priceAlertCron error: " + err.message);
    }
  });

  logger.info("Price alert cron scheduled (daily at 08:00)");
}

module.exports = { start };
