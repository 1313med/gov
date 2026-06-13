import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { QuestionsHubView, questionsHubMetadata } from "@/lib/views/QuestionsView";

export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const meta = questionsHubMetadata("fr");
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <QuestionsHubView lang="fr" />;
}
