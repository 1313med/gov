import { CarFront, Gauge } from "lucide-react";

export default function GarageLoader({ label }) {
  return (
    <div className="ge-loader-modern" role="status" aria-live="polite">
      <div className="ge-loader-orbit">
        <svg className="ge-loader-ring" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(62,232,214,0.12)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#ge-loader-grad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="80 184"
            className="ge-loader-arc"
          />
          <defs>
            <linearGradient id="ge-loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3ee8d6" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
        <div className="ge-loader-center">
          <CarFront size={32} strokeWidth={1.6} className="ge-loader-car-icon" />
          <Gauge size={14} strokeWidth={2.5} className="ge-loader-gauge" />
        </div>
      </div>
      {label && <p className="ge-loader-label">{label}</p>}
    </div>
  );
}
