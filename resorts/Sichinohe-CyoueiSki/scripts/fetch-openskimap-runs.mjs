/**
 * OpenSkiMap runs を bbox でフィルタして trails.geojson 候補を出力
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");

const BBOX = { west: 141.0938, east: 141.1012, south: 40.6968, north: 40.6992 };

function inBbox(lng, lat) {
  return lng >= BBOX.west && lng <= BBOX.east && lat >= BBOX.south && lat <= BBOX.north;
}

function lineInBbox(coords) {
  return coords.some(([lng, lat]) => inBbox(lng, lat));
}

const res = await fetch("https://tiles.openskimap.org/geojson/ski_areas.geojson");
const areas = await res.json();
const shichinohe = areas.features.filter((f) => {
  const n = (f.properties?.name ?? "").toLowerCase();
  return n.includes("shichinohe") || n.includes("七戸");
});
console.log("ski areas:", shichinohe.map((f) => f.properties?.name));

// Stream runs is too large — use Overpass for piste in bbox instead
const overpass = `
[out:json][timeout:25];
(
  way["piste:type"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
  relation["piste:type"](${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east});
);
out geom;
`;
const opRes = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  body: overpass,
});
const op = await opRes.json();
const ways = (op.elements ?? []).filter((e) => e.type === "way" && e.geometry?.length);
console.log("OSM piste ways:", ways.length);
ways.forEach((w) => {
  console.log(
    w.tags?.name ?? "(unnamed)",
    w.tags?.["piste:difficulty"] ?? w.tags?.["piste:type"],
    "nodes:",
    w.geometry.length,
  );
});

const features = ways.map((w, i) => ({
  type: "Feature",
  properties: {
    id: `trail-osm-${w.id}`,
    name: w.tags?.name ?? `OSM piste ${w.id}`,
    type: "trail",
    difficulty: w.tags?.["piste:difficulty"] ?? "unknown",
    source: `OpenStreetMap way/${w.id}`,
  },
  geometry: {
    type: "LineString",
    coordinates: w.geometry.map((g) => [g.lon, g.lat]),
  },
}));

const out = { type: "FeatureCollection", features };
fs.writeFileSync(path.join(MAP_DIR, "reference", "osm-pistes-raw.geojson"), JSON.stringify(out, null, 2));
console.log("wrote osm-pistes-raw.geojson");
