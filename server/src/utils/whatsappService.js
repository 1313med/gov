/**
 * WhatsApp notification service — Meta Cloud API (official WhatsApp Business API).
 *
 * No npm package needed: uses plain HTTPS via axios (already in the project).
 * All sends are fire-and-forget: callers should .catch(() => {}) so a WA
 * failure never breaks the main request flow.
 *
 * Setup:
 *   1. developers.facebook.com → Create app → Add "WhatsApp" product
 *   2. Copy the temporary token + Phone Number ID from the dashboard
 *   3. Add to server .env:
 *        META_WHATSAPP_TOKEN=EAAxxxxxxxxxxxxxxx
 *        META_PHONE_NUMBER_ID=1234567890
 *
 * Test mode  → sends to up to 5 verified recipient numbers (free, no approval needed)
 * Production → requires Meta-approved message templates for outbound notifications
 */

const axios  = require("axios");
const logger = require("./logger");

const META_API_VERSION = "v21.0";

// ── Credentials check ─────────────────────────────────────────────────────────
function isConfigured() {
  return (
    process.env.META_WHATSAPP_TOKEN &&
    process.env.META_PHONE_NUMBER_ID &&
    !process.env.META_WHATSAPP_TOKEN.startsWith("EAA_placeholder")
  );
}

// ── Phone normalisation ────────────────────────────────────────────────────────
/**
 * Convert any Moroccan phone format to E.164 (+212XXXXXXXXX).
 * Returns null when the number cannot be normalised — send is skipped silently.
 */
function normalizePhone(raw) {
  if (!raw) return null;
  let p = String(raw).replace(/[\s\-().]/g, "");

  if (p.startsWith("+"))             return p.length >= 10 ? p : null;
  if (p.startsWith("00212"))         return "+" + p.slice(2);
  if (p.startsWith("212") && p.length === 12) return "+" + p;
  if (p.startsWith("0") && p.length === 10)   return "+212" + p.slice(1);
  if (p.length >= 10)                return "+" + p;
  return null;
}

// ── Core send helper ───────────────────────────────────────────────────────────
async function send(phone, body) {
  if (!isConfigured()) {
    logger.info(`[WHATSAPP SKIPPED] To: ${phone} | ${body.slice(0, 60)}…`);
    return;
  }

  const to = normalizePhone(phone);
  if (!to) {
    logger.warn(`[WHATSAPP] Could not normalise phone: ${phone}`);
    return;
  }

  const url = `https://graph.facebook.com/${META_API_VERSION}/${process.env.META_PHONE_NUMBER_ID}/messages`;

  try {
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        recipient_type:    "individual",
        to,
        type: "text",
        text: { preview_url: false, body },
      },
      {
        headers: {
          Authorization:  `Bearer ${process.env.META_WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    logger.info(`[WHATSAPP SENT] To: ${to}`);
  } catch (err) {
    logger.error(`[WHATSAPP ERROR] To: ${to} | ${err.response?.data ? JSON.stringify(err.response.data) : err.message}`);
  }
}

// ── Message templates ──────────────────────────────────────────────────────────

/** Welcome message after registration. */
exports.sendWelcome = (user) =>
  send(
    user.phone,
    `👋 Bienvenue sur *Goovoiture*, ${user.name} !\n\n` +
    `Votre compte a été créé avec succès.\n` +
    `🚗 Achetez, vendez et louez des voitures vérifiées au Maroc.\n\n` +
    `_Goovoiture — La mobilité premium au Maroc_`
  );

/** Owner: new booking request received. */
exports.sendBookingRequest = (owner, booking, rental, customer) => {
  const start = new Date(booking.startDate).toLocaleDateString("fr-FR");
  const end   = new Date(booking.endDate).toLocaleDateString("fr-FR");
  return send(
    owner.phone,
    `🔔 *Nouvelle demande de réservation*\n\n` +
    `Voiture : *${rental.title}*\n` +
    `Client : ${customer.name}\n` +
    `Dates : ${start} → ${end}\n` +
    `Montant : *${booking.totalAmount?.toLocaleString() ?? "—"} MAD*\n\n` +
    `Ouvrez l'app Goovoiture pour confirmer ou refuser.`
  );
};

/** Customer: booking confirmed by owner. */
exports.sendBookingConfirmed = (customer, booking, rental) => {
  const start = new Date(booking.startDate).toLocaleDateString("fr-FR");
  const end   = new Date(booking.endDate).toLocaleDateString("fr-FR");
  return send(
    customer.phone,
    `✅ *Réservation confirmée !*\n\n` +
    `Voiture : *${rental.title}*\n` +
    `Dates : ${start} → ${end}\n` +
    `Total : *${booking.totalAmount?.toLocaleString() ?? "—"} MAD*\n\n` +
    `Bonne route ! 🚗`
  );
};

/** Customer: booking rejected by owner. */
exports.sendBookingRejected = (customer, booking, rental) =>
  send(
    customer.phone,
    `❌ *Réservation refusée*\n\n` +
    `Votre demande pour *${rental.title}* n'a pas été acceptée par le propriétaire.\n\n` +
    `Consultez d'autres véhicules disponibles sur *Goovoiture*.`
  );

/** Owner: customer cancelled a booking. */
exports.sendBookingCancelledToOwner = (owner, booking, rental, { wasPending, estimatedRefund, feePct }) => {
  const start = new Date(booking.startDate).toLocaleDateString("fr-FR");
  const end   = new Date(booking.endDate).toLocaleDateString("fr-FR");
  const refundLine = wasPending
    ? ""
    : `\nRemboursement estimé : *${estimatedRefund} MAD* (après ${feePct}% de frais)`;
  return send(
    owner.phone,
    `⚠️ *Réservation annulée*\n\n` +
    `Voiture : *${rental.title}*\n` +
    `Dates : ${start} → ${end}` +
    refundLine + `\n\n` +
    `Le client a annulé. Votre calendrier est à nouveau disponible.`
  );
};

/** Customer: confirmation that their cancellation went through. */
exports.sendBookingCancelledToCustomer = (customer, booking, rental, { estimatedRefund, feePct }) => {
  const refundLine = estimatedRefund > 0
    ? `\n💰 Remboursement estimé : *${estimatedRefund} MAD* (${feePct}% de frais déduits).`
    : "";
  return send(
    customer.phone,
    `✅ *Annulation confirmée*\n\n` +
    `Votre réservation pour *${rental.title}* a bien été annulée.` +
    refundLine
  );
};

/** Owner: customer confirmed they returned the car. */
exports.sendReturnConfirmed = (owner, customerName, rental) =>
  send(
    owner.phone,
    `🔑 *Retour confirmé*\n\n` +
    `*${customerName}* a confirmé le retour de *${rental.title}*.\n\n` +
    `N'oubliez pas d'évaluer ce client dans l'app Goovoiture.`
  );

/** Customer: trip marked as completed. */
exports.sendBookingCompleted = (customer, rental) =>
  send(
    customer.phone,
    `🏁 *Location terminée*\n\n` +
    `Votre location de *${rental.title}* est maintenant marquée comme terminée.\n\n` +
    `Partagez votre avis sur l'app Goovoiture — votre retour compte ! ⭐`
  );

/** Mon Garage: expiry alerts for a user's personal car. */
exports.sendCarExpiryAlert = (user, carName, alerts) => {
  const lines = alerts.map((a) => {
    if (a.daysLeft === null && a.kmLeft !== undefined)
      return `• *${a.label}* — encore ~${a.kmLeft?.toLocaleString()} km`;
    if (a.daysLeft <= 0)
      return `• *${a.label}* — ⚠️ EXPIRÉ`;
    return `• *${a.label}* — expire dans *${a.daysLeft} jour(s)*`;
  });
  return send(
    user.phone,
    `🚗 *Mon Garage — Rappel*\n\n` +
    `Votre *${carName}* a des échéances à renouveler :\n\n` +
    lines.join("\n") + `\n\n` +
    `Ouvrez *Goovoiture → Mon Garage* pour gérer vos documents.`
  );
};

/** Price alert: matching listings found. */
exports.sendPriceAlert = (user, alert, matches) =>
  send(
    user.phone,
    `🔔 *Alerte Prix Goovoiture*\n\n` +
    `${matches.length} annonce(s) pour votre recherche :\n` +
    `*${alert.brand}${alert.model ? " " + alert.model : ""}* sous ${alert.maxPrice.toLocaleString()} MAD\n\n` +
    matches.slice(0, 3).map((l) =>
      `• ${l.title} — *${l.price.toLocaleString()} MAD* (${l.city || "—"})`
    ).join("\n") +
    `\n\nOuvrez *Goovoiture* pour voir toutes les annonces.`
  );

/** New message received. */
exports.sendNewMessage = (recipient, senderName) =>
  send(
    recipient.phone,
    `💬 *Nouveau message*\n\n` +
    `*${senderName}* vous a envoyé un message sur *Goovoiture*.\n\n` +
    `Ouvrez l'app pour répondre.`
  );
