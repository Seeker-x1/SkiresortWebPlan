/**
 * camera.json + OSM GeoJSON → control-points-manual.json（Figma 計測不要）
 *
 * 用法:
 *   node project-camera.mjs
 *   node project-camera.mjs --fit          # 生成後に fit-overlay-affine も実行
 *   node project-camera.mjs --camera=../web/data/map/camera.json
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { projectControlPoints } from "./lib/camera-project.mjs";
import { tuneCamera } from "./lib/tune-camera.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function resolveFromLifts(from, lifts) {
  const m = from.match(/^lifts\.([^.]+)\.(start|end)$/);
  if (!m) return null;
  const [, liftId, end] = m;
  const feature = lifts.features.find((f) => f.properties.id === liftId);
  if (!feature) throw new Error(`lift not found: ${liftId}`);
  const coords = feature.geometry.coordinates;
  const pt = end === "start" ? coords[0] : coords.at(-1);
  return { lng: pt[0], lat: pt[1] };
}

function resolveControlPoints(config, lifts) {
  return config.controlPoints.map((cp) => {
    if (cp.from) {
      const resolved = resolveFromLifts(cp.from, lifts);
      if (!resolved) throw new Error(`cannot resolve: ${cp.from}`);
      return {
        id: cp.id,
        lng: resolved.lng,
        lat: resolved.lat,
        role: cp.role ?? cp.id,
      };
    }
    if (cp.lng == null || cp.lat == null) {
      throw new Error(`control point ${cp.id} needs lng/lat or from`);
    }
    return {
      id: cp.id,
      lng: cp.lng,
      lat: cp.lat,
      role: cp.role ?? cp.id,
    };
  });
}

function main() {
  const cameraArg = process.argv.find((a) => a.startsWith("--camera="));
  const cameraPath = cameraArg
    ? path.resolve(cameraArg.slice("--camera=".length))
    : path.join(MAP_DIR, "camera.json");
  const doFit = process.argv.includes("--fit");
  const doTune = process.argv.includes("--tune");

  if (!fs.existsSync(cameraPath)) {
    console.error("missing", cameraPath);
    process.exit(1);
  }

  let config = readJson(cameraPath);
  const lifts = readJson(path.join(MAP_DIR, "lifts.geojson"));

  if (doTune) {
    const gsi = readJson(path.join(MAP_DIR, "control-points.json"));
    const bottomPx = gsi.controlPoints["lift-pair-bottom"].pixel;
    const topPx = gsi.controlPoints["lift-pair-top"].pixel;
    const best = tuneCamera(config, {
      refWidth: 1920,
      refHeight: 1280,
      liftPairBottom: bottomPx,
      liftPairTop: topPx,
    }, lifts);

    if (!best) {
      console.error("tune failed: no visible camera params found");
      process.exit(1);
    }

    config = {
      ...config,
      camera: {
        ...config.camera,
        headingDeg: best.headingDeg,
        tiltDeg: best.tiltDeg,
        altitudeM: best.altitudeM,
        fovDeg: best.fovDeg,
      },
    };
    fs.writeFileSync(cameraPath, JSON.stringify(config, null, 2));
    console.log("tuned camera.json:", best);
  }

  const resolved = resolveControlPoints(config, lifts);
  const projected = projectControlPoints(config, resolved);

  const invisible = projected.filter((p) => !p.visible);
  if (invisible.length) {
    console.warn("warn: off-screen or behind camera:");
    invisible.forEach((p) => console.warn(`  ${p.id}: px=${p.px} py=${p.py}`));
  }

  const manual = {
    image: config.image,
    camera: config.camera,
    generatedBy: "project-camera.mjs",
    generatedAt: new Date().toISOString(),
    points: projected.map(({ id, lng, lat, px, py, role, visible }) => ({
      id,
      lng,
      lat,
      px,
      py,
      role,
      visible,
    })),
  };

  const outPath = path.join(MAP_DIR, "control-points-manual.json");
  fs.writeFileSync(outPath, JSON.stringify(manual, null, 2));

  console.log("camera:", config.camera);
  console.log("projected control points:");
  projected.forEach((p) => {
    console.log(`  ${p.id}: [${p.px}, ${p.py}] visible=${p.visible}`);
  });
  console.log("wrote", outPath);

  if (doFit) {
    const fit = spawnSync(process.execPath, [path.join(__dirname, "fit-overlay-affine.mjs")], {
      stdio: "inherit",
      cwd: __dirname,
    });
    if (fit.status !== 0) process.exit(fit.status ?? 1);
  } else {
    console.log("next: node fit-overlay-affine.mjs  (or re-run with --fit)");
  }
}

main();
