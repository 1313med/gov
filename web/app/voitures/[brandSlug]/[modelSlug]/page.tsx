import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import ModelAuthorityView, { modelAuthorityPageMetadata } from "@/lib/views/ModelAuthorityView";
import { getModelAuthority, getAllAuthorityModels } from "@client-seo/catalog/modelsAuthority";

export const revalidate = 86400;

type Props = { params: Promise<{ brandSlug: string; modelSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, modelSlug } = await params;
  const meta = modelAuthorityPageMetadata("fr", brandSlug, modelSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return getAllAuthorityModels().map((m) => ({
    brandSlug: m.brandSlug,
    modelSlug: m.modelSlug,
  }));
}

export default async function Page({ params }: Props) {
  const { brandSlug, modelSlug } = await params;
  const model = getModelAuthority(brandSlug, modelSlug);
  if (!model) notFound();
  return <ModelAuthorityView lang="fr" brandSlug={brandSlug} modelSlug={modelSlug} />;
}
