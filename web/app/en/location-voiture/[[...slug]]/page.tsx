import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { MarketplaceView, marketplaceMetadata } from "@/lib/views/MarketplaceView";

export const revalidate = 3600;

type Props = { params: Promise<{ slug?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const meta = await marketplaceMetadata("en", "rental", slug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "en", ...meta });
}

export default async function Page({ params }: Props) {
  const { slug = [] } = await params;
  return <MarketplaceView lang="en" intent="rental" slug={slug} />;
}
