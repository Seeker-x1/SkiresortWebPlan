/**
 * Google Earth Studio + OSM/skimap → イラスト上にリフト配置
 * 地理基準は Earth Studio のみ（GSI は使わない）
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { projectLngLat } from "./lib/camera-project.mjs";

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
  const camera = readJson(path.join(MAP_DIR, "camera.json"));
  const earthAnchors = readJson(path.join(MAP_DIR, "control-points-earth.json"));
  const heroAnchors = readJson(path.join(MAP_DIR, "control-points-hero-ai.json"));
  const lifts = readJson(path.join(MAP_DIR, "lifts.geojson"));

  const hero = heroAnchors.image;
  const viewBox = `0 0 ${hero.width} ${hero.height}`;
  const earthViewBox = `0 0 ${earthAnchors.image.width} ${earthAnchors.image.height}`;

  const heroBottom = heroAnchors.points.find((p) => p.id === "lift-pair-bottom");
  const heroTop = heroAnchors.points.find((p) => p.id === "lift-pair-top");
  const ponyBottom = heroAnchors.points.find((p) => p.id === "lift-pony-bottom");
  const ponyTop = heroAnchors.points.find((p) => p.id === "lift-pony-top");

  const earthBottom = earthAnchors.points.find((p) => p.id === "lift-pair-bottom");
  const earthTop = earthAnchors.points.find((p) => p.id === "lift-pair-top");

  const earthBottomRaw = projectLngLat(heroBottom.lng, heroBottom.lat, camera);
  const earthTopRaw = projectLngLat(heroTop.lng, heroTop.lat, camera);

  const earthSim = solvePixelSimilarity(
    [earthBottomRaw.px, earthBottomRaw.py],
    [earthTopRaw.px, earthTopRaw.py],
    [earthBottom.px, earthBottom.py],
    [earthTop.px, earthTop.py],
  );

  const heroSim = solvePixelSimilarity(
    [earthBottom.px, earthBottom.py],
    [earthTop.px, earthTop.py],
    [heroBottom.px, heroBottom.py],
    [heroTop.px, heroTop.py],
  );

  const liftsOut = [];
  for (const f of lifts.features) {
    const coords = f.geometry.coordinates;
    let heroPixels;

    if (f.properties.id === "lift-pony" && ponyBottom && ponyTop) {
      heroPixels = [
        [ponyBottom.px, ponyBottom.py],
        [ponyTop.px, ponyTop.py],
      ];
    } else {
      heroPixels = coords.map(([lng, lat]) => {
        const raw = projectLngLat(lng, lat, camera);
        const earth = projectPixelSimilarity(raw.px, raw.py, earthSim);
        const illus = projectPixelSimilarity(earth.x, earth.y, heroSim);
        return [round1(illus.x), round1(illus.y)];
      });
    }

    liftsOut.push({
      id: f.properties.id,
      label: f.properties.name ?? f.properties.id,
      source: f.properties.source,
      path: toPath(heroPixels),
      stations: [heroPixels[0], heroPixels.at(-1)],
    });
  }

  const payload = {
    schemaVersion: "2026-06-05",
    coordinateAuthority: "Google Earth Studio + control-points-earth.json",
    projection: "earth-studio-similarity-to-illustrated-hero",
    hero: { src: hero.src, width: hero.width, height: hero.height, viewBox },
    earthReference: {
      src: earthAnchors.image.src,
      width: earthAnchors.image.width,
      height: earthAnchors.image.height,
      viewBox: earthViewBox,
      internalOnly: true,
    },
    alignment: {
      pairLift: { method: "earth-camera-similarity", endpoints: ["lift-pair-bottom", "lift-pair-top"] },
      ponyLift: { method: "manual-skimap-east", endpoints: ["lift-pony-bottom", "lift-pony-top"] },
      controlPoints: Object.fromEntries(
        heroAnchors.points.map((p) => {
          const earth = earthAnchors.points.find((e) => e.id === p.id);
          const raw = projectLngLat(p.lng, p.lat, camera);
          return [
            p.id,
            {
              lng: p.lng,
              lat: p.lat,
              heroPixel: [p.px, p.py],
              earthPixelRaw: [round1(raw.px), round1(raw.py)],
              earthPixel: earth ? [earth.px, earth.py] : [round1(raw.px), round1(raw.py)],
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
    console.log(l.id, "hero", l.stations);
  }
  console.log("wrote lift-markers.json (Earth Studio → illustrated)");

  spawnSync(process.execPath, [path.join(__dirname, "build-map-preview.mjs")], {
    stdio: "inherit",
    cwd: __dirname,
  });
}

main();
