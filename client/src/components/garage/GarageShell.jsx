import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import GarageAmbient from "./GarageAmbient";
import GarageDock from "./GarageDock";
import GarageIconBadge from "./GarageIconBadge";
import "../../styles/garage.css";

export default function GarageShell({
  title,
  subtitle,
  icon: Icon,
  iconVariant = "teal",
  children,
  backTo = "/garage",
  backLabel,
  fr = true,
  heroAccent,
  fullWidth = false,
  showDock = true,
}) {
  const { dark } = useTheme();
  const pageClass = `ge-page ge-subpage${dark ? "" : " light"}`;

  return (
    <div className={pageClass}>
      <GarageAmbient variant="sub" />

      <header
        className="ge-sub-hero ge-fade-in"
        style={heroAccent ? { "--ge-hero-accent": heroAccent } : undefined}
      >
        <div className="ge-sub-hero-inner">
          <Link to={backTo} className="ge-back">
            <ArrowLeft size={18} strokeWidth={2} />
            {backLabel || (fr ? "Mon garage" : "My garage")}
          </Link>
          <div className="ge-sub-title-block ge-slide-up">
            {Icon && <GarageIconBadge icon={Icon} size="lg" variant={iconVariant} pulse />}
            <div>
              <p className="ge-kicker">
                <Sparkles size={12} strokeWidth={2.5} /> GooVoiture · {fr ? "Garage" : "Garage"}
              </p>
              <h1 className="ge-title ge-title-sub">{title}</h1>
              {subtitle && <p className="ge-subtitle">{subtitle}</p>}
            </div>
          </div>
        </div>
      </header>

      <main className={`ge-body ge-fade-in${fullWidth ? " wide" : ""}`} style={{ animationDelay: "0.1s" }}>
        {children}
      </main>

      {showDock && <GarageDock fr={fr} />}
    </div>
  );
}
