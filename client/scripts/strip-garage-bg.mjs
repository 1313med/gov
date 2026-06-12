import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { rename, unlink } from "fs/promises";

const imgDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../public/images");

/** Remove black, checkerboard grays, and near-white matte backgrounds. */
function isBackground(r, g, b) {
  const maxC = Math.max(r, g, b);
  const minC = Math.min(r, g, b);
  const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (maxC < 40) return true;
  if (sat < 0.12 && luma > 0.72) return true;
  if (sat < 0.1 && luma > 0.28 && luma < 0.72) return true;

  return false;
}

async function stripBg(name) {
  const file = path.join(imgDir, name);
  const tmp = file.replace(".png", ".out.png");
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isBackground(r, g, b)) data[i + 3] = 0;
  }

  await sharp(data, { raw: { width, height, channels: 4 } }).png().toFile(tmp);
  await unlink(file).catch(() => {});
  await rename(tmp, file);
  console.log(`Stripped background: ${name}`);
}

await stripBg("garage-feature-dark.png");
await stripBg("garage-feature-light.png");
