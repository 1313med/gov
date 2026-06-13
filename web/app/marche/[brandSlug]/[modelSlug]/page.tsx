import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import MarketIntelligenceView, { marketIntelMetadata } from "@/lib/views/MarketIntelligenceView";
import { getAllReliabilityIndexes } from "@client-seo/catalog/reliabilityIndex";

export const revalidate = 3600;

type Props = { params: Promise<{ brandSlug: string; modelSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, modelSlug } = await params;
  const meta = marketIntelMetadata("fr", brandSlug, modelSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return getAllReliabilityIndexes().map((s) => ({ brandSlug: s!.brandSlug, modelSlug: s!.modelSlug }));
}

export default async function Page({ params }: Props) {
  const { brandSlug, modelSlug } = await params;
  if (!marketIntelMetadata("fr", brandSlug, modelSlug)) notFound();
  return <MarketIntelligenceView lang="fr" brandSlug={brandSlug} modelSlug={modelSlug} />;
}
