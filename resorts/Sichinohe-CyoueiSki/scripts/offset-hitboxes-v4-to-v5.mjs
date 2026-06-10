/**
 * v4 直トレース → v5 1920×1920（contentRect オフセット）
 * Usage: node scripts/offset-hitboxes-v4-to-v5.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");
const MAPS = path.join(__dirname, "..", "web", "public", "maps");
const ROOT_MAPS = path.join(__dirname, "..", "..", "public", "maps");

const MASTER = 1920;
const CONTENT_X = 448;
const CONTENT_Y = 565;

function round(n) {
  return Math.round(n * 10) / 10;
}

function offsetPath(d, dx, dy) {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+/g) ?? [];
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[a-zA-Z]$/.test(t)) {
      const cmd = t.toUpperCase();
      out.push(t);
      i += 1;
      if (cmd === "Z") continue;
      if (cmd === "M" || cmd === "L") {
        const x = parseFloat(tokens[i]);
        const y = parseFloat(tokens[i + 1]);
        out.push(String(round(x + dx)), String(round(y + dy)));
        i += 2;
        continue;
      }
      throw new Error(`unsupported path command: ${cmd}`);
    }
    i += 1;
  }
  return out.join(" ");
}

function offsetPoint([x, y], dx, dy) {
  return [round(x + dx), round(y + dy)];
}

const v4 = JSON.parse(
  fs.readFileSync(path.join(MAP_DIR, "hitboxes-hero-v4.json"), "utf-8"),
);

const v5 = {
  schemaVersion: "2026-06-09",
  coordinateAuthority: `sichinohe-hero-v5.png ${MASTER}×${MASTER} v4+offset（layout-v5 contentRect）`,
  hero: {
    width: MASTER,
    height: MASTER,
    viewBox: `0 0 ${MASTER} ${MASTER}`,
    contentRect: { x: CONTENT_X, y: CONTENT_Y, width: 1024, height: 790 },
  },
  features: (v4.features ?? []).map((f) => ({
    ...f,
    source: "illustrated-hero layout-v5 margin-offset from v4",
    path: offsetPath(f.path, CONTENT_X, CONTENT_Y),
    stations: (f.stations ?? []).map((pt) => offsetPoint(pt, CONTENT_X, CONTENT_Y)),
  })),
};

const out = path.join(MAP_DIR, "hitboxes-hero-v5.json");
fs.writeFileSync(out, JSON.stringify(v5, null, 2) + "\n", "utf-8");

for (const dir of [MAPS, ROOT_MAPS]) {
  if (fs.existsSync(dir)) {
    fs.copyFileSync(out, path.join(dir, "hitboxes-hero-v5.json"));
  }
}

console.log("wrote hitboxes-hero-v5.json");
console.log("offset:", { dx: CONTENT_X, dy: CONTENT_Y });
console.log("features:", v5.features.length);
