export default function StarRating({ value = 0, onChange, size = 20, readonly = false }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => !readonly && onChange && onChange(star)}
          style={{
            fontSize: size,
            cursor: readonly ? "default" : "pointer",
            color: star <= Math.round(value) ? "#f59e0b" : "#d1d5db",
            lineHeight: 1,
            transition: "color .15s",
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}
