import MarketplaceExplore from "../../src/components/marketplace/MarketplaceExplore";

export default function CustomerExploreScreen() {
  return (
    <MarketplaceExplore
      variant="customer"
      defaultMode="rent"
      persistModeKey="goovoiture-customer-explore"
    />
  );
}
