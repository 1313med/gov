import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { ProHubView, proHubMetadata } from "@/lib/views/ProView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = proHubMetadata("fr");
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <ProHubView lang="fr" />;
}
