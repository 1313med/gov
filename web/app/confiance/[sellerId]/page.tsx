import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";
import SellerReputationView, { sellerTrustMetadata } from "@/lib/views/SellerReputationView";

export const revalidate = 600;

type Props = { params: Promise<{ sellerId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sellerId } = await params;
  const meta = sellerTrustMetadata("fr", sellerId);
  return buildPageMetadata({ lang: "fr", ...meta });
}

export default async function Page({ params }: Props) {
  const { sellerId } = await params;
  return <SellerReputationView lang="fr" sellerId={sellerId} />;
}
