/**
 * 新ヒーロー画像を sichinohe-hero-v5.png に登録し manifest / hitboxes の canvas サイズを同期
 * Usage: node scripts/promote-hero-v5.mjs <path-to-image.png>
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");
const MAPS = path.join(__dirname, "..", "web", "public", "maps");
const ROOT_MAPS = path.join(__dirname, "..", "..", "public", "maps");
const OUT = path.join(MAPS, "sichinohe-hero-v5.png");

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error("usage: node promote-hero-v5.mjs <image.png>");
  process.exit(1);
}

const meta = await sharp(src).metadata();
const w = meta.width;
const h = meta.height;
if (!w || !h) throw new Error("could not read image size");

for (const dir of [MAPS, ROOT_MAPS]) {
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, path.join(dir, "sichinohe-hero-v5.png"));
}
fs.copyFileSync(src, OUT);

const manifestPath = path.join(MAP_DIR, "features.manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
manifest.mapAsset = "/maps/sichinohe-hero-v5.png";
const isMasterV5 = w === 1920 && h === 1920;
manifest.heroImage = {
  src: `/maps/sichinohe-hero-v5.png?v=${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`,
  width: w,
  height: h,
  viewBox: `0 0 ${w} ${h}`,
  projection: "official-map-layout-illustrated-v5",
  ...(isMasterV5
    ? {
        contentRect: { x: 448, y: 565, width: 1024, height: 790 },
        contentAnchor: "v4-layout-preserved",
        attribution: "layout-v5 — v4 contentRect + margin art",
        credit: "v4 等倍貼付テンプレ + マージン制作",
      }
    : {
        attribution: "layout-v5 Gemini 正方形 + 手トレースヒットボックス",
        credit: "Gemini 生成イラスト + trace-hitboxes 直トレース",
      }),
};
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf-8");

const hbPath = path.join(MAP_DIR, "hitboxes-hero-v5.json");
const hb = fs.existsSync(hbPath)
  ? JSON.parse(fs.readFileSync(hbPath, "utf-8"))
  : { schemaVersion: "2026-06-09", features: [] };
hb.coordinateAuthority = isMasterV5
  ? `sichinohe-hero-v5.png ${w}×${h} v4+offset（layout-v5 contentRect）`
  : `sichinohe-hero-v5.png ${w}×${h} 直トレース（layout-v5-gemini）`;
hb.hero = isMasterV5
  ? {
      width: w,
      height: h,
      viewBox: `0 0 ${w} ${h}`,
      contentRect: { x: 448, y: 565, width: 1024, height: 790 },
    }
  : { width: w, height: h, viewBox: `0 0 ${w} ${h}` };
fs.writeFileSync(hbPath, JSON.stringify(hb, null, 2) + "\n", "utf-8");

console.log("promoted → sichinohe-hero-v5.png", `${w}×${h}`);
console.log("updated features.manifest.json heroImage");
console.log("next:");
console.log("  1) cd web && npm run dev");
console.log("  2) http://localhost:3000/maps/trace-hitboxes.html?version=v5");
if (isMasterV5) {
  console.log("  3) node scripts/offset-hitboxes-v4-to-v5.mjs");
} else {
  console.log("  3) 全7本トレース → hitboxes-hero-v5.json に保存");
}
console.log("  4) node scripts/sync-hero-hitboxes.mjs && node scripts/build-map-preview.mjs");

const hbPublic = path.join(MAPS, "hitboxes-hero-v5.json");
fs.copyFileSync(hbPath, hbPublic);
if (fs.existsSync(ROOT_MAPS)) {
  fs.copyFileSync(hbPath, path.join(ROOT_MAPS, "hitboxes-hero-v5.json"));
}
