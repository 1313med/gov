import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import BrandView, { brandMetadata } from "@/lib/views/BrandView";
import { CAR_BRANDS } from "@client-seo/catalog/brands";

export const revalidate = 86400;

type Props = { params: Promise<{ brandSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug } = await params;
  const meta = brandMetadata("fr", brandSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return CAR_BRANDS.map((b: { slug: string }) => ({ brandSlug: b.slug }));
}

export default async function Page({ params }: Props) {
  const { brandSlug } = await params;
  if (!brandMetadata("fr", brandSlug)) notFound();
  return <BrandView lang="fr" brandSlug={brandSlug} />;
}
