/**
 * v5 イラスト制作ガイド — v4 を等倍貼付したテンプレートとアウトペイント用マスク
 *
 * Cursor / AI に「ゲレンデ全体を描け」とは頼まない。
 * 余白マスク内だけを Photoshop Generative Fill 等で埋める。
 *
 * 用法: node build-hero-v5-template.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER = 1920;
const CONTENT_X = 448;
const CONTENT_Y = 565;
const CONTENT_W = 1024;
const CONTENT_H = 790;

const V4_SRC = path.join(__dirname, "..", "web", "public", "maps", "sichinohe-hero.png");
const OUT_DIR = path.join(__dirname, "..", "web", "public", "maps");

async function main() {
  if (!fs.existsSync(V4_SRC)) {
    console.error("missing v4:", V4_SRC);
    process.exit(1);
  }

  const v4 = await sharp(V4_SRC)
    .flatten({ background: { r: 247, g: 249, b: 251 } })
    .toBuffer();
  const meta = await sharp(v4).metadata();
  if (meta.width !== CONTENT_W || meta.height !== CONTENT_H) {
    console.warn(
      `warn: v4 is ${meta.width}x${meta.height}, expected ${CONTENT_W}x${CONTENT_H} — paste uses actual size`,
    );
  }

  const canvasBg = await sharp({
    create: {
      width: MASTER,
      height: MASTER,
      channels: 4,
      background: { r: 247, g: 249, b: 251, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const template = await sharp(canvasBg)
    .composite([{ input: v4, left: CONTENT_X, top: CONTENT_Y }])
    .png()
    .toBuffer();

  // マージン領域 = 白（アウトペイント可）、contentRect = 黒（保護）
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

  // テンプレ上にマージンを薄緑で可視化（制作ガイド用、本番には使わない）
  const guideOverlay = await sharp({
    create: {
      width: MASTER,
      height: MASTER,
      channels: 4,
      background: { r: 45, g: 107, b: 90, alpha: 0.12 },
    },
  })
    .png()
    .toBuffer();

  const guide = await sharp(template)
    .composite([
      { input: guideOverlay, blend: "over" },
      {
        input: await sharp(maskPng)
          .ensureAlpha()
          .composite([{ input: guideOverlay, blend: "over" }])
          .extractChannel(0)
          .toColourspace("b-w")
          .png()
          .toBuffer(),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const outTemplate = path.join(OUT_DIR, "sichinohe-hero-v5-template.png");
  const outMask = path.join(OUT_DIR, "sichinohe-hero-v5-outpaint-mask.png");
  const outGuide = path.join(OUT_DIR, "sichinohe-hero-v5-guide.png");

  fs.mkdirSync(OUT_DIR, { recursive: true });
  await sharp(template).toFile(outTemplate);
  await sharp(maskPng).toFile(outMask);
  await sharp(guide).toFile(outGuide);

  console.log("v5 illustration templates:");
  console.log(" ", outTemplate);
  console.log(" ", outMask, "(white=アウトペイント可, black=保護)");
  console.log(" ", outGuide, "(マージン可視化)");
  console.log("");
  console.log("contentRect:", { x: CONTENT_X, y: CONTENT_Y, w: CONTENT_W, h: CONTENT_H });
  console.log("次: マスク白領域だけを埋める。v4 領域はピクセル変更禁止。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
