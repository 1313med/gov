import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { loadAuth, clearAuth } from "../../utils/authStorage";
import { useAppLang } from "../../context/AppLangContext";
import { useTheme } from "../../context/ThemeContext";
import { hasUserRole } from "../../utils/userRoles";

const ROLE_LABELS = {
  customer: "Customer",
  rental_owner: "Rental Owner",
  car_owner: "Car owner",
  seller: "Car owner",
  admin: "Admin",
};

export default function HomeNav() {
  const { lang, setLang, copy } = useAppLang();
  const [auth, setAuth] = useState(() => loadAuth());
  const { dark, toggle: toggleTheme } = useTheme();
  const [menu, setMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onStorage = () => setAuth(loadAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function logout() {
    clearAuth();
    setAuth(null);
  }

  return (
    <>
      <nav className="hx-nav">
        <Link to="/" className="hx-logo">
          Goo<em>voiture</em>
        </Link>

        <div className="hx-nav-links">
          <Link to="/cars" className="hx-nav-link">
            {copy.home.nav.buy}
          </Link>
          <Link to="/rentals" className="hx-nav-link">
            {copy.home.nav.rent}
          </Link>
        </div>

        <div className="hx-nav-end">
          <div className="hx-lang" role="radiogroup" aria-label="Language">
            {(["fr", "en", "ar"]).map((code) => (
              <button
                key={code}
                type="button"
                role="radio"
                className={lang === code ? "on" : ""}
                onClick={() => setLang(code)}
                aria-checked={lang === code}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          {auth ? (
            <div className="hx-profile-wrap" ref={profileRef}>
              <button
                type="button"
                className="hx-av-btn"
                onClick={() => setProfileOpen((o) => !o)}
                aria-label="Profile menu"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                {auth.avatar ? (
                  <img src={auth.avatar} alt={auth.name} />
                ) : (
                  auth.name?.[0]?.toUpperCase() || "?"
                )}
              </button>

              {profileOpen && (
                <div className="hx-drop" role="menu">
                  <div className="hx-drop-head">
                    <div className="hx-drop-av">
                      {auth.avatar ? (
                        <img src={auth.avatar} alt={auth.name} />
                      ) : (
                        auth.name?.[0]?.toUpperCase() || "?"
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="hx-drop-name">{auth.name}</div>
                      <div className="hx-drop-role">
                        {ROLE_LABELS[auth.role] || auth.role}
                      </div>
                    </div>
                  </div>

                  <div className="hx-drop-body">
                    <Link
                      to="/profile"
                      className="hx-drop-item"
                      onClick={() => setProfileOpen(false)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      My Profile
                    </Link>

                    {auth.role === "customer" && (
                      <Link to="/my-bookings" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        My Bookings
                      </Link>
                    )}

                    {auth.role === "rental_owner" && (
                      <Link to="/my-fleet" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                        My Fleet
                      </Link>
                    )}

                    {hasUserRole(auth, "car_owner") && (
                      <Link to="/garage" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h13l4 4v4a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>
                        My garage
                      </Link>
                    )}

                    {hasUserRole(auth, "customer", "car_owner", "rental_owner", "admin") && (
                      <Link to="/my-sales" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                        My listings
                      </Link>
                    )}

                    {hasUserRole(auth, "admin") &&
                      !hasUserRole(auth, "car_owner", "rental_owner") && (
                        <Link to="/admin" className="hx-drop-item" onClick={() => setProfileOpen(false)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                          Admin Panel
                        </Link>
                      )}

                    <div className="hx-drop-sep" />

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="hx-drop-item red"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="hx-npill gh">
                {copy.home.nav.login}
              </Link>
              <Link to="/register" className="hx-npill sl">
                {copy.home.nav.getStarted}
              </Link>
            </>
          )}

          <button
            type="button"
            className="hx-theme"
            onClick={toggleTheme}
            aria-label={dark ? copy.home.nav.themeLight : copy.home.nav.themeDark}
          >
            {dark ? "☀" : "☾"}
          </button>

          <button
            type="button"
            className="hx-burger"
            onClick={() => setMenu((m) => !m)}
            aria-label={copy.home.nav.menu}
            aria-expanded={menu}
            aria-controls="hx-mobile-drawer"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div
        id="hx-mobile-drawer"
        className={`hx-drawer${menu ? " open" : ""}`}
        aria-hidden={!menu}
      >
        <Link to="/cars" className="hx-dlink" onClick={() => setMenu(false)}>
          {copy.home.drawer.buyCars}
        </Link>
        <Link to="/rentals" className="hx-dlink" onClick={() => setMenu(false)}>
          {copy.home.drawer.rentCar}
        </Link>
        {auth ? (
          <>
            <Link to="/profile" className="hx-dlink" onClick={() => setMenu(false)}>
              My Profile
            </Link>
            {hasUserRole(auth, "customer") && (
              <Link to="/my-bookings" className="hx-dlink" onClick={() => setMenu(false)}>
                My Bookings
              </Link>
            )}
            {hasUserRole(auth, "rental_owner") && (
              <Link to="/my-fleet" className="hx-dlink" onClick={() => setMenu(false)}>
                My Fleet
              </Link>
            )}
            {hasUserRole(auth, "car_owner") && (
              <Link to="/garage" className="hx-dlink" onClick={() => setMenu(false)}>
                My garage
              </Link>
            )}
            {hasUserRole(auth, "customer", "car_owner", "rental_owner", "admin") && (
              <Link to="/my-sales" className="hx-dlink" onClick={() => setMenu(false)}>
                My listings
              </Link>
            )}
            {hasUserRole(auth, "admin") &&
              !hasUserRole(auth, "car_owner", "rental_owner") && (
                <Link to="/admin" className="hx-dlink" onClick={() => setMenu(false)}>
                  Admin Panel
                </Link>
              )}
            <button
              type="button"
              onClick={() => {
                logout();
                setMenu(false);
              }}
              className="hx-dlink"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                color: "#ef4444",
              }}
            >
              {copy.home.drawer.logout}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hx-dlink" onClick={() => setMenu(false)}>
              {copy.home.drawer.login}
            </Link>
            <Link to="/register" className="hx-dlink" onClick={() => setMenu(false)}>
              {copy.home.drawer.getStarted}
            </Link>
          </>
        )}
      </div>
    </>
  );
}
