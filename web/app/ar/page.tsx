import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import HomeView, { homeMetadata } from "@/lib/views/HomeView";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const meta = homeMetadata("ar");
  return buildPageMetadata({ lang: "ar", ...meta });
}

export default function Page() {
  return <HomeView lang="ar" />;
}
