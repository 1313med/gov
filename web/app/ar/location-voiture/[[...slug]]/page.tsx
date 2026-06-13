import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { MarketplaceView, marketplaceMetadata } from "@/lib/views/MarketplaceView";

export const revalidate = 3600;

type Props = { params: Promise<{ slug?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const meta = await marketplaceMetadata("ar", "rental", slug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "ar", ...meta });
}

export default async function Page({ params }: Props) {
  const { slug = [] } = await params;
  return <MarketplaceView lang="ar" intent="rental" slug={slug} />;
}
