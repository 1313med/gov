/**
 * When a confirmed booking’s endDate is in the past, mark it expired and send
 * end-of-trip notifications (customer + owner) once per booking.
 *
 * @param {{ customerId?: import("mongoose").Types.ObjectId, rentalIdIn?: import("mongoose").Types.ObjectId[] }} scope
 */
const Booking = require("../models/Booking");
const User = require("../models/User");
const Notification = require("../models/Notification");
const emailService = require("./emailService");
const { emitNotification } = require("./socketManager");
const logger = require("./logger");

async function notify(userId, message, type, bookingId = null) {
  const n = await Notification.create({ user: userId, message, type, bookingId });
  emitNotification(userId.toString(), n);
}

async function processEndedConfirmedBookings(scope = {}) {
  const q = {
    status: "confirmed",
    endDate: { $lt: new Date() },
    deletedAt: null,
  };
  if (scope.customerId) q.customerId = scope.customerId;
  if (scope.rentalIdIn?.length) q.rentalId = { $in: scope.rentalIdIn };

  const bookings = await Booking.find(q)
    .limit(400)
    .populate("customerId", "name email")
    .populate({ path: "rentalId", select: "title rentalOwnerId" });

  for (const booking of bookings) {
    try {
      const sendReturnFlow = !booking.returnNotificationSent;
      const sendFeedbackPrompt = !booking.customerRentalFeedbackPromptSent;

      booking.status = "expired";
      if (sendReturnFlow) booking.returnNotificationSent = true;
      if (sendFeedbackPrompt) booking.customerRentalFeedbackPromptSent = true;
      await booking.save();

      const customer = booking.customerId;
      const rental = booking.rentalId;
      const ownerId = rental?.rentalOwnerId;
      const carTitle = rental?.title || "the car";
      const endDate = new Date(booking.endDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      if (sendReturnFlow && customer?._id) {
        await notify(
          customer._id,
          `Your rental of "${carTitle}" ended on ${endDate}. Did you return the car? Please confirm so the owner can complete the booking.`,
          "return_confirm",
          booking._id,
        );
      }

      if (sendReturnFlow && ownerId) {
        await notify(
          ownerId,
          `The rental of "${carTitle}" with ${customer?.name || "a customer"} ended on ${endDate}. Please rate this customer and complete the booking.`,
          "feedback_request",
          booking._id,
        );
      }

      if (sendFeedbackPrompt && customer?._id) {
        await notify(
          customer._id,
          `Your trip with "${carTitle}" ended on ${endDate}. Tell us how it went — leave a quick review in My Bookings.`,
          "rental_ended_feedback",
          booking._id,
        );
        const u = await User.findById(customer._id).select("email name");
        if (u?.email) {
          emailService.sendCustomerRentalFeedbackInvite(booking, rental, u).catch(() => {});
        }
      }

      logger.info(`Booking ${booking._id} marked expired (lifecycle)`);
    } catch (err) {
      logger.error(`bookingLifecycle booking ${booking._id}: ${err.message}`);
    }
  }
}

module.exports = { processEndedConfirmedBookings };
