import { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "./StarRating";
import { getReviews, createReview, deleteReview } from "../api/review";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function normalizeReviews(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.reviews)) return payload.reviews;
  return [];
}

export default function ReviewSection({ targetModel, targetId }) {
  const { auth } = useAuth();
  const { colors: C } = useTheme();
  const s = useMemo(() => createReviewStyles(C), [C]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    if (!targetId) return Promise.resolve();
    return getReviews(targetModel, targetId)
      .then(({ data }) => {
        setReviews(normalizeReviews(data));
        setAvgRating(typeof data?.avgRating === "number" ? data.avgRating : 0);
        setTotal(typeof data?.total === "number" ? data.total : normalizeReviews(data).length);
      })
      .catch(() => {
        setReviews([]);
        setAvgRating(0);
        setTotal(0);
      });
  }, [targetModel, targetId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    load().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [load]);

  const submit = async () => {
    if (!auth) return Alert.alert("Please login to leave a review");
    if (rating === 0) return Alert.alert("Please select a rating");
    setSubmitting(true);
    try {
      await createReview(targetModel, targetId, { rating, comment: comment.trim() || undefined });
      setComment("");
      setRating(0);
      await load();
    } catch (e) {
      Alert.alert("Error", e?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = (id) => Alert.alert("Delete review", "Are you sure?", [
    { text: "Cancel" },
    {
      text: "Delete",
      style: "destructive",
      onPress: async () => {
        try {
          await deleteReview(id);
          await load();
        } catch {
          Alert.alert("Error", "Could not delete review");
        }
      },
    },
  ]);

  return (
    <View style={s.wrap}>
      <View style={s.headingRow}>
        <Text style={s.heading}>Reviews</Text>
        {total > 0 && (
          <View style={s.avgRow}>
            <StarRating rating={Math.round(avgRating)} size={16} />
            <Text style={s.avgText}>
              {avgRating} ({total})
            </Text>
          </View>
        )}
      </View>
      {auth && (
        <View style={s.form}>
          <Text style={s.label}>Your rating</Text>
          <StarRating rating={rating} onRate={setRating} size={28} />
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience (optional)"
            placeholderTextColor={C.muted}
            multiline
            numberOfLines={3}
            style={s.input}
            textAlignVertical="top"
          />
          <TouchableOpacity onPress={submit} disabled={submitting} style={s.submitBtn}>
            <Text style={s.submitText}>{submitting ? "Submitting..." : "Submit Review"}</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading ? (
        <ActivityIndicator color={C.primary} style={{ marginVertical: 24 }} />
      ) : reviews.length === 0 ? (
        <Text style={s.empty}>No reviews yet.</Text>
      ) : (
        reviews.map((r) => {
          const author = r.authorId || r.author;
          const aid = author?._id?.toString?.() || author;
          return (
            <View key={r._id} style={s.reviewCard}>
              <View style={s.reviewHeader}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{author?.name?.[0]?.toUpperCase() || "?"}</Text>
                </View>
                <Text style={s.authorName}>{author?.name || "Anonymous"}</Text>
                {auth && (String(auth._id) === String(aid) || auth.role === "admin") && (
                  <TouchableOpacity onPress={() => remove(r._id)} style={{ marginLeft: "auto" }}>
                    <Ionicons name="trash-outline" size={16} color={C.red} />
                  </TouchableOpacity>
                )}
              </View>
              <StarRating rating={r.rating} size={16} />
              {(r.comment || r.text) ? (
                <Text style={s.reviewText}>{r.comment || r.text}</Text>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

function createReviewStyles(C) {
  return StyleSheet.create({
  wrap: { marginTop: 24 },
  headingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 },
  heading: { color: C.white, fontWeight: "700", fontSize: 18 },
  avgRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avgText: { color: C.muted, fontSize: 13 },
  form: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  label: { color: C.muted, fontSize: 13, marginBottom: 8 },
  input: { backgroundColor: C.surface, borderRadius: 12, padding: 12, color: C.white, borderWidth: 1, borderColor: C.border, marginTop: 12, minHeight: 80 },
  submitBtn: { backgroundColor: C.primary, borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 12 },
  submitText: { color: "#fff", fontWeight: "700" },
  empty: { color: C.muted, textAlign: "center", paddingVertical: 24 },
  reviewCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  reviewHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(124,107,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 8 },
  avatarText: { color: C.primary, fontWeight: "700", fontSize: 14 },
  authorName: { color: C.white, fontWeight: "600" },
  reviewText: { color: C.slate, fontSize: 13, marginTop: 8, lineHeight: 20 },
});
}
