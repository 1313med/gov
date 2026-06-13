import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import ProfileView, { profileMetadata } from "@/lib/views/ProfileView";

export const revalidate = 600;
export const dynamicParams = true;

type Props = { params: Promise<{ citySlug: string; agencySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug, agencySlug } = await params;
  const meta = await profileMetadata("agency", citySlug, agencySlug);
  if (!meta) return { robots: "noindex, nofollow" };
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default async function Page({ params }: Props) {
  const { citySlug, agencySlug } = await params;
  const meta = await profileMetadata("agency", citySlug, agencySlug);
  if (!meta) notFound();
  return <ProfileView lang="fr" kind="agency" citySlug={citySlug} profileSlug={agencySlug} />;
}
