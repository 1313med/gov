"use client";

import { useCallback, useEffect, useState } from "react";
import { clientApi, loadClientAuth } from "@/lib/clientApi";

type Props = {
  listingId: string;
  sellerId?: string;
  sellerName?: string;
  price?: number;
  lang?: "fr" | "en" | "ar";
};

const COPY = {
  fr: {
    contactTitle: "Contacter le vendeur",
    favOn: "Enregistré",
    favOff: "Ajouter aux favoris",
    message: "Envoyer un message",
    login: "Connectez-vous pour contacter le vendeur",
    loginLink: "Se connecter",
    report: "Signaler l'annonce",
    reportSent: "Signalement envoyé. Merci.",
    reportFail: "Échec du signalement.",
    seller: "Vendeur",
    priceLabel: "Prix affiché",
    mad: "MAD",
  },
  en: {
    contactTitle: "Contact seller",
    favOn: "Saved",
    favOff: "Add to favorites",
    message: "Send a message",
    login: "Sign in to contact the seller",
    loginLink: "Sign in",
    report: "Report listing",
    reportSent: "Report submitted. Thank you.",
    reportFail: "Report failed.",
    seller: "Seller",
    priceLabel: "Listed price",
    mad: "MAD",
  },
};

const REPORT_REASONS = [
  { value: "fake_listing", label: "Annonce frauduleuse" },
  { value: "wrong_price", label: "Prix incorrect" },
  { value: "scam", label: "Arnaque suspectée" },
  { value: "other", label: "Autre" },
];

export default function SaleListingActions({ listingId, sellerId, sellerName, price, lang = "fr" }: Props) {
  const t = COPY[lang === "en" ? "en" : "fr"];
  const [auth, setAuth] = useState<{ _id?: string } | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState("other");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMsg, setReportMsg] = useState<string | null>(null);

  const refreshAuth = useCallback(() => setAuth(loadClientAuth()), []);

  useEffect(() => {
    refreshAuth();
    const onAuth = () => refreshAuth();
    window.addEventListener("goovoiture-auth", onAuth);
    return () => window.removeEventListener("goovoiture-auth", onAuth);
  }, [refreshAuth]);

  useEffect(() => {
    if (!auth?._id) return;
    clientApi<unknown[]>("/user/favorites")
      .then((list) => {
        const ids = (Array.isArray(list) ? list : []).map((x) => String((x as { _id?: string })._id || x));
        setIsFav(ids.includes(listingId));
      })
      .catch(() => {});
  }, [auth?._id, listingId]);

  const toggleFav = async () => {
    if (!auth?._id) {
      window.location.href = "/login";
      return;
    }
    try {
      if (isFav) {
        await clientApi(`/user/favorites/${listingId}`, { method: "DELETE" });
        setIsFav(false);
      } else {
        await clientApi(`/user/favorites/${listingId}`, { method: "POST" });
        setIsFav(true);
      }
    } catch {
      /* ignore */
    }
  };

  const messageHref = sellerId
    ? `/messages?with=${sellerId}&listing=${listingId}&model=SaleListing`
    : "/messages";

  const submitReport = async () => {
    if (!auth?._id) {
      window.location.href = "/login";
      return;
    }
    setReportLoading(true);
    setReportMsg(null);
    try {
      await clientApi("/reports", {
        method: "POST",
        body: { listingId, listingModel: "SaleListing", reason },
      });
      setReportMsg(t.reportSent);
      setShowReport(false);
    } catch {
      setReportMsg(t.reportFail);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <section className="gv-listing-actions gv-sec-sm" aria-label={t.contactTitle}>
      <div className="gv-card gv-card-static p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold font-[family-name:var(--gv-disp)] text-[var(--gv-ink)]">{t.contactTitle}</h2>
          <button type="button" onClick={toggleFav} className="gv-btn gv-btn-outline text-sm">
            {isFav ? `♥ ${t.favOn}` : `♡ ${t.favOff}`}
          </button>
        </div>

        {sellerName ? (
          <p className="text-sm text-[var(--gv-mut)] mb-2">
            {t.seller} : <span className="text-[var(--gv-ink)] font-medium">{sellerName}</span>
          </p>
        ) : null}

        {price ? (
          <p className="text-2xl font-bold text-[var(--gv-brand)] mb-4">
            {Number(price).toLocaleString()} {t.mad}
          </p>
        ) : null}

        {!auth?._id ? (
          <p className="text-sm text-[var(--gv-mut)] mb-4">
            {t.login}{" "}
            <a href="/login" className="gv-link">
              {t.loginLink}
            </a>
          </p>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <a href={messageHref} className="gv-btn gv-btn-primary flex-1 text-center">
            {t.message}
          </a>
          <button type="button" className="gv-btn gv-btn-outline flex-1" onClick={() => setShowReport((v) => !v)}>
            {t.report}
          </button>
        </div>

        {showReport ? (
          <div className="mt-4 pt-4 border-t border-[var(--gv-bdr)]">
            <label className="gv-field mb-3">
              <span className="gv-field-label">Motif</span>
              <select className="gv-input" value={reason} onChange={(e) => setReason(e.target.value)}>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="gv-btn gv-btn-primary w-full"
              onClick={submitReport}
              disabled={reportLoading}
            >
              {reportLoading ? "…" : t.report}
            </button>
          </div>
        ) : null}

        {reportMsg ? (
          <p className="text-sm text-[var(--gv-mut)] mt-3" role="status">
            {reportMsg}
          </p>
        ) : null}
      </div>
    </section>
  );
}
