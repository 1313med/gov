import { useNavigate } from "react-router-dom";
import { CarFront, Compass, Shield, Sparkles, Warehouse } from "lucide-react";
import { addMyRole } from "../api/user";
import { saveAuth, loadAuth } from "../utils/authStorage";
import { useActiveMode } from "../context/ActiveModeContext";
import { useAppLang } from "../context/AppLangContext";
import { shellPathForMode, isAdminOnlyUser } from "../utils/userRoles";
import "../styles/role-mode-switcher.css";

const MODES = [
  {
    key: "customer",
    en: "Explore",
    fr: "Explorer",
    color: "#7c6bff",
    Icon: Compass,
    subEn: "Buy or rent",
    subFr: "Acheter ou louer",
  },
  {
    key: "car_owner",
    en: "My garage",
    fr: "Mon garage",
    color: "#38bdf8",
    Icon: CarFront,
    subEn: "Track and maintain",
    subFr: "Suivi et entretien",
  },
  {
    key: "rental_owner",
    en: "My fleet",
    fr: "Ma flotte",
    color: "#34d399",
    Icon: Warehouse,
    subEn: "Manage rentals",
    subFr: "Gerer les locations",
  },
  {
    key: "admin",
    en: "Admin",
    fr: "Admin",
    color: "#f87171",
    Icon: Shield,
    subEn: "Platform control",
    subFr: "Controle plateforme",
  },
];

export default function RoleModeSwitcher() {
  const { lang } = useAppLang();
  const fr = lang === "fr";
  const navigate = useNavigate();
  const { auth, activeMode, setActiveMode, canAccess, refreshAuth } = useActiveMode();

  const enableRole = async (roleKey) => {
    try {
      const { data } = await addMyRole(roleKey);
      const merged = { ...loadAuth(), ...data };
      saveAuth(merged);
      refreshAuth(merged);
      await setActiveMode(roleKey);
      navigate(shellPathForMode(roleKey));
    } catch (e) {
      alert(e?.response?.data?.message || (fr ? "Impossible d'activer ce mode." : "Could not enable this mode."));
    }
  };

  const onPressMode = async (key) => {
    if (canAccess(key)) {
      await setActiveMode(key);
      navigate(shellPathForMode(key));
      return;
    }
    if (key === "admin") return;
    const labels = {
      car_owner: fr ? "Suivre ma voiture et vendre plus tard" : "Track my car and sell when ready",
      rental_owner: fr ? "Louer mes voitures" : "Rent out my cars",
    };
    if (!window.confirm(`${fr ? "Activer ce mode ?" : "Enable this mode?"}\n\n${labels[key] || ""}`)) return;
    await enableRole(key);
  };

  const visible = MODES.filter((m) => m.key !== "admin" || isAdminOnlyUser(auth));

  return (
    <div className="rms-wrap">
      <div className="rms-head">
        <p className="rms-kicker">{fr ? "SELECTIONNEZ VOTRE PARCOURS" : "SELECT YOUR PATH"}</p>
        <h2 className="rms-title">{fr ? "Vos espaces Goovoiture" : "Your Goovoiture spaces"}</h2>
        <p className="rms-sub">
          {fr ? "Basculez entre vos roles en 1 clic." : "Switch between your modes in one tap."}
        </p>
      </div>

      <div className="rms-grid">
        {visible.map((m) => {
          const active = activeMode === m.key;
          const unlocked = canAccess(m.key);
          const label = fr ? m.fr : m.en;
          const subtitle = fr ? m.subFr : m.subEn;
          const Icon = m.Icon;

          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onPressMode(m.key)}
              className={`rms-card${active ? " on" : ""}${!unlocked && m.key !== "customer" ? " locked" : ""}`}
              style={{ "--rms-color": m.color }}
            >
              <span className="rms-icon">
                <Icon size={20} strokeWidth={2} />
              </span>
              <div className="rms-label">{label}</div>
              <div className="rms-desc">{subtitle}</div>
              {!unlocked && m.key !== "customer" ? (
                <div className="rms-meta">
                  <span className="rms-dot" />
                  {fr ? "Activer" : "Enable"}
                </div>
              ) : active ? (
                <div className="rms-meta">
                  <Sparkles size={12} />
                  {fr ? "Actif" : "Active"}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
