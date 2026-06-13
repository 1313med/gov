import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildPageMetadata } from "@/lib/metadata";
import { QuestionDetailView, questionMetadata } from "@/lib/views/QuestionsView";
import { getAllQuestionSeeds } from "@client-seo/catalog/questionSeeds";

export const revalidate = 600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = questionMetadata("fr", slug);
  if (!meta) return {};
  return buildPageMetadata({ lang: "fr", ...meta });
}

export async function generateStaticParams() {
  return getAllQuestionSeeds().map((q) => ({ slug: q.slug }));
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!questionMetadata("fr", slug)) notFound();
  return <QuestionDetailView lang="fr" slug={slug} />;
}
