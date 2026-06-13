import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import { MarketplaceView, marketplaceMetadata } from "@/lib/views/MarketplaceView";
import { MOROCCO_CITIES } from "@client-seo/catalog/cities";

export const revalidate = 3600;

type Props = { params: Promise<{ slug?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const meta = await marketplaceMetadata("fr", "sale", slug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return [{ slug: [] }, ...MOROCCO_CITIES.slice(0, 15).map((c: { slug: string }) => ({ slug: [c.slug] }))];
}

export default async function Page({ params }: Props) {
  const { slug = [] } = await params;
  const meta = await marketplaceMetadata("fr", "sale", slug);
  if (!meta && slug.length) notFound();
  return <MarketplaceView lang="fr" intent="sale" slug={slug} />;
}
