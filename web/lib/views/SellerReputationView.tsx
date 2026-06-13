import { notFound } from "next/navigation";
import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import { fetchReputation } from "@/lib/api";
import Breadcrumbs from "@/components/ssr/Breadcrumbs";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { sellerTrustPath } from "@client-seo/catalog/reliabilityIndex";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, breadcrumbJsonLd, aggregateRatingJsonLd } from "@client-seo/jsonLd";

export function sellerTrustMetadata(lang: SeoLang, sellerId: string) {
  return {
    basePath: sellerTrustPath(sellerId),
    title: "Profil confiance vendeur — GoVoiture",
    description: "Score réputation GoVoiture : avis vérifiés, identité, historique ventes marketplace Maroc.",
    keywords: "réputation vendeur voiture maroc, confiance concessionnaire maroc",
  };
}

export default async function SellerReputationView({
  lang,
  sellerId,
}: {
  lang: SeoLang;
  sellerId: string;
}) {
  const rep = await fetchReputation(sellerId);
  if (!rep) notFound();

  const siteUrl = getSiteUrl();
  const path = sellerTrustPath(sellerId);
  const pageUrl = `${siteUrl}${buildSeoPath(lang, path)}`;

  return (
    <>
      <JsonLd
        data={graphJsonLd(
          rep.reviewCount > 0
            ? aggregateRatingJsonLd({
                itemReviewed: rep.name,
                ratingValue: rep.avgRating,
                reviewCount: rep.reviewCount,
              })
            : null,
          breadcrumbJsonLd([
            { name: "GoVoiture", url: siteUrl },
            { name: "Confiance", url: pageUrl },
            { name: rep.name, url: pageUrl },
          ])
        )}
      />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Breadcrumbs
          items={[
            { label: "Goovoiture", href: "/" },
            { label: "Confiance", href: undefined },
            { label: rep.name, href: undefined },
          ]}
          lang={lang}
        />

        <div className="flex items-start gap-4 mb-8">
          {rep.avatar ? (
            <img src={rep.avatar} alt={rep.name} className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-2xl font-bold text-violet-600">
              {rep.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{rep.name}</h1>
            {rep.city ? <p className="text-gray-500">{rep.city}</p> : null}
            <p className="text-sm text-gray-500 mt-1">Membre depuis {rep.memberSince ? new Date(rep.memberSince).getFullYear() : "—"}</p>
          </div>
        </div>

        <div className="rounded-xl border p-6 mb-8 text-center">
          <p className="text-sm text-gray-500">Score confiance GoVoiture</p>
          <p className="text-5xl font-bold text-violet-600">{rep.score}/100</p>
          <p className="text-lg text-gray-600 mt-1">{rep.grade}</p>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 text-center text-sm">
          <div className="rounded-lg bg-gray-50 p-3"><dt className="text-gray-500">Note moyenne</dt><dd className="text-xl font-bold">{rep.avgRating || "—"}/5</dd></div>
          <div className="rounded-lg bg-gray-50 p-3"><dt className="text-gray-500">Avis</dt><dd className="text-xl font-bold">{rep.reviewCount}</dd></div>
          <div className="rounded-lg bg-gray-50 p-3"><dt className="text-gray-500">Vérifiés</dt><dd className="text-xl font-bold">{rep.verifiedReviewCount}</dd></div>
          <div className="rounded-lg bg-gray-50 p-3"><dt className="text-gray-500">Vendues</dt><dd className="text-xl font-bold">{rep.soldCount}</dd></div>
        </dl>

        {rep.badges.length > 0 ? (
          <section className="mb-8">
            <h2 className="font-semibold mb-3">Badges confiance</h2>
            <ul className="flex flex-wrap gap-2">
              {rep.badges.map((b) => (
                <li key={b.id} className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">{b.label}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-8 text-sm text-gray-600">
          <p>{rep.inventoryCount > 0 ? `${rep.inventoryCount} annonces vente actives` : ""}{rep.inventoryCount > 0 && rep.fleetSize > 0 ? " · " : ""}{rep.fleetSize > 0 ? `${rep.fleetSize} véhicules location` : ""}</p>
          {rep.identityVerified ? <p className="text-green-600 mt-2">✓ Identité vérifiée GoVoiture</p> : null}
        </section>

        <p className="text-xs text-gray-400">{rep.methodology}</p>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
