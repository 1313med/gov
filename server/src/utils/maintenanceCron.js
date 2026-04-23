/**
 * Maintenance reminder cron job.
 * Runs daily at 08:00 — finds all upcoming service records due within 7 days
 * and sends an email reminder to the rental owner.
 */
const cron   = require("node-cron");
const Maintenance  = require("../models/Maintenance");
const User         = require("../models/User");
const emailService = require("./emailService");
const logger       = require("./logger");

function start() {
  // Run every day at 08:00 server time
  cron.schedule("0 8 * * *", async () => {
    try {
      const now         = new Date();
      const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

      // Find all upcoming maintenance records due within 7 days that haven't been soft-deleted
      const upcoming = await Maintenance.find({
        nextServiceDate: { $gte: now, $lte: sevenDaysOut },
        deletedAt: null,
      })
        .populate("rentalId", "title brand model")
        .populate("ownerId", "name email");

      // Group by owner so we send one email per owner (not one per record)
      const byOwner = {};
      for (const record of upcoming) {
        const owner = record.ownerId;
        if (!owner?.email) continue;
        const key = owner._id.toString();
        if (!byOwner[key]) byOwner[key] = { owner, records: [] };
        byOwner[key].records.push(record);
      }

      for (const { owner, records } of Object.values(byOwner)) {
        await emailService.sendMaintenanceReminder(owner, records).catch(() => {});
        logger.info(`Maintenance reminder sent to ${owner.email} (${records.length} record(s))`);
      }
    } catch (err) {
      logger.error("Maintenance cron error: " + err.message);
    }
  });

  logger.info("Maintenance reminder cron scheduled (daily at 08:00)");
}

module.exports = { start };
