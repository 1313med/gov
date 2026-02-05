import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

const NewSale = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ================= CLOUDINARY =================
  const openCloudinaryWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: "daqihsmib",
        uploadPreset: "goovoiture",
        multiple: true,
      },
      (error, result) => {
        if (!error && result?.event === "success") {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, result.info.secure_url],
          }));
        }
      }
    );
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    if (!formData.title) return "Title is required";
    if (!formData.brand) return "Brand is required";
    if (!formData.model) return "Model is required";
    if (!formData.year) return "Year is required";
    if (!formData.price) return "Price is required";
    if (!formData.city) return "City is required";
    if (!formData.description) return "Description is required";
    if (formData.images.length === 0) return "At least one image is required";
    return null;
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      await api.post("/sale", {
        ...formData,
        price: Number(formData.price),
      });

      navigate("/my-sales");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold">Add a new car</h1>
          <p className="mt-2 text-gray-600">
            Fill in the details below to publish your car listing
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 text-red-600 px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* ================= BASIC INFO ================= */}
          <section className="bg-white rounded-3xl border shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-6">Car information</h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <Input name="title" placeholder="Listing title" value={formData.title} onChange={handleChange} />
              <Input name="brand" placeholder="Brand" value={formData.brand} onChange={handleChange} />
              <Input name="model" placeholder="Model" value={formData.model} onChange={handleChange} />
              <Input name="year" placeholder="Year" value={formData.year} onChange={handleChange} />
              <Input name="mileage" placeholder="Mileage (km)" value={formData.mileage} onChange={handleChange} />
              <Input name="price" placeholder="Price (MAD)" value={formData.price} onChange={handleChange} />
              <Input name="city" placeholder="City" value={formData.city} onChange={handleChange} />
              <Input name="fuel" placeholder="Fuel (Diesel, Petrol...)" value={formData.fuel} onChange={handleChange} />
              <Input name="gearbox" placeholder="Gearbox (Manual / Auto)" value={formData.gearbox} onChange={handleChange} />
            </div>

            <textarea
              name="description"
              className="mt-5 w-full rounded-xl border px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Describe the car condition, history, extras..."
              value={formData.description}
              onChange={handleChange}
            />
          </section>

          {/* ================= IMAGES ================= */}
          <section className="bg-white rounded-3xl border shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-6">Photos</h2>

            <button
              type="button"
              onClick={openCloudinaryWidget}
              className="px-5 py-3 bg-black text-white rounded-xl font-medium hover:opacity-90"
            >
              Upload images
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    className="w-full h-32 object-cover rounded-xl border"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        images: prev.images.filter((_, i) => i !== index),
                      }))
                    }
                    className="absolute top-2 right-2 bg-black text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ================= SUBMIT ================= */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-black text-white rounded-2xl text-lg font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Publishing..." : "Publish car"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// ================= INPUT COMPONENT =================
const Input = ({ name, placeholder, value, onChange }) => (
  <input
    name={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
  />
);

export default NewSale;
