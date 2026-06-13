import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import ComparisonsHubView, { comparisonsHubMetadata } from "@/lib/views/ComparisonsHubView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = comparisonsHubMetadata("fr");
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <ComparisonsHubView lang="fr" />;
}
