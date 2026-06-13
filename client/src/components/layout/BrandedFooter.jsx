import { Link } from "react-router-dom";
import { useAppLang } from "../../context/AppLangContext";
import { buildSeoPath } from "../../seo/seoPaths";

export default function BrandedFooter() {
  const { lang, copy } = useAppLang();

  const sellLabel =
    lang === "fr"
      ? "Vendre ma voiture"
      : lang === "ar"
        ? "بيع سيارتي"
        : "Sell my car";

  return (
    <footer className="hx-ft">
      <div className="hx-ft-inner">
        <div className="hx-ft-top">
          <div>
            <div className="hx-ft-logo">
              Goo<em>voiture</em>
            </div>
            <p className="hx-ft-tag">{copy.home.footer.tag}</p>
          </div>
          <div>
            <p className="hx-ft-ch">{copy.home.footer.platform}</p>
            <Link to="/cars" className="hx-ft-link">
              {copy.home.footer.buyCars}
            </Link>
            <Link to="/rentals" className="hx-ft-link">
              {copy.home.footer.rentCars}
            </Link>
            <Link to="/vendre-ma-voiture" className="hx-ft-link">
              {sellLabel}
            </Link>
            <Link to="/login" className="hx-ft-link">
              {copy.home.footer.signIn}
            </Link>
          </div>
          <div>
            <p className="hx-ft-ch">{copy.home.footer.account}</p>
            <Link to="/register" className="hx-ft-link">
              {copy.home.footer.register}
            </Link>
            <Link to="/login" className="hx-ft-link">
              {copy.home.footer.login}
            </Link>
          </div>
          <div>
            <p className="hx-ft-ch">{copy.home.footer.legal}</p>
            <Link
              to={buildSeoPath(lang, "/conditions-utilisation")}
              className="hx-ft-link"
            >
              {copy.home.footer.terms}
            </Link>
            <Link
              to={buildSeoPath(lang, "/politique-confidentialite")}
              className="hx-ft-link"
            >
              {copy.home.footer.privacy}
            </Link>
          </div>
        </div>
        <div className="hx-ft-bot">
          <span>
            © {new Date().getFullYear()} <em>Goovoiture</em> — {copy.home.footer.copy}
          </span>
          <span>{copy.home.footer.built}</span>
        </div>
      </div>
    </footer>
  );
}
