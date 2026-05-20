import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";

export default function SimilarListings({ listing, type = "sale" }) {
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    if (!listing) return;
    const params = new URLSearchParams({
      brand:     listing.brand,
      model:     listing.model,
      excludeId: listing._id,
      limit:     3,
    });
    if (listing.year) params.set("year", listing.year);
    if (type === "sale") params.set("maxPrice", Math.round(listing.price * 1.3));

    const endpoint = type === "sale" ? `/sale?${params}` : `/rental?${params}`;
    api.get(endpoint)
      .then((r) => {
        const items = r.data?.listings || r.data?.rentals || r.data || [];
        setSimilar(items.slice(0, 3));
      })
      .catch(() => setSimilar([]));
  }, [listing?._id, type]);

  if (!similar.length) return null;

  const basePath = type === "sale" ? "/cars" : "/rentals";

  return (
    <div className="mt-8">
      <h3 className="font-bold text-gray-800 mb-4">
        {type === "sale" ? "Voitures similaires à vendre" : "Locations similaires"}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {similar.map((item) => {
          const price  = type === "sale" ? item.price : item.pricePerDay;
          const suffix = type === "sale" ? "MAD" : "MAD/jour";
          const img    = item.images?.[0];
          return (
            <Link
              key={item._id}
              to={`${basePath}/${item._id}`}
              className="border rounded-xl overflow-hidden hover:shadow-md transition group"
            >
              <div className="h-32 bg-gray-100 overflow-hidden">
                {img
                  ? <img src={img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl">🚗</div>
                }
              </div>
              <div className="p-3">
                <p className="font-medium text-sm text-gray-800 truncate">{item.title || `${item.brand} ${item.model}`}</p>
                <p className="text-xs text-gray-500 mb-1">{item.city} · {item.year}</p>
                <p className="font-bold text-blue-600 text-sm">
                  {price?.toLocaleString("fr-FR")} {suffix}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
