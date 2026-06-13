import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import { ProPageView, proPageMetadata } from "@/lib/views/ProView";
import { PRO_PAGES } from "@client-seo/catalog/proPages";

export const revalidate = 86400;

type Props = { params: Promise<{ pageSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pageSlug } = await params;
  const meta = proPageMetadata("fr", pageSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return PRO_PAGES.map((p: { slug: string }) => ({ pageSlug: p.slug }));
}

export default async function Page({ params }: Props) {
  const { pageSlug } = await params;
  if (!proPageMetadata("fr", pageSlug)) notFound();
  return <ProPageView lang="fr" pageSlug={pageSlug} />;
}
