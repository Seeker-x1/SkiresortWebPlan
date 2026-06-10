import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "resorts/Sichinohe-CyoueiSki/1.0 (map-research)",
  },
  body: "data=" + encodeURIComponent("[out:json][timeout:60];way(631879096);out geom;"),
});
const text = await res.text();
if (!text.trimStart().startsWith("{")) {
  console.error(text.slice(0, 300));
  process.exit(1);
}
const data = JSON.parse(text);
const way = data.elements.find((e) => e.type === "way");
if (!way?.geometry) {
  console.error("way not found");
  process.exit(1);
}
const feature = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "lift-pair",
        name: way.tags?.name ?? "ペアリフト",
        type: "lift",
        liftType: way.tags?.aerialway ?? "chair_lift",
        source: "OpenStreetMap way/631879096",
        status: "draft",
      },
      geometry: {
        type: "LineString",
        coordinates: way.geometry.map((p) => [p.lon, p.lat]),
      },
    },
  ],
};
const out = path.join(__dirname, "..", "web", "data", "map", "lifts.geojson");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(feature, null, 2));
console.log("wrote", out, "points", way.geometry.length);
