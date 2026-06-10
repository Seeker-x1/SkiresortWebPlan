/**
 * 国土地理院 bbox + OSM/skimap 座標 → 絵上にリフト配置
 *
 * - 冬景イラスト: lng/lat → GSI px → 相似変換 → hero ピクセル
 * - 国土地理院正射: lng/lat → GSI px → 相似変換 → control-points-gsi 手動端点
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projectToPixel } from "./lib/geo-bbox.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function solvePixelSimilarity(srcA, srcB, dstA, dstB) {
  const [ax, ay] = srcA;
  const [bx, by] = srcB;
  const [ax2, ay2] = dstA;
  const [bx2, by2] = dstB;
  const vx = bx - ax;
  const vy = by - ay;
  const wx = bx2 - ax2;
  const wy = by2 - ay2;
  const vLen = Math.hypot(vx, vy);
  const wLen = Math.hypot(wx, wy);
  const rot = Math.atan2(wy, wx) - Math.atan2(vy, vx);
  const scale = wLen / vLen;
  return {
    srcA: [ax, ay],
    dstA: [ax2, ay2],
    scale,
    cos: Math.cos(rot),
    sin: Math.sin(rot),
  };
}

function projectPixelSimilarity(px, py, t) {
  const dx = px - t.srcA[0];
  const dy = py - t.srcA[1];
  const sx = dx * t.scale;
  const sy = dy * t.scale;
  return {
    x: t.dstA[0] + t.cos * sx - t.sin * sy,
    y: t.dstA[1] + t.sin * sx + t.cos * sy,
  };
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function toPath(pixels) {
  return pixels.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
}

function main() {
  const meta = readJson(path.join(MAP_DIR, "hero-meta.json"));
  const anchors = readJson(path.join(MAP_DIR, "control-points-hero-ai.json"));
  const gsiAnchors = readJson(path.join(MAP_DIR, "control-points-gsi.json"));
  const lifts = readJson(path.join(MAP_DIR, "lifts.geojson"));

  const hero = anchors.image;
  const viewBox = `0 0 ${hero.width} ${hero.height}`;
  const gsiViewBox = `0 0 ${meta.width} ${meta.height}`;

  const bottom = anchors.points.find((p) => p.id === "lift-pair-bottom");
  const top = anchors.points.find((p) => p.id === "lift-pair-top");
  const ponyBottom = anchors.points.find((p) => p.id === "lift-pony-bottom");
  const ponyTop = anchors.points.find((p) => p.id === "lift-pony-top");

  const gsiBottomManual = gsiAnchors.points.find((p) => p.id === "lift-pair-bottom");
  const gsiTopManual = gsiAnchors.points.find((p) => p.id === "lift-pair-top");
  const gsiPonyBottom = gsiAnchors.points.find((p) => p.id === "lift-pony-bottom");
  const gsiPonyTop = gsiAnchors.points.find((p) => p.id === "lift-pony-top");

  const gsiBottomRaw = projectToPixel(bottom.lng, bottom.lat, meta.bbox, meta.width, meta.height);
  const gsiTopRaw = projectToPixel(top.lng, top.lat, meta.bbox, meta.width, meta.height);

  const heroSim = solvePixelSimilarity(
    [gsiBottomRaw.x, gsiBottomRaw.y],
    [gsiTopRaw.x, gsiTopRaw.y],
    [bottom.px, bottom.py],
    [top.px, top.py],
  );

  const gsiSim = solvePixelSimilarity(
    [gsiBottomRaw.x, gsiBottomRaw.y],
    [gsiTopRaw.x, gsiTopRaw.y],
    [gsiBottomManual.px, gsiBottomManual.py],
    [gsiTopManual.px, gsiTopManual.py],
  );

  const liftsOut = [];
  for (const f of lifts.features) {
    const src = f.properties.source ?? "";
    const trusted =
      src.includes("OpenStreetMap") || src.includes("国土地理院") || src.includes("OpenSkiMap");
    if (!trusted) {
      console.warn("skip:", f.properties.id);
      continue;
    }

    const coords = f.geometry.coordinates;
    let heroPixels;
    let gsiPixels;

    if (f.properties.id === "lift-pony" && ponyBottom && ponyTop) {
      heroPixels = [
        [ponyBottom.px, ponyBottom.py],
        [ponyTop.px, ponyTop.py],
      ];
      gsiPixels = [
        [gsiPonyBottom.px, gsiPonyBottom.py],
        [gsiPonyTop.px, gsiPonyTop.py],
      ];
    } else {
      heroPixels = coords.map(([lng, lat]) => {
        const gsi = projectToPixel(lng, lat, meta.bbox, meta.width, meta.height);
        const illus = projectPixelSimilarity(gsi.x, gsi.y, heroSim);
        return [round1(illus.x), round1(illus.y)];
      });
      gsiPixels = coords.map(([lng, lat]) => {
        const gsi = projectToPixel(lng, lat, meta.bbox, meta.width, meta.height);
        const tuned = projectPixelSimilarity(gsi.x, gsi.y, gsiSim);
        return [round1(tuned.x), round1(tuned.y)];
      });
    }

    liftsOut.push({
      id: f.properties.id,
      label: f.properties.name ?? f.properties.id,
      source: f.properties.source,
      path: toPath(heroPixels),
      gsiPath: toPath(gsiPixels),
      stations: [heroPixels[0], heroPixels.at(-1)],
      gsiStations: [gsiPixels[0], gsiPixels.at(-1)],
    });
  }

  const payload = {
    schemaVersion: "2026-06-05",
    coordinateAuthority: "GSI hero-meta.json bbox + control-points-gsi.json",
    projection: "hero: gsi-similarity-pair | gsi: gsi-manual-similarity",
    hero: { src: hero.src, width: hero.width, height: hero.height, viewBox },
    gsiReference: {
      src: "/maps/sichinohe-hero-gsi.png",
      width: meta.width,
      height: meta.height,
      viewBox: gsiViewBox,
      bbox: meta.bbox,
    },
    alignment: {
      pairLift: { method: "gsi-pixel-similarity", endpoints: ["lift-pair-bottom", "lift-pair-top"] },
      ponyLift: { method: "manual-gsi-anchors", endpoints: ["lift-pony-bottom", "lift-pony-top"] },
      controlPoints: Object.fromEntries(
        anchors.points.map((p) => {
          const manual = gsiAnchors.points.find((g) => g.id === p.id);
          const raw = projectToPixel(p.lng, p.lat, meta.bbox, meta.width, meta.height);
          return [
            p.id,
            {
              lng: p.lng,
              lat: p.lat,
              heroPixel: [p.px, p.py],
              gsiPixelRaw: [round1(raw.x), round1(raw.y)],
              gsiPixel: manual ? [manual.px, manual.py] : [round1(raw.x), round1(raw.y)],
              role: p.role,
            },
          ];
        }),
      ),
    },
    lifts: liftsOut,
  };

  fs.writeFileSync(path.join(MAP_DIR, "lift-markers.json"), JSON.stringify(payload, null, 2));
  console.log("lifts placed:", liftsOut.map((l) => l.id).join(", "));
  for (const l of liftsOut) {
    console.log(l.id, "hero", l.stations, "gsi", l.gsiStations);
  }
  console.log("wrote lift-markers.json");

  spawnSync(process.execPath, [path.join(__dirname, "build-map-preview.mjs")], {
    stdio: "inherit",
    cwd: __dirname,
  });
}

main();
