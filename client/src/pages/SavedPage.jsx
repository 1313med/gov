import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  getFavorites,
  removeFavorite,
  getRentalFavorites,
  removeRentalFavorite,
} from "../api/user";
import { loadAuth } from "../utils/authStorage";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";

export default function SavedPage() {
  const { lang } = useAppLang();
  const { dark } = useTheme();
  const fr = lang === "fr";
  const auth = loadAuth();

  const [segment, setSegment] = useState("rentals");
  const [rentals, setRentals] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!auth) {
      setRentals([]);
      setSales([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [rRes, sRes] = await Promise.all([
        getRentalFavorites().catch(() => ({ data: [] })),
        getFavorites().catch(() => ({ data: [] })),
      ]);
      setRentals((Array.isArray(rRes.data) ? rRes.data : []).filter((x) => x?._id));
      setSales((Array.isArray(sRes.data) ? sRes.data : []).filter((x) => x?._id));
    } catch {
      alert(fr ? "Échec du chargement" : "Failed to load saved items");
    } finally {
      setLoading(false);
    }
  }, [auth, fr]);

  useEffect(() => {
    load();
  }, [load]);

  const removeRental = async (id) => {
    await removeRentalFavorite(id);
    setRentals((p) => p.filter((x) => x._id !== id));
  };

  const removeSale = async (id) => {
    await removeFavorite(id);
    setSales((p) => p.filter((x) => x._id !== id));
  };

  const list = segment === "rentals" ? rentals : sales;
  const bg = dark ? "#05060f" : "#f5f7ff";
  const card = dark ? "#101426" : "#fff";
  const txt = dark ? "#f5f7ff" : "#0b163d";

  if (!auth) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        <p style={{ color: txt }}>
          {fr ? "Connectez-vous pour voir vos favoris." : "Sign in to view saved items."}{" "}
          <Link to="/login" style={{ color: "#7c6bff" }}>{fr ? "Connexion" : "Login"}</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, padding: "32px 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: txt, marginBottom: 8 }}>
        {fr ? "Enregistrés" : "Saved"}
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: 24 }}>
        {fr ? "Locations et annonces à la vente" : "Rentals and cars for sale"}
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {[
          { id: "rentals", label: fr ? `Locations (${rentals.length})` : `Rentals (${rentals.length})` },
          { id: "sales", label: fr ? `À vendre (${sales.length})` : `For sale (${sales.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSegment(tab.id)}
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: `1px solid ${segment === tab.id ? "#7c6bff" : "rgba(148,163,184,.4)"}`,
              background: segment === tab.id ? "rgba(124,107,255,.15)" : "transparent",
              color: segment === tab.id ? "#7c6bff" : txt,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>{fr ? "Chargement…" : "Loading…"}</p>
      ) : list.length === 0 ? (
        <div style={{ padding: 48, textAlign: "center", borderRadius: 16, border: "1px dashed rgba(148,163,184,.4)", color: "#94a3b8" }}>
          {segment === "rentals"
            ? (fr ? "Aucune location enregistrée." : "No saved rentals.")
            : (fr ? "Aucune annonce enregistrée." : "No saved listings.")}
          <br />
          <Link to={segment === "rentals" ? "/rentals" : "/cars"} style={{ color: "#7c6bff", marginTop: 12, display: "inline-block" }}>
            {fr ? "Parcourir" : "Browse"}
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {list.map((item) => {
            const href = segment === "rentals" ? `/rentals/${item._id}` : `/cars/${item._id}`;
            const img = item.images?.[0] || item.image;
            const price = item.pricePerDay ?? item.price;
            return (
              <div key={item._id} style={{ borderRadius: 16, overflow: "hidden", background: card, border: "1px solid rgba(148,163,184,.2)" }}>
                <Link to={href}>
                  {img ? (
                    <img src={img} alt="" style={{ width: "100%", height: 160, objectFit: "cover" }} />
                  ) : (
                    <div style={{ height: 160, background: "rgba(124,107,255,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>🚗</div>
                  )}
                </Link>
                <div style={{ padding: 14 }}>
                  <Link to={href} style={{ fontWeight: 700, color: txt, textDecoration: "none" }}>
                    {item.brand} {item.model} {item.year ? `· ${item.year}` : ""}
                  </Link>
                  {price != null && (
                    <p style={{ margin: "6px 0 0", color: "#7c6bff", fontWeight: 700 }}>
                      {Number(price).toLocaleString()} MAD{segment === "rentals" ? (fr ? "/jour" : "/day") : ""}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => (segment === "rentals" ? removeRental(item._id) : removeSale(item._id))}
                    style={{ marginTop: 10, fontSize: 12, color: "#f43f5e", background: "none", border: "none", cursor: "pointer" }}
                  >
                    {fr ? "Retirer" : "Remove"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
