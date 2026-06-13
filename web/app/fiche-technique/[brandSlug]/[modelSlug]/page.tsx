import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import VehicleSpecView, { vehicleSpecMetadata } from "@/lib/views/VehicleSpecView";
import { getAllVehicleSpecs } from "@client-seo/catalog/vehicleSpecs";

export const revalidate = 86400;

type Props = { params: Promise<{ brandSlug: string; modelSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, modelSlug } = await params;
  const meta = vehicleSpecMetadata("fr", brandSlug, modelSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return getAllVehicleSpecs().map((s) => ({ brandSlug: s!.brandSlug, modelSlug: s!.modelSlug }));
}

export default async function Page({ params }: Props) {
  const { brandSlug, modelSlug } = await params;
  if (!vehicleSpecMetadata("fr", brandSlug, modelSlug)) notFound();
  return <VehicleSpecView lang="fr" brandSlug={brandSlug} modelSlug={modelSlug} />;
}
