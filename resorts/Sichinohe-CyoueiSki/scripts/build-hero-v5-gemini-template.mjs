/**
 * Gemini 1024×1024 → 1920×1920 制作テンプレ（マスク・ガイド）
 * 本番 sichinohe-hero-v5.png には書き込まない。
 *
 * Usage: node scripts/build-hero-v5-gemini-template.mjs [gemini-v5-source.png]
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

const MAPS = path.join(__dirname, "..", "web", "public", "maps");
const DEFAULT_SRC = path.join(MAPS, "gemini-v5-source.png");

const src = process.argv[2] || DEFAULT_SRC;
if (!fs.existsSync(src)) {
  console.error("missing:", src);
  process.exit(1);
}

const meta = await sharp(src).metadata();
if (meta.width !== CONTENT_W || meta.height !== CONTENT_H) {
  console.warn(`warn: expected ${CONTENT_W}×${CONTENT_H}, got ${meta.width}×${meta.height}`);
}

const canvasBg = { r: 247, g: 249, b: 251, alpha: 1 };
const canvas = await sharp({
  create: { width: MASTER, height: MASTER, channels: 4, background: canvasBg },
})
  .png()
  .toBuffer();

const gemini = await sharp(src).flatten({ background: canvasBg }).png().toBuffer();

const template = await sharp(canvas)
  .composite([{ input: gemini, left: CONTENT_X, top: CONTENT_Y }])
  .png()
  .toBuffer();

const marginMask = Buffer.alloc(MASTER * MASTER);
marginMask.fill(255);
for (let y = CONTENT_Y; y < CONTENT_Y + CONTENT_H; y++) {
  for (let x = CONTENT_X; x < CONTENT_X + CONTENT_W; x++) {
    marginMask[y * MASTER + x] = 0;
  }
}

const maskPng = await sharp(marginMask, {
  raw: { width: MASTER, height: MASTER, channels: 1 },
})
  .png()
  .toBuffer();

const guideTint = await sharp({
  create: {
    width: MASTER,
    height: MASTER,
    channels: 4,
    background: { r: 45, g: 107, b: 90, alpha: 0.18 },
  },
})
  .png()
  .toBuffer();

const guide = await sharp(template)
  .composite([
    {
      input: await sharp(guideTint)
        .composite([{ input: maskPng, blend: "dest-in" }])
        .toBuffer(),
      blend: "over",
    },
  ])
  .png()
  .toBuffer();

fs.mkdirSync(MAPS, { recursive: true });
const paths = {
  template: path.join(MAPS, "sichinohe-hero-v5-template.png"),
  mask: path.join(MAPS, "sichinohe-hero-v5-outpaint-mask.png"),
  guide: path.join(MAPS, "sichinohe-hero-v5-guide.png"),
  meta: path.join(MAPS, "sichinohe-hero-v5-content-rect.json"),
};

await sharp(template).toFile(paths.template);
await sharp(maskPng).toFile(paths.mask);
await sharp(guide).toFile(paths.guide);

const contentRect = { x: CONTENT_X, y: CONTENT_Y, width: CONTENT_W, height: CONTENT_H };
fs.writeFileSync(
  paths.meta,
  JSON.stringify(
    {
      master: MASTER,
      contentRect,
      source: path.basename(src),
      note: "白マスク領域のみアウトペイント可。黒（contentRect）内は 1px も変更禁止。",
    },
    null,
    2,
  ) + "\n",
);

console.log("gemini v5 templates:");
console.log(" ", paths.template);
console.log(" ", paths.mask, "(white=outpaint OK, black=protected)");
console.log(" ", paths.guide);
console.log(" contentRect:", contentRect);
console.log("");
console.log("次:");
console.log("  node scripts/apply-hero-v5-edge-outpaint.mjs        # 自動ドラフト");
console.log("  # または Photoshop で template + mask を手仕上げ →");
console.log("  node scripts/promote-hero-v5-outpaint.mjs <完成.png>");
