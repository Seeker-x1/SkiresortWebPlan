/**
 * 国土地理院 シームレス写真 + ヒルシェードを合成し、実座標ベースのヒーロー画像を生成する。
 * 用法: node build-hero-gsi.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import {
  GSI_HILLSHADE,
  GSI_SEAMLESS_PHOTO,
  lngLatToTile,
  tileBounds,
} from "./lib/geo-bbox.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "web", "public", "maps");
const META_PATH = path.join(ROOT, "web", "data", "map", "hero-meta.json");

/** 七戸町営スキー場 — OSM ペアリフト + 余白 */
const BBOX = {
  west: 141.0938,
  east: 141.1012,
  south: 40.6968,
  north: 40.6992,
};

const ZOOM = 17;
const WIDTH = 1920;
const HEIGHT = 1280;

async function fetchTile(url, optional = false) {
  const res = await fetch(url, {
    headers: { "User-Agent": "resorts/Sichinohe-CyoueiSki-map-build/1.0" },
  });
  if (!res.ok) {
    if (optional) return null;
    throw new Error(`tile ${res.status} ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function tileUrl(template, z, x, y) {
  return template.replace("{z}", z).replace("{x}", x).replace("{y}", y);
}

async function main() {
  const tl = lngLatToTile(BBOX.west, BBOX.north, ZOOM);
  const br = lngLatToTile(BBOX.east, BBOX.south, ZOOM);

  const tilesX = br.x - tl.x + 1;
  const tilesY = br.y - tl.y + 1;
  const canvasW = tilesX * 256;
  const canvasH = tilesY * 256;

  console.log(`tiles ${tilesX}x${tilesY} @ z${ZOOM}`);

  const photoLayers = [];
  const hillLayers = [];

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const x = tl.x + tx;
      const y = tl.y + ty;
      const [photo, hill] = await Promise.all([
        fetchTile(tileUrl(GSI_SEAMLESS_PHOTO, ZOOM, x, y)),
        fetchTile(tileUrl(GSI_HILLSHADE, ZOOM, x, y), true),
      ]);
      photoLayers.push({ input: photo, left: tx * 256, top: ty * 256 });
      if (hill) {
        hillLayers.push({ input: hill, left: tx * 256, top: ty * 256 });
      }
    }
  }

  let pipeline = sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: { r: 240, g: 245, b: 250 },
    },
  }).composite(photoLayers);

  if (hillLayers.length > 0) {
    pipeline = pipeline.composite(
      hillLayers.map((l) => ({ ...l, blend: "multiply" })),
    );
  }

  const mosaic = await pipeline.png().toBuffer();

  const bounds = tileBounds(tl.x, tl.y, ZOOM);
  const boundsBR = tileBounds(br.x, br.y, ZOOM);
  const stitchedBbox = {
    west: bounds.west,
    east: boundsBR.east,
    north: bounds.north,
    south: boundsBR.south,
  };

  const cropLeft = Math.max(
    0,
    Math.floor(
      ((BBOX.west - stitchedBbox.west) / (stitchedBbox.east - stitchedBbox.west)) *
        canvasW,
    ),
  );
  const cropTop = Math.max(
    0,
    Math.floor(
      ((stitchedBbox.north - BBOX.north) / (stitchedBbox.north - stitchedBbox.south)) *
        canvasH,
    ),
  );
  const cropRight = Math.min(
    canvasW,
    Math.ceil(
      ((BBOX.east - stitchedBbox.west) / (stitchedBbox.east - stitchedBbox.west)) *
        canvasW,
    ),
  );
  const cropBottom = Math.min(
    canvasH,
    Math.ceil(
      ((stitchedBbox.north - BBOX.south) / (stitchedBbox.north - stitchedBbox.south)) *
        canvasH,
    ),
  );

  const cropW = cropRight - cropLeft;
  const cropH = cropBottom - cropTop;

  const cropped = await sharp(mosaic)
    .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .modulate({ brightness: 1.05, saturation: 1.08 })
    .sharpen({ sigma: 0.8 })
    .png()
    .toBuffer();

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, "sichinohe-hero-gsi.png");
  fs.writeFileSync(outPath, cropped);

  const meta = {
    source: "GSI seamlessphoto + hillshademap",
    attribution: "© 国土地理院",
    zoom: ZOOM,
    bbox: BBOX,
    width: WIDTH,
    height: HEIGHT,
    viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
    projection: "linear-latlng-in-bbox",
    generatedAt: new Date().toISOString(),
    note: "正射座標ベース。Earth Studio 斜め俯瞰に差し替え時は control-points.json で再投影",
  };
  fs.writeFileSync(META_PATH, JSON.stringify(meta, null, 2));

  console.log("wrote", outPath);
  console.log("wrote", META_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
