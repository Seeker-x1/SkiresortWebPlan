/**
 * Earth Studio の footage からヒーロー静止画を取り込む
 *
 * 用法:
 *   node import-earth-footage.mjs
 *   node import-earth-footage.mjs --frame=9
 *   node import-earth-footage.mjs --fit
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const FOOTAGE_DIR = path.join(ROOT, "無題", "footage");
const OUT = path.join(ROOT, "web", "public", "maps", "sichinohe-hero-earthstudio.png");
const CAMERA_JSON = path.join(ROOT, "web", "data", "map", "camera.json");

function main() {
  if (!fs.existsSync(FOOTAGE_DIR)) {
    console.error("footage not found:", FOOTAGE_DIR);
    process.exit(1);
  }

  const frameArg = process.argv.find((a) => a.startsWith("--frame="));
  const frameIdx = frameArg ? Number(frameArg.slice("--frame=".length)) : 9;
  const doFit = process.argv.includes("--fit");

  const files = fs
    .readdirSync(FOOTAGE_DIR)
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();
  if (!files.length) {
    console.error("no jpeg frames in", FOOTAGE_DIR);
    process.exit(1);
  }

  const pick = files[Math.min(Math.max(frameIdx, 0), files.length - 1)];
  fs.copyFileSync(path.join(FOOTAGE_DIR, pick), OUT);
  console.log("copied", pick, "->", OUT);

  const camera = JSON.parse(fs.readFileSync(CAMERA_JSON, "utf-8"));
  camera.image.width = 1920;
  camera.image.height = 1080;
  camera.image.src = "/maps/sichinohe-hero-earthstudio.png";
  fs.writeFileSync(CAMERA_JSON, JSON.stringify(camera, null, 2));
  console.log("updated camera.json image size 1920x1080");

  if (doFit) {
    const fit = spawnSync(process.execPath, [path.join(__dirname, "project-camera.mjs"), "--fit"], {
      stdio: "inherit",
      cwd: __dirname,
    });
    if (fit.status !== 0) process.exit(fit.status ?? 1);
  } else {
    console.log("next: node project-camera.mjs --fit");
    console.log("then update features.manifest.json heroImage if needed");
  }
}

main();
