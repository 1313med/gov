import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import TrustView, { trustMetadata } from "@/lib/views/TrustView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = trustMetadata("a-propos", "ar");
  return buildPageMetadata({ lang: "ar", ...meta });
}

export default function Page() {
  return <TrustView lang="ar" slug="a-propos" />;
}
