"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { clientApi, loadClientAuth } from "@/lib/clientApi";

type DateRange = { start: string; end: string };

type Props = {
  listingId: string;
  pricePerDay: number;
  ownerId?: string;
  ownerName?: string;
  lang?: "fr" | "en" | "ar";
};

const COPY = {
  fr: {
    bookTitle: "Réserver ce véhicule",
    fav: "Favoris",
    favOn: "Enregistré",
    favOff: "Ajouter aux favoris",
    start: "Date de départ",
    end: "Date de retour",
    days: "jours",
    total: "Total estimé",
    book: "Demander la réservation",
    booking: "Envoi en cours…",
    message: "Contacter le loueur",
    login: "Connectez-vous pour réserver",
    loginLink: "Se connecter",
    selectDates: "Choisissez vos dates de location.",
    bookSuccess: "Demande envoyée ! Le loueur vous confirmera sous peu.",
    needAuth: "Connectez-vous pour réserver.",
    documents: "Documents requis — complétez votre CIN et permis.",
    documentsLink: "Compléter mes documents",
    perDay: "MAD / jour",
  },
  en: {
    bookTitle: "Book this vehicle",
    fav: "Saved",
    favOn: "Saved",
    favOff: "Add to favorites",
    start: "Pick-up date",
    end: "Return date",
    days: "days",
    total: "Estimated total",
    book: "Request booking",
    booking: "Sending…",
    message: "Contact owner",
    login: "Sign in to book",
    loginLink: "Sign in",
    selectDates: "Select your rental dates.",
    bookSuccess: "Request sent! The owner will confirm shortly.",
    needAuth: "Please sign in to book.",
    documents: "Documents required — complete your ID and license.",
    documentsLink: "Complete my documents",
    perDay: "MAD / day",
  },
};

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const a = new Date(start);
  const b = new Date(end);
  const diff = (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 ? Math.ceil(diff) : 0;
}

export default function RentalListingActions({ listingId, pricePerDay, ownerId, ownerName, lang = "fr" }: Props) {
  const t = COPY[lang === "en" ? "en" : "fr"];
  const [auth, setAuth] = useState<{ _id?: string } | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [range, setRange] = useState<DateRange>({ start: "", end: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string; code?: string } | null>(null);

  const refreshAuth = useCallback(() => setAuth(loadClientAuth()), []);

  useEffect(() => {
    refreshAuth();
    const onAuth = () => refreshAuth();
    window.addEventListener("goovoiture-auth", onAuth);
    clientApi(`/rental/${listingId}/record-view`, { method: "POST" }).catch(() => {});
    return () => window.removeEventListener("goovoiture-auth", onAuth);
  }, [listingId, refreshAuth]);

  useEffect(() => {
    if (!auth?._id) return;
    clientApi<unknown[]>("/user/rental-favorites")
      .then((list) => {
        const ids = (Array.isArray(list) ? list : []).map((x) => String((x as { _id?: string })._id || x));
        setIsFav(ids.includes(listingId));
      })
      .catch(() => {});
  }, [auth?._id, listingId]);

  const days = useMemo(() => daysBetween(range.start, range.end), [range]);
  const total = days > 0 ? days * pricePerDay : 0;

  const toggleFav = async () => {
    if (!auth?._id) {
      window.location.href = "/login";
      return;
    }
    try {
      if (isFav) {
        await clientApi(`/user/rental-favorites/${listingId}`, { method: "DELETE" });
        setIsFav(false);
      } else {
        await clientApi(`/user/rental-favorites/${listingId}`, { method: "POST" });
        setIsFav(true);
      }
    } catch {
      /* ignore */
    }
  };

  const handleBook = async () => {
    if (!range.start || !range.end) {
      setMsg({ type: "err", text: t.selectDates });
      return;
    }
    if (!auth?._id) {
      setMsg({ type: "err", text: t.needAuth, code: "auth" });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await clientApi(`/rental/${listingId}/book`, {
        method: "POST",
        body: { startDate: range.start, endDate: range.end },
      });
      setMsg({ type: "ok", text: t.bookSuccess });
      setRange({ start: "", end: "" });
    } catch (err: unknown) {
      const e = err as { status?: number; code?: string; message?: string };
      if (e.status === 401 || e.status === 403) {
        setMsg({ type: "err", text: t.needAuth, code: "auth" });
      } else if (e.code === "BOOKING_DOCUMENTS_REQUIRED" || e.code === "DRIVER_LICENSE_REQUIRED") {
        setMsg({ type: "err", text: t.documents, code: "documents" });
      } else {
        setMsg({ type: "err", text: e.message || t.selectDates });
      }
    } finally {
      setLoading(false);
    }
  };

  const messageHref = ownerId
    ? `/messages?with=${ownerId}&listing=${listingId}&model=RentalListing`
    : "/messages";

  return (
    <section className="gv-listing-actions gv-sec-sm" aria-label={t.bookTitle}>
      <div className="gv-card gv-card-static p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="text-xl font-bold font-[family-name:var(--gv-disp)] text-[var(--gv-ink)]">{t.bookTitle}</h2>
          <button type="button" onClick={toggleFav} className="gv-btn gv-btn-outline text-sm">
            {isFav ? `♥ ${t.favOn}` : `♡ ${t.favOff}`}
          </button>
        </div>

        {ownerName ? (
          <p className="text-sm text-[var(--gv-mut)] mb-4">
            Loueur : <span className="text-[var(--gv-ink)] font-medium">{ownerName}</span>
          </p>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <label className="gv-field">
            <span className="gv-field-label">{t.start}</span>
            <input
              type="date"
              className="gv-input"
              value={range.start}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
            />
          </label>
          <label className="gv-field">
            <span className="gv-field-label">{t.end}</span>
            <input
              type="date"
              className="gv-input"
              value={range.end}
              min={range.start || new Date().toISOString().slice(0, 10)}
              onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
            />
          </label>
        </div>

        {days > 0 ? (
          <div className="gv-price-summary mb-4">
            <p className="text-sm text-[var(--gv-mut)]">
              {days} {t.days} × {Number(pricePerDay).toLocaleString()} {t.perDay}
            </p>
            <p className="text-lg font-bold text-[var(--gv-brand)]">
              {t.total} : {total.toLocaleString()} MAD
            </p>
          </div>
        ) : null}

        {msg ? (
          <div
            className={`gv-alert mb-4 ${msg.type === "ok" ? "gv-alert-ok" : "gv-alert-err"}`}
            role="status"
          >
            {msg.text}
            {msg.code === "auth" ? (
              <a href="/login" className="gv-link ml-2">
                {t.loginLink}
              </a>
            ) : null}
            {msg.code === "documents" ? (
              <a href="/profile-documents" className="gv-link ml-2">
                {t.documentsLink}
              </a>
            ) : null}
          </div>
        ) : null}

        {!auth?._id ? (
          <p className="text-sm text-[var(--gv-mut)] mb-3">
            {t.login}{" "}
            <a href="/login" className="gv-link">
              {t.loginLink}
            </a>
          </p>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            className="gv-btn gv-btn-primary flex-1"
            onClick={handleBook}
            disabled={loading}
          >
            {loading ? t.booking : t.book}
          </button>
          <a href={messageHref} className="gv-btn gv-btn-outline flex-1 text-center">
            {t.message}
          </a>
        </div>
      </div>
    </section>
  );
}
