import type { SeoLang } from "@/lib/site";
import { buildSeoPath } from "@client-seo/seoPaths";

const NAV = {
  fr: {
    rent: "Location",
    sale: "Occasion",
    compare: "Comparatifs",
    blog: "Blog",
    pro: "Pro",
    login: "Connexion",
    register: "Inscription",
  },
  en: {
    rent: "Rental",
    sale: "Used cars",
    compare: "Compare",
    blog: "Blog",
    pro: "Pro",
    login: "Sign in",
    register: "Register",
  },
  ar: {
    rent: "تأجير",
    sale: "مستعملة",
    compare: "مقارنة",
    blog: "مدونة",
    pro: "Pro",
    login: "دخول",
    register: "تسجيل",
  },
};

export default function SiteHeader({ lang }: { lang: SeoLang }) {
  const L = NAV[lang];

  return (
    <header className="gv-nav">
      <div className="gv-nav-inner">
        <a href={buildSeoPath(lang, "/")} className="gv-nav-logo">
          Goo<em>voiture</em>
        </a>
        <nav className="gv-nav-links" aria-label="Navigation principale">
          <a href={buildSeoPath(lang, "/location-voiture")} className="gv-nav-link">{L.rent}</a>
          <a href={buildSeoPath(lang, "/voiture-occasion")} className="gv-nav-link">{L.sale}</a>
          <a href={buildSeoPath(lang, "/comparer")} className="gv-nav-link">{L.compare}</a>
          <a href={buildSeoPath(lang, "/blog")} className="gv-nav-link">{L.blog}</a>
          <a href={buildSeoPath(lang, "/pro")} className="gv-nav-link">{L.pro}</a>
        </nav>
        <div className="gv-nav-end">
          <a href="/login" className="gv-nav-link gv-nav-link-muted">{L.login}</a>
          <a href="/register" className="gv-btn gv-btn-primary gv-nav-cta">{L.register}</a>
        </div>
      </div>
    </header>
  );
}
