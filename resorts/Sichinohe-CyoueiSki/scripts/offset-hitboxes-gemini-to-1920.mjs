/**
 * Gemini 1024 直トレース → 1920 contentRect オフセット
 * Usage: node scripts/offset-hitboxes-gemini-to-1920.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAP_DIR = path.join(__dirname, "..", "web", "data", "map");
const MAPS = path.join(__dirname, "..", "web", "public", "maps");
const ROOT_MAPS = path.join(__dirname, "..", "..", "public", "maps");

const MASTER = 1920;
const CONTENT_X = Math.round((MASTER - 1024) / 2);
const CONTENT_Y = CONTENT_X;

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
        out.push(String(round(parseFloat(tokens[i]) + dx)), String(round(parseFloat(tokens[i + 1]) + dy)));
        i += 2;
        continue;
      }
      throw new Error(`unsupported path: ${cmd}`);
    }
    i += 1;
  }
  return out.join(" ");
}

const srcPath = path.join(MAP_DIR, "hitboxes-hero-v5.json");
const src = JSON.parse(fs.readFileSync(srcPath, "utf-8"));

const out = {
  ...src,
  schemaVersion: "2026-06-09",
  coordinateAuthority: `sichinohe-hero-v5.png ${MASTER}×${MASTER} Gemini contentRect +${CONTENT_X},+${CONTENT_Y}`,
  hero: {
    width: MASTER,
    height: MASTER,
    viewBox: `0 0 ${MASTER} ${MASTER}`,
    contentRect: { x: CONTENT_X, y: CONTENT_Y, width: 1024, height: 1024 },
    contentAnchor: "gemini-1024-centered",
  },
  features: (src.features ?? []).map((f) => ({
    ...f,
    source: `${f.source} → 1920 offset +${CONTENT_X},+${CONTENT_Y}`,
    path: offsetPath(f.path, CONTENT_X, CONTENT_Y),
    stations: (f.stations ?? []).map(([x, y]) => [round(x + CONTENT_X), round(y + CONTENT_Y)]),
  })),
};

const outPath = path.join(MAP_DIR, "hitboxes-hero-v5.json");
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf-8");

for (const dir of [MAPS, ROOT_MAPS]) {
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(outPath, path.join(dir, "hitboxes-hero-v5.json"));
}

console.log("offset → hitboxes-hero-v5.json", `${MASTER}×${MASTER}`, `Δ+${CONTENT_X},+${CONTENT_Y}`);
console.log("features:", out.features.length);
