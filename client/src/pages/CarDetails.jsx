import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import { loadAuth } from "../utils/authStorage";

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

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

  if (loading) return <p className="p-6">Loading...</p>;
  if (!car) return <p className="p-6 text-red-600">Car not found</p>;

  const seller = car.sellerId;
  const images = car.images || [];

  const nextImage = () =>
    setActiveImage((i) => (i + 1) % images.length);

  const prevImage = () =>
    setActiveImage((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-8 grid lg:grid-cols-3 gap-8">

        {/* ================= LEFT ================= */}
        <div className="lg:col-span-2 space-y-6">

          {/* IMAGE CAROUSEL */}
          <div className="bg-white rounded-2xl shadow overflow-hidden relative">

            {images.length > 0 ? (
              <>
                <img
                  src={images[activeImage]}
                  alt="Car"
                  className="w-full h-[280px] sm:h-[380px] lg:h-[450px] object-cover"
                />

                {/* Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-xl"
                    >
                      ‹
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full text-xl"
                    >
                      ›
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          {/* THUMBNAILS */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-28 object-cover rounded-xl cursor-pointer border-2 ${
                    i === activeImage
                      ? "border-black"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>
          )}

          {/* SPECS */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Spec label="Brand" value={car.brand} />
              <Spec label="Model" value={car.model} />
              <Spec label="Year" value={car.year} />
              <Spec label="Mileage" value={`${car.mileage || 0} km`} />
              <Spec label="Fuel" value={car.fuel} />
              <Spec label="Gearbox" value={car.gearbox} />
              <Spec label="City" value={car.city} />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700">
              {car.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="space-y-6">

          <div className="bg-white p-6 rounded-2xl shadow">
            <h1 className="text-2xl font-bold">{car.title}</h1>
            <p className="text-3xl font-extrabold mt-2">
              {car.price} MAD
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow sticky top-6">
            <h2 className="text-lg font-semibold mb-2">Seller</h2>
            <Link
  to={`/seller/${seller?._id}`}
  className="font-medium text-blue-600 hover:underline"
>
  {seller?.name}
</Link>


            {auth?.token ? (
              <div className="space-y-3 mt-4">
                <a
                  href={`tel:${seller?.phone}`}
                  className="block text-center px-4 py-3 bg-black text-white rounded-xl"
                >
                  Call Seller
                </a>

                <a
                  href={`https://wa.me/${seller?.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center px-4 py-3 bg-green-600 text-white rounded-xl"
                >
                  WhatsApp
                </a>
              </div>
            ) : (
              <Link
                to="/login"
                className="block text-center px-4 py-3 bg-gray-900 text-white rounded-xl mt-4"
              >
                Login to contact seller
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        <Link to="/cars" className="text-blue-600 hover:underline">
          ← Back to listings
        </Link>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="border rounded-xl p-3 bg-gray-50">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value || "-"}</p>
    </div>
  );
}
