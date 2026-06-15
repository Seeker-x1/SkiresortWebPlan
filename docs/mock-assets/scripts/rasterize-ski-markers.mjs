/**
 * Bake marker-ski-32/48.png from marker-ski-source.png (user pictogram, no hand trace).
 * White glyph on #5E6F8A circle — same treatment as other Mapular pins.
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const iconsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "_shared", "icons");
const SOURCE = join(iconsDir, "marker-ski-source.png");
const CIRCLE = "#5E6F8A";
/** Match marker-food-* white glyph height (~26/64 ≈ 40% of canvas). */
const TARGET_GLYPH_HEIGHT_RATIO = 0.406;

async function whiteGlyphFromSource() {
  const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let i = 0; i < data.length; i += 4) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (lum > 210) {
      data[i + 3] = 0;
    } else {
      const x = (i / 4) % info.width;
      const y = Math.floor(i / 4 / info.width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const cropped = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const src = ((minY + y) * info.width + (minX + x)) * 4;
      const dst = (y * w + x) * 4;
      cropped[dst] = data[src];
      cropped[dst + 1] = data[src + 1];
      cropped[dst + 2] = data[src + 2];
      cropped[dst + 3] = data[src + 3];
    }
  }

  return sharp(cropped, {
    raw: { width: w, height: h, channels: 4 },
  }).png();
}

async function buildMarker(size) {
  const trimmed = await whiteGlyphFromSource();
  const meta = await trimmed.metadata();
  const targetH = Math.round(size * TARGET_GLYPH_HEIGHT_RATIO);
  const scale = targetH / meta.height;
  const w = Math.max(1, Math.round(meta.width * scale));
  const h = Math.max(1, Math.round(meta.height * scale));
  const left = Math.round((size - w) / 2);
  const top = Math.round((size - h) / 2);

  const glyph = await trimmed.resize(w, h, { fit: "inside" }).png().toBuffer();

  const circleSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="${CIRCLE}"/></svg>`
  );

  const png = await sharp(circleSvg)
    .resize(size, size)
    .composite([{ input: glyph, left, top }])
    .png()
    .toBuffer();

  const out = join(iconsDir, `marker-ski-${size}.png`);
  writeFileSync(out, png);
  console.log(`wrote ${out} (${png.length} bytes)`);
  return png;
}

function writeSvg(size, png) {
  const b64 = png.toString("base64");
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="スキー場">` +
    `<image href="data:image/png;base64,${b64}" width="${size}" height="${size}"/>` +
    `</svg>`;
  writeFileSync(join(iconsDir, `marker-ski-${size}.svg`), svg);
}

async function buildInnerGlyph() {
  const size = 48;
  const trimmed = await whiteGlyphFromSource();
  const meta = await trimmed.metadata();
  const targetH = Math.round(size * TARGET_GLYPH_HEIGHT_RATIO);
  const scale = targetH / meta.height;
  const w = Math.max(1, Math.round(meta.width * scale));
  const h = Math.max(1, Math.round(meta.height * scale));
  const left = Math.round((size - w) / 2);
  const top = Math.round((size - h) / 2);
  const glyph = await trimmed.resize(w, h, { fit: "inside" }).png().toBuffer();
  const png = await sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: glyph, left, top }])
    .png()
    .toBuffer();
  writeFileSync(
    join(iconsDir, "marker-ski-inner.svg"),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" role="img" aria-label="スキー">` +
      `<image href="data:image/png;base64,${png.toString("base64")}" width="48" height="48"/>` +
      `</svg>`
  );
}

async function main() {
  for (const size of [48, 32]) {
    const png = await buildMarker(size);
    writeSvg(size, png);
  }
  await buildInnerGlyph();
  console.log("done — baked from marker-ski-source.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
