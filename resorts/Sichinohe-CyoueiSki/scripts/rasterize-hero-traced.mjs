/**
 * sichinohe-hero-traced.svg → layout-preview.png（レイアウト検証用のみ）
 *
 * 本番 sichinohe-hero.png には書き込まない。図解SVGをヒーローにするのは禁止。
 * 用法: node rasterize-hero-traced.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const maps = path.join(__dirname, "..", "web", "public", "maps");

const svgPath = path.join(maps, "sichinohe-hero-traced.svg");
const layoutOut = path.join(maps, "reference", "layout-preview-schematic.png");

const WIDTH = 1536;
const HEIGHT = 1024;

async function main() {
  if (!fs.existsSync(svgPath)) {
    console.error("missing", svgPath);
    process.exit(1);
  }

  fs.mkdirSync(path.join(maps, "reference"), { recursive: true });
  await sharp(svgPath).resize(WIDTH, HEIGHT).png({ quality: 100 }).toFile(layoutOut);
  console.log("wrote layout preview only →", layoutOut);
  console.log("本番ヒーローは sichinohe-hero-v2.png を使用。sichinohe-hero.png は上書きしません。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
