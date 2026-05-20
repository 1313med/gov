import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { getOwnerBookings, updateBookingStatus, markBookingPaid, updateBookingMedia, ownerAckBookingAlert } from "../api/booking";
import { submitCustomerFeedback, getFeedbackForBooking } from "../api/customerFeedback";
import OwnerLayout from "../components/owner/OwnerLayout";
import { useAppLang } from "../context/AppLangContext";
import RenterTrustPassport from "../components/RenterTrustPassport";
import {
  ChevronDown, ChevronUp, ImagePlus, Upload, X,
  FileDown, FileSpreadsheet, FileText, Search,
  CheckCircle2, XCircle, Clock, AlertCircle, Star,
} from "lucide-react";

/* ─── helpers (locale-aware via lang param) ──────────────────────────── */
function fmt(d, lang = "en") {
  const loc = lang === "fr" ? "fr-FR" : "en-GB";
  return new Date(d).toLocaleDateString(loc, { day: "2-digit", month: "short", year: "numeric" });
}
function fmtFull(d, lang = "en") {
  const loc = lang === "fr" ? "fr-FR" : "en-GB";
  return new Date(d).toLocaleDateString(loc, { day: "2-digit", month: "long", year: "numeric" });
}
function daysDiff(a, b) {
  return Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000));
}
function mad(n, lang = "en") {
  const loc = lang === "fr" ? "fr-FR" : "en-US";
  return n != null ? `${Number(n).toLocaleString(loc)} MAD` : "—";
}

/* ─── CSV export ──────────────────────────────────────────────────────── */
function exportCSV(bookings) {
  const headers = [
    "Booking ID", "Car", "City", "Customer", "Phone", "Email",
    "Booked On", "Start Date", "End Date", "Days",
    "Total (MAD)", "Offer Applied", "Status", "Payment", "Paid On",
  ];
  const rows = bookings.map((b) => {
    const days = daysDiff(b.startDate, b.endDate);
    return [
      b._id,
      b.rentalId?.title || "",
      b.rentalId?.city || "",
      b.customerId?.name || "",
      b.customerId?.phone || "",
      b.customerId?.email || "",
      fmt(b.createdAt),
      fmt(b.startDate),
      fmt(b.endDate),
      days,
      b.totalAmount ?? "",
      b.appliedOfferTitle || "",
      b.status,
      b.isPaid ? "Paid" : "Unpaid",
      b.isPaid && b.paidAt ? fmt(b.paidAt) : "",
    ];
  });

  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `bookings_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── PDF export (single booking) ────────────────────────────────────── */
function exportBookingPDF(b) {
  const doc  = new jsPDF({ unit: "mm", format: "a4" });
  const W    = 210;
  const H    = 297;
  const days = daysDiff(b.startDate, b.endDate);

  // ── brand palette ──────────────────────────────────────────────────────
  const C = {
    navy:    [5,   6,  15],
    navy2:   [8,  12,  26],
    surface: [16,  20,  38],
    purple:  [124, 107, 255],
    purple2: [155, 140, 255],
    sky:     [56,  189, 248],
    ink:     [11,  22,  61],
    text:    [15,  25,  70],
    muted:   [83,  96, 143],
    light:   [245, 247, 255],
    white:   [255, 255, 255],
    border:  [220, 225, 245],
    // status
    s_pending:   [251, 191, 36],
    s_confirmed: [74,  222, 128],
    s_completed: [124, 107, 255],
    s_rejected:  [248, 113, 113],
    s_cancelled: [148, 163, 184],
  };

  const statusColor = {
    pending:   C.s_pending,
    confirmed: C.s_confirmed,
    completed: C.s_completed,
    rejected:  C.s_rejected,
    cancelled: C.s_cancelled,
  }[b.status] || C.s_cancelled;

  // ── HEADER block (deep navy, 58mm tall) ────────────────────────────────
  doc.setFillColor(...C.navy);
  doc.rect(0, 0, W, 58, "F");

  // Purple left accent stripe
  doc.setFillColor(...C.purple);
  doc.rect(0, 0, 5, 58, "F");

  // Subtle purple glow band across top
  doc.setFillColor(20, 18, 35);
  doc.rect(5, 0, W - 5, 2, "F");

  // ── Logo: "Goo" bold  +  "voiture" bold italic ────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...C.white);
  doc.text("Goo", 18, 21);

  // measure "Goo" width to position "voiture" right after
  const gooW = doc.getTextWidth("Goo");
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...C.purple2);
  doc.text("voiture", 18 + gooW, 21);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...C.muted);
  doc.text("RENTAL BOOKING RECEIPT", 18, 28);

  // Thin separator line under logo area
  doc.setDrawColor(...C.surface);
  doc.setLineWidth(0.4);
  doc.line(18, 32, W - 18, 32);

  // Booking ID row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 190);
  doc.text("BOOKING ID", 18, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.text(b._id, 18, 47);

  // Issue date (right-aligned)
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 190);
  doc.text("ISSUED", W - 18, 40, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...C.white);
  doc.text(fmtFull(new Date()), W - 18, 47, { align: "right" });

  // ── Status pill (top-right of header) ─────────────────────────────────
  const statusLabel = b.status.toUpperCase();
  const pillW = doc.getTextWidth(statusLabel) + 12;
  const pillX = W - 18 - pillW;

  // pill background (semi-transparent tint)
  const [sr, sg, sb] = statusColor;
  doc.setFillColor(
    Math.round(sr * 0.18 + 5),
    Math.round(sg * 0.18 + 6),
    Math.round(sb * 0.18 + 15),
  );
  doc.roundedRect(pillX, 7, pillW, 9, 2, 2, "F");
  // pill border
  doc.setDrawColor(...statusColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(pillX, 7, pillW, 9, 2, 2, "S");
  // pill label
  doc.setTextColor(...statusColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(statusLabel, pillX + pillW / 2, 13, { align: "center" });

  // ── BODY background ───────────────────────────────────────────────────
  doc.setFillColor(...C.light);
  doc.rect(0, 58, W, H - 58, "F");

  // ── Helpers ───────────────────────────────────────────────────────────
  let y = 68;
  const LX = 18;   // left x
  const RX = W - 18; // right x
  const COL = 95;  // label column value x

  function sectionHeader(title, iconLabel) {
    // full-width band
    doc.setFillColor(...C.navy2);
    doc.rect(LX, y, W - 36, 8, "F");
    // left accent
    doc.setFillColor(...C.purple);
    doc.rect(LX, y, 3, 8, "F");
    // icon + title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(...C.purple2);
    doc.text((iconLabel + "  " + title).toUpperCase(), LX + 8, y + 5.5);
    y += 12;
  }

  function dataRow(label, value, emphasis = false) {
    // row background alternates very subtly
    doc.setFillColor(238, 241, 252);
    doc.rect(LX, y - 4.5, W - 36, 7, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text(label, LX + 4, y);

    doc.setFont("helvetica", emphasis ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(...(emphasis ? C.ink : C.text));
    doc.text(String(value ?? "—"), COL, y);
    y += 8;
  }

  function spacer(h = 4) { y += h; }

  function sectionDivider() {
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.25);
    doc.line(LX, y, RX, y);
    y += 5;
  }

  // ── VEHICLE section ───────────────────────────────────────────────────
  sectionHeader("Vehicle", "");
  dataRow("Car model",    b.rentalId?.title    || "—", true);
  dataRow("City",         b.rentalId?.city     || "—");
  dataRow("Price / day",  b.rentalId?.pricePerDay != null ? mad(b.rentalId.pricePerDay) : "—");
  spacer(2);
  sectionDivider();

  // ── CUSTOMER section ──────────────────────────────────────────────────
  sectionHeader("Customer", "");
  dataRow("Full name",    b.customerId?.name  || "—", true);
  dataRow("Phone",        b.customerId?.phone || "—");
  dataRow("Email",        b.customerId?.email || "—");
  spacer(2);
  sectionDivider();

  // ── RENTAL PERIOD section ─────────────────────────────────────────────
  sectionHeader("Rental Period", "");
  dataRow("Check-in",    fmtFull(b.startDate), true);
  dataRow("Check-out",   fmtFull(b.endDate),   true);
  dataRow("Duration",    `${days} day${days !== 1 ? "s" : ""}`);
  dataRow("Booked on",   fmtFull(b.createdAt));
  spacer(2);
  sectionDivider();

  // ── PAYMENT summary box ───────────────────────────────────────────────
  sectionHeader("Payment Summary", "");
  if (b.appliedOfferTitle) dataRow("Offer applied", b.appliedOfferTitle);

  // Large total amount highlight box
  spacer(2);
  const boxH = 18;
  doc.setFillColor(...C.navy);
  doc.roundedRect(LX, y, W - 36, boxH, 3, 3, "F");
  doc.setFillColor(...C.purple);
  doc.roundedRect(LX, y, 4, boxH, 3, 3, "F");
  doc.rect(LX, y, 4, boxH, "F"); // square left edge

  // "TOTAL" label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(140, 150, 190);
  doc.text("TOTAL AMOUNT", LX + 10, y + 6.5);

  // Amount value
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...C.purple2);
  doc.text(mad(b.totalAmount), LX + 10, y + 15);

  // Payment status badge (right side of box)
  const paid = b.isPaid;
  const badgeColor = paid ? C.s_confirmed : C.s_rejected;
  const badgeLabel = paid ? "PAID" : "UNPAID";
  const bW = 24;
  doc.setFillColor(...badgeColor.map((c) => Math.round(c * 0.15 + 5)));
  doc.roundedRect(RX - bW, y + 4, bW, 10, 2, 2, "F");
  doc.setDrawColor(...badgeColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(RX - bW, y + 4, bW, 10, 2, 2, "S");
  doc.setTextColor(...badgeColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(badgeLabel, RX - bW / 2, y + 10.5, { align: "center" });

  y += boxH + 5;
  if (paid && b.paidAt) {
    dataRow("Paid on", fmtFull(b.paidAt));
  }
  spacer(2);
  sectionDivider();

  // ── DOCUMENTS section (if any) ────────────────────────────────────────
  if (b.documents?.length) {
    sectionHeader("Attached Documents", "");
    b.documents.forEach((d, i) => {
      dataRow(`${i + 1}. ${d.name}`, d.fileType?.toUpperCase() || "FILE");
    });
    spacer(2);
    sectionDivider();
  }

  // ── FOOTER ────────────────────────────────────────────────────────────
  const footerY = H - 18;
  doc.setFillColor(...C.navy);
  doc.rect(0, footerY - 4, W, 22, "F");
  doc.setFillColor(...C.purple);
  doc.rect(0, footerY - 4, W, 1.5, "F");

  // Logo in footer — centered "Goo" + italic "voiture"
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  const gooWF    = doc.getTextWidth("Goo");
  const voitureW = doc.getTextWidth("voiture"); // same size, close enough
  const totalLogoW = gooWF + voitureW;
  const logoStartX = W / 2 - totalLogoW / 2;
  doc.setTextColor(...C.white);
  doc.text("Goo", logoStartX, footerY + 4);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...C.purple2);
  doc.text("voiture", logoStartX + gooWF, footerY + 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text(`Generated on ${fmtFull(new Date())}  ·  Car Rental Platform`, W / 2, footerY + 10, { align: "center" });

  doc.save(`booking_${b._id.slice(-8)}.pdf`);
}

/* ─── styles ──────────────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  .obl { background:#09090f; min-height:100vh; padding:40px 36px; box-sizing:border-box; font-family:'DM Mono',monospace; color:#e8e8f0; }

  /* ── header ── */
  .obl-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:32px; }
  .obl-heading { font-family:'Syne',sans-serif; font-size:30px; font-weight:800; letter-spacing:-.04em; color:#e8e8f0; margin:0 0 4px; }
  .obl-sub { color:#3a3a52; font-size:12px; margin:0; }
  .obl-export-row { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }

  /* ── export buttons ── */
  .obl-exp-btn { display:inline-flex; align-items:center; gap:7px; padding:9px 16px; border-radius:10px; font-family:'DM Mono',monospace; font-size:11px; font-weight:500; letter-spacing:.05em; cursor:pointer; border:1px solid; transition:all .2s; white-space:nowrap; }
  .obl-exp-csv  { background:rgba(42,245,192,.08); border-color:rgba(42,245,192,.25); color:#2af5c0; }
  .obl-exp-csv:hover  { background:rgba(42,245,192,.16); box-shadow:0 0 16px rgba(42,245,192,.12); }

  /* ── stat cards ── */
  .obl-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px; margin-bottom:28px; }
  .obl-stat { background:#111118; border:1px solid rgba(255,255,255,.07); border-radius:16px; padding:18px 20px; position:relative; overflow:hidden; }
  .obl-stat::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; border-radius:2px 2px 0 0; }
  .obl-stat.total::before    { background:rgba(255,255,255,.12); }
  .obl-stat.pending::before  { background:#fbbf24; }
  .obl-stat.confirmed::before{ background:#4ade80; }
  .obl-stat.expired::before  { background:#94a3b8; }
  .obl-stat.completed::before{ background:#7c6cfc; }
  .obl-stat.revenue::before  { background:linear-gradient(90deg,#7c6cfc,#2af5c0); }
  .obl-stat-icon { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
  .obl-stat-val  { font-family:'Syne',sans-serif; font-size:24px; font-weight:800; line-height:1; margin-bottom:5px; }
  .obl-stat-lbl  { font-size:9px; letter-spacing:.1em; text-transform:uppercase; color:#3a3a52; }

  /* ── toolbar ── */
  .obl-toolbar { display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin-bottom:20px; }
  .obl-search-wrap { flex:1; min-width:200px; position:relative; }
  .obl-search-ico  { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#3a3a52; pointer-events:none; }
  .obl-search { width:100%; padding:9px 12px 9px 36px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:10px; color:#e8e8f0; font-family:'DM Mono',monospace; font-size:12px; outline:none; box-sizing:border-box; transition:border-color .2s; }
  .obl-search:focus { border-color:rgba(124,108,252,.4); }
  .obl-search::placeholder { color:#3a3a52; }

  /* ── filter pills ── */
  .obl-filters { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
  .obl-pill { padding:6px 14px; border-radius:99px; font-size:11px; cursor:pointer; border:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.03); color:#5a5a72; transition:all .2s; font-family:'DM Mono',monospace; }
  .obl-pill:hover { color:#c8c8d8; border-color:rgba(255,255,255,.15); }
  .obl-pill.active { background:rgba(124,108,252,.18); border-color:rgba(124,108,252,.4); color:#c4baff; }

  /* ── table ── */
  .obl-table-wrap { background:#111118; border:1px solid rgba(255,255,255,.07); border-radius:18px; overflow:hidden; }
  .obl-table { width:100%; border-collapse:collapse; }
  .obl-th { text-align:left; font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:#3a3a52; padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.05); white-space:nowrap; background:#0d0d14; }
  .obl-td { padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.04); font-size:12px; vertical-align:middle; }
  .obl-tr:last-child > .obl-td { border-bottom:none; }
  .obl-tr:hover > .obl-td { background:rgba(255,255,255,.015); }
  .obl-tr-new > .obl-td { background: rgba(245,158,11,0.07) !important; box-shadow: inset 3px 0 0 #f59e0b; }

  .obl-car-img { width:44px; height:34px; border-radius:7px; object-fit:cover; border:1px solid rgba(255,255,255,.07); flex-shrink:0; }
  .obl-car-placeholder { width:44px; height:34px; border-radius:7px; background:rgba(124,108,252,.08); border:1px dashed rgba(124,108,252,.2); display:flex; align-items:center; justify-content:center; flex-shrink:0; }
  .obl-car-name { font-family:'Syne',sans-serif; font-size:13px; font-weight:700; color:#e8e8f0; margin:0; letter-spacing:-.02em; }
  .obl-car-city { font-size:10px; color:#3a3a52; margin:2px 0 0; }

  .obl-customer-name    { font-weight:500; color:#c8c8d8; margin:0; }
  .obl-customer-contact { font-size:10px; color:#4a4a62; margin:2px 0 0; }

  .obl-dates-main { color:#c8c8d8; margin:0; }
  .obl-dates-days { font-size:10px; color:#4a4a62; margin:2px 0 0; }

  .obl-total { font-family:'Syne',sans-serif; font-size:14px; font-weight:700; color:#7c6cfc; margin:0; }
  .obl-offer { font-size:10px; color:#fbbf24; margin:2px 0 0; }

  /* ── badges ── */
  .obl-badge { display:inline-flex; align-items:center; gap:5px; font-size:10px; letter-spacing:.06em; text-transform:uppercase; padding:4px 10px; border-radius:99px; white-space:nowrap; border:1px solid; }
  .obl-badge.pending   { background:rgba(251,191,36,.1);  color:#fbbf24; border-color:rgba(251,191,36,.25); }
  .obl-badge.confirmed { background:rgba(74,222,128,.1);  color:#4ade80; border-color:rgba(74,222,128,.25); }
  .obl-badge.expired   { background:rgba(148,163,184,.12); color:#94a3b8; border-color:rgba(148,163,184,.28); }
  .obl-badge.rejected  { background:rgba(248,113,113,.1); color:#f87171; border-color:rgba(248,113,113,.25); }
  .obl-badge.cancelled { background:rgba(148,163,184,.1); color:#94a3b8; border-color:rgba(148,163,184,.25); }
  .obl-badge.completed { background:rgba(124,108,252,.1); color:#a78bfa; border-color:rgba(124,108,252,.25); }

  /* ── pay btn ── */
  .obl-pay-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 11px; border-radius:99px; font-size:10px; letter-spacing:.06em; text-transform:uppercase; cursor:pointer; border:1px solid; transition:all .2s; font-family:'DM Mono',monospace; white-space:nowrap; }
  .obl-pay-btn.paid   { background:rgba(74,222,128,.1);  color:#4ade80; border-color:rgba(74,222,128,.25); }
  .obl-pay-btn.unpaid { background:rgba(255,255,255,.03); color:#6a6a82; border-color:rgba(255,255,255,.1); }
  .obl-pay-btn.paid:hover   { background:rgba(74,222,128,.18); }
  .obl-pay-btn.unpaid:hover { background:rgba(248,113,113,.1); color:#f87171; border-color:rgba(248,113,113,.3); }

  /* ── action btns ── */
  .obl-actions { display:flex; gap:6px; flex-wrap:wrap; }
  .obl-act-btn  { padding:5px 11px; border-radius:8px; font-size:10px; cursor:pointer; border:1px solid transparent; font-family:'DM Mono',monospace; transition:all .2s; white-space:nowrap; }
  .obl-act-btn.confirm  { background:rgba(74,222,128,.1);  color:#4ade80; border-color:rgba(74,222,128,.2); }
  .obl-act-btn.confirm:hover  { background:rgba(74,222,128,.2); }
  .obl-act-btn.reject   { background:rgba(248,113,113,.1); color:#f87171; border-color:rgba(248,113,113,.2); }
  .obl-act-btn.reject:hover   { background:rgba(248,113,113,.2); }
  .obl-act-btn.complete { background:rgba(124,108,252,.1); color:#a78bfa; border-color:rgba(124,108,252,.2); }
  .obl-act-btn.complete:hover { background:rgba(124,108,252,.2); }
  .obl-act-btn:disabled { opacity:.35; cursor:not-allowed; }

  /* ── PDF btn per row ── */
  .obl-pdf-btn { display:inline-flex; align-items:center; gap:5px; padding:5px 10px; border-radius:8px; font-size:10px; cursor:pointer; border:1px solid rgba(124,108,252,.2); background:rgba(124,108,252,.07); color:#7c6cfc; font-family:'DM Mono',monospace; transition:all .2s; white-space:nowrap; }
  .obl-pdf-btn:hover { background:rgba(124,108,252,.15); box-shadow:0 0 14px rgba(124,108,252,.15); }

  /* ── expand row ── */
  .obl-expand-btn { background:none; border:none; cursor:pointer; color:#4a4a62; display:flex; align-items:center; gap:4px; font-family:'DM Mono',monospace; font-size:10px; padding:5px 8px; border-radius:6px; transition:all .2s; }
  .obl-expand-btn:hover { color:#7c6cfc; background:rgba(124,108,252,.08); }
  .obl-expand-btn.open  { color:#7c6cfc; }

  .obl-detail-row > .obl-detail-td { padding:0; border-bottom:1px solid rgba(255,255,255,.05); }
  .obl-detail-panel { background:#0d0d14; padding:24px 28px; display:grid; grid-template-columns:1fr 1fr; gap:28px; }
  @media (max-width:700px) { .obl-detail-panel { grid-template-columns:1fr; } }

  .obl-panel-title { font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:#3a3a52; margin:0 0 12px; }
  .obl-panel-label { font-size:11px; color:#5a5a72; margin-bottom:5px; display:block; }

  .obl-photo-tabs  { display:flex; gap:8px; margin-bottom:12px; }
  .obl-ptab { flex:1; padding:7px; border-radius:8px; font-size:10px; cursor:pointer; border:1px solid rgba(255,255,255,.07); background:rgba(255,255,255,.03); color:#5a5a72; transition:all .2s; font-family:'DM Mono',monospace; text-align:center; }
  .obl-ptab.before { background:rgba(74,222,128,.08); border-color:rgba(74,222,128,.25); color:#4ade80; }
  .obl-ptab.after  { background:rgba(248,113,113,.08); border-color:rgba(248,113,113,.25); color:#f87171; }

  .obl-photo-grid  { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; }
  .obl-photo-thumb { position:relative; width:72px; height:72px; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,.07); }
  .obl-photo-thumb img { width:100%; height:100%; object-fit:cover; }
  .obl-photo-rm  { position:absolute; top:2px; right:2px; background:rgba(0,0,0,.8); border:none; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#f87171; padding:0; }
  .obl-photo-add { width:72px; height:72px; border-radius:8px; border:1px dashed rgba(124,108,252,.25); background:rgba(124,108,252,.05); display:flex; align-items:center; justify-content:center; cursor:pointer; color:#7c6cfc; transition:all .2s; }
  .obl-photo-add:hover { background:rgba(124,108,252,.12); }

  .obl-docs-list { display:flex; flex-direction:column; gap:7px; margin-bottom:10px; }
  .obl-doc-item  { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.05); border-radius:8px; padding:8px 12px; }
  .obl-doc-name  { flex:1; font-size:11px; color:#c8c8d8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .obl-doc-type  { font-size:9px; color:#3a3a52; text-transform:uppercase; }
  .obl-doc-view  { color:#7c6cfc; text-decoration:none; font-size:10px; white-space:nowrap; }
  .obl-doc-view:hover { text-decoration:underline; }
  .obl-doc-rm    { background:none; border:none; cursor:pointer; color:#f87171; padding:2px; display:flex; }
  .obl-doc-upload-row { display:flex; gap:8px; align-items:flex-end; }
  .obl-doc-upload-row > div { flex:1; }
  .obl-panel-input { width:100%; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:8px; color:#e8e8f0; font-family:'DM Mono',monospace; font-size:12px; padding:8px 12px; box-sizing:border-box; outline:none; transition:border-color .2s; }
  .obl-panel-input:focus { border-color:#7c6cfc; }
  .obl-media-save-btn { margin-top:14px; grid-column:1/-1; width:100%; padding:10px; background:linear-gradient(135deg,#7c6cfc,#9b8cff); border:none; border-radius:10px; color:#fff; font-family:'Syne',sans-serif; font-size:13px; font-weight:700; cursor:pointer; transition:opacity .2s; }
  .obl-media-save-btn:disabled { opacity:.45; cursor:not-allowed; }
  .obl-media-saved { font-size:11px; color:#4ade80; margin-top:8px; grid-column:1/-1; text-align:center; }

  /* ── Customer feedback modal ── */
  .fbk-overlay {
    position:fixed;inset:0;z-index:900;
    background:rgba(0,0,0,.72);
    backdrop-filter:blur(6px);
    display:flex;align-items:center;justify-content:center;
    padding:20px;
  }
  .fbk-modal {
    background:#111118;
    border:1px solid rgba(255,255,255,.1);
    border-radius:20px;
    width:100%;max-width:480px;
    max-height:90vh;overflow-y:auto;
    box-shadow:0 24px 64px rgba(0,0,0,.6);
    animation:fbk-in .2s ease;
  }
  @keyframes fbk-in{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
  .fbk-head {
    padding:22px 24px 16px;
    border-bottom:1px solid rgba(255,255,255,.06);
    display:flex;align-items:flex-start;justify-content:space-between;gap:12px;
  }
  .fbk-title { font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:#e8e8f0;margin:0 0 3px; }
  .fbk-sub   { font-size:11px;color:#3a3a52;margin:0; }
  .fbk-close {
    background:none;border:none;cursor:pointer;color:#3a3a52;
    padding:4px;border-radius:6px;transition:color .15s;flex-shrink:0;
  }
  .fbk-close:hover{color:#e8e8f0;}
  .fbk-body { padding:20px 24px; display:flex;flex-direction:column;gap:16px; }

  /* Overall big toggle */
  .fbk-overall { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
  .fbk-big-btn {
    padding:14px 10px;border-radius:14px;border:1.5px solid rgba(255,255,255,.08);
    background:rgba(255,255,255,.03);cursor:pointer;
    font-family:'Syne',sans-serif;font-size:15px;font-weight:800;
    color:#5a5a72;transition:all .2s;text-align:center;
  }
  .fbk-big-btn.good.active { background:rgba(74,222,128,.12);border-color:rgba(74,222,128,.4);color:#4ade80; }
  .fbk-big-btn.bad.active  { background:rgba(248,113,113,.12);border-color:rgba(248,113,113,.4);color:#f87171; }
  .fbk-big-btn:not(.active):hover { border-color:rgba(255,255,255,.18);color:#c8c8d8; }
  .fbk-big-icon { font-size:22px;display:block;margin-bottom:4px; }

  /* Yes/No question row */
  .fbk-q { display:flex;align-items:center;justify-content:space-between;gap:12px; }
  .fbk-q-label { font-size:13px;color:#c8c8d8;flex:1; }
  .fbk-q-label small { display:block;font-size:10px;color:#3a3a52;margin-top:2px; }
  .fbk-toggle-row { display:flex;gap:6px;flex-shrink:0; }
  .fbk-tog {
    padding:6px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.08);
    background:rgba(255,255,255,.03);cursor:pointer;
    font-family:'DM Mono',monospace;font-size:11px;font-weight:500;
    color:#5a5a72;transition:all .18s;white-space:nowrap;
  }
  .fbk-tog:hover:not(.active){ border-color:rgba(255,255,255,.18);color:#c8c8d8; }
  .fbk-tog.yes.active { background:rgba(74,222,128,.1);border-color:rgba(74,222,128,.35);color:#4ade80; }
  .fbk-tog.no.active  { background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.35);color:#f87171; }

  .fbk-divider { height:1px;background:rgba(255,255,255,.05); }

  .fbk-note-label { font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#3a3a52;margin:0 0 8px;display:block; }
  .fbk-note {
    width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
    border-radius:10px;color:#e8e8f0;font-family:'DM Mono',monospace;
    font-size:12px;padding:10px 13px;box-sizing:border-box;
    outline:none;resize:vertical;min-height:72px;transition:border-color .2s;
  }
  .fbk-note:focus{ border-color:#7c6cfc; }
  .fbk-note::placeholder{ color:#3a3a52; }

  .fbk-footer { padding:16px 24px 22px;display:flex;gap:10px;border-top:1px solid rgba(255,255,255,.06); }
  .fbk-submit {
    flex:1;padding:12px;border:none;border-radius:12px;
    background:linear-gradient(135deg,#7c6cfc,#9b8cff);
    color:#fff;font-family:'Syne',sans-serif;font-size:14px;font-weight:800;
    cursor:pointer;transition:opacity .2s;
  }
  .fbk-submit:disabled{ opacity:.4;cursor:not-allowed; }
  .fbk-cancel {
    padding:12px 20px;border-radius:12px;border:1px solid rgba(255,255,255,.1);
    background:none;color:#5a5a72;font-family:'DM Mono',monospace;font-size:12px;
    cursor:pointer;transition:all .2s;
  }
  .fbk-cancel:hover{ border-color:rgba(255,255,255,.2);color:#c8c8d8; }
  .fbk-saved-msg{ font-size:12px;color:#4ade80;margin-top:4px;text-align:center; }

  /* Rate button & badge in table */
  .obl-rate-btn {
    padding:5px 11px;border-radius:8px;font-size:10px;cursor:pointer;
    border:1px solid rgba(124,108,252,.25);background:rgba(124,108,252,.08);
    color:#a78bfa;font-family:'DM Mono',monospace;transition:all .2s;white-space:nowrap;
  }
  .obl-rate-btn:hover{ background:rgba(124,108,252,.18); }
  .obl-rated-badge {
    display:inline-flex;align-items:center;gap:4px;
    padding:4px 9px;border-radius:8px;font-size:10px;
    border:1px solid rgba(74,222,128,.25);background:rgba(74,222,128,.08);
    color:#4ade80;font-family:'DM Mono',monospace;white-space:nowrap;
  }

  .obl-empty { text-align:center; padding:64px 20px; color:#3a3a52; font-size:13px; }
  .obl-loading-spin { width:36px; height:36px; border-radius:50%; border:2px solid rgba(124,108,252,.2); border-top-color:#7c6cfc; animation:obl-spin .85s linear infinite; margin:0 auto 14px; }
  @keyframes obl-spin { to { transform:rotate(360deg); } }

  /* ── pagination ── */
  .obl-pagination { display:flex; gap:6px; justify-content:center; align-items:center; margin-top:24px; flex-wrap:wrap; }
  .obl-page-btn { width:34px; height:34px; border-radius:8px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:#5a5a72; font-family:'DM Mono',monospace; font-size:12px; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; }
  .obl-page-btn:hover { border-color:rgba(124,108,252,.3); color:#c4baff; }
  .obl-page-btn.active { background:rgba(124,108,252,.18); border-color:rgba(124,108,252,.4); color:#c4baff; }

  /* ── responsive ── */
  @media (max-width:900px) {
    .obl { padding:20px 14px 100px; }
    .obl-table-wrap { overflow-x:auto; }
    .obl-table { min-width:900px; }
  }
`;

const STATUS_FILTERS = ["all", "pending", "confirmed", "expired", "completed", "rejected", "cancelled"];
const PAGE_SIZE = 20;

/* ─── media panel ─────────────────────────────────────────────────────── */
function BookingMediaPanel({ booking, onSaved }) {
  const { copy } = useAppLang();
  const tm = copy.ownerBookingsList.media;
  const [photoTab, setPhotoTab] = useState("before");
  const [before, setBefore]   = useState(booking.conditionPhotos?.before || []);
  const [after, setAfter]     = useState(booking.conditionPhotos?.after  || []);
  const [docs, setDocs]       = useState(booking.documents || []);
  const [docName, setDocName] = useState("");
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);

  function openPhotoUpload() {
    if (!window.cloudinary) return;
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", sources: ["local", "camera"], multiple: true, maxFiles: 10, cropping: false },
      (error, result) => {
        if (!error && result?.event === "success") {
          const url = result.info.secure_url;
          if (photoTab === "before") setBefore((p) => [...p, url]);
          else setAfter((p) => [...p, url]);
        }
      }
    );
  }

  function openDocUpload() {
    if (!window.cloudinary) return;
    if (!docName.trim()) { alert(tm.docNameRequired); return; }
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", sources: ["local"], multiple: false, resourceType: "auto", clientAllowedFormats: ["pdf", "jpg", "jpeg", "png", "webp"] },
      (error, result) => {
        if (!error && result?.event === "success") {
          const info = result.info;
          const fileType = info.resource_type === "raw" || info.format === "pdf" ? "pdf" : "image";
          setDocs((p) => [...p, { name: docName.trim(), url: info.secure_url, fileType, uploadedAt: new Date().toISOString() }]);
          setDocName("");
        }
      }
    );
  }

  function removePhoto(tab, idx) {
    if (tab === "before") setBefore((p) => p.filter((_, i) => i !== idx));
    else setAfter((p) => p.filter((_, i) => i !== idx));
  }
  function removeDoc(idx) { setDocs((p) => p.filter((_, i) => i !== idx)); }

  async function handleSave() {
    setSaving(true);
    try {
      const { data } = await updateBookingMedia(booking._id, { conditionPhotos: { before, after }, documents: docs });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved(data);
    } catch { alert(tm.saveFail); }
    finally { setSaving(false); }
  }

  const currentPhotos = photoTab === "before" ? before : after;

  return (
    <div className="obl-detail-panel">
      <div>
        <p className="obl-panel-title">{tm.conditionPhotos}</p>
        <div className="obl-photo-tabs">
          <button className={`obl-ptab${photoTab === "before" ? " before" : ""}`} onClick={() => setPhotoTab("before")}>
            {tm.before} ({before.length})
          </button>
          <button className={`obl-ptab${photoTab === "after" ? " after" : ""}`} onClick={() => setPhotoTab("after")}>
            {tm.after} ({after.length})
          </button>
        </div>
        <div className="obl-photo-grid">
          {currentPhotos.map((url, i) => (
            <div key={i} className="obl-photo-thumb">
              <img src={url} alt="" />
              <button className="obl-photo-rm" onClick={() => removePhoto(photoTab, i)}><X size={9} /></button>
            </div>
          ))}
          <button className="obl-photo-add" onClick={openPhotoUpload}><ImagePlus size={20} /></button>
        </div>
      </div>
      <div>
        <p className="obl-panel-title">{tm.legalDocs}</p>
        {docs.length > 0 && (
          <div className="obl-docs-list">
            {docs.map((doc, i) => (
              <div key={i} className="obl-doc-item">
                <span>{doc.fileType === "pdf" ? "📄" : "🖼️"}</span>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <p className="obl-doc-name">{doc.name}</p>
                  <span className="obl-doc-type">{doc.fileType}</span>
                </div>
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="obl-doc-view">{tm.view}</a>
                <button className="obl-doc-rm" onClick={() => removeDoc(i)}><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
        <div className="obl-doc-upload-row">
          <div>
            <label className="obl-panel-label">{tm.docName}</label>
            <input
              className="obl-panel-input"
              placeholder={tm.docNamePh}
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && openDocUpload()}
            />
          </div>
          <button
            className="obl-act-btn confirm"
            style={{ whiteSpace: "nowrap", alignSelf: "flex-end" }}
            onClick={openDocUpload}
            disabled={!docName.trim()}
          >
            <Upload size={11} style={{ display: "inline", marginRight: 4 }} />{tm.upload}
          </button>
        </div>
      </div>
      <button className="obl-media-save-btn" onClick={handleSave} disabled={saving}>
        {saving ? tm.saving : tm.save}
      </button>
      {saved && <p className="obl-media-saved">{tm.saved}</p>}
    </div>
  );
}

/* ─── customer feedback modal ────────────────────────────────────────── */
function buildQuestions(tq) {
  return [
    { key: "hadDamage",        label: tq.hadDamage,        hint: tq.hadDamageHint,        yesLabel: tq.yes,    noLabel: tq.no,    yesValue: true,  noValue: false, yesClass: "no",  noClass: "yes" },
    { key: "returnedOnTime",   label: tq.returnedOnTime,   hint: null,                    yesLabel: tq.onTime, noLabel: tq.late,  yesValue: true,  noValue: false, yesClass: "yes", noClass: "no"  },
    { key: "carReturnedClean", label: tq.carReturnedClean, hint: tq.carReturnedCleanHint, yesLabel: tq.clean,  noLabel: tq.dirty, yesValue: true,  noValue: false, yesClass: "yes", noClass: "no"  },
    { key: "wasRespectful",    label: tq.wasRespectful,    hint: tq.wasRespectfulHint,    yesLabel: tq.yes,    noLabel: tq.no,    yesValue: true,  noValue: false, yesClass: "yes", noClass: "no"  },
    { key: "wouldRentAgain",   label: tq.wouldRentAgain,   hint: null,                    yesLabel: tq.yes,    noLabel: tq.no,    yesValue: true,  noValue: false, yesClass: "yes", noClass: "no"  },
  ];
}

function CustomerFeedbackModal({ booking, onSaved, onClose }) {
  const { copy, lang } = useAppLang();
  const tf = copy.ownerBookingsList.feedback;
  const QUESTIONS = buildQuestions(tf.questions);
  const [overall, setOverall] = useState(null);
  const [answers, setAnswers] = useState({ hadDamage: null, returnedOnTime: null, carReturnedClean: null, wasRespectful: null, wouldRentAgain: null });
  const [note,    setNote]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeedbackForBooking(booking._id)
      .then(({ data }) => {
        if (data) {
          setOverall(data.overall);
          setAnswers({
            hadDamage:        data.hadDamage,
            returnedOnTime:   data.returnedOnTime,
            carReturnedClean: data.carReturnedClean,
            wasRespectful:    data.wasRespectful,
            wouldRentAgain:   data.wouldRentAgain,
          });
          setNote(data.note || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [booking._id]);

  const allFilled = overall !== null && Object.values(answers).every((v) => v !== null);

  async function handleSubmit() {
    if (!allFilled) return;
    setSaving(true);
    try {
      await submitCustomerFeedback({ bookingId: booking._id, overall, ...answers, note });
      setSaved(true);
      setTimeout(() => { onSaved(booking._id); }, 900);
    } catch (e) {
      alert(e?.response?.data?.message || tf.saveFail);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fbk-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fbk-modal">
        {/* header */}
        <div className="fbk-head">
          <div>
            <p className="fbk-title">{tf.title}</p>
            <p className="fbk-sub">
              {booking.customerId?.name || tf.fallbackName} · {fmt(booking.startDate, lang)} → {fmt(booking.endDate, lang)}
            </p>
          </div>
          <button className="fbk-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div className="obl-loading-spin" style={{ margin: "0 auto" }} />
          </div>
        ) : (
          <>
            <div className="fbk-body">
              {/* Overall rating */}
              <div>
                <span className="fbk-note-label" style={{ marginBottom: 10 }}>{tf.overall}</span>
                <div className="fbk-overall">
                  <button
                    className={`fbk-big-btn good${overall === "good" ? " active" : ""}`}
                    onClick={() => setOverall("good")}
                  >
                    <span className="fbk-big-icon">👍</span>
                    {tf.good}
                  </button>
                  <button
                    className={`fbk-big-btn bad${overall === "bad" ? " active" : ""}`}
                    onClick={() => setOverall("bad")}
                  >
                    <span className="fbk-big-icon">👎</span>
                    {tf.bad}
                  </button>
                </div>
              </div>

              <div className="fbk-divider" />

              {/* Yes / No questions */}
              {QUESTIONS.map(({ key, label, hint, yesLabel, noLabel, yesValue, noValue, yesClass, noClass }) => (
                <div key={key} className="fbk-q">
                  <div className="fbk-q-label">
                    {label}
                    {hint && <small>{hint}</small>}
                  </div>
                  <div className="fbk-toggle-row">
                    <button
                      className={`fbk-tog ${yesClass}${answers[key] === yesValue ? " active" : ""}`}
                      onClick={() => setAnswers((p) => ({ ...p, [key]: yesValue }))}
                    >
                      {yesLabel}
                    </button>
                    <button
                      className={`fbk-tog ${noClass}${answers[key] === noValue ? " active" : ""}`}
                      onClick={() => setAnswers((p) => ({ ...p, [key]: noValue }))}
                    >
                      {noLabel}
                    </button>
                  </div>
                </div>
              ))}

              <div className="fbk-divider" />

              {/* Optional note */}
              <div>
                <span className="fbk-note-label">{tf.notesLabel} <span style={{ color: "#3a3a52", fontWeight: 400 }}>{tf.optional}</span></span>
                <textarea
                  className="fbk-note"
                  placeholder={tf.notesPh}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={500}
                />
              </div>

              {saved && <p className="fbk-saved-msg">{tf.saved}</p>}
            </div>

            <div className="fbk-footer">
              <button className="fbk-cancel" onClick={onClose}>{tf.cancel}</button>
              <button className="fbk-submit" onClick={handleSubmit} disabled={saving || !allFilled || saved}>
                {saved ? tf.savedShort : saving ? tf.saving : tf.submit}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── main page ───────────────────────────────────────────────────────── */
export default function OwnerBookingsList() {
  const { copy, lang } = useAppLang();
  const t = copy.ownerBookingsList;
  const numLocale = lang === "fr" ? "fr-FR" : "en-US";
  // Server-provided paginated bookings for the current page
  const [bookings,  setBookings]  = useState([]);
  // Server-provided aggregate stats (always over ALL bookings, not just current page)
  const [stats,     setStats]     = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    expired: 0,
    completed: 0,
    revenue: 0,
    newPending: 0,
  });
  const [totalPages, setTotalPages] = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [filter,    setFilter]    = useState("all");
  const [search,    setSearch]    = useState("");
  const [acting,    setActing]    = useState(null);
  const [expanded,  setExpanded]  = useState(null);
  const [page,      setPage]      = useState(1);

  // Feedback modal
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [ratedBookings,   setRatedBookings]   = useState(new Set());

  // Trust passport modal
  const [trustUserId, setTrustUserId] = useState(null);

  useEffect(() => { load(page, filter); }, [page, filter]);

  async function load(p, f) {
    setLoading(true);
    try {
      const { data } = await getOwnerBookings({ page: p, limit: PAGE_SIZE, status: f });
      setBookings(data.bookings || []);
      setStats(data.stats || {
        total: 0,
        pending: 0,
        confirmed: 0,
        expired: 0,
        completed: 0,
        revenue: 0,
        newPending: 0,
      });
      setTotalPages(data.pages || 0);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id, status) {
    setActing(id);
    try {
      await updateBookingStatus(id, status);
      // Reload current page so stats refresh too
      load(page, filter);
    } catch (e) { alert(e?.response?.data?.message || t.actFail); }
    finally { setActing(null); }
  }

  async function acknowledgeBookingChange(id) {
    setActing(id);
    try {
      const { data } = await ownerAckBookingAlert(id);
      setBookings((p) => p.map((b) => (b._id === id ? { ...b, ...data } : b)));
    } catch (e) {
      alert(e?.response?.data?.message || t.actFail);
    } finally {
      setActing(null);
    }
  }

  async function togglePaid(id) {
    setActing(id);
    try {
      const { data } = await markBookingPaid(id);
      setBookings((p) => p.map((b) => b._id === id ? { ...b, isPaid: data.isPaid, paidAt: data.paidAt } : b));
    } catch { alert(t.paymentFail); }
    finally { setActing(null); }
  }

  function handleMediaSaved(updated) {
    setBookings((p) => p.map((b) => b._id === updated._id ? { ...b, conditionPhotos: updated.conditionPhotos, documents: updated.documents } : b));
  }

  // Client-side search within the current page's loaded data
  const visible = bookings.filter((b) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.rentalId?.title?.toLowerCase().includes(q) ||
      b.customerId?.name?.toLowerCase().includes(q) ||
      b.customerId?.phone?.includes(q) ||
      b.customerId?.email?.toLowerCase().includes(q) ||
      b._id.includes(q)
    );
  });

  // Destructure server stats for header cards
  const { total, pending, confirmed, expired, completed, revenue, newPending } = stats;

  function handleFilterChange(f) { setFilter(f); setPage(1); }
  function handleSearch(e)       { setSearch(e.target.value); }

  return (
    <OwnerLayout>
      <style>{STYLES}</style>
      <div className="obl">

        {/* ── header ── */}
        <div className="obl-header">
          <div>
            <h1 className="obl-heading">{t.title}</h1>
            <p className="obl-sub">{t.sub}</p>
          </div>
          <div className="obl-export-row">
            <button className="obl-exp-btn obl-exp-csv" onClick={() => exportCSV(visible)} title={t.exportCSVTitle}>
              <FileSpreadsheet size={14} />
              {t.exportCSV}
            </button>
          </div>
        </div>

        {/* ── stat cards ── */}
        <div className="obl-stats">
          <div className="obl-stat total">
            <div className="obl-stat-icon" style={{ background: "rgba(255,255,255,.06)" }}>
              <FileText size={16} color="#8a8a9e" />
            </div>
            <div className="obl-stat-val">{total}</div>
            <div className="obl-stat-lbl">{t.stats.total}</div>
          </div>
          <div className="obl-stat pending">
            <div className="obl-stat-icon" style={{ background: "rgba(251,191,36,.1)" }}>
              <Clock size={16} color="#fbbf24" />
            </div>
            <div className="obl-stat-val" style={{ color: "#fbbf24", display: "flex", alignItems: "center", gap: 6 }}>
              {pending}
              {(newPending ?? 0) > 0 ? (
                <span style={{ fontSize: 11, fontWeight: 800, background: "#f59e0b", color: "#111", borderRadius: 6, padding: "2px 6px" }}>
                  +{newPending}
                </span>
              ) : null}
            </div>
            <div className="obl-stat-lbl">{t.stats.pending}</div>
          </div>
          <div className="obl-stat confirmed">
            <div className="obl-stat-icon" style={{ background: "rgba(74,222,128,.1)" }}>
              <CheckCircle2 size={16} color="#4ade80" />
            </div>
            <div className="obl-stat-val" style={{ color: "#4ade80" }}>{confirmed}</div>
            <div className="obl-stat-lbl">{t.stats.confirmed}</div>
          </div>
          <div className="obl-stat expired">
            <div className="obl-stat-icon" style={{ background: "rgba(148,163,184,.12)" }}>
              <Clock size={16} color="#94a3b8" />
            </div>
            <div className="obl-stat-val" style={{ color: "#94a3b8" }}>{expired ?? 0}</div>
            <div className="obl-stat-lbl">{t.stats.expired}</div>
          </div>
          <div className="obl-stat completed">
            <div className="obl-stat-icon" style={{ background: "rgba(124,108,252,.12)" }}>
              <Star size={16} color="#a78bfa" />
            </div>
            <div className="obl-stat-val" style={{ color: "#a78bfa" }}>{completed}</div>
            <div className="obl-stat-lbl">{t.stats.completed}</div>
          </div>
          <div className="obl-stat revenue">
            <div className="obl-stat-icon" style={{ background: "rgba(42,245,192,.08)" }}>
              <AlertCircle size={16} color="#2af5c0" />
            </div>
            <div className="obl-stat-val" style={{ color: "#2af5c0", fontSize: 18 }}>{revenue.toLocaleString(numLocale)} MAD</div>
            <div className="obl-stat-lbl">{t.stats.revenue}</div>
          </div>
        </div>

        {/* ── toolbar ── */}
        <div className="obl-toolbar">
          <div className="obl-search-wrap">
            <Search size={14} className="obl-search-ico" />
            <input
              className="obl-search"
              placeholder={t.searchPh}
              value={search}
              onChange={handleSearch}
            />
          </div>
        </div>

        {/* ── filter pills — counts come from server stats (always total, not paged) ── */}
        <div className="obl-filters">
          {STATUS_FILTERS.map((s) => {
            const count = s === "all" ? stats.total : (stats[s] ?? 0);
            return (
              <button
                key={s}
                className={`obl-pill${filter === s ? " active" : ""}`}
                onClick={() => handleFilterChange(s)}
              >
                {`${t.filters[s] || s} (${count})`}
              </button>
            );
          })}
        </div>

        {/* ── content ── */}
        {loading ? (
          <div className="obl-empty">
            <div className="obl-loading-spin" />
            {t.loading}
          </div>
        ) : visible.length === 0 ? (
          <div className="obl-empty">
            {search || filter !== "all" ? t.emptyFiltered : t.empty}
          </div>
        ) : (
          <>
            <div className="obl-table-wrap">
              <table className="obl-table">
                <thead>
                  <tr>
                    <th className="obl-th">{t.th.car}</th>
                    <th className="obl-th">{t.th.customer}</th>
                    <th className="obl-th">{t.th.bookedOn}</th>
                    <th className="obl-th">{t.th.period}</th>
                    <th className="obl-th">{t.th.total}</th>
                    <th className="obl-th">{t.th.status}</th>
                    <th className="obl-th">{t.th.payment}</th>
                    <th className="obl-th">{t.th.actions}</th>
                    <th className="obl-th">{t.th.pdf}</th>
                    <th className="obl-th">{t.th.files}</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((b) => {
                    const days   = daysDiff(b.startDate, b.endDate);
                    const busy   = acting === b._id;
                    const isOpen = expanded === b._id;
                    const photoCount = (b.conditionPhotos?.before?.length || 0) + (b.conditionPhotos?.after?.length || 0);
                    const docCount   = b.documents?.length || 0;
                    const carImg     = b.rentalId?.images?.[0];

                    return (
                      <>
                        <tr key={b._id} className={`obl-tr${(b.status === "pending" && (b.ownerBookingAlertAt || b.isNewForOwner)) || (b.ownerBookingAlertAt && ["confirmed", "expired", "cancelled"].includes(b.status)) ? " obl-tr-new" : ""}`}>
                          {/* car */}
                          <td className="obl-td">
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {carImg
                                ? <img src={carImg} alt="" className="obl-car-img" />
                                : <div className="obl-car-placeholder"><FileText size={16} color="#7c6cfc" /></div>}
                              <div>
                                <p className="obl-car-name">{b.rentalId?.title || t.none}</p>
                                <p className="obl-car-city">{b.rentalId?.city}</p>
                              </div>
                            </div>
                          </td>
                          {/* customer */}
                          <td className="obl-td">
                            <p className="obl-customer-name">{b.customerId?.name || t.none}</p>
                            <p className="obl-customer-contact">{b.customerId?.phone || b.customerId?.email || t.none}</p>
                            {b.customerId?._id && (
                              <button
                                type="button"
                                className="obl-expand-btn"
                                style={{ marginTop: 4, padding: "2px 7px", fontSize: 9 }}
                                onClick={() => setTrustUserId(b.customerId._id)}
                              >
                                🛡 Confiance
                              </button>
                            )}
                          </td>
                          {/* booked on */}
                          <td className="obl-td" style={{ color: "#4a4a62", fontSize: 11 }}>{fmt(b.createdAt, lang)}</td>
                          {/* period */}
                          <td className="obl-td">
                            <p className="obl-dates-main">{fmt(b.startDate, lang)} → {fmt(b.endDate, lang)}</p>
                            <p className="obl-dates-days">{days} {days > 1 ? t.dayMany : t.dayOne}</p>
                          </td>
                          {/* total */}
                          <td className="obl-td">
                            <p className="obl-total">{b.totalAmount != null ? mad(b.totalAmount, lang) : t.none}</p>
                            {b.appliedOfferTitle && <p className="obl-offer">🏷 {b.appliedOfferTitle}</p>}
                          </td>
                          {/* status */}
                          <td className="obl-td">
                            <span className={`obl-badge ${b.status}`}>{t.status[b.status] || b.status}</span>
                          </td>
                          {/* payment */}
                          <td className="obl-td">
                            <button
                              className={`obl-pay-btn ${b.isPaid ? "paid" : "unpaid"}`}
                              onClick={() => togglePaid(b._id)}
                              disabled={busy}
                            >
                              {b.isPaid ? t.payPaid : t.payUnpaid}
                            </button>
                            {b.isPaid && b.paidAt && (
                              <p style={{ fontSize: 9, color: "#3a3a52", marginTop: 3 }}>{fmt(b.paidAt, lang)}</p>
                            )}
                          </td>
                          {/* actions */}
                          <td className="obl-td">
                            <div className="obl-actions">
                              {b.ownerBookingAlertAt && ["confirmed", "expired", "cancelled"].includes(b.status) && (
                                <button
                                  type="button"
                                  className="obl-act-btn confirm"
                                  disabled={busy}
                                  onClick={() => acknowledgeBookingChange(b._id)}
                                >
                                  {t.ackReviewed}
                                </button>
                              )}
                              {b.status === "pending" && (
                                <>
                                  <button className="obl-act-btn confirm" disabled={busy} onClick={() => changeStatus(b._id, "confirmed")}>{t.confirm}</button>
                                  <button className="obl-act-btn reject"  disabled={busy} onClick={() => changeStatus(b._id, "rejected")}>{t.reject}</button>
                                </>
                              )}
                              {(b.status === "confirmed" || b.status === "expired") && (
                                <button className="obl-act-btn complete" disabled={busy} onClick={() => changeStatus(b._id, "completed")}>{t.complete}</button>
                              )}
                              {b.status === "completed" && (
                                ratedBookings.has(b._id)
                                  ? <span className="obl-rated-badge">{t.reviewed}</span>
                                  : <button className="obl-rate-btn" onClick={() => setFeedbackBooking(b)}>{t.rateCustomer}</button>
                              )}
                              {["rejected", "cancelled"].includes(b.status) && (
                                <span style={{ fontSize: 10, color: "#3a3a52" }}>{t.none}</span>
                              )}
                            </div>
                          </td>
                          {/* PDF */}
                          <td className="obl-td">
                            <button className="obl-pdf-btn" onClick={() => exportBookingPDF(b)} title={t.pdfTitle}>
                              <FileDown size={12} />
                              {t.pdfBtn}
                            </button>
                          </td>
                          {/* files expand */}
                          <td className="obl-td">
                            <button
                              type="button"
                              className={`obl-expand-btn${isOpen ? " open" : ""}`}
                              onClick={() => {
                                setExpanded(!isOpen ? b._id : null);
                              }}
                            >
                              {photoCount + docCount > 0 && (
                                <span style={{ color: "#fbbf24", marginRight: 2 }}>{photoCount + docCount}</span>
                              )}
                              {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr key={`${b._id}-detail`} className="obl-detail-row">
                            <td className="obl-detail-td" colSpan={10}>
                              <BookingMediaPanel booking={b} onSaved={handleMediaSaved} />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* server-side pagination */}
            {totalPages > 1 && (
              <div className="obl-pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`obl-page-btn${page === p ? " active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {/* ── Renter trust passport modal ── */}
      {trustUserId && (
        <div className="fbk-overlay" onClick={(e) => e.target === e.currentTarget && setTrustUserId(null)}>
          <div className="fbk-modal" style={{ maxWidth: 400 }}>
            <div className="fbk-head">
              <div>
                <p className="fbk-title">Profil de confiance</p>
                <p className="fbk-sub">Score de confiance du locataire</p>
              </div>
              <button className="fbk-close" onClick={() => setTrustUserId(null)}>
                <span style={{ fontSize: 18 }}>✕</span>
              </button>
            </div>
            <div style={{ padding: "20px 24px 24px" }}>
              <RenterTrustPassport userId={trustUserId} />
            </div>
          </div>
        </div>
      )}

      {/* ── Customer feedback modal ── */}
      {feedbackBooking && (
        <CustomerFeedbackModal
          booking={feedbackBooking}
          onSaved={(bookingId) => {
            setRatedBookings((prev) => new Set([...prev, bookingId]));
            setFeedbackBooking(null);
          }}
          onClose={() => setFeedbackBooking(null)}
        />
      )}
    </OwnerLayout>
  );
}
