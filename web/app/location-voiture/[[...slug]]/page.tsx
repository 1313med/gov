import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import { MarketplaceView, marketplaceMetadata } from "@/lib/views/MarketplaceView";
import type { SeoLang } from "@/lib/site";
import { MOROCCO_CITIES } from "@client-seo/catalog/cities";
import { RENTAL_CATEGORIES } from "@client-seo/catalog/categories";

export const revalidate = 3600;

type Props = { params: Promise<{ slug?: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const meta = await marketplaceMetadata("fr", "rental", slug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  const paths: { slug: string[] }[] = [{ slug: [] }];
  for (const c of MOROCCO_CITIES.slice(0, 20)) {
    paths.push({ slug: [c.slug] });
    for (const cat of RENTAL_CATEGORIES.slice(0, 4)) {
      paths.push({ slug: [c.slug, cat.slug] });
    }
  }
  return paths;
}

export default async function Page({ params }: Props) {
  const { slug = [] } = await params;
  const meta = await marketplaceMetadata("fr", "rental", slug);
  if (!meta && slug.length) notFound();
  return <MarketplaceView lang="fr" intent="rental" slug={slug} />;
}
