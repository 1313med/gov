import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import BuyerAssistantView, { buyerAssistantMetadata } from "@/lib/views/BuyerAssistantView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = buyerAssistantMetadata("fr");
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <BuyerAssistantView lang="fr" />;
}
