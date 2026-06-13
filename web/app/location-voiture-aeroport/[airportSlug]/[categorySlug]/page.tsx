import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import AirportView from "@/lib/views/AirportView";
import { buildAirportSeo } from "@client-seo/programmaticSeo";

export const revalidate = 3600;

type Props = { params: Promise<{ airportSlug: string; categorySlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { airportSlug, categorySlug } = await params;
  const seo = buildAirportSeo("fr", airportSlug, categorySlug);
  if (!seo) return {};
  return buildPageMetadata({ lang: "fr", basePath: seo.path, title: seo.title, description: seo.description, keywords: seo.keywords });
}

export default async function Page({ params }: Props) {
  const { airportSlug, categorySlug } = await params;
  if (!buildAirportSeo("fr", airportSlug, categorySlug)) notFound();
  return <AirportView lang="fr" airportSlug={airportSlug} categorySlug={categorySlug} />;
}
