import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import StarRating from "./StarRating";
import { getReviews, createReview, deleteReview } from "../api/review";
import { useAuth } from "../context/AuthContext";
import { C } from "../theme";

export default function ReviewSection({ targetModel, targetId }) {
  const { auth } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loaded) {
    getReviews(targetModel, targetId).then(({ data }) => { setReviews(data); setLoaded(true); }).catch(() => setLoaded(true));
  }

  const load = () => getReviews(targetModel, targetId).then(({ data }) => setReviews(data)).catch(() => {});

  const submit = async () => {
    if (!auth) return Alert.alert("Please login to leave a review");
    if (rating === 0) return Alert.alert("Please select a rating");
    if (!text.trim()) return Alert.alert("Please write a review");
    setSubmitting(true);
    try { await createReview(targetModel, targetId, { rating, text }); setText(""); setRating(0); load(); }
    catch { Alert.alert("Failed to submit review"); }
    finally { setSubmitting(false); }
  };

  const remove = (id) => Alert.alert("Delete review", "Are you sure?", [
    { text: "Cancel" },
    { text: "Delete", style: "destructive", onPress: async () => { await deleteReview(id); load(); } },
  ]);

  return (
    <View style={s.wrap}>
      <Text style={s.heading}>Reviews</Text>
      {auth && (
        <View style={s.form}>
          <Text style={s.label}>Your rating</Text>
          <StarRating rating={rating} onRate={setRating} size={28} />
          <TextInput value={text} onChangeText={setText} placeholder="Write your review..." placeholderTextColor={C.muted}
            multiline numberOfLines={3} style={s.input} textAlignVertical="top" />
          <TouchableOpacity onPress={submit} disabled={submitting} style={s.submitBtn}>
            <Text style={s.submitText}>{submitting ? "Submitting..." : "Submit Review"}</Text>
          </TouchableOpacity>
        </View>
      )}
      {reviews.length === 0
        ? <Text style={s.empty}>No reviews yet.</Text>
        : reviews.map((r) => (
          <View key={r._id} style={s.reviewCard}>
            <View style={s.reviewHeader}>
              <View style={s.avatar}><Text style={s.avatarText}>{r.author?.name?.[0]?.toUpperCase() || "?"}</Text></View>
              <Text style={s.authorName}>{r.author?.name || "Anonymous"}</Text>
              {auth && (auth._id === r.author?._id || auth.role === "admin") && (
                <TouchableOpacity onPress={() => remove(r._id)} style={{ marginLeft: "auto" }}>
                  <Ionicons name="trash-outline" size={16} color={C.red} />
                </TouchableOpacity>
              )}
            </View>
            <StarRating rating={r.rating} size={16} />
            <Text style={s.reviewText}>{r.text}</Text>
          </View>
        ))
      }
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: 24 },
  heading: { color: C.white, fontWeight: "700", fontSize: 18, marginBottom: 16 },
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
