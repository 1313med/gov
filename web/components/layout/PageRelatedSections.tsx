import type { SeoLang } from "@/lib/site";
import { fetchAgencies, fetchDealers, fetchRentals, fetchSales } from "@/lib/api";
import { buildSeoPath } from "@client-seo/seoPaths";
import { CAR_BRANDS, brandPath } from "@client-seo/catalog/brands";
import { getAllBlogArticles, blogArticlePath } from "@client-seo/catalog/blogArticles";
import SectionHeader from "@/components/ui/SectionHeader";
import { EntityGrid, RelatedLinksSection } from "@/components/ui/PremiumCTA";
import VehicleCard from "@/components/ui/VehicleCard";
import { buildRentalListingPath, buildSaleListingPath } from "@client-seo/slugUtils";

export default async function PageRelatedSections({
  lang,
  brandSlug,
  brandFilter,
  showListings = true,
  showBrands = true,
  showBlog = true,
  showAgencies = true,
  extraLinks,
}: {
  lang: SeoLang;
  brandSlug?: string;
  brandFilter?: string;
  showListings?: boolean;
  showBrands?: boolean;
  showBlog?: boolean;
  showAgencies?: boolean;
  extraLinks?: Array<{ label: string; href: string }>;
}) {
  const [rentals, sales, agencies, dealers] = await Promise.all([
    showListings ? fetchRentals(undefined, brandFilter, 4) : Promise.resolve([]),
    showListings ? fetchSales(undefined, brandFilter, 4) : Promise.resolve([]),
    showAgencies ? fetchAgencies(undefined, undefined) : Promise.resolve([]),
    showAgencies ? fetchDealers(undefined, undefined) : Promise.resolve([]),
  ]);

  const blogArticles = showBlog
    ? getAllBlogArticles()
        .filter((a) => !brandSlug || a.slug.includes(brandSlug))
        .slice(0, 4)
    : [];

  const brandLinks = showBrands
    ? CAR_BRANDS.slice(0, 8).map((b) => ({
        label: b.name[lang] || b.name.fr,
        href: buildSeoPath(lang, brandPath(b.slug)),
      }))
    : [];

  const agencyLinks = agencies.slice(0, 4).map((a) => ({ label: a.name, href: a.path }));
  const dealerLinks = dealers.slice(0, 4).map((d) => ({ label: d.name, href: d.path }));

  return (
    <>
      {extraLinks?.length ? <RelatedLinksSection links={extraLinks} /> : null}

      {showListings && (rentals.length > 0 || sales.length > 0) ? (
        <section className="gv-sec-sm">
          <SectionHeader eyebrow="Marketplace" title="Annonces en direct" description="Offres vérifiées GoVoiture — location et occasion." />
          <EntityGrid cols={4}>
            {rentals.slice(0, 2).map((r: { _id: string; brand: string; model: string; year?: number; pricePerDay?: number; city?: string }) => (
              <VehicleCard
                key={r._id}
                title={`${r.brand} ${r.model} ${r.year || ""}`}
                subtitle={r.city}
                price={r.pricePerDay ? `${Number(r.pricePerDay).toLocaleString()} MAD` : undefined}
                priceLabel="/j"
                href={buildSeoPath(lang, buildRentalListingPath(r))}
                badge="Location"
                intent="rental"
              />
            ))}
            {sales.slice(0, 2).map((s: { _id: string; brand: string; model: string; year?: number; price?: number; city?: string }) => (
              <VehicleCard
                key={s._id}
                title={`${s.brand} ${s.model} ${s.year || ""}`}
                subtitle={s.city}
                price={s.price ? `${Number(s.price).toLocaleString()} MAD` : undefined}
                href={buildSeoPath(lang, buildSaleListingPath(s))}
                badge="Occasion"
                intent="sale"
              />
            ))}
          </EntityGrid>
        </section>
      ) : null}

      {brandLinks.length > 0 ? <RelatedLinksSection title="Marques populaires" links={brandLinks} /> : null}

      {blogArticles.length > 0 ? (
        <RelatedLinksSection
          title="Guides & articles"
          links={blogArticles.map((a) => ({
            label: a.title[lang] || a.title.fr,
            href: buildSeoPath(lang, blogArticlePath(a.slug)),
          }))}
        />
      ) : null}

      {agencyLinks.length > 0 || dealerLinks.length > 0 ? (
        <section className="gv-sec-sm">
          <SectionHeader eyebrow="Professionnels" title="Agences & concessionnaires" />
          <div className="grid sm:grid-cols-2 gap-6">
            {agencyLinks.length > 0 ? (
              <RelatedLinksSection title="Agences location" links={agencyLinks} />
            ) : null}
            {dealerLinks.length > 0 ? (
              <RelatedLinksSection title="Concessionnaires" links={dealerLinks} />
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
