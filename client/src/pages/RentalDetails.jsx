import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Flag, MessageCircle, Tag } from "lucide-react";
import { api } from "../api/axios";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";
import { loadAuth } from "../utils/authStorage";
import { getRentalFavorites, addRentalFavorite, removeRentalFavorite } from "../api/user";
import ReviewSection from "../components/ReviewSection";
import MapView from "../components/MapView";
import SimilarListings from "../components/SimilarListings";
import ReportListingModal from "../components/ReportListingModal";
import ListingDetailAmbient from "../components/listing/ListingDetailAmbient";
import ListingGallery from "../components/listing/ListingGallery";
import ListingSpecGrid from "../components/listing/ListingSpecGrid";
import RentalBookingCalendar from "../components/listing/RentalBookingCalendar";
import "../styles/listing-detail.css";

export default function RentalDetails() {
  const { copy, lang } = useAppLang();
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = loadAuth();
  const { dark, toggle: toggleTheme } = useTheme();

  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [range, setRange] = useState();
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  const startDate = range?.from;
  const endDate = range?.to;

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  const days = calculateDays();
  const basePrice = rental && days > 0 ? days * rental.pricePerDay : 0;

  const applicableOffers = rental
    ? (rental.offers || []).filter((o) => o.isActive && days >= (o.minDays || 1))
    : [];

  let bestDiscount = 0;
  let appliedOffer = null;
  for (const o of applicableOffers) {
    let saving = 0;
    if (o.type === "free_days") saving = (o.freeExtraDays || 0) * (rental?.pricePerDay || 0);
    else if (o.type === "percent_discount") saving = basePrice * ((o.discountPercent || 0) / 100);
    if (saving > bestDiscount) {
      bestDiscount = saving;
      appliedOffer = o;
    }
  }

  const totalPrice = Math.max(0, basePrice - bestDiscount);

  useEffect(() => {
    const loadRental = async () => {
      try {
        const res = await api.get(`/rental/${id}`);
        const rentalData = res.data;
        setRental(rentalData);
        api.post(`/rental/${id}/record-view`).catch(() => {});

        if (rentalData.availability?.length) {
          setBlockedDates(
            rentalData.availability.map((r) => ({
              from: new Date(r.startDate),
              to: new Date(r.endDate),
            }))
          );
        }

        const bookingsRes = await api.get(`/rental/${id}/bookings`);
        const confirmed = bookingsRes.data.filter((b) => b.status === "confirmed");
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

  useEffect(() => {
    if (!auth?._id || !id) return;
    getRentalFavorites()
      .then((res) => {
        const ids = (Array.isArray(res.data) ? res.data : []).map((x) => x._id);
        setIsFav(ids.includes(id));
      })
      .catch(() => {});
  }, [auth?._id, id]);

  const toggleFav = async () => {
    if (!auth?._id) {
      navigate("/login");
      return;
    }
    try {
      if (isFav) {
        await removeRentalFavorite(id);
        setIsFav(false);
      } else {
        await addRentalFavorite(id);
        setIsFav(true);
      }
    } catch {
      /* ignore */
    }
  };

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setBookingMessage({
        type: "error",
        code: "dates",
        text: copy.rentalDetails.selectDatesError,
      });
      return;
    }

    const rangeOverlapsBlocked = blockedDates.some((b) => startDate < b.to && endDate > b.from);
    if (rangeOverlapsBlocked) {
      setBookingMessage({
        type: "error",
        text: "This car is not available on the selected dates. Please choose different dates.",
      });
      return;
    }

    try {
      setBookingLoading(true);
      await api.post(`/rental/${id}/book`, { startDate, endDate });
      setBookingMessage({ type: "success", text: copy.rentalDetails.bookSuccess });
      setRange(undefined);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setBookingMessage({ type: "error", code: "auth", text: copy.rentalDetails.needAuth });
        return;
      }
      const code = err?.response?.data?.code;
      if (code === "BOOKING_DOCUMENTS_REQUIRED" || code === "DRIVER_LICENSE_REQUIRED") {
        setBookingMessage({
          type: "error",
          code: "documents",
          text: err?.response?.data?.message || copy.rentalDetails.datesFail,
        });
        return;
      }
      setBookingMessage({
        type: "error",
        text: err?.response?.data?.message || copy.rentalDetails.datesFail,
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const pageClass = `ld-page${dark ? "" : " light"}`;

  if (loading) {
    return (
      <div className={pageClass}>
        <ListingDetailAmbient />
        <nav className="ld-nav">
          <Link to="/rentals" className="ld-back">
            <ArrowLeft size={16} />
            {copy.rentalDetails.backShort}
          </Link>
        </nav>
        <div className="ld-skel">
          <div className="ld-skel-box" />
        </div>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className={pageClass}>
        <ListingDetailAmbient />
        <nav className="ld-nav">
          <Link to="/rentals" className="ld-back">
            <ArrowLeft size={16} />
            {copy.rentalDetails.backLong}
          </Link>
          <button type="button" className="ld-btn ld-btn-ghost" style={{ width: "auto", padding: "8px 14px" }} onClick={toggleTheme}>
            {dark ? copy.rentalDetails.themeLight : copy.rentalDetails.themeDark}
          </button>
        </nav>
        <div className="ld-state" style={{ color: "#f87171" }}>
          {copy.rentalDetails.notFound}
          <br />
          <Link to="/rentals" className="ld-back" style={{ marginTop: 16, display: "inline-flex" }}>
            {copy.rentalDetails.browse}
          </Link>
        </div>
      </div>
    );
  }

  const images = rental.images || [];
  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);
  const prevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length);

  const specItems = [
    { key: "brand", label: copy.rentalDetails.brand, value: rental.brand },
    { key: "model", label: copy.rentalDetails.model, value: rental.model },
    { key: "year", label: copy.rentalDetails.year, value: rental.year },
    { key: "fuel", label: copy.rentalDetails.fuel, value: rental.fuel },
    { key: "gearbox", label: copy.rentalDetails.gearbox, value: rental.gearbox },
    { key: "city", label: copy.rentalDetails.city, value: rental.city },
  ];

  const activeOffers = (rental.offers || []).filter((o) => o.isActive);

  return (
    <div className={pageClass}>
      <ListingDetailAmbient />

      <nav className="ld-nav">
        <Link to="/rentals" className="ld-back">
          <ArrowLeft size={16} />
          {copy.rentalDetails.backLong}
        </Link>
        <button
          type="button"
          className="ld-btn ld-btn-ghost"
          style={{ width: "auto", padding: "8px 14px" }}
          onClick={toggleTheme}
        >
          {dark ? copy.rentalDetails.themeLight : copy.rentalDetails.themeDark}
        </button>
      </nav>

      <div className="ld-body">
        <div className="ld-main">
          <ListingGallery
            images={images}
            activeIndex={activeImage}
            onSelect={setActiveImage}
            onPrev={prevImage}
            onNext={nextImage}
            emptyLabel={copy.rentalDetails.noImage}
            alt={rental.title}
            showFav={!!auth}
            isFav={isFav}
            onToggleFav={toggleFav}
          />

          <div className="ld-card ld-card-pad ld-reveal" style={{ animationDelay: "60ms" }}>
            <div className="ld-section-label">{copy.rentalDetails.specifications}</div>
            <ListingSpecGrid items={specItems} />
          </div>
        </div>

        <aside className="ld-sidebar">
          <div className="ld-card ld-price-card ld-card-pad ld-reveal" style={{ animationDelay: "40ms" }}>
            <span className="ld-badge ld-badge--rent">
              <span className="ld-badge-dot" />
              {copy.rentalDetails.kicker}
            </span>
            <h1 className="ld-title">{rental.title}</h1>
            <div className="ld-price-row">
              <span className="ld-price">{Number(rental.pricePerDay).toLocaleString()}</span>
              <span className="ld-price-unit">MAD {copy.rentals.perDay}</span>
            </div>
          </div>

          {activeOffers.length > 0 && (
            <div className="ld-card ld-card-pad ld-reveal" style={{ animationDelay: "70ms" }}>
              <div className="ld-section-label">Offres spéciales</div>
              <div className="ld-offers">
                {activeOffers.map((o, i) => (
                  <div key={i} className="ld-offer">
                    <Tag size={18} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p className="ld-offer-title">{o.title}</p>
                      <p className="ld-offer-desc">
                        {o.type === "free_days" &&
                          `Réservez ${o.minDays}+ jours → ${o.freeExtraDays} jour${o.freeExtraDays > 1 ? "s" : ""} offert${o.freeExtraDays > 1 ? "s" : ""}`}
                        {o.type === "percent_discount" &&
                          `Réservez ${o.minDays}+ jours → ${o.discountPercent}% de réduction`}
                        {o.type === "custom" && (o.description || "")}
                        {o.type !== "custom" && o.description ? ` · ${o.description}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="ld-card ld-card-pad ld-reveal" style={{ animationDelay: "90ms" }}>
            <h2 className="ld-book-title">{copy.rentalDetails.selectDates}</h2>

            <RentalBookingCalendar
              range={range}
              onSelect={setRange}
              disabled={[{ before: new Date() }, ...bookedDates, ...blockedDates]}
              lang={lang}
              labels={{
                from: lang === "fr" ? "Départ" : "Pick-up",
                to: lang === "fr" ? "Retour" : "Return",
                pickStart: lang === "fr" ? "Choisir…" : "Select…",
                pickEnd: lang === "fr" ? "Choisir…" : "Select…",
                selected: lang === "fr" ? "Sélection" : "Selected",
                today: lang === "fr" ? "Aujourd'hui" : "Today",
                unavailable: lang === "fr" ? "Indisponible" : "Unavailable",
              }}
            />

            {days > 0 && (
              <div className="ld-summary">
                <div className="ld-sum-row">
                  <span>{copy.rentalDetails.pricePerDay}</span>
                  <strong>{Number(rental.pricePerDay).toLocaleString()} MAD</strong>
                </div>
                <div className="ld-sum-row">
                  <span>{copy.rentalDetails.days}</span>
                  <strong>{days}</strong>
                </div>
                {appliedOffer && bestDiscount > 0 && (
                  <>
                    <div className="ld-sum-row">
                      <span>Sous-total</span>
                      <strong style={{ textDecoration: "line-through", opacity: 0.5 }}>
                        {Number(basePrice).toLocaleString()} MAD
                      </strong>
                    </div>
                    <div className="ld-discount">
                      <span>{appliedOffer.title}</span>
                      <span>−{Number(bestDiscount).toLocaleString()} MAD</span>
                    </div>
                  </>
                )}
                <div className="ld-sum-total">
                  <span>{copy.rentalDetails.total}</span>
                  <span style={appliedOffer ? { color: "#4ade80" } : undefined}>
                    {Number(totalPrice).toLocaleString()} MAD
                  </span>
                </div>
              </div>
            )}

            {bookingMessage && (
              <div className={`ld-msg ${bookingMessage.type === "success" ? "ok" : "err"}`}>
                <p style={{ margin: 0 }}>{bookingMessage.text}</p>
                {bookingMessage.code === "auth" && (
                  <p style={{ margin: "10px 0 0" }}>
                    <Link to="/login">{copy.rentalDetails.logIn}</Link>
                  </p>
                )}
                {bookingMessage.code === "documents" && (
                  <p style={{ margin: "10px 0 0" }}>
                    <Link to="/profile">{copy.rentalDetails.documentsGoProfile}</Link>
                  </p>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleBooking}
              disabled={bookingLoading || days === 0}
              className="ld-btn ld-btn-violet"
            >
              {bookingLoading ? copy.rentalDetails.booking : copy.rentalDetails.bookNow}
            </button>

            {auth?._id && rental?.rentalOwnerId && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/messages?with=${rental.rentalOwnerId._id || rental.rentalOwnerId}&listing=${rental._id}&model=RentalListing`
                  )
                }
                className="ld-btn ld-btn-ghost"
              >
                <MessageCircle size={16} />
                Message owner
              </button>
            )}

            {auth?._id && (
              <button type="button" onClick={() => setShowReport(true)} className="ld-btn ld-btn-danger">
                <Flag size={16} />
                Signaler l&apos;annonce
              </button>
            )}
          </div>
        </aside>
      </div>

      <div className="ld-footer">
        <MapView city={rental.city} label={`${rental.title} — ${rental.city}`} />
        <ReviewSection targetModel="RentalListing" targetId={rental._id} />
        <SimilarListings listing={rental} type="rental" />
      </div>

      {showReport && (
        <ReportListingModal listingId={rental._id} listingModel="RentalListing" onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
