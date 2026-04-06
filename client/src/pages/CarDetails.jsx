import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import { loadAuth } from "../utils/authStorage";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .cd {
    --bg:     #f9f7f4;
    --bg2:    #f2efe9;
    --card:   #ffffff;
    --card2:  #f5f3ef;
    --line:   rgba(0,0,0,0.08);
    --line2:  rgba(0,0,0,0.05);
    --ink:    #141412;
    --ink2:   #2d2d28;
    --ghost:  #888880;
    --dim:    #c0bdb4;
    --acc:    #3d3af5;
    --acc-bg: rgba(61,58,245,0.07);
    --acc-bd: rgba(61,58,245,0.18);
    --green:  #0c9966;
    --green-bg: rgba(12,153,102,0.08);
    --green-bd: rgba(12,153,102,0.22);
    --serif:  'Playfair Display', Georgia, serif;
    --sans:   'DM Sans', sans-serif;
    --mono:   'DM Mono', monospace;

    min-height: 100vh;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--sans);
  }

  /* ── NAV BAR ── */
  .cd-nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
    background: rgba(249,247,244,.9);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--line);
  }
  .cd-nav-logo {
    font-family: var(--serif); font-size: 17px; font-weight: 700;
    letter-spacing: -.02em; color: var(--ink); text-decoration: none;
  }
  .cd-nav-logo em { font-style: italic; color: var(--acc); }
  .cd-back {
    font-family: var(--mono); font-size: 10px; letter-spacing: .1em;
    text-transform: uppercase; color: var(--ghost);
    text-decoration: none; display: flex; align-items: center; gap: 6px;
    transition: color .2s, gap .2s;
  }
  .cd-back:hover { color: var(--acc); gap: 10px; }

  /* ── MAIN LAYOUT ── */
  .cd-body {
    max-width: 1240px; margin: 0 auto;
    padding: 48px 40px 80px;
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 32px;
    align-items: start;
  }

  /* ── LEFT COLUMN ── */
  .cd-left { display: flex; flex-direction: column; gap: 20px; }

  /* Carousel */
  .cd-carousel {
    position: relative;
    border-radius: 20px; overflow: hidden;
    background: var(--card2);
    aspect-ratio: 16/9;
  }
  .cd-carousel-img {
    width: 100%; height: 100%; object-fit: cover;
    transition: opacity .3s;
  }
  .cd-carousel-none {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 12px; color: var(--dim);
    letter-spacing: .06em;
  }
  /* Gradient bottom overlay */
  .cd-carousel::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 80px;
    background: linear-gradient(to top, rgba(249,247,244,.6) 0%, transparent 100%);
    pointer-events: none; z-index: 1;
  }
  /* Arrows */
  .cd-arr {
    position: absolute; top: 50%; transform: translateY(-50%); z-index: 2;
    width: 40px; height: 40px; border-radius: 50%;
    background: rgba(255,255,255,.85); backdrop-filter: blur(8px);
    border: 1px solid rgba(0,0,0,.08);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 16px; color: var(--ink);
    transition: background .2s, transform .2s, box-shadow .2s;
  }
  .cd-arr:hover {
    background: #fff; box-shadow: 0 4px 16px rgba(0,0,0,.12);
    transform: translateY(-50%) scale(1.08);
  }
  .cd-arr-prev { left: 14px; }
  .cd-arr-next { right: 14px; }
  /* Image counter */
  .cd-counter {
    position: absolute; bottom: 14px; right: 14px; z-index: 2;
    font-family: var(--mono); font-size: 10px; letter-spacing: .1em;
    background: rgba(20,20,18,.55); backdrop-filter: blur(6px);
    color: rgba(255,255,255,.8); border-radius: 999px; padding: 4px 10px;
  }

  /* Thumbnails */
  .cd-thumbs {
    display: flex; gap: 10px; overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin; scrollbar-color: var(--dim) transparent;
  }
  .cd-thumb {
    flex-shrink: 0; width: 88px; height: 60px;
    border-radius: 10px; overflow: hidden;
    cursor: pointer; position: relative;
    border: 2px solid transparent;
    transition: border-color .2s, transform .2s;
  }
  .cd-thumb.active { border-color: var(--acc); }
  .cd-thumb:hover:not(.active) { transform: scale(1.04); }
  .cd-thumb img { width: 100%; height: 100%; object-fit: cover; }

  /* Card base */
  .cd-card {
    background: var(--card); border: 1px solid var(--line);
    border-radius: 18px; padding: 28px;
    transition: border-color .2s;
  }
  .cd-card:hover { border-color: rgba(0,0,0,.13); }

  /* Section label */
  .cd-label {
    font-family: var(--mono); font-size: 9px; letter-spacing: .16em;
    text-transform: uppercase; color: var(--acc);
    display: flex; align-items: center; gap: 8px; margin-bottom: 18px;
  }
  .cd-label::before { content:''; width:18px; height:1px; background:var(--acc); }

  /* Specs grid */
  .cd-specs {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 12px;
  }
  .cd-spec {
    background: var(--card2); border: 1px solid var(--line2);
    border-radius: 12px; padding: 14px 16px;
  }
  .cd-spec-lbl {
    font-family: var(--mono); font-size: 9px; letter-spacing: .1em;
    text-transform: uppercase; color: var(--ghost); margin-bottom: 5px;
  }
  .cd-spec-val {
    font-family: var(--sans); font-size: 14px; font-weight: 500;
    color: var(--ink);
  }

  /* Description */
  .cd-desc {
    font-family: var(--sans); font-size: 14px; line-height: 1.8;
    color: var(--ghost); font-weight: 300;
  }

  /* ── RIGHT COLUMN ── */
  .cd-right { display: flex; flex-direction: column; gap: 16px; }

  /* Price card */
  .cd-price-card {
    background: var(--card); border: 1px solid var(--line);
    border-radius: 18px; padding: 28px;
  }
  .cd-title {
    font-family: var(--serif); font-size: 26px; font-weight: 700;
    letter-spacing: -.03em; line-height: 1.1; color: var(--ink);
    margin-bottom: 14px;
  }
  .cd-price-row {
    display: flex; align-items: baseline; gap: 6px;
    padding-top: 14px; border-top: 1px solid var(--line);
  }
  .cd-price {
    font-family: var(--serif); font-size: 38px; font-weight: 900;
    letter-spacing: -.04em; color: var(--ink);
    line-height: 1;
  }
  .cd-price-currency {
    font-family: var(--mono); font-size: 13px; color: var(--ghost);
  }

  /* Seller card (sticky) */
  .cd-seller-card {
    background: var(--card); border: 1px solid var(--line);
    border-radius: 18px; padding: 28px;
    position: sticky; top: 76px;
  }
  .cd-seller-name {
    font-family: var(--serif); font-size: 18px; font-weight: 700;
    letter-spacing: -.02em; color: var(--ink);
    text-decoration: none; margin-bottom: 4px; display: block;
    transition: color .2s;
  }
  .cd-seller-name:hover { color: var(--acc); }
  .cd-seller-sub {
    font-family: var(--mono); font-size: 10px; letter-spacing: .08em;
    text-transform: uppercase; color: var(--ghost); margin-bottom: 20px;
  }

  /* CTA buttons */
  .cd-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 14px;
    border-radius: 12px; font-family: var(--mono);
    font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
    text-decoration: none; font-weight: 500; cursor: pointer; border: none;
    transition: all .2s;
  }
  .cd-btn + .cd-btn { margin-top: 10px; }

  .cd-btn-dark {
    background: var(--ink); color: var(--bg);
  }
  .cd-btn-dark:hover {
    background: var(--acc); transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(61,58,245,.25);
  }
  .cd-btn-green {
    background: var(--green-bg); color: var(--green);
    border: 1px solid var(--green-bd);
  }
  .cd-btn-green:hover {
    background: var(--green); color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(12,153,102,.22);
  }
  .cd-btn-outline {
    background: transparent; color: var(--ghost);
    border: 1px solid var(--line);
  }
  .cd-btn-outline:hover { border-color: var(--acc); color: var(--acc); background: var(--acc-bg); }

  /* Login nudge */
  .cd-login-nudge {
    background: var(--acc-bg); border: 1px solid var(--acc-bd);
    border-radius: 12px; padding: 16px;
    text-align: center;
    font-family: var(--sans); font-size: 13px; color: var(--ghost);
    line-height: 1.6;
  }
  .cd-login-nudge a {
    color: var(--acc); font-weight: 500; text-decoration: none;
  }
  .cd-login-nudge a:hover { opacity: .75; }

  /* Condition / status badge */
  .cd-badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: var(--mono); font-size: 9px; letter-spacing: .12em;
    text-transform: uppercase;
    background: rgba(12,153,102,.08); color: var(--green);
    border: 1px solid rgba(12,153,102,.2);
    border-radius: 999px; padding: 4px 10px;
  }
  .cd-badge::before {
    content: ''; width: 6px; height: 6px; border-radius: 50%;
    background: var(--green); box-shadow: 0 0 6px var(--green);
  }

  /* Loading / error */
  .cd-state {
    min-height: 60vh; display: flex; align-items: center; justify-content: center;
    font-family: var(--mono); font-size: 12px; color: var(--ghost);
    letter-spacing: .06em;
  }

  /* Animations */
  @keyframes cd-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  .cd-fade { opacity:0; animation:cd-up .5s ease forwards; }

  /* Responsive */
  @media(max-width:1024px) {
    .cd-body { grid-template-columns: 1fr; padding: 32px 24px 60px; }
    .cd-seller-card { position: static; }
    .cd-specs { grid-template-columns: repeat(2,1fr); }
    .cd-right { flex-direction: row; flex-wrap: wrap; }
    .cd-right > * { flex: 1 1 300px; }
  }
  @media(max-width:640px) {
    .cd-nav { padding: 0 16px; }
    .cd-body { padding: 20px 16px 48px; gap: 16px; }
    .cd-specs { grid-template-columns: repeat(2,1fr); gap: 8px; }
    .cd-card { padding: 20px; }
    .cd-price-card, .cd-seller-card { padding: 20px; }
    .cd-price { font-size: 30px; }
    .cd-title { font-size: 22px; }
    .cd-right { flex-direction: column; }
  }
`;

function Spec({ label, value }) {
  return (
    <div className="cd-spec">
      <p className="cd-spec-lbl">{label}</p>
      <p className="cd-spec-val">{value || "—"}</p>
    </div>
  );
}

export default function CarDetails() {
  const { id } = useParams();
  const [car,         setCar        ] = useState(null);
  const [loading,     setLoading    ] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const auth = loadAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/sale/${id}`);
        setCar(res.data); setActiveImage(0);
      } catch { setCar(null); }
      finally  { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="cd"><style>{S}</style>
      <div className="cd-state">Loading vehicle…</div>
    </div>
  );
  if (!car) return (
    <div className="cd"><style>{S}</style>
      <div className="cd-state" style={{color:"#c93030"}}>Vehicle not found.</div>
    </div>
  );

  const seller = car.sellerId;
  const images = car.images || [];
  const nextImage = () => setActiveImage(i => (i + 1) % images.length);
  const prevImage = () => setActiveImage(i => (i - 1 + images.length) % images.length);

  return (
    <div className="cd">
      <style>{S}</style>

      {/* ══ NAV ══ */}
      <nav className="cd-nav">
        <Link to="/" className="cd-nav-logo">Goo<em>voiture</em></Link>
        <Link to="/cars" className="cd-back">← Back to listings</Link>
      </nav>

      <div className="cd-body">

        {/* ══ LEFT ══ */}
        <div className="cd-left">

          {/* Carousel */}
          <div className="cd-carousel cd-fade" style={{animationDelay:"0ms"}}>
            {images.length > 0 ? (
              <>
                <img
                  src={images[activeImage]}
                  alt="Car"
                  className="cd-carousel-img"
                />
                {images.length > 1 && (
                  <>
                    <button className="cd-arr cd-arr-prev" onClick={prevImage}>‹</button>
                    <button className="cd-arr cd-arr-next" onClick={nextImage}>›</button>
                    <div className="cd-counter">{activeImage + 1} / {images.length}</div>
                  </>
                )}
              </>
            ) : (
              <div className="cd-carousel-none">No image available</div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="cd-thumbs cd-fade" style={{animationDelay:"60ms"}}>
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`cd-thumb${i === activeImage ? " active" : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt={`View ${i+1}`}/>
                </div>
              ))}
            </div>
          )}

          {/* Specs */}
          <div className="cd-card cd-fade" style={{animationDelay:"100ms"}}>
            <div className="cd-label">Specifications</div>
            <div className="cd-specs">
              <Spec label="Brand"    value={car.brand}   />
              <Spec label="Model"    value={car.model}   />
              <Spec label="Year"     value={car.year}    />
              <Spec label="Mileage"  value={car.mileage ? `${Number(car.mileage).toLocaleString()} km` : null} />
              <Spec label="Fuel"     value={car.fuel}    />
              <Spec label="Gearbox"  value={car.gearbox} />
              <Spec label="City"     value={car.city}    />
            </div>
          </div>

          {/* Description */}
          <div className="cd-card cd-fade" style={{animationDelay:"140ms"}}>
            <div className="cd-label">Description</div>
            <p className="cd-desc">
              {car.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="cd-right">

          {/* Price + title */}
          <div className="cd-price-card cd-fade" style={{animationDelay:"60ms"}}>
            <span className="cd-badge">Approved Listing</span>
            <h1 className="cd-title" style={{marginTop:14}}>{car.title}</h1>
            <div className="cd-price-row">
              <span className="cd-price">{Number(car.price).toLocaleString()}</span>
              <span className="cd-price-currency">MAD</span>
            </div>
          </div>

          {/* Seller + CTA */}
          <div className="cd-seller-card cd-fade" style={{animationDelay:"120ms"}}>
            <div className="cd-label">Seller</div>

            <Link to={`/seller/${seller?._id}`} className="cd-seller-name">
              {seller?.name || "Unknown Seller"}
            </Link>
            <p className="cd-seller-sub">Verified Seller</p>

            {auth?.token ? (
              <>
                <a href={`tel:${seller?.phone}`} className="cd-btn cd-btn-dark">
                  📞 Call Seller
                </a>
                <a
                  href={`https://wa.me/${seller?.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cd-btn cd-btn-green"
                >
                  💬 WhatsApp
                </a>
              </>
            ) : (
              <div className="cd-login-nudge">
                <p>
                  <Link to="/login">Sign in</Link> to contact the seller
                  and view contact details.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
