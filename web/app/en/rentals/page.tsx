import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import BrowseMarketplaceView, { browseMetadata } from "@/lib/views/BrowseMarketplaceView";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const meta = browseMetadata("en", "rental");
  if (!meta) return {};
  return buildPageMetadata({ lang: "en", ...meta });
}

export default function Page() {
  return <BrowseMarketplaceView lang="en" intent="rental" />;
}
