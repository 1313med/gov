import type { SeoLang } from "@/lib/site";

export default function ReviewsSection({
  reviews,
  avgRating,
  reviewCount,
  lang,
}: {
  reviews: Array<{ rating: number; comment?: string; authorId?: { name?: string }; createdAt?: string }>;
  avgRating: number;
  reviewCount: number;
  lang: SeoLang;
  verified?: boolean;
}) {
  const title = lang === "fr" ? "Avis clients" : lang === "ar" ? "آراء العملاء" : "Customer reviews";

  return (
    <section className="mb-10" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 id="reviews-heading" className="text-xl font-semibold">
          {title}
        </h2>
        {reviewCount > 0 ? (
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-violet-600">{avgRating}/5</span> · {reviewCount} avis
          </p>
        ) : (
          <p className="text-sm text-gray-500">{lang === "fr" ? "Pas encore d'avis" : "No reviews yet"}</p>
        )}
      </div>
      {reviews.length > 0 ? (
        <ul className="space-y-3">
          {reviews.slice(0, 8).map((r, i) => (
            <li key={i} className="rounded-xl border p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-violet-600 font-semibold">{r.rating}/5</span>
                <span className="text-sm text-gray-700">{r.authorId?.name || "Client"}</span>
              </div>
              {r.comment ? <p className="text-sm text-gray-600">{r.comment}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
