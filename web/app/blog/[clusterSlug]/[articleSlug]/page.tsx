import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import { BlogArticleView, blogArticleMetadata } from "@/lib/views/BlogView";
import { BLOG_ARTICLES } from "@client-seo/catalog/blogArticles";

export const revalidate = 86400;

type Props = { params: Promise<{ clusterSlug: string; articleSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleSlug } = await params;
  const meta = blogArticleMetadata("fr", articleSlug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return BLOG_ARTICLES.map((a: { cluster: string; slug: string }) => ({
    clusterSlug: a.cluster,
    articleSlug: a.slug,
  }));
}

export default async function Page({ params }: Props) {
  const { clusterSlug, articleSlug } = await params;
  if (!blogArticleMetadata("fr", articleSlug)) notFound();
  return <BlogArticleView lang="fr" clusterSlug={clusterSlug} articleSlug={articleSlug} />;
}
