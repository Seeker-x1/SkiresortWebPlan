/**
 * control-points-manual.json（Earth Studio 斜め俯瞰）→ アフィン投影 overlay
 *
 * 使い方:
 *   node fit-overlay-affine.mjs
 *   node fit-overlay-affine.mjs --input ../web/data/map/control-points-manual.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lineStringToAffinePath, projectAffine, solveAffine } from "./lib/affine.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");

const STROKE = { lift: 7, trail: 18 };

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function main() {
  const inputArg = process.argv.find((a) => a.startsWith("--input="));
  const inputPath = inputArg
    ? inputArg.slice("--input=".length)
    : path.join(MAP_DIR, "control-points-manual.json");

  if (!fs.existsSync(inputPath)) {
    console.error("missing", inputPath);
    console.error("Earth Studio 書き出し後にピクセル座標を記録してください（HERO_MAP_CALIBRATION.md §2.3）");
    process.exit(1);
  }

  const manual = readJson(inputPath);
  const points = manual.points ?? [];
  if (points.length < 3) {
    console.error("need >= 3 control points with px/py");
    process.exit(1);
  }

  const srcPts = points.map((p) => [p.lng, p.lat]);
  const dstPts = points.map((p) => [p.px, p.py]);
  const affine = solveAffine(srcPts, dstPts);

  const lifts = readJson(path.join(MAP_DIR, "lifts.geojson"));
  const trails = readJson(path.join(MAP_DIR, "trails.geojson"));
  const { width, height } = manual.image;
  const viewBox = `0 0 ${width} ${height}`;

  const features = {};
  for (const f of lifts.features) {
    const coords = f.geometry.coordinates;
    features[f.properties.id] = {
      type: "lift",
      strokeWidth: STROKE.lift,
      path: lineStringToAffinePath(coords, affine),
      markers: [coords[0], coords.at(-1)].map(([lng, lat]) => {
        const { x, y } = projectAffine(lng, lat, affine);
        return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
      }),
      source: f.properties.source,
    };
  }
  for (const f of trails.features) {
    features[f.properties.id] = {
      type: "trail",
      strokeWidth: STROKE.trail,
      path: lineStringToAffinePath(f.geometry.coordinates, affine),
      source: f.properties.source,
    };
  }

  const controlPoints = {};
  for (const p of points) {
    controlPoints[p.id] = {
      lng: p.lng,
      lat: p.lat,
      role: p.role ?? p.id,
      pixel: [p.px, p.py],
    };
  }

  const overlay = {
    viewBox,
    projection: "affine-from-control-points",
    affine,
    image: manual.image,
    controlPoints,
    features,
  };

  const outOverlay = path.join(MAP_DIR, "overlay-paths.json");
  fs.writeFileSync(outOverlay, JSON.stringify(overlay, null, 2));
  fs.writeFileSync(path.join(MAP_DIR, "control-points.json"), JSON.stringify({ controlPoints, viewBox }, null, 2));

  console.log("affine:", affine);
  console.log("wrote", outOverlay);
  console.log("hero src:", manual.image.src);
}

main();
