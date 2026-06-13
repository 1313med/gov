"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { HOME_SHELL_COPY } from "@/lib/homeShellCopy";
import { buildSeoPath, parseSeoPath } from "@client-seo/seoPaths";

const THEME_KEYS = ["goo-theme", "cars-theme", "rentals-theme", "home2-theme", "rental-details-theme"];

function readDark() {
  if (typeof window === "undefined") return false;
  try {
    for (const key of THEME_KEYS) {
      const v = localStorage.getItem(key);
      if (v === "dark") return true;
      if (v === "light") return false;
    }
  } catch {
    /* ignore */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

function applyDark(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  const value = dark ? "dark" : "light";
  try {
    for (const key of THEME_KEYS) localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

type AuthUser = {
  name?: string;
  avatar?: string;
  role?: string;
};

function loadAuth(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("goovoiture_auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function hasRole(auth: AuthUser | null, ...roles: string[]) {
  if (!auth?.role) return false;
  const r = auth.role.toLowerCase();
  return roles.some((x) => x.toLowerCase() === r);
}

export default function HomeNav({ lang }: { lang: SeoLang }) {
  const copy = HOME_SHELL_COPY[lang];
  const pathname = usePathname() || "/";
  const { basePath } = parseSeoPath(pathname);
  const [dark, setDark] = useState(false);
  const [auth, setAuth] = useState<AuthUser | null>(null);
  const [menu, setMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = readDark();
    setDark(d);
    applyDark(d);
    setAuth(loadAuth());
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleTheme() {
    setDark((prev) => {
      const next = !prev;
      applyDark(next);
      return next;
    });
  }

  function logout() {
    try {
      localStorage.removeItem("goovoiture_auth");
    } catch {
      /* ignore */
    }
    setAuth(null);
  }

  const langHref = (code: SeoLang) => buildSeoPath(code, basePath);

  return (
    <>
      <nav className="hx-nav">
        <a href={buildSeoPath(lang, "/")} className="hx-logo">
          Goo<em>voiture</em>
        </a>

        <div className="hx-nav-links">
          <a href="/cars" className="hx-nav-link">
            {copy.nav.buy}
          </a>
          <a href="/rentals" className="hx-nav-link">
            {copy.nav.rent}
          </a>
        </div>

        <div className="hx-nav-end">
          <div className="hx-lang" role="radiogroup" aria-label="Language">
            {(["fr", "en", "ar"] as SeoLang[]).map((code) => (
              <a
                key={code}
                href={langHref(code)}
                role="radio"
                className={lang === code ? "on" : ""}
                aria-checked={lang === code}
              >
                {code.toUpperCase()}
              </a>
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
                      <div className="hx-drop-role">{auth.role}</div>
                    </div>
                  </div>
                  <div className="hx-drop-body">
                    <a href="/profile" className="hx-drop-item">
                      My Profile
                    </a>
                    {hasRole(auth, "customer") && (
                      <a href="/my-bookings" className="hx-drop-item">
                        My Bookings
                      </a>
                    )}
                    {hasRole(auth, "rental_owner") && (
                      <a href="/my-fleet" className="hx-drop-item">
                        My Fleet
                      </a>
                    )}
                    {hasRole(auth, "car_owner") && (
                      <a href="/garage" className="hx-drop-item">
                        My garage
                      </a>
                    )}
                    {hasRole(auth, "customer", "car_owner", "rental_owner", "admin") && (
                      <a href="/my-sales" className="hx-drop-item">
                        My listings
                      </a>
                    )}
                    {hasRole(auth, "admin") && !hasRole(auth, "car_owner", "rental_owner") && (
                      <a href="/admin" className="hx-drop-item">
                        Admin Panel
                      </a>
                    )}
                    <div className="hx-drop-sep" />
                    <button type="button" onClick={logout} className="hx-drop-item red">
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/login" className="hx-npill gh">
                {copy.nav.login}
              </a>
              <a href="/register" className="hx-npill sl">
                {copy.nav.getStarted}
              </a>
            </>
          )}

          <button
            type="button"
            className="hx-theme"
            onClick={toggleTheme}
            aria-label={dark ? copy.nav.themeLight : copy.nav.themeDark}
          >
            {dark ? "☀" : "☾"}
          </button>

          <button
            type="button"
            className="hx-burger"
            onClick={() => setMenu((m) => !m)}
            aria-label={copy.nav.menu}
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
        <a href="/cars" className="hx-dlink">
          {copy.drawer.buyCars}
        </a>
        <a href="/rentals" className="hx-dlink">
          {copy.drawer.rentCar}
        </a>
        {auth ? (
          <>
            <a href="/profile" className="hx-dlink">
              My Profile
            </a>
            {hasRole(auth, "customer") && (
              <a href="/my-bookings" className="hx-dlink">
                My Bookings
              </a>
            )}
            {hasRole(auth, "rental_owner") && (
              <a href="/my-fleet" className="hx-dlink">
                My Fleet
              </a>
            )}
            {hasRole(auth, "car_owner") && (
              <a href="/garage" className="hx-dlink">
                My garage
              </a>
            )}
            {hasRole(auth, "customer", "car_owner", "rental_owner", "admin") && (
              <a href="/my-sales" className="hx-dlink">
                My listings
              </a>
            )}
            {hasRole(auth, "admin") && !hasRole(auth, "car_owner", "rental_owner") && (
              <a href="/admin" className="hx-dlink">
                Admin Panel
              </a>
            )}
            <button
              type="button"
              onClick={logout}
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
              {copy.drawer.logout}
            </button>
          </>
        ) : (
          <>
            <a href="/login" className="hx-dlink">
              {copy.drawer.login}
            </a>
            <a href="/register" className="hx-dlink">
              {copy.drawer.getStarted}
            </a>
          </>
        )}
      </div>
    </>
  );
}
