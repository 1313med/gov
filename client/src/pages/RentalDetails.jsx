import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import { useAppLang } from "../context/AppLangContext";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Poppins:wght@500;600;700&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  .rd {
    --bg: #f5f5f7; --s1: #ffffff; --s2: #f0f0f5;
    --border: rgba(0,0,0,0.08); --txt: #0f0f14; --muted: #888899;
    --violet: #7c6bff; --violet-bg: rgba(124,107,255,0.10); --violet-bd: rgba(124,107,255,0.28);
    --ok: #0d9668; --ok-bg: rgba(13,150,104,0.1);
    --err: #c42b2b; --err-bg: rgba(196,43,43,0.08);
    --shadow: 0 2px 16px rgba(0,0,0,.06), 0 0 0 1px rgba(0,0,0,.04);
    --head: 'Poppins', sans-serif; --body: 'Outfit', sans-serif; --mono: 'DM Mono', monospace;
    min-height: 100vh; background: var(--bg); color: var(--txt);
    font-family: var(--body); padding-bottom: 48px;
  }
  .rd.dark {
    --bg: #09090f; --s1: #111118; --s2: #16161f;
    --border: rgba(255,255,255,0.08); --txt: #e8e8f0; --muted: #7a7a92;
    --violet: #8b7cff; --violet-bg: rgba(139,124,255,0.14); --violet-bd: rgba(139,124,255,0.35);
    --ok: #3dd4a8; --ok-bg: rgba(61,212,168,0.12);
    --err: #ff7a7a; --err-bg: rgba(255,122,122,0.1);
    --shadow: 0 8px 32px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.06);
  }
  .rd-bar {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 12px 20px; background: var(--s1); border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
  }
  .rd-back {
    display: inline-flex; align-items: center; gap: 8px;
    font-family: var(--mono); font-size: 11px; letter-spacing: .06em; text-transform: uppercase;
    color: var(--muted); text-decoration: none; transition: color .2s;
  }
  .rd-back:hover { color: var(--violet); }
  .rd-back svg { width: 16px; height: 16px; }
  .rd-theme {
    display: flex; align-items: center; gap: 8px;
    background: var(--s2); border: 1px solid var(--border); border-radius: 999px;
    padding: 6px 12px 6px 8px; cursor: pointer; font-family: var(--mono); font-size: 10px;
    letter-spacing: .06em; color: var(--muted); transition: all .2s;
  }
  .rd-theme:hover { border-color: var(--violet); color: var(--violet); background: var(--violet-bg); }
  .rd-track { width: 32px; height: 18px; border-radius: 999px; background: var(--s2); border: 1px solid var(--border); position: relative; }
  .rd.dark .rd-track { background: var(--violet); border-color: var(--violet); }
  .rd-thumb { position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%; background: var(--muted); transition: transform .2s; }
  .rd.dark .rd-thumb { transform: translateX(14px); background: #fff; }
  .rd-icon { width: 12px; height: 12px; display: flex; }
  .rd-icon svg { width: 100%; height: 100%; }

  .rd-inner { max-width: 1200px; margin: 0 auto; padding: 28px 20px 0; }
  .rd-grid { display: grid; grid-template-columns: 1fr; gap: 28px; }
  @media (min-width: 1024px) { .rd-grid { grid-template-columns: 1.65fr 1fr; gap: 32px; align-items: start; } }

  .rd-card { background: var(--s1); border: 1px solid var(--border); border-radius: 18px; box-shadow: var(--shadow); overflow: hidden; }
  .rd-hero-img { width: 100%; height: min(52vh, 440px); object-fit: cover; display: block; }
  .rd-hero-empty { height: min(40vh, 320px); display: flex; align-items: center; justify-content: center; font-family: var(--mono); font-size: 13px; color: var(--muted); }
  .rd-thumbs { display: flex; gap: 10px; padding: 14px; overflow-x: auto; border-top: 1px solid var(--border); }
  .rd-mini {
    flex-shrink: 0; width: 88px; height: 64px; object-fit: cover; border-radius: 10px; cursor: pointer;
    border: 2px solid transparent; transition: border-color .2s, opacity .2s;
  }
  .rd-mini:hover { opacity: .9; }
  .rd-mini.on { border-color: var(--violet); }

  .rd-specs { padding: 24px 22px 26px; }
  .rd-h2 { font-family: var(--head); font-size: 18px; font-weight: 600; letter-spacing: -.02em; margin: 0 0 18px; }
  .rd-spec-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  @media (min-width: 640px) { .rd-spec-grid { grid-template-columns: repeat(3, 1fr); } }
  .rd-spec {
    padding: 14px 14px; border-radius: 12px; border: 1px solid var(--border); background: var(--s2);
  }
  .rd-spec-lbl { font-family: var(--mono); font-size: 9px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .rd-spec-val { font-size: 15px; font-weight: 500; }

  .rd-side { display: flex; flex-direction: column; gap: 20px; }
  .rd-title-card { padding: 22px; }
  .rd-kicker { font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--violet); margin-bottom: 8px; }
  .rd-title { font-family: var(--head); font-size: clamp(22px, 2.5vw, 28px); font-weight: 600; letter-spacing: -.03em; line-height: 1.15; margin: 0 0 12px; }
  .rd-price { font-family: var(--mono); font-size: 26px; font-weight: 600; color: var(--violet); letter-spacing: -.02em; }
  .rd-price small { font-size: 13px; font-weight: 500; color: var(--muted); margin-left: 6px; }

  .rd-book { padding: 22px; }
  .rd-book-h { font-family: var(--head); font-size: 16px; font-weight: 600; margin: 0 0 16px; letter-spacing: -.02em; }
  .rd-cal-wrap {
    --rdp-accent-color: var(--violet);
    --rdp-background-color: var(--s2);
    --rdp-outline: 0;
    border-radius: 14px; border: 1px solid var(--border); padding: 12px; background: var(--s2);
    margin-bottom: 16px;
  }
  .rd-cal-wrap .rdp-root { margin: 0 auto; }
  .rd-cal-wrap .rdp-day_button { border-radius: 8px; font-family: var(--body); }
  .rd-cal-wrap .rdp-selected { font-weight: 600; }

  .rd-summary {
    border: 1px solid var(--border); border-radius: 14px; padding: 16px; background: var(--s2); margin-bottom: 16px;
  }
  .rd-sum-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--muted); margin-bottom: 8px; }
  .rd-sum-row strong { color: var(--txt); font-weight: 500; }
  .rd-sum-total { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 10px; border-top: 1px solid var(--border); font-family: var(--head); font-size: 17px; font-weight: 600; }

  .rd-msg { padding: 14px 16px; border-radius: 12px; font-size: 13px; line-height: 1.5; margin-bottom: 14px; }
  .rd-msg.ok { background: var(--ok-bg); color: var(--ok); border: 1px solid rgba(13,150,104,0.2); }
  .rd-msg.err { background: var(--err-bg); color: var(--err); border: 1px solid rgba(196,43,43,0.15); }
  .rd-msg a { color: var(--violet); font-weight: 600; text-decoration: none; border-bottom: 1px solid var(--violet-bd); }

  .rd-btn {
    width: 100%; padding: 15px; border: none; border-radius: 12px; cursor: pointer;
    font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
    background: var(--violet); color: #fff; transition: transform .2s, box-shadow .2s, opacity .2s;
  }
  .rd-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(124,107,255,.35); }
  .rd-btn:disabled { opacity: .45; cursor: not-allowed; }

  .rd-skel { animation: rd-pulse 1.2s ease-in-out infinite; }
  @keyframes rd-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .55; } }
  .rd-skel-box { height: min(52vh, 440px); background: var(--s2); border-radius: 18px; border: 1px solid var(--border); }
  .rd-err-page { min-height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; }
  .rd-err-page p { font-family: var(--mono); font-size: 13px; color: var(--err); margin-bottom: 16px; }
`;

const ICONS = {
  moon: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 3.8a8.7 8.7 0 1 0 5.7 13.9 9 9 0 0 1-5.7-13.9Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  sun: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M12 2.8v2.1M12 19.1v2.1M21.2 12h-2.1M4.9 12H2.8M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
};

export default function RentalDetails() {
  const { copy } = useAppLang();
  const { id } = useParams();

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);

  const [range, setRange] = useState();

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);

  const [bookedDates, setBookedDates] = useState([]);

  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("rental-details-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  });

  const startDate = range?.from;
  const endDate = range?.to;

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;

    const diff =
      (endDate.getTime() - startDate.getTime()) /
      (1000 * 60 * 60 * 24);

    return diff > 0 ? diff : 0;
  };

  const days = calculateDays();

  const totalPrice =
    rental && days > 0 ? days * rental.pricePerDay : 0;

  useEffect(() => {
    localStorage.setItem("rental-details-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const loadRental = async () => {
      try {
        const res = await api.get(`/rental/${id}`);
        setRental(res.data);

        const bookingsRes = await api.get(`/rental/${id}/bookings`);

        const confirmed = bookingsRes.data.filter(
          (b) => b.status === "confirmed"
        );

        setBookedDates(
          confirmed.map((b) => ({
            from: new Date(b.startDate),
            to: new Date(b.endDate),
          }))
        );
      } catch {
        setRental(null);
      } finally {
        setLoading(false);
      }
    };

    loadRental();
  }, [id]);

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setBookingMessage({
        type: "error",
        code: "dates",
        text: copy.rentalDetails.selectDatesError,
      });
      return;
    }

    try {
      setBookingLoading(true);

      await api.post(`/rental/${id}/book`, {
        startDate,
        endDate,
      });

      setBookingMessage({
        type: "success",
        text: copy.rentalDetails.bookSuccess,
      });

      setRange(undefined);

    } catch (err) {

      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setBookingMessage({
          type: "error",
          code: "auth",
          text: copy.rentalDetails.needAuth,
        });
        return;
      }

      setBookingMessage({
        type: "error",
        text:
          err?.response?.data?.message ||
          copy.rentalDetails.datesFail,
      });

    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rd">
        <style>{STYLES}</style>
        <div className="rd-bar">
          <Link to="/rentals" className="rd-back">
            {ICONS.arrow}
            {copy.rentalDetails.backShort}
          </Link>
        </div>
        <div className="rd-inner">
          <div className="rd-skel rd-skel-box" />
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className={`rd${dark ? " dark" : ""}`}>
        <style>{STYLES}</style>
        <header className="rd-bar">
          <Link to="/rentals" className="rd-back">
            {ICONS.arrow}
            {copy.rentalDetails.backLong}
          </Link>
          <button type="button" className="rd-theme" onClick={() => setDark((d) => !d)}>
            <span className="rd-icon">{dark ? ICONS.sun : ICONS.moon}</span>
            <span>{dark ? copy.rentalDetails.themeLight : copy.rentalDetails.themeDark}</span>
            <span className="rd-track">
              <span className="rd-thumb" />
            </span>
          </button>
        </header>
        <div className="rd-err-page">
          <p>{copy.rentalDetails.notFound}</p>
          <Link to="/rentals" className="rd-back" style={{ color: "var(--violet)" }}>
            {copy.rentalDetails.browse}
          </Link>
        </div>
      </div>
    );
  }

  const images = rental.images || [];

  return (
    <div className={`rd${dark ? " dark" : ""}`}>
      <style>{STYLES}</style>

      <header className="rd-bar">
        <Link to="/rentals" className="rd-back">
          {ICONS.arrow}
          {copy.rentalDetails.backLong}
        </Link>
        <button type="button" className="rd-theme" onClick={() => setDark((d) => !d)}>
          <span className="rd-icon">{dark ? ICONS.sun : ICONS.moon}</span>
          <span>{dark ? copy.rentalDetails.themeLight : copy.rentalDetails.themeDark}</span>
          <span className="rd-track">
            <span className="rd-thumb" />
          </span>
        </button>
      </header>

      <div className="rd-inner">
        <div className="rd-grid">
          <div>
            <div className="rd-card">
              {images.length > 0 ? (
                <img
                  src={images[activeImage]}
                  className="rd-hero-img"
                  alt={rental.title}
                />
              ) : (
                <div className="rd-hero-empty">{copy.rentalDetails.noImage}</div>
              )}
              {images.length > 1 && (
                <div className="rd-thumbs">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      style={{ padding: 0, border: "none", background: "none", cursor: "pointer" }}
                    >
                      <img
                        src={img}
                        alt=""
                        className={`rd-mini${index === activeImage ? " on" : ""}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="rd-card rd-specs" style={{ marginTop: 24 }}>
              <h2 className="rd-h2">{copy.rentalDetails.specifications}</h2>
              <div className="rd-spec-grid">
                <Spec label={copy.rentalDetails.brand} value={rental.brand} />
                <Spec label={copy.rentalDetails.model} value={rental.model} />
                <Spec label={copy.rentalDetails.year} value={rental.year} />
                <Spec label={copy.rentalDetails.fuel} value={rental.fuel} />
                <Spec label={copy.rentalDetails.gearbox} value={rental.gearbox} />
                <Spec label={copy.rentalDetails.city} value={rental.city} />
              </div>
            </div>
          </div>

          <aside className="rd-side">
            <div className="rd-card rd-title-card">
              <p className="rd-kicker">{copy.rentalDetails.kicker}</p>
              <h1 className="rd-title">{rental.title}</h1>
              <p className="rd-price">
                {Number(rental.pricePerDay).toLocaleString()}
                <small>MAD {copy.rentals.perDay}</small>
              </p>
            </div>

            <div className="rd-card rd-book">
              <h2 className="rd-book-h">{copy.rentalDetails.selectDates}</h2>

              <div className="rd-cal-wrap">
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={setRange}
                  disabled={[
                    { before: new Date() },
                    ...bookedDates,
                  ]}
                />
              </div>

              {days > 0 && (
                <div className="rd-summary">
                  <div className="rd-sum-row">
                    <span>{copy.rentalDetails.pricePerDay}</span>
                    <strong>{Number(rental.pricePerDay).toLocaleString()} MAD</strong>
                  </div>
                  <div className="rd-sum-row">
                    <span>{copy.rentalDetails.days}</span>
                    <strong>{days}</strong>
                  </div>
                  <div className="rd-sum-total">
                    <span>{copy.rentalDetails.total}</span>
                    <span>{Number(totalPrice).toLocaleString()} MAD</span>
                  </div>
                </div>
              )}

              {bookingMessage && (
                <div
                  className={`rd-msg ${bookingMessage.type === "success" ? "ok" : "err"}`}
                >
                  <p style={{ margin: 0 }}>{bookingMessage.text}</p>
                  {bookingMessage.code === "auth" && (
                    <p style={{ margin: "10px 0 0" }}>
                      <Link to="/login">{copy.rentalDetails.logIn}</Link>
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleBooking}
                disabled={bookingLoading || days === 0}
                className="rd-btn"
              >
                {bookingLoading ? copy.rentalDetails.booking : copy.rentalDetails.bookNow}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="rd-spec">
      <p className="rd-spec-lbl">{label}</p>
      <p className="rd-spec-val">{value ?? "—"}</p>
    </div>
  );
}
