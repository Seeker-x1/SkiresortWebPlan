/**
 * 公式 × gelanding 50% オーバーレイ静止画（layout-QA 初期プリセット）
 * Usage: node docs/mock-assets/scripts/build-sapporo-kokusai-layout-preview.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REF = path.join(__dirname, "..", "sapporo-kokusai-lp", "reference");

const OFFICIAL = path.join(REF, "official-slopemap.png");
const GELANDING = path.join(REF, "gelanding-2016.webp");
const OUT = path.join(REF, "overlay-preview-50.png");
const TRANSFORM_OUT = path.join(REF, "overlay-transform.json");

/** layout-qa.html 初期プリセット（目視調整の出発点） */
const TRANSFORM = {
  schemaVersion: "2026-07-06",
  base: "official-slopemap.png",
  overlay: "gelanding-2016.webp",
  opacity: 0.5,
  scale: 1.88,
  rotateDeg: -0.5,
  translatePx: { x: 12, y: -28 },
  status: "draft",
  note: "自動生成プレビュー。layout-qa.html で微調整後 status を approved に更新すること。",
};

async function main() {
  const official = sharp(OFFICIAL);
  const meta = await official.metadata();
  const W = meta.width;
  const H = meta.height;

  const gelBuf = await sharp(GELANDING)
    .resize({
      width: Math.round(930 * TRANSFORM.scale),
      height: Math.round(599 * TRANSFORM.scale),
      fit: "fill",
    })
    .rotate(TRANSFORM.rotateDeg, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const overlayPng = await sharp(gelBuf.data, {
    raw: { width: gelBuf.info.width, height: gelBuf.info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const left = Math.round(W / 2 - gelBuf.info.width / 2 + TRANSFORM.translatePx.x);
  const top = Math.round(H / 2 - gelBuf.info.height / 2 + TRANSFORM.translatePx.y);

  const faded = await sharp(overlayPng)
    .ensureAlpha()
    .composite([
      {
        input: Buffer.from([255, 255, 255, Math.round(255 * TRANSFORM.opacity)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  await official
    .composite([{ input: faded, left, top }])
    .png()
    .toFile(OUT);

  fs.writeFileSync(TRANSFORM_OUT, JSON.stringify(TRANSFORM, null, 2) + "\n", "utf8");
  console.log("wrote", OUT);
  console.log("wrote", TRANSFORM_OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
