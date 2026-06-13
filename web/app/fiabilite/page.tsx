import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { ReliabilityHubView, reliabilityHubMetadata } from "@/lib/views/ReliabilityView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = reliabilityHubMetadata("fr");
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <ReliabilityHubView lang="fr" />;
}
