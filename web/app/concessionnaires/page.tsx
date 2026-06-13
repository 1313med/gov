import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import ProfessionalsHubView, { professionalsHubMetadata } from "@/lib/views/ProfessionalsHubView";

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const meta = professionalsHubMetadata("fr", "dealer");
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <ProfessionalsHubView lang="fr" kind="dealer" />;
}
