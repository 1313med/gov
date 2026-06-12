import sharp from "sharp";
import { rename, unlink } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const imgDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/images");

function isLightBackground(r, g, b) {
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

  if (sat > 0.11) return false;
  if (minC >= 246) return true;
  if (maxC >= 108 && maxC <= 165 && minC >= 108) return true;
  if (maxC >= 178 && maxC <= 215 && minC >= 178) return true;
  if (minC >= 218 && maxC <= 255) return true;

  return false;
}

function isDarkBackground(r, g, b) {
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;

  if (sat > 0.11) return false;
  if (maxC <= 28) return true;

  return false;
}

function floodFromSeeds(data, width, height, seedIndices, isBackground) {
  const n = width * height;
  const remove = new Uint8Array(n);
  const queue = [];

  const push = (x, y) => {
    const idx = y * width + x;
    if (remove[idx]) return;
    const i = idx * 4;
    if (!isBackground(data[i], data[i + 1], data[i + 2])) return;
    remove[idx] = 1;
    queue.push(idx);
  };

  for (const idx of seedIndices) {
    push(idx % width, (idx / width) | 0);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx / width) | 0;
    if (x > 0) push(x - 1, y);
    if (x < width - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < height - 1) push(x, y + 1);
  }

  return remove;
}

async function floodTransparent(name, mode) {
  const isBackground = mode === "dark" ? isDarkBackground : isLightBackground;
  const file = path.join(imgDir, name);
  const tmp = file.replace(".png", ".tmp.png");
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const n = width * height;

  const seeds = new Set();
  for (let x = 0; x < width; x++) {
    seeds.add(x);
    seeds.add((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    seeds.add(y * width);
    seeds.add(y * width + width - 1);
  }

  for (let idx = 0; idx < n; idx++) {
    const i = idx * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    if (mode === "light") {
      if (maxC >= 108 && maxC <= 165 && minC >= 108) seeds.add(idx);
      if (maxC >= 178 && maxC <= 215 && minC >= 178) seeds.add(idx);
    } else if (maxC <= 8) {
      seeds.add(idx);
    }
  }

  let remove = floodFromSeeds(data, width, height, seeds, isBackground);

  for (let pass = 0; pass < 12; pass++) {
    const expandSeeds = [];
    for (let idx = 0; idx < n; idx++) {
      if (remove[idx] || data[idx * 4 + 3] === 0) expandSeeds.push(idx);
    }
    const next = floodFromSeeds(data, width, height, expandSeeds, isBackground);
    let grew = 0;
    for (let idx = 0; idx < n; idx++) {
      if (next[idx] && !remove[idx]) grew++;
      remove[idx] = remove[idx] || next[idx];
    }
    if (!grew) break;
  }

  let cleared = 0;
  for (let idx = 0; idx < n; idx++) {
    if (!remove[idx]) continue;
    data[idx * 4 + 3] = 0;
    cleared++;
  }

  await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(tmp);
  await unlink(file).catch(() => {});
  await rename(tmp, file);
  console.log(`[${mode}] Flood cleared ${cleared}/${n} px in ${name}`);
}

const target = process.argv[2] || "garage-feature-dark-mobile.png";
const mode = process.argv[3] || (target.includes("dark") ? "dark" : "light");
await floodTransparent(target, mode);
