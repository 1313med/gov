import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import AirportView from "@/lib/views/AirportView";
import { buildAirportSeo } from "@client-seo/programmaticSeo";
import { MOROCCO_AIRPORTS } from "@client-seo/catalog/airports";

export const revalidate = 3600;

type Props = { params: Promise<{ airportSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { airportSlug } = await params;
  const seo = buildAirportSeo("fr", airportSlug);
  if (!seo) return {};
  return buildPageMetadata({ lang: "fr", basePath: seo.path, title: seo.title, description: seo.description, keywords: seo.keywords });
}

export async function generateStaticParams() {
  return MOROCCO_AIRPORTS.map((a: { slug: string }) => ({ airportSlug: a.slug }));
}

export default async function Page({ params }: Props) {
  const { airportSlug } = await params;
  if (!buildAirportSeo("fr", airportSlug)) notFound();
  return <AirportView lang="fr" airportSlug={airportSlug} />;
}
