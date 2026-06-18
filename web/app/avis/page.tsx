import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import TrustView, { trustMetadata } from "@/lib/views/TrustView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = trustMetadata("avis", "fr");
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <TrustView lang="fr" slug="avis" />;
}
