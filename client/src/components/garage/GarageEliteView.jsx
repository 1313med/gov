import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Car,
  CarFront,
  ChevronRight,
  FileText,
  Fuel,
  Pencil,
  Plus,
  Wrench,
  Shield,
  ClipboardList,
  Receipt,
  CreditCard,
  Droplets,
  Circle,
  StopCircle,
  Battery,
  Cog,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  getMyCar,
  deleteCar,
  bumpMileage,
  setMileage,
  patchGarageReminders,
  getServiceLogs,
  createServiceLog,
  deleteServiceLog,
} from "../../api/userCar";
import {
  computeStatuses,
  buildTrackItems,
  countAlerts,
  soonestDeadline,
  tierColor,
  trackStatusLabel,
  formatTrackDate,
  computeGarageHealth,
} from "../../utils/garageStatus";
import { buildGarageTimeline } from "../../utils/garageTimeline";
import { computeGarageCosts } from "../../utils/garageCosts";
import { getRecommendations } from "../../utils/garageRecommendations";
import { useAppLang } from "../../context/AppLangContext";
import { useTheme } from "../../context/ThemeContext";
import HealthScoreRing from "./HealthScoreRing";
import GarageFeatureGrid from "./GarageFeatureGrid";
import GarageAmbient from "./GarageAmbient";
import GarageDock from "./GarageDock";
import GarageReveal from "./GarageReveal";
import GarageLoader from "./GarageLoader";
import GarageIconBadge from "./GarageIconBadge";
import GarageVehicleHero from "./GarageVehicleHero";
import { GARAGE_FEATURES, GARAGE_TABS } from "../../constants/garageFeatures";
import "../../styles/garage.css";

const ROW_ICONS = {
  "shield-checkmark-outline": Shield,
  "clipboard-outline": ClipboardList,
  "receipt-outline": Receipt,
  "card-outline": CreditCard,
  "water-outline": Droplets,
  "disc-outline": Circle,
  "stop-circle-outline": StopCircle,
  "battery-charging-outline": Battery,
  "cog-outline": Cog,
};

const SERVICE_TYPES = [
  { id: "oil_change", fr: "Vidange", en: "Oil change" },
  { id: "tires", fr: "Pneus", en: "Tyres" },
  { id: "brakes", fr: "Freins", en: "Brakes" },
  { id: "repair", fr: "Réparation", en: "Repair" },
  { id: "other", fr: "Autre", en: "Other" },
];

function fuelLabel(fuel, fr) {
  const map = {
    essence: fr ? "Essence" : "Petrol",
    diesel: "Diesel",
    hybride: fr ? "Hybride" : "Hybrid",
    electrique: fr ? "Électrique" : "Electric",
  };
  return map[fuel] || fuel || "—";
}

function gearboxLabel(g, fr) {
  if (g === "manuelle") return fr ? "Manuelle" : "Manual";
  if (g === "automatique") return fr ? "Automatique" : "Automatic";
  return g || "—";
}

function TrackRow({ item, fr, onClick }) {
  const Icon = ROW_ICONS[item.icon] || FileText;
  const color = tierColor(item.tier, { green: "#22c55e", muted: "#94a3b8" });
  const status = trackStatusLabel(item.value, item.type, fr);
  const sub =
    item.type === "km"
      ? fr
        ? `Prochaine vidange vers ${Number(item.expiry || 0).toLocaleString()} km`
        : `Next oil change around ${Number(item.expiry || 0).toLocaleString()} km`
      : item.expiry
        ? fr
          ? `Expire le ${formatTrackDate(item.expiry, fr)}`
          : `Expires ${formatTrackDate(item.expiry, fr)}`
        : fr
          ? "Date non renseignée — cliquez pour ajouter"
          : "No date yet — click to add";

  return (
    <div
      className="ge-row ge-stagger"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="ge-row-icon" style={{ background: `${item.color}22`, color: item.color }}>
        <Icon size={20} />
      </div>
      <div className="ge-row-body">
        <p className="ge-row-title">{item.label}</p>
        <p className="ge-row-sub">{sub}</p>
      </div>
      <span className="ge-row-status" style={{ color }}>{status}</span>
      <ChevronRight size={18} color="#64748b" />
    </div>
  );
}

export default function GarageEliteView() {
  const navigate = useNavigate();
  const { lang } = useAppLang();
  const { dark } = useTheme();
  const fr = lang === "fr";

  const [car, setCar] = useState(null);
  const [serviceLogs, setServiceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("today");
  const [mileageInput, setMileageInput] = useState("");
  const [mileageSaving, setMileageSaving] = useState(false);
  const [remindersOn, setRemindersOn] = useState(true);
  const [logModal, setLogModal] = useState(false);
  const [logType, setLogType] = useState("oil_change");
  const [logTitle, setLogTitle] = useState("");
  const [logCost, setLogCost] = useState("");
  const [logProvider, setLogProvider] = useState("");
  const [logSaving, setLogSaving] = useState(false);
  const [tipsExpanded, setTipsExpanded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [carRes, logsRes] = await Promise.all([
        getMyCar(),
        getServiceLogs().catch(() => ({ data: [] })),
      ]);
      const c = carRes.data;
      setCar(c);
      setMileageInput(c?.currentMileage != null ? String(c.currentMileage) : "");
      setRemindersOn(c?.garageSettings?.remindersEnabled !== false);
      setServiceLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
    } catch {
      setCar(null);
      setServiceLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const goTools = () => {
      if (window.location.hash === "#outils") setActiveTab("tools");
    };
    goTools();
    window.addEventListener("hashchange", goTools);
    return () => window.removeEventListener("hashchange", goTools);
  }, []);

  const statuses = useMemo(() => computeStatuses(car), [car]);
  const trackItems = useMemo(() => buildTrackItems(car, statuses, fr), [car, statuses, fr]);
  const paperItems = useMemo(() => trackItems.filter((i) => i.category === "papers"), [trackItems]);
  const mechItems = useMemo(() => trackItems.filter((i) => i.category === "mechanical"), [trackItems]);
  const alertCount = useMemo(() => countAlerts(trackItems), [trackItems]);
  const health = useMemo(() => computeGarageHealth(trackItems), [trackItems]);
  const healthColor =
    health.labelKey === "critical"
      ? "#ef4444"
      : health.labelKey === "attention"
        ? "#f97316"
        : health.labelKey === "good"
          ? "#eab308"
          : "#22c55e";
  const healthLabelFr =
    health.labelKey === "critical"
      ? "Attention urgente"
      : health.labelKey === "attention"
        ? "À surveiller"
        : health.labelKey === "good"
          ? "Correct"
          : health.labelKey === "excellent"
            ? "En bonne santé"
            : "Score partiel";
  const nextDue = useMemo(() => soonestDeadline(trackItems, fr), [trackItems, fr]);
  const timeline = useMemo(() => buildGarageTimeline(car, statuses, fr, 30), [car, statuses, fr]);
  const costs = useMemo(() => computeGarageCosts(car, serviceLogs, fr), [car, serviceLogs, fr]);
  const recommendations = useMemo(() => (car ? getRecommendations(car, fr) : []), [car, fr]);
  const todoEvents = timeline.flat || [];

  const goEditItem = (id) => navigate(`/garage/edit/${id}`);
  const goEditCar = () => navigate(`/garage/add?id=${car._id}`);
  const goEstimate = () => {
    const q = new URLSearchParams({
      brand: car?.brand || "",
      model: car?.model || "",
      year: String(car?.year || ""),
      mileage: String(car?.currentMileage || ""),
      fuel: car?.fuelType || "",
    });
    navigate(`/estimate?${q}`);
  };

  const handleBump = async (addKm) => {
    if (!car?._id) return;
    setMileageSaving(true);
    try {
      const res = await bumpMileage(car._id, addKm);
      setCar(res.data);
      setMileageInput(String(res.data.currentMileage ?? ""));
    } catch (e) {
      alert(e?.response?.data?.message || "Error");
    } finally {
      setMileageSaving(false);
    }
  };

  const handleSetMileage = async () => {
    if (!car?._id) return;
    setMileageSaving(true);
    try {
      const res = await setMileage(car._id, Number(mileageInput));
      setCar(res.data);
    } catch (e) {
      alert(e?.response?.data?.message || "Error");
    } finally {
      setMileageSaving(false);
    }
  };

  const toggleReminders = async () => {
    if (!car?._id) return;
    const next = !remindersOn;
    setRemindersOn(next);
    try {
      await patchGarageReminders(car._id, next);
    } catch {
      setRemindersOn(!next);
    }
  };

  const handleDelete = async () => {
    if (!car?._id || !window.confirm(fr ? "Supprimer ma voiture ? Cette action est irréversible." : "Remove your car? This cannot be undone.")) return;
    await deleteCar(car._id);
    setCar(null);
  };

  const submitLog = async () => {
    setLogSaving(true);
    try {
      const typeDef = SERVICE_TYPES.find((t) => t.id === logType);
      await createServiceLog({
        type: logType,
        title: logTitle.trim() || (fr ? typeDef?.fr : typeDef?.en) || "Service",
        date: new Date().toISOString(),
        cost: parseFloat(logCost) || 0,
        provider: logProvider.trim(),
        mileage: car?.currentMileage ?? null,
      });
      setLogModal(false);
      setLogTitle("");
      setLogCost("");
      setLogProvider("");
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Error");
    } finally {
      setLogSaving(false);
    }
  };

  const pageClass = `ge-page${dark ? "" : " light"}`;

  if (loading) {
    return (
      <div className={pageClass}>
        <GarageAmbient />
        <GarageLoader label={fr ? "Préparation de votre garage…" : "Preparing your garage…"} />
        <GarageDock fr={fr} />
      </div>
    );
  }

  if (!car) {
    return (
      <div className={pageClass}>
        <GarageAmbient />
        <div className="ge-body" style={{ paddingTop: 48 }}>
          <div className="ge-empty-wow ge-slide-up">
            <GarageIconBadge icon={CarFront} size="lg" variant="teal" pulse className="ge-icon-badge-empty" />
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 12px" }}>{fr ? "Mon garage" : "My garage"}</h1>
            <span className="ge-tagline">{fr ? "🇲🇦 Pensé pour le Maroc" : "🇲🇦 Built for Morocco"}</span>
            <p style={{ maxWidth: 400, margin: "16px auto 0", lineHeight: 1.6 }}>
              {fr
                ? "Assurance, visite technique, vidange, prix garagiste… tout simple, en darija-friendly français."
                : "Insurance, inspection, oil, mechanic prices… all in one place."}
            </p>
            <Link to="/garage/add" className="ge-cta">
              <Plus size={20} /> {fr ? "Ajouter ma voiture" : "Add my car"}
            </Link>
            <p style={{ marginTop: 24 }}>
              <Link to="/my-sales/new" style={{ color: "#7c6bff" }}>{fr ? "Vendre sans garage" : "Sell without garage"}</Link>
            </p>
          </div>
        </div>
        <GarageDock fr={fr} />
      </div>
    );
  }

  const docCount = car.scannedDocuments?.length || 0;
  const heroHighlights = [
    { key: "year", label: fr ? "Année" : "Year", value: car.year || "—" },
    {
      key: "mileage",
      label: fr ? "Kilométrage" : "Mileage",
      value: `${(car.currentMileage || 0).toLocaleString()} km`,
    },
    { key: "fuel", label: fr ? "Carburant" : "Fuel", value: fuelLabel(car.fuelType, fr) },
    { key: "gearbox", label: fr ? "Boîte" : "Gearbox", value: gearboxLabel(car.gearbox, fr) },
  ];
  const heroDetails = [
    { key: "color", label: fr ? "Couleur" : "Color", value: car.color || "—" },
    {
      key: "owner",
      label: fr ? "1er propriétaire" : "First owner",
      value: car.firstOwner === false ? (fr ? "Non" : "No") : fr ? "Oui" : "Yes",
    },
    {
      key: "mileageUpdate",
      label: fr ? "Dernière mise à jour km" : "Last mileage update",
      value: car.lastMileageAt ? formatTrackDate(car.lastMileageAt, fr) : "—",
    },
  ];
  const oilLine =
    car.vidange?.brand ? (
      <>
        <Droplets size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
        {fr ? "Huile recommandée" : "Recommended oil"}:{" "}
        <strong>{car.vidange.brand}</strong>
        {car.vidange.intervalKm ? ` · ${car.vidange.intervalKm.toLocaleString()} km` : ""}
      </>
    ) : null;

  const shownTips = tipsExpanded ? recommendations : recommendations.slice(0, 2);

  const quickFeatures = GARAGE_FEATURES.slice(0, 6);

  return (
    <div className={pageClass}>
      <GarageAmbient />

      <GarageVehicleHero
        car={car}
        fr={fr}
        docCount={docCount}
        onEdit={goEditCar}
        onDelete={handleDelete}
        highlights={heroHighlights}
        details={heroDetails}
        oilLine={oilLine}
      />

      <div className="ge-body ge-fade-in">
        <div className="ge-tabs-v2">
          {GARAGE_TABS.map((tab) => {
            const TabIcon = tab.Icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`ge-tab-v2${activeTab === tab.id ? " on" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="ge-tab-icon">
                  <TabIcon size={20} strokeWidth={activeTab === tab.id ? 2.25 : 1.85} />
                </span>
                {fr ? tab.fr : tab.en}
              </button>
            );
          })}
        </div>

        {activeTab === "today" && (
          <>
            <GarageReveal>
            <div className="ge-health-hero" style={{ "--ge-health-glow": `${healthColor}55` }}>
              <HealthScoreRing score={health.score} color={healthColor} size={128} fr={fr} />
              <div className="ge-health-body">
                <p className="ge-health-kicker">{fr ? "Score santé voiture" : "Car health score"}</p>
                <h3 style={{ color: healthColor, margin: "4px 0" }}>{fr ? healthLabelFr : health.labelKey}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "var(--ge-muted)" }}>
                  {fr
                    ? "Basé sur assurance, visite, vidange, pneus, freins, batterie…"
                    : "Based on insurance, inspection, oil, tyres, brakes, battery…"}
                </p>
              </div>
            </div>
            </GarageReveal>

            <div className="ge-pill-row">
              <span className={`ge-pill${alertCount > 0 ? " bad" : " ok"}`}>
                {alertCount > 0 ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                {alertCount > 0 ? `${alertCount} ${fr ? "à faire" : "to do"}` : fr ? "À jour" : "Up to date"}
              </span>
              <span className="ge-pill ok">
                <CheckCircle2 size={14} /> {fr ? "Score" : "Score"} {health.score}
              </span>
              <span className="ge-pill warn">
                <Fuel size={14} /> {fuelLabel(car.fuelType, fr)}
              </span>
            </div>

            <GarageReveal delay={80}>
            <div className="ge-section-head">
              <h2>{fr ? "Accès rapide" : "Quick access"}</h2>
              <Link to="#" onClick={(e) => { e.preventDefault(); setActiveTab("tools"); }}>
                {fr ? "Tout voir" : "See all"}
              </Link>
            </div>
            <div className="ge-quick-rail" style={{ marginBottom: 4 }}>
              {quickFeatures.map((f) => {
                const Icon = f.Icon;
                return (
                  <Link key={f.id} to={f.to} className="ge-quick-item ge-stagger">
                    <div className="ge-quick-icon" style={{ background: f.gradient }}>
                      <Icon size={20} color="#fff" />
                    </div>
                    <span>{fr ? f.fr : f.en}</span>
                  </Link>
                );
              })}
            </div>
            </GarageReveal>

            <GarageReveal delay={120}>
            <div className={`ge-status${alertCount > 0 ? " warn" : " ok"}`}>
              {alertCount > 0 ? <AlertCircle size={28} color="#ef4444" /> : <CheckCircle2 size={28} color="#22c55e" />}
              <div>
                <h3>
                  {alertCount > 0
                    ? fr
                      ? `${alertCount} chose${alertCount > 1 ? "s" : ""} à renouveler`
                      : `${alertCount} thing${alertCount > 1 ? "s" : ""} to renew`
                    : fr
                      ? "Tout va bien pour l'instant"
                      : "You're all good for now"}
                </h3>
                <p>
                  {alertCount > 0 && nextDue
                    ? fr
                      ? `En premier : ${nextDue.label} (${nextDue.status})`
                      : `First up: ${nextDue.label} (${nextDue.status})`
                    : fr
                      ? "On vous préviendra avant chaque échéance."
                      : "We'll remind you before each deadline."}
                </p>
              </div>
              {alertCount > 0 && (
                <button type="button" className="ge-status-btn" onClick={() => setActiveTab("car")}>
                  {fr ? "Voir" : "View"}
                </button>
              )}
            </div>
            </GarageReveal>

            <GarageReveal delay={160}>
            <h2 className="ge-section-title">{fr ? "À faire bientôt" : "Coming up"}</h2>
            <p className="ge-section-hint">
              {fr ? "Cliquez sur une ligne pour mettre à jour la date." : "Click a row to update the date."}
            </p>

            {todoEvents.length === 0 ? (
              <div className="ge-empty" style={{ padding: 32 }}>
                <CheckCircle2 size={32} color="#22c55e" style={{ marginBottom: 12 }} />
                {fr ? "Rien d'urgent ce mois-ci." : "Nothing urgent this month."}
              </div>
            ) : (
              <div className="ge-card" style={{ padding: "8px 12px" }}>
                {todoEvents.map((ev) => {
                  const color = tierColor(ev.tier, { green: "#22c55e" });
                  return (
                    <div
                      key={ev.id}
                      className="ge-row"
                      onClick={() => goEditItem(ev.trackId || ev.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <span className="ge-dot" style={{ background: color }} />
                      <div className="ge-row-body">
                        <p className="ge-row-title">{ev.label}</p>
                        <p className="ge-row-sub">{ev.subtitle}</p>
                      </div>
                      <span className="ge-todo-when" style={{ color }}>
                        {ev.daysUntil <= 0 ? (fr ? "Maintenant" : "Now") : fr ? `Dans ${ev.daysUntil} j` : `In ${ev.daysUntil}d`}
                      </span>
                      <ChevronRight size={18} color="#64748b" />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="ge-reminder ge-glass">
              <Bell size={22} color="var(--ge-accent)" />
              <span>{fr ? "Me rappeler avant les échéances" : "Remind me before deadlines"}</span>
              <input type="checkbox" checked={remindersOn} onChange={toggleReminders} />
            </div>
            </GarageReveal>

            <GarageReveal delay={200}>
            <div className="ge-card ge-glass">
              <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800 }}>{fr ? "Kilométrage du compteur" : "Odometer"}</h3>
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--ge-muted)" }}>
                {fr ? "Appuyez si vous avez roulé récemment :" : "Tap if you drove recently:"}
              </p>
              <p className="ge-km-big">{(car.currentMileage || 0).toLocaleString()} km</p>
              <div className="ge-km-btns" style={{ marginBottom: 16 }}>
                {[100, 500, 1000].map((km) => (
                  <button key={km} type="button" className="ge-km-btn" disabled={mileageSaving} onClick={() => handleBump(km)}>
                    +{km} km
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="number"
                  className="ge-input"
                  style={{ flex: 1, marginBottom: 0 }}
                  value={mileageInput}
                  onChange={(e) => setMileageInput(e.target.value)}
                  placeholder={fr ? "Valeur exacte" : "Exact value"}
                />
                <button type="button" className="ge-add-btn" style={{ marginBottom: 0 }} disabled={mileageSaving} onClick={handleSetMileage}>
                  {mileageSaving ? "…" : fr ? "Enregistrer" : "Save"}
                </button>
              </div>
            </div>
            </GarageReveal>

            {recommendations.length > 0 && (
              <GarageReveal delay={240}>
              <div className="ge-card ge-glass">
                <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 800 }}>{fr ? "💡 Conseils" : "💡 Tips"}</h3>
                {shownTips.map((rec, i) => (
                  <div
                    key={i}
                    className={`ge-tip${rec.action === "estimate" ? " clickable" : ""}`}
                    onClick={rec.action === "estimate" ? goEstimate : undefined}
                    role={rec.action === "estimate" ? "button" : undefined}
                  >
                    <span style={{ fontSize: 20 }}>💡</span>
                    <div>
                      <strong style={{ fontSize: 14 }}>{rec.title}</strong>
                      <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--ge-muted)", lineHeight: 1.5 }}>{rec.body}</p>
                    </div>
                  </div>
                ))}
                {recommendations.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setTipsExpanded(!tipsExpanded)}
                    style={{ width: "100%", padding: 12, background: "none", border: "none", color: "var(--ge-accent)", fontWeight: 700, cursor: "pointer" }}
                  >
                    {tipsExpanded ? (fr ? "Moins" : "Less") : fr ? `+ ${recommendations.length - 2} conseils` : `+ ${recommendations.length - 2} tips`}
                  </button>
                )}
              </div>
              </GarageReveal>
            )}
          </>
        )}

        {activeTab === "car" && (
          <>
            <GarageReveal>
            <button type="button" className="ge-edit-banner" onClick={goEditCar}>
              <Pencil size={20} /> {fr ? "Modifier les dates et infos" : "Edit dates & info"}
            </button>
            </GarageReveal>

            <GarageReveal delay={60}>
            <div className="ge-card ge-glass">
              <div className="ge-card-head">
                <FileText size={22} color="#f97316" />
                <div>
                  <h3>{fr ? "Papiers officiels" : "Official papers"}</h3>
                  <p>{fr ? "Assurance, visite, vignette, permis" : "Insurance, inspection, tax, licence"}</p>
                </div>
              </div>
              {paperItems.map((item) => (
                <TrackRow key={item.id} item={item} fr={fr} onClick={() => goEditItem(item.id)} />
              ))}
            </div>
            </GarageReveal>

            <GarageReveal delay={120}>
            <div className="ge-card ge-glass">
              <div className="ge-card-head">
                <Wrench size={22} color="var(--ge-accent)" />
                <div>
                  <h3>{fr ? "Entretien" : "Maintenance"}</h3>
                  <p>{fr ? "Vidange, pneus, freins, batterie…" : "Oil, tyres, brakes, battery…"}</p>
                </div>
              </div>
              {mechItems.map((item) => (
                <TrackRow key={item.id} item={item} fr={fr} onClick={() => goEditItem(item.id)} />
              ))}
            </div>
            </GarageReveal>

            <GarageReveal delay={180}>
            <Link to="/garage/documents" className="ge-card ge-glass ge-row" style={{ textDecoration: "none", marginTop: 8 }}>
              <FileText size={22} color="var(--ge-accent)" />
              <div className="ge-row-body">
                <p className="ge-row-title">{fr ? "Documents scannés" : "Scanned documents"}</p>
                <p className="ge-row-sub">{fr ? "Carte grise, assurance, vignette…" : "Registration, insurance, tax…"}</p>
              </div>
              <span className="ge-row-status" style={{ color: "var(--ge-accent)" }}>{docCount}</span>
              <ChevronRight size={18} />
            </Link>
            </GarageReveal>

            <GarageReveal delay={220}>
            <div className="ge-card ge-glass">
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800 }}>{fr ? "Budget mensuel" : "Monthly budget"}</h3>
              <p className="ge-km-big" style={{ fontSize: 28 }}>
                ~{costs.perMonth.toLocaleString()} MAD
                <span style={{ fontSize: 14, fontWeight: 600 }}> {fr ? "/ mois" : "/ month"}</span>
              </p>
              {costs.breakdown.map((row) => (
                <div key={row.key} className="ge-budget-row">
                  <span style={{ color: "var(--ge-muted)" }}>{row.label}</span>
                  <strong>{row.value.toLocaleString()} MAD</strong>
                </div>
              ))}
            </div>
            </GarageReveal>

            <GarageReveal delay={260}>
            <div className="ge-card ge-glass">
              <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800 }}>{fr ? "Historique garage" : "Service history"}</h3>
              <button type="button" className="ge-add-btn" onClick={() => setLogModal(true)}>
                <Plus size={18} /> {fr ? "Ajouter" : "Add"}
              </button>
              {serviceLogs.slice(0, 8).map((log) => (
                <div key={log._id} className="ge-log-line">
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: 14 }}>{log.title}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--ge-muted)" }}>
                      {new Date(log.date).toLocaleDateString(fr ? "fr-FR" : "en-GB")}
                      {log.provider ? ` · ${log.provider}` : ""}
                    </p>
                  </div>
                  <strong style={{ color: "var(--ge-accent)", marginRight: 8 }}>{Number(log.cost || 0).toLocaleString()} MAD</strong>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(fr ? "Supprimer ?" : "Delete?")) deleteServiceLog(log._id).then(load);
                    }}
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            </GarageReveal>
          </>
        )}

        {activeTab === "tools" && (
          <div id="garage-outils">
            <GarageReveal>
              <p className="ge-section-hint" style={{ marginTop: 0 }}>
                {fr
                  ? "Tous les outils pour votre voiture au Maroc — cliquez pour ouvrir."
                  : "All tools for your car in Morocco — tap to open."}
              </p>
              <GarageFeatureGrid fr={fr} onEstimate={goEstimate} bento />
            </GarageReveal>
          </div>
        )}
      </div>

      <GarageDock fr={fr} />

      {logModal && (
        <div className="ge-modal-bg" onClick={() => setLogModal(false)}>
          <div className="ge-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{fr ? "Ajouter un entretien" : "Add service"}</h3>
            <p style={{ color: "var(--ge-muted)", fontSize: 14, marginBottom: 16 }}>
              {fr ? "Exemple : Vidange chez Total, 450 MAD" : "e.g. Oil change at garage, 450 MAD"}
            </p>
            <div className="ge-chips">
              {SERVICE_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`ge-chip${logType === t.id ? " on" : ""}`}
                  onClick={() => {
                    setLogType(t.id);
                    if (!logTitle) setLogTitle(fr ? t.fr : t.en);
                  }}
                >
                  {fr ? t.fr : t.en}
                </button>
              ))}
            </div>
            <input className="ge-input" value={logTitle} onChange={(e) => setLogTitle(e.target.value)} placeholder={fr ? "Qu'avez-vous fait ?" : "What did you do?"} />
            <input className="ge-input" type="number" value={logCost} onChange={(e) => setLogCost(e.target.value)} placeholder={fr ? "Montant MAD" : "Amount MAD"} />
            <input className="ge-input" value={logProvider} onChange={(e) => setLogProvider(e.target.value)} placeholder={fr ? "Garage (optionnel)" : "Shop (optional)"} />
            <div className="ge-modal-actions">
              <button type="button" style={{ background: "transparent", border: "1px solid var(--ge-border)", color: "var(--ge-txt)" }} onClick={() => setLogModal(false)}>
                {fr ? "Annuler" : "Cancel"}
              </button>
              <button type="button" style={{ background: "var(--ge-accent)", color: "#fff" }} disabled={logSaving} onClick={submitLog}>
                {logSaving ? "…" : fr ? "Enregistrer" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
