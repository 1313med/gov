import { useNavigate } from "react-router-dom";
import { addMyRole } from "../api/user";
import { saveAuth, loadAuth } from "../utils/authStorage";
import { useActiveMode } from "../context/ActiveModeContext";
import { useAppLang } from "../context/AppLangContext";
import { shellPathForMode, isAdminOnlyUser } from "../utils/userRoles";

const MODES = [
  { key: "customer", en: "Explore", fr: "Explorer", color: "#7c6bff" },
  { key: "car_owner", en: "My garage", fr: "Mon garage", color: "#38bdf8" },
  { key: "rental_owner", en: "My fleet", fr: "Ma flotte", color: "#34d399" },
  { key: "admin", en: "Admin", fr: "Admin", color: "#f87171" },
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
    <div style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: "#94a3b8", marginBottom: 12 }}>
        {fr ? "VOS ESPACES GOOVOITURE" : "YOUR GOOVOITURE SPACES"}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        {visible.map((m) => {
          const active = activeMode === m.key;
          const unlocked = canAccess(m.key);
          const label = fr ? m.fr : m.en;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onPressMode(m.key)}
              style={{
                padding: "14px 12px",
                borderRadius: 14,
                border: `1px solid ${active ? m.color : "rgba(148,163,184,.35)"}`,
                background: active ? `${m.color}18` : "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: active ? m.color : "#0f172a" }}>{label}</div>
              {!unlocked && m.key !== "customer" ? (
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{fr ? "Activer" : "Enable"}</div>
              ) : active ? (
                <div style={{ fontSize: 11, color: m.color, marginTop: 4 }}>{fr ? "Actif" : "Active"}</div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
