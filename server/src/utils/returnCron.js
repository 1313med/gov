/**
 * Return & feedback notification cron.
 * Runs daily at 09:00.
 *
 * For every confirmed booking whose endDate has passed today and whose
 * returnNotificationSent flag is still false:
 *   1. Send the CUSTOMER a "Did you return the car?" notification.
 *   2. Send the OWNER a "Rental ended – give your feedback" notification.
 *   3. Mark returnNotificationSent = true so this only fires once per booking.
 */
const cron           = require("node-cron");
const Booking        = require("../models/Booking");
const Notification   = require("../models/Notification");
const { emitNotification } = require("./socketManager");
const logger         = require("./logger");

async function notify(userId, message, type, bookingId) {
  const n = await Notification.create({ user: userId, message, type, bookingId });
  emitNotification(userId.toString(), n);
}

function start() {
  cron.schedule("0 9 * * *", async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expired = await Booking.find({
        status:                  "confirmed",
        endDate:                 { $lt: today },
        returnNotificationSent:  false,
        deletedAt:               null,
      })
        .populate("customerId",  "name")
        .populate({
          path:     "rentalId",
          select:   "title rentalOwnerId",
        });

      for (const booking of expired) {
        const customer = booking.customerId;
        const rental   = booking.rentalId;
        const ownerId  = rental?.rentalOwnerId;
        const carTitle = rental?.title || "the car";
        const endDate  = new Date(booking.endDate).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short", year: "numeric",
        });

        // 1 — Notify customer
        if (customer?._id) {
          await notify(
            customer._id,
            `Your rental of "${carTitle}" ended on ${endDate}. Did you return the car? Please confirm so the owner can complete the booking.`,
            "return_confirm",
            booking._id,
          );
        }

        // 2 — Notify owner
        if (ownerId) {
          await notify(
            ownerId,
            `The rental of "${carTitle}" with ${customer?.name || "a customer"} ended on ${endDate}. Please rate this customer and complete the booking.`,
            "feedback_request",
            booking._id,
          );
        }

        // 3 — Mark so this doesn't repeat tomorrow
        booking.returnNotificationSent = true;
        await booking.save();

        logger.info(`Return notifications sent for booking ${booking._id}`);
      }
    } catch (err) {
      logger.error("Return cron error: " + err.message);
    }
  });

  logger.info("Return/feedback reminder cron scheduled (daily at 09:00)");
}

module.exports = { start };
