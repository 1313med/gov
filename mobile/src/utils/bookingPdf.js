import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

function fmtFull(d, fr) {
  if (!d) return "—";
  const loc = fr ? "fr-FR" : "en-GB";
  return new Date(d).toLocaleDateString(loc, { day: "2-digit", month: "long", year: "numeric" });
}

function daysDiff(a, b) {
  return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000));
}

function mad(n, fr) {
  const loc = fr ? "fr-FR" : "en-US";
  return n != null ? `${Number(n).toLocaleString(loc)} MAD` : "—";
}

function esc(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const STATUS_COLOR = {
  pending: "#f59e0b",
  confirmed: "#34d399",
  completed: "#60a5fa",
  rejected: "#f87171",
  cancelled: "#94a3b8",
};

function buildBookingHtml(b, fr) {
  const days = daysDiff(b.startDate, b.endDate);
  const status = (b.status || "").toLowerCase();
  const statusColor = STATUS_COLOR[status] || STATUS_COLOR.cancelled;
  const paid = !!b.isPaid;
  const badgePaidBg = paid ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)";
  const badgePaidBorder = paid ? "#34d399" : "#f87171";
  const badgePaidText = paid ? "#34d399" : "#f87171";
  const paidLabel = paid ? (fr ? "PAYÉ" : "PAID") : fr ? "NON PAYÉ" : "UNPAID";

  const T = fr
    ? {
        tag: "REÇU DE LOCATION",
        bookingId: "N° RÉSERVATION",
        issued: "ÉMIS LE",
        vehicle: "Véhicule",
        carModel: "Modèle",
        city: "Ville",
        priceDay: "Prix / jour",
        customer: "Client",
        fullName: "Nom",
        phone: "Téléphone",
        email: "E-mail",
        period: "Période",
        checkIn: "Début",
        checkOut: "Fin",
        duration: "Durée",
        day: "jour",
        days: "jours",
        bookedOn: "Réservé le",
        payment: "Paiement",
        offer: "Offre appliquée",
        total: "MONTANT TOTAL",
        paidOn: "Payé le",
        docs: "Documents joints",
        footer: "Plateforme de location de véhicules",
        generated: "Généré le",
      }
    : {
        tag: "RENTAL BOOKING RECEIPT",
        bookingId: "BOOKING ID",
        issued: "ISSUED",
        vehicle: "Vehicle",
        carModel: "Car model",
        city: "City",
        priceDay: "Price / day",
        customer: "Customer",
        fullName: "Full name",
        phone: "Phone",
        email: "Email",
        period: "Rental period",
        checkIn: "Check-in",
        checkOut: "Check-out",
        duration: "Duration",
        day: "day",
        days: "days",
        bookedOn: "Booked on",
        payment: "Payment summary",
        offer: "Offer applied",
        total: "TOTAL AMOUNT",
        paidOn: "Paid on",
        docs: "Attached documents",
        footer: "Car rental platform",
        generated: "Generated on",
      };

  const rentalTitle =
    b.rentalId?.title ||
    `${b.rentalId?.brand || ""} ${b.rentalId?.model || ""}`.trim() ||
    "—";
  const docsRows =
    Array.isArray(b.documents) && b.documents.length
      ? b.documents
          .map(
            (d, i) => `
          <tr><td class="lbl">${i + 1}. ${esc(d.name)}</td><td class="val">${esc((d.fileType || "FILE").toUpperCase())}</td></tr>`,
          )
          .join("")
      : "";

  const offerRow = b.appliedOfferTitle
    ? `<tr><td class="lbl">${esc(T.offer)}</td><td class="val">${esc(b.appliedOfferTitle)}</td></tr>`
    : "";

  const paidRow =
    paid && b.paidAt
      ? `<tr><td class="lbl">${esc(T.paidOn)}</td><td class="val">${esc(fmtFull(b.paidAt, fr))}</td></tr>`
      : "";

  const durationStr = `${days} ${days !== 1 ? T.days : T.day}`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; background: #f5f7ff; }
  .page { padding: 0; max-width: 800px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #05060f 0%, #12182e 100%); color: #fff; padding: 28px 24px 24px; position: relative; }
  .header::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: #7c6bff; }
  .brand { font-size: 26px; font-weight: 800; letter-spacing: -0.03em; }
  .brand span { color: #9b8cff; font-style: italic; font-weight: 800; }
  .tag { font-size: 10px; letter-spacing: 0.12em; color: #8891b8; margin-top: 6px; }
  .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 18px; flex-wrap: wrap; gap: 12px; }
  .meta-lbl { font-size: 9px; color: #8891b8; text-transform: uppercase; letter-spacing: 0.08em; }
  .meta-val { font-size: 11px; font-weight: 700; margin-top: 4px; word-break: break-all; }
  .pill { display: inline-block; padding: 6px 12px; border-radius: 8px; font-size: 9px; font-weight: 800; letter-spacing: 0.06em;
    border: 1px solid ${statusColor}; color: ${statusColor}; background: rgba(124,107,255,0.08); }
  .body { padding: 20px 24px 32px; }
  .section { background: #0c1224; color: #c4baff; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; padding: 10px 12px; margin: 18px 0 0; border-radius: 8px 8px 0 0; border-left: 4px solid #7c6bff; }
  .section:first-of-type { margin-top: 0; }
  table { width: 100%; border-collapse: collapse; background: #eef1fc; border-radius: 0 0 10px 10px; overflow: hidden; }
  tr:nth-child(even) { background: #e4e8f8; }
  td { padding: 10px 14px; font-size: 11px; vertical-align: top; }
  .lbl { color: #64748b; width: 38%; }
  .val { color: #0f172a; font-weight: 600; }
  .total-wrap { margin-top: 14px; background: linear-gradient(135deg, #0a0e1a, #151b33); border-radius: 12px; padding: 16px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-left: 5px solid #7c6bff; }
  .total-lbl { font-size: 9px; color: #8891b8; letter-spacing: 0.1em; font-weight: 700; }
  .total-amt { font-size: 22px; font-weight: 800; color: #9b8cff; margin-top: 4px; }
  .paid-badge { padding: 8px 14px; border-radius: 8px; font-size: 10px; font-weight: 800; background: ${badgePaidBg}; border: 1px solid ${badgePaidBorder}; color: ${badgePaidText}; }
  .footer { margin-top: 28px; padding: 18px; text-align: center; background: #0a0e1a; color: #8891b8; font-size: 9px; border-top: 3px solid #7c6bff; }
  .footer .logo { color: #fff; font-weight: 800; font-size: 13px; margin-bottom: 6px; }
  .footer .logo span { color: #9b8cff; font-style: italic; }
</style></head><body>
<div class="page">
  <div class="header">
    <div class="brand">Goo<span>voiture</span></div>
    <div class="tag">${esc(T.tag)}</div>
    <div style="display:flex;justify-content:flex-end;margin-bottom:8px;"><span class="pill">${esc((b.status || "").toUpperCase())}</span></div>
    <div class="header-row">
      <div>
        <div class="meta-lbl">${esc(T.bookingId)}</div>
        <div class="meta-val">${esc(b._id)}</div>
      </div>
      <div style="text-align:right;">
        <div class="meta-lbl">${esc(T.issued)}</div>
        <div class="meta-val">${esc(fmtFull(new Date(), fr))}</div>
      </div>
    </div>
  </div>
  <div class="body">
    <div class="section">${esc(T.vehicle.toUpperCase())}</div>
    <table>
      <tr><td class="lbl">${esc(T.carModel)}</td><td class="val">${esc(rentalTitle)}</td></tr>
      <tr><td class="lbl">${esc(T.city)}</td><td class="val">${esc(b.rentalId?.city || "—")}</td></tr>
      <tr><td class="lbl">${esc(T.priceDay)}</td><td class="val">${esc(b.rentalId?.pricePerDay != null ? mad(b.rentalId.pricePerDay, fr) : "—")}</td></tr>
    </table>
    <div class="section">${esc(T.customer.toUpperCase())}</div>
    <table>
      <tr><td class="lbl">${esc(T.fullName)}</td><td class="val">${esc(b.customerId?.name || "—")}</td></tr>
      <tr><td class="lbl">${esc(T.phone)}</td><td class="val">${esc(b.customerId?.phone || "—")}</td></tr>
      <tr><td class="lbl">${esc(T.email)}</td><td class="val">${esc(b.customerId?.email || "—")}</td></tr>
    </table>
    <div class="section">${esc(T.period.toUpperCase())}</div>
    <table>
      <tr><td class="lbl">${esc(T.checkIn)}</td><td class="val">${esc(fmtFull(b.startDate, fr))}</td></tr>
      <tr><td class="lbl">${esc(T.checkOut)}</td><td class="val">${esc(fmtFull(b.endDate, fr))}</td></tr>
      <tr><td class="lbl">${esc(T.duration)}</td><td class="val">${esc(durationStr)}</td></tr>
      <tr><td class="lbl">${esc(T.bookedOn)}</td><td class="val">${esc(fmtFull(b.createdAt, fr))}</td></tr>
    </table>
    <div class="section">${esc(T.payment.toUpperCase())}</div>
    ${offerRow ? `<table>${offerRow}</table>` : ""}
    <div class="total-wrap">
      <div>
        <div class="total-lbl">${esc(T.total)}</div>
        <div class="total-amt">${esc(mad(b.totalAmount, fr))}</div>
      </div>
      <div class="paid-badge">${esc(paidLabel)}</div>
    </div>
    ${paidRow ? `<table style="margin-top:12px;border-radius:10px;">${paidRow}</table>` : ""}
    ${
      docsRows
        ? `<div class="section">${esc(T.docs.toUpperCase())}</div><table>${docsRows}</table>`
        : ""
    }
  </div>
  <div class="footer">
    <div class="logo">Goo<span>voiture</span></div>
    ${esc(T.generated)} ${esc(fmtFull(new Date(), fr))} · ${esc(T.footer)}
  </div>
</div>
</body></html>`;
}

/**
 * Renders booking receipt HTML to a PDF file and opens the system share sheet.
 * @param {object} booking — same shape as owner booking from API
 * @param {{ fr?: boolean }} opts
 * @returns {Promise<{ uri: string }>}
 */
export async function shareBookingPdf(booking, opts = {}) {
  const fr = !!opts.fr;
  const html = buildBookingHtml(booking, fr);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    const e = new Error(fr ? "Le partage de fichiers n'est pas disponible sur cet appareil." : "Sharing is not available on this device.");
    e.code = "NO_SHARE";
    throw e;
  }
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: fr ? "Enregistrer ou partager le PDF" : "Save or share PDF",
    UTI: "com.adobe.pdf",
  });
  return { uri };
}
