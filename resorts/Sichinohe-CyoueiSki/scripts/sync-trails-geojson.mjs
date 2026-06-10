/**
 * hitboxes-hero-v4.json + features.manifest → trails.geojson
 * A 方式: geometry は hero ピクセル座標（properties.coordinateSystem = hero-pixel）
 *
 * Usage: node scripts/sync-trails-geojson.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(MAP_DIR, name), "utf-8"));
}

function parsePathML(pathD) {
  const tokens = pathD.match(/[a-zA-Z]|-?\d*\.?\d+/g) ?? [];
  const points = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[a-zA-Z]$/.test(t)) {
      const cmd = t.toUpperCase();
      i += 1;
      if (cmd === "M" || cmd === "L") {
        const x = parseFloat(tokens[i]);
        const y = parseFloat(tokens[i + 1]);
        if (Number.isFinite(x) && Number.isFinite(y)) points.push([x, y]);
        i += 2;
      } else if (cmd === "Z") continue;
      else throw new Error(`unsupported path command ${cmd} in ${pathD}`);
    } else {
      i += 1;
    }
  }
  return points;
}

const manifest = readJson("features.manifest.json");
const hitboxesPath = path.join(MAP_DIR, "hitboxes-hero-v4.json");
if (!fs.existsSync(hitboxesPath)) {
  console.error("missing hitboxes-hero-v4.json");
  process.exit(1);
}
const hitboxes = JSON.parse(fs.readFileSync(hitboxesPath, "utf-8"));

const trailFeatures = (hitboxes.features ?? []).filter(
  (f) => f.type === "trail" || String(f.id).startsWith("trail-"),
);

const manifestById = Object.fromEntries(
  (manifest.features ?? []).map((f) => [f.id, f]),
);

const out = {
  type: "FeatureCollection",
  metadata: {
    coordinateSystem: "hero-pixel",
    heroViewBox: hitboxes.hero?.viewBox ?? "0 0 1024 790",
    coordinateAuthority: hitboxes.coordinateAuthority,
    note: "geometry coordinates are hero image pixels [x,y], not WGS84. Use properties.heroPath for SVG overlay.",
  },
  features: trailFeatures.map((t) => {
    const m = manifestById[t.id];
    const coords = parsePathML(t.path);
    return {
      type: "Feature",
      properties: {
        id: t.id,
        name: m?.label ?? t.label ?? t.id,
        type: "trail",
        difficulty: m?.difficulty ?? "unknown",
        source: t.source ?? "illustrated-hero layout-v4 手トレース",
        heroPath: t.path,
        heroViewBox: hitboxes.hero?.viewBox ?? "0 0 1024 790",
        coordinateSystem: "hero-pixel",
        officialCourse: m?.meta?.公式 ?? null,
      },
      geometry: {
        type: "LineString",
        coordinates: coords,
      },
    };
  }),
};

const outPath = path.join(MAP_DIR, "trails.geojson");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf-8");
console.log("wrote", outPath, `(${out.features.length} trails)`);
