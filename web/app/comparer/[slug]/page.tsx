import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import ComparisonView, { comparisonMetadata } from "@/lib/views/ComparisonView";
import { getAllComparisons } from "@client-seo/catalog/comparisons";

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = comparisonMetadata("fr", slug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return getAllComparisons().map((c) => ({ slug: c.slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!comparisonMetadata("fr", slug)) notFound();
  return <ComparisonView lang="fr" slug={slug} />;
}
