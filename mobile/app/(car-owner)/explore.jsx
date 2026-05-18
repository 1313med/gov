import MarketplaceExplore from "../../src/components/marketplace/MarketplaceExplore";

export default function CarOwnerExploreScreen() {
  return (
    <MarketplaceExplore
      variant="carOwner"
      defaultMode="buy"
      buyFirst
      showSellCta
    />
  );
}
