/**
 * 1920 候補の contentRect が Gemini 原本と一致するか検証
 * Usage: node scripts/verify-hero-v5-content.mjs <candidate.png> [gemini-v5-source.png]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER = 1920;
const CONTENT_W = 1024;
const CONTENT_H = 1024;
const CONTENT_X = Math.round((MASTER - CONTENT_W) / 2);
const CONTENT_Y = Math.round((MASTER - CONTENT_H) / 2);
const DEFAULT_GEMINI = path.join(__dirname, "..", "web", "public", "maps", "gemini-v5-source.png");

const candidate = process.argv[2];
const geminiPath = process.argv[3] || DEFAULT_GEMINI;

if (!candidate || !fs.existsSync(candidate)) {
  console.error("usage: node verify-hero-v5-content.mjs <candidate.png> [gemini.png]");
  process.exit(1);
}
if (!fs.existsSync(geminiPath)) {
  console.error("missing gemini:", geminiPath);
  process.exit(1);
}

const BG = { r: 247, g: 249, b: 251 };
const ref = await sharp(geminiPath).flatten({ background: BG }).raw().toBuffer({ resolveWithObject: true });
const candMeta = await sharp(candidate).metadata();
const cand = await sharp(candidate)
  .extract({
    left: CONTENT_X,
    top: CONTENT_Y,
    width: Math.min(CONTENT_W, (candMeta.width ?? 0) - CONTENT_X),
    height: Math.min(CONTENT_H, (candMeta.height ?? 0) - CONTENT_Y),
  })
  .resize(ref.info.width, ref.info.height, { fit: "fill" })
  .flatten({ background: BG })
  .raw()
  .toBuffer({ resolveWithObject: true });

let diff = 0;
const threshold = 8;
for (let i = 0; i < ref.data.length; i += 4) {
  const dr = Math.abs(ref.data[i] - cand.data[i]);
  const dg = Math.abs(ref.data[i + 1] - cand.data[i + 1]);
  const db = Math.abs(ref.data[i + 2] - cand.data[i + 2]);
  if (dr + dg + db > threshold) diff++;
}
const pixels = ref.info.width * ref.info.height;
const pct = ((diff / pixels) * 100).toFixed(3);
const pass = Number(pct) < 0.01;

console.log(
  JSON.stringify(
    {
      candidate: path.resolve(candidate),
      gemini: path.resolve(geminiPath),
      canvas: `${candMeta.width}x${candMeta.height}`,
      contentRect: { x: CONTENT_X, y: CONTENT_Y, width: CONTENT_W, height: CONTENT_H },
      diffPixels: diff,
      totalPixels: pixels,
      diffPercent: pct,
      pass,
    },
    null,
    2,
  ),
);

process.exit(pass ? 0 : 1);
