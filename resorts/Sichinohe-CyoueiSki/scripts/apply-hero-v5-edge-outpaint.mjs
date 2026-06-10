/**
 * マージンを Gemini 端の色・質感で延伸（contentRect 内は元画像をそのまま貼付）
 * コース線は増やさない。ドラフト用 — 手仕上げ前の下書き。
 *
 * Usage: node scripts/apply-hero-v5-edge-outpaint.mjs [gemini-v5-source.png]
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
const EDGE = 72;
const BLUR = 22;

const MAPS = path.join(__dirname, "..", "web", "public", "maps");
const ROOT_MAPS = path.join(__dirname, "..", "..", "public", "maps");
const DEFAULT_SRC = path.join(MAPS, "gemini-v5-source.png");
const OUT_NAME = "sichinohe-hero-v5-outpaint-draft.png";

const src = process.argv[2] || DEFAULT_SRC;
if (!fs.existsSync(src)) {
  console.error("missing:", src);
  process.exit(1);
}

const bg = { r: 247, g: 249, b: 251 };
const gemini = sharp(src).flatten({ background: bg });

async function stretchEdge(extract, resize) {
  return gemini
    .clone()
    .extract(extract)
    .resize(resize.width, resize.height, { fit: "fill" })
    .blur(BLUR)
    .png()
    .toBuffer();
}

const topH = CONTENT_Y;
const bottomH = MASTER - CONTENT_Y - CONTENT_H;
const leftW = CONTENT_X;
const rightW = MASTER - CONTENT_X - CONTENT_W;

const composites = [];

if (topH > 0) {
  composites.push({
    input: await stretchEdge(
      { left: 0, top: 0, width: CONTENT_W, height: EDGE },
      { width: CONTENT_W, height: topH },
    ),
    left: CONTENT_X,
    top: 0,
  });
}

if (bottomH > 0) {
  composites.push({
    input: await stretchEdge(
      { left: 0, top: CONTENT_H - EDGE, width: CONTENT_W, height: EDGE },
      { width: CONTENT_W, height: bottomH },
    ),
    left: CONTENT_X,
    top: CONTENT_Y + CONTENT_H,
  });
}

if (leftW > 0) {
  composites.push({
    input: await stretchEdge(
      { left: 0, top: 0, width: EDGE, height: CONTENT_H },
      { width: leftW, height: CONTENT_H },
    ),
    left: 0,
    top: CONTENT_Y,
  });
}

if (rightW > 0) {
  composites.push({
    input: await stretchEdge(
      { left: CONTENT_W - EDGE, top: 0, width: EDGE, height: CONTENT_H },
      { width: rightW, height: CONTENT_H },
    ),
    left: CONTENT_X + CONTENT_W,
    top: CONTENT_Y,
  });
}

// corners
async function corner(extract, w, h, left, top) {
  if (w <= 0 || h <= 0) return;
  composites.push({
    input: await gemini
      .clone()
      .extract(extract)
      .resize(w, h, { fit: "fill" })
      .blur(BLUR + 6)
      .png()
      .toBuffer(),
    left,
    top,
  });
}

await corner({ left: 0, top: 0, width: EDGE, height: EDGE }, leftW, topH, 0, 0);
await corner(
  { left: CONTENT_W - EDGE, top: 0, width: EDGE, height: EDGE },
  rightW,
  topH,
  CONTENT_X + CONTENT_W,
  0,
);
await corner(
  { left: 0, top: CONTENT_H - EDGE, width: EDGE, height: EDGE },
  leftW,
  bottomH,
  0,
  CONTENT_Y + CONTENT_H,
);
await corner(
  { left: CONTENT_W - EDGE, top: CONTENT_H - EDGE, width: EDGE, height: EDGE },
  rightW,
  bottomH,
  CONTENT_X + CONTENT_W,
  CONTENT_Y + CONTENT_H,
);

const base = await sharp({
  create: { width: MASTER, height: MASTER, channels: 4, background: { ...bg, alpha: 1 } },
})
  .composite(composites)
  .png()
  .toBuffer();

const core = await gemini.png().toBuffer();
const out = await sharp(base)
  .composite([{ input: core, left: CONTENT_X, top: CONTENT_Y }])
  .png()
  .toBuffer();

for (const dir of [MAPS, ROOT_MAPS]) {
  fs.mkdirSync(dir, { recursive: true });
  await sharp(out).toFile(path.join(dir, OUT_NAME));
}

console.log("wrote", OUT_NAME, `${MASTER}×${MASTER}`);
console.log("contentRect:", { x: CONTENT_X, y: CONTENT_Y, width: CONTENT_W, height: CONTENT_H });
console.log("");
console.log("確認 → node scripts/verify-hero-v5-content.mjs", OUT_NAME);
console.log("OK なら → node scripts/promote-hero-v5-outpaint.mjs", OUT_NAME);
