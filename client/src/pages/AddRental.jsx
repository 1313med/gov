import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import SellerLayout from "../components/seller/SellerLayout";

export default function AddRental() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    pricePerDay: "",
    city: "",
    brand: "",
    model: "",
    year: "",
    fuel: "",
    gearbox: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImages = async (e) => {
    const files = Array.from(e.target.files);

    const uploads = await Promise.all(
      files.map(async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "your_preset_here");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
          {
            method: "POST",
            body: data,
          }
        );

        const json = await res.json();
        return json.secure_url;
      })
    );

    setImages((prev) => [...prev, ...uploads]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/rental", {
        ...form,
        pricePerDay: Number(form.pricePerDay),
        year: Number(form.year),
        images,
      });

      alert("✅ Rental submitted for approval");
      navigate("/");
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Failed to create rental"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerLayout>
      <h1 className="text-3xl font-bold mb-6">
        Add Rental Car
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow space-y-6 max-w-3xl"
      >
        <Input name="title" label="Title" onChange={handleChange} />
        <Textarea
          name="description"
          label="Description"
          onChange={handleChange}
        />

        <Input
          name="pricePerDay"
          label="Price per day (MAD)"
          type="number"
          onChange={handleChange}
        />

        <Input name="city" label="City" onChange={handleChange} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Input name="brand" label="Brand" onChange={handleChange} />
          <Input name="model" label="Model" onChange={handleChange} />
          <Input name="year" label="Year" type="number" onChange={handleChange} />
          <Input name="fuel" label="Fuel" onChange={handleChange} />
          <Input name="gearbox" label="Gearbox" onChange={handleChange} />
        </div>

        {/* Images */}
        <div>
          <label className="block font-medium mb-2">
            Images
          </label>
          <input
            type="file"
            multiple
            onChange={handleImages}
          />

          <div className="flex gap-3 mt-3 flex-wrap">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                className="w-24 h-24 object-cover rounded-xl"
              />
            ))}
          </div>
        </div>

        <button
          disabled={loading}
          className="px-6 py-4 bg-black text-white rounded-xl"
        >
          {loading ? "Submitting..." : "Submit Rental"}
        </button>
      </form>
    </SellerLayout>
  );
}

/* ================= UI HELPERS ================= */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block font-medium mb-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full border rounded-xl p-3"
        required
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="block font-medium mb-1">
        {label}
      </label>
      <textarea
        {...props}
        className="w-full border rounded-xl p-3"
        rows={4}
      />
    </div>
  );
}
