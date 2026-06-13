import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import BrandView, { brandMetadata } from "@/lib/views/BrandView";
import { CAR_BRANDS, getBrandBySlug } from "@client-seo/catalog/brands";

export const revalidate = 86400;

type Props = { params: Promise<{ brandSlug: string; modelSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, modelSlug } = await params;
  const meta = brandMetadata("fr", brandSlug, modelSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  const paths: { brandSlug: string; modelSlug: string }[] = [];
  for (const brand of CAR_BRANDS.slice(0, 10)) {
    for (const model of brand.models.slice(0, 3)) {
      paths.push({ brandSlug: brand.slug, modelSlug: model });
    }
  }
  return paths;
}

export default async function Page({ params }: Props) {
  const { brandSlug, modelSlug } = await params;
  const brand = getBrandBySlug(brandSlug);
  if (!brand || !brand.models.includes(modelSlug)) notFound();
  return <BrandView lang="fr" brandSlug={brandSlug} modelSlug={modelSlug} />;
}
