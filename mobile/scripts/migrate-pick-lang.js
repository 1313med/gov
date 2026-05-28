/**
 * One-off helper: add `pick` to useAppLang destructure and convert
 *   fr ? `FR` : `EN`  →  pick(`EN`, `FR`)
 * Run from mobile/: node scripts/migrate-pick-lang.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SKIP = new Set(["node_modules", "scripts", ".expo"]);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(jsx|js|tsx|ts)$/.test(name)) out.push(p);
  }
  return out;
}

const TERNARY_RE = /fr\s*\?\s*(`(?:\\.|[^`])*`)\s*:\s*(`(?:\\.|[^`])*`)/g;
const TERNARY_DQ_RE = /fr\s*\?\s*"((?:\\.|[^"])*)"\s*:\s*"((?:\\.|[^"])*)"/g;
const TERNARY_SQ_RE = /fr\s*\?\s*'((?:\\.|[^'])*)'\s*:\s*'((?:\\.|[^'])*)'/g;

function migrate(content, filePath) {
  if (!content.includes("useAppLang") || !content.includes("fr ?")) return content;

  let next = content;

  if (next.includes("const fr = lang === \"fr\"")) {
    next = next.replace(
      /const\s*\{\s*([^}]*)\}\s*=\s*useAppLang\(\)/,
      (m, inner) => {
        if (inner.includes("pick")) return m;
        const parts = inner.split(",").map((s) => s.trim()).filter(Boolean);
        if (!parts.includes("pick")) parts.push("pick");
        return `const { ${parts.join(", ")} } = useAppLang()`;
      }
    );
    if (next.includes("const fr = lang === \"fr\"") && !next.includes("pick")) {
      next = next.replace(
        /const fr = lang === "fr";/,
        'const { pick, isFr: fr, lang } = useAppLang();'
      );
    }
  }

  next = next.replace(TERNARY_RE, (_, frPart, enPart) => `pick(${enPart}, ${frPart})`);
  next = next.replace(TERNARY_DQ_RE, (_, frPart, enPart) => `pick("${enPart}", "${frPart}")`);
  next = next.replace(TERNARY_SQ_RE, (_, frPart, enPart) => `pick('${enPart}', '${frPart}')`);

  return next;
}

let changed = 0;
for (const file of walk(ROOT)) {
  if (file.includes("AppLangContext") || file.includes("LanguageSwitcher") || file.includes("migrate-pick")) continue;
  const raw = fs.readFileSync(file, "utf8");
  const out = migrate(raw, file);
  if (out !== raw) {
    fs.writeFileSync(file, out);
    changed++;
    console.log("updated:", path.relative(ROOT, file));
  }
}
console.log("done,", changed, "files");
