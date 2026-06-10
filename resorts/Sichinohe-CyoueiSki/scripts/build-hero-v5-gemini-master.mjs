/**
 * Gemini 1024×1024 を 1920×1920 マスター中央に配置（アウトペイント前の下書き用）
 *
 * 本番 /map はグレー余白が縮小表示になるため gemini をそのまま使う:
 *   node promote-hero-v5.mjs gemini-v5-source.png
 *
 * マージンを描き込んだ後だけ本スクリプトを使う:
 *   node build-hero-v5-gemini-master.mjs [gemini.png]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER = 1920;
const MAPS = path.join(__dirname, "..", "web", "public", "maps");
const ROOT_MAPS = path.join(__dirname, "..", "..", "public", "maps");
const DEFAULT_SRC = path.join(MAPS, "gemini-v5-source.png");
const OUT = path.join(MAPS, "sichinohe-hero-v5.png");

const src = process.argv[2] || DEFAULT_SRC;
if (!fs.existsSync(src)) {
  console.error("missing:", src);
  process.exit(1);
}

const meta = await sharp(src).metadata();
const gw = meta.width ?? 0;
const gh = meta.height ?? 0;
if (!gw || !gh) throw new Error("could not read gemini size");

const left = Math.round((MASTER - gw) / 2);
const top = Math.round((MASTER - gh) / 2);

const canvas = await sharp({
  create: {
    width: MASTER,
    height: MASTER,
    channels: 4,
    background: { r: 247, g: 249, b: 251, alpha: 1 },
  },
})
  .png()
  .toBuffer();

const gemini = await sharp(src).flatten({ background: { r: 247, g: 249, b: 251 } }).toBuffer();
const out = await sharp(canvas).composite([{ input: gemini, left, top }]).png().toBuffer();

for (const dir of [MAPS, ROOT_MAPS]) {
  fs.mkdirSync(dir, { recursive: true });
  await sharp(out).toFile(path.join(dir, "sichinohe-hero-v5.png"));
}
await sharp(out).toFile(OUT);

console.log(
  JSON.stringify(
    {
      out: "sichinohe-hero-v5.png",
      master: `${MASTER}×${MASTER}`,
      gemini: `${gw}×${gh}`,
      pasteAt: { left, top },
    },
    null,
    2,
  ),
);
