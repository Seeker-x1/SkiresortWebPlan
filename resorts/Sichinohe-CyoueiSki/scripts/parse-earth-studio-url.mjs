/**
 * Earth Studio の Location URL を camera.json 用パラメータに変換
 *
 * 形式例:
 *   @40.69908,141.10739,292.067a,20y,268.02h,78.41t
 *
 * - lat, lng: カメラ注目点（Eye target 付近）
 * - NNa: 高度（Studio ではカメラ地上高 m のことが多い）
 * - Ny: 水平画角の半分（FOV/2）→ 水平 FOV = 2*y
 * - Nh: Heading（北=0°, 東=90°）
 * - Nt: Tilt（0=水平, 90=真下）
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");

export function parseEarthStudioUrl(url) {
  const m = url.match(/@([^/]+)/);
  if (!m) throw new Error("invalid Earth Studio URL");

  const parts = m[1].split(",");
  if (parts.length < 6) throw new Error("expected @lat,lng,alt,y,heading,tilt");

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  const alt = parseFloat(parts[2].replace(/a$/i, ""));
  const fovHalf = parseFloat(parts[3].replace(/y$/i, ""));
  const heading = parseFloat(parts[4].replace(/h$/i, ""));
  const tilt = parseFloat(parts[5].replace(/t.*$/i, ""));

  return {
    position: [lng, lat],
    altitudeM: alt,
    headingDeg: heading,
    tiltDeg: tilt,
    fovDeg: fovHalf * 2,
    fovAxis: "horizontal",
    earthStudioUrl: url,
  };
}

function main() {
  const urlArg = process.argv.find((a) => a.startsWith("--url="));
  const url = urlArg?.slice("--url=".length) ?? process.argv[2];
  if (!url) {
    console.error("usage: node parse-earth-studio-url.mjs --url='https://earth.google.com/studio/@...'");
    process.exit(1);
  }

  const parsed = parseEarthStudioUrl(url);
  console.log("parsed:", parsed);

  const cameraPath = path.join(MAP_DIR, "camera.json");
  const config = JSON.parse(fs.readFileSync(cameraPath, "utf-8"));
  config.camera = {
    ...config.camera,
    ...parsed,
  };
  config.earthStudio = {
    importedAt: new Date().toISOString(),
    url,
    notes: "20y = 水平FOVの半分。altitudeM は Studio の a 値をそのまま AGL として使用（要QA）",
  };
  delete config.camera.earthStudioUrl;

  fs.writeFileSync(cameraPath, JSON.stringify(config, null, 2));
  console.log("updated", cameraPath);
}

if (process.argv[1]?.endsWith("parse-earth-studio-url.mjs")) {
  main();
}
