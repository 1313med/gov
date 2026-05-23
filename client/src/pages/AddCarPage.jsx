import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { getMyCar, createCar, updateCar } from "../api/userCar";
import { uploadListingImages } from "../api/upload";
import { useAppLang } from "../context/AppLangContext";
import GarageShell from "../components/garage/GarageShell";
import "../styles/garage.css";

const STEPS = [
  { key: "identity", fr: "Identité", en: "Identity" },
  { key: "papers", fr: "Papiers", en: "Papers" },
  { key: "mecanique", fr: "Entretien", en: "Maintenance" },
];

const FUEL_OPTIONS = [
  { id: "essence", fr: "Essence", en: "Petrol" },
  { id: "diesel", fr: "Diesel", en: "Diesel" },
  { id: "hybride", fr: "Hybride", en: "Hybrid" },
  { id: "electrique", fr: "Électrique", en: "Electric" },
];

const GEARBOX_OPTIONS = [
  { id: "manuelle", fr: "Manuelle", en: "Manual" },
  { id: "automatique", fr: "Automatique", en: "Automatic" },
];

function dateVal(d) {
  if (!d) return "";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export default function AddCarPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const navigate = useNavigate();
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const isEdit = !!editId;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [identity, setIdentity] = useState({
    brand: "",
    model: "",
    year: "",
    firstOwner: true,
    fuelType: "essence",
    gearbox: "manuelle",
    currentMileage: "",
    color: "",
  });

  const [papers, setPapers] = useState({
    assuranceStart: "",
    assuranceExpiry: "",
    visiteTechniqueExpiry: "",
    vignetteExpiry: "",
    permisExpiry: "",
  });

  const [mecanique, setMecanique] = useState({
    vidangeDate: "",
    vidangeKm: "",
    vidangeIntervalKm: "10000",
    vidangeBrand: "",
    pneusDate: "",
    pneusBrand: "",
    batterieDate: "",
    batterieBrand: "",
    chainDate: "",
    chainKm: "",
    freinsDate: "",
    freinsBrand: "",
  });

  useEffect(() => {
    if (!editId) return;
    getMyCar()
      .then((r) => {
        const d = r.data;
        if (!d || String(d._id) !== editId) return;
        setIdentity({
          brand: d.brand || "",
          model: d.model || "",
          year: d.year ? String(d.year) : "",
          firstOwner: d.firstOwner !== false,
          fuelType: d.fuelType || "essence",
          gearbox: d.gearbox || "manuelle",
          currentMileage: d.currentMileage != null ? String(d.currentMileage) : "",
          color: d.color || "",
        });
        if (d.image) setImageUrl(d.image);
        setPapers({
          assuranceStart: dateVal(d.assurance?.startDate),
          assuranceExpiry: dateVal(d.assurance?.expiryDate),
          visiteTechniqueExpiry: dateVal(d.visiteTechnique?.expiryDate),
          vignetteExpiry: dateVal(d.vignette?.expiryDate),
          permisExpiry: dateVal(d.permis?.expiryDate),
        });
        setMecanique({
          vidangeDate: dateVal(d.vidange?.lastDate),
          vidangeKm: d.vidange?.lastKm != null ? String(d.vidange.lastKm) : "",
          vidangeIntervalKm: d.vidange?.intervalKm != null ? String(d.vidange.intervalKm) : "10000",
          vidangeBrand: d.vidange?.brand || "",
          pneusDate: dateVal(d.pneus?.lastChangeDate),
          pneusBrand: d.pneus?.brand || "",
          batterieDate: dateVal(d.batterie?.lastChangeDate),
          batterieBrand: d.batterie?.brand || "",
          chainDate: dateVal(d.chainDistribution?.lastChangeDate),
          chainKm: d.chainDistribution?.lastKm != null ? String(d.chainDistribution.lastKm) : "",
          freinsDate: dateVal(d.freins?.lastChangeDate),
          freinsBrand: d.freins?.brand || "",
        });
      })
      .finally(() => setLoading(false));
  }, [editId]);

  const buildPayload = async () => {
    let finalImage = imageUrl;
    if (imageFile) {
      const urls = await uploadListingImages([imageFile]);
      finalImage = urls[0] || null;
    }
    return {
      brand: identity.brand.trim(),
      model: identity.model.trim() || undefined,
      year: identity.year ? Number(identity.year) : undefined,
      firstOwner: identity.firstOwner,
      fuelType: identity.fuelType || undefined,
      gearbox: identity.gearbox || undefined,
      currentMileage: identity.currentMileage ? Number(identity.currentMileage) : undefined,
      color: identity.color.trim() || undefined,
      image: finalImage || undefined,
      assurance: {
        startDate: papers.assuranceStart || null,
        expiryDate: papers.assuranceExpiry || null,
      },
      visiteTechnique: { expiryDate: papers.visiteTechniqueExpiry || null },
      vignette: { expiryDate: papers.vignetteExpiry || null },
      permis: { expiryDate: papers.permisExpiry || null },
      vidange: {
        lastDate: mecanique.vidangeDate || null,
        lastKm: mecanique.vidangeKm ? Number(mecanique.vidangeKm) : null,
        intervalKm: mecanique.vidangeIntervalKm ? Number(mecanique.vidangeIntervalKm) : 10000,
        brand: mecanique.vidangeBrand.trim() || undefined,
      },
      pneus: {
        lastChangeDate: mecanique.pneusDate || null,
        brand: mecanique.pneusBrand.trim() || undefined,
      },
      batterie: {
        lastChangeDate: mecanique.batterieDate || null,
        brand: mecanique.batterieBrand.trim() || undefined,
      },
      chainDistribution: {
        lastChangeDate: mecanique.chainDate || null,
        lastKm: mecanique.chainKm ? Number(mecanique.chainKm) : null,
      },
      freins: {
        lastChangeDate: mecanique.freinsDate || null,
        brand: mecanique.freinsBrand.trim() || undefined,
      },
    };
  };

  const handleSave = async () => {
    if (!identity.brand.trim()) {
      alert(fr ? "La marque est obligatoire." : "Brand is required.");
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const payload = await buildPayload();
      if (isEdit) await updateCar(editId, payload);
      else await createCar(payload);
      navigate("/garage");
    } catch (e) {
      alert(e?.response?.data?.message || (fr ? "Impossible de sauvegarder." : "Could not save."));
    } finally {
      setSaving(false);
    }
  };

  const stepProgress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  if (loading) {
    return (
      <GarageShell fr={fr} emoji="🚗" title="…" subtitle="">
        <div className="ge-loading"><div className="ge-spin" /></div>
      </GarageShell>
    );
  }

  const Field = ({ label, children }) => (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ge-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );

  return (
    <GarageShell
      fr={fr}
      emoji="🚗"
      title={isEdit ? (fr ? "Modifier ma voiture" : "Edit my car") : (fr ? "Ajouter ma voiture" : "Add my car")}
      subtitle={fr ? "3 étapes simples — comme au Maroc" : "3 simple steps"}
      fullWidth
    >
        <div className="ge-glass ge-slide-up" style={{ marginBottom: 16 }}>
          <div style={{ height: 6, background: "var(--ge-border)", borderRadius: 6, overflow: "hidden" }}>
            <div style={{ width: `${stepProgress}%`, height: "100%", background: "linear-gradient(90deg,var(--ge-accent),#a78bfa)", transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--ge-muted)", textAlign: "center" }}>
            {fr ? "Étape" : "Step"} {step + 1} / {STEPS.length}
          </p>
        </div>

        <div className="ge-tabs-v2" style={{ marginBottom: 20 }}>
          {STEPS.map((s, i) => (
            <button key={s.key} type="button" className={`ge-tab-v2${step === i ? " on" : ""}`} onClick={() => setStep(i)}>
              <span className="emoji">{i === 0 ? "🚗" : i === 1 ? "📄" : "🔧"}</span>
              {fr ? s.fr : s.en}
            </button>
          ))}
        </div>

        <div className="ge-card ge-glass">
          {step === 0 && (
            <>
              <Field label={fr ? "Photo" : "Photo"}>
                {(imageUrl || imageFile) && (
                  <img
                    src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                    alt=""
                    style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 12, marginBottom: 10 }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="ge-input"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setImageFile(f);
                      setImageUrl(null);
                    }
                  }}
                />
              </Field>
              <Field label={fr ? "Marque *" : "Brand *"}>
                <input className="ge-input" value={identity.brand} onChange={(e) => setIdentity((p) => ({ ...p, brand: e.target.value }))} />
              </Field>
              <Field label={fr ? "Modèle" : "Model"}>
                <input className="ge-input" value={identity.model} onChange={(e) => setIdentity((p) => ({ ...p, model: e.target.value }))} />
              </Field>
              <Field label={fr ? "Année" : "Year"}>
                <input className="ge-input" type="number" value={identity.year} onChange={(e) => setIdentity((p) => ({ ...p, year: e.target.value }))} />
              </Field>
              <Field label={fr ? "Kilométrage actuel" : "Current mileage"}>
                <input className="ge-input" type="number" value={identity.currentMileage} onChange={(e) => setIdentity((p) => ({ ...p, currentMileage: e.target.value }))} />
              </Field>
              <Field label={fr ? "Carburant" : "Fuel"}>
                <select className="ge-input" value={identity.fuelType} onChange={(e) => setIdentity((p) => ({ ...p, fuelType: e.target.value }))}>
                  {FUEL_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{fr ? o.fr : o.en}</option>
                  ))}
                </select>
              </Field>
              <Field label={fr ? "Boîte de vitesses" : "Gearbox"}>
                <select className="ge-input" value={identity.gearbox} onChange={(e) => setIdentity((p) => ({ ...p, gearbox: e.target.value }))}>
                  {GEARBOX_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>{fr ? o.fr : o.en}</option>
                  ))}
                </select>
              </Field>
              <Field label={fr ? "Couleur" : "Color"}>
                <input className="ge-input" value={identity.color} onChange={(e) => setIdentity((p) => ({ ...p, color: e.target.value }))} />
              </Field>
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 14 }}>
                <input type="checkbox" checked={identity.firstOwner} onChange={(e) => setIdentity((p) => ({ ...p, firstOwner: e.target.checked }))} />
                {fr ? "Premier propriétaire" : "First owner"}
              </label>
            </>
          )}

          {step === 1 && (
            <>
              <p style={{ color: "var(--ge-muted)", fontSize: 13, marginBottom: 16 }}>{fr ? "Dates d'expiration — optionnel mais recommandé." : "Expiry dates — optional but recommended."}</p>
              <Field label={fr ? "Assurance — début" : "Insurance — start"}>
                <input type="date" className="ge-input" value={papers.assuranceStart} onChange={(e) => setPapers((p) => ({ ...p, assuranceStart: e.target.value }))} />
              </Field>
              <Field label={fr ? "Assurance — expiration" : "Insurance — expiry"}>
                <input type="date" className="ge-input" value={papers.assuranceExpiry} onChange={(e) => setPapers((p) => ({ ...p, assuranceExpiry: e.target.value }))} />
              </Field>
              <Field label={fr ? "Visite technique" : "Technical inspection"}>
                <input type="date" className="ge-input" value={papers.visiteTechniqueExpiry} onChange={(e) => setPapers((p) => ({ ...p, visiteTechniqueExpiry: e.target.value }))} />
              </Field>
              <Field label={fr ? "Vignette" : "Road tax"}>
                <input type="date" className="ge-input" value={papers.vignetteExpiry} onChange={(e) => setPapers((p) => ({ ...p, vignetteExpiry: e.target.value }))} />
              </Field>
              <Field label={fr ? "Permis de conduire" : "Driving licence"}>
                <input type="date" className="ge-input" value={papers.permisExpiry} onChange={(e) => setPapers((p) => ({ ...p, permisExpiry: e.target.value }))} />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <p style={{ color: "var(--ge-muted)", fontSize: 13, marginBottom: 16 }}>{fr ? "Dernières interventions — pour les rappels intelligents." : "Last services — for smart reminders."}</p>
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: "16px 0 8px", color: "var(--ge-accent)" }}>{fr ? "Vidange" : "Oil change"}</h3>
              <Field label={fr ? "Date" : "Date"}>
                <input type="date" className="ge-input" value={mecanique.vidangeDate} onChange={(e) => setMecanique((p) => ({ ...p, vidangeDate: e.target.value }))} />
              </Field>
              <Field label={fr ? "Km à la vidange" : "Km at change"}>
                <input type="number" className="ge-input" value={mecanique.vidangeKm} onChange={(e) => setMecanique((p) => ({ ...p, vidangeKm: e.target.value }))} />
              </Field>
              <Field label={fr ? "Intervalle (km)" : "Interval (km)"}>
                <input type="number" className="ge-input" value={mecanique.vidangeIntervalKm} onChange={(e) => setMecanique((p) => ({ ...p, vidangeIntervalKm: e.target.value }))} />
              </Field>
              <Field label={fr ? "Marque d'huile" : "Oil brand"}>
                <input className="ge-input" value={mecanique.vidangeBrand} onChange={(e) => setMecanique((p) => ({ ...p, vidangeBrand: e.target.value }))} />
              </Field>
              {[
                { key: "pneus", title: fr ? "Pneus" : "Tyres", dateKey: "pneusDate", brandKey: "pneusBrand" },
                { key: "freins", title: fr ? "Freins" : "Brakes", dateKey: "freinsDate", brandKey: "freinsBrand" },
                { key: "batterie", title: fr ? "Batterie" : "Battery", dateKey: "batterieDate", brandKey: "batterieBrand" },
                { key: "chain", title: fr ? "Distribution" : "Timing", dateKey: "chainDate", brandKey: null, kmKey: "chainKm" },
              ].map((block) => (
                <div key={block.key}>
                  <h3 style={{ fontSize: 14, fontWeight: 800, margin: "16px 0 8px" }}>{block.title}</h3>
                  <Field label={fr ? "Dernier changement" : "Last change"}>
                    <input type="date" className="ge-input" value={mecanique[block.dateKey]} onChange={(e) => setMecanique((p) => ({ ...p, [block.dateKey]: e.target.value }))} />
                  </Field>
                  {block.brandKey && (
                    <Field label={fr ? "Marque" : "Brand"}>
                      <input className="ge-input" value={mecanique[block.brandKey]} onChange={(e) => setMecanique((p) => ({ ...p, [block.brandKey]: e.target.value }))} />
                    </Field>
                  )}
                  {block.kmKey && (
                    <Field label="Km">
                      <input type="number" className="ge-input" value={mecanique[block.kmKey]} onChange={(e) => setMecanique((p) => ({ ...p, [block.kmKey]: e.target.value }))} />
                    </Field>
                  )}
                </div>
              ))}
            </>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {step > 0 ? (
              <button type="button" className="ge-input" style={{ flex: 1, cursor: "pointer", fontWeight: 700 }} onClick={() => setStep((s) => s - 1)}>
                {fr ? "Précédent" : "Back"}
              </button>
            ) : (
              <div style={{ flex: 1 }} />
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="ge-add-btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => setStep((s) => s + 1)}>
                {fr ? "Suivant" : "Next"} <ChevronRight size={18} />
              </button>
            ) : (
              <button type="button" className="ge-add-btn" style={{ flex: 1, justifyContent: "center" }} disabled={saving} onClick={handleSave}>
                {saving ? "…" : fr ? "Enregistrer" : "Save"}
              </button>
            )}
          </div>
        </div>
    </GarageShell>
  );
}
