/**
 * OSM GeoJSON + hero-meta bbox → overlay-paths.json
 * ペアリフト端点を地面コントロール点として検証ログを出力
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lineStringToPath, projectToPixel } from "./lib/geo-bbox.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MAP_DIR = path.join(ROOT, "web", "data", "map");

const STROKE = {
  lift: 7,
  trail: 18,
};

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function main() {
  const meta = readJson(path.join(MAP_DIR, "hero-meta.json"));
  const lifts = readJson(path.join(MAP_DIR, "lifts.geojson"));
  const trails = readJson(path.join(MAP_DIR, "trails.geojson"));

  const { bbox, width, height, viewBox } = meta;
  const features = {};

  for (const f of lifts.features) {
    const id = f.properties.id;
    const coords = f.geometry.coordinates;
    features[id] = {
      type: "lift",
      strokeWidth: STROKE.lift,
      path: lineStringToPath(coords, bbox, width, height),
      markers: [
        projectToPixel(coords[0][0], coords[0][1], bbox, width, height),
        projectToPixel(coords.at(-1)[0], coords.at(-1)[1], bbox, width, height),
      ].map((p) => [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]),
      source: f.properties.source,
    };
  }

  for (const f of trails.features) {
    const id = f.properties.id;
    features[id] = {
      type: "trail",
      strokeWidth: STROKE.trail,
      path: lineStringToPath(f.geometry.coordinates, bbox, width, height),
      source: f.properties.source,
    };
  }

  const pair = lifts.features.find((f) => f.properties.id === "lift-pair");
  const controlPoints = {
    "lift-pair-bottom": {
      lng: pair.geometry.coordinates[0][0],
      lat: pair.geometry.coordinates[0][1],
      role: "OSM way/631879096 下駅側",
    },
    "lift-pair-top": {
      lng: pair.geometry.coordinates.at(-1)[0],
      lat: pair.geometry.coordinates.at(-1)[1],
      role: "OSM way/631879096 上駅側",
    },
  };

  for (const [key, cp] of Object.entries(controlPoints)) {
    const px = projectToPixel(cp.lng, cp.lat, bbox, width, height);
    controlPoints[key].pixel = [Math.round(px.x), Math.round(px.y)];
  }

  const overlay = {
    viewBox,
    projection: meta.projection,
    bbox,
    image: {
      width,
      height,
      src: "/maps/sichinohe-hero-gsi.png",
    },
    controlPoints,
    features,
  };

  fs.writeFileSync(
    path.join(MAP_DIR, "overlay-paths.json"),
    JSON.stringify(overlay, null, 2),
  );
  fs.writeFileSync(
    path.join(MAP_DIR, "control-points.json"),
    JSON.stringify({ controlPoints, bbox, viewBox }, null, 2),
  );

  console.log("control points:", controlPoints);
  console.log("wrote overlay-paths.json, control-points.json");
}

main();
