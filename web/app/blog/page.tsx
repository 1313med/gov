import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import { BlogHubView, blogHubMetadata } from "@/lib/views/BlogView";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  const meta = blogHubMetadata("fr");
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default function Page() {
  return <BlogHubView lang="fr" />;
}
