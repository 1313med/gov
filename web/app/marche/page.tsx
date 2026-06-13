import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { MarketHubView, marketHubMetadata } from "@/lib/views/MarketIntelligenceView";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const meta = marketHubMetadata("fr");
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <MarketHubView lang="fr" />;
}
