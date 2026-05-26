export default function GarageAmbient({ variant = "default" }) {
  return (
    <div className={`ge-ambient ge-ambient-${variant}`} aria-hidden>
      <div className="ge-aurora" />
      <div className="ge-ambient-orb a" />
      <div className="ge-ambient-orb b" />
      <div className="ge-ambient-orb c" />
      <div className="ge-ambient-grid" />
      <div className="ge-sparkles">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="ge-sparkle" style={{ "--i": i }} />
        ))}
      </div>
      <div className="ge-noise" />
    </div>
  );
}
