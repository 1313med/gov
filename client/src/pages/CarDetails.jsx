import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calculator, MessageCircle, Phone, Flag } from "lucide-react";
import { api } from "../api/axios";
import { loadAuth } from "../utils/authStorage";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";
import ReviewSection from "../components/ReviewSection";
import MapView from "../components/MapView";
import FairPriceIndicator from "../components/FairPriceIndicator";
import SellerTrustBadges from "../components/SellerTrustBadges";
import SimilarListings from "../components/SimilarListings";
import ReportListingModal from "../components/ReportListingModal";
import ListingDetailAmbient from "../components/listing/ListingDetailAmbient";
import ListingGallery from "../components/listing/ListingGallery";
import ListingSpecGrid from "../components/listing/ListingSpecGrid";
import "../styles/listing-detail.css";

export default function CarDetails() {
  const { copy } = useAppLang();
  const { dark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const auth = loadAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/sale/${id}`);
        setCar(res.data);
        setActiveImage(0);
      } catch {
        setCar(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const pageClass = `ld-page${dark ? "" : " light"}`;

  if (loading) {
    return (
      <div className={pageClass}>
        <ListingDetailAmbient />
        <div className="ld-skel">
          <div className="ld-skel-box" />
          <p className="ld-state" style={{ minHeight: "auto", marginTop: 24 }}>
            {copy.carDetails.loading}
          </p>
        </div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className={pageClass}>
        <ListingDetailAmbient />
        <div className="ld-state" style={{ color: "#f87171" }}>
          {copy.carDetails.notFound}
        </div>
      </div>
    );
  }

  const seller = car.sellerId;
  const images = car.images || [];
  const nextImage = () => setActiveImage((i) => (i + 1) % images.length);
  const prevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length);

  const specItems = [
    { key: "brand", label: copy.carDetails.brand, value: car.brand },
    { key: "model", label: copy.carDetails.model, value: car.model },
    { key: "year", label: copy.carDetails.year, value: car.year },
    {
      key: "mileage",
      label: copy.carDetails.mileage,
      value: car.mileage ? `${Number(car.mileage).toLocaleString()} ${copy.carDetails.km}` : null,
    },
    { key: "fuel", label: copy.carDetails.fuel, value: car.fuel },
    { key: "gearbox", label: copy.carDetails.gearbox, value: car.gearbox },
    { key: "city", label: copy.carDetails.city, value: car.city },
  ];

  return (
    <div className={pageClass}>
      <ListingDetailAmbient />

      <div className="ld-nav">
        <Link to="/cars" className="ld-back">
          <ArrowLeft size={16} />
          {copy.carDetails.back}
        </Link>
      </div>

      <div className="ld-body">
        <div className="ld-main">
          <ListingGallery
            images={images}
            activeIndex={activeImage}
            onSelect={setActiveImage}
            onPrev={prevImage}
            onNext={nextImage}
            emptyLabel={copy.carDetails.noImage}
            alt={car.title}
          />

          <div className="ld-card ld-card-pad ld-reveal" style={{ animationDelay: "60ms" }}>
            <div className="ld-section-label">{copy.carDetails.specifications}</div>
            <ListingSpecGrid items={specItems} />
          </div>

          <div className="ld-card ld-card-pad ld-reveal" style={{ animationDelay: "100ms" }}>
            <div className="ld-section-label">{copy.carDetails.description}</div>
            <p className="ld-desc">{car.description || copy.carDetails.noDesc}</p>
          </div>
        </div>

        <aside className="ld-sidebar">
          <div className="ld-card ld-price-card ld-card-pad ld-reveal" style={{ animationDelay: "40ms" }}>
            <span className="ld-badge">
              <span className="ld-badge-dot" />
              {copy.carDetails.approved}
            </span>
            <h1 className="ld-title">{car.title}</h1>
            <div className="ld-price-row">
              <span className="ld-price">{Number(car.price).toLocaleString()}</span>
              <span className="ld-price-unit">MAD</span>
            </div>
          </div>

          <FairPriceIndicator listing={car} elite />

          <Link
            to={`/afford-car?brand=${encodeURIComponent(car.brand || "")}&model=${encodeURIComponent(car.model || "")}&year=${car.year || ""}&price=${car.price || ""}&fuel=${encodeURIComponent(car.fuel || "")}&city=${encodeURIComponent(car.city || "Casablanca")}`}
            className="ld-afford-link ld-reveal"
            style={{ animationDelay: "100ms" }}
          >
            <Calculator size={20} />
            Puis-je me l&apos;offrir ? — coût mensuel réel au Maroc
          </Link>

          <div className="ld-card ld-card-pad ld-reveal" style={{ animationDelay: "120ms" }}>
            <div className="ld-section-label">{copy.carDetails.seller}</div>
            <Link to={`/seller/${seller?._id}`} className="ld-seller-name">
              {seller?.name || copy.carDetails.unknownSeller}
            </Link>
            <p className="ld-seller-sub">{copy.carDetails.verifiedSeller}</p>
            <div style={{ marginBottom: 16 }}>
              <SellerTrustBadges seller={seller} />
            </div>

            {auth?._id ? (
              <>
                <a href={`tel:${seller?.phone}`} className="ld-btn ld-btn-primary">
                  <Phone size={16} />
                  {copy.carDetails.callSeller}
                </a>
                <a
                  href={`https://wa.me/${seller?.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ld-btn ld-btn-wa"
                >
                  {copy.carDetails.whatsapp}
                </a>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/messages?with=${seller?._id}&listing=${car._id}&model=SaleListing`)
                  }
                  className="ld-btn ld-btn-ghost"
                >
                  <MessageCircle size={16} />
                  Message seller
                </button>
                <button type="button" onClick={() => setShowReport(true)} className="ld-btn ld-btn-danger">
                  <Flag size={16} />
                  Signaler l&apos;annonce
                </button>
              </>
            ) : (
              <div className="ld-login-nudge">
                <p>
                  <Link to="/login">{copy.carDetails.signInContact}</Link> {copy.carDetails.signInContactRest}
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="ld-footer">
        <MapView city={car.city} label={`${car.title} — ${car.city}`} />
        <ReviewSection targetModel="SaleListing" targetId={car._id} />
        <SimilarListings listing={car} type="sale" />
      </div>

      {showReport && (
        <ReportListingModal listingId={car._id} listingModel="SaleListing" onClose={() => setShowReport(false)} />
      )}
    </div>
  );
}
