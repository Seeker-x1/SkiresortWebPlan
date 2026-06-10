/**
 * control-points-hero-ai.json → 相似変換 overlay（イラストヒーロー向け）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  lineStringToSimilarityPath,
  projectSimilarity,
  solveSimilarity,
} from "./lib/similarity.mjs";

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
    : path.join(MAP_DIR, "control-points-hero-ai.json");

  const manual = readJson(inputPath);
  const points = manual.points ?? [];
  const pairBottom = points.find((p) => p.id === "lift-pair-bottom");
  const pairTop = points.find((p) => p.id === "lift-pair-top");
  if (!pairBottom || !pairTop) {
    console.error("need lift-pair-bottom and lift-pair-top");
    process.exit(1);
  }

  const sim = solveSimilarity(
    [pairBottom.lng, pairBottom.lat],
    [pairTop.lng, pairTop.lat],
    [pairBottom.px, pairBottom.py],
    [pairTop.px, pairTop.py],
  );

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
      path: lineStringToSimilarityPath(coords, sim),
      markers: [coords[0], coords.at(-1)].map(([lng, lat]) => {
        const { x, y } = projectSimilarity(lng, lat, sim);
        return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
      }),
      source: f.properties.source,
    };
  }
  for (const f of trails.features) {
    features[f.properties.id] = {
      type: "trail",
      strokeWidth: STROKE.trail,
      path: lineStringToSimilarityPath(f.geometry.coordinates, sim),
      source: f.properties.source,
    };
  }

  const controlPoints = {};
  for (const p of points) {
    const proj = projectSimilarity(p.lng, p.lat, sim);
    controlPoints[p.id] = {
      lng: p.lng,
      lat: p.lat,
      role: p.role ?? p.id,
      pixel: [Math.round(proj.x * 10) / 10, Math.round(proj.y * 10) / 10],
      target: [p.px, p.py],
    };
  }

  const overlay = {
    viewBox,
    projection: "similarity-from-pair-lift",
    similarity: sim,
    image: manual.image,
    controlPoints,
    features,
  };

  fs.writeFileSync(path.join(MAP_DIR, "overlay-paths.json"), JSON.stringify(overlay, null, 2));
  fs.writeFileSync(
    path.join(MAP_DIR, "control-points.json"),
    JSON.stringify({ controlPoints, viewBox }, null, 2),
  );

  console.log("similarity:", { scale: sim.scale, rotDeg: ((Math.atan2(sim.sin, sim.cos) * 180) / Math.PI).toFixed(1) });
  console.log("pair bottom:", controlPoints["lift-pair-bottom"]);
  console.log("pair top:", controlPoints["lift-pair-top"]);
  console.log("wrote overlay-paths.json");
}

main();
