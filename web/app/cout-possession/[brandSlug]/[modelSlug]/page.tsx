import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import TcoCalculatorView, { tcoMetadata } from "@/lib/views/TcoCalculatorView";
import { getAllTcoBenchmarks } from "@client-seo/catalog/tcoBenchmarks";

export const revalidate = 86400;

type Props = { params: Promise<{ brandSlug: string; modelSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandSlug, modelSlug } = await params;
  const meta = tcoMetadata("fr", brandSlug, modelSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return getAllTcoBenchmarks().map((s) => ({ brandSlug: s!.brandSlug, modelSlug: s!.modelSlug }));
}

export default async function Page({ params }: Props) {
  const { brandSlug, modelSlug } = await params;
  if (!tcoMetadata("fr", brandSlug, modelSlug)) notFound();
  return <TcoCalculatorView lang="fr" brandSlug={brandSlug} modelSlug={modelSlug} />;
}
