import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import { ContentClusterTopicView, clusterTopicMetadata } from "@/lib/views/ContentClusterView";
import { CONTENT_CLUSTERS } from "@client-seo/catalog/contentClusters";

export const revalidate = 86400;

type Props = { params: Promise<{ topicSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicSlug } = await params;
  const meta = clusterTopicMetadata("fr", "assurance", topicSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return CONTENT_CLUSTERS.assurance.topics.map((t) => ({ topicSlug: t.slug }));
}

export default async function Page({ params }: Props) {
  const { topicSlug } = await params;
  if (!clusterTopicMetadata("fr", "assurance", topicSlug)) notFound();
  return <ContentClusterTopicView lang="fr" clusterSlug="assurance" topicSlug={topicSlug} />;
}
