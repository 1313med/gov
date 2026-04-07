import { useEffect, useState } from "react";
import { getReviews, createReview, deleteReview } from "../api/review";
import { loadAuth } from "../utils/authStorage";
import StarRating from "./StarRating";

export default function ReviewSection({ targetModel, targetId }) {
  const auth = loadAuth();
  const [data, setData] = useState({ reviews: [], avgRating: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    getReviews(targetModel, targetId)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [targetId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating"); return; }
    setError(""); setSubmitting(true);
    try {
      await createReview(targetModel, targetId, { rating, comment });
      setRating(0); setComment("");
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit review");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    await deleteReview(id);
    load();
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Reviews</h3>
        {data.total > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StarRating value={data.avgRating} readonly size={16} />
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {data.avgRating} ({data.total})
            </span>
          </span>
        )}
      </div>

      {/* Write a review */}
      {auth?.token ? (
        <form onSubmit={handleSubmit} style={{
          background: "#f9fafb", border: "1px solid #e5e7eb",
          borderRadius: 14, padding: 20, marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Write a review</p>
          <StarRating value={rating} onChange={setRating} size={28} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (optional)"
            rows={3}
            style={{
              display: "block", width: "100%", marginTop: 12,
              border: "1px solid #e5e7eb", borderRadius: 10,
              padding: "10px 14px", fontSize: 13, resize: "vertical",
              outline: "none", fontFamily: "inherit",
            }}
          />
          {error && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 6 }}>{error}</p>}
          <button
            type="submit" disabled={submitting}
            style={{
              marginTop: 12, padding: "10px 22px",
              background: "#141412", color: "#fff",
              border: "none", borderRadius: 10,
              fontSize: 13, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      ) : (
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
          <a href="/login" style={{ color: "#3d3af5", fontWeight: 600 }}>Log in</a> to leave a review.
        </p>
      )}

      {/* Review list */}
      {loading ? (
        <p style={{ fontSize: 13, color: "#9ca3af" }}>Loading reviews…</p>
      ) : data.reviews.length === 0 ? (
        <p style={{ fontSize: 13, color: "#9ca3af" }}>No reviews yet. Be the first!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.reviews.map((r) => (
            <div key={r._id} style={{
              background: "#fff", border: "1px solid #e5e7eb",
              borderRadius: 14, padding: "16px 20px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "#e5e7eb", overflow: "hidden",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 15, fontWeight: 700, color: "#374151",
                  }}>
                    {r.authorId?.avatar
                      ? <img src={r.authorId.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : (r.authorId?.name?.[0] || "?")}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{r.authorId?.name || "Anonymous"}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <StarRating value={r.rating} readonly size={14} />
              </div>
              {r.comment && (
                <p style={{ margin: 0, fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>{r.comment}</p>
              )}
              {auth && (auth._id === r.authorId?._id || auth.role === "admin") && (
                <button
                  onClick={() => handleDelete(r._id)}
                  style={{
                    marginTop: 8, fontSize: 11, color: "#dc2626",
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
