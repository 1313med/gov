import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";

export default function EditSale() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    city: "",
    fuel: "",
    gearbox: "",
    description: "",
    images: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get(`/sale/${id}`);
        const listing = res.data;

        setForm({
          title: listing.title || "",
          brand: listing.brand || "",
          model: listing.model || "",
          year: listing.year || "",
          mileage: listing.mileage || "",
          price: listing.price || "",
          city: listing.city || "",
          fuel: listing.fuel || "",
          gearbox: listing.gearbox || "",
          description: listing.description || "",
          images: Array.isArray(listing.images) ? listing.images : [],
        });
      } catch {
        setError("Failed to load listing");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put(`/sale/${id}`, form);
      navigate("/my-sales");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <p className="p-6">Loading listing...</p>;


  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Listing</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* ===================== BASIC INFO ===================== */}
        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="title" className="input" placeholder="Title" value={form.title} onChange={handleChange} />
            <input name="brand" className="input" placeholder="Brand" value={form.brand} onChange={handleChange} />
            <input name="model" className="input" placeholder="Model" value={form.model} onChange={handleChange} />
            <input name="year" className="input" placeholder="Year" value={form.year} onChange={handleChange} />
            <input name="mileage" className="input" placeholder="Mileage" value={form.mileage} onChange={handleChange} />
            <input name="price" className="input" placeholder="Price" value={form.price} onChange={handleChange} />
            <input name="city" className="input" placeholder="City" value={form.city} onChange={handleChange} />
            <input name="fuel" className="input" placeholder="Fuel" value={form.fuel} onChange={handleChange} />
            <input name="gearbox" className="input" placeholder="Gearbox" value={form.gearbox} onChange={handleChange} />
          </div>

          <textarea
            name="description"
            className="input h-28 resize-none"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
        </div>


        {/* ===================== IMAGES SECTION ===================== */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold mb-4">Images</h2>

          {/* Upload button */}
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
            onClick={() => {
              window.cloudinary.openUploadWidget(
                {
                  cloudName: "daqihsmib",
                  uploadPreset: "goovoiture",
                  multiple: true,
                },
                (error, result) => {
                  if (!error && result && result.event === "success") {
                    setForm((prev) => ({
                      ...prev,
                      images: [...prev.images, result.info.secure_url],
                    }));
                  }
                }
              );
            }}
          >
            Upload Images
          </button>

          {/* Image Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {form.images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  className="w-full h-32 object-cover rounded-lg shadow-sm border"
                />

                {/* Remove button */}

                <button
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      images: prev.images.filter((_, i) => i !== index),
                    }))
                  }
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>


        {/* ===================== SAVE BUTTON ===================== */}
        <div className="flex justify-end">
          <button className="px-6 py-3 bg-black text-white rounded-xl hover:opacity-90">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}
