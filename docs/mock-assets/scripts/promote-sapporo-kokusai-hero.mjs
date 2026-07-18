/**
 * 公式 slopemap を guides 用 hero PNG に昇格（1024px 幅・縦横比維持）
 * Usage: node docs/mock-assets/scripts/promote-sapporo-kokusai-hero.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "sapporo-kokusai-lp", "reference", "official-slopemap.png");
const OUT = path.join(ROOT, "images", "maps", "sapporo-kokusai-hero.png");
const META_OUT = path.join(ROOT, "sapporo-kokusai-lp", "reference", "hero-meta.json");

const TARGET_WIDTH = 1024;

async function main() {
  const meta = await sharp(SRC).metadata();
  const height = Math.round((meta.height / meta.width) * TARGET_WIDTH);

  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  await sharp(SRC)
    .resize(TARGET_WIDTH, height, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  const heroMeta = {
    schemaVersion: "2026-07-06",
    source: "official-slopemap.png",
    sourceUrl: "https://www.sapporo-kokusai.jp/slopes/images/slopemap.png",
    authority: "official-only",
    width: TARGET_WIDTH,
    height,
    viewBox: `0 0 ${TARGET_WIDTH} ${height}`,
    projection: "official-slopemap-direct",
    bakedLines: true,
    note: "公式コースマップをそのまま hero に使用（ユーザー承認 2026-07-06）",
    promotedAt: new Date().toISOString(),
  };

  fs.writeFileSync(META_OUT, JSON.stringify(heroMeta, null, 2) + "\n", "utf8");
  console.log("wrote", OUT, `${TARGET_WIDTH}x${height}`);
  console.log("wrote", META_OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
