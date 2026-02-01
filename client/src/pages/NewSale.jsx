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

  // ===================== INPUT CHANGE =====================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ===================== CLOUDINARY UPLOAD =====================
  const openCloudinaryWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: "daqihsmib",
        uploadPreset: "goovoiture",
        multiple: true,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, result.info.secure_url],
          }));
        }
      }
    );
  };

  // ===================== VALIDATION =====================
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

  // ===================== SUBMIT =====================
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
        title: formData.title,
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        price: Number(formData.price),
        city: formData.city,
        fuel: formData.fuel,
        gearbox: formData.gearbox,
        description: formData.description,
        images: formData.images,
      });

      navigate("/my-sales");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create sale listing"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================== UI =====================
  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Car</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* ================= BASIC INFO ================= */}
        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="title" className="input" placeholder="Title" value={formData.title} onChange={handleChange} />
            <input name="brand" className="input" placeholder="Brand" value={formData.brand} onChange={handleChange} />
            <input name="model" className="input" placeholder="Model" value={formData.model} onChange={handleChange} />
            <input name="year" className="input" placeholder="Year" value={formData.year} onChange={handleChange} />
            <input name="mileage" className="input" placeholder="Mileage" value={formData.mileage} onChange={handleChange} />
            <input name="price" className="input" placeholder="Price" value={formData.price} onChange={handleChange} />
            <input name="city" className="input" placeholder="City" value={formData.city} onChange={handleChange} />
            <input name="fuel" className="input" placeholder="Fuel" value={formData.fuel} onChange={handleChange} />
            <input name="gearbox" className="input" placeholder="Gearbox" value={formData.gearbox} onChange={handleChange} />
          </div>

          <textarea
            name="description"
            className="input h-28 resize-none"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* ================= IMAGES ================= */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold mb-4">Images</h2>

          <button
            type="button"
            onClick={openCloudinaryWidget}
            className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
          >
            Upload Images
          </button>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {formData.images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  className="w-full h-32 object-cover rounded-lg shadow-sm border"
                />

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
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

        {/* ================= SUBMIT ================= */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-black text-white rounded-xl hover:opacity-90"
          >
            {loading ? "Saving..." : "Add Car"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default NewSale;
