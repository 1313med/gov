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

const PAGE_CSS = `
  .olv-page {
    padding: clamp(20px, 4vw, 32px) clamp(14px, 3.5vw, 28px) clamp(24px, 4vw, 80px);
    max-width: 960px;
    box-sizing: border-box;
  }
  .olv-title {
    font-size: clamp(22px, 5.5vw, 28px);
    font-weight: 800;
    margin: 0 0 8px;
  }
  .olv-sub { margin-bottom: 24px; font-size: 14px; }
  .olv-periods {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 4px;
  }
  .olv-periods::-webkit-scrollbar { display: none; }
  .olv-period-btn {
    flex-shrink: 0;
    padding: 8px 14px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    white-space: nowrap;
  }
  .olv-stats {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 28px;
  }
  @media (min-width: 520px) {
    .olv-stats { grid-template-columns: repeat(3, 1fr); }
  }
  .olv-stat-card {
    padding: 18px 20px;
    border-radius: 16px;
    border: 1px solid rgba(148, 163, 184, 0.2);
  }
  .olv-stat-val {
    font-size: clamp(22px, 5vw, 28px);
    font-weight: 900;
    margin: 0;
  }
  .olv-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  }
  .olv-row-title {
    font-weight: 700;
    margin: 0;
    font-size: clamp(13px, 3.5vw, 15px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .olv-row-views {
    font-size: clamp(18px, 4.5vw, 22px);
    font-weight: 900;
    margin: 0;
  }
`;

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
      <style>{PAGE_CSS}</style>
      <div className="olv-page">
        <h1 className="olv-title" style={{ color: txt }}>
          {fr ? "Portée de vos annonces" : "Listing reach"}
        </h1>
        <p className="olv-sub" style={{ color: "#94a3b8" }}>
          {fr
            ? "Les vues comptent une ouverture de fiche (dédupliquée par visiteur)."
            : "Views count a detail-page open, deduplicated per visitor."}
        </p>

        <div className="olv-periods">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className="olv-period-btn"
              style={{
                border: `1px solid ${period === p.id ? "#7c6bff" : "rgba(148,163,184,.35)"}`,
                background: period === p.id ? "rgba(124,107,255,.12)" : "transparent",
                color: period === p.id ? "#7c6bff" : txt,
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
            <div className="olv-stats">
              {[
                { label: fr ? "Vues totales" : "Total views", val: data?.totalViews ?? 0 },
                { label: fr ? "Annonces" : "Listings", val: data?.listingCount ?? 0 },
                { label: fr ? "Moy. / annonce" : "Avg / listing", val: Math.round(data?.avgViewsPerListing ?? 0) },
              ].map((m) => (
                <div key={m.label} className="olv-stat-card" style={{ background: card }}>
                  <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{m.label}</p>
                  <p className="olv-stat-val" style={{ color: txt }}>{Number(m.val).toLocaleString()}</p>
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
                    <div key={v._id || i} className="olv-row">
                      {img ? (
                        <img src={img} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: "rgba(124,107,255,.15)", flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="olv-row-title" style={{ color: txt }}>
                          {v.brand} {v.model}
                        </p>
                        <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 8px" }}>
                          {statusLabel(v.status, fr)} · {v.city || "—"}
                        </p>
                        <div style={{ height: 3, background: "rgba(148,163,184,.2)", borderRadius: 2 }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: "#7c6bff", borderRadius: 2 }} />
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p className="olv-row-views" style={{ color: txt }}>{v.views ?? 0}</p>
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
