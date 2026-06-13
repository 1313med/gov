import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { ContentClusterHubView, clusterHubMetadata } from "@/lib/views/ContentClusterView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = clusterHubMetadata("fr", "assurance");
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <ContentClusterHubView lang="fr" clusterSlug="assurance" />;
}
