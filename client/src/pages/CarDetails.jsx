import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import { loadAuth } from "../utils/authStorage";

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = loadAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/sale/${id}`);
        setCar(res.data);
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

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* Title + price */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h1 className="text-3xl font-bold">{car.title}</h1>
        <p className="text-3xl mt-2 font-semibold text-black">{car.price} MAD</p>
      </div>

      {/* Image Slider */}
      {car.images?.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {car.images.map((img, i) => (
              <img
                key={i}
                src={img}
                className="rounded-xl object-cover w-full h-64"
              />
            ))}
          </div>
        </div>
      )}

      {/* Specs */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold mb-4">Specifications</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
          <p><b>Brand:</b> {car.brand}</p>
          <p><b>Model:</b> {car.model}</p>
          <p><b>Year:</b> {car.year}</p>
          <p><b>Mileage:</b> {car.mileage} km</p>
          <p><b>Fuel:</b> {car.fuel}</p>
          <p><b>Gearbox:</b> {car.gearbox}</p>
          <p><b>City:</b> {car.city}</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        <p className="text-gray-700 leading-relaxed">
          {car.description || "No description available."}
        </p>
      </div>

      {/* Contact */}
      <div>
        {auth?.token ? (
          <button className="px-6 py-3 bg-black text-white rounded-xl hover:opacity-90">
            Contact Seller
          </button>
        ) : (
          <Link
            to="/login"
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:opacity-80"
          >
            Login to contact seller
          </Link>
        )}
      </div>

      <Link to="/cars" className="text-blue-600 hover:underline block">
        ← Back to list
      </Link>
    </div>
  );
}
