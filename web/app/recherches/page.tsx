import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { SearchIntelHubView, searchIntelHubMetadata } from "@/lib/views/SearchIntelligenceView";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const meta = searchIntelHubMetadata("fr");
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <SearchIntelHubView lang="fr" />;
}
