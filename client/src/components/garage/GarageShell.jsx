import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/garage.css";

/**
 * Shared elite layout for garage sub-pages (intel tools, add car, edit…)
 */
export default function GarageShell({
  title,
  subtitle,
  emoji,
  children,
  backTo = "/garage",
  backLabel,
  fr = true,
  heroAccent,
  fullWidth = false,
}) {
  const { dark } = useTheme();
  const pageClass = `ge-page ge-subpage${dark ? "" : " light"}`;

  return (
    <div className={pageClass}>
      <div className="ge-ambient">
        <div className="ge-ambient-orb a" />
        <div className="ge-ambient-orb b" />
        <div className="ge-ambient-grid" />
      </div>

      <header className="ge-sub-hero" style={heroAccent ? { "--ge-hero-accent": heroAccent } : undefined}>
        <div className="ge-sub-hero-inner">
          <Link to={backTo} className="ge-back ge-fade-in">
            <ArrowLeft size={18} />
            {backLabel || (fr ? "Mon garage" : "My garage")}
          </Link>
          <div className="ge-sub-title-block ge-slide-up">
            {emoji && <span className="ge-sub-emoji ge-float">{emoji}</span>}
            <div>
              <p className="ge-kicker">
                <Sparkles size={12} /> GooVoiture · {fr ? "Garage" : "Garage"}
              </p>
              <h1 className="ge-title ge-title-sub">{title}</h1>
              {subtitle && <p className="ge-subtitle">{subtitle}</p>}
            </div>
          </div>
        </div>
      </header>

      <main className={`ge-body ge-fade-in${fullWidth ? " wide" : ""}`} style={{ animationDelay: "0.08s" }}>
        {children}
      </main>
    </div>
  );
}
