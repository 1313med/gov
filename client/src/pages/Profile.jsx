import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMyProfile,
  updateMyProfile,
  updateDriverLicense,
  updateNationalId,
  getFavorites,
} from "../api/user";
import { getMyBookings } from "../api/booking";
import { loadAuth, saveAuth } from "../utils/authStorage";
import RoleModeSwitcher from "../components/RoleModeSwitcher";
import { useTheme } from "../context/ThemeContext";
import { useAppLang } from "../context/AppLangContext";

const ROLE_CLR = {
  customer:     { bg: "rgba(14,165,233,.1)",  color: "#0ea5e9", border: "rgba(14,165,233,.28)"  },
  rental_owner: { bg: "rgba(124,107,255,.1)", color: "#7c6bff", border: "rgba(124,107,255,.28)" },
  seller:       { bg: "rgba(16,185,129,.1)",  color: "#059669", border: "rgba(16,185,129,.28)"  },
  admin:        { bg: "rgba(239,68,68,.1)",   color: "#ef4444", border: "rgba(239,68,68,.28)"   },
};

const STYLES = `

  .gp-page {
    min-height: 100vh;
    background: #f5f7ff;
    font-family: 'Poppins', sans-serif;
    transition: background .3s;
  }
  .gp-page.dark { background: #05060f; }

  /* ── Hero banner ── */
  .gp-hero {
    height: 160px;
    background: linear-gradient(135deg, #0b163d 0%, #7c6bff 60%, #38bdf8 100%);
    position: relative;
  }
  .gp-hero::after {
    content: "";
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }

  .gp-container {
    max-width: 700px;
    margin: 0 auto;
    padding: 0 20px 80px;
  }

  /* ── Identity row (overlaps hero) ── */
  .gp-identity {
    margin-top: -54px;
    margin-bottom: 28px;
    display: flex;
    align-items: flex-end;
    gap: 20px;
  }

  .gp-avatar-wrap { position: relative; flex-shrink: 0; }

  .gp-avatar {
    width: 108px; height: 108px;
    border-radius: 50%;
    border: 4px solid #fff;
    background: rgba(124,107,255,.12);
    overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    font-size: 38px; font-weight: 800; color: #7c6bff;
    cursor: pointer;
    transition: border-color .2s, box-shadow .2s;
    box-shadow: 0 4px 20px rgba(0,0,0,.14);
  }
  .gp-page.dark .gp-avatar { border-color: #05060f; }
  .gp-avatar:hover { border-color: #7c6bff; box-shadow: 0 4px 24px rgba(124,107,255,.3); }
  .gp-avatar img { width: 100%; height: 100%; object-fit: cover; }

  .gp-avatar-cam {
    position: absolute; bottom: 2px; right: 2px;
    width: 28px; height: 28px; border-radius: 50%;
    background: #7c6bff; border: 2.5px solid #fff;
    display: flex; align-items: center; justify-content: center;
    color: #fff; pointer-events: none;
  }
  .gp-page.dark .gp-avatar-cam { border-color: #05060f; }

  .gp-id-text { flex: 1; padding-bottom: 6px; }

  .gp-name {
    font-size: 22px; font-weight: 800; color: #0b163d;
    margin: 0 0 8px; line-height: 1.2;
  }
  .gp-page.dark .gp-name { color: #f5f7ff; }

  .gp-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

  .gp-role-badge {
    font-family: 'DM Mono', monospace;
    font-size: 10px; font-weight: 500;
    text-transform: uppercase; letter-spacing: .07em;
    padding: 3px 10px; border-radius: 999px; border: 1.5px solid;
  }

  .gp-meta-item {
    display: flex; align-items: center; gap: 4px;
    font-size: 12px; color: #6b7280;
  }
  .gp-page.dark .gp-meta-item { color: #8a95bf; }

  /* ── Stats ── */
  .gp-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 12px; margin-bottom: 28px;
  }
  @media (max-width: 480px) { .gp-stats { grid-template-columns: repeat(2, 1fr); } }

  .gp-stat {
    background: #fff;
    border: 1px solid rgba(12,26,86,.08); border-radius: 14px;
    padding: 16px 18px;
  }
  .gp-page.dark .gp-stat { background: #0e0f1e; border-color: rgba(255,255,255,.07); }

  .gp-stat-value {
    font-family: 'DM Mono', monospace;
    font-size: 24px; font-weight: 700; color: #7c6bff;
    line-height: 1; display: block; margin-bottom: 4px;
  }
  .gp-stat-label {
    font-size: 11px; font-weight: 500;
    color: #9ca3af; text-transform: uppercase; letter-spacing: .05em;
  }

  /* ── Cards ── */
  .gp-card {
    background: #fff;
    border: 1px solid rgba(12,26,86,.08); border-radius: 18px;
    padding: 28px; margin-bottom: 20px;
  }
  .gp-page.dark .gp-card { background: #0e0f1e; border-color: rgba(255,255,255,.07); }

  .gp-card-header {
    display: flex; align-items: baseline; gap: 10px; margin-bottom: 22px;
  }
  .gp-card-title {
    font-size: 16px; font-weight: 700; color: #0b163d; margin: 0;
  }
  .gp-page.dark .gp-card-title { color: #f5f7ff; }
  .gp-card-sub {
    font-size: 12px; color: #9ca3af; font-weight: 400;
  }

  /* ── Form ── */
  .gp-fields { display: flex; flex-direction: column; gap: 16px; }

  .gp-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  @media (max-width: 500px) { .gp-row2 { grid-template-columns: 1fr; } }

  .gp-field { display: flex; flex-direction: column; gap: 6px; }

  .gp-label {
    font-size: 11px; font-weight: 600; color: #6b7280;
    text-transform: uppercase; letter-spacing: .06em;
  }

  .gp-input, .gp-textarea {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid rgba(12,26,86,.11); border-radius: 10px;
    font-size: 14px; font-family: 'Poppins', sans-serif;
    color: #0b163d; background: #fafafa;
    outline: none; box-sizing: border-box;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .gp-page.dark .gp-input, .gp-page.dark .gp-textarea {
    background: rgba(255,255,255,.04); border-color: rgba(255,255,255,.1); color: #f5f7ff;
  }
  .gp-input:focus, .gp-textarea:focus {
    border-color: #7c6bff; box-shadow: 0 0 0 3px rgba(124,107,255,.12); background: #fff;
  }
  .gp-page.dark .gp-input:focus, .gp-page.dark .gp-textarea:focus {
    background: rgba(124,107,255,.05);
  }
  .gp-input[readonly] {
    background: rgba(12,26,86,.03); color: #9ca3af; cursor: not-allowed;
  }
  .gp-page.dark .gp-input[readonly] {
    background: rgba(255,255,255,.02); color: #4b5563;
  }
  .gp-textarea { resize: vertical; min-height: 90px; }

  .gp-btn {
    padding: 13px 24px; background: #0b163d; color: #fff;
    border: none; border-radius: 12px;
    font-family: 'Poppins', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; width: 100%; margin-top: 4px;
    transition: background .2s, box-shadow .2s, opacity .2s;
  }
  .gp-btn:hover:not(:disabled) { background: #7c6bff; box-shadow: 0 4px 16px rgba(124,107,255,.3); }
  .gp-btn:disabled { opacity: .55; cursor: not-allowed; }
  .gp-page.dark .gp-btn { background: #7c6bff; }
  .gp-page.dark .gp-btn:hover:not(:disabled) { background: #9b8cff; }

  .gp-msg {
    font-size: 13px; padding: 10px 14px;
    border-radius: 8px; margin-top: 2px;
  }
  .gp-msg.success { background: rgba(5,150,105,.08); color: #059669; border: 1px solid rgba(5,150,105,.2); }
  .gp-msg.error   { background: rgba(220,38,38,.07);  color: #dc2626; border: 1px solid rgba(220,38,38,.2);  }

  /* ── License ── */
  .gp-lic-badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 14px; border-radius: 999px;
    font-size: 12px; font-weight: 600; border: 1px solid;
    margin-bottom: 18px;
  }

  .gp-lic-photo-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .gp-lic-photo {
    width: 130px; height: 82px; object-fit: cover;
    border-radius: 9px; border: 1px solid rgba(12,26,86,.1);
  }
  .gp-page.dark .gp-lic-photo { border-color: rgba(255,255,255,.1); }

  .gp-upload-zone {
    padding: 18px 20px; width: 100%; box-sizing: border-box;
    background: rgba(124,107,255,.06); border: 1.5px dashed rgba(124,107,255,.35);
    border-radius: 11px; font-size: 13px; font-weight: 600; color: #7c6bff;
    cursor: pointer; transition: background .2s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .gp-upload-zone:hover { background: rgba(124,107,255,.11); }

  .gp-replace-btn {
    padding: 9px 16px; background: rgba(12,26,86,.05);
    border: 1px solid rgba(12,26,86,.12); border-radius: 9px;
    font-size: 12px; font-weight: 600; color: #374151;
    cursor: pointer; transition: all .2s; white-space: nowrap;
  }
  .gp-page.dark .gp-replace-btn {
    background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.1); color: #bcc5e8;
  }
  .gp-replace-btn:hover { border-color: #7c6bff; color: #7c6bff; background: rgba(124,107,255,.07); }

  /* ── Loading ── */
  .gp-loading {
    display: flex; align-items: center; justify-content: center;
    height: 60vh; color: #9ca3af;
    font-family: 'Poppins', sans-serif; font-size: 14px; gap: 10px;
  }
  .gp-spin {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid rgba(124,107,255,.2); border-top-color: #7c6bff;
    animation: gp-spin .7s linear infinite;
  }
  @keyframes gp-spin { to { transform: rotate(360deg); } }

  @media (max-width: 480px) {
    .gp-hero { height: 120px; }
    .gp-avatar { width: 88px; height: 88px; font-size: 30px; }
    .gp-name { font-size: 18px; }
    .gp-card { padding: 18px; }
  }
`;

/* ── SVG icons ── */
const ICO_PIN = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const ICO_CLOCK = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const ICO_CAMERA = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);
const ICO_UPLOAD = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

export default function Profile() {
  const auth     = loadAuth();
  const navigate = useNavigate();

  const { dark } = useTheme();
  const { copy, lang } = useAppLang();
  const t = copy.profile;
  const dateLocale = lang === "fr" ? "fr-FR" : "en-US";
  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString(dateLocale, { month: "long", year: "numeric" }) : t.unknown;

  const [profile,       setProfile]       = useState(null);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [favCount,      setFavCount]      = useState(0);
  const [loading,       setLoading]       = useState(true);

  const [form, setForm] = useState({
    name: "", email: "", city: "", bio: "", avatar: "",
  });
  const [license, setLicense]               = useState({ number: "", expiryDate: "", imageUrl: "" });
  const [existingLicense, setExistingLicense] = useState(null);

  const [nationalIdForm, setNationalIdForm] = useState({ number: "", imageUrl: "" });
  const [existingNationalId, setExistingNationalId] = useState(null);

  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState(null);
  const [licSaving, setLicSaving] = useState(false);
  const [licMsg,   setLicMsg]   = useState(null);
  const [cinSaving, setCinSaving] = useState(false);
  const [cinMsg,   setCinMsg]   = useState(null);

  useEffect(() => {
    if (!auth?._id) { navigate("/login"); return; }

    const load = async () => {
      try {
        const promises = [getMyProfile()];
        if (auth.role === "customer") {
          promises.push(getMyBookings(), getFavorites());
        }
        const [profileRes, bookingsRes, favsRes] = await Promise.all(promises);
        const u = profileRes.data;
        setProfile(u);
        setForm({
          name:   u.name   || "",
          email:  u.email  || "",
          city:   u.city   || "",
          bio:    u.bio    || "",
          avatar: u.avatar || "",
        });
        if (u.driverLicense?.number) {
          setExistingLicense(u.driverLicense);
          setLicense({
            number:     u.driverLicense.number || "",
            expiryDate: u.driverLicense.expiryDate
              ? u.driverLicense.expiryDate.slice(0, 10)
              : "",
            imageUrl: u.driverLicense.imageUrl || "",
          });
        }
        if (u.nationalId?.number) {
          setExistingNationalId(u.nationalId);
          setNationalIdForm({
            number:   u.nationalId.number || "",
            imageUrl: u.nationalId.imageUrl || "",
          });
        }
        if (auth.role === "customer") {
          setBookingsCount(bookingsRes?.data?.length ?? 0);
          setFavCount(favsRes?.data?.length ?? 0);
        }
      } catch {
        /* silent — page still renders from auth */
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const openAvatarWidget = async () => {
    const { loadCloudinary } = await import("../utils/loadCloudinary");
    await loadCloudinary();
    window.cloudinary.openUploadWidget(
      { cloudName: "daqihsmib", uploadPreset: "goovoiture", multiple: false, cropping: true },
      (err, result) => {
        if (!err && result?.event === "success")
          setForm(p => ({ ...p, avatar: result.info.secure_url }));
      }
    );
  };

  const openLicenseWidget = async () => {
    const { loadCloudinary } = await import("../utils/loadCloudinary");
    await loadCloudinary();
    window.cloudinary.openUploadWidget(
      {
        cloudName: "daqihsmib", uploadPreset: "goovoiture",
        sources: ["local", "camera"], multiple: false,
      },
      (err, result) => {
        if (!err && result?.event === "success")
          setLicense(p => ({ ...p, imageUrl: result.info.secure_url }));
      }
    );
  };

  const openCinWidget = async () => {
    const { loadCloudinary } = await import("../utils/loadCloudinary");
    await loadCloudinary();
    window.cloudinary.openUploadWidget(
      {
        cloudName: "daqihsmib", uploadPreset: "goovoiture",
        sources: ["local", "camera"], multiple: false,
      },
      (err, result) => {
        if (!err && result?.event === "success")
          setNationalIdForm(p => ({ ...p, imageUrl: result.info.secure_url }));
      }
    );
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg(null);
    try {
      const r = await updateMyProfile({
        name: form.name, city: form.city,
        bio: form.bio, avatar: form.avatar, email: form.email,
      });
      saveAuth({ ...auth, name: r.data.name, avatar: r.data.avatar, city: r.data.city });
      setProfile(p => ({ ...p, ...r.data }));
      setSaveMsg({ type: "success", text: t.personal.saved });
    } catch (err) {
      setSaveMsg({ type: "error", text: err?.response?.data?.message || t.personal.saveFail });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 4000);
    }
  };

  const handleLicenseSave = async (e) => {
    e.preventDefault();
    setLicSaving(true); setLicMsg(null);
    try {
      const r = await updateDriverLicense({
        number: license.number,
        expiryDate: license.expiryDate || null,
        imageUrl: license.imageUrl,
      });
      setExistingLicense(r.data.driverLicense);
      setLicMsg({ type: "success", text: t.license.saved });
    } catch (err) {
      setLicMsg({ type: "error", text: err?.response?.data?.message || t.license.saveFail });
    } finally {
      setLicSaving(false);
      setTimeout(() => setLicMsg(null), 4000);
    }
  };

  const handleNationalIdSave = async (e) => {
    e.preventDefault();
    setCinSaving(true); setCinMsg(null);
    try {
      const r = await updateNationalId({
        number: nationalIdForm.number,
        imageUrl: nationalIdForm.imageUrl,
      });
      setExistingNationalId(r.data.nationalId);
      setCinMsg({ type: "success", text: t.nationalId.saved });
    } catch (err) {
      setCinMsg({ type: "error", text: err?.response?.data?.message || t.nationalId.saveFail });
    } finally {
      setCinSaving(false);
      setTimeout(() => setCinMsg(null), 4000);
    }
  };

  const roleClr = ROLE_CLR[auth?.role] || ROLE_CLR.customer;

  if (loading) {
    return (
      <div className={`gp-page${dark ? " dark" : ""}`}>
        <style>{STYLES}</style>
        <div className="gp-loading">
          <div className="gp-spin" /> {t.loading}
        </div>
      </div>
    );
  }

  return (
    <div className={`gp-page${dark ? " dark" : ""}`}>
      <style>{STYLES}</style>

      {/* ── Hero banner ── */}
      <div className="gp-hero" />

      <div className="gp-container">

        <RoleModeSwitcher />

        {/* ── Identity row ── */}
        <div className="gp-identity">
          <div className="gp-avatar-wrap">
            <div className="gp-avatar" onClick={openAvatarWidget} title={t.changePhoto}>
              {form.avatar
                ? <img src={form.avatar} alt={form.name} />
                : (form.name?.[0]?.toUpperCase() || "?")}
            </div>
            <div className="gp-avatar-cam">{ICO_CAMERA}</div>
          </div>

          <div className="gp-id-text">
            <h1 className="gp-name">{form.name || auth?.name || t.unknown}</h1>
            <div className="gp-meta">
              <span
                className="gp-role-badge"
                style={{ background: roleClr.bg, color: roleClr.color, borderColor: roleClr.border }}
              >
                {t.roles[auth?.role] || auth?.role}
              </span>
              {form.city && (
                <span className="gp-meta-item">
                  {ICO_PIN} {form.city}
                </span>
              )}
              {profile?.createdAt && (
                <span className="gp-meta-item">
                  {ICO_CLOCK} {t.sinceLabel} {fmt(profile.createdAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats (customers only) ── */}
        {auth?.role === "customer" && (
          <div className="gp-stats">
            <div className="gp-stat">
              <span className="gp-stat-value">{bookingsCount}</span>
              <span className="gp-stat-label">{t.stats.bookings}</span>
            </div>
            <div className="gp-stat">
              <span className="gp-stat-value">{favCount}</span>
              <span className="gp-stat-label">{t.stats.favorites}</span>
            </div>
            <div className="gp-stat">
              <span className="gp-stat-value" style={{ fontSize: 13, paddingTop: 5, lineHeight: 1.3 }}>
                {profile?.createdAt ? fmt(profile.createdAt) : t.unknown}
              </span>
              <span className="gp-stat-label">{t.stats.memberSince}</span>
            </div>
          </div>
        )}

        {/* ── Personal information card ── */}
        <div className="gp-card">
          <div className="gp-card-header">
            <h2 className="gp-card-title">{t.personal.title}</h2>
          </div>
          <form onSubmit={handleProfileSave} className="gp-fields">
            <div className="gp-row2">
              <div className="gp-field">
                <label className="gp-label">{t.personal.fullName}</label>
                <input
                  className="gp-input"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder={t.personal.fullNamePh}
                />
              </div>
              <div className="gp-field">
                <label className="gp-label">{t.personal.city}</label>
                <input
                  className="gp-input"
                  value={form.city}
                  onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                  placeholder={t.personal.cityPh}
                />
              </div>
            </div>

            <div className="gp-field">
              <label className="gp-label">{t.personal.email}</label>
              <input
                className="gp-input"
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder={t.personal.emailPh}
              />
            </div>

            <div className="gp-field">
              <label className="gp-label">{t.personal.phone}</label>
              <input
                className="gp-input"
                value={auth?.phone || profile?.phone || ""}
                readOnly
              />
            </div>

            <div className="gp-field">
              <label className="gp-label">{t.personal.bio}</label>
              <textarea
                className="gp-textarea"
                value={form.bio}
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                placeholder={t.personal.bioPh}
              />
            </div>

            {saveMsg && (
              <div className={`gp-msg ${saveMsg.type}`}>{saveMsg.text}</div>
            )}

            <button type="submit" className="gp-btn" disabled={saving}>
              {saving ? t.personal.saving : t.personal.save}
            </button>
          </form>
        </div>

        {/* ── Driving license & national ID (for booking rentals) ── */}
        {auth?._id && (
          <>
          <div className="gp-card">
            <div className="gp-card-header">
              <h2 className="gp-card-title">{t.license.title}</h2>
              <span className="gp-card-sub">{t.license.sub}</span>
            </div>

            {existingLicense && (
              <div
                className="gp-lic-badge"
                style={
                  existingLicense.verified
                    ? { background: "rgba(5,150,105,.08)", color: "#059669", borderColor: "rgba(5,150,105,.25)" }
                    : { background: "rgba(245,158,11,.08)", color: "#b45309", borderColor: "rgba(245,158,11,.25)" }
                }
              >
                {existingLicense.verified ? "✓ " : "⏳ "}
                {existingLicense.verified ? t.license.verified : t.license.pending}
              </div>
            )}

            <form onSubmit={handleLicenseSave} className="gp-fields">
              <div className="gp-row2">
                <div className="gp-field">
                  <label className="gp-label">{t.license.number}</label>
                  <input
                    className="gp-input"
                    value={license.number}
                    onChange={e => setLicense(p => ({ ...p, number: e.target.value }))}
                    placeholder={t.license.numberPh}
                    required
                  />
                </div>
                <div className="gp-field">
                  <label className="gp-label">{t.license.expiry}</label>
                  <input
                    className="gp-input"
                    type="date"
                    value={license.expiryDate}
                    onChange={e => setLicense(p => ({ ...p, expiryDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="gp-field">
                <label className="gp-label">{t.license.photo}</label>
                {license.imageUrl ? (
                  <div className="gp-lic-photo-row">
                    <img src={license.imageUrl} alt="license" className="gp-lic-photo" />
                    <button type="button" onClick={openLicenseWidget} className="gp-replace-btn">
                      {t.license.replace}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={openLicenseWidget} className="gp-upload-zone">
                    {ICO_UPLOAD} {t.license.upload}
                  </button>
                )}
              </div>

              {licMsg && (
                <div className={`gp-msg ${licMsg.type}`}>{licMsg.text}</div>
              )}

              <button
                type="submit"
                className="gp-btn"
                disabled={licSaving || !license.number || !license.imageUrl}
              >
                {licSaving ? t.license.saving : t.license.save}
              </button>
            </form>
          </div>

          <div className="gp-card" style={{ marginTop: 16 }}>
            <div className="gp-card-header">
              <h2 className="gp-card-title">{t.nationalId.title}</h2>
              <span className="gp-card-sub">{t.nationalId.sub}</span>
            </div>

            {existingNationalId && (
              <div
                className="gp-lic-badge"
                style={
                  existingNationalId.verified
                    ? { background: "rgba(5,150,105,.08)", color: "#059669", borderColor: "rgba(5,150,105,.25)" }
                    : { background: "rgba(245,158,11,.08)", color: "#b45309", borderColor: "rgba(245,158,11,.25)" }
                }
              >
                {existingNationalId.verified ? "✓ " : "⏳ "}
                {existingNationalId.verified ? t.nationalId.verified : t.nationalId.pending}
              </div>
            )}

            <form onSubmit={handleNationalIdSave} className="gp-fields">
              <div className="gp-field">
                <label className="gp-label">{t.nationalId.number}</label>
                <input
                  className="gp-input"
                  value={nationalIdForm.number}
                  onChange={e => setNationalIdForm(p => ({ ...p, number: e.target.value }))}
                  placeholder={t.nationalId.numberPh}
                  required
                />
              </div>

              <div className="gp-field">
                <label className="gp-label">{t.nationalId.photo}</label>
                {nationalIdForm.imageUrl ? (
                  <div className="gp-lic-photo-row">
                    <img src={nationalIdForm.imageUrl} alt="CIN" className="gp-lic-photo" />
                    <button type="button" onClick={openCinWidget} className="gp-replace-btn">
                      {t.nationalId.replace}
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={openCinWidget} className="gp-upload-zone">
                    {ICO_UPLOAD} {t.nationalId.upload}
                  </button>
                )}
              </div>

              {cinMsg && (
                <div className={`gp-msg ${cinMsg.type}`}>{cinMsg.text}</div>
              )}

              <button
                type="submit"
                className="gp-btn"
                disabled={cinSaving || !nationalIdForm.number || !nationalIdForm.imageUrl}
              >
                {cinSaving ? t.nationalId.saving : t.nationalId.save}
              </button>
            </form>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
