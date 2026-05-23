import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { GARAGE_FEATURES } from "../../constants/garageFeatures";

export default function GarageFeatureGrid({ fr = true, onEstimate, delayStart = 0 }) {
  return (
    <div className="ge-feature-grid">
      {GARAGE_FEATURES.map((f, i) => {
        const Icon = f.Icon;
        const isEstimate = f.action === "estimate";

        const inner = (
          <>
            <div className="ge-feature-glow" style={{ background: f.glow }} />
            <div className="ge-feature-icon" style={{ background: f.gradient }}>
              <Icon size={22} strokeWidth={2.2} />
            </div>
            <div className="ge-feature-text">
              <strong>{fr ? f.fr : f.en}</strong>
              <span>{fr ? f.subtitleFr : f.subtitleEn}</span>
            </div>
            <ChevronRight size={18} className="ge-feature-arrow" />
          </>
        );

        const cls = `ge-feature-card ge-stagger`;
        const style = { animationDelay: `${delayStart + i * 0.04}s` };

        if (isEstimate && onEstimate) {
          return (
            <button key={f.id} type="button" className={cls} style={style} onClick={onEstimate}>
              {inner}
            </button>
          );
        }

        return (
          <Link key={f.id} to={f.to} className={cls} style={style}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
