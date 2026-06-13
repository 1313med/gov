import type { SeoLang } from "@/lib/site";
import SectionHeader from "@/components/ui/SectionHeader";
import BadgePill from "@/components/ui/BadgePill";
import { EntityGrid } from "@/components/ui/PremiumCTA";

export default function ReviewsSection({
  reviews,
  avgRating,
  reviewCount,
  lang,
}: {
  reviews: Array<{ rating: number; comment?: string; authorId?: { name?: string }; createdAt?: string; verified?: boolean }>;
  avgRating: number;
  reviewCount: number;
  lang: SeoLang;
  verified?: boolean;
}) {
  const title = lang === "fr" ? "Avis clients" : lang === "ar" ? "آراء العملاء" : "Customer reviews";

  return (
    <section className="gv-sec-sm" aria-labelledby="reviews-heading">
      <SectionHeader
        eyebrow="Confiance"
        title={title}
        description={
          reviewCount > 0
            ? `${avgRating}/5 · ${reviewCount} avis sur Goovoiture`
            : lang === "fr"
              ? "Pas encore d'avis — soyez le premier."
              : "No reviews yet"
        }
      />
      {reviews.length > 0 ? (
        <EntityGrid cols={2}>
          {reviews.slice(0, 8).map((r, i) => (
            <div key={i} className="gv-card gv-card-static p-4">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[var(--gv-brand)] font-bold">{r.rating}/5</span>
                <span className="text-sm font-medium text-[var(--gv-ink)]">{r.authorId?.name || "Client"}</span>
                {r.verified ? <BadgePill variant="success">✓ Vérifié</BadgePill> : null}
              </div>
              {r.comment ? <p className="text-sm text-[var(--gv-mut)] leading-relaxed">{r.comment}</p> : null}
            </div>
          ))}
        </EntityGrid>
      ) : null}
    </section>
  );
}
