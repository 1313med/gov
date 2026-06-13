import type { SeoLang } from "@/lib/site";
import Breadcrumbs, { type Crumb } from "@/components/ssr/Breadcrumbs";
import SeoFooter from "@/components/ssr/SeoFooter";
import SiteHeader from "@/components/layout/SiteHeader";
import HeroSection from "@/components/ui/HeroSection";
import FaqSection from "@/components/ssr/FaqSection";
import PremiumCTA from "@/components/ui/PremiumCTA";
import PageRelatedSections from "@/components/layout/PageRelatedSections";
import BadgePill from "@/components/ui/BadgePill";

export type SeoPageShellProps = {
  lang: SeoLang;
  breadcrumbs: Crumb[];
  hero: {
    kicker?: string;
    title: string;
    titleHighlight?: string;
    description?: string;
    badges?: string[];
  };
  children: React.ReactNode;
  faqs?: { q: string; a: string }[];
  cta?: {
    title: string;
    description?: string;
    primaryHref: string;
    primaryLabel: string;
    secondaryHref?: string;
    secondaryLabel?: string;
  };
  related?: {
    brandSlug?: string;
    brandFilter?: string;
    extraLinks?: Array<{ label: string; href: string }>;
    showListings?: boolean;
    showBrands?: boolean;
    showBlog?: boolean;
    showAgencies?: boolean;
  };
  jsonLd?: React.ReactNode;
};

export default async function SeoPageShell({
  lang,
  breadcrumbs,
  hero,
  children,
  faqs,
  cta,
  related,
  jsonLd,
}: SeoPageShellProps) {
  return (
    <>
      {jsonLd}
      <SiteHeader lang={lang} />
      <HeroSection
        kicker={hero.kicker}
        title={hero.title}
        titleHighlight={hero.titleHighlight}
        description={hero.description}
        meta={hero.badges?.map((b) => (
          <BadgePill key={b} variant="brand">
            {b}
          </BadgePill>
        ))}
      />
      <div className="gv-wrap gv-sec">
        <Breadcrumbs items={breadcrumbs} lang={lang} />
        {children}
        {faqs?.length ? <FaqSection faqs={faqs} /> : null}
        {cta ? (
          <div className="mt-10">
            <PremiumCTA {...cta} />
          </div>
        ) : null}
        {related !== undefined ? (
          <PageRelatedSections
            lang={lang}
            brandSlug={related.brandSlug}
            brandFilter={related.brandFilter}
            extraLinks={related.extraLinks}
            showListings={related.showListings ?? true}
            showBrands={related.showBrands}
            showBlog={related.showBlog}
            showAgencies={related.showAgencies}
          />
        ) : null}
      </div>
      <SeoFooter lang={lang} />
    </>
  );
}
