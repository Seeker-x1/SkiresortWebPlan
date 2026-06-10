/**
 * ポニーリフト座標を調査し lifts.geojson に追加
 * 優先: OSM/OpenSkiMap → なければ GSI正射 + skimap 照合座標
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projectToPixel } from "./lib/geo-bbox.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");

const WIDE = { west: 141.092, east: 141.103, south: 40.6955, north: 40.7005 };

/** GSI正射上の東側ベース付近（skimap ポニー180m・現地照合待ち） */
const GSI_PONY_GEO = {
  bottom: { lng: 141.0995, lat: 40.69726 },
  top: { lng: 141.1003, lat: 40.69744 },
};

function inBbox(lng, lat, b = WIDE) {
  return lng >= b.west && lng <= b.east && lat >= b.south && lat <= b.north;
}

function round7(n) {
  return Math.round(n * 1e7) / 1e7;
}

// --- OpenSkiMap ---
const liftsRes = await fetch("https://tiles.openskimap.org/geojson/lifts.geojson", {
  headers: { "User-Agent": "resorts/Sichinohe-CyoueiSki/1.0" },
});
const liftsGeo = await liftsRes.json();
const osmLifts = liftsGeo.features.filter((f) =>
  (f.geometry?.coordinates ?? []).some(([lng, lat]) => inBbox(lng, lat)),
);
const ponyFromOsm = osmLifts.find((f) => {
  const src = f.properties.sources?.[0]?.id ?? "";
  return !src.includes("631879096") &&
    ["platter", "rope_tow", "drag_lift", "t-bar", "j-bar"].includes(f.properties.liftType);
});

// --- Overpass ---
let ponyFromOverpass = null;
try {
  const { south, west, north, east } = WIDE;
  const query = `[out:json][timeout:60];way["aerialway"~"rope_tow|drag_lift|platter|t-bar|magic_carpet|j-bar"](${south},${west},${north},${east});out geom;`;
  const opRes = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "resorts/Sichinohe-CyoueiSki/1.0",
    },
    body: "data=" + encodeURIComponent(query),
  });
  const opText = await opRes.text();
  if (opText.trimStart().startsWith("{")) {
    const op = JSON.parse(opText);
    const ways = (op.elements ?? []).filter((e) => e.type === "way" && e.geometry?.length);
    ponyFromOverpass = ways.find((w) => String(w.id) !== "631879096") ?? null;
  }
} catch {
  /* skip */
}

let ponyCoords = null;
let ponySource = null;

if (ponyFromOverpass) {
  ponyCoords = ponyFromOverpass.geometry.map((p) => [p.lon, p.lat]);
  ponySource = `OpenStreetMap way/${ponyFromOverpass.id} (${ponyFromOverpass.tags?.aerialway})`;
} else if (ponyFromOsm) {
  ponyCoords = ponyFromOsm.geometry.coordinates.map((c) => [c[0], c[1]]);
  ponySource = `OpenSkiMap via ${ponyFromOsm.properties.sources?.[0]?.id} (${ponyFromOsm.properties.liftType})`;
} else {
  ponyCoords = [
    [round7(GSI_PONY_GEO.bottom.lng), round7(GSI_PONY_GEO.bottom.lat)],
    [round7(GSI_PONY_GEO.top.lng), round7(GSI_PONY_GEO.top.lat)],
  ];
  ponySource =
    "国土地理院正射東側ベース + skimap照合（OSM未登録・要現地確認）";
  console.log("OSM/OpenSkiMapにポニーなし → GSI+skimap座標を使用");
}

const meta = JSON.parse(fs.readFileSync(path.join(MAP_DIR, "hero-meta.json"), "utf-8"));
const gsiBottom = projectToPixel(ponyCoords[0][0], ponyCoords[0][1], meta.bbox, meta.width, meta.height);
const gsiTop = projectToPixel(ponyCoords.at(-1)[0], ponyCoords.at(-1)[1], meta.bbox, meta.width, meta.height);
console.log("GSI pony bottom px:", [Math.round(gsiBottom.x), Math.round(gsiBottom.y)]);
console.log("GSI pony top px:", [Math.round(gsiTop.x), Math.round(gsiTop.y)]);

// control-points 更新
const anchors = JSON.parse(fs.readFileSync(path.join(MAP_DIR, "control-points-hero-ai.json"), "utf-8"));
const ponyBottom = anchors.points.find((p) => p.id === "lift-pony-bottom");
const ponyTop = anchors.points.find((p) => p.id === "lift-pony-top");
if (ponyBottom && ponyTop) {
  ponyBottom.lng = ponyCoords[0][0];
  ponyBottom.lat = ponyCoords[0][1];
  ponyTop.lng = ponyCoords.at(-1)[0];
  ponyTop.lat = ponyCoords.at(-1)[1];
  anchors.notes =
    "ペアリフト: OSM way/631879096。ポニー: GSI正射+skimap（OSM未登録）。4点アフィンで絵に合わせ。";
  fs.writeFileSync(path.join(MAP_DIR, "control-points-hero-ai.json"), JSON.stringify(anchors, null, 2));
}

const liftsPath = path.join(MAP_DIR, "lifts.geojson");
const lifts = JSON.parse(fs.readFileSync(liftsPath, "utf-8"));
const pair = lifts.features.find((f) => f.properties.id === "lift-pair");
lifts.features = [
  pair,
  {
    type: "Feature",
    properties: {
      id: "lift-pony",
      name: "ポニーリフト",
      type: "lift",
      liftKind: "surface",
      liftType: "rope_tow",
      source: ponySource,
    },
    geometry: { type: "LineString", coordinates: ponyCoords },
  },
].filter(Boolean);
fs.writeFileSync(liftsPath, JSON.stringify(lifts, null, 2));

fs.writeFileSync(
  path.join(MAP_DIR, "reference", "pony-lift-research.json"),
  JSON.stringify(
    {
      ponySource,
      ponyCoords,
      gsiPixels: {
        bottom: [Math.round(gsiBottom.x), Math.round(gsiBottom.y)],
        top: [Math.round(gsiTop.x), Math.round(gsiTop.y)],
      },
      searchedAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

console.log("pony source:", ponySource);
console.log("updated lifts.geojson");
