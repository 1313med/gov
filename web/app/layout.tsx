import type { Metadata } from "next";
import ThemeInit from "@/components/ThemeInit";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://goovoiture.ma"),
  title: "Goovoiture — Location & vente auto au Maroc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <ThemeInit />
      </head>
      <body>{children}</body>
    </html>
  );
}
