import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const RECEIPT_LOGO = require("../../assets/images/goovoiture-receipt-logo-transparent.png");

let logoDataUriCache = null;

async function getReceiptLogoDataUri() {
  if (logoDataUriCache) return logoDataUriCache;
  try {
    const asset = Asset.fromModule(RECEIPT_LOGO);
    await asset.downloadAsync();
    const uri = asset.localUri || asset.uri;
    if (!uri) return null;
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    logoDataUriCache = `data:image/png;base64,${base64}`;
    return logoDataUriCache;
  } catch {
    return null;
  }
}

function fmtFull(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function fmtShortId(id) {
  if (!id) return "—";
  const s = String(id);
  return s.length > 8 ? s.slice(-8).toUpperCase() : s.toUpperCase();
}

function daysDiff(a, b) {
  const start = new Date(a);
  const end = new Date(b);
  const startUTC = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const endUTC = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  return Math.max(1, Math.floor((endUTC - startUTC) / 86400000) + 1);
}

function mad(n) {
  return n != null && !Number.isNaN(Number(n))
    ? `${Number(n).toLocaleString("fr-FR")} MAD`
    : "—";
}

function esc(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Permis / CIN peuvent être une chaîne ou { number, verified, ... }. */
function idNumber(doc) {
  if (doc == null) return null;
  if (typeof doc === "string" && doc.trim()) return doc.trim();
  if (typeof doc === "object" && doc.number != null && String(doc.number).trim()) {
    return String(doc.number).trim();
  }
  return null;
}

const STATUS = {
  pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", label: "En attente" },
  confirmed: { color: "#10b981", bg: "rgba(16,185,129,0.15)", label: "Confirmée" },
  completed: { color: "#6366f1", bg: "rgba(99,102,241,0.15)", label: "Terminée" },
  rejected: { color: "#ef4444", bg: "rgba(239,68,68,0.15)", label: "Refusée" },
  cancelled: { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", label: "Annulée" },
  expired: { color: "#64748b", bg: "rgba(100,116,139,0.12)", label: "Expirée" },
};

function row(label, value, highlight = false) {
  if (!label && !value) return "";
  return `<tr class="${highlight ? "row-hi" : ""}"><td class="lbl">${esc(label)}</td><td class="val">${esc(value ?? "—")}</td></tr>`;
}

const PDF_STYLES = `
  @page { size: A4; margin: 10mm 11mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #0f172a;
    background: #eef1f8;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .hero {
    background: linear-gradient(135deg, #05060f 0%, #151b38 50%, #1a1040 100%);
    color: #fff;
    padding: 22px;
    border-radius: 16px;
    position: relative;
    overflow: hidden;
  }
  .hero::after {
    content: "";
    position: absolute;
    left: 0; top: 0; bottom: 0; width: 5px;
    background: linear-gradient(180deg, #7c6bff, #38bdf8);
  }
  .hero-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; position: relative; z-index: 1; }
  .brand-row {
    display: inline-flex;
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: nowrap;
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.05em;
    white-space: nowrap;
  }
  .brand-mark {
    width: 1.45em;
    height: 1.45em;
    flex-shrink: 0;
    display: block;
    object-fit: contain;
    object-position: left bottom;
    margin: 0 -0.34em 0 0;
    padding: 0;
    transform: translate(0.05em, 0.23em);
    background: none !important;
  }
  .brand-text {
    display: inline-flex;
    flex-direction: row;
    align-items: baseline;
    line-height: 1;
    padding: 0;
    margin: 0;
  }
  .brand-oo,
  .brand-voiture {
    font-size: 1em;
    font-weight: 800;
    letter-spacing: -0.05em;
    line-height: 1;
    padding: 0;
    margin: 0;
  }
  .brand-voiture {
    color: #a78bfa;
    font-style: italic;
  }
  .brand { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; }
  .brand em { color: #a78bfa; font-style: italic; }
  .hero-tag { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; margin-top: 6px; font-weight: 600; }
  .hero-logo-wrap {
    flex-shrink: 0;
    z-index: 2;
    line-height: 0;
    background: none;
    border: none;
    padding: 0;
  }
  .hero-logo {
    width: 72px;
    height: 72px;
    object-fit: contain;
    display: block;
    background: none !important;
    border: none;
    box-shadow: none;
  }
  .status-pill {
    display: inline-block;
    margin-top: 14px;
    padding: 7px 14px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .hero-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; position: relative; z-index: 1; }
  .meta-card {
    flex: 1; min-width: 110px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 10px 12px;
  }
  .meta-lbl { font-size: 8px; text-transform: uppercase; letter-spacing: 0.1em; color: #8891b8; font-weight: 600; }
  .meta-val { font-size: 11px; font-weight: 700; margin-top: 4px; color: #f8fafc; word-break: break-all; }
  .meta-val.ref { font-size: 17px; letter-spacing: 0.06em; color: #c4b5fd; }
  .body { padding-top: 14px; }
  .card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    margin-bottom: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(15,23,42,0.06);
  }
  .card-head {
    background: linear-gradient(90deg, #0f172a, #1e293b);
    color: #e2e8f0;
    padding: 10px 14px;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-left: 4px solid #7c6bff;
  }
  table.data { width: 100%; border-collapse: collapse; }
  table.data tr { border-bottom: 1px solid #f1f5f9; }
  table.data tr:last-child { border-bottom: none; }
  table.data tr.row-hi { background: #f8fafc; }
  table.data td { padding: 9px 14px; font-size: 11px; vertical-align: top; }
  table.data .lbl { color: #64748b; width: 42%; font-weight: 500; }
  table.data .val { color: #0f172a; font-weight: 600; text-align: right; }
  .specs { display: flex; flex-wrap: wrap; gap: 8px; padding: 10px 12px 12px; }
  .spec {
    flex: 1 1 calc(33% - 6px);
    min-width: 88px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 8px 10px;
  }
  .spec-lbl { font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; font-weight: 600; }
  .spec-val { font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 3px; }
  .note {
    margin: 0 12px 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    font-size: 10px;
    color: #1e40af;
    font-weight: 600;
  }
  .timeline {
    display: flex;
    margin: 10px 12px 12px;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
  }
  .tl-block { flex: 1; padding: 12px 8px; text-align: center; background: #f8fafc; }
  .tl-block.mid {
    flex: 0 0 auto;
    padding: 12px 14px;
    background: linear-gradient(135deg, #7c6bff, #6366f1);
    color: #fff;
  }
  .tl-lbl { font-size: 8px; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.8; font-weight: 600; }
  .tl-val { font-size: 11px; font-weight: 700; margin-top: 4px; }
  .tl-mid-val { font-size: 13px; font-weight: 800; }
  .pay-hero {
    margin: 10px 12px 12px;
    padding: 16px;
    border-radius: 14px;
    background: linear-gradient(135deg, #0a0e1a, #1a1f3d);
    border: 1px solid rgba(124,107,255,0.35);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .pay-total-lbl { font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8; font-weight: 700; }
  .pay-total-amt { font-size: 26px; font-weight: 800; color: #c4b5fd; margin-top: 4px; }
  .pay-badge {
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
  }
  .doc-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px;
    border-bottom: 1px solid #f1f5f9;
  }
  .doc-item:last-child { border-bottom: none; }
  .doc-num {
    width: 22px; height: 22px; border-radius: 6px;
    background: #ede9fe; color: #6d28d9;
    font-size: 10px; font-weight: 800;
    display: flex; align-items: center; justify-content: center;
  }
  .doc-name { flex: 1; font-size: 11px; font-weight: 600; }
  .doc-type { font-size: 9px; font-weight: 700; color: #64748b; }
  .muted { font-size: 11px; color: #94a3b8; padding: 12px 14px; }
  .footer {
    margin-top: 4px;
    padding: 16px;
    text-align: center;
    background: #0f172a;
    color: #94a3b8;
    border-radius: 14px;
    border-top: 3px solid #7c6bff;
  }
  .footer-brand {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }
  .footer p { font-size: 9px; line-height: 1.55; margin-top: 4px; }
  .footer .legal { margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 8px; color: #64748b; }
`;

const T = {
  tag: "Reçu officiel de location",
  ref: "Référence",
  fullId: "N° complet",
  issued: "Émis le",
  vehicle: "Véhicule",
  listing: "Annonce",
  vehicleLine: "Désignation",
  brand: "Marque",
  model: "Modèle",
  year: "Année",
  fuel: "Carburant",
  gearbox: "Boîte",
  color: "Couleur",
  mileage: "Kilométrage",
  seats: "Places",
  city: "Ville",
  rate: "Tarif / jour",
  airport: "Livraison aéroport",
  customer: "Locataire",
  name: "Nom",
  phone: "Téléphone",
  email: "E-mail",
  custCity: "Ville",
  license: "N° permis de conduire",
  cin: "N° CIN",
  period: "Période de location",
  checkIn: "Début",
  checkOut: "Fin",
  duration: "Durée",
  day: "jour",
  days: "jours",
  booked: "Réservation créée",
  dateChange: "Dates modifiées (1×)",
  payment: "Paiement",
  subtotal: "Sous-total",
  discount: "Réduction",
  offer: "Offre appliquée",
  airportFee: "Frais aéroport",
  total: "Total",
  paid: "PAYÉ",
  unpaid: "NON PAYÉ",
  paidOn: "Payé le",
  docs: "Documents joints",
  noDocs: "Aucun document joint",
  footer: "GooVoiture · Location au Maroc",
  legal: "Reçu pour votre comptabilité. Conservez ce document.",
};

function buildBookingHtml(b, logoDataUri) {
  const days = daysDiff(b.startDate, b.endDate);
  const status = (b.status || "pending").toLowerCase();
  const st = STATUS[status] || STATUS.pending;
  const paid = !!b.isPaid;
  const rental = b.rentalId || {};
  const customer = b.customerId || {};

  const licenseNo = idNumber(customer.driverLicense);
  const cinNo = idNumber(customer.nationalId);

  const listingTitle =
    rental.title || `${rental.brand || ""} ${rental.model || ""}`.trim() || "—";
  const vehicleLine =
    [rental.brand, rental.model, rental.year].filter(Boolean).join(" · ") || listingTitle;

  const ppd = rental.pricePerDay != null ? Number(rental.pricePerDay) : null;
  const subtotal = ppd != null ? days * ppd : null;
  const total = b.totalAmount != null ? Number(b.totalAmount) : null;
  const discount =
    subtotal != null && total != null && subtotal > total ? subtotal - total : null;

  const airportLine =
    rental.airportDeliveryOffered && Number(rental.airportDeliveryFeeMad) > 0
      ? mad(rental.airportDeliveryFeeMad)
      : null;

  const durationStr = `${days} ${days !== 1 ? T.days : T.day}`;

  const specItems = [
    rental.brand && { l: T.brand, v: rental.brand },
    rental.model && { l: T.model, v: rental.model },
    rental.year && { l: T.year, v: String(rental.year) },
    rental.fuel && { l: T.fuel, v: rental.fuel },
    rental.gearbox && { l: T.gearbox, v: rental.gearbox },
    rental.color && { l: T.color, v: rental.color },
    rental.mileage != null && {
      l: T.mileage,
      v: `${Number(rental.mileage).toLocaleString("fr-FR")} km`,
    },
    rental.seats && { l: T.seats, v: String(rental.seats) },
    rental.city && { l: T.city, v: rental.city },
    ppd != null && { l: T.rate, v: mad(ppd) },
  ].filter(Boolean);

  const specsHtml = specItems
    .map(
      (s) =>
        `<div class="spec"><div class="spec-lbl">${esc(s.l)}</div><div class="spec-val">${esc(s.v)}</div></div>`,
    )
    .join("");

  const docsHtml =
    Array.isArray(b.documents) && b.documents.length
      ? b.documents
          .map(
            (d, i) =>
              `<div class="doc-item"><span class="doc-num">${i + 1}</span><span class="doc-name">${esc(d.name)}</span><span class="doc-type">${esc((d.fileType || "fichier").toUpperCase())}</span></div>`,
          )
          .join("")
      : `<p class="muted">${esc(T.noDocs)}</p>`;

  const statusStyle = `color:${st.color};background:${st.bg};border:1px solid ${st.color}`;
  const payStyle = paid
    ? "color:#34d399;background:rgba(52,211,153,0.15);border:1px solid #34d399"
    : "color:#f87171;background:rgba(248,113,113,0.12);border:1px solid #f87171";

  const logoImg = logoDataUri
    ? `<div class="hero-logo-wrap"><img class="hero-logo" src="${logoDataUri}" alt="GooVoiture" /></div>`
    : "";

  const brandHtml = logoDataUri
    ? `<div class="brand-row"><img class="brand-mark" src="${logoDataUri}" alt="" /><span class="brand-text"><span class="brand-oo">oo</span><span class="brand-voiture">voiture</span></span></div>`
    : '<div class="brand">Goo<em>voiture</em></div>';

  return [
    "<!DOCTYPE html>",
    '<html lang="fr">',
    "<head>",
    '<meta charset="utf-8" />',
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />',
    "<style>",
    PDF_STYLES,
    "</style>",
    "</head>",
    "<body>",
    '<div class="hero">',
    '<div class="hero-top">',
    "<div>",
    brandHtml,
    `<div class="hero-tag">${esc(T.tag)}</div>`,
    "</div>",
    logoImg,
    "</div>",
    `<span class="status-pill" style="${statusStyle}">${esc(st.label)}</span>`,
    '<div class="hero-meta">',
    '<div class="meta-card">',
    `<div class="meta-lbl">${esc(T.ref)}</div>`,
    `<div class="meta-val ref">#${esc(fmtShortId(b._id))}</div>`,
    "</div>",
    '<div class="meta-card">',
    `<div class="meta-lbl">${esc(T.issued)}</div>`,
    `<div class="meta-val">${esc(fmtFull(new Date()))}</div>`,
    "</div>",
    '<div class="meta-card" style="flex:2;min-width:200px;">',
    `<div class="meta-lbl">${esc(T.fullId)}</div>`,
    `<div class="meta-val" style="font-size:9px;">${esc(b._id)}</div>`,
    "</div>",
    "</div>",
    "</div>",
    '<div class="body">',
    '<div class="card">',
    `<div class="card-head">${esc(T.vehicle)}</div>`,
    '<table class="data">',
    row(T.listing, listingTitle, true),
    row(T.vehicleLine, vehicleLine),
    "</table>",
    `<div class="specs">${specsHtml}</div>`,
    airportLine ? `<div class="note">${esc(T.airport)} : ${esc(airportLine)}</div>` : "",
    "</div>",
    '<div class="card">',
    `<div class="card-head">${esc(T.customer)}</div>`,
    '<table class="data">',
    row(T.name, customer.name, true),
    row(T.phone, customer.phone),
    row(T.email, customer.email),
    customer.city ? row(T.custCity, customer.city) : "",
    licenseNo ? row(T.license, licenseNo) : "",
    cinNo ? row(T.cin, cinNo) : "",
    "</table>",
    "</div>",
    '<div class="card">',
    `<div class="card-head">${esc(T.period)}</div>`,
    '<div class="timeline">',
    '<div class="tl-block">',
    `<div class="tl-lbl">${esc(T.checkIn)}</div>`,
    `<div class="tl-val">${esc(fmtFull(b.startDate))}</div>`,
    "</div>",
    '<div class="tl-block mid">',
    `<div class="tl-lbl">${esc(T.duration)}</div>`,
    `<div class="tl-mid-val">${esc(durationStr)}</div>`,
    "</div>",
    '<div class="tl-block">',
    `<div class="tl-lbl">${esc(T.checkOut)}</div>`,
    `<div class="tl-val">${esc(fmtFull(b.endDate))}</div>`,
    "</div>",
    "</div>",
    '<table class="data">',
    row(T.booked, fmtFull(b.createdAt)),
    b.customerDateChangeUsed ? row(T.dateChange, "Oui") : "",
    "</table>",
    "</div>",
    '<div class="card">',
    `<div class="card-head">${esc(T.payment)}</div>`,
    '<table class="data">',
    subtotal != null ? row(T.subtotal, `${mad(subtotal)} (${days} × ${mad(ppd)})`) : "",
    b.appliedOfferTitle ? row(T.offer, b.appliedOfferTitle) : "",
    discount != null && discount > 0 ? row(T.discount, `− ${mad(discount)}`) : "",
    airportLine ? row(T.airportFee, airportLine) : "",
    "</table>",
    '<div class="pay-hero">',
    "<div>",
    `<div class="pay-total-lbl">${esc(T.total)}</div>`,
    `<div class="pay-total-amt">${esc(mad(total))}</div>`,
    "</div>",
    `<span class="pay-badge" style="${payStyle}">${esc(paid ? T.paid : T.unpaid)}</span>`,
    "</div>",
    paid && b.paidAt ? `<table class="data">${row(T.paidOn, fmtFull(b.paidAt), true)}</table>` : "",
    "</div>",
    '<div class="card">',
    `<div class="card-head">${esc(T.docs)}</div>`,
    docsHtml,
    "</div>",
    '<div class="footer">',
    logoDataUri
      ? `<div class="footer-brand">${brandHtml}</div>`
      : '<div class="brand">Goo<em>voiture</em></div>',
    `<p>${esc(T.footer)} · ${esc(fmtFull(new Date()))}</p>`,
    `<p class="legal">${esc(T.legal)}</p>`,
    "</div>",
    "</div>",
    "</body>",
    "</html>",
  ].join("");
}

export async function shareBookingPdf(booking, _opts = {}) {
  const logoDataUri = await getReceiptLogoDataUri();
  const html = buildBookingHtml(booking, logoDataUri);
  const ref = fmtShortId(booking._id);
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Reçu #${ref}`,
      UTI: "com.adobe.pdf",
    });
  }
  return uri;
}
