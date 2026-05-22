import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import { getMyProfile } from "../api/user";
import { useAppLang } from "../context/AppLangContext";

const FEATURE_KEYS = ["Air conditioning", "GPS", "Bluetooth", "Backup camera", "Sunroof", "Leather seats", "Heated seats", "USB port", "Cruise control", "Parking sensors"];
const FUEL_KEYS = ["Diesel", "Petrol", "Hybrid", "Electric"];
const GEARBOX_KEYS = ["Manual", "Automatic"];

const NewSale = () => {
  const navigate = useNavigate();
  const { copy } = useAppLang();
  const t = copy.saleForm;

  const [features, setFeatures] = useState([]);

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
    color: "",
    doors: "",
    seats: "",
    description: "",
    images: [],
    videoUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((r) => {
        const u = r.data;
        if (!u?.nationalId?.number || !u?.nationalId?.imageUrl) {
          navigate("/verify-cin?purpose=sell&return=new-sale", { replace: true });
        }
      })
      .catch(() => {})
      .finally(() => setProfileChecked(true));
  }, [navigate]);

  if (!profileChecked) {
    return <div className="p-10 text-slate-500">{t.loading || "Loading…"}</div>;
  }

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
    if (!formData.title) return t.errors.titleRequired;
    if (!formData.brand) return t.errors.brandRequired;
    if (!formData.model) return t.errors.modelRequired;
    if (!formData.year) return t.errors.yearRequired;
    if (!formData.price) return t.errors.priceRequired;
    if (!formData.city) return t.errors.cityRequired;
    if (!formData.description) return t.errors.descriptionRequired;
    if (formData.images.length === 0) return t.errors.imagesRequired;
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
        year: Number(formData.year),
        mileage: formData.mileage ? Number(formData.mileage) : undefined,
        doors: formData.doors ? Number(formData.doors) : undefined,
        seats: formData.seats ? Number(formData.seats) : undefined,
        features,
        videoUrl: formData.videoUrl || undefined,
      });

      navigate("/my-sales");
    } catch (err) {
      setError(err.response?.data?.message || t.errors.createFail);
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-12 px-6 transition-colors">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">{t.newTitle}</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">
            {t.newSub}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 px-4 py-3 border border-red-100 dark:border-red-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* ================= BASIC INFO ================= */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-white">{t.sectionInfo}</h2>

            <div className="grid sm:grid-cols-2 gap-5">
              <Input name="title"   placeholder={t.titlePh}    value={formData.title}   onChange={handleChange} />
              <Input name="brand"   placeholder={t.brand}      value={formData.brand}   onChange={handleChange} />
              <Input name="model"   placeholder={t.model}      value={formData.model}   onChange={handleChange} />
              <Input name="year"    placeholder={t.year}       value={formData.year}    onChange={handleChange} />
              <Input name="mileage" placeholder={t.mileagePh}  value={formData.mileage} onChange={handleChange} />
              <Input name="price"   placeholder={t.pricePh}    value={formData.price}   onChange={handleChange} />
              <Input name="city"    placeholder={t.city}       value={formData.city}    onChange={handleChange} />
              <Input name="color"   placeholder={t.colorPh}    value={formData.color}   onChange={handleChange} />
              <Input name="doors"   placeholder={t.doorsPh}    value={formData.doors}   onChange={handleChange} />
              <Input name="seats"   placeholder={t.seatsPh}    value={formData.seats}   onChange={handleChange} />
              <select name="fuel" value={formData.fuel} onChange={handleChange} className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-violet-500">
                <option value="">{t.fuelType}</option>
                {FUEL_KEYS.map(o => <option key={o} value={o}>{t.fuelOptions[o]}</option>)}
              </select>
              <select name="gearbox" value={formData.gearbox} onChange={handleChange} className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-violet-500">
                <option value="">{t.gearbox}</option>
                {GEARBOX_KEYS.map(o => <option key={o} value={o}>{t.gearboxOptions[o]}</option>)}
              </select>
            </div>

            {/* Features */}
            <div className="mt-6">
              <p className="text-sm font-semibold mb-3 text-gray-700 dark:text-slate-300">{t.featuresHeader}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FEATURE_KEYS.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={features.includes(f)}
                      onChange={() => setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])}
                      className="accent-black dark:accent-violet-500"
                    />
                    {t.features[f]}
                  </label>
                ))}
              </div>
            </div>

            <textarea
              name="description"
              className="mt-5 w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-violet-500"
              placeholder={t.descriptionPh}
              value={formData.description}
              onChange={handleChange}
            />
          </section>

          {/* ================= IMAGES ================= */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-6 text-slate-900 dark:text-white">{t.sectionPhotos}</h2>

            <button
              type="button"
              onClick={openCloudinaryWidget}
              className="px-5 py-3 bg-black dark:bg-violet-600 text-white rounded-xl font-medium hover:opacity-90"
            >
              {t.uploadImages}
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-slate-600"
                    alt=""
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
                    {t.removeImage}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ================= VIDEO URL ================= */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm p-8">
            <h2 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white">Vidéo (optionnel)</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">Ajoutez un lien vers une vidéo YouTube ou autre pour présenter le véhicule.</p>
            <Input name="videoUrl" placeholder="https://youtube.com/watch?v=..." value={formData.videoUrl} onChange={handleChange} />
          </section>

          {/* ================= SUBMIT ================= */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-black dark:bg-violet-600 text-white rounded-2xl text-lg font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {loading ? t.publishing : t.publishBtn}
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
    className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-violet-500"
  />
);

export default NewSale;
