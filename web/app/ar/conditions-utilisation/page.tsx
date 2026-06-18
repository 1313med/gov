import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import LegalView, { legalMetadata } from "@/lib/views/LegalView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = legalMetadata("conditions-utilisation", "ar");
  if (!meta) return {};
  return buildPageMetadata({ lang: "ar", ...meta });
}

export default function Page() {
  return <LegalView lang="ar" slug="conditions-utilisation" />;
}
