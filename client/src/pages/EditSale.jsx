import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";

const ALL_FEATURES = ["Air conditioning","GPS","Bluetooth","Backup camera","Sunroof","Leather seats","Heated seats","USB port","Cruise control","Parking sensors"];

export default function EditSale() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title:"", brand:"", model:"", year:"", mileage:"", price:"",
    city:"", fuel:"", gearbox:"", color:"", doors:"", seats:"",
    description:"", images:[],
  });
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    api.get(`/sale/${id}`).then((r) => {
      const l = r.data;
      setStatus(l.status);
      setForm({
        title: l.title || "", brand: l.brand || "", model: l.model || "",
        year: l.year || "", mileage: l.mileage || "", price: l.price || "",
        city: l.city || "", fuel: l.fuel || "", gearbox: l.gearbox || "",
        color: l.color || "", doors: l.doors || "", seats: l.seats || "",
        description: l.description || "", images: Array.isArray(l.images) ? l.images : [],
      });
      setFeatures(Array.isArray(l.features) ? l.features : []);
    }).catch(() => setError("Failed to load listing"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleFeature = (f) => setFeatures((p) => p.includes(f) ? p.filter((x) => x !== f) : [...p, f]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/sale/${id}`, {
        ...form,
        year: Number(form.year), price: Number(form.price),
        mileage: form.mileage ? Number(form.mileage) : undefined,
        doors: form.doors ? Number(form.doors) : undefined,
        seats: form.seats ? Number(form.seats) : undefined,
        features,
      });
      navigate("/my-sales");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update");
    } finally { setSaving(false); }
  };

  const handleMarkSold = async () => {
    if (!window.confirm("Mark this listing as sold? It will be removed from public listings.")) return;
    setMarking(true);
    try {
      await api.put(`/sale/${id}/sold`);
      navigate("/my-sales");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark as sold");
    } finally { setMarking(false); }
  };

  if (loading) return <p className="p-6">Loading listing…</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Listing</h1>
        {status === "approved" && (
          <button
            type="button"
            onClick={handleMarkSold}
            disabled={marking}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            {marking ? "Marking…" : "✓ Mark as Sold"}
          </button>
        )}
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* Basic info */}
        <div className="bg-white p-6 rounded-xl shadow border space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name:"title", placeholder:"Title" },
              { name:"brand", placeholder:"Brand" },
              { name:"model", placeholder:"Model" },
              { name:"year", placeholder:"Year" },
              { name:"mileage", placeholder:"Mileage (km)" },
              { name:"price", placeholder:"Price (MAD)" },
              { name:"city", placeholder:"City" },
              { name:"color", placeholder:"Color (e.g. Black)" },
              { name:"doors", placeholder:"Doors" },
              { name:"seats", placeholder:"Seats" },
            ].map(({ name, placeholder }) => (
              <input key={name} name={name} className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black" placeholder={placeholder} value={form[name]} onChange={handleChange} />
            ))}
            <select name="fuel" value={form.fuel} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black">
              <option value="">Fuel type</option>
              {["Diesel","Petrol","Hybrid","Electric"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <select name="gearbox" value={form.gearbox} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black">
              <option value="">Gearbox</option>
              {["Manual","Automatic"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <textarea name="description" className="w-full border rounded-xl px-4 py-3 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-black" placeholder="Description" value={form.description} onChange={handleChange} />
        </div>

        {/* Features */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold mb-4">Features & Extras</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_FEATURES.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox" checked={features.includes(f)} onChange={() => toggleFeature(f)} className="accent-black" />
                {f}
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-xl font-semibold mb-4">Photos</h2>
          <button
            type="button"
            className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
            onClick={() => {
              window.cloudinary.openUploadWidget(
                { cloudName: "daqihsmib", uploadPreset: "goovoiture", multiple: true },
                (err, result) => {
                  if (!err && result?.event === "success") {
                    setForm((p) => ({ ...p, images: [...p.images, result.info.secure_url] }));
                  }
                }
              );
            }}
          >
            Upload Photos
          </button>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {form.images.map((img, index) => (
              <div key={index} className="relative group">
                <img src={img} className="w-full h-32 object-cover rounded-lg shadow-sm border" />
                <button
                  onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }))}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-3 bg-black text-white rounded-xl hover:opacity-90" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
