/**
 * v5 納品画像が contentRect 内で v4 と一致するか検証
 * node verify-hero-v5.mjs <candidate.png>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_X = 448;
const CONTENT_Y = 565;
const CONTENT_W = 1024;
const CONTENT_H = 790;
const V4 = path.join(__dirname, "..", "web", "public", "maps", "sichinohe-hero.png");

const candidate = process.argv[2];
if (!candidate || !fs.existsSync(candidate)) {
  console.error("usage: node verify-hero-v5.mjs <path-to-candidate.png>");
  process.exit(1);
}

const BG = { r: 247, g: 249, b: 251 };
const v4 = await sharp(V4).flatten({ background: BG }).raw().toBuffer({ resolveWithObject: true });
const candMeta = await sharp(candidate).metadata();
const cand = await sharp(candidate)
  .extract({
    left: CONTENT_X,
    top: CONTENT_Y,
    width: Math.min(CONTENT_W, (candMeta.width ?? 0) - CONTENT_X),
    height: Math.min(CONTENT_H, (candMeta.height ?? 0) - CONTENT_Y),
  })
  .resize(v4.info.width, v4.info.height, { fit: "fill" })
  .flatten({ background: BG })
  .raw()
  .toBuffer({ resolveWithObject: true });

let diff = 0;
const threshold = 8;
for (let i = 0; i < v4.data.length; i += 4) {
  const dr = Math.abs(v4.data[i] - cand.data[i]);
  const dg = Math.abs(v4.data[i + 1] - cand.data[i + 1]);
  const db = Math.abs(v4.data[i + 2] - cand.data[i + 2]);
  if (dr + dg + db > threshold) diff++;
}
const pixels = v4.info.width * v4.info.height;
const pct = ((diff / pixels) * 100).toFixed(2);

const pass = Number(pct) < 0.5;
console.log(JSON.stringify({
  candidate: path.resolve(candidate),
  canvas: `${candMeta.width}x${candMeta.height}`,
  contentRect: { x: CONTENT_X, y: CONTENT_Y, w: CONTENT_W, h: CONTENT_H },
  diffPixels: diff,
  totalPixels: pixels,
  diffPercent: pct,
  pass,
}, null, 2));

process.exit(pass ? 0 : 1);
