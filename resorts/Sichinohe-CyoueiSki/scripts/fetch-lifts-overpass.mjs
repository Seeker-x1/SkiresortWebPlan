/**
 * 七戸 bbox 内の aerialway を Overpass から取得
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");
const meta = JSON.parse(fs.readFileSync(path.join(MAP_DIR, "hero-meta.json"), "utf-8"));
const { south, west, north, east } = meta.bbox;

const query = `[out:json][timeout:60];
(
  way["aerialway"](${south},${west},${north},${east});
);
out geom;`;

const res = await fetch("https://overpass-api.de/api/interpreter", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "resorts/Sichinohe-CyoueiSki/1.0 (map-research)",
  },
  body: "data=" + encodeURIComponent(query),
});
const text = await res.text();
if (!text.trimStart().startsWith("{")) {
  console.error(text.slice(0, 500));
  process.exit(1);
}
const data = JSON.parse(text);
const ways = data.elements.filter((e) => e.type === "way" && e.geometry?.length);

console.log(`found ${ways.length} aerialway(s)`);
for (const w of ways) {
  const g = w.geometry;
  console.log(
    `way/${w.id}`,
    w.tags?.aerialway,
    w.tags?.name ?? "(no name)",
    "points",
    g.length,
    "start",
    [g[0].lon, g[0].lat],
    "end",
    [g.at(-1).lon, g.at(-1).lat],
  );
}

fs.writeFileSync(
  path.join(MAP_DIR, "reference", "overpass-aerialways.json"),
  JSON.stringify(data, null, 2),
);
console.log("wrote reference/overpass-aerialways.json");
