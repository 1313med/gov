import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { GARAGE_FEATURES } from "../../constants/garageFeatures";
import GarageReveal from "./GarageReveal";

export default function GarageFeatureGrid({ fr = true, onEstimate, bento = true }) {
  const ordered = [...GARAGE_FEATURES].sort((a, b) => {
    if (a.id === "emergency") return -1;
    if (b.id === "emergency") return 1;
    return 0;
  });

  return (
    <div className={bento ? "ge-tools-bento" : "ge-feature-grid"}>
      {ordered.map((f, i) => {
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

        const cls = "ge-feature-card";

        const wrap = (node) => (
          <GarageReveal key={f.id} delay={i * 60}>
            {node}
          </GarageReveal>
        );

        if (isEstimate && onEstimate) {
          return wrap(
            <button type="button" className={cls} onClick={onEstimate}>
              {inner}
            </button>
          );
        }

        return wrap(
          <Link to={f.to} className={cls}>
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
