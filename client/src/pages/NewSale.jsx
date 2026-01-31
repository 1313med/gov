import { useState } from "react";
import { api } from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function NewSale() {
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
    images: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        ...form,
        images: form.images.split(",").map((url) => url.trim()),
      };

      await api.post("/sale", payload);
      navigate("/my-sales");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold">Add New Car Listing</h2>

      {error && <p className="text-red-600 mt-3">{error}</p>}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input name="title" className="input" placeholder="Title" onChange={handleChange} />
        <input name="brand" className="input" placeholder="Brand" onChange={handleChange} />
        <input name="model" className="input" placeholder="Model" onChange={handleChange} />
        <input name="year" className="input" placeholder="Year" onChange={handleChange} />
        <input name="mileage" className="input" placeholder="Mileage" onChange={handleChange} />
        <input name="price" className="input" placeholder="Price" onChange={handleChange} />
        <input name="city" className="input" placeholder="City" onChange={handleChange} />
        <input name="fuel" className="input" placeholder="Fuel" onChange={handleChange} />
        <input name="gearbox" className="input" placeholder="Gearbox" onChange={handleChange} />

        <textarea
          name="description"
          className="input h-24"
          placeholder="Description"
          onChange={handleChange}
        />

        <textarea
          name="images"
          className="input h-24"
          placeholder="Image URLs (comma separated)"
          onChange={handleChange}
        />

        <button className="px-5 py-3 bg-black text-white rounded-xl">
          {loading ? "Saving..." : "Save Listing"}
        </button>
      </form>
    </div>
  );
}
