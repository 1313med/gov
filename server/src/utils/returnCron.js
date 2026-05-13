/**
 * End-of-trip reminders: expire past confirmed bookings and notify once.
 * Runs hourly (backup if users never open the app).
 */
const cron = require("node-cron");
const { processEndedConfirmedBookings } = require("./bookingLifecycle");
const logger = require("./logger");

function start() {
  cron.schedule("30 * * * *", async () => {
    try {
      await processEndedConfirmedBookings({});
    } catch (err) {
      logger.error("Return / lifecycle cron error: " + err.message);
    }
  });

  logger.info("Booking end lifecycle cron scheduled (hourly at :30)");
}

module.exports = { start };
