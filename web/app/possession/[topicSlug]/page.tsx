import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import OwnershipTimelineDetailView, { ownershipTimelineMetadata } from "@/lib/views/OwnershipTimelineView";
import { getAllOwnershipTimelines } from "@client-seo/catalog/ownershipTimelines";

export const revalidate = 86400;

type Props = { params: Promise<{ topicSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { topicSlug } = await params;
  const meta = ownershipTimelineMetadata("fr", topicSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return getAllOwnershipTimelines().map((t) => ({ topicSlug: t!.slug }));
}

export default async function Page({ params }: Props) {
  const { topicSlug } = await params;
  if (!ownershipTimelineMetadata("fr", topicSlug)) notFound();
  return <OwnershipTimelineDetailView lang="fr" topicSlug={topicSlug} />;
}
