import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { useAppLang } from "../context/AppLangContext";

const ALL_FEATURES = ["Air conditioning","GPS","Bluetooth","Backup camera","Sunroof","Leather seats","Heated seats","USB port","Cruise control","Parking sensors"];
const FUEL_KEYS = ["Diesel","Petrol","Hybrid","Electric"];
const GEARBOX_KEYS = ["Manual","Automatic"];

export default function EditSale() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { copy } = useAppLang();
  const t = copy.saleForm;

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
    }).catch(() => setError(t.errors.loadFail))
      .finally(() => setLoading(false));
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
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
      setError(err.response?.data?.message || t.errors.updateFail);
    } finally { setSaving(false); }
  };

  const handleMarkSold = async () => {
    if (!window.confirm(t.confirmMarkSold)) return;
    setMarking(true);
    try {
      await api.put(`/sale/${id}/sold`);
      navigate("/my-sales");
    } catch (err) {
      setError(err.response?.data?.message || t.errors.markSoldFail);
    } finally { setMarking(false); }
  };

  if (loading) return <p className="p-6 text-slate-600 dark:text-slate-400">{t.loadingListing}</p>;

  const inputDefs = [
    { name:"title",   placeholder: t.titlePh },
    { name:"brand",   placeholder: t.brand },
    { name:"model",   placeholder: t.model },
    { name:"year",    placeholder: t.year },
    { name:"mileage", placeholder: t.mileagePh },
    { name:"price",   placeholder: t.pricePh },
    { name:"city",    placeholder: t.city },
    { name:"color",   placeholder: t.colorPh },
    { name:"doors",   placeholder: t.doorsShort },
    { name:"seats",   placeholder: t.seatsShort },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.editTitle}</h1>
        {status === "approved" && (
          <button
            type="button"
            onClick={handleMarkSold}
            disabled={marking}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60"
          >
            {marking ? t.marking : t.markSold}
          </button>
        )}
      </div>

      {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* Basic info */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow border border-gray-200 dark:border-slate-700 space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{t.basicInfo}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inputDefs.map(({ name, placeholder }) => (
              <input key={name} name={name} className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-violet-500" placeholder={placeholder} value={form[name]} onChange={handleChange} />
            ))}
            <select name="fuel" value={form.fuel} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-violet-500">
              <option value="">{t.fuelType}</option>
              {FUEL_KEYS.map(o => <option key={o} value={o}>{t.fuelOptions[o]}</option>)}
            </select>
            <select name="gearbox" value={form.gearbox} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-violet-500">
              <option value="">{t.gearbox}</option>
              {GEARBOX_KEYS.map(o => <option key={o} value={o}>{t.gearboxOptions[o]}</option>)}
            </select>
          </div>
          <textarea name="description" className="w-full border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 h-28 resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-violet-500" placeholder={t.descriptionPlain} value={form.description} onChange={handleChange} />
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{t.featuresHeader}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_FEATURES.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" checked={features.includes(f)} onChange={() => toggleFeature(f)} className="accent-black dark:accent-violet-500" />
                {t.features[f]}
              </label>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{t.sectionPhotos}</h2>
          <button
            type="button"
            className="px-4 py-2 bg-black dark:bg-violet-600 text-white rounded-lg hover:opacity-90"
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
            {t.uploadPhotos}
          </button>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {form.images.map((img, index) => (
              <div key={index} className="relative group">
                <img src={img} className="w-full h-32 object-cover rounded-lg shadow-sm border border-gray-200 dark:border-slate-600" alt="" />
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }))}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                >
                  {t.removeImage}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button className="px-6 py-3 bg-black dark:bg-violet-600 text-white rounded-xl hover:opacity-90" disabled={saving}>
            {saving ? t.saving : t.saveChanges}
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
