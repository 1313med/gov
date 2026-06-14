import { Link } from "react-router-dom";
import AuthTopBar from "../components/AuthTopBar";

const CSS = `
.nf-root {
  min-height: 100vh;
  background: var(--bg0, #05060f);
  display: flex;
  flex-direction: column;
  font-family: var(--sans, Outfit, system-ui, sans-serif);
}
.nf-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}
.nf-card {
  max-width: 520px;
  width: 100%;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  background: var(--card-bg, rgba(16,20,38,0.85));
  border: 1px solid var(--card-bdr, rgba(255,255,255,0.08));
  box-shadow: 0 24px 48px rgba(0,0,0,0.35);
  text-align: center;
  backdrop-filter: blur(12px);
}
.nf-code {
  font-size: 4rem;
  font-weight: 800;
  font-family: var(--disp, Poppins, sans-serif);
  background: linear-gradient(135deg, #7c6bff, #38bdf8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 0.5rem;
}
.nf-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--ink, #f5f7ff);
  margin-bottom: 0.75rem;
}
.nf-body {
  color: var(--mut, #8a95bf);
  line-height: 1.6;
  margin-bottom: 1.75rem;
}
.nf-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.nf-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s;
}
.nf-btn:hover { transform: translateY(-2px); }
.nf-btn-primary {
  background: #7c6bff;
  color: #fff;
}
.nf-btn-outline {
  border: 1px solid rgba(255,255,255,0.15);
  color: var(--ink, #f5f7ff);
}
`;

export default function NotFoundPage() {
  return (
    <div className="nf-root gv-auth">
      <style>{CSS}</style>
      <AuthTopBar backLabel="← Accueil" />
      <main className="nf-main">
        <div className="nf-card">
          <div className="nf-code">404</div>
          <h1 className="nf-title">Page introuvable</h1>
          <p className="nf-body">
            Cette adresse n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil ou explorez nos annonces.
          </p>
          <div className="nf-actions">
            <Link to="/" className="nf-btn nf-btn-primary">
              Retour à l&apos;accueil
            </Link>
            <Link to="/location-voiture" className="nf-btn nf-btn-outline">
              Louer une voiture
            </Link>
            <Link to="/voiture-occasion" className="nf-btn nf-btn-outline">
              Acheter une voiture
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
