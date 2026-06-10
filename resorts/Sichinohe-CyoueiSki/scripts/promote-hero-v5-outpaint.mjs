/**
 * アウトペイント済み 1920×1920 を本番 sichinohe-hero-v5.png に登録
 * contentRect 保護を verify してから manifest / hitboxes を 1920 に同期
 *
 * Usage: node scripts/promote-hero-v5-outpaint.mjs <outpainted.png>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MASTER = 1920;
const CONTENT_W = 1024;
const CONTENT_H = 1024;
const CONTENT_X = Math.round((MASTER - CONTENT_W) / 2);
const CONTENT_Y = CONTENT_X;

const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");
const MAPS = path.join(__dirname, "..", "web", "public", "maps");
const ROOT_MAPS = path.join(__dirname, "..", "..", "public", "maps");

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("usage: node promote-hero-v5-outpaint.mjs <outpainted-1920.png>");
  process.exit(1);
}

const verify = spawnSync(
  process.execPath,
  [path.join(__dirname, "verify-hero-v5-content.mjs"), src],
  { stdio: "inherit" },
);
if (verify.status !== 0) {
  console.error("FAIL: contentRect が Gemini 原本と一致しません。保護領域を変更していないか確認してください。");
  process.exit(1);
}

const meta = await sharp(src).metadata();
if (meta.width !== MASTER || meta.height !== MASTER) {
  console.error(`expected ${MASTER}×${MASTER}, got ${meta.width}×${meta.height}`);
  process.exit(1);
}

for (const dir of [MAPS, ROOT_MAPS]) {
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, path.join(dir, "sichinohe-hero-v5.png"));
}

const manifestPath = path.join(MAP_DIR, "features.manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
manifest.mapAsset = "/maps/sichinohe-hero-v5.png";
manifest.heroImage = {
  src: `/maps/sichinohe-hero-v5.png?v=${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
  width: MASTER,
  height: MASTER,
  viewBox: `0 0 ${MASTER} ${MASTER}`,
  projection: "official-map-layout-illustrated-v5",
  contentRect: { x: CONTENT_X, y: CONTENT_Y, width: CONTENT_W, height: CONTENT_H },
  contentAnchor: "gemini-1024-centered",
  attribution: "layout-v5 — Gemini 1024 contentRect + margin outpaint",
  credit: "Gemini イラスト + マージンアウトペイント + trace-hitboxes",
};
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");

const hbPath = path.join(MAP_DIR, "hitboxes-hero-v5.json");
const hbArchive = path.join(MAP_DIR, "hitboxes-hero-v5-gemini-1024.json");
if (fs.existsSync(hbPath) && !fs.existsSync(hbArchive)) {
  fs.copyFileSync(hbPath, hbArchive);
  console.log("archived 1024 hitboxes → hitboxes-hero-v5-gemini-1024.json");
}

spawnSync(process.execPath, [path.join(__dirname, "offset-hitboxes-gemini-to-1920.mjs")], {
  stdio: "inherit",
});

const rebuild = ["sync-hero-hitboxes.mjs", "build-map-preview.mjs", "build-calibration-qa.mjs"];
for (const script of rebuild) {
  const r = spawnSync(process.execPath, [path.join(__dirname, script)], { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("");
console.log("promoted 1920 outpaint → sichinohe-hero-v5.png");
console.log("contentRect:", { x: CONTENT_X, y: CONTENT_Y, width: CONTENT_W, height: CONTENT_H });
console.log("next: calibration-qa 目視 → /ja/map で cover 確認");
