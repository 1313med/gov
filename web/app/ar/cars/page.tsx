import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import BrowseMarketplaceView, { browseMetadata } from "@/lib/views/BrowseMarketplaceView";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const meta = browseMetadata("ar", "sale");
  if (!meta) return {};
  return buildPageMetadata({ lang: "ar", ...meta });
}

export default function Page() {
  return <BrowseMarketplaceView lang="ar" intent="sale" />;
}
