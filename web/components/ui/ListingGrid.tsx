import type { SeoLang } from "@/lib/site";
import VehicleCard from "./VehicleCard";
import { EntityGrid, EmptyState } from "./PremiumCTA";
import { buildSeoPath } from "@client-seo/seoPaths";
import { buildRentalListingPath, buildSaleListingPath } from "@client-seo/slugUtils";
import { formatListingTitle } from "@client-seo/listingContent";

type Intent = "rental" | "sale";

export default function ListingGrid({
  listings,
  lang,
  intent,
  emptyTitle,
  emptyActionHref,
  emptyActionLabel,
}: {
  listings: Record<string, unknown>[];
  lang: SeoLang;
  intent: Intent;
  emptyTitle?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
}) {
  if (!listings.length) {
    return (
      <EmptyState
        title={emptyTitle || (lang === "fr" ? "Aucune annonce pour le moment" : "No listings yet")}
        description={lang === "fr" ? "Revenez bientôt ou explorez d'autres villes." : "Check back soon or browse other cities."}
        actionHref={emptyActionHref}
        actionLabel={emptyActionLabel}
      />
    );
  }

  return (
    <EntityGrid cols={3}>
      {listings.map((item) => {
        const image = Array.isArray(item.images) && item.images[0] ? String(item.images[0]) : null;
        const price =
          intent === "rental"
            ? `${Number(item.pricePerDay).toLocaleString()} MAD`
            : `${Number(item.price).toLocaleString()} MAD`;

        return (
          <VehicleCard
            key={String(item._id)}
            title={formatListingTitle(item)}
            subtitle={item.city ? String(item.city) : undefined}
            price={price}
            priceLabel={intent === "rental" ? "/jour" : undefined}
            href={buildSeoPath(
              lang,
              intent === "sale" ? buildSaleListingPath(item) : buildRentalListingPath(item)
            )}
            image={image}
            intent={intent}
            badge={intent === "rental" ? "Location" : "Occasion"}
          />
        );
      })}
    </EntityGrid>
  );
}
