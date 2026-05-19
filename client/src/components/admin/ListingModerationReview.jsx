import { useState } from "react";
import { verifyUserNationalId } from "../../api/admin";

function cinStatus(owner) {
  const nid = owner?.nationalId;
  if (!nid?.imageUrl && !nid?.number) {
    return { label: "Not submitted", cls: "adm-badge-rejected", canApprove: false };
  }
  if (nid.verified) {
    return { label: "CIN verified", cls: "adm-badge-approved", canApprove: true };
  }
  return { label: "CIN pending review", cls: "adm-badge-pending", canApprove: false };
}

export default function ListingModerationReview({
  listing,
  ownerField = "rentalOwnerId",
  priceLabel,
  statusBadge,
  onStatusChange,
  actionLoading,
  onOwnerVerified,
}) {
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [expanded, setExpanded] = useState(listing?.status === "pending");

  const o = listing?.[ownerField];
  const ownerId = o?._id || o;
  const cin = cinStatus(o);
  const images = listing?.images || [];
  const busy = actionLoading === listing?._id;

  const handleVerifyCin = async () => {
    if (!ownerId) return;
    if (!window.confirm("Mark this owner's national ID (CIN) as verified?")) return;
    setVerifyBusy(true);
    try {
      await verifyUserNationalId(ownerId, true);
      onOwnerVerified?.(ownerId);
    } catch (err) {
      window.alert(err?.response?.data?.message || "Could not verify CIN");
    } finally {
      setVerifyBusy(false);
    }
  };

  return (
    <article className="adm-card" style={{ marginBottom: 16, overflow: "hidden" }}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          color: "inherit",
        }}
      >
        {images[0] ? (
          <img
            src={images[0]}
            alt=""
            style={{ width: 72, height: 52, objectFit: "cover", borderRadius: 8 }}
          />
        ) : (
          <div
            style={{
              width: 72,
              height: 52,
              borderRadius: 8,
              background: "rgba(255,255,255,.06)",
            }}
          />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>{listing?.title || "Untitled"}</p>
          <p style={{ margin: "4px 0 0", color: "#9a9ab0", fontSize: 12 }}>
            {o?.name || "—"} · {listing?.city || "—"} · {priceLabel}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          {statusBadge(listing?.status)}
          <span className={`adm-badge ${cin.cls}`} style={{ fontSize: 10 }}>
            {cin.label}
          </span>
        </div>
      </button>

      {expanded && (
        <div
          style={{
            padding: "0 18px 18px",
            borderTop: "1px solid rgba(255,255,255,.06)",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16 }}>
            <section>
              <p className="adm-label" style={{ marginBottom: 8 }}>
                Vehicle
              </p>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#b8b8c8" }}>
                {[listing?.brand, listing?.model, listing?.year].filter(Boolean).join(" · ") || "—"}
              </p>
              {listing?.description && (
                <p style={{ margin: "0 0 12px", fontSize: 12, color: "#8a8a9e", lineHeight: 1.5 }}>
                  {listing.description}
                </p>
              )}
              {images.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {images.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noreferrer">
                      <img
                        src={src}
                        alt={`Car ${i + 1}`}
                        style={{
                          width: 100,
                          height: 72,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid rgba(255,255,255,.1)",
                        }}
                      />
                    </a>
                  ))}
                </div>
              )}
            </section>

            <section>
              <p className="adm-label" style={{ marginBottom: 8 }}>
                Owner CIN
              </p>
              <p style={{ margin: "0 0 6px", fontSize: 13 }}>
                <strong>{o?.name || "—"}</strong>
                {o?.email && (
                  <span style={{ color: "#9a9ab0", display: "block", fontSize: 12 }}>{o.email}</span>
                )}
                {o?.phone && (
                  <span style={{ color: "#9a9ab0", fontSize: 12 }}>{o.phone}</span>
                )}
              </p>
              {o?.nationalId?.number && (
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, margin: "0 0 10px" }}>
                  CIN: {o.nationalId.number}
                </p>
              )}
              {o?.nationalId?.imageUrl ? (
                <a href={o.nationalId.imageUrl} target="_blank" rel="noreferrer">
                  <img
                    src={o.nationalId.imageUrl}
                    alt="CIN document"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 160,
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,.12)",
                    }}
                  />
                </a>
              ) : (
                <p className="adm-empty" style={{ padding: "12px 0", fontSize: 12 }}>
                  No CIN document uploaded
                </p>
              )}
              {!o?.nationalId?.verified && o?.nationalId?.imageUrl && ownerId && (
                <button
                  type="button"
                  className="adm-btn adm-btn-pri"
                  style={{ marginTop: 12 }}
                  disabled={verifyBusy}
                  onClick={handleVerifyCin}
                >
                  {verifyBusy ? "Verifying…" : "Verify owner CIN"}
                </button>
              )}
            </section>
          </div>

          {listing?.status === "pending" && (
            <div className="adm-action-btns" style={{ marginTop: 18 }}>
              <button
                type="button"
                disabled={busy || !cin.canApprove}
                title={
                  !cin.canApprove
                    ? "Verify the owner's CIN before approving"
                    : undefined
                }
                onClick={() => onStatusChange(listing._id, "approved")}
                className="adm-btn-sm adm-btn-ok"
                style={!cin.canApprove ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
              >
                Approve listing
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onStatusChange(listing._id, "rejected")}
                className="adm-btn-sm adm-btn-danger"
              >
                Reject listing
              </button>
            </div>
          )}
          {listing?.status === "pending" && !cin.canApprove && (
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "#f59e0b" }}>
              Approve is disabled until the owner's CIN is submitted and verified.
            </p>
          )}
        </div>
      )}
    </article>
  );
}
