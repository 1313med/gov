import { useState, useEffect } from "react";
import { getSaleFairPrice } from "../api/fairPrice";

export default function FairPriceIndicator({ listing, elite }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listing?.brand || !listing?.model) return;
    getSaleFairPrice({
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      mileage: listing.mileage,
      excludeId: listing._id,
    })
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [listing?._id, listing?.brand, listing?.model, listing?.year, listing?.mileage]);

  if (loading) {
    if (elite) {
      return <div className="ld-fair-card ld-reveal" style={{ minHeight: 120, animationDelay: "80ms" }} />;
    }
    return <div className="h-16 animate-pulse bg-gray-100 rounded-xl" />;
  }
  if (!data?.available) return null;

  const { marketPrice } = data;
  const price = listing.price;
  const avg = marketPrice.adjustedAvg || marketPrice.average;
  const diffPct = Math.round(((price - avg) / avg) * 100);
  const isGood = diffPct <= -5;
  const isFair = Math.abs(diffPct) < 5;
  const isHigh = diffPct >= 5;

  const label = isGood ? "Bon prix" : isFair ? "Prix marché" : "Prix élevé";
  const desc = isGood
    ? `${Math.abs(diffPct)}% en dessous de la moyenne marché`
    : isFair
      ? "Aligné avec le marché"
      : `${diffPct}% au-dessus de la moyenne marché`;

  const tone = isGood ? "good" : isFair ? "fair" : "high";
  const range = marketPrice.max - marketPrice.min || 1;
  const position = Math.min(100, Math.max(0, Math.round(((price - marketPrice.min) / range) * 100)));

  if (elite) {
    return (
      <div className="ld-fair-card ld-reveal" style={{ animationDelay: "80ms" }}>
        <div className="ld-fair-head">
          <p className="ld-fair-title">Estimation du prix marché</p>
          <span className={`ld-fair-badge ld-fair-badge--${tone}`}>{label}</span>
        </div>
        <p className="ld-fair-desc">
          {desc} · basé sur {data.sampleSize} annonces similaires
        </p>
        <div className="ld-fair-track">
          <div className={`ld-fair-fill ld-fair-fill--${tone}`} style={{ width: `${position}%` }} />
          <div className="ld-fair-knob" style={{ left: `${position}%` }} />
        </div>
        <div className="ld-fair-range">
          <span>{marketPrice.min.toLocaleString("fr-FR")} MAD</span>
          <strong>Moy: {avg.toLocaleString("fr-FR")} MAD</strong>
          <span>{marketPrice.max.toLocaleString("fr-FR")} MAD</span>
        </div>
      </div>
    );
  }

  const barColor = isGood ? "bg-green-500" : isFair ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="border rounded-xl p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700">Estimation du prix marché</p>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">{desc} · basé sur {data.sampleSize} annonces similaires</p>
      <div className="relative h-2 bg-gray-200 rounded-full mb-3">
        <div className={`absolute left-0 h-full ${barColor} rounded-full`} style={{ width: `${position}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-blue-600 rounded-full"
          style={{ left: `calc(${position}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{marketPrice.min.toLocaleString("fr-FR")} MAD</span>
        <span className="text-gray-600 font-medium">Moy: {avg.toLocaleString("fr-FR")} MAD</span>
        <span>{marketPrice.max.toLocaleString("fr-FR")} MAD</span>
      </div>
    </div>
  );
}
