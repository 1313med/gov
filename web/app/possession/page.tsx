import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { OwnershipHubView, ownershipHubMetadata } from "@/lib/views/OwnershipTimelineView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = ownershipHubMetadata("fr");
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <OwnershipHubView lang="fr" />;
}
