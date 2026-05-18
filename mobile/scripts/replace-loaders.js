const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

function walk(dir, acc = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(jsx|js)$/.test(name)) acc.push(p);
  }
  return acc;
}

const files = walk(path.join(root, "app"))
  .concat(walk(path.join(root, "src")))
  .map((p) => path.relative(root, p).replace(/\\/g, "/"))
  .filter((f) => !f.includes("AppLoadingScreen.jsx") && !f.includes("replace-loaders.js"));

function importPath(rel) {
  const depth = rel.split("/").length - 1;
  return `${"../".repeat(depth)}src/components/AppLoadingScreen`;
}

function ensureImport(content, rel, names) {
  if (names.every((n) => content.includes(n))) return content;
  if (content.includes("AppLoadingScreen")) {
    const re = /import \{([^}]+)\} from ['"][^'"]*AppLoadingScreen['"]/;
    const m = content.match(re);
    if (m) {
      const existing = m[1].split(",").map((s) => s.trim());
      const merged = [...new Set([...existing, ...names])].join(", ");
      return content.replace(re, `import { ${merged} } from '${importPath(rel)}'`);
    }
  }
  const line = `import { ${names.join(", ")} } from '${importPath(rel)}';\n`;
  const idx = content.indexOf("\n", content.indexOf("import "));
  if (idx === -1) return line + content;
  return content.slice(0, idx + 1) + line + content.slice(idx + 1);
}

function stripActivityImport(c) {
  if (c.includes("ActivityIndicator")) return c;
  c = c.replace(/,?\s*ActivityIndicator\s*,?/g, (m) => (m.includes(",") ? "" : ""));
  c = c.replace(/\{\s*,/g, "{");
  c = c.replace(/,\s*\}/g, "}");
  c = c.replace(/import\s*\{\s*\}\s*from[^;]+;\n?/g, "");
  return c;
}

function applyTransforms(c) {
  // Full-page ActivityIndicator
  c = c.replace(
    /if\s*\(\s*loading\s*\)\s*return\s*<View[^>]*>\s*<ActivityIndicator[^/]*\/>\s*<\/View>\s*;/g,
    "if (loading) return <PageLoader />;"
  );
  c = c.replace(
    /<View style=\{\{ flex: 1, backgroundColor: C\.bg, alignItems: "center", justifyContent: "center" \}\}>\s*<ActivityIndicator[^/]*\/>\s*<\/View>/g,
    "<PageLoader />"
  );
  c = c.replace(
    /<View style=\{\{ flex: 1, backgroundColor: C\.bg, justifyContent: "center", alignItems: "center" \}\}>\s*<ActivityIndicator[^/]*\/>\s*<\/View>/g,
    "<PageLoader />"
  );
  c = c.replace(
    /<View style=\{s\.center\}>\s*<ActivityIndicator[^/]*\/>\s*(?:<Text[^>]*>[\s\S]*?<\/Text>\s*)?<\/View>/g,
    "<PageLoader />"
  );
  c = c.replace(/<View style=\{s\.center\}><ActivityIndicator[^/]*\/><\/View>/g, "<PageLoader />");

  // Full-page InlineLogoLoader → PageLoader
  c = c.replace(
    /if\s*\(\s*loading\s*\)\s*\{\s*return\s*\(\s*<View style=\{\{[^}]*flex:\s*1[^}]*\}\}>\s*<InlineLogoLoader\s*\/>\s*<\/View>\s*\);\s*\}/g,
    "if (loading) return <PageLoader />;"
  );
  c = c.replace(
    /if\s*\(\s*loading\s*\)\s*\{\s*return\s*\(\s*<View style=\{\[[^\]]+\]\}>\s*<InlineLogoLoader\s*\/>\s*(?:<Text[^>]*>[\s\S]*?<\/Text>\s*)?<\/View>\s*\);\s*\}/g,
    "if (loading) return <PageLoader />;"
  );
  c = c.replace(
    /if\s*\(\s*loading\s*&&\s*!data\s*\)\s*\{\s*return\s*\(\s*<View style=\{\[[^\]]+\]\}>\s*<InlineLogoLoader\s*\/>\s*<Text[^>]*>[\s\S]*?<\/Text>\s*<\/View>\s*\);\s*\}/g,
    "if (loading && !data) return <PageLoader />;"
  );

  c = c.replace(
    /\{loading \? \(\s*<View style=\{\{ flex: 1, alignItems: "center", justifyContent: "center" \}\}>\s*<InlineLogoLoader\s*\/>\s*<\/View>\s*\) :/g,
    "{loading ? <PageLoader /> :"
  );
  c = c.replace(
    /\{loading && items\.length === 0 \? \(\s*<View style=\{\{ flex: 1, alignItems: "center", justifyContent: "center" \}\}>\s*<InlineLogoLoader\s*\/>\s*<Text[^>]*>[\s\S]*?<\/Text>\s*<\/View>\s*\) :/g,
    "{loading && items.length === 0 ? <PageLoader /> :"
  );

  // Tab lists initial load (broken: loader inside tiny gradient circle)
  c = c.replace(
    /\{!hydrated && loading \? \(\s*<View style=\{\{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: C\.bg \}\}>\s*<LinearGradient[^>]*>\s*<InlineLogoLoader\s*\/>\s*<\/LinearGradient>\s*<Text[^>]*>[\s\S]*?<\/Text>\s*<\/View>\s*\) :/g,
    "{!hydrated && loading ? <PageLoader /> :"
  );

  // Profile / custom center blocks
  c = c.replace(
    /if\s*\(\s*loading\s*\)\s*\{\s*return\s*\(\s*<View style=\{\[s\.center, \{ backgroundColor: C\.bg \}\]\}>\s*<View style=\{s\.loaderRing\}>\s*<InlineLogoLoader\s*\/>\s*<\/View>\s*<Text[^>]*>[\s\S]*?<\/Text>\s*<\/View>\s*\);\s*\}/g,
    "if (loading) return <PageLoader />;"
  );

  // Large spinners
  c = c.replace(/<ActivityIndicator color=\{C\.primary\} size="large"\s*\/>/g, "<InlineLogoLoader />");
  c = c.replace(/<ActivityIndicator size="large" color=\{C\.primary\}\s*\/>/g, "<InlineLogoLoader />");
  c = c.replace(/<ActivityIndicator color=\{accent\} size="large"\s*\/>/g, "<InlineLogoLoader />");
  c = c.replace(/<ActivityIndicator color=\{accent\} style=\{\{ marginTop: 28 \}\}\s*\/>/g, "<InlineLogoLoader />");
  c = c.replace(/<ActivityIndicator color="#fff" size="large"\s*\/>/g, "<InlineLogoLoader />");
  c = c.replace(/<ActivityIndicator color=\{C\.primary\} style=\{\{ marginVertical: 24 \}\}\s*\/>/g, "<InlineLogoLoader />");
  c = c.replace(/<ActivityIndicator color=\{C\.primary\} style=\{\{ marginVertical: 16 \}\}\s*\/>/g, "<InlineLogoLoader />");
  c = c.replace(
    /<View style=\{[^}]*flex:\s*1[^}]*\}>\s*<ActivityIndicator color=\{C\.primary\} size="large"[^/]*\/>\s*<Text[^>]*>[\s\S]*?<\/Text>\s*<\/View>/g,
    "<PageLoader />"
  );

  // List footers & inline fetches
  c = c.replace(
    /ListFooterComponent=\{loadingMore \? <ActivityIndicator[^/]*\/>\s*: null\}/g,
    "ListFooterComponent={loadingMore ? <InlineLogoLoader /> : null}"
  );
  c = c.replace(
    /loadingMore \? <ActivityIndicator color=\{accent\} style=\{\{ paddingVertical: 16 \}\}\s*\/> : null/g,
    "loadingMore ? <InlineLogoLoader /> : null"
  );
  c = c.replace(
    /\{fetching && data \? <ActivityIndicator color=\{C\.primary\} \/> : null\}/g,
    "{fetching && data ? <InlineLogoLoader /> : null}"
  );
  c = c.replace(
    /<ActivityIndicator color=\{C\.primary\} style=\{\{ marginBottom: 16 \}\}\s*\/>/g,
    "<InlineLogoLoader />"
  );

  return c;
}

let count = 0;
for (const rel of files) {
  const fp = path.join(root, rel);
  let c = fs.readFileSync(fp, "utf8");
  const orig = c;
  c = applyTransforms(c);
  if (c === orig) continue;

  const names = [];
  if (c.includes("PageLoader")) names.push("PageLoader");
  if (c.includes("InlineLogoLoader")) names.push("InlineLogoLoader");
  if (names.length) c = ensureImport(c, rel, names);

  c = stripActivityImport(c);
  fs.writeFileSync(fp, c);
  count++;
  console.log("updated", rel);
}
console.log("total", count);
