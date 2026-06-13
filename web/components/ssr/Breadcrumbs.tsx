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
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href && i < items.length - 1 ? (
              <a href={buildSeoPath(lang, item.href)} className="hover:text-violet-600">
                {item.label}
              </a>
            ) : (
              <span className={i === items.length - 1 ? "font-medium text-gray-800" : ""}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
