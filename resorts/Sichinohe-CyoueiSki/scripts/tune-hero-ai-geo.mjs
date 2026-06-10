/**
 * sichinohe-hero.png 上のピクセル目標位置 → lng/lat に逆算し lifts/trails を更新
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inverseProjectSimilarity, solveSimilarity } from "./lib/similarity.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");

console.error(
  "DISABLED: 根拠なき手置きピクセルで GeoJSON を上書きするスクリプト。再実行禁止。",
  "ルール: .cursor/rules/lift-map-no-fake-overlays.mdc",
);
process.exit(1);

const cp = JSON.parse(fs.readFileSync(path.join(MAP_DIR, "control-points-hero-ai.json"), "utf-8"));
const bottom = cp.points.find((p) => p.id === "lift-pair-bottom");
const top = cp.points.find((p) => p.id === "lift-pair-top");
const sim = solveSimilarity(
  [bottom.lng, bottom.lat],
  [top.lng, top.lat],
  [bottom.px, bottom.py],
  [top.px, top.py],
);

function pxToGeo(points) {
  return points.map(([px, py]) => {
    const g = inverseProjectSimilarity(px, py, sim);
    return [Math.round(g.lng * 1e7) / 1e7, Math.round(g.lat * 1e7) / 1e7];
  });
}

/**
 * ⚠️ 使用禁止 — 過去に根拠なき手置きで V字扇形の落書き線を生成した。
 * 再実行しない。コース線は OSM/skimap 照合 or クリックキャリブレータ経由のみ。
 * ルール: .cursor/rules/lift-map-no-fake-overlays.mdc
 */
const PIXEL_DISABLED_DO_NOT_USE = {
  "lift-pony": [
    [1245, 655],
    [1220, 610],
    [1185, 535],
  ],
  "trail-champion": [
    [580, 210],
    [560, 320],
    [545, 430],
    [555, 520],
    [590, 600],
  ],
  "trail-upper": [
    [720, 200],
    [735, 310],
    [750, 420],
    [765, 520],
    [775, 590],
  ],
  "trail-intermediate": [
    [640, 205],
    [625, 310],
    [610, 400],
    [600, 490],
    [595, 580],
  ],
  "trail-pony": [
    [1230, 660],
    [1260, 640],
    [1285, 610],
    [1270, 580],
    [1220, 600],
  ],
};

const lifts = {
  type: "FeatureCollection",
  features: [
    JSON.parse(fs.readFileSync(path.join(MAP_DIR, "lifts.geojson"), "utf-8")).features.find(
      (f) => f.properties.id === "lift-pair",
    ),
    {
      type: "Feature",
      properties: {
        id: "lift-pony",
        name: "ポニーリフト",
        type: "lift",
        liftKind: "surface",
        source: "AIヒーロー上の可視位置に逆算補正",
      },
      geometry: { type: "LineString", coordinates: pxToGeo(PIXEL_DISABLED_DO_NOT_USE["lift-pony"]) },
    },
  ],
};

const trailIds = ["trail-champion", "trail-upper", "trail-intermediate", "trail-pony"];
const trailNames = {
  "trail-champion": "チャンピオン（上級）",
  "trail-upper": "上部エリア（中〜上級）",
  "trail-intermediate": "中斜面コース（中級）",
  "trail-pony": "ポニーリフト周辺（初級）",
};
const trailDiff = {
  "trail-champion": "advanced",
  "trail-upper": "intermediate-advanced",
  "trail-intermediate": "intermediate",
  "trail-pony": "beginner",
};

const trails = {
  type: "FeatureCollection",
  features: trailIds.map((id) => ({
    type: "Feature",
    properties: {
      id,
      name: trailNames[id],
      type: "trail",
      difficulty: trailDiff[id],
      source: "AIヒーロー + skimap レイアウト逆算補正",
    },
    geometry: { type: "LineString", coordinates: pxToGeo(PIXEL_DISABLED_DO_NOT_USE[id]) },
  })),
};

fs.writeFileSync(path.join(MAP_DIR, "lifts.geojson"), JSON.stringify(lifts, null, 2));
fs.writeFileSync(path.join(MAP_DIR, "trails.geojson"), JSON.stringify(trails, null, 2));
console.log("updated lifts.geojson, trails.geojson from pixel targets");
