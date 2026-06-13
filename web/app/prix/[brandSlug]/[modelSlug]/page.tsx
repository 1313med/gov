import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import PriceIntelligenceView, { priceIntelMetadata } from "@/lib/views/PriceIntelligenceView";
import { getAllVehicleSpecs } from "@client-seo/catalog/vehicleSpecs";

export const revalidate = 3600;

type Props = { params: Promise<{ brandSlug: string; modelSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, modelSlug } = await params;
  const meta = priceIntelMetadata("fr", brandSlug, modelSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return getAllVehicleSpecs().map((s) => ({ brandSlug: s!.brandSlug, modelSlug: s!.modelSlug }));
}

export default async function Page({ params }: Props) {
  const { brandSlug, modelSlug } = await params;
  if (!priceIntelMetadata("fr", brandSlug, modelSlug)) notFound();
  return <PriceIntelligenceView lang="fr" brandSlug={brandSlug} modelSlug={modelSlug} />;
}
