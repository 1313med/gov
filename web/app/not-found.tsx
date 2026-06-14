import Link from "next/link";
import SeoPageShell from "@/components/layout/SeoPageShell";

export default function NotFound() {
  return (
    <SeoPageShell
      lang="fr"
      breadcrumbs={[
        { label: "Goovoiture", href: "/" },
        { label: "Page introuvable", href: undefined },
      ]}
      hero={{
        kicker: "Erreur 404",
        title: "Cette route n'existe pas",
        description: "La page que vous cherchez a peut-être été déplacée ou n'a jamais existé.",
        badges: ["404"],
      }}
      cta={{
        title: "Retrouvez votre chemin",
        primaryHref: "/",
        primaryLabel: "Retour à l'accueil",
        secondaryHref: "/location-voiture",
        secondaryLabel: "Explorer les locations",
      }}
    >
      <div className="gv-card gv-card-static p-8 text-center max-w-xl mx-auto">
        <p className="text-[var(--gv-mut)] mb-6 leading-relaxed">
          Utilisez la recherche ou parcourez nos annonces de location et d&apos;occasion pour continuer votre parcours.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/location-voiture" className="gv-btn gv-btn-primary">
            Louer une voiture
          </Link>
          <Link href="/voiture-occasion" className="gv-btn gv-btn-outline">
            Acheter une voiture
          </Link>
        </div>
      </div>
    </SeoPageShell>
  );
}
