import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyCarWorth, previewCarWorth } from "../api/garageIntel";
import { getMyCar } from "../api/userCar";
import GarageShell from "../components/garage/GarageShell";
import { useAppLang } from "../context/AppLangContext";
import "../styles/garage.css";

export default function CarWorthPage() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const [intel, setIntel] = useState(null);
  const [city, setCity] = useState("Casablanca");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyCarWorth(city)
      .then((r) => setIntel(r.data))
      .catch(async () => {
        try {
          const car = (await getMyCar()).data;
          if (car?.brand) {
            const r = await previewCarWorth({ brand: car.brand, model: car.model, year: car.year, mileage: car.currentMileage, fuel: car.fuelType, city });
            setIntel({ car, ...r.data });
          }
        } catch {
          setIntel(null);
        }
      })
      .finally(() => setLoading(false));
  }, [city]);

  const worth = intel?.worthTodayMad;

  return (
    <GarageShell
      fr={fr}
      emoji="💰"
      title={fr ? "Chhal tswa daba?" : "Worth today?"}
      subtitle={fr ? "Valeur du jour sur le marché marocain" : "Today's value on the Moroccan market"}
      heroAccent="#10b981"
    >
      <div className="ge-glass">
        <label className="ge-spec-label">{fr ? "Ville" : "City"}</label>
        <select className="ge-input" value={city} onChange={(e) => setCity(e.target.value)}>
          {["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir"].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="ge-loading"><div className="ge-spin" /></div>
      ) : worth ? (
        <>
          <div className="ge-price-hero ge-slide-up">
            <p style={{ margin: 0, fontSize: 14, color: "var(--ge-muted)" }}>
              {intel.car?.brand || intel.brand} {intel.car?.model || intel.model}
            </p>
            <p className="big">{worth.toLocaleString()} MAD</p>
            {intel.monthlyChangeMad < 0 && (
              <p style={{ color: "#f87171", fontWeight: 600, marginTop: 8 }}>
                ≈ {Math.abs(intel.monthlyChangeMad).toLocaleString()} MAD {fr ? "ce mois" : "this month"}
              </p>
            )}
          </div>
          <div className="ge-glass">
            {(intel.insightsFr || []).map((line, i) => (
              <p key={i} style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.6 }}>{line}</p>
            ))}
          </div>
        </>
      ) : (
        <p style={{ textAlign: "center" }}>
          <Link to="/garage/add" style={{ color: "var(--ge-accent)", fontWeight: 700 }}>
            {fr ? "Ajoutez votre voiture au garage" : "Add your car to garage"}
          </Link>
        </p>
      )}
    </GarageShell>
  );
}
