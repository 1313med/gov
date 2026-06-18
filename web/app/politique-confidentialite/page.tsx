import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import LegalView, { legalMetadata } from "@/lib/views/LegalView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = legalMetadata("politique-confidentialite", "fr");
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <LegalView lang="fr" slug="politique-confidentialite" />;
}
