/**
 * Full production build: legacy Vite SPA + sitemaps + Next.js SSR.
 */
import { cpSync, mkdirSync, existsSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const clientDir = join(root, "..", "client");
const legacyDir = join(root, "public", "legacy");

if (!existsSync(join(clientDir, "node_modules"))) {
  console.log("[build] Installing legacy client dependencies...");
  execSync("npm install", { cwd: clientDir, stdio: "inherit" });
}

console.log("[build] Building legacy Vite SPA...");
execSync("npm run build", {
  cwd: clientDir,
  stdio: "inherit",
  env: { ...process.env, VITE_LEGACY_BASE: "/legacy/" },
});

if (existsSync(legacyDir)) rmSync(legacyDir, { recursive: true, force: true });
mkdirSync(join(root, "public"), { recursive: true });
cpSync(join(clientDir, "dist"), legacyDir, { recursive: true });

// Copy sitemaps + robots to Next public root
for (const f of ["robots.txt", "sitemap.xml", "sitemap-index.xml"]) {
  const src = join(clientDir, "public", f);
  if (existsSync(src)) cpSync(src, join(root, "public", f));
}
const sitemapsSrc = join(clientDir, "public", "sitemaps");
if (existsSync(sitemapsSrc)) {
  cpSync(sitemapsSrc, join(root, "public", "sitemaps"), { recursive: true });
}

console.log("[build] Building Next.js SSR app...");
execSync("npm run build:next", { cwd: root, stdio: "inherit" });
