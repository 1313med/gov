import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import ProfessionalsHubView, { professionalsHubMetadata } from "@/lib/views/ProfessionalsHubView";
import { getCityBySlug } from "@client-seo/catalog/cities";
import { MOROCCO_CITIES } from "@client-seo/catalog/cities";

export const revalidate = 600;

type Props = { params: Promise<{ citySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { citySlug } = await params;
  const meta = professionalsHubMetadata("fr", "agency", citySlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return MOROCCO_CITIES.slice(0, 15).map((c) => ({ citySlug: c.slug }));
}

export default async function Page({ params }: Props) {
  const { citySlug } = await params;
  if (!getCityBySlug(citySlug)) notFound();
  return <ProfessionalsHubView lang="fr" kind="agency" citySlug={citySlug} />;
}
