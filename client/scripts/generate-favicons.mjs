/**
 * Generate favicon set — purple rounded square + large white G mark.
 * Mark source: goovoiture-logo-mark-dark.png (tight white crop, scaled to ~97% canvas).
 * Purple sampled from goovoiture-brand-icon.png.
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const brandIcon = join(root, "..", "mobile", "assets", "images", "goovoiture-brand-icon.png");
const logoMark = join(root, "..", "mobile", "assets", "images", "goovoiture-logo-mark-dark.png");

/** White mark occupies ~97% of the purple tile after tight crop. */
const MARK_FILL = 0.97;
const CORNER_RATIO = 108 / 512;

const SIZES = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  { name: "apple-touch-icon.png", size: 180 },
  { name: "favicon-192x192.png", size: 192 },
  { name: "favicon-512x512.png", size: 512 },
];

async function samplePurpleHex() {
  const { data, info } = await sharp(readFileSync(brandIcon))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const { width, height } = info;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x > 8 && y > 8 && x < width - 8 && y < height - 8) continue;
      const i = (y * width + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
  }

  const toHex = (v) => Math.round(v / n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

async function loadTightWhiteMark() {
  const { data, info } = await sharp(readFileSync(logoMark))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 24) continue;
      const lum = (r + g + b) / 3;
      if (lum < 175) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  const pad = 2;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  const cropped = await sharp(readFileSync(logoMark))
    .extract({ left: minX, top: minY, width: cropW, height: cropH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = cropped.data;
  for (let i = 0; i < px.length; i += 4) {
    const lum = (px[i] + px[i + 1] + px[i + 2]) / 3;
    if (lum < 175) px[i + 3] = 0;
  }

  return sharp(px, {
    raw: { width: cropped.info.width, height: cropped.info.height, channels: 4 },
  });
}

async function renderFavicon(size, purpleHex) {
  const markPx = Math.max(8, Math.round(size * MARK_FILL));
  const radius = Math.max(2, Math.round(size * CORNER_RATIO));

  const markSharp = await loadTightWhiteMark();
  const meta = await markSharp.metadata();
  let newW = Math.round((markPx / Math.min(meta.width, meta.height)) * meta.width);
  let newH = Math.round((markPx / Math.min(meta.width, meta.height)) * meta.height);
  if (newW > size) {
    newH = Math.round((newH * size) / newW);
    newW = size;
  }
  if (newH > size) {
    newW = Math.round((newW * size) / newH);
    newH = size;
  }
  const mark = await markSharp
    .resize(newW, newH, {
      fit: "fill",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  const bg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${purpleHex}"/>
    </svg>`
  );

  return sharp(bg).composite([{ input: mark, gravity: "center" }]).png({ compressionLevel: 9 }).toBuffer();
}

async function main() {
  const purpleHex = await samplePurpleHex();
  console.log(`[favicon] purple ${purpleHex}, mark fill ${Math.round(MARK_FILL * 100)}%`);

  for (const { name, size } of SIZES) {
    const buf = await renderFavicon(size, purpleHex);
    writeFileSync(join(publicDir, name), buf);
    console.log(`[favicon] ${name}`);
  }

  const ico16 = await renderFavicon(16, purpleHex);
  const ico32 = await renderFavicon(32, purpleHex);
  const ico48 = await renderFavicon(48, purpleHex);
  const ico = await pngToIco([ico16, ico32, ico48]);
  writeFileSync(join(publicDir, "favicon.ico"), ico);
  console.log("[favicon] favicon.ico");

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" role="img" aria-label="Goovoiture">
  <image width="512" height="512" xlink:href="/favicon-512x512.png"/>
</svg>`;
  writeFileSync(join(publicDir, "favicon.svg"), svg);
  console.log("[favicon] favicon.svg");

  const manifest = {
    name: "Goovoiture",
    short_name: "Goovoiture",
    description: "Buy, sell or rent cars in Morocco",
    start_url: "/",
    theme_color: "#141412",
    background_color: "#141412",
    display: "standalone",
    orientation: "portrait-primary",
    icons: [
      { src: "/favicon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/favicon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    categories: ["shopping", "automotive"],
    shortcuts: [
      { name: "Browse Cars", url: "/cars", description: "Browse cars for sale" },
      { name: "Rent a Car", url: "/rentals", description: "Find rental cars" },
    ],
  };
  writeFileSync(join(publicDir, "site.webmanifest"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(join(publicDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log("[favicon] site.webmanifest + manifest.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
