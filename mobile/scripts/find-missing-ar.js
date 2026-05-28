const fs = require("fs");
const path = require("path");
const { arOverrides } = require("../src/locales/arOverrides.js");

const dirs = ["app", "src/components"];
const re = /pick\s*\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/g;
const missing = new Set();

function walk(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory() && f.name !== "node_modules") walk(p);
    else if (/\.(jsx?|tsx?)$/.test(f.name)) {
      const t = fs.readFileSync(p, "utf8");
      let m;
      while ((m = re.exec(t))) {
        const en = m[1];
        const fr = m[2];
        if (!arOverrides[en] && !arOverrides[fr]) missing.add(`${en} | ${fr}`);
      }
    }
  }
}

dirs.forEach(walk);
console.log("Missing:", missing.size);
[...missing].sort().forEach((x) => console.log(x));
