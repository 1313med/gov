import { useState, useEffect, useCallback, useMemo } from "react";
import OwnerLayout from "../components/owner/OwnerLayout";
import { getOwnerListingViews, markOwnerListingViewsSeen } from "../api/rental";
import { getListingViewQueryParams } from "../utils/listingViewPeriodRange";
import { useAppLang } from "../context/AppLangContext";
import { useTheme } from "../context/ThemeContext";

const PERIODS = [
  { id: "all", en: "All time", fr: "Total" },
  { id: "today", en: "Today", fr: "Aujourd'hui" },
  { id: "yesterday", en: "Yesterday", fr: "Hier" },
  { id: "last_week", en: "Last 7 days", fr: "7 derniers j." },
  { id: "last_month", en: "Last month", fr: "Mois dernier" },
  { id: "year", en: "This year", fr: "Cette année" },
];

function statusLabel(status, fr) {
  const s = String(status || "").toLowerCase();
  if (s === "approved") return fr ? "En ligne" : "Live";
  if (s === "pending") return fr ? "En attente" : "Pending";
  if (s === "rejected") return fr ? "Refusé" : "Rejected";
  return s;
}

export default function OwnerListingViewsPage() {
  const { lang } = useAppLang();
  const { dark } = useTheme();
  const fr = lang === "fr";

  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [period, setPeriod] = useState("all");

  const load = useCallback(async () => {
    setFetching(true);
    try {
      const res = await getOwnerListingViews(getListingViewQueryParams(period));
      setData(res.data && typeof res.data === "object" ? res.data : null);
    } catch {
      setData(null);
    } finally {
      setFetching(false);
    }
  }, [period]);

  useEffect(() => {
    load();
    markOwnerListingViewsSeen().catch(() => {});
  }, [load]);

  const maxViews = useMemo(() => {
    const v = data?.vehicles;
    if (!Array.isArray(v) || !v.length) return 1;
    return Math.max(1, ...v.map((x) => x.views || 0));
  }, [data]);

  const txt = dark ? "#f5f7ff" : "#0b163d";
  const card = dark ? "#101426" : "#fff";
  const vehicles = Array.isArray(data?.vehicles) ? data.vehicles : [];

  return (
    <OwnerLayout>
      <div style={{ padding: "32px 28px 80px", maxWidth: 960 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: txt, marginBottom: 8 }}>
          {fr ? "Portée de vos annonces" : "Listing reach"}
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: 24, fontSize: 14 }}>
          {fr
            ? "Les vues comptent une ouverture de fiche (dédupliquée par visiteur)."
            : "Views count a detail-page open, deduplicated per visitor."}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                border: `1px solid ${period === p.id ? "#7c6bff" : "rgba(148,163,184,.35)"}`,
                background: period === p.id ? "rgba(124,107,255,.12)" : "transparent",
                color: period === p.id ? "#7c6bff" : txt,
                fontWeight: 700,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {fr ? p.fr : p.en}
            </button>
          ))}
        </div>

        {fetching && !data ? (
          <p style={{ color: "#94a3b8" }}>{fr ? "Chargement…" : "Loading…"}</p>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 28 }}>
              {[
                { label: fr ? "Vues totales" : "Total views", val: data?.totalViews ?? 0 },
                { label: fr ? "Annonces" : "Listings", val: data?.listingCount ?? 0 },
                { label: fr ? "Moy. / annonce" : "Avg / listing", val: Math.round(data?.avgViewsPerListing ?? 0) },
              ].map((m) => (
                <div key={m.label} style={{ background: card, padding: 20, borderRadius: 16, border: "1px solid rgba(148,163,184,.2)" }}>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{m.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, color: txt }}>{Number(m.val).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {vehicles.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>{fr ? "Aucune donnée pour cette période." : "No data for this period."}</p>
            ) : (
              <div style={{ background: card, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(148,163,184,.2)" }}>
                {vehicles.map((v, i) => {
                  const img = v.images?.[0] || v.image;
                  const pct = ((v.views || 0) / maxViews) * 100;
                  return (
                    <div key={v._id || i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: "1px solid rgba(148,163,184,.12)" }}>
                      {img ? (
                        <img src={img} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(124,107,255,.15)" }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, color: txt, margin: 0 }}>
                          {v.brand} {v.model}
                        </p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 8px" }}>
                          {statusLabel(v.status, fr)} · {v.city || "—"}
                        </p>
                        <div style={{ height: 3, background: "rgba(148,163,184,.2)", borderRadius: 2 }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#7c6bff", borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 22, fontWeight: 900, color: txt, margin: 0 }}>{v.views ?? 0}</p>
                        <p style={{ fontSize: 10, color: "#94a3b8" }}>{fr ? "vues" : "views"}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </OwnerLayout>
  );
}
