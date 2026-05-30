import { useState, useEffect } from "react";
import OwnerLayout from "../components/owner/OwnerLayout";
import { getMyStaff, inviteStaff, removeStaff, updateStaffPermissions } from "../api/staff";
import { useTheme } from "../context/ThemeContext";

const PERMISSION_LABELS = {
  manageBookings: { label: "Gérer les réservations", icon: "📋" },
  manageMessages: { label: "Gérer les messages",     icon: "💬" },
  viewAnalytics:  { label: "Voir les analytics",     icon: "📊" },
  managePricing:  { label: "Gérer les prix",          icon: "💰" },
};

const CSS = `
  .sm {
    --bg:     #09090f;
    --s1:     #111118;
    --s2:     #16161f;
    --border: rgba(255,255,255,0.07);
    --bhi:    rgba(255,255,255,0.13);
    --txt:    #e8e8f0;
    --txt2:   #c8c8d8;
    --muted:  #5a5a72;
    --dim:    #3a3a52;
    --violet: #7c6cfc;
    --vi-bg:  rgba(124,108,252,0.12);
    --vi-bd:  rgba(124,108,252,0.25);
    --green:  #34d399;
    --amber:  #f5a623;
    --danger: #fc6c6c;
    --head:   'Poppins', sans-serif;
    --mono:   'DM Mono', monospace;
    background: var(--bg);
    min-height: 100vh;
    color: var(--txt);
    font-family: var(--head);
    padding: clamp(20px,4vw,44px) clamp(16px,3.5vw,44px) 60px;
    box-sizing: border-box;
    width: 100%;
  }
  .sm.light {
    --bg:     #f1f5f9;
    --s1:     #ffffff;
    --s2:     #f8fafc;
    --border: rgba(15,23,42,0.09);
    --bhi:    rgba(15,23,42,0.18);
    --txt:    #0f172a;
    --txt2:   #334155;
    --muted:  #64748b;
    --dim:    #cbd5e1;
    --violet: #6d28d9;
    --vi-bg:  rgba(109,40,217,0.08);
    --vi-bd:  rgba(109,40,217,0.20);
    --green:  #059669;
    --amber:  #d97706;
    --danger: #dc2626;
  }

  /* Header */
  .sm-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: clamp(24px,5vw,40px); flex-wrap: wrap; }
  .sm-eyebrow { font-family: var(--mono); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }
  .sm-title { font-size: clamp(26px,6vw,36px); font-weight: 800; letter-spacing: -.04em; line-height: 1.05; margin: 0; color: var(--txt); }
  .sm-title em { font-style: italic; background: linear-gradient(90deg,#7c6cfc,#38bdf8); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
  .sm-badge { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 99px; background: var(--vi-bg); border: 1px solid var(--vi-bd); font-family: var(--mono); font-size: 10px; letter-spacing: .08em; color: var(--violet); }
  .sm-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--violet); box-shadow: 0 0 8px var(--violet); animation: sm-pulse 2s ease-in-out infinite; }
  @keyframes sm-pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }

  /* Grid layout */
  .sm-grid { display: grid; grid-template-columns: 1fr; gap: 20px; }
  @media(min-width:1000px) { .sm-grid { grid-template-columns: 1fr 380px; } }

  /* Card */
  .sm-card { background: var(--s1); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; transition: border-color .2s; }
  .sm-card:hover { border-color: var(--bhi); }
  .sm-card-head { padding: 20px 22px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .sm-card-title { font-size: 14px; font-weight: 700; letter-spacing: -.02em; color: var(--txt); }
  .sm-card-sub { font-family: var(--mono); font-size: 10px; color: var(--muted); margin-top: 2px; }
  .sm-card-body { padding: 20px 22px; }

  /* Staff list */
  .sm-staff-list { display: flex; flex-direction: column; gap: 12px; }
  .sm-staff-item { background: var(--s2); border: 1px solid var(--border); border-radius: 14px; padding: 16px; transition: border-color .2s; }
  .sm-staff-item:hover { border-color: var(--bhi); }
  .sm-staff-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
  .sm-staff-meta { display: flex; align-items: center; gap: 12px; }
  .sm-avatar { width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg,#7c6cfc,#38bdf8); display: flex; align-items: center; justify-content: center; font-family: var(--head); font-size: 15px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .sm-staff-name { font-size: 13px; font-weight: 700; color: var(--txt); letter-spacing: -.01em; }
  .sm-staff-phone { font-family: var(--mono); font-size: 11px; color: var(--muted); margin-top: 2px; }
  .sm-remove-btn { padding: 5px 12px; border-radius: 8px; border: 1px solid rgba(252,108,108,.25); background: rgba(252,108,108,.07); color: var(--danger); font-family: var(--mono); font-size: 10px; letter-spacing: .05em; cursor: pointer; transition: all .2s; }
  .sm-remove-btn:hover { background: rgba(252,108,108,.15); border-color: rgba(252,108,108,.4); }

  /* Permission toggles */
  .sm-perms { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .sm-perm { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 8px 10px; border-radius: 10px; background: var(--bg); border: 1px solid var(--border); cursor: pointer; transition: border-color .2s; }
  .sm-perm:hover { border-color: var(--bhi); }
  .sm-perm-left { display: flex; align-items: center; gap: 7px; }
  .sm-perm-icon { font-size: 13px; }
  .sm-perm-label { font-family: var(--mono); font-size: 10px; color: var(--txt2); letter-spacing: .02em; }
  .sm-toggle { width: 32px; height: 18px; border-radius: 99px; border: none; cursor: pointer; position: relative; transition: background .2s; flex-shrink: 0; }
  .sm-toggle.on  { background: var(--violet); }
  .sm-toggle.off { background: var(--dim); }
  .sm-toggle::after { content:''; position:absolute; top:2px; width:14px; height:14px; border-radius:50%; background:#fff; transition:left .2s; box-shadow:0 1px 4px rgba(0,0,0,.25); }
  .sm-toggle.on::after  { left:16px; }
  .sm-toggle.off::after { left:2px; }

  /* Pending invites */
  .sm-invite-list { display: flex; flex-direction: column; gap: 10px; }
  .sm-invite-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 12px; background: var(--s2); border: 1px dashed var(--border); }
  .sm-invite-name { font-size: 13px; font-weight: 600; color: var(--txt); }
  .sm-invite-meta { font-family: var(--mono); font-size: 10px; color: var(--muted); margin-top: 2px; }
  .sm-pending-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; background: rgba(245,166,35,.1); border: 1px solid rgba(245,166,35,.25); font-family: var(--mono); font-size: 9px; letter-spacing: .07em; color: var(--amber); white-space: nowrap; }

  /* Invite form */
  .sm-form { display: flex; flex-direction: column; gap: 14px; }
  .sm-field { display: flex; flex-direction: column; gap: 5px; }
  .sm-label { font-family: var(--mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
  .sm-input { background: var(--s2); border: 1px solid var(--border); border-radius: 11px; padding: 12px 14px; font-family: var(--mono); font-size: 13px; color: var(--txt); outline: none; transition: border-color .2s, box-shadow .2s; width: 100%; box-sizing: border-box; }
  .sm-input::placeholder { color: var(--dim); }
  .sm-input:focus { border-color: var(--violet); box-shadow: 0 0 0 3px rgba(124,108,252,.1); }
  .sm-input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .sm-perm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .sm-perm-check { display: flex; align-items: center; gap: 8px; padding: 9px 11px; border-radius: 10px; background: var(--s2); border: 1px solid var(--border); cursor: pointer; transition: all .2s; }
  .sm-perm-check.checked { border-color: var(--vi-bd); background: var(--vi-bg); }
  .sm-perm-check:hover:not(.checked) { border-color: var(--bhi); }
  .sm-perm-check-icon { font-size: 13px; }
  .sm-perm-check-label { font-family: var(--mono); font-size: 10px; color: var(--txt2); flex: 1; }
  .sm-check-indicator { width: 16px; height: 16px; border-radius: 5px; border: 1px solid var(--border); background: var(--bg); display: flex; align-items: center; justify-content: center; font-size: 10px; flex-shrink: 0; transition: all .2s; }
  .sm-perm-check.checked .sm-check-indicator { background: var(--violet); border-color: var(--violet); color: #fff; }

  .sm-submit { width: 100%; padding: 14px; background: linear-gradient(135deg,#7c6cfc,#9b8cff); border: none; border-radius: 12px; color: #fff; font-family: var(--head); font-size: 14px; font-weight: 700; cursor: pointer; transition: opacity .2s, transform .2s; display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: -.01em; }
  .sm-submit:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
  .sm-submit:disabled { opacity: .5; cursor: not-allowed; }
  .sm-spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; animation: sm-spin .7s linear infinite; }
  @keyframes sm-spin { to { transform: rotate(360deg); } }

  /* Feedback */
  .sm-msg { padding: 11px 14px; border-radius: 10px; font-family: var(--mono); font-size: 12px; }
  .sm-msg.success { background: rgba(52,211,153,.08); border: 1px solid rgba(52,211,153,.2); color: var(--green); }
  .sm-msg.error   { background: rgba(252,108,108,.08); border: 1px solid rgba(252,108,108,.2); color: var(--danger); }

  /* Empty state */
  .sm-empty { padding: 36px 20px; text-align: center; font-family: var(--mono); font-size: 12px; color: var(--muted); }
  .sm-empty-icon { font-size: 32px; margin-bottom: 10px; }

  @keyframes sm-up { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  .sm-fade { opacity:0; animation: sm-up .45s ease forwards; }

  @media(max-width:640px) {
    .sm-input-grid { grid-template-columns: 1fr; }
    .sm-perms { grid-template-columns: 1fr; }
    .sm-perm-grid { grid-template-columns: 1fr; }
  }
`;

export default function StaffManagementPage() {
  const { dark } = useTheme();
  const [data, setData]     = useState({ staff: [], pendingInvites: [] });
  const [form, setForm]     = useState({
    phone: "", name: "",
    permissions: { manageBookings: true, manageMessages: true, viewAnalytics: false, managePricing: false },
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState(null);

  const load = () => getMyStaff().then((r) => setData(r.data));
  useEffect(() => { load(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await inviteStaff(form);
      setMsg({ type: "success", text: "✓ Invitation envoyée avec succès !" });
      setForm({ phone: "", name: "", permissions: { manageBookings: true, manageMessages: true, viewAnalytics: false, managePricing: false } });
      load();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Erreur lors de l'envoi" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm("Retirer ce membre de l'équipe ?")) return;
    await removeStaff(userId);
    load();
  };

  const togglePermission = async (userId, perm, current) => {
    await updateStaffPermissions(userId, { [perm]: !current });
    load();
  };

  const toggleFormPerm = (perm) =>
    setForm((p) => ({ ...p, permissions: { ...p.permissions, [perm]: !p.permissions[perm] } }));

  const rootCls = `sm${dark ? "" : " light"}`;
  const totalMembers = data.staff.length + data.pendingInvites.length;

  return (
    <OwnerLayout>
      <style>{CSS}</style>
      <div className={rootCls}>

        {/* ── HEADER ── */}
        <header className="sm-header sm-fade">
          <div>
            <p className="sm-eyebrow">Gestion d'équipe</p>
            <h1 className="sm-title">Mon <em>équipe</em></h1>
          </div>
          <div className="sm-badge">
            <span className="sm-badge-dot" />
            {totalMembers} membre{totalMembers !== 1 ? "s" : ""}
          </div>
        </header>

        <div className="sm-grid">

          {/* ── LEFT COLUMN: staff + invites ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Active staff */}
            <div className="sm-card sm-fade" style={{ animationDelay: "60ms" }}>
              <div className="sm-card-head">
                <div>
                  <p className="sm-card-title">Membres actifs</p>
                  <p className="sm-card-sub">{data.staff.length} collaborateur{data.staff.length !== 1 ? "s" : ""}</p>
                </div>
                <span style={{ fontSize: 20 }}>👥</span>
              </div>
              <div className="sm-card-body">
                {data.staff.length === 0 ? (
                  <div className="sm-empty">
                    <div className="sm-empty-icon">🤝</div>
                    Aucun membre actif pour l'instant
                  </div>
                ) : (
                  <div className="sm-staff-list">
                    {data.staff.map((s) => (
                      <div key={s._id} className="sm-staff-item">
                        <div className="sm-staff-top">
                          <div className="sm-staff-meta">
                            <div className="sm-avatar">{(s.name?.[0] || "?").toUpperCase()}</div>
                            <div>
                              <p className="sm-staff-name">{s.name}</p>
                              <p className="sm-staff-phone">{s.phone}</p>
                            </div>
                          </div>
                          <button className="sm-remove-btn" onClick={() => handleRemove(s._id)}>Retirer</button>
                        </div>
                        <div className="sm-perms">
                          {Object.entries(PERMISSION_LABELS).map(([perm, { label, icon }]) => {
                            const on = !!s.staffPermissions?.[perm];
                            return (
                              <div key={perm} className="sm-perm" onClick={() => togglePermission(s._id, perm, on)}>
                                <div className="sm-perm-left">
                                  <span className="sm-perm-icon">{icon}</span>
                                  <span className="sm-perm-label">{label}</span>
                                </div>
                                <button className={`sm-toggle ${on ? "on" : "off"}`} type="button" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Pending invites */}
            {data.pendingInvites.length > 0 && (
              <div className="sm-card sm-fade" style={{ animationDelay: "100ms" }}>
                <div className="sm-card-head">
                  <div>
                    <p className="sm-card-title">Invitations en attente</p>
                    <p className="sm-card-sub">{data.pendingInvites.length} invitation{data.pendingInvites.length !== 1 ? "s" : ""}</p>
                  </div>
                  <span style={{ fontSize: 20 }}>⏳</span>
                </div>
                <div className="sm-card-body">
                  <div className="sm-invite-list">
                    {data.pendingInvites.map((inv) => (
                      <div key={inv._id} className="sm-invite-item">
                        <div>
                          <p className="sm-invite-name">{inv.name}</p>
                          <p className="sm-invite-meta">
                            {inv.phone} · Expire le {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <span className="sm-pending-pill">⏳ En attente</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: invite form ── */}
          <div className="sm-card sm-fade" style={{ animationDelay: "80ms", alignSelf: "start" }}>
            <div className="sm-card-head">
              <div>
                <p className="sm-card-title">Inviter un collaborateur</p>
                <p className="sm-card-sub">Accès limité par permissions</p>
              </div>
              <span style={{ fontSize: 20 }}>✉️</span>
            </div>
            <div className="sm-card-body">
              <form onSubmit={handleInvite} className="sm-form">

                <div className="sm-input-grid">
                  <div className="sm-field">
                    <label className="sm-label">Prénom & Nom</label>
                    <input
                      type="text"
                      className="sm-input"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Mohamed Alami"
                      required
                    />
                  </div>
                  <div className="sm-field">
                    <label className="sm-label">Téléphone</label>
                    <input
                      type="tel"
                      className="sm-input"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="06XXXXXXXX"
                      required
                    />
                  </div>
                </div>

                <div className="sm-field">
                  <label className="sm-label">Permissions accordées</label>
                  <div className="sm-perm-grid">
                    {Object.entries(PERMISSION_LABELS).map(([perm, { label, icon }]) => {
                      const checked = !!form.permissions[perm];
                      return (
                        <div
                          key={perm}
                          className={`sm-perm-check${checked ? " checked" : ""}`}
                          onClick={() => toggleFormPerm(perm)}
                        >
                          <span className="sm-perm-check-icon">{icon}</span>
                          <span className="sm-perm-check-label">{label}</span>
                          <span className="sm-check-indicator">{checked ? "✓" : ""}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {msg && (
                  <div className={`sm-msg ${msg.type}`}>{msg.text}</div>
                )}

                <button type="submit" className="sm-submit" disabled={saving}>
                  {saving ? (
                    <><span className="sm-spinner" /> Envoi en cours…</>
                  ) : (
                    <>✉️ Envoyer l'invitation</>
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </OwnerLayout>
  );
}
