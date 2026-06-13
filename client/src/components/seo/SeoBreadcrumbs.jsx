import { Link } from "react-router-dom";
import { buildSeoPath, parseSeoPath } from "../../seo/seoPaths";

export default function SeoBreadcrumbs({ items }) {
  if (!items?.length) return null;
  const { lang } = parseSeoPath(typeof window !== "undefined" ? window.location.pathname : "/");

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500 dark:text-gray-400">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href && i < items.length - 1 ? (
              <Link to={buildSeoPath(lang, item.href)} className="hover:text-violet-600 dark:hover:text-violet-400">
                {item.label}
              </Link>
            ) : (
              <span className={i === items.length - 1 ? "text-gray-800 dark:text-gray-200 font-medium" : ""}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
