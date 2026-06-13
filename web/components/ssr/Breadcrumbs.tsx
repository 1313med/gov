import type { SeoLang } from "@/lib/site";
import { buildSeoPath } from "@client-seo/seoPaths";

export type Crumb = { label: string; href?: string };

export default function Breadcrumbs({
  items,
  lang,
}: {
  items: Crumb[];
  lang: SeoLang;
}) {
  return (
    <nav aria-label="Breadcrumb" className="gv-crumb">
      <ol className="flex flex-wrap items-center gap-1 list-none m-0 p-0">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <span className="gv-crumb-sep" aria-hidden="true">/</span>}
            {item.href && i < items.length - 1 ? (
              <a href={buildSeoPath(lang, item.href)}>{item.label}</a>
            ) : (
              <span className={i === items.length - 1 ? "gv-crumb-current" : ""}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
