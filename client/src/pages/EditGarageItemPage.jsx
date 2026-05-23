import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMyCar, updateCar } from "../api/userCar";
import {
  getGarageItemConfig,
  isValidGarageItemId,
  loadGarageItemForm,
  buildGarageItemPayload,
} from "../utils/garageItemEdit";
import { useAppLang } from "../context/AppLangContext";
import GarageShell from "../components/garage/GarageShell";
import "../styles/garage.css";

export default function EditGarageItemPage() {
  const { field } = useParams();
  const navigate = useNavigate();
  const { lang } = useAppLang();
  const fr = lang === "fr";

  const cfg = useMemo(() => (isValidGarageItemId(field) ? getGarageItemConfig(field) : null), [field]);
  const [car, setCar] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!cfg) {
      setLoading(false);
      return;
    }
    getMyCar()
      .then((r) => {
        if (!r.data) {
          setCar(null);
          return;
        }
        setCar(r.data);
        const loaded = loadGarageItemForm(r.data, field);
        const normalized = {};
        for (const [k, v] of Object.entries(loaded)) {
          normalized[k] = v && typeof v === "string" && v.includes("T") ? formatDateInput(v) : v ?? "";
        }
        setForm(normalized);
      })
      .finally(() => setLoading(false));
  }, [cfg, field]);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      if (!car?._id || !cfg) return;
      const payload = buildGarageItemPayload(field, form);
      if (!payload) return;
      setSaving(true);
      try {
        await updateCar(car._id, payload);
        navigate("/garage");
      } catch (err) {
        alert(err?.response?.data?.message || (fr ? "Impossible d'enregistrer." : "Could not save."));
      } finally {
        setSaving(false);
      }
    },
    [car, cfg, field, form, fr, navigate]
  );

  const accent = cfg?.color ?? "#2dd4bf";

  if (loading) {
    return (
      <GarageShell fr={fr} emoji="✏️" title="…" subtitle="">
        <div className="ge-loading"><div className="ge-spin" /></div>
      </GarageShell>
    );
  }

  if (!cfg || !car) {
    return (
      <GarageShell fr={fr} emoji="❓" title={fr ? "Introuvable" : "Not found"} subtitle="">
        <p>{fr ? "Élément inconnu." : "Unknown item."}</p>
      </GarageShell>
    );
  }

  return (
    <GarageShell
      fr={fr}
      emoji="✏️"
      title={fr ? cfg.titleFr : cfg.titleEn}
      subtitle={fr ? cfg.hintFr : cfg.hintEn}
      heroAccent={accent}
      fullWidth
    >
        <form onSubmit={handleSave} className="ge-card ge-glass ge-slide-up">
          {cfg.fields.map((f) => (
            <label key={f.formKey} style={{ display: "block", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ge-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {fr ? f.labelFr : f.labelEn}
              </span>
              {f.type === "date" ? (
                <input
                  type="date"
                  className="ge-input"
                  style={{ marginTop: 8 }}
                  value={form[f.formKey] || ""}
                  onChange={(e) => setField(f.formKey, e.target.value || null)}
                />
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  className="ge-input"
                  style={{ marginTop: 8 }}
                  value={form[f.formKey] ?? ""}
                  onChange={(e) => setField(f.formKey, e.target.value)}
                />
              )}
            </label>
          ))}

          <button type="submit" className="ge-btn-primary" style={{ background: `linear-gradient(135deg, ${accent}, var(--ge-accent-d))` }} disabled={saving}>
            {saving ? "…" : fr ? "Enregistrer" : "Save"}
          </button>
        </form>
    </GarageShell>
  );
}

function formatDateInput(d) {
  if (!d) return "";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return "";
  }
}
