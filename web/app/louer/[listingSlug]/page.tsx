import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import ListingView, { listingMetadata } from "@/lib/views/ListingView";

export const revalidate = 300;
export const dynamicParams = true;

type Props = { params: Promise<{ listingSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { listingSlug } = await params;
  const meta = await listingMetadata("fr", "rental", listingSlug);
  if (!meta) return { robots: "noindex, nofollow" };
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default async function Page({ params }: Props) {
  const { listingSlug } = await params;
  const meta = await listingMetadata("fr", "rental", listingSlug);
  if (!meta) notFound();
  return <ListingView lang="fr" intent="rental" listingSlug={listingSlug} />;
}
